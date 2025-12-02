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
import type {
	Answer,
	ExamResponseMoreApiResponse,
	ExamSummary, // нэмэх
	Question, // нэмэх
	UserAnswer,
} from "@/types/exam/examResultMore";

function ExamResultDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { userId } = useAuthStore();
	const [answerFilter, setAnswerFilter] = useState<"all" | "correct" | "wrong">(
		"all",
	);

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
		if (!html || typeof html !== "string" || html.trim() === "") return "";
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
						<h3 className="text-2xl font-bold mb-2">
							Хэрэглэгч нэвтрээгүй байна
						</h3>
						<p className="text-muted-foreground">
							Та эхлээд системд нэвтэрнэ үү
						</p>
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
						<UseAnimations
							animation={loading2}
							size={80}
							strokeColor="hsl(var(--primary))"
							loop
						/>
					</div>
					<div className="space-y-2 text-center">
						<p className="text-xl font-bold animate-pulse">Ачааллаж байна...</p>
						<p className="text-sm text-muted-foreground">
							Шалгалтын дэлгэрэнгүй мэдээллийг уншиж байна
						</p>
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
					<p className="text-sm text-destructive/80">
						{(error as Error).message}
					</p>
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
						{data?.RetResponse?.ResponseMessage ||
							"Шалгалтын дэлгэрэнгүй мэдээлэл олдсонгүй"}
					</p>
					<Button onClick={() => router.back()}>Буцах</Button>
				</div>
			</div>
		);
	}

	const examSummary: ExamSummary | undefined = data.RetDataFirst?.[0];
	const questions: Question[] = data.RetDataSecond;
	const answers: Answer[] = data.RetDataThirt;
	const userAnswers: UserAnswer[] = data.RetDataFourth;

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
						<h2 className="text-2xl font-bold mb-4">
							{examSummary.lesson_name}
						</h2>

						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
							{/* Нийт асуулт */}
							<div className="p-4 bg-primary/10 rounded-xl">
								<p className="text-sm text-muted-foreground">Нийт асуулт</p>
								<p className="text-2xl font-bold text-primary">
									{examSummary.test_ttl}
								</p>
							</div>

							{/* Авах оноо | Авсан оноо */}
							<div className="p-4 bg-yellow-400/10 rounded-xl flex justify-between items-center">
								{/* Зүүн тал: Авах оноо */}
								<div className="text-center flex-1">
									<p className="text-sm text-muted-foreground">Авах оноо</p>
									<p className="text-2xl font-bold text-yellow-600">
										{examSummary.ttl_point}
									</p>
								</div>

								{/* Тусгаарлагч */}
								<div className="mx-4 text-2xl font-bold text-muted-foreground">
									|
								</div>

								{/* Баруун тал: Авсан оноо */}
								<div className="text-center flex-1">
									<p className="text-sm text-muted-foreground">Авсан оноо</p>
									<p className="text-2xl font-bold text-primary">
										{examSummary.point}
									</p>
								</div>
							</div>

							{/* Зөв хариулт */}
							<div className="p-4 bg-emerald-500/10 rounded-xl">
								<p className="text-sm text-muted-foreground">Зөв хариулт</p>
								<p className="text-2xl font-bold text-emerald-600">
									{examSummary.correct_ttl}
								</p>
							</div>

							{/* Буруу хариулт */}
							<div className="p-4 bg-red-500/10 rounded-xl">
								<p className="text-sm text-muted-foreground">Буруу хариулт</p>
								<p className="text-2xl font-bold text-red-600">
									{examSummary.wrong_ttl}
								</p>
							</div>

							{/* Шалгалтын хувь */}
							<div className="p-4 bg-blue-500/10 rounded-xl">
								<p className="text-sm text-muted-foreground">Шалгалтын хувь</p>
								<p className="text-2xl font-bold text-blue-600">
									{examSummary.point_perc.toFixed(1)}%
								</p>
							</div>
						</div>
					</div>
				)}

				<Button
					onClick={() => router.back()}
					variant="outline"
					className="gap-2"
				>
					<ArrowLeft className="w-5 h-5" />
					Буцах
				</Button>

				{/* Filter buttons - Global for all questions */}
				<div className="bg-card border rounded-2xl p-4 shadow-lg">
					<div className="flex items-center gap-4 flex-wrap">
						<span className="text-sm font-semibold text-muted-foreground">
							Асуултууд:
						</span>
						<div className="flex gap-2 flex-wrap">
							<Button
								onClick={() => setAnswerFilter("all")}
								className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
									answerFilter === "all"
										? "bg-primary text-primary-foreground shadow-lg"
										: "bg-muted text-muted-foreground hover:bg-muted/80"
								}`}
							>
								Бүх асуулт
							</Button>
							<Button
								onClick={() => setAnswerFilter("correct")}
								className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
									answerFilter === "correct"
										? "bg-emerald-500 text-white shadow-lg"
										: "bg-muted text-muted-foreground hover:bg-muted/80"
								}`}
							>
								Зөв хариулсан
							</Button>
							<Button
								onClick={() => setAnswerFilter("wrong")}
								className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
									answerFilter === "wrong"
										? "bg-red-500 text-white shadow-lg"
										: "bg-muted text-muted-foreground hover:bg-muted/80"
								}`}
							>
								Буруу хариулсан
							</Button>
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
								const questionAnswers =
									answers?.filter(
										(answer) => answer.exam_que_id === question.exam_que_id,
									) || [];

								const userSelectedAnswers =
									userAnswers?.filter(
										(ua) => ua.exam_que_id === question.exam_que_id,
									) || [];

								// isQuestionCorrect функц дотор type 3-ын шалгалт нэмэх:

								const isQuestionCorrect = (() => {
									if (userSelectedAnswers.length === 0) return false;

									if (question.que_type_id === 1) {
										// Single choice
										const correctAnswer = questionAnswers.find(
											(a: Answer) => a.is_true === 1,
										);
										const userAnswer = userSelectedAnswers[0];
										return (
											userAnswer &&
											correctAnswer &&
											userAnswer.answer_id === correctAnswer.answer_id
										);
									} else if (question.que_type_id === 2) {
										// Multiple choice
										const correctAnswers = questionAnswers.filter(
											(a: Answer) => a.is_true === 1,
										);
										return (
											correctAnswers.length === userSelectedAnswers.length &&
											correctAnswers.every((ca: Answer) =>
												userSelectedAnswers.some(
													(ua: UserAnswer) => ua.answer_id === ca.answer_id,
												),
											)
										);
									} else if (question.que_type_id === 3) {
										// Number input - Бүх хариулт зөв эсэхийг шалгах
										return questionAnswers.every((answer: Answer) => {
											const userInput = userSelectedAnswers.find(
												(ua: UserAnswer) => ua.answer_id === answer.answer_id,
											);
											if (!userInput) return false;

											const correctAnswer =
												answer.answer_name_html || answer.answer_name;
											return userInput.answer === correctAnswer;
										});
									} else if (question.que_type_id === 4) {
										const userAnswer = userSelectedAnswers[0];
										return (
											userAnswer?.answer && userAnswer.answer.trim() !== ""
										);
									} else if (question.que_type_id === 5) {
										return questionAnswers.every((answer: Answer) => {
											const userInput = userSelectedAnswers.find(
												(ua: UserAnswer) => ua.answer_id === answer.answer_id,
											);
											if (!userInput) return false;

											// Зөв дараалал нь refid-тай тэнцүү байх ёстой
											return parseInt(userInput.answer, 10) === answer.refid;
										});
									} else if (question.que_type_id === 6) {
										// Matching question - Бүх харгалзуулалт зөв эсэхийг шалгах
										const questionsOnly = questionAnswers.filter(
											(a: Answer) => a.ref_child_id === -1,
										);
										const answersOnly = questionAnswers.filter(
											(a: Answer) => a.ref_child_id && a.ref_child_id >= 1,
										);

										// Бүх асуулт зөв харгалзуулагдсан эсэхийг шалгах
										return questionsOnly.every((questionItem: Answer) => {
											// Энэ асуултын зөв хариулт (refid ижил байх ёстой)
											const correctAnswer = answersOnly.find(
												(a: Answer) => a.refid === questionItem.refid,
											);

											if (!correctAnswer) return false;

											// Хэрэглэгчийн сонгосон хариулт
											const userInput = userSelectedAnswers.find(
												(ua: UserAnswer) =>
													ua.answer_id === correctAnswer.answer_id,
											);

											if (!userInput) return false;

											// Хэрэглэгчийн сонгосон хариулт нь зөв асуулттай холбогдсон эсэхийг шалгах
											return (
												parseInt(userInput.answer, 10) === questionItem.refid
											);
										});
									}

									return false;
								})();

								return {
									question,
									index,
									questionAnswers,
									userSelectedAnswers,
									isQuestionCorrect,
								};
							})
							.filter(({ isQuestionCorrect, userSelectedAnswers }) => {
								if (answerFilter === "all") return true;
								if (answerFilter === "correct")
									return isQuestionCorrect && userSelectedAnswers.length > 0;
								if (answerFilter === "wrong")
									return !isQuestionCorrect && userSelectedAnswers.length > 0;
								return true;
							})
							.map(
								({
									question,
									index,
									questionAnswers,
									userSelectedAnswers,
									isQuestionCorrect,
								}) => {
									const earnedPoints = isQuestionCorrect
										? question.que_onoo
										: 0;

									return (
										<div
											key={question.exam_que_id}
											className={`border rounded-2xl p-6 shadow-lg ${
												userSelectedAnswers.length === 0
													? "bg-orange-50 dark:bg-orange-950/20 border-orange-500"
													: isQuestionCorrect
														? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500"
														: "bg-red-50 dark:bg-red-950/20 border-red-500"
											}`}
										>
											<div className="flex items-start gap-4 mb-6">
												<div
													className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
														userSelectedAnswers.length === 0
															? "bg-orange-500 text-white"
															: isQuestionCorrect
																? "bg-emerald-500 text-white"
																: "bg-red-500 text-white"
													}`}
												>
													<span>{index + 1}</span>
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2 flex-wrap">
														<span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg">
															{getQuestionTypeLabel(question.que_type_id)}
														</span>
														<span className="text-sm text-muted-foreground">
															Нийт: {question.que_onoo} оноо
														</span>
														<div
															className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base shadow-lg ${
																userSelectedAnswers.length === 0
																	? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
																	: isQuestionCorrect
																		? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
																		: "bg-gradient-to-r from-red-500 to-rose-500 text-white"
															}`}
														>
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
																	<span>Зөв хариулсан</span>
																	<div className="ml-2 px-2 py-1 bg-white/20 rounded-lg">
																		{earnedPoints}/{question.que_onoo}
																	</div>
																</>
															) : (
																<>
																	<XCircle className="w-5 h-5" />
																	<span>Буруу хариулсан</span>
																	<div className="ml-2 px-2 py-1 bg-white/20 rounded-lg">
																		0/{question.que_onoo}
																	</div>
																</>
															)}
														</div>
													</div>
													<div className="text-lg font-medium">
														{question.question_name &&
														question.question_name.trim() !== "" ? (
															safeParse(question.question_name)
														) : question.question_img &&
															question.question_img.trim() !== "" ? (
															<Image
																src={question.question_img}
																alt="Question"
																width={400}
																height={300}
																className="rounded-lg mt-2"
															/>
														) : (
															"Асуулт байхгүй"
														)}
													</div>
												</div>
											</div>
											<div className="space-y-4 pl-14">
												{question.que_type_id === 1 ||
												question.que_type_id === 2 ? (
													questionAnswers.length === 0 ? (
														<p className="text-sm text-muted-foreground">
															Хариулт олдсонгүй
														</p>
													) : (
														<div className="space-y-4">
															{/* Бүх хариултууд */}
															<div className="space-y-3">
																{questionAnswers.map((answer, idx) => {
																	const isCorrect = answer.is_true === 1;
																	const isUserSelected =
																		userSelectedAnswers.some(
																			(ua) => ua.answer_id === answer.answer_id,
																		);
																	const isWrongSelection =
																		isUserSelected && !isCorrect;

																	return (
																		<div
																			key={answer.answer_id}
																			className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
																				isWrongSelection
																					? "border-red-400 bg-red-50 dark:bg-red-950/10 shadow-lg"
																					: isUserSelected
																						? "border-blue-400 bg-blue-50 dark:bg-blue-950/20 shadow-lg"
																						: "border-border bg-card/50"
																			}`}
																		>
																			<div className="flex flex-col items-center gap-2">
																				<div
																					className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
																						isWrongSelection
																							? "bg-red-500 text-white"
																							: isUserSelected
																								? "bg-blue-500 text-white"
																								: "bg-muted text-muted-foreground"
																					}`}
																				>
																					{String.fromCharCode(65 + idx)}
																				</div>
																			</div>

																			<div className="flex-1 min-w-0">
																				<div className="text-base leading-relaxed font-medium">
																					{answer.answer_name_html &&
																					answer.answer_name_html.trim() !==
																						"" ? (
																						safeParse(answer.answer_name_html)
																					) : answer.answer_name &&
																						answer.answer_name.trim() !== "" ? (
																						safeParse(answer.answer_name)
																					) : answer.answer_img &&
																						answer.answer_img.trim() !== "" ? (
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

																			<div className="flex-shrink-0">
																				{isUserSelected && isCorrect && (
																					<div className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg font-bold text-sm">
																						✓ Зөв
																					</div>
																				)}
																				{isWrongSelection && (
																					<div className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-lg font-bold text-sm">
																						✗ Буруу
																					</div>
																				)}
																				{isUserSelected &&
																					!isCorrect &&
																					!isWrongSelection && (
																						<div className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow-lg font-bold text-sm">
																							✓ Та сонгосон
																						</div>
																					)}
																			</div>
																		</div>
																	);
																})}
															</div>

															{/* Зөв хариулт доор тусдаа card */}
															<div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl shadow-sm">
																<p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
																	★ Зөв хариулт:
																</p>
																{questionAnswers
																	.filter((answer) => answer.is_true === 1)
																	.map((answer, idx) => (
																		<div
																			key={answer.answer_id}
																			className="flex items-start gap-3 mb-2"
																		>
																			<div className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-500 text-white text-xs font-bold">
																				{String.fromCharCode(65 + idx)}
																			</div>
																			<div className="text-base leading-relaxed">
																				{answer.answer_name_html &&
																				answer.answer_name_html.trim() !==
																					"" ? (
																					safeParse(answer.answer_name_html)
																				) : answer.answer_name &&
																					answer.answer_name.trim() !== "" ? (
																					safeParse(answer.answer_name)
																				) : answer.answer_img &&
																					answer.answer_img.trim() !== "" ? (
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
													)
												) : question.que_type_id === 3 ? (
													<div className="space-y-4">
														<div className="space-y-3">
															{questionAnswers.map((answer, idx) => {
																const userInput = userSelectedAnswers.find(
																	(ua) => ua.answer_id === answer.answer_id,
																);
																const correctAnswer =
																	answer.answer_name_html || answer.answer_name;
																const isCorrect =
																	userInput?.answer === correctAnswer;

																return (
																	<div
																		key={answer.answer_id}
																		className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${
																			userInput
																				? isCorrect
																					? "border-blue-400 bg-emerald-50 dark:bg-emerald-950/10 shadow-lg"
																					: "border-red-400 bg-red-50 dark:bg-red-950/10 shadow-lg"
																				: "border-orange-400 bg-orange-50 dark:bg-orange-950/10"
																		}`}
																	>
																		<div className="flex-shrink-0">
																			<div
																				className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
																					userInput
																						? isCorrect
																							? "bg-emerald-500 text-white"
																							: "bg-red-500 text-white"
																						: "bg-orange-500 text-white"
																				}`}
																			>
																				{String.fromCharCode(97 + idx)}
																			</div>
																		</div>

																		{/* Асуултын label ба зураг */}
																		<div className="flex-1 min-w-0">
																			<div className="flex items-center gap-4">
																				{/* answer_name (a, b, c label) */}
																				{answer.answer_name &&
																					answer.answer_name.trim() !== "" && (
																						<div className="text-base font-semibold text-muted-foreground">
																							{answer.answer_name} =
																						</div>
																					)}

																				{/* Зураг хэрэв байвал */}
																				{answer.answer_img &&
																					answer.answer_img.trim() !== "" &&
																					!answer.answer_img.includes(
																						"/QuestionBank/",
																					) && (
																						<Image
																							src={answer.answer_img}
																							alt="Question"
																							width={150}
																							height={100}
																							className="rounded-lg shadow-md"
																						/>
																					)}

																				{/* Хэрэглэгчийн оруулсан хариулт */}
																				{userInput ? (
																					<div className="flex items-center gap-3">
																						<span className="text-sm text-muted-foreground">
																							Таны хариулт:
																						</span>
																						<span
																							className={`font-bold text-2xl ${
																								isCorrect
																									? "text-emerald-600"
																									: "text-red-600"
																							}`}
																						>
																							{userInput.answer}
																						</span>
																					</div>
																				) : (
																					<span className="text-orange-600 font-medium">
																						Хариулаагүй
																					</span>
																				)}
																			</div>
																		</div>

																		{/* Status Badge */}
																		<div className="flex-shrink-0">
																			{userInput && isCorrect && (
																				<div className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg font-bold text-sm">
																					✓ Зөв
																				</div>
																			)}
																			{userInput && !isCorrect && (
																				<div className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-lg font-bold text-sm">
																					✗ Буруу
																				</div>
																			)}
																		</div>
																	</div>
																);
															})}
														</div>

														{/* Зөв хариултууд */}
														<div className="mt-4 p-5 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl shadow-sm">
															<p className="text-base font-bold text-emerald-700 dark:text-emerald-300 mb-4">
																★ Зөв хариултууд:
															</p>
															<div className="space-y-3">
																{questionAnswers.map((answer, idx) => {
																	const correctAnswer =
																		answer.answer_name_html ||
																		answer.answer_name;
																	return (
																		<div
																			key={answer.answer_id}
																			className="flex items-center gap-4"
																		>
																			<div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500 text-white text-sm font-bold flex-shrink-0">
																				{String.fromCharCode(97 + idx)}
																			</div>
																			<div className="text-base">
																				{answer.answer_name &&
																					answer.answer_name.trim() !== "" && (
																						<span className="text-muted-foreground font-semibold mr-2">
																							{answer.answer_name} =
																						</span>
																					)}
																				<span className="font-bold text-lg text-emerald-700 dark:text-emerald-400">
																					{correctAnswer}
																				</span>
																			</div>
																		</div>
																	);
																})}
															</div>
														</div>
													</div>
												) : question.que_type_id === 4 ? (
													/* ЗАДГАЙ ДААЛГАВАР */
													<div className="space-y-4">
														{/* Хэрэглэгчийн бичсэн хариулт */}
														<div className="p-6 rounded-2xl border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/20 shadow-lg">
															<div className="flex items-start gap-4">
																{/* Icon */}
																<div className="flex-shrink-0">
																	<div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center">
																		<svg
																			className="w-6 h-6"
																			fill="none"
																			stroke="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<title>asd</title>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth={2}
																				d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
																			/>
																		</svg>
																	</div>
																</div>

																{/* Хариултын агуулга */}
																<div className="flex-1 min-w-0">
																	<p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
																		Таны бичсэн хариулт:
																	</p>
																	{userSelectedAnswers.length > 0 &&
																	userSelectedAnswers[0]?.answer ? (
																		<div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800">
																			<p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
																				{userSelectedAnswers[0].answer}
																			</p>
																		</div>
																	) : (
																		<div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-300 dark:border-orange-700">
																			<p className="text-orange-600 dark:text-orange-400 font-medium">
																				Хариулт бичээгүй байна
																			</p>
																		</div>
																	)}
																</div>
															</div>
														</div>

														{/* Багшийн үнэлгээ */}
														<div className="p-5 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-400 dark:border-amber-600 rounded-2xl shadow-sm">
															<div className="flex items-start gap-3">
																<div className="flex-shrink-0">
																	<div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
																		<svg
																			className="w-5 h-5"
																			fill="none"
																			stroke="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<title>asd</title>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth={2}
																				d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
																			/>
																		</svg>
																	</div>
																</div>
																<div className="flex-1">
																	<p className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-2">
																		⏳ Багшийн үнэлгээ хүлээгдэж байна
																	</p>
																	<p className="text-sm text-amber-600 dark:text-amber-400">
																		Задгай даалгавар нь багш шууд үнэлдэг тул
																		оноо хараахан тооцогдоогүй байна. Багш
																		үнэлсний дараа оноо харагдах болно.
																	</p>
																</div>
															</div>
														</div>
													</div>
												) : question.que_type_id === 5 ? (
													<div className="space-y-4">
														{/* Хэрэглэгчийн оруулсан дараалал */}
														<div className="space-y-3">
															<p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
																Таны оруулсан дараалал:
															</p>

															{questionAnswers
																.sort((a, b) => {
																	// Хэрэглэгчийн оруулсан дарааллаар эрэмбэлэх
																	const userA = userSelectedAnswers.find(
																		(ua) => ua.answer_id === a.answer_id,
																	);
																	const userB = userSelectedAnswers.find(
																		(ua) => ua.answer_id === b.answer_id,
																	);
																	const posA = userA
																		? parseInt(userA.answer, 10)
																		: 999;
																	const posB = userB
																		? parseInt(userB.answer, 10)
																		: 999;
																	return posA - posB;
																})
																.map((answer) => {
																	const userInput = userSelectedAnswers.find(
																		(ua) => ua.answer_id === answer.answer_id,
																	);

																	// Зөв дараалал (refid)
																	const correctPosition = answer.refid;
																	const userPosition = userInput
																		? parseInt(userInput.answer, 10)
																		: null;
																	const isCorrect =
																		userPosition === correctPosition;

																	return (
																		<div
																			key={answer.answer_id}
																			className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
																				!userInput
																					? "border-orange-400 bg-orange-50 dark:bg-orange-950/10"
																					: "border-blue-400 bg-blue-50 dark:bg-blue-950/20 shadow-lg"
																			}`}
																		>
																			{/* Хэрэглэгчийн оруулсан дугаар */}
																			<div className="flex-shrink-0">
																				<div
																					className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
																						!userInput
																							? "bg-orange-500 text-white"
																							: "bg-blue-500 text-white"
																					}`}
																				>
																					{userPosition || "?"}
																				</div>
																			</div>

																			{/* Хариултын текст */}
																			<div className="flex-1 min-w-0">
																				<div className="text-base font-medium text-foreground">
																					{answer.answer_name_html ||
																						answer.answer_name ||
																						"Хариулт"}
																				</div>
																			</div>

																			{/* Status badge */}
																			<div className="flex-shrink-0">
																				{userInput && isCorrect && (
																					<div className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg font-bold text-sm">
																						✓ Зөв
																					</div>
																				)}
																				{userInput && !isCorrect && (
																					<div className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-lg font-bold text-sm">
																						✗ Буруу
																					</div>
																				)}
																				{!userInput && (
																					<div className="px-4 py-2 bg-orange-500 text-white rounded-xl shadow-lg font-bold text-sm">
																						! Хариулаагүй
																					</div>
																				)}
																			</div>
																		</div>
																	);
																})}
														</div>

														{/* Зөв дараалал */}
														<div className="mt-4 p-5 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl shadow-sm">
															<p className="text-base font-bold text-emerald-700 dark:text-emerald-300 mb-4">
																★ Зөв дараалал:
															</p>
															<div className="space-y-3">
																{questionAnswers
																	.sort((a, b) => a.refid - b.refid)
																	.map((answer) => (
																		<div
																			key={answer.answer_id}
																			className="flex items-center gap-4"
																		>
																			<div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500 text-white text-base font-bold flex-shrink-0">
																				{answer.refid}
																			</div>
																			<div className="text-base font-medium text-foreground">
																				{answer.answer_name_html ||
																					answer.answer_name ||
																					"Хариулт"}
																			</div>
																		</div>
																	))}
															</div>
														</div>
													</div>
												) : question.que_type_id === 6 ? (
													/* ХАРГАЛЗУУЛАХ АСУУЛТ */
													<div className="space-y-4">
														{(() => {
															// Separate into questions (б column) and answers (а column)
															const questionsOnly = questionAnswers.filter(
																(a) => a.ref_child_id === -1,
															);
															const answersOnly = questionAnswers.filter(
																(a) => a.ref_child_id && a.ref_child_id >= 1,
															);

															return (
																<>
																	{/* Хэрэглэгчийн харгалзуулсан хариултууд */}
																	<div className="space-y-3">
																		<p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
																			Таны харгалзуулсан хариултууд:
																		</p>

																		{questionsOnly.map((questionItem) => {
																			// Find the correct answer for this question (same refid)
																			const correctAnswer = answersOnly.find(
																				(a) => a.refid === questionItem.refid,
																			);

																			// Find user's selection for this question
																			// User data format: answer_id points to the answer item (а column)
																			const userMatch = correctAnswer
																				? userSelectedAnswers.find(
																						(ua) =>
																							ua.answer_id ===
																							correctAnswer.answer_id,
																					)
																				: null;

																			// Find which question the user matched to
																			const userSelectedQuestion = userMatch
																				? questionsOnly.find(
																						(q) =>
																							q.refid ===
																							parseInt(userMatch.answer, 10),
																					)
																				: null;

																			const isCorrect =
																				userMatch &&
																				userSelectedQuestion &&
																				userSelectedQuestion.refid ===
																					questionItem.refid;

																			return (
																				<div
																					key={questionItem.answer_id}
																					className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${
																						!userMatch
																							? "border-orange-400 bg-orange-50 dark:bg-orange-950/10"
																							: isCorrect
																								? "border-blue-400 bg-emerald-50 dark:bg-emerald-950/20 shadow-lg"
																								: "border-blue-400 bg-red-50 dark:bg-red-950/10 shadow-lg"
																					}`}
																				>
																					{/* Right side - Answer (а column) */}
																					<div className="flex items-center gap-3 flex-1">
																						<div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
																							{correctAnswer?.answer_descr ||
																								"?"}
																						</div>
																						<div className="text-base font-medium">
																							{correctAnswer?.answer_name_html ||
																								correctAnswer?.answer_name ||
																								"Хариулт"}
																						</div>
																					</div>

																					{/* Arrow */}
																					<div className="text-2xl text-muted-foreground flex-shrink-0">
																						→
																					</div>

																					{/* Left side - Question (б column) - User's selection */}
																					<div className="flex items-center gap-3 flex-1">
																						{userSelectedQuestion ? (
																							<>
																								<div
																									className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${
																										isCorrect
																											? "bg-emerald-500 text-white"
																											: "bg-red-500 text-white"
																									}`}
																								>
																									{
																										userSelectedQuestion.answer_descr
																									}
																								</div>
																								<div className="text-base font-medium">
																									{userSelectedQuestion.answer_name_html ||
																										userSelectedQuestion.answer_name}
																								</div>
																							</>
																						) : (
																							<span className="text-orange-600 font-medium">
																								Харгалзуулаагүй
																							</span>
																						)}
																					</div>

																					{/* Status badge */}
																					<div className="flex-shrink-0">
																						{userMatch && isCorrect && (
																							<div className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg font-bold text-sm">
																								✓ Зөв
																							</div>
																						)}
																						{userMatch && !isCorrect && (
																							<div className="px-4 py-2 bg-red-500 text-white rounded-xl shadow-lg font-bold text-sm">
																								✗ Буруу
																							</div>
																						)}
																						{!userMatch && (
																							<div className="px-4 py-2 bg-orange-500 text-white rounded-xl shadow-lg font-bold text-sm">
																								! Хариулаагүй
																							</div>
																						)}
																					</div>
																				</div>
																			);
																		})}
																	</div>

																	{/* Зөв харгалзуулалт */}
																	<div className="mt-4 p-5 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl shadow-sm">
																		<p className="text-base font-bold text-emerald-700 dark:text-emerald-300 mb-4">
																			★ Зөв харгалзуулалт:
																		</p>
																		<div className="space-y-3">
																			{questionsOnly.map((questionItem) => {
																				const correctAnswer = answersOnly.find(
																					(a) => a.refid === questionItem.refid,
																				);

																				return (
																					<div
																						key={questionItem.answer_id}
																						className="flex items-center gap-4"
																					>
																						{/* Answer (а column) */}
																						<div className="flex items-center gap-3 flex-1">
																							<div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
																								{correctAnswer?.answer_descr ||
																									"?"}
																							</div>
																							<div className="text-base font-medium">
																								{correctAnswer?.answer_name_html ||
																									correctAnswer?.answer_name ||
																									"Хариулт"}
																							</div>
																						</div>

																						{/* Arrow */}
																						<div className="text-2xl text-emerald-600 flex-shrink-0">
																							→
																						</div>

																						{/* Question (б column) */}
																						<div className="flex items-center gap-3 flex-1">
																							<div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
																								{questionItem.answer_descr}
																							</div>
																							<div className="text-base font-medium">
																								{questionItem.answer_name_html ||
																									questionItem.answer_name}
																							</div>
																						</div>
																					</div>
																				);
																			})}
																		</div>
																	</div>
																</>
															);
														})()}
													</div>
												) : (
													<p className="text-sm text-muted-foreground">
														Энэ төрлийн асуулт хараахан дэмжигдээгүй байна
													</p>
												)}
											</div>
										</div>
									);
								},
							)
					)}
				</div>
			</div>
		</div>
	);
}

export default ExamResultDetailPage;
