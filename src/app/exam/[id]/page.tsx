"use client";

import { useQuery } from "@tanstack/react-query";
import {
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	Loader2,
	Menu,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import FinishExamResultDialog, {
	type FinishExamDialogHandle,
} from "@/app/exam/component/finish";
import ExamMinimap from "@/app/exam/component/minimap";
import FixedScrollButton from "@/components/FixedScrollButton";
import { Button } from "@/components/ui/button";
import {
	deleteExamAnswer,
	getExamById,
	getNewExamFill,
	saveExamAnswer,
	savemnExamAnswer,
	 deletemnExamAnswer,
} from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	AnswerValue,
	ApiExamResponse,
	ChoosedAnswer,
} from "@/types/exam/exam";
import { ExamHeader } from "../component/examUtils/examInfo";
import {
	DesktopQuestionCard,
	MobileQuestionCard,
} from "../component/examUtils/questionCard";
import SaveButton from "../component/examUtils/savingButton";
import ExamTimer from "../component/Itime";
import ExamSourceCard from "../component/question/sourceName";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

/** Асуултын төрлөөр автомат хадгалалтын хугацаа (мс) */
const SAVE_DELAYS = {
	DEFAULT: 1000,
	TYPE_3_NUMBER: 5000,
	TYPE_4_FILL: 5000,
	TYPE_5_ORDER: 3000,
	TYPE_6_MATCH: 4000,
} as const;

const DELAY_BY_TYPE: Record<number, number> = {
	3: SAVE_DELAYS.TYPE_3_NUMBER,
	4: SAVE_DELAYS.TYPE_4_FILL,
	5: SAVE_DELAYS.TYPE_5_ORDER,
	6: SAVE_DELAYS.TYPE_6_MATCH,
};

const BATCH_SIZE = 5;
const TYPING_INDICATOR_DELAY = 1500;
const VALID_QUESTION_TYPES = new Set([1, 2, 3, 4, 5, 6]);
const IS_BROWSER = typeof window !== "undefined";

// ─────────────────────────────────────────────
// Question type enum — magic number-ийг арилгах
// ─────────────────────────────────────────────
enum QuestionType {
	SINGLE_CHOICE = 1,
	MULTI_CHOICE = 2,
	NUMBER_INPUT = 3,
	TEXT_FILL = 4,
	ORDERING = 5,
	MATCHING = 6,
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface PendingAnswer {
	questionId: number;
	answer: AnswerValue;
	queTypeId: number;
	rowNum: number;
	timestamp: number;
}

interface ExamSource {
	questionIndex: number;
	questionLabel: string;
	sourceName: string | null | undefined;
	sourceImg: string | null | undefined;
	rowNum: string;
	assigSourceId: number | null;
	sectionId: number | null;
	sectionNumber: number | null;
}

type AnswerState = {
	answers: Record<number, AnswerValue>;
	answeredCount: number;
};

type AnswerAction =
	| { type: "SET_ANSWER"; questionId: number; answer: AnswerValue }
	| { type: "INIT_ANSWERS"; answers: Record<number, AnswerValue> };

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────
const callSaveApi = (
  ctx: SaveContext,
  questionId: number,
  answerId: number,
  queTypeId: number,  // ← 3-р параметр
  answer: string,
  rowNum: number,
) => {
  if (ctx.isNewExam) {
    return savemnExamAnswer(
      ctx.userId, ctx.examId, questionId,
      answerId, queTypeId, answer, rowNum,  // ✅ зөв
      ctx.examDateId, ctx.examRegId,
    );
  }
  return saveExamAnswer(
    ctx.userId, ctx.examId, questionId,
    answerId, queTypeId, answer, rowNum,   // ✅ зөв
  );
};
const callDeleteApi = (
  ctx: SaveContext,
  questionId: number,
  answerId: number,
) => {
  if (ctx.isNewExam) {
    return deletemnExamAnswer(
      ctx.userId, ctx.examId, questionId,
      answerId, ctx.examRegId, ctx.examDateId,
    );
  }
  return deleteExamAnswer(ctx.userId, ctx.examId, questionId, answerId);
};
const isValidId = (id: unknown): id is number =>
	typeof id === "number" && id !== 0 && !Number.isNaN(id);

const normalizeMatchingAnswer = (
	answer: Record<number, number | number[]>,
): Map<number, number[]> => {
	const normalized = new Map<number, number[]>();
	Object.entries(answer).forEach(([qRefIdStr, value]) => {
		const qRefId = Number(qRefIdStr);
		const aRefIds = Array.isArray(value) ? value : [value];
		const validIds = aRefIds.filter(isValidId);
		if (validIds.length > 0) normalized.set(qRefId, validIds);
	});
	return normalized;
};

const extractAnswerIds = (matches: Map<number, number[]>): Set<number> => {
	const ids = new Set<number>();
	for (const aRefIds of matches.values()) for (const id of aRefIds) ids.add(id);
	return ids;
};

const areAnswersEqual = (
	a: AnswerValue | undefined,
	b: AnswerValue | undefined,
): boolean => {
	if (a === b) return true;
	if (a === undefined || b === undefined) return false;
	const aIsArray = Array.isArray(a);
	const bIsArray = Array.isArray(b);
	if (aIsArray !== bIsArray) return false;
	if (aIsArray && bIsArray) {
		if ((a as unknown[]).length !== (b as unknown[]).length) return false;
		return (a as unknown[]).every((v, i) => v === (b as unknown[])[i]);
	}
	if (
		typeof a === "object" &&
		typeof b === "object" &&
		a !== null &&
		b !== null
	) {
		const aObj = a as Record<string, unknown>;
		const bObj = b as Record<string, unknown>;
		const aKeys = Object.keys(aObj);
		const bKeys = Object.keys(bObj);
		if (aKeys.length !== bKeys.length) return false;
		return aKeys.every((k) => aObj[k] === bObj[k]);
	}
	return a === b;
};

const isAnswerFilled = (ans: AnswerValue): boolean => {
	if (ans == null) return false;
	if (Array.isArray(ans)) return ans.length > 0;
	if (typeof ans === "string") return ans.trim().length > 0;
	if (typeof ans === "number") return isValidId(ans);
	return Object.keys(ans).length > 0;
};

const answerReducer = (
	state: AnswerState,
	action: AnswerAction,
): AnswerState => {
	switch (action.type) {
		case "SET_ANSWER": {
			if (areAnswersEqual(state.answers[action.questionId], action.answer)) {
				return state;
			}
			const wasFilled = isAnswerFilled(state.answers[action.questionId]);
			const isFilled = isAnswerFilled(action.answer);
			return {
				answers: { ...state.answers, [action.questionId]: action.answer },
				answeredCount:
					state.answeredCount + (isFilled ? 1 : 0) - (wasFilled ? 1 : 0),
			};
		}
		case "INIT_ANSWERS":
			return {
				answers: action.answers,
				answeredCount: Object.values(action.answers).filter(isAnswerFilled)
					.length,
			};
		default:
			return state;
	}
};

// ─────────────────────────────────────────────
// Per-type save / delete helpers
// ─────────────────────────────────────────────
type SaveContext = {
	userId: number;
	examId: number;
	questionId: number;
	rowNum: number;
	 isNewExam: boolean; 
	answer: AnswerValue;
  examDateId: number;
  examRegId: number;
	previousAnswer: AnswerValue | undefined;
	examAnswers: {
		question_id: number;
		answer_type: number;
		answer_id: number;
	}[];
};

const deleteType1 = async (ctx: SaveContext): Promise<void> => {
  const prev = ctx.previousAnswer;
  if (typeof prev === "number" && isValidId(prev)) {
    await callDeleteApi(ctx, ctx.questionId, prev).catch(
      (e) => console.error(`Failed to delete Type1 Q${ctx.questionId}:`, e)
    );
  }
};

const deleteType2 = async (ctx: SaveContext): Promise<void> => {
  const prev = ctx.previousAnswer;
  if (Array.isArray(prev) && prev.length > 0) {
    await Promise.allSettled(
      prev.map((id) => callDeleteApi(ctx, ctx.questionId, id))
    );
  }
};

const deleteType3 = async (ctx: SaveContext): Promise<void> => {
  const prev = ctx.previousAnswer;
  if (typeof prev === "object" && prev !== null && !Array.isArray(prev)) {
    const prevMap = prev as Record<number, string>;
    const prevIds = Object.keys(prevMap)
      .map(Number)
      .filter((id) => isValidId(id) && prevMap[id]?.trim());
    if (prevIds.length > 0) {
      await Promise.allSettled(
        prevIds.map((id) => callDeleteApi(ctx, ctx.questionId, id))
      );
    }
  }
};

const deleteType4 = async (ctx: SaveContext): Promise<void> => {
  if (ctx.previousAnswer === undefined) return;
  const existing = ctx.examAnswers.find(
    (a) => a.question_id === ctx.questionId && a.answer_type === QuestionType.TEXT_FILL,
  );
  if (existing) {
    await callDeleteApi(ctx, ctx.questionId, existing.answer_id).catch(
      (e) => console.error(`Failed to delete Type4 Q${ctx.questionId}:`, e)
    );
  }
};

const deleteType5 = async (ctx: SaveContext): Promise<void> => {
  const prev = ctx.previousAnswer;
  if (Array.isArray(prev) && prev.length > 0) {
    const valid = prev.filter(isValidId);
    if (valid.length > 0) {
      await Promise.allSettled(
        valid.map((id) => callDeleteApi(ctx, ctx.questionId, id))
      );
    }
  }
};

const deleteType6 = async (ctx: SaveContext): Promise<void> => {
  const answer = ctx.answer;
  if (typeof answer !== "object" || answer === null || Array.isArray(answer)) return;
  const currentIds = extractAnswerIds(
    normalizeMatchingAnswer(answer as Record<number, number | number[]>)
  );
  const previousIds = new Set<number>();
  const prev = ctx.previousAnswer;
  if (typeof prev === "object" && prev !== null && !Array.isArray(prev)) {
    for (const ids of normalizeMatchingAnswer(prev as Record<number, number | number[]>).values()) {
      for (const id of ids) previousIds.add(id);
    }
  }
  const toDelete = Array.from(previousIds).filter((id) => !currentIds.has(id));
  if (toDelete.length > 0) {
    await Promise.allSettled(
      toDelete.map((id) => callDeleteApi(ctx, ctx.questionId, id))
    );
  }
};

const saveType1 = async (ctx: SaveContext): Promise<void> => {
  const ans = ctx.answer;
  if (typeof ans === "number" && isValidId(ans)) {
    await callSaveApi(ctx, ctx.questionId, ans, QuestionType.SINGLE_CHOICE, "1", ctx.rowNum);
    //                                    ↑ans=answerId  ↑queTypeId=1  ↑answer="1"  ↑rowNum
  }
};
const saveType2 = async (ctx: SaveContext): Promise<void> => {
  const ans = ctx.answer;
  if (Array.isArray(ans) && ans.length > 0) {
    await Promise.all(
      ans.map((id) => callSaveApi(ctx, ctx.questionId, id, QuestionType.MULTI_CHOICE, "1", ctx.rowNum))
    );
  }
};

const saveType3 = async (ctx: SaveContext): Promise<void> => {
  const ans = ctx.answer;
  if (typeof ans === "object" && ans !== null && !Array.isArray(ans)) {
    const entries = Object.entries(ans as Record<number, string>)
      .map(([k, v]) => [Number(k), v] as [number, string])
      .filter(([aid, val]) => isValidId(aid) && val.trim());
    if (entries.length > 0) {
      await Promise.all(
        entries.map(([id, val]) => callSaveApi(ctx, ctx.questionId, id, QuestionType.NUMBER_INPUT, val, ctx.rowNum))
      );
    }
  }
};

const saveType4 = async (ctx: SaveContext): Promise<void> => {
  const ans = ctx.answer;
  if (typeof ans === "string" && ans.trim()) {
    const existing = ctx.examAnswers.find(
      (a) => a.question_id === ctx.questionId && a.answer_type === QuestionType.TEXT_FILL,
    );
    if (existing) {
      await callSaveApi(ctx, ctx.questionId, existing.answer_id, QuestionType.TEXT_FILL, ans, ctx.rowNum);
    }
  }
};

const saveType5 = async (ctx: SaveContext): Promise<void> => {
  const ans = ctx.answer;
  if (Array.isArray(ans) && ans.length > 0) {
    const valid = ans.filter((id): id is number => isValidId(id) && typeof id === "number");
    if (valid.length > 0) {
      await Promise.all(
        valid.map((id, index) =>
          callSaveApi(ctx, ctx.questionId, id, QuestionType.ORDERING, (index + 1).toString(), ctx.rowNum)
        )
      );
    }
  }
};

const saveType6 = async (ctx: SaveContext): Promise<void> => {
  const ans = ctx.answer;
  if (typeof ans === "object" && ans !== null && !Array.isArray(ans)) {
    const matches = normalizeMatchingAnswer(ans as Record<number, number | number[]>);
    const promises: Promise<unknown>[] = [];
    for (const [qRefId, aRefIds] of matches.entries()) {
      for (const aRefId of aRefIds) {
        promises.push(callSaveApi(ctx, ctx.questionId, aRefId, QuestionType.MATCHING, String(qRefId), ctx.rowNum));
      }
    }
    if (promises.length > 0) await Promise.all(promises);
  }
};

const DELETE_HANDLERS: Record<number, (ctx: SaveContext) => Promise<void>> = {
	[QuestionType.SINGLE_CHOICE]: deleteType1,
	[QuestionType.MULTI_CHOICE]: deleteType2,
	[QuestionType.NUMBER_INPUT]: deleteType3,
	[QuestionType.TEXT_FILL]: deleteType4,
	[QuestionType.ORDERING]: deleteType5,
	[QuestionType.MATCHING]: deleteType6,
};

const SAVE_HANDLERS: Record<number, (ctx: SaveContext) => Promise<void>> = {
	[QuestionType.SINGLE_CHOICE]: saveType1,
	[QuestionType.MULTI_CHOICE]: saveType2,
	[QuestionType.NUMBER_INPUT]: saveType3,
	[QuestionType.TEXT_FILL]: saveType4,
	[QuestionType.ORDERING]: saveType5,
	[QuestionType.MATCHING]: saveType6,
};

// ─────────────────────────────────────────────
// Memoized card components
// ─────────────────────────────────────────────
const MemoDesktopQuestionCard = memo(
	DesktopQuestionCard,
	(prev, next) =>
		prev.selectedAnswer === next.selectedAnswer &&
		prev.isBookmarked === next.isBookmarked &&
		prev.isTyping === next.isTyping &&
		prev.examId === next.examId &&
		prev.userId === next.userId &&
		prev.onAnswerChange === next.onAnswerChange &&
		prev.onBookmarkToggle === next.onBookmarkToggle,
);

const MemoMobileQuestionCard = memo(
	MobileQuestionCard,
	(prev, next) =>
		prev.selectedAnswer === next.selectedAnswer &&
		prev.isBookmarked === next.isBookmarked &&
		prev.isTyping === next.isTyping &&
		prev.question.question_id === next.question.question_id &&
		prev.onAnswerChange === next.onAnswerChange &&
		prev.onBookmarkToggle === next.onBookmarkToggle,
);

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ExamPage() {
	const { userId } = useAuthStore();
	const { id } = useParams();
	const [timeDisplay, setTimeDisplay] = useState("");
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [bookmarkedMap, setBookmarkedMap] = useState<Record<number, boolean>>(
		{},
	);

	const [{ answers: selectedAnswers, answeredCount }, dispatchAnswer] =
		useReducer(answerReducer, { answers: {}, answeredCount: 0 });

	const selectedAnswersRef = useRef<Record<number, AnswerValue>>({});
	useEffect(() => {
		selectedAnswersRef.current = selectedAnswers;
	}, [selectedAnswers]);

	const [isSaving, setIsSaving] = useState(false);
	const [currentTypingId, setCurrentTypingId] = useState<number | null>(null);
	const [isTimeUp, setIsTimeUp] = useState(false);
	const [showMobileMinimapOverlay, setShowMobileMinimapOverlay] =
		useState(false);
	const [pendingCount, setPendingCount] = useState(0);

	const savingQuestions = useRef<Set<number>>(new Set());
	const finishDialogRef = useRef<FinishExamDialogHandle>(null);
	const hasAutoFinished = useRef(false);
	const isAutoSubmitting = useRef(false);
	const typingTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
		new Map(),
	);
	const pendingAnswers = useRef<Map<number, PendingAnswer>>(new Map());
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastSavedAnswers = useRef<Map<number, AnswerValue>>(new Map());
	const examDataRef = useRef<ApiExamResponse | null>(null);
	const searchParams = useSearchParams();
	const examDateId = Number(searchParams.get("exam_date_id"));
const examRegId = Number(searchParams.get("exam_reg_id"));
const examIdFromParams = Number(searchParams.get("exam_id"));
	const variantNumber = Number(searchParams.get("variant"));
	const examType = Number(searchParams.get("exam_type"));
	const _isNewExam = examType === 4; //4

	// FIX: questionsMapRef — handleAnswerChange-д O(1) хайлт
	const questionsMapRef = useRef<
		Map<number, { que_type_id: number; row_num: string }>
	>(new Map());

	const isMountedRef = useRef(true);
	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const isSavingRef = useRef(false);

	const examIdParam = Number(id);
	const isValidUserId = !!userId && userId > 0;
const isValidExamId = _isNewExam
    ? true
    : !Number.isNaN(examIdParam) && examIdParam > 0;

	const {
		data: examData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["exam", userId, id, variantNumber, examType],
		queryFn: () => {
			if (!isValidUserId) throw new Error("Unauthorized");
			if (!isValidExamId) throw new Error("Invalid examId");

			if (_isNewExam) {
				return getNewExamFill(userId, variantNumber);
			} else {
				return getExamById(userId, examIdParam);
			}

			// return getNewExamFill(userId, variantNumber);
		},
		enabled: isValidUserId && isValidExamId,
	});

	useEffect(() => {
		examDataRef.current = examData ?? null;
	}, [examData]);

	const setPending = useCallback(
		(questionId: number, value: PendingAnswer | null) => {
			if (value === null) {
				pendingAnswers.current.delete(questionId);
			} else {
				pendingAnswers.current.set(questionId, value);
			}
			if (isMountedRef.current) {
				setPendingCount(pendingAnswers.current.size);
			}
		},
		[],
	);

	const saveQuestion = useCallback(
		async (pending: PendingAnswer, examId: number): Promise<boolean> => {
			const { questionId, answer, queTypeId, rowNum } = pending;
			if (savingQuestions.current.has(questionId)) return false;
			try {
				savingQuestions.current.add(questionId);
const ctx: SaveContext = {
    userId: userId ?? 0,
    examId: _isNewExam ? examIdFromParams : examId, // ✅ params-аас
    questionId,
    rowNum,
    answer,
    isNewExam: _isNewExam,
    previousAnswer: lastSavedAnswers.current.get(questionId),
    examAnswers: examDataRef.current?.Answers ?? [],
    examDateId,
    examRegId,
};
				await DELETE_HANDLERS[queTypeId]?.(ctx);
				await SAVE_HANDLERS[queTypeId]?.(ctx);
				lastSavedAnswers.current.set(questionId, answer);
				return true;
			} catch (err) {
				console.error(`❌ Failed to save Q${questionId}:`, err);
				return false;
			} finally {
				savingQuestions.current.delete(questionId);
			}
		},
		[userId],
	);

	const processPendingAnswers = useCallback(async () => {
		if (
			isSavingRef.current ||
			pendingAnswers.current.size === 0 ||
			!examDataRef.current?.ExamInfo?.[0]?.id
		)
			return;

		isSavingRef.current = true;
		if (isMountedRef.current) setIsSaving(true);

		const examId = examDataRef.current.ExamInfo[0].id;
		const answersToSave = Array.from(pendingAnswers.current.entries()).sort(
			(a, b) => a[1].timestamp - b[1].timestamp,
		);

		try {
			for (let i = 0; i < answersToSave.length; i += BATCH_SIZE) {
				const batch = answersToSave.slice(i, i + BATCH_SIZE);
				const results = await Promise.allSettled(
					batch.map(([, pending]) => saveQuestion(pending, examId)),
				);
				results.forEach((result, idx) => {
					const [questionId] = batch[idx];
					if (result.status === "fulfilled" && result.value) {
						setPending(questionId, null);
					}
				});
			}
		} finally {
			isSavingRef.current = false;
			if (isMountedRef.current) setIsSaving(false);
		}
	}, [saveQuestion, setPending]);

	const scheduleAutoSave = useCallback(
		(delay: number = SAVE_DELAYS.DEFAULT) => {
			if (saveTimer.current) clearTimeout(saveTimer.current);
			saveTimer.current = setTimeout(processPendingAnswers, delay);
		},
		[processPendingAnswers],
	);

const handleAnswerChange = useCallback(
    (questionId: number, answer: AnswerValue) => {
        const question = questionsMapRef.current.get(questionId);
        if (!question) return;

        const current = selectedAnswersRef.current[questionId];
        const finalAnswer =
            question.que_type_id === QuestionType.SINGLE_CHOICE && current === answer
                ? null
                : answer;

        if (areAnswersEqual(current, finalAnswer)) return;

        dispatchAnswer({ type: "SET_ANSWER", questionId, answer: finalAnswer });
        setPending(questionId, {
            questionId,
            answer: finalAnswer,
            queTypeId: question.que_type_id,
            rowNum: Number(question.row_num),
            timestamp: Date.now(),
        });
        scheduleAutoSave(DELAY_BY_TYPE[question.que_type_id] ?? SAVE_DELAYS.DEFAULT);
    },
    [scheduleAutoSave, setPending],
);

	const handleManualSave = useCallback(() => {
		if (saveTimer.current) clearTimeout(saveTimer.current);
		processPendingAnswers();
	}, [processPendingAnswers]);

	const handleAutoSubmit = useCallback(async () => {
		if (hasAutoFinished.current || isAutoSubmitting.current) return;
		hasAutoFinished.current = true;
		isAutoSubmitting.current = true;
		try {
			if (pendingAnswers.current.size > 0) await processPendingAnswers();
			if (!examDataRef.current?.ExamInfo?.[0]) return;
			finishDialogRef.current?.triggerFinish();
		} catch (err) {
			console.error("❌ Auto submit error:", err);
			hasAutoFinished.current = false;
			isAutoSubmitting.current = false;
		}
	}, [processPendingAnswers]);

	useEffect(() => {
		if (isLoading || !examData?.ChoosedAnswer) return;
		const answersMap: Record<number, AnswerValue> = {};

		const grouped = examData.ChoosedAnswer.reduce(
			(acc, item) => {
				const key = `${item.QueID}_${item.QueType}`;
				if (!acc[key]) acc[key] = [];
				acc[key].push(item as ChoosedAnswer);
				return acc;
			},
			{} as Record<string, ChoosedAnswer[]>,
		);

		Object.values(grouped).forEach((items) => {
			if (!items.length) return;
			const { QueID, QueType } = items[0];
			if (QueID == null) return;
			switch (QueType) {
				case QuestionType.SINGLE_CHOICE: {
					const ansId = items[items.length - 1].AnsID ?? null;
					answersMap[QueID] = ansId && isValidId(ansId) ? ansId : null;
					break;
				}
				case QuestionType.MULTI_CHOICE:
					answersMap[QueID] = [
						...new Set(
							items
								.map((i) => i.AnsID)
								.filter((id): id is number => id !== null && isValidId(id)),
						),
					];
					break;
				case QuestionType.NUMBER_INPUT: {
					const map: Record<number, string> = {};
					items.forEach((it) => {
						const ansId = it.AnsID ?? 0;
						const val = it.Answer ?? "";
						if (isValidId(ansId)) map[ansId] = val;
					});
					answersMap[QueID] = map;
					break;
				}
				case QuestionType.TEXT_FILL:
					answersMap[QueID] = items[items.length - 1].Answer ?? "";
					break;
				case QuestionType.ORDERING: {
					const sorted = [...items].sort(
						(a, b) => (Number(a.Answer) || 999) - (Number(b.Answer) || 999),
					);
					answersMap[QueID] = sorted
						.map((i) => i.AnsID)
						.filter((id): id is number => id !== null && isValidId(id));
					break;
				}
				case QuestionType.MATCHING: {
					const matchMap: Record<number, number[]> = {};
					items.forEach((item) => {
						const qRefId = Number(item.Answer);
						const aRefId = item.AnsID;
						if (qRefId && aRefId) {
							if (!matchMap[qRefId]) matchMap[qRefId] = [];
							matchMap[qRefId].push(aRefId);
						}
					});
					answersMap[QueID] = matchMap;
					break;
				}
			}
		});

		dispatchAnswer({ type: "INIT_ANSWERS", answers: answersMap });
		lastSavedAnswers.current = new Map(
			Object.entries(answersMap).map(([k, v]) => [Number(k), v]),
		);
	}, [examData, isLoading]);

	const allQuestions = useMemo(() => {
		if (!examData?.Questions || !examData?.Answers) return [];
		const answersByQId = new Map<number, typeof examData.Answers>();
		for (const answer of examData.Answers) {
			if (!answersByQId.has(answer.question_id))
				answersByQId.set(answer.question_id, []);
			answersByQId.get(answer.question_id)?.push(answer);
		}
		return examData.Questions.filter((q) =>
			VALID_QUESTION_TYPES.has(q.que_type_id),
		).map((q) => ({
			...q,
			question_img: q.question_img || "",
			answers: (answersByQId.get(q.question_id) || [])
				.filter((a) => a.answer_type === q.que_type_id)
				.map((a) => ({
					...a,
					answer_img: a.answer_img ?? null,
					is_true: false,
				})),
		}));
	}, [examData?.Questions, examData?.Answers]);

	// FIX: allQuestions өөрчлөгдөх бүрт questionsMapRef шинэчлэх
	useEffect(() => {
		questionsMapRef.current = new Map(
			allQuestions.map((q) => [
				q.question_id,
				{ que_type_id: q.que_type_id, row_num: q.row_num },
			]),
		);
	}, [allQuestions]);

	const totalCount = allQuestions.length;

	const examSources = useMemo((): ExamSource[] => {
		return allQuestions.reduce<ExamSource[]>((acc, q, index) => {

			if (q.source_name || q.source_img) {

				acc.push({
					questionIndex: index,
					questionLabel: `${index + 1}-р асуулт`,
					 sourceName: q.source_name?.replace(/&nbsp;/g, " ") ?? null,
					sourceImg: q.source_img,
					rowNum: q.row_num,
					assigSourceId: q.assig_source_id ?? null,
					sectionId: q.sectionId ?? null,
					sectionNumber: q.section_number ?? null,
				});
			}
			return acc;
		}, []);
	}, [allQuestions]);

	const toggleBookmark = useCallback((questionId: number) => {
		setBookmarkedMap((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
	}, []);

	const bookmarkedQuestionsSet = useMemo(() => {
		return new Set(
			Object.keys(bookmarkedMap)
				.filter((k) => bookmarkedMap[Number(k)])
				.map(Number),
		);
	}, [bookmarkedMap]);
	const goToQuestion = useCallback((index: number) => {
		setCurrentQuestionIndex(index);
		if (IS_BROWSER && window.innerWidth >= 1024) {
			const el = document.getElementById(`question-${index}`);
			if (!el) return;

			const headerOffset = 100; // ExamHeader өндрөөр тохируулна
			const top =
				el.getBoundingClientRect().top + window.scrollY - headerOffset;
			window.scrollTo({ top, behavior: "smooth" });
		}
	}, []);

	const goToPreviousQuestion = useCallback(() => {
		setCurrentQuestionIndex((prev) => {
			if (prev <= 0) return prev;
			const next = prev - 1;
			if (IS_BROWSER && window.innerWidth >= 1024) {
				const el = document.getElementById(`question-${next}`);
				if (el) {
					const top = el.getBoundingClientRect().top + window.scrollY - 100;
					window.scrollTo({ top, behavior: "smooth" });
				}
			} else {
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
			return next;
		});
	}, []);

	const goToNextQuestion = useCallback(() => {
		setCurrentQuestionIndex((prev) => {
			if (prev >= totalCount - 1) return prev;
			const next = prev + 1;
			if (IS_BROWSER && window.innerWidth >= 1024) {
				const el = document.getElementById(`question-${next}`);
				if (el) {
					const top = el.getBoundingClientRect().top + window.scrollY - 100;
					window.scrollTo({ top, behavior: "smooth" });
				}
			} else {
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
			return next;
		});
	}, [totalCount]);

	const processPendingRef = useRef(processPendingAnswers);
	useEffect(() => {
		processPendingRef.current = processPendingAnswers;
	}, [processPendingAnswers]);

	useEffect(() => {
		return () => {
			for (const timer of typingTimers.current.values()) clearTimeout(timer);
			typingTimers.current.clear();
			savingQuestions.current.clear();
			if (saveTimer.current) clearTimeout(saveTimer.current);
			if (pendingAnswers.current.size > 0) void processPendingRef.current();
		};
	}, []);

	// ─── Loading state ───
	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center p-8">
					<Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-lg font-medium">Шалгалт ачааллаж байна...</p>
				</div>
			</div>
		);
	}

	if (!isValidUserId || !isValidExamId) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center p-8 bg-yellow-50 rounded-xl border border-yellow-200 max-w-md">
					<p className="text-xl font-medium text-yellow-700 mb-2">
						Нэвтрэх шаардлагатай
					</p>
					<p className="text-sm text-yellow-600">
						Шалгалтад орохын тулд нэвтэрнэ үү.
					</p>
				</div>
			</div>
		);
	}

	if (error || !examData) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-md">
					<p className="text-xl font-medium text-red-600 mb-2">Алдаа гарлаа</p>
					<p className="text-sm text-red-500">
						{error instanceof Error ? error.message : "Шалгалт олдсонгүй"}
					</p>
					<Button
						onClick={() => window.location.reload()}
						className="mt-4"
						variant="outline"
					>
						Дахин оролдох
					</Button>
				</div>
			</div>
		);
	}

	const currentQuestion = allQuestions[currentQuestionIndex];
	const examId = examData.ExamInfo?.[0]?.id ?? 0;
	const examInfo = examData.ExamInfo?.[0];

	const sharedTimer = examInfo ? (
		<ExamTimer
			examStartTime={examInfo.ognoo}
			examEndTime={examInfo.end_time}
			examMinutes={examInfo.minut}
			startedDate={examInfo.starteddate}
			onTimeUp={setIsTimeUp}
			onAutoFinish={handleAutoSubmit}
			onTimeUpdate={setTimeDisplay}
		/>
	) : null;

	return (
		<div className="min-h-screen">
			{/* ─── Desktop Layout ─── */}
			<div className="hidden lg:block">
				<div className="fixed top-0 left-0 right-0 z-30">
					{examInfo && <ExamHeader examInfo={examInfo} />}
				</div>

				{/* pt нь header өндөртэй тэнцүү байх ёстой */}
				<div className="grid grid-cols-6 gap-6 max-w-[1800px] mx-auto px-6 xl:px-8 pb-6 pt-14">
					<aside className="col-span-1">
						<div className="sticky top-16 space-y-4">
							{sharedTimer}
							<ExamMinimap
								totalCount={totalCount}
								answeredCount={answeredCount}
								currentQuestionIndex={currentQuestionIndex}
								selectedAnswers={selectedAnswers}
								questions={allQuestions}
								onQuestionClick={goToQuestion}
								bookmarkedQuestions={bookmarkedQuestionsSet}
							/>
							{examInfo && !isTimeUp && (
								<div className="pt-6 flex justify-center">
									<FinishExamResultDialog
										ref={finishDialogRef}
										examId={examInfo.id}
										examType={examInfo.exam_type}
										startEid={examInfo.start_eid}
										examTime={examInfo.minut}
										answeredCount={answeredCount}
										totalCount={totalCount}
										    examRegId={examRegId}        
    variantId={variantNumber} 
									/>
								</div>
							)}
						</div>
					</aside>

				<main className="col-span-3">
  <div className="space-y-5">
    {(() => {
      let lastSectionNumber: number | null = null;
      return allQuestions.map((q, index) => {
        const showSectionHeader =
          q.section_number !== null &&
          q.section_number !== lastSectionNumber;
        if (showSectionHeader) lastSectionNumber = q.section_number;

        return (
          <div key={q.question_id}>
            {showSectionHeader && (
              <div className="flex items-center gap-3 py-3 px-4 mb-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">
                    {q.section_number}
                  </span>
                </div>
                <span className="text-base font-bold text-blue-700 dark:text-blue-300">
                  {q.section_number}-р хэсэг
                </span>
                <div className="flex-1 h-px bg-blue-200 dark:bg-blue-700" />
              </div>
            )}
            <div id={`question-${index}`}>
              <MemoDesktopQuestionCard
                question={q}
                index={index}
                selectedAnswer={selectedAnswers[q.question_id]}
                isBookmarked={!!bookmarkedMap[q.question_id]}
                isTyping={currentTypingId === q.question_id}
                onAnswerChange={handleAnswerChange}
                onBookmarkToggle={toggleBookmark}
                examId={examId}
                userId={userId ?? 0}
              />
            </div>
          </div>
        );
      });
    })()}
  </div>
</main>

					<aside className="col-span-2">
						<div className="sticky top-6 space-y-4">
							{examSources.length > 0 && (
								<ExamSourceCard
									sources={examSources}
									currentIndex={currentQuestionIndex}
								/>
							)}
						</div>
					</aside>
				</div>
			</div>

			{/* ─── Mobile Layout ─── */}
			<div className="lg:hidden min-h-screen flex flex-col">
				<div className="sticky top-0 z-20 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
					<div className="px-3 py-2">
						{examInfo && <ExamHeader examInfo={examInfo} />}
						{examInfo && (
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<div className="w-7 h-7 rounded-md bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
										<Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
									</div>
									<div>
										<div className="text-lg font-black text-green-600 dark:text-green-400 leading-none">
											{timeDisplay}
										</div>
										<div className="text-[10px] text-slate-500 dark:text-slate-400">
											Үлдсэн хугацаа
										</div>
									</div>
								</div>
								<Button
									onClick={() => setShowMobileMinimapOverlay(true)}
									className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
								>
									<Menu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
									<span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
										Асуулт
									</span>
								</Button>
							</div>
						)}
						<div className="flex items-center gap-2">
							<div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
								<div
									className="h-full bg-linear-to-r from-green-500 to-emerald-600 transition-all"
									style={{
										width:
											totalCount > 0
												? `${(answeredCount / totalCount) * 100}%`
												: "0%",
									}}
								/>
							</div>
							<div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
								<CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
								{answeredCount}/{totalCount}
							</div>
						</div>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto px-3 py-3">
  {currentQuestion && (
    <>
      {/* Section header — зөвхөн section эхний асуулт дээр */}
      {currentQuestion.section_number !== null &&
        (currentQuestionIndex === 0 ||
          allQuestions[currentQuestionIndex - 1]?.section_number !==
            currentQuestion.section_number) && (
          <div className="flex items-center gap-3 py-2.5 px-4 mb-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {currentQuestion.section_number}
              </span>
            </div>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {currentQuestion.section_number}-р хэсэг
            </span>
          </div>
        )}
      <MemoMobileQuestionCard
        key={currentQuestion.question_id}
        question={currentQuestion}
        index={currentQuestionIndex}
        selectedAnswer={selectedAnswers[currentQuestion.question_id]}
        isBookmarked={!!bookmarkedMap[currentQuestion.question_id]}
        isTyping={currentTypingId === currentQuestion.question_id}
        onAnswerChange={handleAnswerChange}
        onBookmarkToggle={toggleBookmark}
        examId={examId}
        userId={userId ?? 0}
      />
    </>
  )}
</div>

				<div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg">
					<div className="px-3 py-2 space-y-2">
						<div className="flex gap-2">
							<Button
								onClick={goToPreviousQuestion}
								disabled={currentQuestionIndex === 0}
								variant="outline"
								className="flex-1 h-10 font-semibold text-sm"
							>
								<ChevronLeft className="w-4 h-4 mr-1" />
								Өмнөх
							</Button>
							<Button
								onClick={goToNextQuestion}
								disabled={currentQuestionIndex === totalCount - 1}
								variant="outline"
								className="flex-1 h-10 font-semibold text-sm"
							>
								Дараах
								<ChevronRight className="w-4 h-4 ml-1" />
							</Button>
						</div>
						<div className="flex gap-2">
							<SaveButton
								pendingCount={pendingCount}
								isSaving={isSaving}
								isTimeUp={isTimeUp}
								onSave={handleManualSave}
								variant="mobile"
							/>
							{examInfo && !isTimeUp && (
								<FinishExamResultDialog
									ref={finishDialogRef}
									examId={examInfo.id}
									examType={examInfo.exam_type}
									startEid={examInfo.start_eid}
									examTime={examInfo.minut}
									answeredCount={answeredCount}
									totalCount={totalCount}
									 examRegId={examRegId}       // ✅ нэмэх
        variantId={variantNumber}
								/>
							)}
						</div>
					</div>
				</div>

				{showMobileMinimapOverlay && (
					<ExamMinimap
						totalCount={totalCount}
						answeredCount={answeredCount}
						currentQuestionIndex={currentQuestionIndex}
						selectedAnswers={selectedAnswers}
						questions={allQuestions}
						onQuestionClick={goToQuestion}
						bookmarkedQuestions={bookmarkedQuestionsSet}
						isMobileOverlay={true}
						onClose={() => setShowMobileMinimapOverlay(false)}
					/>
				)}
			</div>

			<SaveButton
				pendingCount={pendingCount}
				isSaving={isSaving}
				isTimeUp={isTimeUp}
				onSave={handleManualSave}
				variant="desktop"
			/>

			<FixedScrollButton />
		</div>
	);
}
