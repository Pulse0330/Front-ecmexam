"use client";

import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { gettTestFill } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamFinishResponse } from "@/types/exercise/testGetFill";
import FillInTheBlankQuestion from "./component/fillinblank";
import NumberInputQuestion from "./component/inutNumber";
import MatchingByLine from "./component/matching";
import MultiSelectQuestion from "./component/multiselect";
import DragAndDropWrapper from "./component/order";
import SingleSelectQuestion from "./component/singleselect";

interface SelectedAnswer {
	questionId: number;
	answerIds: number[];
	textAnswer?: string;
	matches?: Record<number, number | string>;
	order?: number[];
}

type QuestionType = 1 | 2 | 3 | 4 | 5 | 6;

const QUESTION_TYPE_CONFIG: Record<
	QuestionType,
	{
		name: string;
		color: string;
	}
> = {
	1: {
		name: "Нэг сонголттой",
		color:
			"bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
	},
	2: {
		name: "Олон сонголттой",
		color:
			"bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
	},
	3: {
		name: "Тоо оруулах",
		color:
			"bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
	},
	4: {
		name: "Нөхөх",
		color:
			"bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
	},
	5: {
		name: "Дараалал",
		color:
			"bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
	},
	6: {
		name: "Хослуулах",
		color:
			"bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800",
	},
};

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

	// Memoize computed values
	const { examInfo, questions, answers, choosedAnswers } = useMemo(
		() => ({
			examInfo: data?.ExamInfo?.[0],
			questions: data?.Questions || [],
			answers: data?.Answers || [],
			choosedAnswers: data?.ChoosedAnswer || [],
		}),
		[data],
	);

	const answeredCount = useMemo(
		() => selectedAnswers.length,
		[selectedAnswers],
	);

	const getQuestionAnswers = useCallback(
		(questionId: number) => {
			const filtered = answers.filter((a) => a.question_id === questionId);

			// Зүгээр л refid-аар sort хий, duplicate устгах хэрэггүй
			return filtered.sort((a, b) => {
				if (a.refid === undefined || b.refid === undefined) return 0;
				return a.refid - b.refid;
			});
		},
		[answers],
	);

	const getSelectedAnswer = useCallback(
		(questionId: number) =>
			selectedAnswers.find((a) => a.questionId === questionId),
		[selectedAnswers],
	);

	const getBodolt = useCallback(
		(questionId: number) =>
			choosedAnswers.find((c) => c.question_id === questionId),
		[choosedAnswers],
	);

	const getQuestionTypeName = useCallback((typeId: number): string => {
		return (
			QUESTION_TYPE_CONFIG[typeId as QuestionType]?.name ||
			`Тодорхойгүй (${typeId})`
		);
	}, []);

	const getTypeColor = useCallback((typeId: number): string => {
		return (
			QUESTION_TYPE_CONFIG[typeId as QuestionType]?.color ||
			"bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
		);
	}, []);

	// Answer handlers
	const handleSingleSelect = useCallback(
		(questionId: number, answerId: number | null) => {
			setSelectedAnswers((prev) => {
				const filtered = prev.filter((a) => a.questionId !== questionId);
				return answerId
					? [...filtered, { questionId, answerIds: [answerId] }]
					: filtered;
			});
		},
		[],
	);

	const handleMultiSelect = useCallback(
		(questionId: number, answerIds: number[]) => {
			setSelectedAnswers((prev) => {
				const filtered = prev.filter((a) => a.questionId !== questionId);
				return answerIds.length > 0
					? [...filtered, { questionId, answerIds }]
					: filtered;
			});
		},
		[],
	);

	const handleFillInBlank = useCallback((questionId: number, text: string) => {
		setSelectedAnswers((prev) => {
			const filtered = prev.filter((a) => a.questionId !== questionId);
			return text.trim()
				? [...filtered, { questionId, answerIds: [], textAnswer: text }]
				: filtered;
		});
	}, []);

	const handleOrdering = useCallback(
		(questionId: number, orderedIds: number[]) => {
			setSelectedAnswers((prev) => {
				const filtered = prev.filter((a) => a.questionId !== questionId);
				return orderedIds.length > 0
					? [...filtered, { questionId, answerIds: [], order: orderedIds }]
					: filtered;
			});
		},
		[],
	);

	const handleMatching = useCallback(
		(questionId: number, matches: Record<number, number | string>) => {
			setSelectedAnswers((prev) => {
				const filtered = prev.filter((a) => a.questionId !== questionId);
				return Object.keys(matches).length > 0
					? [...filtered, { questionId, answerIds: [], matches }]
					: filtered;
			});
		},
		[],
	);

	const handleSubmitQuestion = useCallback(
		(questionId: number) => {
			const selected = selectedAnswers.find((a) => a.questionId === questionId);
			if (
				selected &&
				(selected.order?.length || Object.keys(selected.matches || {}).length)
			) {
				setSubmittedQuestions((prev) => new Set(prev).add(questionId));
			}
		},
		[selectedAnswers],
	);

	// Render question component
	const renderQuestion = useCallback(
		(
			question: {
				question_id: number;
				que_type_id: number;
				question_name: string;
				que_onoo: number;
				question_img: string | null;
			},
			index: number,
		) => {
			const questionAnswers = getQuestionAnswers(question.question_id);
			const selected = getSelectedAnswer(question.question_id);
			const bodolt = getBodolt(question.question_id);
			const isSubmitted = submittedQuestions.has(question.question_id);
			const questionType = Number(question.que_type_id) as QuestionType;

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
				((questionType === 3 || questionType === 5 || questionType === 6) &&
					isSubmitted);

			return (
				<div
					key={question.question_id}
					className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border-2 border-gray-100 dark:border-gray-700"
				>
					{/* Question Header */}
					<div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
						<div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-sm sm:text-lg shadow-lg">
							{index + 1}
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-base sm:text-lg md:text-xl text-gray-900 dark:text-white font-semibold mb-3">
								{parse(question.question_name)}
							</div>
							{question.question_img && (
								<div className="mt-4 mb-6 relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50">
									<img
										src={question.question_img}
										alt="Асуултын зураг"
										className="max-w-full h-auto object-contain mx-auto transition-transform hover:scale-[1.02] duration-300"
										loading="lazy"
									/>
								</div>
							)}
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
						{/* Type 1: Single Select */}
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

								{/* Зөвхөн бодолт харуулах */}
								{showAnswerFeedback && selected && bodolt && (
									<div className="mt-4">
										<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
											<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
												📝 Бодолт:
											</p>
											<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
												{parse(bodolt.descr)}
											</div>
										</div>
									</div>
								)}
							</>
						)}

						{/* Type 2: Multi Select */}
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

								{/* Зөвхөн бодолт харуулах */}
								{showAnswerFeedback && selected && bodolt && (
									<div className="mt-4">
										<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
											<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
												📝 Бодолт:
											</p>
											<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
												{parse(bodolt.descr)}
											</div>
										</div>
									</div>
								)}
							</>
						)}

						{/* Type 3: Number Input */}
						{questionType === 3 && (
							<>
								<NumberInputQuestion
									questionId={question.question_id}
									answers={convertedAnswers}
									userAnswers={selected?.matches || {}}
									onAnswerChange={(answers) => {
										handleMatching(question.question_id, answers);
									}}
									showResults={isSubmitted}
									onRestart={() => {
										// Clear submitted state for this question
										setSubmittedQuestions((prev) => {
											const newSet = new Set(prev);
											newSet.delete(question.question_id);
											return newSet;
										});
									}}
								/>

								{/* Submit button */}
								{!isSubmitted &&
									selected?.matches &&
									Object.keys(selected.matches).length > 0 && (
										<div className="mt-4">
											<Button
												onClick={() =>
													handleSubmitQuestion(question.question_id)
												}
												className="w-full sm:w-auto font-semibold shadow-lg"
											>
												Хариултаа шалгах
											</Button>
										</div>
									)}

								{/* Зөвхөн бодолт харуулах */}
								{isSubmitted && bodolt && (
									<div className="mt-4">
										<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
											<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
												📝 Бодолт:
											</p>
											<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
												{parse(bodolt.descr)}
											</div>
										</div>
									</div>
								)}
							</>
						)}

						{/* Type 4: Fill in Blank */}
						{questionType === 4 && (
							<>
								<FillInTheBlankQuestion
									questionId={question.question_id}
									questionText={question.question_name}
									value={selected?.textAnswer || ""}
									mode="exam"
									onAnswerChange={handleFillInBlank}
								/>

								{/* Зөвхөн бодолт харуулах */}
								{showAnswerFeedback && selected && bodolt && (
									<div className="mt-4">
										<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
											<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
												📝 Бодолт:
											</p>
											<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
												{parse(bodolt.descr)}
											</div>
										</div>
									</div>
								)}
							</>
						)}

						{/* Type 5: Ordering */}
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

								{!isSubmitted &&
									selected?.order &&
									selected.order.length > 0 && (
										<div className="mt-4">
											<Button
												onClick={() =>
													handleSubmitQuestion(question.question_id)
												}
												className="w-full sm:w-auto bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
											>
												Хариултаа илгээх
											</Button>
										</div>
									)}

								{/* Зөвхөн бодолт харуулах */}
								{isSubmitted && bodolt && (
									<div className="mt-4">
										<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
											<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
												📝 Бодолт:
											</p>
											<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
												{parse(bodolt.descr)}
											</div>
										</div>
									</div>
								)}
							</>
						)}

						{/* Type 6: Matching */}
						{questionType === 6 && (
							<>
								<MatchingByLine
									answers={convertedAnswers.map((a) => ({
										refid: a.refid,
										answer_id: a.answer_id,
										question_id: a.question_id,
										answer_name_html: a.answer_name_html,
										answer_descr: a.answer_descr,
										answer_img: a.answer_img || null,
										ref_child_id: a.ref_child_id || null,
										is_true: a.is_true,
									}))}
									onMatchChange={(matches) =>
										handleMatching(question.question_id, matches)
									}
									userAnswers={selected?.matches || {}}
								/>

								{!isSubmitted &&
									selected?.matches &&
									Object.keys(selected.matches).length > 0 && (
										<div className="mt-4">
											<Button
												onClick={() =>
													handleSubmitQuestion(question.question_id)
												}
												className="w-full sm:w-auto bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
											>
												Хариултаа илгээх
											</Button>
										</div>
									)}

								{/* Зөвхөн бодолт харуулах */}
								{isSubmitted && bodolt && (
									<div className="mt-4">
										<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
											<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
												📝 Бодолт:
											</p>
											<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
												{parse(bodolt.descr)}
											</div>
										</div>
									</div>
								)}
							</>
						)}

						{/* Unknown question type warning */}
						{![1, 2, 3, 4, 5, 6].includes(questionType) && (
							<div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
								<p className="text-red-800 dark:text-red-300 font-semibold text-sm">
									⚠️ Тодорхойгүй асуултын төрөл: {questionType}
								</p>
							</div>
						)}
					</div>
				</div>
			);
		},
		[
			getQuestionAnswers,
			getSelectedAnswer,
			getBodolt,
			submittedQuestions,
			getTypeColor,
			getQuestionTypeName,
			handleSingleSelect,
			handleMultiSelect,
			handleFillInBlank,
			handleOrdering,
			handleSubmitQuestion,
			handleMatching,
		],
	);

	// Loading/Error states
	if (!userId) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
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

	if (!examInfo || questions.length === 0) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
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

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-5xl mx-auto">
				{/* Sticky Header */}
				<div className="sticky top-0 z-10 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-4 mb-2">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
							{examInfo.title}
						</h1>
					</div>
					<div className="flex flex-wrap items-center gap-2 sm:gap-4">
						<span className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm border border-blue-200 dark:border-blue-800">
							{examInfo.exam_type_name}
						</span>
						<span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
							{questions.length} асуулт
						</span>
						<span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
							• {answeredCount} хариулт өгсөн
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
