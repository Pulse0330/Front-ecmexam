"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Bookmark,
	BookmarkCheck,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	Loader2,
	Menu,
	Save,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import FinishExamResultDialog, {
	type FinishExamDialogHandle,
} from "@/app/exam/component/finish";
import ExamMinimap from "@/app/exam/component/minimap";
import FillInTheBlankQuestion from "@/app/exam/component/question/fillblank";
import MatchingByLine from "@/app/exam/component/question/matching";
import MultiSelectQuestion from "@/app/exam/component/question/multiselect";
import NumberInputQuestion from "@/app/exam/component/question/numberinput";
import DragAndDropQuestion from "@/app/exam/component/question/order";
import SingleSelectQuestion from "@/app/exam/component/question/singleSelect";
import FixedScrollButton from "@/components/FixedScrollButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteExamAnswer, getExamById, saveExamAnswer } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AnswerValue } from "@/types/exam/exam";
import { ExamHeader } from "../component/examInfo";
import ExamTimer from "../component/Itime";
import MathContent from "../component/question/MathContent";
import QuestionImage from "../component/question/questionImage";

const SAVE_DELAYS = {
	DEFAULT: 1000,
	TYPE_3_NUMBER: 1500,
	TYPE_4_FILL: 1500,
	TYPE_5_ORDER: 2000,
	TYPE_6_MATCH: 3000,
} as const;

const BATCH_SIZE = 5;
const TYPING_INDICATOR_DELAY = 1500;
interface PendingAnswer {
	questionId: number;
	answer: AnswerValue;
	queTypeId: number;
	rowNum: number;
	timestamp: number;
}

const normalizeMatchingAnswer = (
	answer: Record<number, number | number[]>,
): Map<number, number[]> => {
	const normalized = new Map<number, number[]>();

	Object.entries(answer).forEach(([qRefIdStr, value]) => {
		const qRefId = Number(qRefIdStr);
		const aRefIds = Array.isArray(value) ? value : [value];

		// Filter out invalid IDs
		const validIds = aRefIds.filter(
			(id) => id && id !== 0 && !Number.isNaN(id),
		);

		if (validIds.length > 0) {
			normalized.set(qRefId, validIds);
		}
	});

	return normalized;
};

const extractAnswerIds = (matches: Map<number, number[]>): Set<number> => {
	const ids = new Set<number>();

	for (const aRefIds of matches.values()) {
		for (const id of aRefIds) {
			ids.add(id);
		}
	}
	return ids;
};

const areAnswersEqual = (
	a: AnswerValue | undefined,
	b: AnswerValue | undefined,
): boolean => {
	if (a === b) return true;
	if (a === undefined || b === undefined) return false;

	const aType = Array.isArray(a) ? "array" : typeof a;
	const bType = Array.isArray(b) ? "array" : typeof b;
	if (aType !== bType) return false;

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((v, i) => v === b[i]);
	}

	if (
		typeof a === "object" &&
		typeof b === "object" &&
		a !== null &&
		b !== null
	) {
		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);
		if (aKeys.length !== bKeys.length) return false;

		const aRecord = a as Record<number, number | number[] | string>;
		const bRecord = b as Record<number, number | number[] | string>;

		return aKeys.every((key) => {
			const numKey = Number(key);
			const aVal = aRecord[numKey];
			const bVal = bRecord[numKey];

			if (Array.isArray(aVal) && Array.isArray(bVal)) {
				if (aVal.length !== bVal.length) return false;
				return aVal.every((v, i) => v === bVal[i]);
			}

			return aVal === bVal;
		});
	}

	return false;
};

export default function ExamPage() {
	const { userId } = useAuthStore();
	const { id } = useParams();

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [saveError, _setSaveError] = useState<string | null>(null);
	const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(
		new Set(),
	);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, AnswerValue>
	>({});
	const [isSaving, setIsSaving] = useState(false);
	const [typingQuestions, setTypingQuestions] = useState<Set<number>>(
		new Set(),
	);
	const [isTimeUp, setIsTimeUp] = useState(false);
	const [showMobileMinimapOverlay, setShowMobileMinimapOverlay] =
		useState(false);

	const savingQuestions = useRef<Set<number>>(new Set());
	const finishDialogRef = useRef<FinishExamDialogHandle>(null);
	const hasAutoFinished = useRef(false);
	const isAutoSubmitting = useRef(false);
	const typingTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());
	const pendingAnswers = useRef<Map<number, PendingAnswer>>(new Map());
	const saveTimer = useRef<NodeJS.Timeout | null>(null);
	const lastSavedAnswers = useRef<Map<number, AnswerValue>>(new Map());
	const isSavingRef = useRef(false);

	const {
		data: examData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["exam", userId, id],
		queryFn: () => getExamById(userId || 0, Number(id)),
		enabled: !!userId && !!id,
	});

	const saveQuestion = useCallback(
		async (pending: PendingAnswer, examId: number): Promise<boolean> => {
			const { questionId, answer, queTypeId, rowNum } = pending;

			// Prevent race conditions
			if (savingQuestions.current.has(questionId)) {
				console.log(`⚠️ Q${questionId} already saving, skipping...`);
				return false;
			}

			try {
				savingQuestions.current.add(questionId);
				const previousAnswer = lastSavedAnswers.current.get(questionId);
				if (
					queTypeId === 1 &&
					typeof previousAnswer === "number" &&
					previousAnswer !== 0
				) {
					try {
						await deleteExamAnswer(
							userId || 0,
							examId,
							questionId,
							previousAnswer,
						);
					} catch (error) {
						console.error(`Failed to delete Type 1 Q${questionId}:`, error);
					}
				}

				if (
					queTypeId === 2 &&
					Array.isArray(previousAnswer) &&
					previousAnswer.length > 0
				) {
					try {
						await Promise.allSettled(
							previousAnswer.map((answerId) =>
								deleteExamAnswer(userId || 0, examId, questionId, answerId),
							),
						);
					} catch (error) {
						console.error(`Failed to delete Type 2 Q${questionId}:`, error);
					}
				}

				if (queTypeId === 3 && previousAnswer !== undefined) {
					try {
						if (
							typeof previousAnswer === "object" &&
							previousAnswer !== null &&
							!Array.isArray(previousAnswer)
						) {
							const prevMap = previousAnswer as Record<number, string>;
							const prevIds = Object.keys(prevMap)
								.map((k) => Number(k))
								.filter((id) => id && id !== 0 && prevMap[id]?.trim());

							if (prevIds.length > 0) {
								await Promise.allSettled(
									prevIds.map((answerId) =>
										deleteExamAnswer(userId || 0, examId, questionId, answerId),
									),
								);
							}
						}
					} catch (error) {
						console.error(`Failed to delete Type 3 Q${questionId}:`, error);
					}
				}

				if (queTypeId === 4 && previousAnswer !== undefined) {
					try {
						const type4Answer = examData?.Answers?.find(
							(ans) => ans.question_id === questionId && ans.answer_type === 4,
						);
						if (type4Answer) {
							await deleteExamAnswer(
								userId || 0,
								examId,
								questionId,
								type4Answer.answer_id,
							);
						}
					} catch (error) {
						console.error(`Failed to delete Type 4 Q${questionId}:`, error);
					}
				}

				if (
					queTypeId === 5 &&
					Array.isArray(previousAnswer) &&
					previousAnswer.length > 0
				) {
					try {
						const validPrevAnswers = previousAnswer.filter(
							(id) => id && id !== 0 && !Number.isNaN(id),
						);

						if (validPrevAnswers.length > 0) {
							await Promise.allSettled(
								validPrevAnswers.map((answerId) =>
									deleteExamAnswer(userId || 0, examId, questionId, answerId),
								),
							);
						}
					} catch (error) {
						console.error(`Failed to delete Type 5 Q${questionId}:`, error);
					}
				}

				if (
					queTypeId === 6 &&
					typeof answer === "object" &&
					answer !== null &&
					!Array.isArray(answer)
				) {
					const currentMatches = normalizeMatchingAnswer(
						answer as Record<number, number | number[]>,
					);
					const currentAnswerIds = extractAnswerIds(currentMatches);

					const previousAnswerIds = new Set<number>();
					if (
						typeof previousAnswer === "object" &&
						previousAnswer !== null &&
						!Array.isArray(previousAnswer)
					) {
						const previousMatches = normalizeMatchingAnswer(
							previousAnswer as Record<number, number | number[]>,
						);

						for (const aRefIds of previousMatches.values()) {
							for (const id of aRefIds) {
								previousAnswerIds.add(id);
							}
						}
					}

					const answersToDelete = Array.from(previousAnswerIds).filter(
						(id) => !currentAnswerIds.has(id),
					);

					if (answersToDelete.length > 0) {
						console.log(
							`🗑️ Type 6 Q${questionId}: Deleting ${answersToDelete.length} changed answers`,
						);
						try {
							await Promise.allSettled(
								answersToDelete.map((answerId) =>
									deleteExamAnswer(userId || 0, examId, questionId, answerId),
								),
							);
						} catch (error) {
							console.error(`Failed to delete Type 6 Q${questionId}:`, error);
						}
					}
				}

				if (queTypeId === 1 && typeof answer === "number" && answer !== 0) {
					await saveExamAnswer(
						userId || 0,
						examId,
						questionId,
						answer,
						queTypeId,
						"1",
						rowNum,
					);
				}

				if (queTypeId === 2 && Array.isArray(answer) && answer.length > 0) {
					await Promise.all(
						answer.map((answerId) =>
							saveExamAnswer(
								userId || 0,
								examId,
								questionId,
								answerId,
								queTypeId,
								"1",
								rowNum,
							),
						),
					);
				}

				if (
					queTypeId === 3 &&
					typeof answer === "object" &&
					answer !== null &&
					!Array.isArray(answer)
				) {
					const valuesMap = answer as Record<number, string>;
					const entries = Object.entries(valuesMap)
						.map(([k, v]) => [Number(k), v as string] as [number, string])
						.filter(([aid, val]) => aid && aid !== 0 && val.trim());

					if (entries.length > 0) {
						await Promise.all(
							entries.map(([answerId, val]) =>
								saveExamAnswer(
									userId || 0,
									examId,
									questionId,
									answerId,
									queTypeId,
									val,
									rowNum,
								),
							),
						);
					}
				}

				if (queTypeId === 4 && typeof answer === "string" && answer.trim()) {
					const type4Answer = examData?.Answers?.find(
						(ans) => ans.question_id === questionId && ans.answer_type === 4,
					);
					if (type4Answer) {
						await saveExamAnswer(
							userId || 0,
							examId,
							questionId,
							type4Answer.answer_id,
							queTypeId,
							answer,
							rowNum,
						);
					}
				}

				if (queTypeId === 5 && Array.isArray(answer) && answer.length > 0) {
					const validAnswers = answer.filter(
						(id) =>
							id && id !== 0 && !Number.isNaN(id) && typeof id === "number",
					);

					if (validAnswers.length > 0) {
						await Promise.all(
							validAnswers.map((answerId, index) =>
								saveExamAnswer(
									userId || 0,
									examId,
									questionId,
									answerId,
									queTypeId,
									(index + 1).toString(),
									rowNum,
								),
							),
						);
					}
				}

				if (
					queTypeId === 6 &&
					typeof answer === "object" &&
					answer !== null &&
					!Array.isArray(answer)
				) {
					const currentMatches = normalizeMatchingAnswer(
						answer as Record<number, number | number[]>,
					);
					const savePromises: Promise<unknown>[] = [];

					for (const [qRefId, aRefIds] of currentMatches.entries()) {
						for (const aRefId of aRefIds) {
							savePromises.push(
								saveExamAnswer(
									userId || 0,
									examId,
									questionId,
									aRefId,
									queTypeId,
									String(qRefId),
									rowNum,
								),
							);
						}
					}

					if (savePromises.length > 0) {
						await Promise.all(savePromises);
					}
				}

				lastSavedAnswers.current.set(questionId, answer);
				return true;
			} catch (error) {
				console.error(`❌ Failed to save Q${questionId}:`, error);
				return false;
			} finally {
				savingQuestions.current.delete(questionId);
			}
		},
		[userId, examData],
	);

	const processPendingAnswers = useCallback(async () => {
		if (
			isSavingRef.current ||
			pendingAnswers.current.size === 0 ||
			!examData?.ExamInfo?.[0]?.id
		) {
			return;
		}

		isSavingRef.current = true;
		setIsSaving(true);

		const examId = examData.ExamInfo[0].id;
		const answersToSave = Array.from(pendingAnswers.current.entries());
		const failedSaves: [number, PendingAnswer][] = [];

		answersToSave.sort((a, b) => a[1].timestamp - b[1].timestamp);

		for (let i = 0; i < answersToSave.length; i += BATCH_SIZE) {
			const batch = answersToSave.slice(i, i + BATCH_SIZE);
			const results = await Promise.allSettled(
				batch.map(([_, pending]) => saveQuestion(pending, examId)),
			);

			results.forEach((result, index) => {
				const [questionId, pending] = batch[index];
				if (result.status === "fulfilled" && result.value) {
					pendingAnswers.current.delete(questionId);
				} else {
					failedSaves.push([questionId, pending]);
				}
			});
		}

		isSavingRef.current = false;
		setIsSaving(false);
	}, [examData, saveQuestion]);

	const scheduleAutoSave = useCallback(
		(delay: number = SAVE_DELAYS.DEFAULT) => {
			if (saveTimer.current) clearTimeout(saveTimer.current);
			saveTimer.current = setTimeout(() => {
				processPendingAnswers();
			}, delay);
		},
		[processPendingAnswers],
	);

	const handleAnswerChange = useCallback(
		(questionId: number, answer: AnswerValue) => {
			if (!examData) return;

			const question = examData.Questions.find(
				(q) => q.question_id === questionId,
			);
			if (!question) return;

			const lastSaved = lastSavedAnswers.current.get(questionId);
			if (areAnswersEqual(lastSaved, answer)) return;

			const rowNum = Number(question.row_num);
			const queTypeId = question.que_type_id;
			const existingTimer = typingTimers.current.get(questionId);
			if (existingTimer) {
				clearTimeout(existingTimer);
			}

			setTypingQuestions((prev) => new Set(prev).add(questionId));

			const typingTimer = setTimeout(() => {
				setTypingQuestions((prev) => {
					const newSet = new Set(prev);
					newSet.delete(questionId);
					return newSet;
				});
				typingTimers.current.delete(questionId);
			}, TYPING_INDICATOR_DELAY);

			typingTimers.current.set(questionId, typingTimer);

			setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));

			pendingAnswers.current.set(questionId, {
				questionId,
				answer,
				queTypeId,
				rowNum,
				timestamp: Date.now(),
			});

			const delay =
				queTypeId === 6
					? SAVE_DELAYS.TYPE_6_MATCH
					: queTypeId === 5
						? SAVE_DELAYS.TYPE_5_ORDER
						: queTypeId === 4
							? SAVE_DELAYS.TYPE_4_FILL
							: queTypeId === 3
								? SAVE_DELAYS.TYPE_3_NUMBER
								: SAVE_DELAYS.DEFAULT;

			scheduleAutoSave(delay);
		},
		[examData, scheduleAutoSave],
	);

	const handleManualSave = useCallback(() => {
		if (saveTimer.current) clearTimeout(saveTimer.current);
		processPendingAnswers();
	}, [processPendingAnswers]);

	const handleAutoSubmit = useCallback(async () => {
		if (hasAutoFinished.current || isAutoSubmitting.current) {
			console.log("⚠️ Auto-submit already in progress");
			return;
		}

		hasAutoFinished.current = true;
		isAutoSubmitting.current = true;

		console.log("🔴 Time's up - Auto-submitting...");

		try {
			if (pendingAnswers.current.size > 0) {
				console.log(
					`💾 Saving ${pendingAnswers.current.size} pending answers...`,
				);
				await processPendingAnswers();
				console.log("✅ All answers saved");
			}

			const examInfo = examData?.ExamInfo?.[0];
			if (!examInfo) {
				console.error("❌ Exam info not found");
				return;
			}

			console.log("📤 Submitting exam...");
			finishDialogRef.current?.triggerFinish();
		} catch (error) {
			console.error("❌ Auto submit error:", error);
			hasAutoFinished.current = false;
			isAutoSubmitting.current = false;
		}
	}, [processPendingAnswers, examData]);

	useEffect(() => {
		if (isLoading || !examData?.ChoosedAnswer) return;

		const answersMap: Record<number, AnswerValue> = {};

		const groupedAnswers = examData.ChoosedAnswer.reduce(
			(acc, item) => {
				const key = `${item.QueID}_${item.QueType}`;
				if (!acc[key]) acc[key] = [];
				acc[key].push(item);
				return acc;
			},
			{} as Record<string, typeof examData.ChoosedAnswer>,
		);

		Object.values(groupedAnswers).forEach((items) => {
			if (items.length === 0) return;

			const { QueID, QueType } = items[0];
			if (QueID == null) return;

			switch (QueType) {
				case 1: {
					const lastItem = items[items.length - 1];
					const ansId = lastItem.AnsID ?? null;
					answersMap[QueID] = ansId && ansId !== 0 ? ansId : null;
					break;
				}
				case 2: {
					const uniqueIds = [
						...new Set(
							items
								.map((i) => i.AnsID)
								.filter((id): id is number => id !== null && id !== 0),
						),
					];
					answersMap[QueID] = uniqueIds;
					break;
				}

				case 3: {
					const map: Record<number, string> = {};
					items.forEach((it) => {
						const ansId = it.AnsID ?? 0;
						const val = (it as { Answer?: string }).Answer ?? "";
						if (ansId && ansId !== 0) {
							map[ansId] = val;
						}
					});
					answersMap[QueID] = map;
					break;
				}

				case 4: {
					const lastItem = items[items.length - 1];
					answersMap[QueID] = (lastItem as { Answer?: string }).Answer || "";
					break;
				}

				case 5: {
					// Drag and drop
					const sortedItems = [...items].sort((a, b) => {
						const aOrder = Number((a as { Answer?: string }).Answer) || 999;
						const bOrder = Number((b as { Answer?: string }).Answer) || 999;
						return aOrder - bOrder;
					});
					answersMap[QueID] = sortedItems
						.map((i) => i.AnsID)
						.filter((id): id is number => id !== null && id !== 0);
					break;
				}

				case 6: {
					// Matching
					const matchMap: Record<number, number[]> = {};
					items.forEach((item) => {
						const qRefId = Number((item as { Answer?: string }).Answer);
						const aRefId = item.AnsID;

						if (qRefId && aRefId) {
							if (!matchMap[qRefId]) {
								matchMap[qRefId] = [];
							}
							matchMap[qRefId].push(aRefId);
						}
					});
					answersMap[QueID] = matchMap;
					break;
				}
			}
		});

		setSelectedAnswers(answersMap);
		lastSavedAnswers.current = new Map(
			Object.entries(answersMap).map(([k, v]) => [Number(k), v]),
		);
	}, [examData, isLoading]);

	const allQuestions = useMemo(() => {
		if (!examData?.Questions || !examData?.Answers) return [];

		const answersByQuestionId = new Map<number, typeof examData.Answers>();

		for (const answer of examData.Answers) {
			if (!answersByQuestionId.has(answer.question_id)) {
				answersByQuestionId.set(answer.question_id, []);
			}
			answersByQuestionId.get(answer.question_id)?.push(answer);
		}

		return examData.Questions.filter((q) =>
			[1, 2, 3, 4, 5, 6].includes(q.que_type_id),
		).map((q) => {
			const questionAnswers = answersByQuestionId.get(q.question_id) || [];
			const filteredAnswers = questionAnswers
				.filter((a) => a.answer_type === q.que_type_id)
				.map((a) => ({
					...a,
					answer_img: a.answer_img || undefined,
					is_true: false,
				}));

			return {
				...q,
				question_img: q.question_img || "",
				answers: filteredAnswers,
			};
		});
	}, [examData?.Questions, examData?.Answers]);

	const totalCount = allQuestions.length;

	const answeredCount = useMemo(() => {
		let count = 0;

		for (const key in selectedAnswers) {
			if (!Object.hasOwn(selectedAnswers, key)) continue;

			const ans = selectedAnswers[key];
			if (ans == null) continue;

			if (Array.isArray(ans)) {
				if (ans.length > 0) count++;
			} else if (typeof ans === "string") {
				if (ans.trim()) count++;
			} else if (typeof ans === "number") {
				if (ans !== 0 && !Number.isNaN(ans)) count++;
			} else {
				// Object - has at least one property
				if (Object.keys(ans).length > 0) count++;
			}
		}

		return count;
	}, [selectedAnswers]);

	const toggleBookmark = useCallback((questionId: number) => {
		setBookmarkedQuestions((prev) => {
			const newSet = new Set(prev);
			newSet.has(questionId)
				? newSet.delete(questionId)
				: newSet.add(questionId);
			return newSet;
		});
	}, []);

	const goToQuestion = useCallback((index: number) => {
		setCurrentQuestionIndex(index);
		const element = document.getElementById(`question-${index}`);
		if (element && window.innerWidth >= 1024) {
			element.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, []);

	const goToPreviousQuestion = useCallback(() => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentQuestionIndex]);

	const goToNextQuestion = useCallback(() => {
		if (currentQuestionIndex < totalCount - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentQuestionIndex, totalCount]);

	const getCardBorderClass = useCallback(
		(questionId: number) => {
			const answer = selectedAnswers[questionId];

			let isAnswered = false;
			if (Array.isArray(answer)) {
				isAnswered = answer.length > 0;
			} else if (typeof answer === "string") {
				isAnswered = answer.trim() !== "";
			} else if (typeof answer === "number") {
				isAnswered = !Number.isNaN(answer) && answer !== 0;
			} else if (typeof answer === "object" && answer !== null) {
				isAnswered = Object.keys(answer).length > 0;
			}

			const isBookmarked = bookmarkedQuestions.has(questionId);
			const isTypingNow = typingQuestions.has(questionId);

			if (isTypingNow) return "border-2 border-blue-400 shadow-lg";
			if (isAnswered && isBookmarked)
				return "border-2 border-amber-500 shadow-sm";
			if (isAnswered) return "border-2 border-blue-600 shadow-sm";
			if (isBookmarked) return "border-2 border-amber-400 shadow-sm";
			return "border border-gray-200";
		},
		[selectedAnswers, bookmarkedQuestions, typingQuestions],
	);

	const renderQuestion = useCallback(
		(q: (typeof allQuestions)[0]) => {
			if (q.que_type_id === 1) {
				return (
					<>
						{q.question_img && (
							<QuestionImage src={q.question_img} alt="Асуултын зураг" />
						)}
						{(q.source_name || q.source_img) && (
							<div className="mt-3 p-3 border rounded-lg">
								{q.source_img && (
									<img
										src={q.source_img}
										alt="source"
										className="w-14 h-14 object-cover rounded-md mb-2"
									/>
								)}
								{q.source_name && (
									<div className="text-sm text-gray-700 leading-relaxed">
										<span className="font-semibold">Эх сурвалж:</span>
										<MathContent html={q.source_name} />
									</div>
								)}
							</div>
						)}
						<SingleSelectQuestion
							questionId={q.question_id}
							questionText={q.question_name}
							answers={q.answers}
							selectedAnswer={selectedAnswers[q.question_id] as number | null}
							onAnswerChange={handleAnswerChange}
						/>
					</>
				);
			}

			if ([2, 3, 4, 6].includes(q.que_type_id)) {
				return (
					<>
						{q.question_img && (
							<QuestionImage src={q.question_img} alt="Асуултын зураг" />
						)}
						{q.que_type_id === 2 && (
							<MultiSelectQuestion
								questionId={q.question_id}
								questionText={q.question_name}
								answers={q.answers}
								mode="exam"
								selectedAnswers={
									(selectedAnswers[q.question_id] as number[]) || []
								}
								onAnswerChange={handleAnswerChange}
							/>
						)}
						{q.que_type_id === 3 && (
							<NumberInputQuestion
								questionId={q.question_id}
								questionText={q.question_name}
								answers={q.answers}
								selectedValues={
									selectedAnswers[q.question_id] as Record<number, string>
								}
								onAnswerChange={(qId, values) =>
									handleAnswerChange(qId, values as AnswerValue)
								}
							/>
						)}
						{q.que_type_id === 4 && (
							<FillInTheBlankQuestion
								questionId={q.question_id}
								questionText={q.question_name}
								value={(selectedAnswers[q.question_id] as string) || ""}
								onAnswerChange={handleAnswerChange}
							/>
						)}
						{q.que_type_id === 6 && (
							<MatchingByLine
								answers={q.answers.map((a) => ({
									refid: a.refid,
									answer_id: a.answer_id,
									question_id: a.question_id,
									answer_name_html: a.answer_name_html,
									answer_descr: a.answer_descr,
									answer_img: a.answer_img || null,
									ref_child_id: a.ref_child_id,
									is_true: a.is_true,
								}))}
								onMatchChange={(matches) =>
									handleAnswerChange(q.question_id, matches)
								}
								userAnswers={
									(selectedAnswers[q.question_id] as Record<
										number,
										number[]
									>) || {}
								}
							/>
						)}
					</>
				);
			}

			if (q.que_type_id === 5) {
				return (
					<>
						{q.question_img && (
							<QuestionImage src={q.question_img} alt="Асуултын зураг" />
						)}
						<DragAndDropQuestion
							questionId={q.question_id}
							examId={examData?.ExamInfo?.[0]?.id}
							userId={userId || 0}
							answers={q.answers.map((a) => ({
								answer_id: a.answer_id,
								answer_name_html: a.answer_name_html || a.answer_name || "",
							}))}
							userAnswers={(selectedAnswers[q.question_id] as number[]) || []}
							onOrderChange={(orderedIds) =>
								handleAnswerChange(q.question_id, orderedIds)
							}
						/>
					</>
				);
			}

			return null;
		},
		[selectedAnswers, handleAnswerChange, examData, userId],
	);

	useEffect(() => {
		return () => {
			for (const timer of typingTimers.current.values()) {
				clearTimeout(timer);
			}
			typingTimers.current.clear();
			savingQuestions.current.clear();

			if (saveTimer.current) clearTimeout(saveTimer.current);
		};
	}, []);

	useEffect(() => {
		return () => {
			if (saveTimer.current) clearTimeout(saveTimer.current);
			if (pendingAnswers.current.size > 0) {
				processPendingAnswers();
			}
		};
	}, [processPendingAnswers]);

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

	if (error || !examData) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-md">
					<p className="text-xl font-medium text-red-600 mb-2">Алдаа гарлаа</p>
					<p className="text-sm text-red-500">
						{error?.message || "Шалгалт олдсонгүй"}
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

	if (allQuestions.length === 0) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center p-8 bg-yellow-50 rounded-xl border border-yellow-200">
					<p className="text-xl font-medium">Энэ шалгалтад асуулт байхгүй</p>
				</div>
			</div>
		);
	}

	const currentQuestion = allQuestions[currentQuestionIndex];

	return (
		<div className="min-h-screen">
			{saveError && (
				<div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
					{saveError}
				</div>
			)}
			{/* Desktop Layout */}
			<div className="hidden lg:block">
				{examData?.ExamInfo?.[0] && (
					<ExamHeader examInfo={examData.ExamInfo[0]} />
				)}
				<div className="grid grid-cols-6 gap-6 max-w-[1800px] mx-auto p-6 xl:p-8">
					<aside className="col-span-1">
						<div className="sticky top-6 space-y-4">
							<ExamMinimap
								totalCount={totalCount}
								answeredCount={answeredCount}
								currentQuestionIndex={currentQuestionIndex}
								selectedAnswers={selectedAnswers}
								questions={allQuestions}
								onQuestionClick={goToQuestion}
								bookmarkedQuestions={bookmarkedQuestions}
							/>
							{examData?.ExamInfo?.[0] && !isTimeUp && (
								<div className="pt-6 flex justify-center">
									<FinishExamResultDialog
										ref={finishDialogRef}
										examId={examData.ExamInfo[0].id}
										examType={examData.ExamInfo[0].exam_type}
										startEid={examData.ExamInfo[0].start_eid}
										examTime={examData.ExamInfo[0].minut}
										answeredCount={answeredCount}
										totalCount={totalCount}
									/>
								</div>
							)}
						</div>
					</aside>

					<main className="col-span-4 space-y-5">
						{allQuestions.map((q, index) => (
							<div key={q.question_id} id={`question-${index}`}>
								<Card className={getCardBorderClass(q.question_id)}>
									<CardContent className="p-6">
										<div className="flex gap-4">
											<div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-semibold">
												{index + 1}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2 mb-4">
													<div className="font-semibold text-lg flex-1 leading-relaxed prose prose-sm max-w-none">
														<MathContent html={q.question_name} />
													</div>
													<div className="flex items-center gap-2 shrink-0">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => toggleBookmark(q.question_id)}
															className="hover:bg-gray-100"
															title={
																bookmarkedQuestions.has(q.question_id)
																	? "Тэмдэглэгээ хасах"
																	: "Тэмдэглэх"
															}
														>
															{bookmarkedQuestions.has(q.question_id) ? (
																<BookmarkCheck className="w-5 h-5 text-yellow-500 fill-yellow-500" />
															) : (
																<Bookmark className="w-5 h-5 text-gray-400" />
															)}
														</Button>
													</div>
												</div>
												{renderQuestion(q)}
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						))}
					</main>

					<aside className="col-span-1">
						<div className="sticky top-6">
							{examData?.ExamInfo?.[0] && (
								<ExamTimer
									examStartTime={examData.ExamInfo[0].ognoo}
									examEndTime={examData.ExamInfo[0].end_time}
									examMinutes={examData.ExamInfo[0].minut}
									startedDate={examData.ExamInfo[0].starteddate}
									onTimeUp={setIsTimeUp}
									onAutoFinish={handleAutoSubmit}
								/>
							)}
						</div>
					</aside>
				</div>
			</div>
			{/* Mobile Layout */}
			<div className="lg:hidden min-h-screen flex flex-col">
				<div className="sticky top-0 z-20 bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
					<div className="px-3 py-2">
						{examData?.ExamInfo?.[0] && (
							<ExamHeader examInfo={examData.ExamInfo[0]} />
						)}
						{examData?.ExamInfo?.[0] && (
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<div className="w-7 h-7 rounded-md bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
										<Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
									</div>
									<div>
										<div className="text-lg font-black text-green-600 dark:text-green-400 leading-none">
											<ExamTimer
												examStartTime={examData.ExamInfo[0].ognoo}
												examEndTime={examData.ExamInfo[0].end_time}
												examMinutes={examData.ExamInfo[0].minut}
												startedDate={examData.ExamInfo[0].starteddate}
												onTimeUp={setIsTimeUp}
												onAutoFinish={handleAutoSubmit}
											/>
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
									style={{ width: `${(answeredCount / totalCount) * 100}%` }}
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
						<Card
							className={`${getCardBorderClass(currentQuestion.question_id)} shadow-sm`}
						>
							<CardContent className="p-4">
								<div className="flex items-start gap-3 mb-4">
									<div className="shrink-0 w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
										{currentQuestionIndex + 1}
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-semibold leading-relaxed prose prose-sm max-w-none text-sm">
											<MathContent html={currentQuestion.question_name} />
										</div>
									</div>
									<div className="flex items-center gap-2 shrink-0">
										{typingQuestions.has(currentQuestion.question_id) && (
											<div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-md">
												<div className="flex gap-0.5">
													<span
														className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
														style={{ animationDelay: "0ms" }}
													/>
													<span
														className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
														style={{ animationDelay: "150ms" }}
													/>
													<span
														className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
														style={{ animationDelay: "300ms" }}
													/>
												</div>
											</div>
										)}
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												toggleBookmark(currentQuestion.question_id)
											}
											className="shrink-0 h-9 w-9"
										>
											{bookmarkedQuestions.has(currentQuestion.question_id) ? (
												<BookmarkCheck className="w-5 h-5 text-yellow-500 fill-yellow-500" />
											) : (
												<Bookmark className="w-5 h-5 text-slate-400" />
											)}
										</Button>
									</div>
								</div>
								<div className="mt-4">{renderQuestion(currentQuestion)}</div>
							</CardContent>
						</Card>
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
							{pendingAnswers.current.size > 0 && !isTimeUp && (
								<Button
									onClick={handleManualSave}
									disabled={isSaving}
									variant="default"
									className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-sm font-semibold"
								>
									{isSaving ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Хадгалж байна
										</>
									) : (
										<>
											<Save className="w-4 h-4 mr-2" />
											Хадгалах ({pendingAnswers.current.size})
										</>
									)}
								</Button>
							)}
							{examData?.ExamInfo?.[0] && !isTimeUp && (
								<FinishExamResultDialog
									ref={finishDialogRef}
									examId={examData.ExamInfo[0].id}
									examType={examData.ExamInfo[0].exam_type}
									startEid={examData.ExamInfo[0].start_eid}
									examTime={examData.ExamInfo[0].minut}
									answeredCount={answeredCount}
									totalCount={totalCount}
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
						bookmarkedQuestions={bookmarkedQuestions}
						isMobileOverlay={true}
						onClose={() => setShowMobileMinimapOverlay(false)}
					/>
				)}
			</div>
			{/* Save button - Desktop */}
			{pendingAnswers.current.size > 0 && !isTimeUp && (
				<div className="fixed bottom-6 right-6 z-50 lg:block hidden">
					<Button
						onClick={handleManualSave}
						disabled={isSaving}
						className="shadow-lg"
						size="lg"
					>
						{isSaving ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Хадгалж байна...
							</>
						) : (
							<>
								<Save className="w-4 h-4 mr-2" />
								Хадгалах ({pendingAnswers.current.size})
							</>
						)}
					</Button>
				</div>
			)}
			<FixedScrollButton />
		</div>
	);
}
