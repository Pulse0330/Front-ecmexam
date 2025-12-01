"use client";

import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import { AlertCircle, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Button } from "@/components/ui/button";
import { getExamResultMore } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamResponseMoreApiResponse } from "@/types/exam/examResultMore";
import type {  Question, Answer, UserAnswer } from "@/types/exam/examResultMore";

function ExamResultDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { userId } = useAuthStore();
	const [answerFilter, setAnswerFilter] = useState<'all' | 'correct' | 'wrong'>('all');

	const id = params.id as string;
	const [examIdStr, testIdStr] = id?.split("_") || [];
	const examId = Number(examIdStr);
	const testId = Number(testIdStr);

	const { data, isLoading, isError, error, isSuccess } =
		useQuery<ExamResponseMoreApiResponse>({
			queryKey: ["examResultDetail", testId, examId, userId],
			queryFn: () => getExamResultMore(testId, examId, userId || 0),
			enabled: !!userId && !!examId && !!testId,
		});

	const safeParse = (html: string | null | undefined) => {
		if (!html || typeof html !== 'string' || html.trim() === '') return '';
		try {
			return parse(html);
		} catch {
			return html;
		}
	};

	const getQuestionTypeLabel = (typeId: number) => {
		const types: Record<number, string> = {
			1: "Нэг сонголттой",
			2: "Олон сонголттой",
			3: "Тоо оруулах",
			4: "Задгай даалгавар",
			5: "Дараалал",
			6: "Харгалзуулах",
		};
		return types[typeId] || "Бусад";
	};
	

	if (!userId) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
				<div className="text-center space-y-4 p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-2xl max-w-md">
					<div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
						<AlertCircle className="w-10 h-10 text-orange-500" />
					</div>
					<div>
						<h3 className="text-2xl font-bold mb-2">Хэрэглэгч нэвтрээгүй байна</h3>
						<p className="text-muted-foreground">Та эхлээд системд нэвтэрнэ үү</p>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
				<div className="flex flex-col items-center space-y-6">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 blur-3xl rounded-full animate-pulse" />
						<UseAnimations animation={loading2} size={80} strokeColor="hsl(var(--primary))" loop />
					</div>
					<div className="space-y-2 text-center">
						<p className="text-xl font-bold animate-pulse">Ачааллаж байна...</p>
						<p className="text-sm text-muted-foreground">Шалгалтын дэлгэрэнгүй мэдээллийг уншиж байна</p>
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
				<div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-2xl text-center space-y-4">
					<div className="w-20 h-20 mx-auto bg-gradient-to-br from-destructive/20 to-red-500/20 rounded-full flex items-center justify-center">
						<AlertCircle className="w-10 h-10 text-destructive" />
					</div>
					<h3 className="text-2xl font-bold text-destructive">Алдаа гарлаа</h3>
					<p className="text-sm text-destructive/80">{(error as Error).message}</p>
					<Button onClick={() => router.back()}>Буцах</Button>
				</div>
			</div>
		);
	}

	if (!data?.RetResponse?.ResponseType || !data?.RetDataSecond) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
				<div className="text-center space-y-6 p-8 rounded-2xl bg-card/80 backdrop-blur-sm border shadow-2xl max-w-md">
					<div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center">
						<AlertCircle className="w-10 h-10 text-orange-500" />
					</div>
					<h3 className="text-2xl font-bold">Мэдээлэл олдсонгүй</h3>
					<p className="text-muted-foreground">
						{data?.RetResponse?.ResponseMessage || "Шалгалтын дэлгэрэнгүй мэдээлэл олдсонгүй"}
					</p>
					<Button onClick={() => router.back()}>Буцах</Button>
				</div>
			</div>
		);
	}

	const examSummary = data.RetDataFirst?.[0];
	const questions = data.RetDataSecond;
	const answers = data.RetDataThirt;
	const userAnswers = data.RetDataFourth;
	
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
			<div className="max-w-6xl mx-auto space-y-6">
				{isSuccess && (
					<div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl p-5 flex items-center gap-4">
						<div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
							<CheckCircle className="w-7 h-7 text-white" />
						</div>
						<div>
							<p className="font-bold text-lg text-emerald-800 dark:text-emerald-300">
								{data.RetResponse.ResponseMessage}
							</p>
							<p className="text-emerald-700 dark:text-emerald-400 text-sm">
								Шалгалтын дэлгэрэнгүй мэдээлэл амжилттай ачаалагдлаа
							</p>
						</div>
					</div>
				)}

				{examSummary && (
					<div className="bg-card border rounded-2xl p-6 shadow-lg">
						<h2 className="text-2xl font-bold mb-4">{examSummary.lesson_name}</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="p-4 bg-primary/10 rounded-xl">
								<p className="text-sm text-muted-foreground">Нийт оноо</p>
								<p className="text-2xl font-bold text-primary">{examSummary.point}/{examSummary.ttl_point}</p>
							</div>
							<div className="p-4 bg-emerald-500/10 rounded-xl">
								<p className="text-sm text-muted-foreground">Зөв хариулт</p>
								<p className="text-2xl font-bold text-emerald-600">{examSummary.correct_ttl}</p>
							</div>
							<div className="p-4 bg-red-500/10 rounded-xl">
								<p className="text-sm text-muted-foreground">Буруу хариулт</p>
								<p className="text-2xl font-bold text-red-600">{examSummary.wrong_ttl}</p>
							</div>
							<div className="p-4 bg-blue-500/10 rounded-xl">
								<p className="text-sm text-muted-foreground">Хувь</p>
								<p className="text-2xl font-bold text-blue-600">{examSummary.point_perc.toFixed(1)}%</p>
							</div>
						</div>
					</div>
				)}

				<Button onClick={() => router.back()} variant="outline" className="gap-2">
					<ArrowLeft className="w-5 h-5" />
					Буцах
				</Button>

				{/* Filter buttons - Global for all questions */}
				<div className="bg-card border rounded-2xl p-4 shadow-lg">
					<div className="flex items-center gap-4 flex-wrap">
						<span className="text-sm font-semibold text-muted-foreground">Асуултууд:</span>
						<div className="flex gap-2 flex-wrap">
							<button
								onClick={() => setAnswerFilter('all')}
								className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
									answerFilter === 'all'
										? 'bg-primary text-primary-foreground shadow-lg'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								}`}
							>
								Бүх асуулт
							</button>
							<button
								onClick={() => setAnswerFilter('correct')}
								className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
									answerFilter === 'correct'
										? 'bg-emerald-500 text-white shadow-lg'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								}`}
							>
								Зөв хариулсан
							</button>
							<button
								onClick={() => setAnswerFilter('wrong')}
								className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
									answerFilter === 'wrong'
										? 'bg-red-500 text-white shadow-lg'
										: 'bg-muted text-muted-foreground hover:bg-muted/80'
								}`}
							>
								Буруу хариулсан
							</button>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					{!questions || questions.length === 0 ? (
						<div className="text-center p-8 bg-card/50 rounded-xl border">
							<p className="text-muted-foreground">Асуулт олдсонгүй</p>
						</div>
					) : (
						questions
							.map((question, index) => {
								const questionAnswers = answers?.filter(
									(answer) => answer.exam_que_id === question.exam_que_id
								) || [];

								const userSelectedAnswers = userAnswers?.filter(
									(ua) => ua.exam_que_id === question.exam_que_id
								) || [];

				const isQuestionCorrect = (() => {
	if (userSelectedAnswers.length === 0) return false;
	
	if (question.que_type_id === 1) {
		// Single choice
		const correctAnswer = questionAnswers.find((a: any) => a.is_true === 1);
		const userAnswer = userSelectedAnswers[0];
		return userAnswer && correctAnswer && userAnswer.answer_id === correctAnswer.answer_id;

	} else if (question.que_type_id === 2) {
		// Multiple choice
		const correctAnswers = questionAnswers.filter((a: any) => a.is_true === 1);
		return (
			correctAnswers.length === userSelectedAnswers.length &&
			correctAnswers.every((ca: any) =>
				userSelectedAnswers.some((ua: any) => ua.answer_id === ca.answer_id)
			)
		);

	} else if (question.que_type_id === 3) {
		// Number input type
		const correctValues = questionAnswers.map((qa: any) =>
			(qa.answer_name_html || qa.answer_name || "")
				.toString()
				.trim()
		);

		const userValues = userSelectedAnswers.map((ua: any) =>
			(ua.answer || "").toString().trim()
		);

		// Compare same count + each value is equal
		return (
			correctValues.length === userValues.length &&
			correctValues.every((val: string, idx: number) => val === userValues[idx])
		);

	} else if (question.que_type_id === 5) {
		// Sequence
		const correctOrder = questionAnswers
			.sort((a: any, b: any) => a.refid - b.refid)
			.map((a: any) => a.answer_id);

		const userOrder = userSelectedAnswers
			.sort((a: any, b: any) => parseInt(a.answer) - parseInt(b.answer))
			.map((ua: any) => ua.answer_id);

		return (
			correctOrder.length === userOrder.length &&
			correctOrder.every((id: number, idx: number) => id === userOrder[idx])
		);

	} else if (question.que_type_id === 6) {
		// Matching
		return userSelectedAnswers.every((ua: any) => {
			const correctAnswer = questionAnswers.find(
				(a: any) =>
					a.answer_id === ua.answer_id &&
					a.ref_child_id === parseInt(ua.answer)
			);
			return !!correctAnswer;
		});
	}

	return false;
})();
								return { question, index, questionAnswers, userSelectedAnswers, isQuestionCorrect };
							})
							.filter(({ isQuestionCorrect, userSelectedAnswers }) => {
								if (answerFilter === 'all') return true;
								if (answerFilter === 'correct') return isQuestionCorrect && userSelectedAnswers.length > 0;
								if (answerFilter === 'wrong') return !isQuestionCorrect && userSelectedAnswers.length > 0;
								return true;
							})
							.map(({ question, index, questionAnswers, userSelectedAnswers, isQuestionCorrect }) => {

							const earnedPoints = isQuestionCorrect ? question.que_onoo : 0;

							return (
								<div key={question.exam_que_id} className={`border rounded-2xl p-6 shadow-lg ${
									userSelectedAnswers.length === 0 
										? 'bg-orange-50 dark:bg-orange-950/20 border-orange-500'
										: isQuestionCorrect 
										? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500' 
										: 'bg-red-50 dark:bg-red-950/20 border-red-500'
								}`}>
									<div className="flex items-start gap-4 mb-6">
										<div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
											userSelectedAnswers.length === 0
												? 'bg-orange-500 text-white'
												: isQuestionCorrect 
												? 'bg-emerald-500 text-white' 
												: 'bg-red-500 text-white'
										}`}>
											<span>{index + 1}</span>
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2 flex-wrap">
												<span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg">
													{getQuestionTypeLabel(question.que_type_id)}
												</span>
												<span className="text-sm text-muted-foreground">Нийт: {question.que_onoo} оноо</span>
												<div className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base shadow-lg ${
													userSelectedAnswers.length === 0
														? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
														: isQuestionCorrect
														? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
														: 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
												}`}>
													{userSelectedAnswers.length === 0 ? (
														<>
															<AlertCircle className="w-5 h-5" />
															<span>Хариулаагүй</span>
															<div className="ml-2 px-2 py-1 bg-white/20 rounded-lg">
																0/{question.que_onoo}
															</div>
														</>
													) : isQuestionCorrect ? (
														<>
															<CheckCircle className="w-5 h-5" />
															<span>Зөв хариулт</span>
															<div className="ml-2 px-2 py-1 bg-white/20 rounded-lg">
																{earnedPoints}/{question.que_onoo}
															</div>
														</>
													) : (
														<>
															<XCircle className="w-5 h-5" />
															<span>Буруу хариулт</span>
															<div className="ml-2 px-2 py-1 bg-white/20 rounded-lg">
																0/{question.que_onoo}
															</div>
														</>
													)}
												</div>
											</div>
											<div className="text-lg font-medium">
												{question.question_name && question.question_name.trim() !== '' ? (
													safeParse(question.question_name)
												) : question.question_img && question.question_img.trim() !== '' ? (
													<Image
														src={question.question_img}
														alt="Question"
														width={400}
														height={300}
														className="rounded-lg mt-2"
													/>
												) : (
													'Асуулт байхгүй'
												)}
											</div>
										</div>
									</div>

<div className="space-y-4 pl-14">

{/* Type 1 & 2: Single/Multiple Choice */}
{(question.que_type_id === 1 || question.que_type_id === 2) && (
	<>
		{questionAnswers.length === 0 ? (
			<p className="text-sm text-muted-foreground">Хариулт олдсонгүй</p>
		) : (
			<div className="space-y-4">

				{/* Хариулаагүй үед анхааруулга */}
				{userSelectedAnswers.length === 0 && (
					<div className="relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent" />
						<div className="relative p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border-2 border-orange-400 dark:border-orange-600 rounded-2xl shadow-sm">
							<div className="flex items-center gap-4">
								<div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
									<AlertCircle className="w-6 h-6 text-white" />
								</div>
								<div>
									<p className="font-bold text-orange-800 dark:text-orange-300 text-base">
										Хариулаагүй байна
									</p>
									<p className="text-sm text-orange-600 dark:text-orange-400">
										Та энэ асуултад хариулт хийгээгүй байна.
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Бүх хариултууд */}
				<div className="space-y-3">
					<p className="text-sm font-semibold text-muted-foreground mb-2">
						Бүх хариултууд:
					</p>

					{questionAnswers.map((answer, idx) => {
						const isUserSelected = userSelectedAnswers.some(
							ua => ua.answer_id === answer.answer_id
						);

						return (
							<div
								key={answer.answer_id}
								className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
									isUserSelected
										? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
										: "border-border bg-card/50"
								}`}
							>
								{/* A B C D тэмдэглэгээ */}
								<div className="flex flex-col items-center gap-2">
									<div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
										isUserSelected
											? "bg-blue-500 text-white"
											: "bg-muted text-muted-foreground"
									}`}>
										{String.fromCharCode(65 + idx)}
									</div>
								</div>

								{/* Хариултын текст / зураг */}
								<div className="flex-1 min-w-0">
									<div className="text-base leading-relaxed font-medium">
										{answer.answer_name_html && answer.answer_name_html.trim() !== "" ? (
											safeParse(answer.answer_name_html)
										) : answer.answer_name && answer.answer_name.trim() !== "" ? (
											safeParse(answer.answer_name)
										) : answer.answer_img && answer.answer_img.trim() !== "" ? (
											<Image
												src={answer.answer_img}
												alt="Answer"
												width={300}
												height={200}
												className="rounded-xl shadow-md mt-2"
											/>
										) : (
											"Хариулт байхгүй"
										)}
									</div>
								</div>

								{/* Та сонгосон badge */}
								{isUserSelected && (
									<div className="flex-shrink-0">
										<div className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow-lg font-bold text-sm">
											✓ Та сонгосон
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
				{/* Доор зөв хариултыг харуулах */}
<div className="mt-6 p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20">
  <p className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
    Зөв хариулт:
  </p>

  {questionAnswers
    .filter(a => a.is_true === 1)
    .map((answer, idx) => (
      <div key={answer.answer_id} className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
          {String.fromCharCode(65 + idx)}
        </div>
        <div className="text-base leading-relaxed font-medium">
          {answer.answer_name_html && answer.answer_name_html.trim() !== "" ? (
            safeParse(answer.answer_name_html)
          ) : answer.answer_name && answer.answer_name.trim() !== "" ? (
            safeParse(answer.answer_name)
          ) : answer.answer_img && answer.answer_img.trim() !== "" ? (
            <Image
              src={answer.answer_img}
              alt="Correct Answer"
              width={300}
              height={200}
              className="rounded-xl shadow-md mt-2"
            />
          ) : (
            "Хариулт байхгүй"
          )}
        </div>
      </div>
    ))}
</div>

			</div>

		)}
	</>
)}



{/* Type 3: Number Input */}
{question.que_type_id === 3 && (
	<div className="space-y-4">

		{/* Хариулаагүй үед  */}
		{userSelectedAnswers.length === 0 ? (
			<div className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent" />
				<div className="relative p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border-2 border-orange-400 dark:border-orange-600 rounded-2xl shadow-sm">
					<div className="flex items-center gap-4">
						<div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
							<AlertCircle className="w-6 h-6 text-white" />
						</div>
						<div>
							<p className="font-bold text-orange-800 dark:text-orange-300 text-base">
								Хариулаагүй байна
							</p>
							<p className="text-sm text-orange-600 dark:text-orange-400">
								Та энэ асуултад хариулт өгөөгүй байна
							</p>
						</div>
					</div>
				</div>
			</div>
		) : (
			<>

				{/* Хэрэглэгчийн хариулт хүрээ */}
				<div
					className={`relative overflow-hidden transition-all duration-300 ${
						isQuestionCorrect ? "scale-[1.02]" : ""
					}`}
				>
					{isQuestionCorrect ? (
						<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent" />
					) : (
						<div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent" />
					)}

					<div
						className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
							isQuestionCorrect
								? "border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 shadow-lg shadow-emerald-500/10"
								: "border-red-400 dark:border-red-600 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30 shadow-lg shadow-red-500/10"
						}`}
					>
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<div
									className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
										isQuestionCorrect
											? "bg-gradient-to-br from-emerald-500 to-teal-500"
											: "bg-gradient-to-br from-red-500 to-rose-500"
									}`}
								>
									{isQuestionCorrect ? (
										<CheckCircle className="w-6 h-6 text-white" />
									) : (
										<XCircle className="w-6 h-6 text-white" />
									)}
								</div>

								<p
									className={`font-bold text-base ${
										isQuestionCorrect
											? "text-emerald-800 dark:text-emerald-300"
											: "text-red-800 dark:text-red-300"
									}`}
								>
									Таны хариулт:
								</p>
							</div>

							{/* Хэрэглэгчийн өгсөн бүх хариултын жагсаалт */}
							<div className="flex flex-wrap gap-3">
								{userSelectedAnswers.map((ua: any, idx: number) => {
									
									// --- ШИНЭ ЗӨВ ЛОГИК (answer_id → ХЭЗЭЭ Ч АШИГЛАХГҮЙ) ---
									const correctValues = questionAnswers.map((qa: any) =>
										(qa.answer_name_html || qa.answer_name || "")
											.toString()
											.trim()
									);

									const userValue = (ua.answer || "").toString().trim();

									const isThisCorrect =
										correctValues[idx] === userValue;
									// ------------------------------------------------------

									return (
										<div
											key={idx}
											className={`px-4 py-2 rounded-lg font-medium ${
												isThisCorrect
													? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
													: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
											}`}
										>
											<span className="text-xs opacity-70 mr-2">
												{String.fromCharCode(97 + idx)}:
											</span>
											<span className="text-lg font-bold">{userValue}</span>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Зөв хариулт (буруу үед л харагдана) */}
				{!isQuestionCorrect && questionAnswers.length > 0 && (
					<div className="relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent" />
						<div className="relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-400 dark:border-blue-600 rounded-2xl shadow-sm">
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
										<CheckCircle className="w-6 h-6 text-white" />
									</div>
									<p className="font-bold text-blue-800 dark:text-blue-300 text-base">
										Зөв хариулт:
									</p>
								</div>

								<div className="flex flex-wrap gap-3">
									{questionAnswers.map((qa: any, idx: number) => (
										<div
											key={idx}
											className="px-4 py-2 rounded-lg font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
										>
											<span className="text-xs opacity-70 mr-2">
												{String.fromCharCode(97 + idx)}:
											</span>
											<span className="text-lg font-bold">
												{qa.answer_name_html || qa.answer_name}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}
			</>
		)}
	</div>
)}


	{/* Type 4: Open Answer / Essay */}


	 
	{question.que_type_id === 4 && (
		<div className="space-y-4">
			{userSelectedAnswers.length === 0 ? (
				<div className="relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent" />
					<div className="relative p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border-2 border-orange-400 dark:border-orange-600 rounded-2xl shadow-sm">
						<div className="flex items-center gap-4">
							<div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
								<AlertCircle className="w-6 h-6 text-white" />
							</div>
							<div>
								<p className="font-bold text-orange-800 dark:text-orange-300 text-base">
									Хариулаагүй байна
								</p>
								<p className="text-sm text-orange-600 dark:text-orange-400">
									Та энэ асуултад хариулт өгөөгүй байна
								</p>
							</div>
						</div>
					</div>
				</div>
			) : (
				<>
					{/* User's Answer */}
					<div className={`relative overflow-hidden transition-all duration-300 ${
						isQuestionCorrect ? 'scale-[1.02]' : ''
					}`}>
						{isQuestionCorrect && (
							<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent" />
						)}
						{!isQuestionCorrect && (
							<div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent" />
						)}
						
						<div className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
							isQuestionCorrect
								? 'border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 shadow-lg shadow-emerald-500/10'
								: 'border-red-400 dark:border-red-600 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30 shadow-lg shadow-red-500/10'
						}`}>
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
										isQuestionCorrect
											? 'bg-gradient-to-br from-emerald-500 to-teal-500'
											: 'bg-gradient-to-br from-red-500 to-rose-500'
									}`}>
										{isQuestionCorrect ? (
											<CheckCircle className="w-6 h-6 text-white" />
										) : (
											<XCircle className="w-6 h-6 text-white" />
										)}
									</div>
									<p className={`font-bold text-base ${
										isQuestionCorrect
											? 'text-emerald-800 dark:text-emerald-300'
											: 'text-red-800 dark:text-red-300'
									}`}>
										Таны хариулт:
									</p>
								</div>
								<div className={`p-4 rounded-xl ${
									isQuestionCorrect
										? 'bg-white/50 dark:bg-emerald-900/20'
										: 'bg-white/50 dark:bg-red-900/20'
								}`}>
									<p className="text-base leading-relaxed whitespace-pre-wrap">
										{userSelectedAnswers[0]?.answer}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Show Correct Answer if exists and wrong */}
					{!isQuestionCorrect && questionAnswers.length > 0 && questionAnswers[0]?.answer_name && (
						<div className="relative overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent" />
							<div className="relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-400 dark:border-blue-600 rounded-2xl shadow-sm">
								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
											<CheckCircle className="w-6 h-6 text-white" />
										</div>
										<p className="font-bold text-blue-800 dark:text-blue-300 text-base">
											Зөв хариулт / Жишээ хариулт:
										</p>
									</div>
									<div className="p-4 bg-white/50 dark:bg-blue-900/20 rounded-xl">
										<p className="text-base leading-relaxed whitespace-pre-wrap">
											{questionAnswers[0]?.answer_name_html 
												? safeParse(questionAnswers[0].answer_name_html)
												: questionAnswers[0]?.answer_name}
										</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	)}

	{/* Other question types */}
	{![1, 2, 3, 4].includes(question.que_type_id) && (
		<div className="p-4 bg-muted/50 rounded-xl border border-dashed">
			<p className="text-sm text-muted-foreground text-center">
				Энэ төрлийн асуулт хараахан дэмжигдээгүй байна
			</p>
		</div>
	)}
</div>

									
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}

export default ExamResultDetailPage;