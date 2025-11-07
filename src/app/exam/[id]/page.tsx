"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarIcon, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import FinishExamResultDialog from "@/app/exam/component/finish";
// Компонентууд
import SingleSelectQuestion from "@/app/exam/component/question/singleSelect";
import { Calendar } from "@/components/ui/calendar";
// shadcn/ui компонентууд
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFormattedServerTime } from "@/hooks/useServerTime";
import { getExamById, saveExamAnswer } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ExamPage() {
	const { userId } = useAuthStore();
	const { id } = useParams();

	// --- Шалгалтын мэдээлэл татах ---
	const { data: examData, isLoading } = useQuery({
		queryKey: ["exam", userId, id],
		queryFn: () => getExamById(userId || 0, Number(id)),
		enabled: !!userId && !!id,
		staleTime: 5 * 60 * 1000,
	});

	// --- Серверийн цаг авах ---
	const { currentTime, isLoading: serverTimeLoading } =
		useFormattedServerTime();

	// --- Хуудсанд орсон цагийг хадгалах ---
	const enteredAtRef = useRef<Date | null>(null);
	const [displayTime, setDisplayTime] = useState<Date | null>(null);

	// --- Анх нээх үед серверийн цагийг авах ---
	useEffect(() => {
		if (currentTime && enteredAtRef.current === null) {
			enteredAtRef.current = currentTime;
			const timeout = setTimeout(() => {
				setDisplayTime(currentTime);
				console.log("📅 Шалгалт эхэлсэн цаг:", currentTime.toISOString());
			}, 0);

			return () => clearTimeout(timeout);
		}
	}, [currentTime]);

	// --- Single Select төрлийн асуултууд ---
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

	// --- Хэрэглэгчийн сонгосон хариултууд ---
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, number | null>
	>({});

	// --- Progress тооцоолол ---
	const totalCount = singleSelectQuestions.length;
	const answeredCount = useMemo(
		() =>
			Object.values(selectedAnswers).filter((answer) => answer !== null).length,
		[selectedAnswers],
	);
	const progressPercentage =
		totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

	// --- Хариулт хадгалах мутаци ---
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

	// --- Хариулт өөрчлөгдөх үед ---
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

	// --- Loading / Error төлөв ---
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

	// --- Render ---
	return (
		<div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
			{/* Progress хэсэг */}
			<Card className="shadow-lg border-t-4 border-blue-500 sticky top-0 z-10 bg-white">
				<CardHeader className="p-4 md:p-6 pb-0">
					<CardTitle className="text-xl font-bold flex justify-between items-center">
						Шалгалтын явц
						<span className="text-blue-600">
							{answeredCount} / {totalCount}
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-4 md:p-6 pt-2">
					<div className="text-sm text-gray-500 mb-2">
						{progressPercentage}%-ийг бөглөсөн
					</div>
					<Progress value={progressPercentage} className="h-2" />
				</CardContent>
			</Card>

			{/* Асуултууд */}
			<div className="space-y-6">
				{singleSelectQuestions.map((q, index) => (
					<div
						key={q.question_id}
						className={`border rounded-xl p-5 shadow-sm transition-all duration-300 ${
							selectedAnswers[q.question_id] !== null
								? "border-green-400 bg-green-50/50"
								: "hover:shadow-md"
						}`}
					>
						<h2 className="font-bold mb-4 text-lg">
							<span className="text-blue-600 mr-2">{index + 1}.</span>{" "}
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
			</div>

			{/* Шалгалт эхэлсэн цагийн мэдээлэл */}
			<Card className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md">
				<CardHeader>
					<CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
						<CalendarIcon className="w-5 h-5 text-blue-600" />
						Шалгалт эхэлсэн цаг
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
						<div className="flex items-center gap-3">
							<Clock className="w-5 h-5 text-blue-600" />
							<div>
								<p className="text-xs text-gray-500 font-medium">Эхэлсэн цаг</p>
								<p className="text-lg font-mono font-bold text-blue-700">
									{serverTimeLoading
										? "⏳ Ачааллаж байна..."
										: displayTime
											? displayTime.toLocaleString("mn-MN", {
													year: "numeric",
													month: "2-digit",
													day: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
													second: "2-digit",
													hour12: false,
												})
											: "---"}
								</p>
							</div>
						</div>
					</div>

					{displayTime && (
						<div className="flex justify-center">
							<Calendar
								mode="single"
								selected={displayTime}
								className="rounded-md border shadow-sm bg-white"
								disabled={(date) =>
									date > new Date() || date < new Date("1900-01-01")
								}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Шалгалт дуусгах товч */}
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
		</div>
	);
}
