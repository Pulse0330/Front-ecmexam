"use client";

import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import {
	AlertCircle,
	ArrowLeft,
	CheckCircle,
	MinusCircle,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getExamDun, getExamResultMore } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamDunApiResponse } from "@/types/exam/examDun";
import type {
	Answer,
	ExamResponseMoreApiResponse,
	ExamSummary,
	Question,
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

	const { data, isLoading, isError, error } =
		useQuery<ExamResponseMoreApiResponse>({
			queryKey: ["examResultDetail", testId, examId, userId],
			queryFn: () => getExamResultMore(testId, examId, userId || 0),
			enabled: !!userId && !!examId && !!testId,
		});
	const pointPerc = data?.RetDataFirst?.[0]?.point_perc;

	const { data: dunData, isLoading: isLoadingDun } =
		useQuery<ExamDunApiResponse>({
			queryKey: ["examDun", pointPerc],
			queryFn: () => getExamDun(pointPerc ?? 0),
			enabled: typeof pointPerc === "number",
		});

	const _isLoadingAll = isLoading || isLoadingDun;
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

	const calculatePartialPoints = (
		question: Question,
		questionAnswers: Answer[],
		userSelectedAnswers: UserAnswer[],
	): number => {
		if (userSelectedAnswers.length === 0) return 0;
		if (question.que_type_id === 4) {
			// Багш үнэлсэн бол түүний өгсөн оноог буцаах
			return question.unelsen === 1 ? question.zad_onoo || 0 : 0;
		}

		if (question.que_type_id === 2) {
			const correctAnswers = questionAnswers.filter((a) => a.is_true === 1);
			const totalCorrect = correctAnswers.length;
			if (totalCorrect === 0) return 0;

			// Хэрэв truecnt-ээс илүү хариулт сонговол шууд 0 оноо
			if (userSelectedAnswers.length > question.truecnt) {
				return 0;
			}

			const correctSelected = userSelectedAnswers.filter((ua) =>
				correctAnswers.some((ca) => ca.answer_id === ua.answer_id),
			).length;

			const incorrectSelected = userSelectedAnswers.filter(
				(ua) => !correctAnswers.some((ca) => ca.answer_id === ua.answer_id),
			).length;

			// Хэрэв буруу хариулт сонговол penalty-тэй
			const basePoints = (correctSelected / totalCorrect) * question.que_onoo;
			const penalty = (incorrectSelected / totalCorrect) * question.que_onoo;

			return Math.max(0, Math.round((basePoints - penalty) * 10) / 10);
		}

		if (question.que_type_id === 3) {
			let correctInputs = 0;
			let incorrectInputs = 0;

			questionAnswers.forEach((answer) => {
				const userInput = userSelectedAnswers.find(
					(ua) => ua.answer_id === answer.answer_id,
				);

				if (userInput) {
					const correctAnswer = answer.answer_name_html || answer.answer_name;

					if (userInput.answer === correctAnswer) {
						correctInputs++;
					} else {
						incorrectInputs++;
					}
				}
			});

			const basePoints =
				(correctInputs / questionAnswers.length) * question.que_onoo;
			const penalty =
				(incorrectInputs / questionAnswers.length) * question.que_onoo;

			return Math.max(0, Math.round((basePoints - penalty) * 10) / 10);
		}

		if (question.que_type_id === 5) {
			let correctOrders = 0;

			questionAnswers.forEach((answer) => {
				const userInput = userSelectedAnswers.find(
					(ua) => ua.answer_id === answer.answer_id,
				);

				if (userInput) {
					if (parseInt(userInput.answer, 10) === answer.refid) {
						correctOrders++;
					}
				}
			});

			// ✅ PENALTY БАЙХГҮЙ - зөвхөн зөв тооноос оноо тооцно
			const points =
				(correctOrders / questionAnswers.length) * question.que_onoo;
			return Math.round(points * 10) / 10;
		}
		if (question.que_type_id === 6) {
			const questionsOnly = questionAnswers.filter(
				(a) => a.ref_child_id === -1,
			);
			const answersOnly = questionAnswers.filter(
				(a) => a.ref_child_id && a.ref_child_id >= 1,
			);

			if (answersOnly.length === 0) return 0;

			let correctMatches = 0;

			answersOnly.forEach((answerItem) => {
				const correctQuestion = questionsOnly.find(
					(q) => q.refid === answerItem.ref_child_id,
				);

				if (!correctQuestion) return;

				const userInput = userSelectedAnswers.find(
					(ua) => ua.answer_id === answerItem.answer_id,
				);

				if (userInput) {
					const userSelectedRefId = parseInt(userInput.answer, 10);
					if (userSelectedRefId === correctQuestion.refid) {
						correctMatches++;
					}
				}
			});

			// ✅ PENALTY БАЙХГҮЙ - зөвхөн зөв тооноос оноо тооцно
			const points = (correctMatches / answersOnly.length) * question.que_onoo;
			return Math.round(points * 10) / 10;
		}

		return 0;
	};

	const getAnswerStatus = (
		isFullyCorrect: boolean | undefined,
		_partialPoints: number,
		userSelectedAnswers: UserAnswer[],
		questionAnswers: Answer[],
		question: Question,
	): "unanswered" | "correct" | "partial" | "incorrect" => {
		// 1. БҮГДЭД хариулаагүй
		if (userSelectedAnswers.length === 0) return "unanswered";

		// 2. ЗАДГАЙ ДААЛГАВАР - багшийн үнэлгээнээс хамаарна
		if (question.que_type_id === 4) {
			if (question.unelsen === 1) {
				// Багш үнэлсэн
				if (question.zad_onoo === question.que_onoo) {
					return "correct"; // Бүтэн оноо авсан
				} else if (question.zad_onoo > 0) {
					return "partial"; // Хэсэгчлэн оноо авсан
				} else {
					return "incorrect"; // 0 оноо авсан
				}
			} else {
				// Багш үнэлээгүй - "хариулаагүй" статус (filter дээр харагдахгүй байхын тулд)
				return "unanswered";
			}
		}

		// 3. Бүгдэд зөв хариулсан
		if (isFullyCorrect === true) return "correct";

		// 4. Хэсэгчилсэн хариулт шалгах
		const answerCheck = (() => {
			if (question.que_type_id === 2) {
				const correctAnswers = questionAnswers.filter((a) => a.is_true === 1);
				const totalRequired = correctAnswers.length;

				const correctSelected = userSelectedAnswers.filter((ua) =>
					correctAnswers.some((ca) => ca.answer_id === ua.answer_id),
				).length;

				const totalAnswered = userSelectedAnswers.length;

				return {
					hasCorrect: correctSelected > 0,
					hasUnanswered: totalAnswered < totalRequired,
					allAnswered: totalAnswered >= totalRequired,
				};
			}

			if (question.que_type_id === 3) {
				let correctCount = 0;
				let answeredCount = 0;

				questionAnswers.forEach((answer) => {
					const userInput = userSelectedAnswers.find(
						(ua) => ua.answer_id === answer.answer_id,
					);
					if (userInput) {
						answeredCount++;
						const correctAnswer = answer.answer_name_html || answer.answer_name;
						if (userInput.answer === correctAnswer) {
							correctCount++;
						}
					}
				});

				return {
					hasCorrect: correctCount > 0,
					hasUnanswered: answeredCount < questionAnswers.length,
					allAnswered: answeredCount === questionAnswers.length,
				};
			}

			if (question.que_type_id === 5) {
				let correctCount = 0;
				let answeredCount = 0;

				questionAnswers.forEach((answer) => {
					const userInput = userSelectedAnswers.find(
						(ua) => ua.answer_id === answer.answer_id,
					);
					if (userInput) {
						answeredCount++;
						if (parseInt(userInput.answer, 10) === answer.refid) {
							correctCount++;
						}
					}
				});

				return {
					hasCorrect: correctCount > 0,
					hasUnanswered: answeredCount < questionAnswers.length,
					allAnswered: answeredCount === questionAnswers.length,
				};
			}

			if (question.que_type_id === 6) {
				const answersOnly = questionAnswers.filter(
					(a) => a.ref_child_id && a.ref_child_id >= 1,
				);

				let correctCount = 0;
				let answeredCount = 0;

				answersOnly.forEach((answerItem) => {
					const userInput = userSelectedAnswers.find(
						(ua) => ua.answer_id === answerItem.answer_id,
					);
					if (userInput) {
						answeredCount++;
						if (parseInt(userInput.answer, 10) === answerItem.ref_child_id) {
							correctCount++;
						}
					}
				});

				return {
					hasCorrect: correctCount > 0,
					hasUnanswered: answeredCount < answersOnly.length,
					allAnswered: answeredCount === answersOnly.length,
				};
			}

			return { hasCorrect: false, hasUnanswered: false, allAnswered: true };
		})();

		// 5. Дутуу хариулсан (зарим хариулаагүй эсвэл зарим зөв)
		if (
			answerCheck.hasUnanswered ||
			(answerCheck.hasCorrect && !isFullyCorrect)
		) {
			return "partial";
		}

		// 6. Бүгдэд хариулсан гэхдээ бүгд буруу
		return "incorrect";
	};

	if (!userId) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
				<div className="text-center space-y-4 p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-2xl max-w-md">
					<div className="w-20 h-20 mx-auto bg-linear-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
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
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
				<div className="flex flex-col items-center space-y-6">
					<div className="relative">
						<div className="absolute inset-0 bg-linear-to-r from-primary/30 to-primary/10 blur-3xl rounded-full animate-pulse" />
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
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
				<div className="max-w-md w-full bg-card rounded-2xl p-8 shadow-2xl text-center space-y-4">
					<div className="w-20 h-20 mx-auto bg-linear-to-br from-destructive/20 to-red-500/20 rounded-full flex items-center justify-center">
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
			<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-muted/20 p-4">
				<div className="text-center space-y-6 p-8 rounded-2xl bg-card/80 backdrop-blur-sm border shadow-2xl max-w-md">
					<div className="w-20 h-20 mx-auto bg-linear-to-br from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center">
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

	const dunInfo = dunData?.RetData?.[0];
	return (
		<div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 py-8 px-4">
			<Button onClick={() => router.back()} variant="outline" className="gap-2">
				<ArrowLeft className="w-5 h-5" />
				Буцах
			</Button>
			<div className="max-w-6xl mx-auto space-y-6">
				{examSummary && (
					<div className="bg-linear-to-br from-card to-card/50 border border-border/50 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
						{/* Толгой хэсэг */}
						<div className="flex justify-end border-border ">
							{dunInfo && (
								<p className="text-right text-xl font-bold ">{dunInfo.title}</p>
							)}
						</div>

						<div className="mb-6 pb-6 border-b border-border/50">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-linear-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
									<svg
										className="w-6 h-6 text-primary-foreground"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>asd</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
								</div>
								<h2 className="text-3xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
									{examSummary.lesson_name}
								</h2>
							</div>
						</div>

						{/* Статистик */}
						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{/* Нийт асуулт */}
							<div className="group relative p-6 bg-linear-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
								<div className="flex items-center justify-between mb-2">
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Нийт асуулт
									</p>
									<div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
										<svg
											className="w-4 h-4 text-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>asd</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
									</div>
								</div>
								<p className="text-4xl font-bold text-primary">
									{examSummary.test_ttl}
								</p>
							</div>

							{/* Оноо харьцуулалт */}
							<div className="group relative p-6 bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-2xl border border-yellow-200/50 dark:border-yellow-900/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
								<div className="space-y-4">
									{/* Авах оноо */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
											<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Авах оноо
											</p>
										</div>
										<p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
											{examSummary.ttl_point}
										</p>
									</div>

									{/* Progress bar */}
									<div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
										<div
											className="absolute inset-y-0 left-0 bg-linear-to-r from-yellow-900 via-amber-500 to-yellow-600 rounded-full transition-all duration-700 ease-out"
											style={{
												width: `${Math.min((examSummary.point / examSummary.ttl_point) * 100, 100)}%`,
											}}
										>
											<div className="absolute inset-0 bg-white/20 animate-pulse" />
										</div>
									</div>

									{/* Авсан оноо */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-primary rounded-full" />
											<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Авсан оноо
											</p>
										</div>
										<p className="text-2xl font-bold text-primary">
											{examSummary.point}
										</p>
									</div>
								</div>
							</div>

							{/* Хариултын статистик - 3 in 1 */}
							<div className="group relative p-6 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
								<div className="space-y-4">
									{/* Зөв хариулт */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
												<svg
													className="w-4 h-4 text-emerald-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<title>Зөв</title>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
											</div>
											<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Зөв
											</p>
										</div>
										<p className="text-2xl font-bold text-emerald-600">
											{examSummary.correct_ttl}
										</p>
									</div>

									{/* Буруу хариулт */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
												<svg
													className="w-4 h-4 text-red-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<title>Буруу</title>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</div>
											<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Буруу
											</p>
										</div>
										<p className="text-2xl font-bold text-red-600">
											{examSummary.wrong_ttl}
										</p>
									</div>
									{/* Хариулаагүй */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
												<svg
													className="w-4 h-4 text-gray-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<title>Хариулаагүй</title>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
											</div>
											<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
												Хариулаагүй
											</p>
										</div>
										<p className="text-2xl font-bold text-gray-600">
											{examSummary.not_answer}
										</p>
									</div>
								</div>
							</div>

							{/* Шалгалтын хувь */}
							<div className="group relative p-6 bg-linear-to-br from-blue-500/10 to-blue-500/5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
								<div className="flex items-center justify-between mb-2">
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Шалгалтын хувь
									</p>
									<div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
										<svg
											className="w-4 h-4 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>asd</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
											/>
										</svg>
									</div>
								</div>
								<div className="flex items-end gap-2">
									{/* 🔥 ТҮВШИН ЭХЭНД */}

									{/* 🔥 ХУВЬ ДАРАА НЬ */}
									<p className="text-4xl font-bold text-blue-600">
										{examSummary.point_perc.toFixed(1)}
									</p>
									<p className="text-xl font-bold text-blue-600/60 mb-1">%</p>
									{dunInfo && (
										<span className="text-3xl font-bold text-gray-700 mb-1">
											({dunInfo.tuval})
										</span>
									)}
								</div>
								{/* Хувийн визуал индикатор */}
								<div className="mt-3 flex gap-1">
									{Array.from({ length: 10 }).map((_, i) => (
										<div
											key={`percent-indicator-${examSummary.test_id}-${i}`}
											className={`h-1 flex-1 rounded-full transition-all duration-500 ${
												i < Math.floor(examSummary.point_perc / 10)
													? "bg-blue-500"
													: "bg-blue-500/20"
											}`}
											style={{ transitionDelay: `${i * 50}ms` }}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

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
										// ЗАДГАЙ ДААЛГАВАР - багшийн үнэлгээнээс хамаарна
										if (question.unelsen === 1) {
											// Багш үнэлсэн бол зөв эсэхийг оноогоор нь шалгах
											return question.zad_onoo === question.que_onoo;
										}
										// Багш үнэлээгүй бол false (буюу partial гэж үзнэ)
										return false;
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
										const answersOnly = questionAnswers.filter(
											(a: Answer) => a.ref_child_id && a.ref_child_id >= 1,
										);

										return answersOnly.every((answerItem: Answer) => {
											const userInput = userSelectedAnswers.find(
												(ua: UserAnswer) =>
													ua.answer_id === answerItem.answer_id,
											);
											if (!userInput) return false;

											return (
												parseInt(userInput.answer, 10) ===
												answerItem.ref_child_id
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
									const partialPoints = calculatePartialPoints(
										question,
										questionAnswers,
										userSelectedAnswers,
									);
									const earnedPoints = isQuestionCorrect
										? question.que_onoo
										: partialPoints;
									const answerStatus = getAnswerStatus(
										isQuestionCorrect || false,
										partialPoints,
										userSelectedAnswers,
										questionAnswers,
										question,
									);

									return (
										<div
											key={question.exam_que_id}
											className="border border-border bg-card rounded-2xl p-6 shadow-lg"
										>
											<div className="flex items-start gap-4 mb-6">
												<Button size={"icon-lg"} variant={"outline"} disabled>
													{index + 1}
												</Button>
												<div className="flex-1">
													<div className="flex items-center gap-3 mb-2 flex-wrap justify-between">
														<div>
															<Badge
																variant={"secondary"}
																className="px-3 h-10 mr-2 border border-border rounded-md text-md"
															>
																{getQuestionTypeLabel(question.que_type_id)}
															</Badge>

															<span className="text-muted-foreground">
																Нийт: {question.que_onoo} оноо
															</span>
														</div>
														<Button size={"lg"} variant={"outline"}>
															{answerStatus === "unanswered" ? (
																<>
																	{/* Задгай даалгавар багш үнэлээгүй эсэхийг шалгах */}
																	{question.que_type_id === 4 &&
																	question.unelsen === 0 ? (
																		<>
																			<MinusCircle className="w-5 h-5 text-amber-500" />
																			<span>
																				Багшийн үнэлгээ хүлээгдэж байна
																			</span>
																			<div className="ml-2 px-2 py-1 bg-white/20 rounded-lg">
																				-/{question.que_onoo}
																			</div>
																		</>
																	) : (
																		<>
																			<AlertCircle className="w-5 h-5" />
																			<span>Хариулаагүй</span>
																			<div className="ml-2 px-2 py-1 bg-white/20 rounded-lg">
																				0/{question.que_onoo}
																			</div>
																		</>
																	)}
																</>
															) : answerStatus === "correct" ? (
																<>
																	<CheckCircle className="w-5 h-5" />
																	<span>Зөв хариулсан</span>
																	<div className="ml-2 px-2 py-1 bg-white/20 rounded-lg">
																		{earnedPoints}/{question.que_onoo}
																	</div>
																</>
															) : answerStatus === "partial" ? (
																<>
																	<MinusCircle className="w-5 h-5" />
																	<span>Дутуу хариулсан</span>
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
														</Button>
													</div>
													<div className="text-lg font-medium">
														{/* 1. Асуултын үндсэн текст */}
														{question.question_name &&
															question.question_name.trim() !== "" && (
																<div className="mb-3">
																	{safeParse(question.question_name)}
																</div>
															)}

														{/* 2. Асуултын зураг */}
														{question.question_img &&
															question.question_img.trim() !== "" && (
																<div className="mb-3">
																	<Image
																		src={question.question_img}
																		alt="Question Image"
																		width={500}
																		height={350}
																		className="rounded-xl shadow-md"
																		onError={(e) => {
																			e.currentTarget.style.display = "none";
																		}}
																		unoptimized // Хэрэв external domain бол
																	/>
																</div>
															)}

														{/* 3. Source HTML (дуу, материал гэх мэт) */}
														{question.is_src > 0 &&
															question.source_html &&
															question.source_html.trim() !== "" && (
																<div className="mt-4 p-4 ">
																	<div className="flex items-start gap-3 mb-2">
																		<div className="flex-1">
																			<div className="text-base leading-relaxed text-foreground  p-3 rounded-lg">
																				{safeParse(question.source_html)}
																			</div>
																		</div>
																	</div>
																</div>
															)}

														{/* 4. Source зураг (хэрэв байвал) */}
														{question.source_img &&
															question.source_img.trim() !== "" && (
																<div className="mt-3">
																	<Image
																		src={question.source_img}
																		alt="Source Image"
																		width={500}
																		height={350}
																		className="rounded-xl shadow-md"
																	/>
																</div>
															)}

														{/* 5. Хоосон тохиолдол */}
														{!question.question_name?.trim() &&
															!question.question_img?.trim() &&
															(!question.is_src ||
																!question.source_html?.trim()) &&
															!question.source_img?.trim() && (
																<span className="text-muted-foreground italic">
																	Асуулт байхгүй
																</span>
															)}
													</div>
												</div>
											</div>
											<div className="space-y-4 pl-14">
												{question.que_type_id === 1 ? (
													// ========== НЭГ СОНГОЛТТОЙ АСУУЛТ ==========
													questionAnswers.length === 0 ? (
														<p className="text-sm text-muted-foreground">
															Хариулт олдсонгүй
														</p>
													) : (
														<div className="space-y-4">
															{/* Бүх хариултууд */}
															<div className="space-y-3">
																{questionAnswers.map((answer, _idx) => {
																	const isCorrect = answer.is_true === 1;
																	const isUserSelected =
																		userSelectedAnswers.some(
																			(ua) => ua.answer_id === answer.answer_id,
																		);
																	const isWrongSelection =
																		isUserSelected && !isCorrect;

																	const hasImage =
																		answer.answer_img &&
																		answer.answer_img.trim() !== "";
																	const hasText =
																		(answer.answer_name_html &&
																			answer.answer_name_html.trim() !== "") ||
																		(answer.answer_name &&
																			answer.answer_name.trim() !== "");

																	return (
																		<div
																			key={answer.answer_id}
																			className={`relative flex items-center gap-4 p-5 rounded-2xl border border-border bg-input/30 transition-all duration-300 ${
																				isWrongSelection
																					? "border-red-900 bg-red-50 dark:bg-red-950/10"
																					: isUserSelected
																						? "border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20"
																						: "border-border bg-card/50"
																			}`}
																		>
																			<div className="flex-1 min-w-0">
																				<div className="text-base leading-relaxed font-medium">
																					{hasImage && (
																						<Image
																							src={answer.answer_img}
																							alt="Answer"
																							width={300}
																							height={200}
																							className="rounded-xl shadow-md mt-2"
																						/>
																					)}

																					{hasText && (
																						<div>
																							{answer.answer_name_html &&
																							answer.answer_name_html.trim() !==
																								""
																								? safeParse(
																										answer.answer_name_html,
																									)
																								: safeParse(answer.answer_name)}
																						</div>
																					)}

																					{!hasImage &&
																						!hasText &&
																						"Хариулт байхгүй"}
																				</div>
																			</div>

																			<div className="shrink-0">
																				{isUserSelected && isCorrect && (
																					<div className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg font-bold text-sm">
																						✓ Зөв
																					</div>
																				)}
																				{isWrongSelection && (
																					<div className="px-4 py-1 bg-red-700 text-white rounded-md font-bold text-sm">
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

															{/* Зөв хариулт */}
															{examSummary?.show_true_ans === 1 && (
																<div className="mt-4 p-4 border border-emerald-900 rounded-2xl shadow-sm">
																	<p className="text-base font-semibold mb-4">
																		Зөв хариулт:
																	</p>
																	{questionAnswers
																		.filter((answer) => answer.is_true === 1)
																		.map((answer) => {
																			const hasImage =
																				answer.answer_img &&
																				answer.answer_img.trim() !== "";
																			const hasText =
																				(answer.answer_name_html &&
																					answer.answer_name_html.trim() !==
																						"") ||
																				(answer.answer_name &&
																					answer.answer_name.trim() !== "");

																			return (
																				<div
																					key={answer.answer_id}
																					className="flex items-start gap-4 mb-2 p-3 border dark:border-emerald-900 rounded-lg bg-white dark:bg-emerald-900/5"
																				>
																					<div className="text-base leading-relaxed">
																						{hasImage && (
																							<Image
																								src={answer.answer_img}
																								alt="Correct Answer"
																								width={300}
																								height={200}
																								className="rounded-xl shadow-md mt-2"
																							/>
																						)}

																						{hasText && (
																							<div>
																								{answer.answer_name_html &&
																								answer.answer_name_html.trim() !==
																									""
																									? safeParse(
																											answer.answer_name_html,
																										)
																									: safeParse(
																											answer.answer_name,
																										)}
																							</div>
																						)}

																						{!hasImage &&
																							!hasText &&
																							"Хариулт байхгүй"}
																					</div>
																				</div>
																			);
																		})}
																</div>
															)}
														</div>
													)
												) : question.que_type_id === 2 ? (
													questionAnswers.length === 0 ? (
														<p className="text-sm text-muted-foreground">
															Хариулт олдсонгүй
														</p>
													) : (
														<div className="space-y-4">
															{/* 🔥 АНХААРУУЛГА: Хэтэрхий олон хариулт сонгосон бол */}
															{userSelectedAnswers.length >
																question.truecnt && (
																<div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-xl flex items-start gap-3">
																	<div className="shrink-0">
																		<svg
																			className="w-6 h-6 text-red-600"
																			fill="none"
																			stroke="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<title>Анхааруулга</title>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth={2}
																				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
																			/>
																		</svg>
																	</div>
																	<div>
																		<p className="text-sm text-red-600 dark:text-red-400">
																			Зөвхөн {question.truecnt} хариулт сонгох
																			ёстой байсан. Та{" "}
																			{userSelectedAnswers.length} хариулт
																			сонгосон тул 0 оноо авлаа.
																		</p>
																	</div>
																</div>
															)}

															{/* Бүх хариултууд */}
															<div className="space-y-3">
																{questionAnswers.map((answer, _idx) => {
																	const isCorrect = answer.is_true === 1;
																	const isUserSelected =
																		userSelectedAnswers.some(
																			(ua) => ua.answer_id === answer.answer_id,
																		);
																	const isWrongSelection =
																		isUserSelected && !isCorrect;

																	const hasImage =
																		answer.answer_img &&
																		answer.answer_img.trim() !== "";
																	const hasText =
																		(answer.answer_name_html &&
																			answer.answer_name_html.trim() !== "") ||
																		(answer.answer_name &&
																			answer.answer_name.trim() !== "");

																	return (
																		<div
																			key={answer.answer_id}
																			className={`relative flex items-center gap-4 p-5 rounded-2xl border border-border bg-input/30 transition-all duration-300 ${
																				isWrongSelection
																					? "border-red-900 bg-red-50 dark:bg-red-950/10"
																					: isUserSelected
																						? "border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20"
																						: "border-border bg-card/50"
																			}`}
																		>
																			<div className="flex-1 min-w-0">
																				<div className="text-base leading-relaxed font-medium">
																					{hasImage && (
																						<Image
																							src={answer.answer_img}
																							alt="Answer"
																							width={300}
																							height={200}
																							className="rounded-xl shadow-md mt-2"
																						/>
																					)}

																					{hasText && (
																						<div>
																							{answer.answer_name_html &&
																							answer.answer_name_html.trim() !==
																								""
																								? safeParse(
																										answer.answer_name_html,
																									)
																								: safeParse(answer.answer_name)}
																						</div>
																					)}

																					{!hasImage &&
																						!hasText &&
																						"Хариулт байхгүй"}
																				</div>
																			</div>

																			<div className="shrink-0">
																				{isUserSelected && isCorrect && (
																					<div className="px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg font-bold text-sm">
																						✓ Зөв
																					</div>
																				)}
																				{isWrongSelection && (
																					<div className="px-4 py-1 bg-red-700 text-white rounded-md font-bold text-sm">
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

															{/* Зөв хариултууд */}
															{examSummary?.show_true_ans === 1 && (
																<div className="mt-4 p-4 border border-emerald-900 rounded-2xl shadow-sm">
																	<p className="text-base font-semibold mb-2">
																		Зөв хариултууд ({question.truecnt}):
																	</p>
																	{questionAnswers
																		.filter((answer) => answer.is_true === 1)
																		.map((answer) => {
																			const hasImage =
																				answer.answer_img &&
																				answer.answer_img.trim() !== "";
																			const hasText =
																				(answer.answer_name_html &&
																					answer.answer_name_html.trim() !==
																						"") ||
																				(answer.answer_name &&
																					answer.answer_name.trim() !== "");

																			return (
																				<div
																					key={answer.answer_id}
																					className="flex items-start gap-4 mb-2 p-3 border dark:border-emerald-900 rounded-lg bg-white dark:bg-emerald-900/5"
																				>
																					<div className="text-base leading-relaxed">
																						{hasImage && (
																							<Image
																								src={answer.answer_img}
																								alt="Correct Answer"
																								width={300}
																								height={200}
																								className="rounded-xl shadow-md mt-2"
																							/>
																						)}

																						{hasText && (
																							<div>
																								{answer.answer_name_html &&
																								answer.answer_name_html.trim() !==
																									""
																									? safeParse(
																											answer.answer_name_html,
																										)
																									: safeParse(
																											answer.answer_name,
																										)}
																							</div>
																						)}

																						{!hasImage &&
																							!hasText &&
																							"Хариулт байхгүй"}
																					</div>
																				</div>
																			);
																		})}
																</div>
															)}
														</div>
													)
												) : question.que_type_id === 3 ? (
													<div className="space-y-4">
														<div className="space-y-3">
															{questionAnswers.map((answer, _idx) => {
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
																		className={`relative flex items-center gap-4 p-6 rounded-2xl  border transition-all duration-300 ${
																			userInput
																				? isCorrect
																					? "border-emerald-900 bg-emerald-50 dark:bg-emerald-950/10 shadow-lg"
																					: "border-red-900 bg-red-50 dark:bg-red-950/10 shadow-lg"
																				: "border-orange-900 bg-orange-50 dark:bg-orange-950/10"
																		}`}
																	>
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
																		<div className="shrink-0">
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
														{examSummary?.show_true_ans === 1 && (
															<div className="mt-4 p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-900 dark:border-emerald-600 rounded-2xl shadow-sm">
																<p className="text-base font-bold text-emerald-700 dark:text-emerald-300 mb-4">
																	★ Зөв хариултууд:
																</p>
																<div className="space-y-3">
																	{questionAnswers.map((answer) => {
																		const correctAnswer =
																			answer.answer_name_html ||
																			answer.answer_name;
																		return (
																			<div
																				key={answer.answer_id}
																				className="flex items-center gap-4"
																			>
																				<div className="text-base">
																					{answer.answer_name &&
																						answer.answer_name.trim() !==
																							"" && (
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
														)}
													</div>
												) : question.que_type_id === 4 ? (
													/* ЗАДГАЙ ДААЛГАВАР */
													<div className="space-y-4">
														{/* Хэрэглэгчийн бичсэн хариулт */}
														<div className="p-6 rounded-2xl border border-blue-900 bg-blue-50 dark:bg-blue-950/20 shadow-lg">
															<div className="flex items-start gap-4">
																{/* Icon */}
																<div className="shrink-0">
																	<div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center">
																		<svg
																			className="w-6 h-6"
																			fill="none"
																			stroke="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<title>Хариулт</title>
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
																		<div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-blue-200 dark:border-blue-900">
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
														{question.unelsen === 1 ? (
															// ✅ БАГШ ҮНЭЛСЭН ТОХИОЛДОЛ
															<div
																className={`p-5 rounded-2xl shadow-sm border ${
																	question.zad_onoo > 0
																		? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-900 dark:border-emerald-600"
																		: "bg-red-50 dark:bg-red-950/20 border-red-900 dark:border-red-600"
																}`}
															>
																<div className="flex items-start gap-3">
																	<div className="shrink-0">
																		<div
																			className={`w-8 h-8 rounded-lg text-white flex items-center justify-center ${
																				question.zad_onoo > 0
																					? "bg-emerald-500"
																					: "bg-red-500"
																			}`}
																		>
																			{question.zad_onoo > 0 ? (
																				<svg
																					className="w-5 h-5"
																					fill="none"
																					stroke="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<title>Зөв</title>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M5 13l4 4L19 7"
																					/>
																				</svg>
																			) : (
																				<svg
																					className="w-5 h-5"
																					fill="none"
																					stroke="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<title>Буруу</title>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M6 18L18 6M6 6l12 12"
																					/>
																				</svg>
																			)}
																		</div>
																	</div>
																	<div className="flex-1">
																		<p
																			className={`text-sm font-bold mb-2 ${
																				question.zad_onoo > 0
																					? "text-emerald-700 dark:text-emerald-300"
																					: "text-red-700 dark:text-red-300"
																			}`}
																		>
																			✓ Багш үнэлгээ өгсөн
																		</p>

																		{/* Авсан оноо */}
																		<div className="flex items-center gap-2 mb-3">
																			<span className="text-sm text-muted-foreground">
																				Авсан оноо:
																			</span>
																			<span
																				className={`text-2xl font-bold ${
																					question.zad_onoo > 0
																						? "text-emerald-600 dark:text-emerald-400"
																						: "text-red-600 dark:text-red-400"
																				}`}
																			>
																				{question.zad_onoo}
																			</span>
																			<span className="text-sm text-muted-foreground">
																				/ {question.que_onoo}
																			</span>
																		</div>

																		{/* Багшийн тайлбар */}
																		{question.zad_descr &&
																			question.zad_descr.trim() !== "" &&
																			question.zad_descr !== "." && (
																				<div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
																					<p className="text-xs font-semibold text-muted-foreground mb-1">
																						Багшийн тайлбар:
																					</p>
																					<p className="text-sm text-foreground leading-relaxed">
																						{question.zad_descr}
																					</p>
																				</div>
																			)}
																	</div>
																</div>
															</div>
														) : (
															// ❌ БАГШ ҮНЭЛЭЭГҮЙ ТОХИОЛДОЛ
															<div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-900 dark:border-amber-600 rounded-2xl shadow-sm">
																<div className="flex items-start gap-3">
																	<div className="shrink-0">
																		<div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
																			<svg
																				className="w-5 h-5"
																				fill="none"
																				stroke="currentColor"
																				viewBox="0 0 24 24"
																			>
																				<title>Хүлээгдэж байна</title>
																				<path
																					strokeLinecap="round"
																					strokeLinejoin="round"
																					strokeWidth={2}
																					d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
														)}
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
																			className={`flex items-center gap-4 p-5 rounded-2xl  border transition-all duration-300 ${
																				!userInput
																					? "border-orange-900 bg-orange-50 dark:bg-orange-950/10"
																					: isCorrect
																						? "border-emerald-900 bg-emerald-50 dark:bg-emerald-950/10 shadow-lg"
																						: "border-red-900 bg-red-50 dark:bg-red-950/10 shadow-lg"
																			}`}
																		>
																			{/* Хариултын текст */}
																			<div className="flex-1 min-w-0">
																				<div className="text-base font-medium text-foreground">
																					{answer.answer_name_html ||
																						answer.answer_name ||
																						"Хариулт"}
																				</div>
																			</div>

																			{/* Status badge */}
																			<div className="shrink-0">
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
														{examSummary?.show_true_ans === 1 && (
															<div className="mt-4 p-5 border border-emerald-900 dark:border-emerald-900 rounded-2xl">
																<p className="text-base font-bold mb-4">
																	Зөв дараалал:
																</p>
																<div className="space-y-3">
																	{questionAnswers
																		.sort((a, b) => a.refid - b.refid)
																		.map((answer) => (
																			<div
																				key={answer.answer_id}
																				className="flex items-center gap-4 p-3 border border-emerald-300 dark:border-emerald-900 rounded-lg bg-white dark:bg-emerald-900/5"
																			>
																				<div className="text-base font-medium text-foreground">
																					{answer.answer_name_html ||
																						answer.answer_name ||
																						"Хариулт"}
																				</div>
																			</div>
																		))}
																</div>
															</div>
														)}
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
																			// ЗАСВАР: answer-ын ref_child_id нь question-ий refid-тай тэнцүү байх
																			const correctAnswer = answersOnly.find(
																				(a) =>
																					a.ref_child_id === questionItem.refid,
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
																			// ЗАСВАР: User-ын answer утга нь question-ий refid
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
																					className={`flex items-center gap-4 p-5 rounded-2xl  border transition-all duration-300 ${
																						!userMatch
																							? "border-orange-900 bg-orange-50 dark:bg-orange-950/10"
																							: isCorrect
																								? "border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 shadow-lg"
																								: "border-red-900 bg-red-50 dark:bg-red-950/10 shadow-lg"
																					}`}
																				>
																					{/* Right side - Answer (а column) */}
																					<div className="flex items-center gap-3 flex-1">
																						{correctAnswer?.answer_img &&
																						correctAnswer.answer_img.trim() !==
																							"" ? (
																							<Image
																								src={correctAnswer.answer_img}
																								alt="Answer"
																								width={120}
																								height={90}
																								className="rounded-lg shadow-md object-contain"
																							/>
																						) : (
																							<div className="text-base font-medium">
																								{correctAnswer?.answer_name_html ||
																									correctAnswer?.answer_name ||
																									"Хариулт"}
																							</div>
																						)}
																					</div>

																					{/* Arrow */}
																					<div className="text-2xl text-muted-foreground shrink-0">
																						→
																					</div>

																					{/* Left side - Question (б column) - User's selection */}
																					<div className="flex items-center gap-3 flex-1">
																						{userSelectedQuestion ? (
																							userSelectedQuestion.answer_img &&
																							userSelectedQuestion.answer_img.trim() !==
																								"" ? (
																								<Image
																									src={
																										userSelectedQuestion.answer_img
																									}
																									alt="Selected Question"
																									width={120}
																									height={90}
																									className="rounded-lg shadow-md object-contain"
																								/>
																							) : (
																								<div className="text-base font-medium">
																									{userSelectedQuestion.answer_name_html ||
																										userSelectedQuestion.answer_name}
																								</div>
																							)
																						) : (
																							<span className="text-orange-600 font-medium">
																								Харгалзуулаагүй
																							</span>
																						)}
																					</div>

																					{/* Status badge */}
																					<div className="shrink-0">
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
																	{examSummary?.show_true_ans === 1 && (
																		<div className="mt-4 p-5 bg-emerald-50 dark:bg-emerald-950/20  border border-emerald-900 dark:border-emerald-600 rounded-2xl shadow-sm">
																			<p className="text-base font-bold text-emerald-700 dark:text-emerald-300 mb-4">
																				★ Зөв харгалзуулалт:
																			</p>
																			<div className="space-y-3">
																				{/* ЗАСВАР: 
                                                                                дээр loop хийх (А багана) */}
																				{answersOnly.map((answerItem) => {
																					// answerItem.ref_child_id нь зөв question-ий refid
																					const correctQuestion =
																						questionsOnly.find(
																							(q) =>
																								q.refid ===
																								answerItem.ref_child_id,
																						);

																					return (
																						<div
																							key={answerItem.answer_id}
																							className="flex items-center gap-4 p-3  border border-emerald-300 dark:border-emerald-700 rounded-lg bg-white dark:bg-emerald-900/10"
																						>
																							{/* Answer (а column) - Зүүн тал */}
																							<div className="flex items-center gap-3 flex-1">
																								{answerItem.answer_img &&
																								answerItem.answer_img.trim() !==
																									"" ? (
																									<Image
																										src={answerItem.answer_img}
																										alt="Answer"
																										width={120}
																										height={90}
																										className="rounded-lg shadow-md object-contain"
																									/>
																								) : (
																									<div className="text-base font-medium">
																										{answerItem.answer_name_html ||
																											answerItem.answer_name ||
																											"Хариулт"}
																									</div>
																								)}
																							</div>

																							{/* Arrow */}
																							<div className="text-2xl text-emerald-600 shrink-0">
																								→
																							</div>

																							{/* Question (б column) - Баруун тал */}
																							<div className="flex items-center gap-3 flex-1">
																								{correctQuestion?.answer_img &&
																								correctQuestion.answer_img.trim() !==
																									"" ? (
																									<Image
																										src={
																											correctQuestion.answer_img
																										}
																										alt="Question"
																										width={120}
																										height={90}
																										className="rounded-lg shadow-md object-contain"
																									/>
																								) : (
																									<div className="text-base font-medium">
																										{correctQuestion?.answer_name_html ||
																											correctQuestion?.answer_name ||
																											"Хариулт"}
																									</div>
																								)}
																							</div>
																						</div>
																					);
																				})}
																			</div>
																		</div>
																	)}
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
