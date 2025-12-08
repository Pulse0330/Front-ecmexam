"use client";

import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { gettTestFill } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamFinishResponse } from "@/types/exercise/testGetFill";
import FillInTheBlankQuestion from "./component/fillinblank";
import MatchingByLine from "./component/matching";
import MultiSelectQuestion from "./component/multiselect";
import DragAndDropWrapper from "./component/order";
import SingleSelectQuestion from "./component/singleselect";

interface SelectedAnswer {
	questionId: number;
	answerIds: number[];
	textAnswer?: string;
	matches?: Record<number, number>;
	order?: number[];
}

export default function ExercisePage() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswer[]>([]);
	const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(
		new Set(),
	);

	const { data, isLoading, isError, error } = useQuery<ExamFinishResponse>({
		queryKey: ["testFill", userId],
		queryFn: () => gettTestFill(userId || 0),
		enabled: !!userId,
	});

	// Debug logging
	console.log("📊 Raw data:", data);
	console.log("📝 Questions count:", data?.Questions?.length);
	console.log("📋 All questions:", data?.Questions);
	console.log("📋 All answers:", data?.Answers?.length);

	// Type별 통계
	if (data?.Questions) {
		const typeStats = data.Questions.reduce(
			(acc, q) => {
				acc[q.que_type_id] = (acc[q.que_type_id] || 0) + 1;
				return acc;
			},
			{} as Record<number, number>,
		);
		console.log("📊 Question types:", typeStats);
	}

	if (!userId) {
		return (
			<div className="min-h-screen bg-page-linear">
				<div className="bg-page-gradent rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						Нэвтрэх шаардлагатай
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Энэ хуудсыг үзэхийн тулд эхлээд нэвтэрнэ үү.
					</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4" />
					<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
						Дасгал ачааллаж байна...
					</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						Алдаа гарлаа
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						{(error as Error).message}
					</p>
				</div>
			</div>
		);
	}

	const examInfo = data?.ExamInfo?.[0];
	const questions = data?.Questions || [];
	const answers = data?.Answers || [];
	const choosedAnswers = data?.ChoosedAnswer || [];

	if (!examInfo || questions.length === 0) {
		return (
			<div className="min-h-screen bg-page-linear flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 max-w-md w-full text-center">
					<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						Дасгал олдсонгүй
					</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						Эхлээд тестийн бүлгээс тест сонгоно уу.
					</p>
					<Button
						onClick={() => router.push("/Lists/testGroup")}
						className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
					>
						Тест сонгох
					</Button>
				</div>
			</div>
		);
	}

	const getQuestionAnswers = (questionId: number) => {
		return answers.filter((a) => a.question_id === questionId);
	};

	const getSelectedAnswer = (questionId: number) => {
		return selectedAnswers.find((a) => a.questionId === questionId);
	};

	const isAnswerCorrect = (answerId: number) => {
		const answer = answers.find((a) => a.answer_id === answerId);
		return answer?.is_true === 1;
	};

	const getBodolt = (questionId: number) => {
		return choosedAnswers.find((c) => c.question_id === questionId);
	};

	const getQuestionTypeName = (typeId: number) => {
		switch (typeId) {
			case 1:
				return "Нэг сонголттой";
			case 2:
				return "Олон сонголттой";
			case 4:
				return "Нөхөх";
			case 5:
				return "Дараалал";
			case 6:
				return "Хослуулах";
			default:
				return `Тодорхойгүй (${typeId})`;
		}
	};

	const getTypeColor = (typeId: number) => {
		switch (typeId) {
			case 1:
				return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
			case 2:
				return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800";
			case 4:
				return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800";
			case 5:
				return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800";
			case 6:
				return "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800";
			default:
				return "bg-gray-100 bg-page-linear text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800";
		}
	};

	const handleSingleSelect = (questionId: number, answerId: number | null) => {
		setSelectedAnswers((prev) => {
			const existing = prev.find((a) => a.questionId === questionId);
			if (existing) {
				return prev.map((a) =>
					a.questionId === questionId
						? { ...a, answerIds: answerId ? [answerId] : [] }
						: a,
				);
			}
			return answerId ? [...prev, { questionId, answerIds: [answerId] }] : prev;
		});
	};

	const handleMultiSelect = (questionId: number, answerIds: number[]) => {
		setSelectedAnswers((prev) => {
			const existing = prev.find((a) => a.questionId === questionId);
			if (existing) {
				return prev.map((a) =>
					a.questionId === questionId ? { ...a, answerIds } : a,
				);
			}
			return [...prev, { questionId, answerIds }];
		});
	};

	const handleFillInBlank = (questionId: number, text: string) => {
		setSelectedAnswers((prev) => {
			const existing = prev.find((a) => a.questionId === questionId);
			if (existing) {
				return prev.map((a) =>
					a.questionId === questionId ? { ...a, textAnswer: text } : a,
				);
			}
			return [...prev, { questionId, answerIds: [], textAnswer: text }];
		});
	};

	const handleOrdering = (questionId: number, orderedIds: number[]) => {
		setSelectedAnswers((prev) => {
			const existing = prev.find((a) => a.questionId === questionId);
			if (existing) {
				return prev.map((a) =>
					a.questionId === questionId ? { ...a, order: orderedIds } : a,
				);
			}
			return [...prev, { questionId, answerIds: [], order: orderedIds }];
		});
	};

	const handleMatching = (
		questionId: number,
		matches: Record<number, number>,
	) => {
		setSelectedAnswers((prev) => {
			const existing = prev.find((a) => a.questionId === questionId);
			if (existing) {
				return prev.map((a) =>
					a.questionId === questionId ? { ...a, matches } : a,
				);
			}
			return [...prev, { questionId, answerIds: [], matches }];
		});
	};

	const handleSubmitQuestion = (questionId: number) => {
		const selected = selectedAnswers.find((a) => a.questionId === questionId);
		if (
			selected &&
			(selected.order?.length || Object.keys(selected.matches || {}).length)
		) {
			setSubmittedQuestions((prev) => new Set(prev).add(questionId));
		}
	};

	const renderQuestion = (
		question: {
			question_id: number;
			que_type_id: number;
			question_name: string;
			que_onoo: number;
		},
		index: number,
	) => {
		const questionAnswers = getQuestionAnswers(question.question_id);
		const selected = getSelectedAnswer(question.question_id);
		const bodolt = getBodolt(question.question_id);
		const isSubmitted = submittedQuestions.has(question.question_id);
		const questionType = Number(question.que_type_id);

		// Debug each question
		console.log(`Question ${index + 1}:`, {
			id: question.question_id,
			type: questionType,
			typeName: getQuestionTypeName(questionType),
			answersCount: questionAnswers.length,
			answers: questionAnswers.slice(0, 3), // Эхний 3 хариулт
		});

		// Type 6-д зориулсан нэмэлт debug
		if (questionType === 6) {
			console.log(`🔍 Type 6 Question ${question.question_id}:`, {
				totalAnswers: questionAnswers.length,
				uniqueRefIds: [...new Set(questionAnswers.map((a) => a.refid))],
				sampleAnswers: questionAnswers.slice(0, 5),
			});
		}

		// 🔥 EXAM PAGE-ийн адил format
		const convertedAnswers = questionAnswers.map((a) => ({
			answer_id: a.answer_id,
			question_id: a.question_id,
			answer_name: a.answer_name || "",
			answer_name_html: a.answer_name_html,
			answer_descr: a.answer_descr || "",
			answer_img: a.answer_img || undefined,
			answer_type: a.answer_type,
			refid: a.refid,
			ref_child_id: a.ref_child_id || null,
			is_true: a.is_true === 1,
		}));

		const showAnswerFeedback =
			((questionType === 1 || questionType === 2 || questionType === 4) &&
				selected) ||
			((questionType === 5 || questionType === 6) && isSubmitted);

		return (
			<div
				key={question.question_id}
				className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border-2 border-gray-100 dark:border-gray-700"
			>
				{/* Question Header
				 */}
				<div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
					<div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm sm:text-lg shadow-lg">
						{index + 1}
					</div>
					<div className="flex-1 min-w-0">
						<div className="text-base sm:text-lg md:text-xl text-gray-900 dark:text-white font-semibold mb-3">
							{parse(question.question_name)}
						</div>
						<div className="flex flex-wrap items-center gap-2 sm:gap-3">
							<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
								Оноо: {question.que_onoo}
							</span>
							<span
								className={`text-xs sm:text-sm px-3 py-1 rounded-full border ${getTypeColor(questionType)}`}
							>
								{getQuestionTypeName(questionType)}
							</span>
						</div>
					</div>
				</div>

				{/* Question Content */}
				<div className="ml-0 sm:ml-14 space-y-4">
					{/* Type 1: Single Select - EXAM-тай яг ижил */}
					{questionType === 1 && (
						<>
							<SingleSelectQuestion
								questionId={question.question_id}
								questionText={question.question_name}
								answers={convertedAnswers}
								mode="exam"
								selectedAnswer={selected?.answerIds[0] || null}
								onAnswerChange={handleSingleSelect}
							/>

							{showAnswerFeedback && selected && (
								<div className="mt-4 space-y-3">
									{selected.answerIds.some((id) => isAnswerCorrect(id)) ? (
										<div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg">
											<p className="text-green-800 dark:text-green-300 font-semibold text-sm sm:text-base flex items-center gap-2">
												✓ Зөв хариулт!
											</p>
											{bodolt && (
												<div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
													<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
														📝 Тайлбар:
													</p>
													<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
														{parse(bodolt.descr)}
													</div>
												</div>
											)}
										</div>
									) : (
										<div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg space-y-3">
											<p className="text-red-800 dark:text-red-300 font-semibold text-sm sm:text-base flex items-center gap-2">
												✗ Буруу хариулт
											</p>

											<div className="pt-3 border-t border-red-200 dark:border-red-800">
												<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
													✓ Зөв хариулт:
												</p>
												<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
													{questionAnswers
														.filter((a) => a.is_true === 1)
														.map((correctAnswer) => (
															<div
																key={correctAnswer.answer_id}
																className="text-sm text-green-800 dark:text-green-300 font-medium"
															>
																{parse(correctAnswer.answer_name_html)}
															</div>
														))}
												</div>
											</div>

											{bodolt && (
												<div className="pt-3 border-t border-red-200 dark:border-red-800">
													<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
														📝 Бодолт:
													</p>
													<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
														{parse(bodolt.descr)}
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</>
					)}

					{/* Type 2: Multi Select - EXAM-тай ижил */}
					{questionType === 2 && (
						<>
							<MultiSelectQuestion
								questionId={question.question_id}
								questionText={question.question_name}
								answers={convertedAnswers}
								mode="exam"
								selectedAnswers={selected?.answerIds || []}
								onAnswerChange={handleMultiSelect}
							/>

							{showAnswerFeedback && selected && (
								<div className="mt-4">
									<div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-3 sm:p-4 rounded-lg">
										<p className="text-purple-800 dark:text-purple-300 font-semibold text-sm sm:text-base">
											Таны сонголт хадгалагдсан: {selected.answerIds.length}{" "}
											хариулт
										</p>
									</div>
								</div>
							)}
						</>
					)}

					{/* Type 4: Fill in Blank - EXAM-тай ижил */}
					{questionType === 4 && (
						<>
							<FillInTheBlankQuestion
								questionId={question.question_id}
								questionText={question.question_name}
								value={selected?.textAnswer || ""}
								mode="exam"
								onAnswerChange={handleFillInBlank}
							/>

							{showAnswerFeedback && selected?.textAnswer && (
								<div className="mt-4">
									<div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-3 sm:p-4 rounded-lg">
										<p className="text-orange-800 dark:text-orange-300 font-semibold text-sm sm:text-base">
											Таны хариулт хадгалагдсан: "{selected.textAnswer}"
										</p>
									</div>
								</div>
							)}
						</>
					)}

					{/* Type 5: Ordering - EXAM page адил */}
					{questionType === 5 && (
						<>
							<DragAndDropWrapper
								questionId={question.question_id}
								answers={convertedAnswers.map((a) => ({
									answer_id: a.answer_id,
									answer_name_html: a.answer_name_html || a.answer_name,
								}))}
								mode={isSubmitted ? "review" : "exam"}
								userAnswers={selected?.order || []}
								correctAnswers={convertedAnswers
									.sort((a, b) => a.refid - b.refid)
									.map((a) => a.answer_id)}
								onOrderChange={(orderedIds) =>
									handleOrdering(question.question_id, orderedIds)
								}
							/>

							{!isSubmitted && selected?.order && selected.order.length > 0 && (
								<div className="mt-4">
									<Button
										onClick={() => handleSubmitQuestion(question.question_id)}
										className="w-full sm:w-auto bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
									>
										Хариултаа илгээх
									</Button>
								</div>
							)}
						</>
					)}

					{/* Type 6: Matching - EXAM page адил */}
					{questionType === 6 && (
						<>
							<MatchingByLine
								answers={convertedAnswers.map((a) => ({
									...a,
									answer_img: a.answer_img || null, // Matching-д null хэрэгтэй
								}))}
								mode={isSubmitted ? "review" : "exam"}
								userAnswers={selected?.matches || {}}
								onMatchChange={(matches) =>
									handleMatching(question.question_id, matches)
								}
							/>

							{!isSubmitted &&
								selected?.matches &&
								Object.keys(selected.matches).length > 0 && (
									<div className="mt-4">
										<Button
											onClick={() => handleSubmitQuestion(question.question_id)}
											className="w-full sm:w-auto bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
										>
											Хариултаа илгээх
										</Button>
									</div>
								)}
						</>
					)}

					{/* Warning: Unknown question type */}
					{![1, 2, 4, 5, 6].includes(questionType) && (
						<div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
							<p className="text-red-800 dark:text-red-300 font-semibold text-sm">
								⚠️ Тодорхойгүй асуултын төрөл: {questionType}
							</p>
							<pre className="text-xs mt-2 overflow-auto text-red-700 dark:text-red-400">
								{JSON.stringify(question, null, 2)}
							</pre>
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen  bg-page-linear py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto">
				{/* Sticky Header */}
				<div className="sticky top-0 z-10  bg-page-linear pb-4 mb-2">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
							{examInfo.title}
						</h1>
						<Button
							variant="ghost"
							onClick={() => router.push("/Lists/exerciseList")}
							className="self-start sm:self-auto"
						>
							← Буцах
						</Button>
					</div>
					<div className="flex flex-wrap items-center gap-2 sm:gap-4">
						<span className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm border border-blue-200 dark:border-blue-800">
							{examInfo.exam_type_name}
						</span>
						<span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
							{questions.length} асуулт
						</span>
						<span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
							• {selectedAnswers.length} хариулт өгсөн
						</span>
					</div>
				</div>

				<div className="space-y-4 sm:space-y-6 md:space-y-8">
					{questions.map((question, index) => renderQuestion(question, index))}
				</div>

				<div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
					<Button
						variant="outline"
						onClick={() => router.push("/Lists/exerciseList")}
						className="flex-1 sm:flex-initial"
					>
						Буцах
					</Button>
				</div>
			</div>
		</div>
	);
}
