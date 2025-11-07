"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import FinishExamResultDialog from "@/app/exam/component/finish";
import ExamMinimap from "@/app/exam/component/minimap";
import SingleSelectQuestion from "@/app/exam/component/question/singleSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getExamById, saveExamAnswer } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import ExamTimer from "../component/Itime";

export default function ExamPage() {
	const { userId } = useAuthStore();
	const { id } = useParams();
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

	const { data: examData, isLoading } = useQuery({
		queryKey: ["exam", userId, id],
		queryFn: () => getExamById(userId || 0, Number(id)),
		enabled: !!userId && !!id,
		staleTime: 5 * 60 * 1000,
	});

	const singleSelectQuestions = useMemo(() => {
		if (!examData) return [];
		return examData.Questions.filter((q) => q.que_type_id === 1).map((q) => {
			const answers = examData.Answers.filter(
				(a) => a.question_id === q.question_id && a.answer_type === 1,
			).map((a) => ({
				answer_id: a.answer_id,
				answer_name_html: a.answer_name_html,
				answer_img: a.answer_img || undefined,
				is_true: false,
			}));
			return { ...q, answers };
		});
	}, [examData]);

	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, number | null>
	>({});

	const totalCount = singleSelectQuestions.length;
	const answeredCount = useMemo(
		() =>
			Object.values(selectedAnswers).filter((answer) => answer !== null).length,
		[selectedAnswers],
	);
	const progressPercentage =
		totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

	const saveAnswerMutation = useMutation({
		mutationFn: ({
			questionId,
			answerId,
			queTypeId,
			rowNum,
		}: {
			questionId: number;
			answerId: number;
			queTypeId: number;
			rowNum: number;
		}) => {
			const examId = examData?.ExamInfo[0]?.id;
			if (!examId) {
				throw new Error("Exam ID олдсонгүй");
			}
			return saveExamAnswer(
				userId || 0,
				examData?.ExamInfo[0].id,
				questionId,
				answerId,
				queTypeId,
				"",
				rowNum,
			);
		},
		onSuccess: (response) => console.log("Server response:", response),
		onError: (err) => console.error("Failed to save answer", err),
	});

	const handleAnswerChange = (questionId: number, answerId: number | null) => {
		setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
		if (!examData || answerId === null) return;
		const question = examData.Questions.find(
			(q) => q.question_id === questionId,
		);
		if (!question) return;

		saveAnswerMutation.mutate({
			questionId,
			answerId,
			queTypeId: question.que_type_id,
			rowNum: Number(question.row_num),
		});
	};

	const goToQuestion = (index: number) => {
		setCurrentQuestionIndex(index);
		// Desktop дээр тухайн асуулт руу scroll хийх
		if (window.innerWidth >= 1024) {
			const element = document.getElementById(`question-${index}`);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	};

	const goToPrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const goToNext = () => {
		if (currentQuestionIndex < totalCount - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		}
	};

	const currentQuestion = singleSelectQuestions[currentQuestionIndex];

	if (isLoading)
		return (
			<div className="flex justify-center items-center h-screen text-lg font-medium">
				⏳ Шалгалтын мэдээлэл ачааллаж байна...
			</div>
		);

	if (!examData || examData.Questions.length === 0)
		return (
			<div className="p-8 text-center text-xl font-medium text-red-600">
				❌ Шалгалт олдсонгүй эсвэл асуулт байхгүй байна.
			</div>
		);

	return (
		<div className="p-4 md:p-8">
			{/* Desktop Grid Layout: 1-3-1 */}
			<div className="hidden lg:grid grid-cols-5 gap-6 max-w-7xl mx-auto">
				{/* Зүүн тал - Minimap + Timer */}
				<aside className="col-span-1">
					<ExamMinimap
						totalCount={totalCount}
						answeredCount={answeredCount}
						currentQuestionIndex={currentQuestionIndex}
						selectedAnswers={selectedAnswers}
						questions={singleSelectQuestions}
						onQuestionClick={goToQuestion}
						timerComponent={<ExamTimer initialSeconds={300} />}
					/>
				</aside>

				{/* Төв хэсэг - Бүх асуултууд */}
				<main className="col-span-3 space-y-6">
					{singleSelectQuestions.map((q, index) => (
						<div
							key={q.question_id}
							id={`question-${index}`}
							className={`border rounded-xl p-5 shadow-sm transition-all duration-300 ${
								selectedAnswers[q.question_id] !== null
									? "border-green-400 bg-green-50/50"
									: "hover:shadow-md"
							}`}
						>
							<h2 className="font-bold mb-4 text-lg">
								<span className="text-blue-600 mr-2">{index + 1}.</span>
								{q.question_name}
							</h2>
							<SingleSelectQuestion
								questionId={q.question_id}
								questionText={q.question_name}
								answers={q.answers}
								mode="exam"
								selectedAnswer={selectedAnswers[q.question_id] ?? null}
								onAnswerChange={handleAnswerChange}
							/>
						</div>
					))}

					{examData && examData.ExamInfo.length > 0 && (
						<div className="mt-8 pt-4 border-t flex justify-end">
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
				</main>

				{/* Баруун тал - Timer */}
				<aside className="col-span-1">
					<div className="sticky top-4">
						<ExamTimer initialSeconds={300} />
					</div>
				</aside>
			</div>

			{/* Mobile View - Нэг асуулт харуулах */}
			<div className="lg:hidden">
				{/* Progress + Timer дээд хэсэгт */}
				<div className="sticky top-0 z-10 bg-white pb-4 space-y-3">
					<Card className="shadow-lg border-t-4 border-blue-500">
						<CardContent className="p-4">
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm font-medium">
									Асуулт {currentQuestionIndex + 1} / {totalCount}
								</span>
								<span className="text-sm text-blue-600 font-bold">
									{progressPercentage}%
								</span>
							</div>
							<Progress value={progressPercentage} className="h-2" />
						</CardContent>
					</Card>
					<ExamTimer initialSeconds={300} />
				</div>

				{/* Одоогийн асуулт */}
				{currentQuestion && (
					<div className="my-6">
						<div
							className={`border rounded-xl p-5 shadow-md min-h-[60vh] ${
								selectedAnswers[currentQuestion.question_id] !== null
									? "border-green-400 bg-green-50/50"
									: ""
							}`}
						>
							<h2 className="font-bold mb-4 text-lg">
								<span className="text-blue-600 mr-2">
									{currentQuestionIndex + 1}.
								</span>
								{currentQuestion.question_name}
							</h2>
							<SingleSelectQuestion
								questionId={currentQuestion.question_id}
								questionText={currentQuestion.question_name}
								answers={currentQuestion.answers}
								mode="exam"
								selectedAnswer={
									selectedAnswers[currentQuestion.question_id] ?? null
								}
								onAnswerChange={handleAnswerChange}
							/>
						</div>
					</div>
				)}

				{/* Навигацын товчууд */}
				<div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
					<div className="flex justify-between items-center gap-4 max-w-lg mx-auto">
						<Button
							onClick={goToPrevious}
							disabled={currentQuestionIndex === 0}
							variant="outline"
							size="lg"
							className="flex-1"
						>
							<ChevronLeft className="w-5 h-5 mr-1" />
							Өмнөх
						</Button>

						{currentQuestionIndex === totalCount - 1 ? (
							examData &&
							examData.ExamInfo.length > 0 && (
								<FinishExamResultDialog
									examId={examData.ExamInfo[0].id}
									examType={examData.ExamInfo[0].exam_type}
									startEid={examData.ExamInfo[0].start_eid}
									examTime={examData.ExamInfo[0].minut}
									answeredCount={answeredCount}
									totalCount={totalCount}
								/>
							)
						) : (
							<Button
								onClick={goToNext}
								disabled={currentQuestionIndex === totalCount - 1}
								size="lg"
								className="flex-1"
							>
								Дараах
								<ChevronRight className="w-5 h-5 ml-1" />
							</Button>
						)}
					</div>
				</div>

				{/* Доод зайг нөхөх (fixed button-ы хувьд) */}
				<div className="h-24" />
			</div>
		</div>
	);
}
