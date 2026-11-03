"use client";

import { useQuery } from "@tanstack/react-query";
import { Inbox, LogIn, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import StyledBackButton from "@/components/backButton";
import { PageHeader } from "@/components/page/pageHeader";
import { EmptyState, LoadingState } from "@/components/page/pageStates";
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
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<EmptyState
					icon={LogIn}
					title="Нэвтрэх шаардлагатай"
					description="Энэ хуудсыг үзэхийн тулд эхлээд нэвтэрнэ үү."
					className="w-full max-w-md"
				/>
			</div>
		);
	}

	if (isLoading) {
		return (
			<LoadingState className="min-h-screen" label="Дасгал ачааллаж байна..." />
		);
	}

	if (!examInfo || questions.length === 0) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background p-4">
				<EmptyState
					icon={Inbox}
					title="Дасгал олдсонгүй"
					description="Эхлээд тестийн бүлгээс тест сонгоно уу."
					className="w-full max-w-md"
					action={
						<Button
							onClick={() => router.push("/Lists/testGroup")}
							className="h-11 px-5 font-semibold"
						>
							Тест сонгох
						</Button>
					}
				/>
			</div>
		);
	}

	const progressPercent = Math.round((answeredCount / questions.length) * 100);

	return (
		<div className="min-h-screen px-4">
			{/* Дээд мөр: буцах + явц */}
			<div className="pt-4">
				<div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
					<StyledBackButton
						variant="default"
						showIcon={true}
						showConfirm={true}
						confirmTitle="Дасгалаас гарах уу?"
						confirmMessage="Таны өгсөн хариултууд хадгалагдахгүй байж болно. Та итгэлтэй байна уу?"
						ariaLabel="Дасгалын жагсаалт руу буцах"
					/>
					<div className="min-w-0 flex-1">
						<div className="flex items-center justify-between gap-2 text-sm">
							<span className="font-medium text-foreground">
								{answeredCount} / {questions.length} хариулсан
							</span>
							<span className="text-xs text-muted-foreground">
								{progressPercent}%
							</span>
						</div>
						<div
							className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted"
							aria-hidden="true"
						>
							<div
								className="h-full rounded-full bg-green-500 transition-all"
								style={{ width: `${progressPercent}%` }}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-3xl pb-10">
				<PageHeader
					title={examInfo.title}
					description={
						<span className="flex flex-wrap items-center gap-2">
							<span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
								{examInfo.exam_type_name}
							</span>
							<span>{questions.length} асуулт</span>
							<span aria-hidden="true">•</span>
							<span>Хариулсны дараа зөв эсэх, бодолт нь харагдана</span>
						</span>
					}
					icon={PencilLine}
				/>

				{/* Questions */}
				<div className="space-y-6">
					{questions.map((question, index) => (
						<QuestionItem
							key={question.question_id}
							question={question}
							index={index}
							totalCount={questions.length}
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
