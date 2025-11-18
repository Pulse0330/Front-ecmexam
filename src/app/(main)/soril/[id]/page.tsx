"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FinishExamResultDialog from "@/app/exam/component/finish";
import ExamMinimap from "@/app/exam/component/minimap";
import FillInTheBlankQuestion from "@/app/exam/component/question/fillblank";
import MultiSelectQuestion from "@/app/exam/component/question/multiselect";
import DragAndDropQuestion from "@/app/exam/component/question/order";
import SingleSelectQuestion from "@/app/exam/component/question/singleSelect";
import FixedScrollButton from "@/components/FixedScrollButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteExamAnswer, getExamById, saveExamAnswer } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AnswerValue } from "@/types/exam/exam";

export default function SorilPage() {
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
			}
		});

		setSelectedAnswers(answersMap);
	}, [examData]);

	const allQuestions = useMemo(() => {
		if (!examData?.Questions || !examData?.Answers) return [];
		return examData.Questions.filter((q) =>
			[1, 2, 4, 5].includes(q.que_type_id),
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

	const saveAnswerMutation = useMutation({
		mutationFn: async (params: {
			questionId: number;
			answerId: number;
			queTypeId: number;
			answerText: string;
			rowNum: number;
		}) => {
			if (!examData?.ExamInfo?.[0]?.id) throw new Error("Exam ID олдсонгүй");
			const { questionId, answerId, queTypeId, answerText, rowNum } = params;
			await saveExamAnswer(
				userId || 0,
				examData.ExamInfo[0].id,
				questionId,
				answerId,
				queTypeId,
				answerText,
				rowNum,
			);
			return { questionId, success: true };
		},
		onMutate: (params) =>
			setSavingQuestions((prev) => new Set(prev).add(params.questionId)),
		onSuccess: (data) =>
			setSavingQuestions((prev) => {
				const newSet = new Set(prev);
				newSet.delete(data.questionId);
				return newSet;
			}),
		onError: (err, params) => {
			console.error("❌ Хадгалахад алдаа:", err);
			setSavingQuestions((prev) => {
				const newSet = new Set(prev);
				newSet.delete(params.questionId);
				return newSet;
			});
			setSaveError("Хариултыг хадгалахад алдаа гарлаа.");
			setTimeout(() => setSaveError(null), 5000);
		},
	});

	const handleAnswerChange = useCallback(
		async (questionId: number, answer: AnswerValue) => {
			if (!examData) return;
			const question = examData.Questions.find(
				(q) => q.question_id === questionId,
			);
			if (!question) return;

			const rowNum = Number(question.row_num);
			const queTypeId = question.que_type_id;
			const examId = examData?.ExamInfo?.[0]?.id;

			if (queTypeId === 1 && answer === null) {
				const oldAnswer = selectedAnswers[questionId] as number | null;
				if (oldAnswer && oldAnswer !== 0 && examId) {
					deleteExamAnswer(userId || 0, examId, questionId, oldAnswer).catch(
						() => {
							setSaveError("Хариултыг устгахад алдаа.");
							setTimeout(() => setSaveError(null), 5000);
						},
					);
				}
				setSelectedAnswers((prev) => ({ ...prev, [questionId]: null }));
				return;
			}

			if (
				(queTypeId === 2 || queTypeId === 5) &&
				Array.isArray(answer) &&
				answer.length === 0
			) {
				const oldAnswers = (selectedAnswers[questionId] as number[]) || [];
				if (oldAnswers.length > 0 && examId) {
					Promise.all(
						oldAnswers.map((id) =>
							deleteExamAnswer(userId || 0, examId, questionId, id),
						),
					).catch(() => {
						setSaveError("Хариултуудыг устгахад алдаа.");
						setTimeout(() => setSaveError(null), 5000);
					});
				}
				setSelectedAnswers((prev) => ({ ...prev, [questionId]: [] }));
				return;
			}

			setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));

			if (queTypeId === 1 && typeof answer === "number") {
				saveAnswerMutation.mutate({
					questionId,
					answerId: answer,
					queTypeId,
					answerText: "",
					rowNum,
				});
			} else if (queTypeId === 2 && Array.isArray(answer)) {
				const oldAnswers = (selectedAnswers[questionId] as number[]) || [];
				const addedAnswers = answer.filter((id) => !oldAnswers.includes(id));
				const removedAnswers = oldAnswers.filter((id) => !answer.includes(id));
				if (removedAnswers.length > 0 && examId) {
					removedAnswers.forEach((answerId) => {
						deleteExamAnswer(userId || 0, examId, questionId, answerId).catch(
							() => {
								setSaveError("Хариулт устгахад алдаа.");
								setTimeout(() => setSaveError(null), 5000);
							},
						);
					});
				}
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
				if (debounceTimers.current[questionId])
					clearTimeout(debounceTimers.current[questionId]);
				debounceTimers.current[questionId] = setTimeout(() => {
					saveAnswerMutation.mutate({
						questionId,
						answerId: 0,
						queTypeId,
						answerText: answer,
						rowNum,
					});
					delete debounceTimers.current[questionId];
				}, 1000);
			} else if (queTypeId === 5 && Array.isArray(answer)) {
				const oldAnswers = (selectedAnswers[questionId] as number[]) || [];
				if (oldAnswers.length > 0 && examId) {
					await Promise.all(
						oldAnswers.map((answerId) =>
							deleteExamAnswer(userId || 0, examId, questionId, answerId),
						),
					).catch(() => {});
				}
				for (let i = 0; i < answer.length; i++) {
					await saveAnswerMutation.mutateAsync({
						questionId,
						answerId: answer[i],
						queTypeId,
						answerText: (i + 1).toString(),
						rowNum,
					});
				}
			}
		},
		[examData, selectedAnswers, userId, saveAnswerMutation],
	);

	useEffect(
		() => () => Object.values(debounceTimers.current).forEach(clearTimeout),
		[],
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
					<p className="text-xl font-medium ">Энэ шалгалтад асуулт байхгүй</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ">
			{saveError && (
				<div className="fixed top-4 right-4 z-5 px-6 py-3 rounded-lg shadow-lg">
					{saveError}
				</div>
			)}

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

					<main className="col-span-4 space-y-5">
						{allQuestions.map((q, index) => (
							<div key={q.question_id} id={`question-${index}`}>
								<Card className={getCardBorderClass(q.question_id)}>
									<CardContent className="p-6">
										<div className="flex gap-4">
											<div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-semibold ">
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
												) : q.que_type_id === 5 ? (
													<DragAndDropQuestion
														questionId={q.question_id}
														examId={examData?.ExamInfo?.[0]?.id}
														userId={userId || 0}
														answers={q.answers.map((a) => ({
															answer_id: a.answer_id,
															answer_name_html:
																a.answer_name_html || a.answer_name || "",
														}))}
														mode="exam"
														userAnswers={
															(selectedAnswers[q.question_id] as number[]) || []
														}
														onOrderChange={(orderedIds) =>
															handleAnswerChange(q.question_id, orderedIds)
														}
													/>
												) : null}
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						))}
					</main>
				</div>
			</div>

			<div className="lg:hidden p-4 space-y-4">
				<Card className="sticky top-0 z-10 shadow-md ">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="text-sm font-medium">
								{answeredCount} / {totalCount} хариулсан
							</div>
						</div>
					</CardContent>
				</Card>

				{allQuestions.map((q, index) => (
					<Card
						key={q.question_id}
						className={getCardBorderClass(q.question_id)}
					>
						<CardContent className="p-4">
							<div className="flex items-start gap-3 mb-4">
								<div className="flex-shrink-0 w-10 h-10  rounded-lg flex items-center justify-center font-semibold ">
									{index + 1}
								</div>
								<h2 className="font-semibold flex-1 leading-relaxed">
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
										className="flex-shrink-0"
									>
										{bookmarkedQuestions.has(q.question_id) ? (
											<BookmarkCheck className="w-5 h-5 text-yellow-500 fill-yellow-500" />
										) : (
											<Bookmark className="w-5 h-5" />
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
									value={(selectedAnswers[q.question_id] as string) || ""}
									mode="exam"
									onAnswerChange={handleAnswerChange}
								/>
							) : q.que_type_id === 5 ? (
								<DragAndDropQuestion
									questionId={q.question_id}
									examId={examData?.ExamInfo?.[0]?.id}
									userId={userId || 0}
									answers={q.answers.map((a) => ({
										answer_id: a.answer_id,
										answer_name_html: a.answer_name_html || a.answer_name || "",
									}))}
									mode="exam"
									userAnswers={
										(selectedAnswers[q.question_id] as number[]) || []
									}
									onOrderChange={(orderedIds) =>
										handleAnswerChange(q.question_id, orderedIds)
									}
								/>
							) : null}
						</CardContent>
					</Card>
				))}

				{examData?.ExamInfo?.[0] && (
					<div className="pb-4">
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

			<FixedScrollButton />
		</div>
	);
}
