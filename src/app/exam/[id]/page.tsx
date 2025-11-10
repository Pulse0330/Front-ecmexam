"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FinishExamResultDialog from "@/app/exam/component/finish";
import ExamMinimap from "@/app/exam/component/minimap";
import FillInTheBlankQuestion from "@/app/exam/component/question/fillblank";
import MatchingByLine from "@/app/exam/component/question/matching";
import MultiSelectQuestion from "@/app/exam/component/question/multiselect";
import DragAndDropWrapper from "@/app/exam/component/question/order";
import SingleSelectQuestion from "@/app/exam/component/question/singleSelect";
import FixedScrollButton from "@/components/FixedScrollButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getExamById, saveExamAnswer } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { AnswerValue } from "@/types/exam/exam";
import ExamTimer from "../component/Itime";

export default function ExamPage() {
	const { userId } = useAuthStore();
	const { id } = useParams();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(
		new Set(),
	);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, AnswerValue>
	>({});

	const { data: examData } = useQuery({
		queryKey: ["exam", userId, id],
		queryFn: () => getExamById(userId || 0, Number(id)),
		enabled: !!userId && !!id,
		staleTime: 5 * 60 * 1000,
	});

	// Load previous answers
	useEffect(() => {
		if (!examData?.ChoosedAnswer) return;

		const answersMap: Record<number, AnswerValue> = {};
		examData.ChoosedAnswer.forEach((item) => {
			const { QueID, QueType, Answer, AnsID } = item;
			if (QueID == null) return;

			if (QueType === 1) {
				answersMap[QueID] = AnsID ?? 0;
			} else if (QueType === 2 || QueType === 5) {
				if (!answersMap[QueID]) answersMap[QueID] = [];
				if (AnsID != null) (answersMap[QueID] as number[]).push(AnsID);
			} else if (QueType === 4) {
				answersMap[QueID] = Answer ?? "";
			} else if (QueType === 6) {
				if (!answersMap[QueID]) answersMap[QueID] = {};
				if (AnsID != null && Answer != null)
					(answersMap[QueID] as Record<number, number>)[AnsID] = Number(Answer);
			}
		});

		setSelectedAnswers(answersMap);
	}, [examData]);

	const allQuestions = useMemo(() => {
		if (!examData) return [];
		return examData.Questions.filter((q) =>
			[1, 2, 4, 5, 6].includes(q.que_type_id),
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
				return typeof ans === "number" && !Number.isNaN(ans);
			}).length,
		[selectedAnswers],
	);

	const saveAnswerMutation = useMutation({
		mutationFn: (params: {
			questionId: number;
			answerId: number;
			queTypeId: number;
			answerText: string;
			rowNum: number;
		}) => {
			const { questionId, answerId, queTypeId, answerText, rowNum } = params;
			if (!examData?.ExamInfo[0]?.id) throw new Error("Exam ID олдсонгүй");

			return saveExamAnswer(
				userId || 0,
				examData.ExamInfo[0].id,
				questionId,
				answerId,
				queTypeId,
				answerText,
				rowNum,
			);
		},
		onSuccess: (response) =>
			console.log("✅ Амжилттай хадгалагдлаа:", response),
		onError: (err) => console.error("❌ Хадгалахад алдаа гарлаа:", err),
	});

	// Unified handler
	const handleAnswerChange = (questionId: number, answer: AnswerValue) => {
		const question = examData?.Questions.find(
			(q) => q.question_id === questionId,
		);
		if (!question) return;

		const rowNum = Number(question.row_num);
		const queTypeId = question.que_type_id;
		setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));

		// Save answer immediately
		if (queTypeId === 1 && typeof answer === "number") {
			saveAnswerMutation.mutate({
				questionId,
				answerId: answer,
				queTypeId,
				answerText: "",
				rowNum,
			});
		} else if ((queTypeId === 2 || queTypeId === 5) && Array.isArray(answer)) {
			answer.forEach((ansId) => {
				saveAnswerMutation.mutate({
					questionId,
					answerId: ansId,
					queTypeId,
					answerText: "",
					rowNum,
				});
			});
		} else if (queTypeId === 4 && typeof answer === "string") {
			saveAnswerMutation.mutate({
				questionId,
				answerId: 0,
				queTypeId,
				answerText: answer,
				rowNum,
			});
		} else if (
			queTypeId === 6 &&
			typeof answer === "object" &&
			answer !== null
		) {
			Object.entries(answer).forEach(([qAnsId, aAnsId]) => {
				saveAnswerMutation.mutate({
					questionId,
					answerId: Number(aAnsId),
					queTypeId,
					answerText: String(qAnsId),
					rowNum,
				});
			});
		}
	};

	const toggleBookmark = (questionId: number) => {
		setBookmarkedQuestions((prev) => {
			const newSet = new Set(prev);
			newSet.has(questionId)
				? newSet.delete(questionId)
				: newSet.add(questionId);
			return newSet;
		});
	};

	const goToQuestion = (index: number) => {
		setCurrentQuestionIndex(index);
		if (window.innerWidth >= 1024) {
			document
				.getElementById(`question-${index}`)
				?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};

	const getCardBorderClass = (questionId: number) => {
		const answer = selectedAnswers[questionId];
		const isAnswered =
			(Array.isArray(answer) && answer.length > 0) ||
			(typeof answer === "string" && answer.trim() !== "") ||
			(typeof answer === "number" && !Number.isNaN(answer)) ||
			(typeof answer === "object" &&
				answer !== null &&
				Object.keys(answer).length > 0);
		const isBookmarked = bookmarkedQuestions.has(questionId);
		if (isAnswered && isBookmarked) return " border-amber-500 shadow-sm";
		if (isAnswered) return " border-blue-600 shadow-sm";
		if (isBookmarked) return " border-amber-400 shadow-sm";
		return "border border-gray-200";
	};

	if (!examData || examData.Questions.length === 0) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
					<p className="text-xl font-medium text-red-600">Шалгалт олдсонгүй</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
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
							{examData?.ExamInfo[0] && (
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
									<CardContent className="p-6 flex gap-4">
										<div className=" w-12 h-12 ">{index + 1}.</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2 mb-4">
												<h2 className="font-semibold text-lg flex-1">
													{q.question_name}
												</h2>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => toggleBookmark(q.question_id)}
													className="flex-shrink-0 hover:bg-gray-100"
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

											{q.que_type_id === 1 && (
												<SingleSelectQuestion
													questionId={q.question_id}
													questionText={q.question_name}
													answers={q.answers}
													mode="exam"
													selectedAnswer={
														selectedAnswers[q.question_id] as number
													}
													onAnswerChange={(qid, ans) =>
														handleAnswerChange(qid, ans)
													}
												/>
											)}
											{q.que_type_id === 2 && (
												<MultiSelectQuestion
													questionId={q.question_id}
													questionText={q.question_name}
													questionImage={q.question_img || null}
													answers={q.answers}
													mode="exam"
													selectedAnswers={
														(selectedAnswers[q.question_id] as number[]) || []
													}
													onAnswerChange={(qid, ans) =>
														handleAnswerChange(qid, ans)
													}
												/>
											)}
											{q.que_type_id === 4 && (
												<FillInTheBlankQuestion
													questionId={q.question_id}
													questionText={q.question_name}
													mode="exam"
													value={
														(selectedAnswers[q.question_id] as string) || ""
													}
													onAnswerChange={(qid, val) =>
														handleAnswerChange(qid, val)
													}
												/>
											)}
											{q.que_type_id === 5 && (
												<DragAndDropWrapper
													questionId={q.question_id}
													answers={q.answers}
													mode="exam"
													userAnswers={
														(selectedAnswers[q.question_id] as number[]) || []
													}
													onOrderChange={(orderedIds) =>
														handleAnswerChange(q.question_id, orderedIds)
													}
												/>
											)}
											{q.que_type_id === 6 && (
												<MatchingByLine
													answers={q.answers.map((a) => ({
														...a,
														answer_img: a.answer_img || null,
													}))}
													onMatchChange={(matches) =>
														handleAnswerChange(q.question_id, matches)
													}
													initialMatches={
														(selectedAnswers[q.question_id] as Record<
															number,
															number
														>) || {}
													}
												/>
											)}
										</div>
									</CardContent>
								</Card>
							</div>
						))}
					</main>

					<aside className="col-span-1">
						<div className="sticky top-6">
							<Card>
								<CardContent className="p-4">
									<ExamTimer
										initialSeconds={examData.ExamInfo[0]?.minut * 60 || 300}
									/>
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
