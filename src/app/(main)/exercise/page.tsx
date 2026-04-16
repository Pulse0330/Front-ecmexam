"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import StyledBackButton from "@/components/backButton";
import { Button } from "@/components/ui/button";
import { gettTestFill } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamFinishResponse } from "@/types/exercise/testGetFill";
import type { SelectedAnswer } from "./component/questionItem";
import QuestionItem from "./component/questionItem";

export default function ExercisePage() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswer[]>([]);
	const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(
		new Set(),
	);

	const { data, isLoading } = useQuery<ExamFinishResponse>({
		queryKey: ["testFill", userId],
		queryFn: () => gettTestFill(userId || 0),
		enabled: !!userId,
	});

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

	// answers өөрчлөгдөхөд л дахин тооцно, selectedAnswers өөрчлөгдөхөд биш
	const getQuestionAnswers = useCallback(
		(questionId: number) => {
			const filtered = answers.filter((a) => a.question_id === questionId);
			const unique = filtered.filter(
				(answer, index, self) =>
					index === self.findIndex((a) => a.answer_id === answer.answer_id),
			);
			return unique
				.sort((a, b) => {
					if (a.refid === undefined || b.refid === undefined) return 0;
					return a.refid - b.refid;
				})
				.map((a) => ({
					answer_id: a.answer_id,
					question_id: a.question_id,
					answer_name: a.answer_name || "",
					answer_name_html: a.answer_name_html,
					answer_descr: a.answer_descr || "",
					answer_img: a.answer_img || undefined,
					answer_type: a.answer_type,
					refid: a.refid,
					// CHANGE THIS: Ensure it's a number to match ConvertedAnswer
					ref_child_id: a.ref_child_id !== null ? Number(a.ref_child_id) : null,
					is_true: a.is_true === 1,
				}));
		},
		[answers],
	);

	// ─── Answer handlers ────────────────────────────────────────────────────────

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
		(
			questionId: number,
			matches: Record<number, number | string | number[]>,
		) => {
			setSelectedAnswers((prev) => {
				const filtered = prev.filter((a) => a.questionId !== questionId);
				return Object.keys(matches).length > 0
					? [...filtered, { questionId, answerIds: [], matches }]
					: filtered;
			});
		},
		[],
	);

	// selectedAnswers-г dependency-д оруулахгүйн тулд setSelectedAnswers(prev => ...) ашигладаг
	const handleSubmitQuestion = useCallback((questionId: number) => {
		setSelectedAnswers((prev) => {
			const selected = prev.find((a) => a.questionId === questionId);
			if (
				selected &&
				(selected.order?.length || Object.keys(selected.matches || {}).length)
			) {
				setSubmittedQuestions((s) => new Set(s).add(questionId));
			}
			return prev; // state өөрчлөхгүй, зөвхөн уншина
		});
	}, []);

	const handleRestart = useCallback((questionId: number) => {
		setSubmittedQuestions((prev) => {
			const newSet = new Set(prev);
			newSet.delete(questionId);
			return newSet;
		});
	}, []);

	// ─── Loading / Error states ──────────────────────────────────────────────────

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
		<div className="min-h-screen py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
			<div className="fixed">
				<StyledBackButton
					variant="default"
					showIcon={true}
					showConfirm={true}
					confirmTitle="Дасгалаас гарах уу?"
					confirmMessage="Таны өгсөн хариултууд хадгалагдахгүй байж болно. Та итгэлтэй байна уу?"
					ariaLabel="Дасгалын жагсаалт руу буцах"
				/>
			</div>

			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="pb-4 mb-2">
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

				{/* Questions */}
				<div className="space-y-4 sm:space-y-6 md:space-y-8">
					{questions.map((question, index) => (
						<QuestionItem
							key={question.question_id}
							question={question}
							index={index}
							questionAnswers={getQuestionAnswers(question.question_id)}
							selected={selectedAnswers.find(
								(a) => a.questionId === question.question_id,
							)}
							bodolt={choosedAnswers.find(
								(c) => c.question_id === question.question_id,
							)}
							isSubmitted={submittedQuestions.has(question.question_id)}
							onSingleSelect={handleSingleSelect}
							onMultiSelect={handleMultiSelect}
							onFillInBlank={handleFillInBlank}
							onOrdering={handleOrdering}
							onMatching={handleMatching}
							onSubmit={handleSubmitQuestion}
							onRestart={handleRestart}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
