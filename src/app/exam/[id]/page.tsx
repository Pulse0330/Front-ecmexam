"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FinishExamResultDialog from "@/app/exam/component/finish";
import ExamMinimap from "@/app/exam/component/minimap";
import FillInTheBlankQuestion from "@/app/exam/component/question/fillblank";
import MultiSelectQuestion from "@/app/exam/component/question/multiselect";
import SingleSelectQuestion from "@/app/exam/component/question/singleSelect";
import FixedScrollButton from "@/components/FixedScrollButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteExamAnswer, getExamById, saveExamAnswer } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AnswerValue } from "@/types/exam/exam";
import ExamTimer from "../component/Itime";

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
	const [savingQuestions, setSavingQuestions] = useState<Set<number>>(
		new Set(),
	);

	// Debounce timer for fill-in-the-blank questions
	const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

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

	// Load previous answers
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
				// Single select
				const lastItem = items[items.length - 1];
				const ansId = lastItem.AnsID ?? null;
				answersMap[QueID] = ansId && ansId !== 0 ? ansId : null;
			} else if (QueType === 2) {
				// Multi select
				const uniqueIds = [
					...new Set(
						items
							.map((i) => i.AnsID)
							.filter((id): id is number => id != null && id !== 0),
					),
				];
				answersMap[QueID] = uniqueIds;
			} else if (QueType === 4) {
				// Fill in the blank
				const lastItem = items[items.length - 1];
				answersMap[QueID] = (lastItem as { Answer?: string }).Answer || "";
			}
		});

		setSelectedAnswers(answersMap);
	}, [examData]);

	const allQuestions = useMemo(() => {
		if (!examData?.Questions || !examData?.Answers) return [];

		return examData.Questions.filter(
			(q) => q.que_type_id === 1 || q.que_type_id === 2 || q.que_type_id === 4,
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
	}, [examData?.Questions, examData?.Answers]);

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

	const saveAnswerMutation = useMutation({
		mutationFn: async (params: {
			questionId: number;
			answerId: number;
			queTypeId: number;
			answerText: string;
			rowNum: number;
		}) => {
			if (!examData?.ExamInfo?.[0]?.id) {
				throw new Error("Exam ID олдсонгүй");
			}

			const { questionId, answerId, queTypeId, answerText, rowNum } = params;
			const examId = examData.ExamInfo[0].id;

			await saveExamAnswer(
				userId || 0,
				examId,
				questionId,
				answerId,
				queTypeId,
				answerText,
				rowNum,
			);

			return { questionId, success: true };
		},
		onMutate: (params) => {
			setSavingQuestions((prev) => new Set(prev).add(params.questionId));
		},
		onSuccess: (data) => {
			setSavingQuestions((prev) => {
				const newSet = new Set(prev);
				newSet.delete(data.questionId);
				return newSet;
			});
		},
		onError: (err, params) => {
			console.error("❌ Хадгалахад алдаа гарлаа:", err);
			setSavingQuestions((prev) => {
				const newSet = new Set(prev);
				newSet.delete(params.questionId);
				return newSet;
			});
			setSaveError("Хариултыг хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
			setTimeout(() => setSaveError(null), 5000);
		},
	});

	const handleAnswerChange = useCallback(
		(questionId: number, answer: AnswerValue) => {
			if (!examData) return;

			const question = examData.Questions.find(
				(q) => q.question_id === questionId,
			);
			if (!question) return;

			const rowNum = Number(question.row_num);
			const queTypeId = question.que_type_id;
			const examId = examData?.ExamInfo?.[0]?.id;

			// Handle single-select deselection
			if (queTypeId === 1 && answer === null) {
				const oldAnswer = selectedAnswers[questionId] as number | null;
				if (oldAnswer && oldAnswer !== 0 && examId) {
					deleteExamAnswer(userId || 0, examId, questionId, oldAnswer).catch(
						(err) => {
							console.error("Delete error:", err);
							setSaveError("Хариултыг устгахад алдаа гарлаа.");
							setTimeout(() => setSaveError(null), 5000);
						},
					);
				}
				setSelectedAnswers((prev) => ({ ...prev, [questionId]: null }));
				return;
			}

			// Handle multi-select clear all
			if (queTypeId === 2 && Array.isArray(answer) && answer.length === 0) {
				const oldAnswers = (selectedAnswers[questionId] as number[]) || [];
				if (oldAnswers.length > 0 && examId) {
					Promise.all(
						oldAnswers.map((id) =>
							deleteExamAnswer(userId || 0, examId, questionId, id),
						),
					).catch((err) => {
						console.error("Delete error:", err);
						setSaveError("Хариултуудыг устгахад алдаа гарлаа.");
						setTimeout(() => setSaveError(null), 5000);
					});
				}
				setSelectedAnswers((prev) => ({ ...prev, [questionId]: [] }));
				return;
			}

			// Optimistic update
			setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));

			// Save to backend
			if (queTypeId === 1 && typeof answer === "number") {
				// Single select
				saveAnswerMutation.mutate({
					questionId,
					answerId: answer,
					queTypeId,
					answerText: "",
					rowNum,
				});
			} else if (queTypeId === 2 && Array.isArray(answer)) {
				// Multi select - save each answer individually
				const oldAnswers = (selectedAnswers[questionId] as number[]) || [];
				const newAnswers = answer;

				// Find added and removed answers
				const addedAnswers = newAnswers.filter(
					(id) => !oldAnswers.includes(id),
				);
				const removedAnswers = oldAnswers.filter(
					(id) => !newAnswers.includes(id),
				);

				// Delete removed answers
				if (removedAnswers.length > 0 && examId) {
					removedAnswers.forEach((answerId) => {
						deleteExamAnswer(userId || 0, examId, questionId, answerId).catch(
							(err) => {
								console.error("Delete error:", err);
								setSaveError("Хариулт устгахад алдаа гарлаа.");
								setTimeout(() => setSaveError(null), 5000);
							},
						);
					});
				}

				// Save each added answer
				addedAnswers.forEach((answerId) => {
					saveAnswerMutation.mutate({
						questionId,
						answerId,
						queTypeId,
						answerText: "",
						rowNum,
					});
				});
			} else if (queTypeId === 4 && typeof answer === "string") {
				// Fill in the blank with debouncing
				// Clear existing timer
				if (debounceTimers.current[questionId]) {
					clearTimeout(debounceTimers.current[questionId]);
				}

				// Set new timer
				debounceTimers.current[questionId] = setTimeout(() => {
					saveAnswerMutation.mutate({
						questionId,
						answerId: 0,
						queTypeId,
						answerText: answer,
						rowNum,
					});
					delete debounceTimers.current[questionId];
				}, 1000); // 1 second debounce
			}
		},
		[examData, selectedAnswers, userId, saveAnswerMutation],
	);

	// Cleanup debounce timers on unmount
	useEffect(() => {
		return () => {
			Object.values(debounceTimers.current).forEach(clearTimeout);
		};
	}, []);

	const toggleBookmark = useCallback((questionId: number) => {
		setBookmarkedQuestions((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(questionId)) {
				newSet.delete(questionId);
			} else {
				newSet.add(questionId);
			}
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

			if (isAnswered && isBookmarked)
				return "border-2 border-amber-500 shadow-sm";
			if (isAnswered) return "border-2 border-blue-600 shadow-sm";
			if (isBookmarked) return "border-2 border-amber-400 shadow-sm";
			return "border border-gray-200";
		},
		[selectedAnswers, bookmarkedQuestions],
	);

	// Loading state
	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center p-8">
					<Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-lg font-medium text-gray-600">
						Шалгалт ачааллаж байна...
					</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !examData) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-md">
					<p className="text-xl font-medium text-red-600 mb-2">Алдаа гарлаа</p>
					<p className="text-sm text-red-500">
						{error?.message || "Шалгалт олдсонгүй эсвэл ачаалахад алдаа гарлаа"}
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

	// No questions state
	if (allQuestions.length === 0) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center p-8 bg-yellow-50 rounded-xl border border-yellow-200">
					<p className="text-xl font-medium text-yellow-600">
						Энэ шалгалтад асуулт байхгүй байна
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ">
			{/* Error notification */}
			{saveError && (
				<div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-top">
					{saveError}
				</div>
			)}

			{/* Desktop Layout */}
			<div className="hidden lg:block">
				<div className="grid grid-cols-6 gap-6 max-w-[1800px] mx-auto p-6 xl:p-8">
					{/* Left Sidebar - Minimap */}
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
							{examData?.ExamInfo?.[0] && (
								<div className="pt-6 flex justify-center">
									<FinishExamResultDialog
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

					{/* Main Content - Questions */}
					<main className="col-span-4 space-y-5">
						{allQuestions.map((q, index) => (
							<div key={q.question_id} id={`question-${index}`}>
								<Card className={getCardBorderClass(q.question_id)}>
									<CardContent className="p-6">
										<div className="flex gap-4">
											<div className="flex-shrink-0 w-12 h-12  rounded-lg flex items-center justify-center font-semibold text-gray-700">
												{index + 1}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2 mb-4">
													<h2 className="font-semibold text-lg flex-1 leading-relaxed">
														{q.question_name}
													</h2>
													<div className="flex items-center gap-2 flex-shrink-0">
														{savingQuestions.has(q.question_id) && (
															<Loader2 className="w-4 h-4 animate-spin text-blue-600" />
														)}
														<Button
															variant="ghost"
															size="icon"
															onClick={() => toggleBookmark(q.question_id)}
															className="hover:bg-gray-100 transition-colors"
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

												{q.que_type_id === 1 ? (
													<SingleSelectQuestion
														questionId={q.question_id}
														questionText={q.question_name}
														answers={q.answers}
														mode="exam"
														selectedAnswer={
															selectedAnswers[q.question_id] as number | null
														}
														onAnswerChange={handleAnswerChange}
													/>
												) : q.que_type_id === 2 ? (
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
												) : q.que_type_id === 4 ? (
													<FillInTheBlankQuestion
														questionId={q.question_id}
														questionText={q.question_name}
														value={
															(selectedAnswers[q.question_id] as string) || ""
														}
														mode="exam"
														onAnswerChange={handleAnswerChange}
													/>
												) : null}
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						))}
					</main>

					{/* Right Sidebar - Timer */}
					<aside className="col-span-1">
						<div className="sticky top-6">
							<Card>
								<CardContent className="p-4">
									{examData?.ExamInfo?.[0] && (
										<ExamTimer
											initialSeconds={examData.ExamInfo[0].minut * 60 || 300}
										/>
									)}
								</CardContent>
							</Card>
						</div>
					</aside>
				</div>
			</div>

			<FixedScrollButton />
		</div>
	);
}
