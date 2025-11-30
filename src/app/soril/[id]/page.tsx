"use client";

import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
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
import ExamTimer from "@/app/exam/component/Itime";
import ExamMinimap from "@/app/exam/component/minimap";
import FillInTheBlankQuestion from "@/app/exam/component/question/fillblank";
import MatchingByLine from "@/app/exam/component/question/matching";
import MultiSelectQuestion from "@/app/exam/component/question/multiselect";
import NumberInputQuestion from "@/app/exam/component/question/numberinput";
import DragAndDropQuestion from "@/app/exam/component/question/order";
import QuestionImage from "@/app/exam/component/question/questionImage";
import SingleSelectQuestion from "@/app/exam/component/question/singleSelect";
import FixedScrollButton from "@/components/FixedScrollButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteExamAnswer, getExamById, saveExamAnswer } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AnswerValue } from "@/types/exam/exam";

interface PendingAnswer {
	questionId: number;
	answer: AnswerValue;
	queTypeId: number;
	rowNum: number;
	timestamp: number;
}

export default function ExamPage() {
	const { userId } = useAuthStore();
	const { id } = useParams();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [saveError, setSaveError] = useState<string | null>(null);
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

	// Auto-finish refs
	const finishDialogRef = useRef<FinishExamDialogHandle>(null);
	const hasAutoFinished = useRef(false);
	const isAutoSubmitting = useRef(false);

	const pendingAnswers = useRef<Map<number, PendingAnswer>>(new Map());
	const saveTimer = useRef<NodeJS.Timeout | null>(null);
	const lastSavedAnswers = useRef<Map<number, AnswerValue>>(new Map());
	const isSavingRef = useRef(false);
	const AUTO_SAVE_DELAY = 1000;

	const {
		data: examData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["exam", userId, id],
		queryFn: () => getExamById(userId || 0, Number(id)),
		enabled: !!userId && !!id,
		staleTime: 5 * 60 * 1000,
		retry: 2,
	});

	const areAnswersEqual = useCallback(
		(a: AnswerValue | undefined, b: AnswerValue | undefined): boolean => {
			if (a === b) return true;
			if (a === undefined || b === undefined) return false;
			if (Array.isArray(a) && Array.isArray(b)) {
				return a.length === b.length && a.every((v, i) => v === b[i]);
			}
			if (
				typeof a === "object" &&
				typeof b === "object" &&
				a !== null &&
				b !== null
			) {
				const aKeys = Object.keys(a).sort();
				const bKeys = Object.keys(b).sort();
				const aRecord = a as Record<number, number>;
				const bRecord = b as Record<number, number>;
				return (
					aKeys.length === bKeys.length &&
					aKeys.every(
						(key, i) =>
							key === bKeys[i] && aRecord[Number(key)] === bRecord[Number(key)],
					)
				);
			}
			return false;
		},
		[],
	);

	const saveQuestion = useCallback(
		async (pending: PendingAnswer, examId: number): Promise<boolean> => {
			const { questionId, answer, queTypeId, rowNum } = pending;

			try {
				const previousAnswer = lastSavedAnswers.current.get(questionId);

				// ============================================
				// STEP 1: DELETE OLD ANSWERS BASED ON TYPE
				// ============================================

				// Type 1: Delete old single-select answer
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
					} catch (_error) {
						console.log(
							`Failed to delete old answer for type 1 question ${questionId}`,
						);
					}
				}

				// Type 2: Delete all old multi-select answers
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
					} catch (_error) {
						console.log(
							`Failed to delete old answers for type 2 question ${questionId}`,
						);
					}
				}

				// Type 3: Delete old number input answer
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
								.filter(
									(id) =>
										id && id !== 0 && prevMap[id] && prevMap[id].trim() !== "",
								);
							if (prevIds.length > 0) {
								await Promise.allSettled(
									prevIds.map((answerId) =>
										deleteExamAnswer(userId || 0, examId, questionId, answerId),
									),
								);
							}
						}
					} catch (_error) {
						console.log(
							`Failed to delete old answers for type 3 question ${questionId}`,
						);
					}
				}

				// Type 4: Delete old fill-in-blank answer
				if (queTypeId === 4 && previousAnswer !== undefined) {
					try {
						// ✅ Бодит answer_id ашиглах
						const type4Answer = examData?.Answers?.find(
							(ans) => ans.question_id === questionId && ans.answer_type === 4,
						);

						await deleteExamAnswer(
							userId || 0,
							examId,
							questionId,
							type4Answer?.answer_id || 0,
						);
					} catch (_error) {
						console.log(
							`Failed to delete old answer for type 4 question ${questionId}`,
						);
					}
				}

				// Type 5: Delete all old ordered answers
				if (
					queTypeId === 5 &&
					Array.isArray(previousAnswer) &&
					previousAnswer.length > 0
				) {
					try {
						await Promise.allSettled(
							previousAnswer.map((answerId) =>
								deleteExamAnswer(userId || 0, examId, questionId, answerId),
							),
						);
					} catch (_error) {
						console.log(
							`Failed to delete old answers for type 5 question ${questionId}`,
						);
					}
				}

				// Type 6: Delete all old matching answers
				if (
					queTypeId === 6 &&
					typeof previousAnswer === "object" &&
					previousAnswer !== null &&
					!Array.isArray(previousAnswer)
				) {
					const oldMatches = previousAnswer as Record<number, number>;
					const oldAnswerIds = Object.values(oldMatches);
					if (oldAnswerIds.length > 0) {
						try {
							await Promise.allSettled(
								oldAnswerIds.map((answerId) =>
									deleteExamAnswer(userId || 0, examId, questionId, answerId),
								),
							);
						} catch (_error) {
							console.log(
								`Failed to delete old answers for type 6 question ${questionId}`,
							);
						}
					}
				}

				// ============================================
				// STEP 2: SAVE NEW ANSWERS BASED ON TYPE
				// ============================================

				// Type 1: Save single-select answer
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

				// Type 2: Save multi-select answers
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

				// Type 3: Save number input answer (answerId + typed value)
				if (
					queTypeId === 3 &&
					typeof answer === "object" &&
					answer !== null &&
					!Array.isArray(answer)
				) {
					const valuesMap = answer as Record<number, string>;
					const entries = Object.entries(valuesMap)
						.map(([k, v]) => [Number(k), v as string] as [number, string])
						.filter(([aid, val]) => aid && aid !== 0 && val.trim() !== "");
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

				// Type 4: Save fill-in-blank answer
				if (
					queTypeId === 4 &&
					typeof answer === "string" &&
					answer.trim() !== ""
				) {
					const type4Answer = examData?.Answers?.find(
						(ans) => ans.question_id === questionId && ans.answer_type === 4,
					);

					await saveExamAnswer(
						userId || 0,
						examId,
						questionId,
						type4Answer?.answer_id || 0,
						queTypeId,
						answer,
						rowNum,
					);
				}

				// Type 5: Save drag-and-drop order
				if (queTypeId === 5 && Array.isArray(answer) && answer.length > 0) {
					await Promise.all(
						answer.map((answerId, index) =>
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

				// Type 6: Save matching answers
				if (
					queTypeId === 6 &&
					typeof answer === "object" &&
					answer !== null &&
					!Array.isArray(answer)
				) {
					const matches = answer as Record<number, number>;
					const entries = Object.entries(matches);
					if (entries.length > 0) {
						await Promise.all(
							entries.map(([qRefIdStr, aRefId]) =>
								saveExamAnswer(
									userId || 0,
									examId,
									questionId,
									aRefId,
									queTypeId,
									qRefIdStr,
									rowNum,
								),
							),
						);
					}
				}

				// Update last saved answer in memory
				lastSavedAnswers.current.set(questionId, answer);
				return true;
			} catch (error) {
				console.error(`Failed to save question ${questionId}:`, error);
				return false;
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

		const BATCH_SIZE = 5;
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

		if (failedSaves.length > 0) {
			setSaveError(
				`${failedSaves.length} хариулт хадгалагдсангүй. Дахин оролдож байна...`,
			);
			setTimeout(() => setSaveError(null), 5000);
		}

		isSavingRef.current = false;
		setIsSaving(false);
	}, [examData, saveQuestion]);

	// ========================
	// AUTO SUBMIT HANDLER - одоо processPendingAnswers тодорхойлогдсоны дараа
	// ========================
	// ========================
	// AUTO SUBMIT HANDLER - ЗАСВАРЛАСАН
	// ========================
	const _handleAutoSubmit = useCallback(async () => {
		// Давхар дуудагдахаас сэргийлэх
		if (hasAutoFinished.current || isAutoSubmitting.current) {
			console.log("⚠️ Auto-submit аль хэдийн явагдаж байна");
			return;
		}

		hasAutoFinished.current = true;
		isAutoSubmitting.current = true;

		console.log("🔴 Цаг дууслаа - Автоматаар дуусгаж байна...");

		try {
			// ✅ STEP 1: Хадгалаагүй хариултуудыг эхлээд хадгална
			if (pendingAnswers.current.size > 0) {
				console.log(
					`💾 ${pendingAnswers.current.size} хариулт хадгалж байна...`,
				);
				await processPendingAnswers();
				console.log("✅ Бүх хариулт хадгалагдлаа");
			}

			// ✅ STEP 2: Exam type шалгаж, зөв параметр дамжуулах
			const examInfo = examData?.ExamInfo?.[0];
			if (!examInfo) {
				console.error("❌ Exam info олдсонгүй");
				return;
			}

			// ✅ STEP 3: Dialog-оор автомат дуусгах
			console.log("📤 Шалгалт дуусгах API дуудаж байна...");
			finishDialogRef.current?.triggerFinish();
		} catch (error) {
			console.error("❌ Auto submit error:", error);
			hasAutoFinished.current = false;
			isAutoSubmitting.current = false;
		}
	}, [processPendingAnswers, examData]);

	const formatTime = (sec: number) => {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = sec % 60;
		return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	const remainingSec = useMemo(() => {
		if (!examData?.ExamInfo?.[0]) return 0;
		const totalSec = examData.ExamInfo[0].minut * 60;
		if (!examData.ExamInfo[0].starteddate) return totalSec;
		const actualStartDate = new Date(examData.ExamInfo[0].starteddate);
		const now = new Date();
		const elapsed = Math.floor(
			(now.getTime() - actualStartDate.getTime()) / 1000,
		);
		return Math.max(0, totalSec - elapsed);
	}, [examData]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentQuestionIndex((prev) => prev);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!examData?.ChoosedAnswer) return;

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

			if (QueType === 1) {
				const lastItem = items[items.length - 1];
				const ansId = lastItem.AnsID ?? null;
				answersMap[QueID] = ansId && ansId !== 0 ? ansId : null;
			} else if (QueType === 2) {
				const uniqueIds = [
					...new Set(
						items
							.map((i) => i.AnsID)
							.filter((id): id is number => id !== null && id !== 0),
					),
				];
				answersMap[QueID] = uniqueIds;
			} else if (QueType === 3) {
				const map: Record<number, string> = {};
				items.forEach((it) => {
					const ansId = it.AnsID ?? 0;
					const val = (it as { Answer?: string }).Answer ?? "";
					if (ansId && ansId !== 0) {
						map[ansId] = val;
					}
				});
				answersMap[QueID] = map;
			} else if (QueType === 4) {
				const lastItem = items[items.length - 1];
				answersMap[QueID] = (lastItem as { Answer?: string }).Answer || "";
			} else if (QueType === 5) {
				const sortedItems = [...items].sort((a, b) => {
					const aOrder = Number((a as { Answer?: string }).Answer) || 999;
					const bOrder = Number((b as { Answer?: string }).Answer) || 999;
					return aOrder - bOrder;
				});
				answersMap[QueID] = sortedItems
					.map((i) => i.AnsID)
					.filter((id): id is number => id !== null && id !== 0);
			} else if (QueType === 6) {
				const matchMap: Record<number, number> = {};
				items.forEach((item) => {
					const qRefId = Number((item as { Answer?: string }).Answer);
					const aRefId = item.AnsID;
					if (qRefId && aRefId) matchMap[qRefId] = aRefId;
				});
				answersMap[QueID] = matchMap;
			}
		});

		setSelectedAnswers(answersMap);
		lastSavedAnswers.current = new Map(
			Object.entries(answersMap).map(([k, v]) => [Number(k), v]),
		);
	}, [examData]);

	const allQuestions = useMemo(() => {
		if (!examData?.Questions || !examData?.Answers) return [];
		return examData.Questions.filter((q) =>
			[1, 2, 3, 4, 5, 6].includes(q.que_type_id),
		).map((q) => ({
			...q,
			question_img: q.question_img || "",
			answers: examData.Answers.filter(
				(a) =>
					a.question_id === q.question_id && a.answer_type === q.que_type_id,
			).map((a) => ({
				...a,
				answer_img: a.answer_img || undefined,
				is_true: false,
			})),
		}));
	}, [examData]);

	const totalCount = allQuestions.length;
	const answeredCount = useMemo(
		() =>
			Object.values(selectedAnswers).filter((ans) => {
				if (Array.isArray(ans)) return ans.length > 0;
				if (typeof ans === "string") return ans.trim() !== "";
				if (typeof ans === "object" && ans !== null)
					return Object.keys(ans).length > 0;
				return typeof ans === "number" && !Number.isNaN(ans) && ans !== 0;
			}).length,
		[selectedAnswers],
	);

	const scheduleAutoSave = useCallback(() => {
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => {
			processPendingAnswers();
		}, AUTO_SAVE_DELAY);
	}, [processPendingAnswers]);

	const handleManualSave = useCallback(() => {
		if (saveTimer.current) clearTimeout(saveTimer.current);
		processPendingAnswers();
	}, [processPendingAnswers]);

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

			setTypingQuestions((prev) => new Set(prev).add(questionId));
			setTimeout(() => {
				setTypingQuestions((prev) => {
					const newSet = new Set(prev);
					newSet.delete(questionId);
					return newSet;
				});
			}, 1500);

			setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
			pendingAnswers.current.set(questionId, {
				questionId,
				answer,
				queTypeId,
				rowNum,
				timestamp: Date.now(),
			});

			scheduleAutoSave();
		},
		[examData, scheduleAutoSave, areAnswersEqual],
	);

	useEffect(
		() => () => {
			if (saveTimer.current) clearTimeout(saveTimer.current);
			if (pendingAnswers.current.size > 0) processPendingAnswers();
		},
		[processPendingAnswers],
	);

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
		if (element && window.innerWidth >= 1024)
			element.scrollIntoView({ behavior: "smooth", block: "center" });
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
			const isAnswered =
				(Array.isArray(answer) && answer.length > 0) ||
				(typeof answer === "string" && answer.trim() !== "") ||
				(typeof answer === "number" && !Number.isNaN(answer) && answer !== 0) ||
				(typeof answer === "object" &&
					answer !== null &&
					Object.keys(answer).length > 0);
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

	const renderQuestion = (q: (typeof allQuestions)[0]) => {
		if (q.que_type_id === 1) {
			return (
				<>
					{q.question_img && (
						<QuestionImage src={q.question_img} alt="Асуултын зураг" />
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

		if (
			q.que_type_id === 2 ||
			q.que_type_id === 3 ||
			q.que_type_id === 4 ||
			q.que_type_id === 6
		) {
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
							onAnswerChange={
								(qId, values) => handleAnswerChange(qId, values as AnswerValue) // ✅ Type assertion
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
								(selectedAnswers[q.question_id] as Record<number, number>) || {}
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
	};

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
			{/* Exam Proctor - Зөрчил хянагч */}
			{/* <AdvancedExamProctor
				maxViolations={3}
				strictMode={true}
				enableFullscreen={true}
				onSubmit={handleAutoSubmit}
				onLogout={() => {
					console.log("Хэрэглэгч гарлаа");
				}}
			/> */}

			{saveError && (
				<div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
					{saveError}
				</div>
			)}

			{/* Desktop Layout */}
			<div className="hidden lg:block">
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
											<div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-semibold">
												{index + 1}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2 mb-4">
													<div className="font-semibold text-lg flex-1 leading-relaxed prose prose-sm max-w-none">
														{parse(q.question_name)}
													</div>
													<div className="flex items-center gap-2 flex-shrink-0">
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
								<>
									{/* 🔍 DEBUG LOG - Console дээр харах */}
									{console.log("📊 ExamTimer Props:", {
										examId: examData.ExamInfo[0].id,
										startedDate: examData.ExamInfo[0].starteddate,
										examMinutes: examData.ExamInfo[0].minut,
										examStartTime: examData.ExamInfo[0].ognoo,
									})}

									<ExamTimer
										examStartTime={examData.ExamInfo[0].ognoo}
										examEndTime={examData.ExamInfo[0].end_time}
										examMinutes={examData.ExamInfo[0].minut}
										startedDate={examData.ExamInfo[0].starteddate}
										onTimeUp={(timeUp) => setIsTimeUp(timeUp)}
										onAutoFinish={() =>
											finishDialogRef.current?.triggerFinish()
										}
									/>
								</>
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
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<div className="w-7 h-7 rounded-md bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
										<Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
									</div>
									<div>
										<div className="text-lg font-black text-green-600 dark:text-green-400 leading-none">
											{formatTime(remainingSec)}
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
									className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
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
									<div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
										{currentQuestionIndex + 1}
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-semibold leading-relaxed prose prose-sm max-w-none text-sm">
											{parse(currentQuestion.question_name)}
										</div>
									</div>
									<div className="flex items-center gap-2 flex-shrink-0">
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
											className="flex-shrink-0 h-9 w-9"
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
