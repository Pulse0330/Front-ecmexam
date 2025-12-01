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
										const correctAnswer = questionAnswers.find((a: any) => a.is_true === 1);
										const userAnswer = userSelectedAnswers[0];
										return userAnswer && correctAnswer && userAnswer.answer_id === correctAnswer.answer_id;
									} else if (question.que_type_id === 2) {
										const correctAnswers = questionAnswers.filter((a: any) => a.is_true === 1);
										return correctAnswers.length === userSelectedAnswers.length &&
											correctAnswers.every((ca: any) => userSelectedAnswers.some((ua: any) => ua.answer_id === ca.answer_id));
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
										{question.que_type_id === 1 || question.que_type_id === 2 ? (
											<>
												{questionAnswers.length === 0 ? (
													<p className="text-sm text-muted-foreground">Хариулт олдсонгүй</p>
												) : (
													<div className="space-y-4">
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
																				Та энэ асуултад хариулт өгөөгүй байна
																			</p>
																		</div>
																	</div>
																</div>
															</div>
														)}
														
														<div className="space-y-3">
															{questionAnswers
																.map((answer, idx) => {
																	const isCorrect = answer.is_true === 1;
																	const isUserSelected = userSelectedAnswers.some(ua => ua.answer_id === answer.answer_id);
																	const isWrongSelection = isUserSelected && !isCorrect;
																	const showCorrectAnswer = isCorrect && !isQuestionCorrect && userSelectedAnswers.length > 0;
																	const isHighlighted = showCorrectAnswer || isUserSelected;
																	
																	return (
																		<div
																			key={answer.answer_id}
																			className={`group relative overflow-hidden transition-all duration-300 ${
																				isHighlighted ? 'scale-[1.02]' : ''
																			}`}
																		>
																			{(showCorrectAnswer || (isUserSelected && isCorrect)) && (
																				<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent" />
																			)}
																			{isWrongSelection && (
																				<div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent" />
																			)}
																			
																			<div
																				className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
																					showCorrectAnswer || (isUserSelected && isCorrect)
																						? 'border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 shadow-lg shadow-emerald-500/10'
																						: isWrongSelection
																						? 'border-red-400 dark:border-red-600 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30 shadow-lg shadow-red-500/10'
																						: 'border-border bg-card/50'
																				}`}
																			>
																				<div className="flex flex-col items-center gap-2">
																					<div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
																						showCorrectAnswer || (isUserSelected && isCorrect)
																							? 'bg-emerald-500 text-white'
																							: isWrongSelection
																							? 'bg-red-500 text-white'
																							: 'bg-muted text-muted-foreground'
																					}`}>
																						{String.fromCharCode(65 + idx)}
																					</div>
																					
																					<div className="flex-shrink-0">
																						{showCorrectAnswer || (isUserSelected && isCorrect) ? (
																							<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
																								<CheckCircle className="w-6 h-6 text-white" />
																							</div>
																						) : isWrongSelection ? (
																							<div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
																								<XCircle className="w-6 h-6 text-white" />
																							</div>
																						) : (
																							<div className="w-10 h-10 rounded-xl border-2 border-dashed border-muted-foreground/30" />
																						)}
																					</div>
																				</div>
																				
																				<div className="flex-1 min-w-0">
																					<div className={`text-base leading-relaxed ${
																						isHighlighted ? 'font-medium' : ''
																					}`}>
																						{answer.answer_name_html && answer.answer_name_html.trim() !== '' ? (
																							safeParse(answer.answer_name_html)
																						) : answer.answer_name && answer.answer_name.trim() !== '' ? (
																							safeParse(answer.answer_name)
																						) : answer.answer_img && answer.answer_img.trim() !== '' ? (
																							<Image
																								src={answer.answer_img}
																								alt="Answer"
																								width={300}
																								height={200}
																								className="rounded-xl shadow-md mt-2"
																							/>
																						) : (
																							'Хариулт байхгүй'
																						)}
																					</div>
																				</div>
																				
																				<div className="flex-shrink-0">
																					{isUserSelected && isCorrect && (
																						<div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg font-bold text-sm">
																							✓ Зөв
																						</div>
																					)}
																					{isWrongSelection && (
																						<div className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl shadow-lg font-bold text-sm">
																							✗ Буруу
																						</div>
																					)}
																					{showCorrectAnswer && (
																						<div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg font-bold text-sm">
																							★ Зөв хариулт
																						</div>
																					)}
																				</div>
																			</div>
																		</div>
																	);
																})}
														</div>
													</div>
												)}
											</>
										) : (
											<p className="text-sm text-muted-foreground">Энэ төрлийн асуулт хараахан дэмжигдээгүй байна</p>
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