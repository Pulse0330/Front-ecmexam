"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Button } from "@/components/ui/button";
import { getExamResultMore } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamResponseMoreApiResponse } from "@/types/exam/examResultMore";

function ExamResultDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { userId } = useAuthStore();

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

	if (!userId) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
				<div className="text-center space-y-4 p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-2xl max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
					<div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
						<AlertCircle className="w-10 h-10 text-orange-500" />
					</div>
					<div>
						<h3 className="text-2xl font-bold text-card-foreground mb-2">
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
						<p className="text-xl font-bold text-foreground animate-pulse">
							Ачааллаж байна...
						</p>
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
				<div className="max-w-md w-full bg-gradient-to-br from-destructive/10 to-red-500/5 border-2 border-destructive/50 rounded-2xl p-8 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500">
					<div className="flex flex-col items-center text-center space-y-4">
						<div className="w-20 h-20 bg-gradient-to-br from-destructive/20 to-red-500/20 rounded-full flex items-center justify-center">
							<AlertCircle className="w-10 h-10 text-destructive" />
						</div>
						<div>
							<h3 className="text-2xl font-bold text-destructive mb-2">
								Алдаа гарлаа
							</h3>
							<p className="text-sm text-destructive/80">
								{(error as Error).message}
							</p>
						</div>
						<button
							type="button"
							onClick={() => router.back()}
							className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
						>
							Буцах
						</button>
					</div>
				</div>
			</div>
		);
	}

	const isResponseFailed = !data?.RetResponse?.ResponseType;

	if (isResponseFailed || !data?.RetDataFirst) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
				<div className="text-center space-y-6 p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-2xl max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
					<div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full flex items-center justify-center">
						<AlertCircle className="w-10 h-10 text-orange-500" />
					</div>
					<div>
						<h3 className="text-2xl font-bold text-card-foreground mb-3">
							Мэдээлэл олдсонгүй
						</h3>
						<p className="text-muted-foreground">
							{data?.RetResponse?.ResponseMessage ||
								"Шалгалтын дэлгэрэнгүй мэдээлэл олдсонгүй"}
						</p>
					</div>
					<button
						type="button"
						onClick={() => router.back()}
						className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
					>
						Буцах
					</button>
				</div>
			</div>
		);
	}

	const questions = data.RetDataFirst;
	const answers = data.RetDataSecond;
	const userAnswers = data.RetDataThirth;

	const totalScore = questions.reduce((sum, q) => sum + q.onoo, 0);
	const earnedScore = questions.reduce((sum, q) => sum + q.avsan_onoo, 0);
	const percentage = totalScore > 0 ? (earnedScore / totalScore) * 100 : 0;
	const correctCount = questions.filter((q) => q.istrue === 1).length;

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

	const createMarkup = (html: string) => {
		return { __html: html };
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
			<div className="max-w-6xl mx-auto space-y-6">
				{/* Success Message */}
				{isSuccess && data?.RetResponse?.ResponseType && (
					<div className="animate-in slide-in-from-top-4 fade-in-0 duration-500">
						<div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl p-5 flex items-center gap-4 shadow-lg">
							<div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
								<CheckCircle className="w-7 h-7 text-white" />
							</div>
							<div className="flex-1">
								<p className="text-emerald-800 dark:text-emerald-300 font-bold text-lg">
									{data.RetResponse.ResponseMessage}
								</p>
								<p className="text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">
									Шалгалтын дэлгэрэнгүй мэдээлэл амжилттай ачаалагдлаа
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Back Button */}
				<Button
					type="button"
					onClick={() => router.back()}
					className="inline-flex items-center gap-2 px-5 py-2.5 bg-card/80 backdrop-blur-sm hover:bg-card border border-border rounded-xl font-semibold text-foreground hover:shadow-lg transition-all duration-300 group"
				>
					<ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
					<span>Буцах</span>
				</Button>

				{/* Summary Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
						<p className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-1">
							Нийт асуулт
						</p>
						<p className="text-3xl font-black text-blue-900 dark:text-blue-100">
							{questions.length}
						</p>
					</div>
					<div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-lg">
						<p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-1">
							Зөв хариулт
						</p>
						<p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
							{correctCount}
						</p>
					</div>
					<div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-lg">
						<p className="text-purple-600 dark:text-purple-400 text-sm font-semibold mb-1">
							Авсан оноо
						</p>
						<p className="text-3xl font-black text-purple-900 dark:text-purple-100">
							{earnedScore}/{totalScore}
						</p>
					</div>
					<div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 shadow-lg">
						<p className="text-amber-600 dark:text-amber-400 text-sm font-semibold mb-1">
							Хувь
						</p>
						<p className="text-3xl font-black text-amber-900 dark:text-amber-100">
							{percentage.toFixed(1)}%
						</p>
					</div>
				</div>

				{/* Questions List */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-black text-card-foreground">
							Асуултууд ба хариултууд
						</h2>
						<span className="px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-xl text-sm font-bold text-muted-foreground">
							{questions.length} асуулт
						</span>
					</div>

					{questions.map((question, index) => {
						const questionAnswers = answers.filter(
							(a) => a.question_id === question.question_id,
						);
						const userQuestionAnswers = userAnswers.filter(
							(ua) => ua.question_id === question.question_id,
						);
						const userAnswerIds = userQuestionAnswers.map((ua) => ua.answer_id);

						return (
							<div
								key={question.question_id}
								className={`group bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border-l-[6px] p-7 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
									question.istrue === 1
										? "border-emerald-500 hover:border-emerald-600"
										: "border-red-500 hover:border-red-600"
								} animate-in fade-in-0 slide-in-from-bottom-4 duration-500`}
								style={{ animationDelay: `${index * 50}ms` }}
							>
								{/* Question Header */}
								<div className="flex items-start justify-between mb-5 gap-4">
									<div className="flex items-start gap-4 flex-1">
										<div
											className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${question.istrue === 1 ? "from-emerald-500 to-green-600" : "from-red-500 to-rose-600"} rounded-xl flex items-center justify-center font-black text-white shadow-lg text-lg`}
										>
											{index + 1}
										</div>
										<div className="flex-1">
											<div
												className="text-card-foreground font-semibold text-lg mb-4 leading-relaxed"
												// biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized HTML from trusted API
												dangerouslySetInnerHTML={createMarkup(
													question.question_html,
												)}
											/>
											{question.question_img && (
												<div className="mb-4">
													<Image
														src={question.question_img}
														alt="Question"
														className="max-w-lg rounded-xl border-2 border-border shadow-lg"
													/>
												</div>
											)}
											<div className="flex items-center gap-2 mt-3">
												<span className="px-3 py-1 bg-muted/50 rounded-lg text-xs font-semibold text-muted-foreground">
													{getQuestionTypeLabel(question.que_type_id)}
												</span>
												<span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">
													{question.onoo} оноо
												</span>
											</div>
										</div>
									</div>

									<div className="flex-shrink-0">
										{question.istrue === 1 ? (
											<div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg">
												<CheckCircle className="w-5 h-5" />
												Зөв
											</div>
										) : (
											<div className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg">
												<XCircle className="w-5 h-5" />
												Буруу
											</div>
										)}
									</div>
								</div>

								{/* Answers */}
								<div className="ml-16 space-y-3">
									{questionAnswers.map((answer) => {
										const isUserAnswer = userAnswerIds.includes(
											answer.answer_id,
										);
										const isCorrect = answer.is_true === 1;

										let answerStyle = "border-2 border-border/50 bg-muted/30";
										if (isUserAnswer && isCorrect) {
											answerStyle =
												"border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-emerald-950/40 shadow-lg";
										} else if (isUserAnswer && !isCorrect) {
											answerStyle =
												"border-2 border-red-400 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 dark:from-red-950/40 dark:via-rose-950/40 dark:to-red-950/40 shadow-lg";
										} else if (isCorrect) {
											answerStyle =
												"border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20";
										}

										return (
											<div
												key={answer.answer_id}
												className={`p-4 rounded-xl ${answerStyle} transition-all duration-300 hover:shadow-lg`}
											>
												<div className="flex items-start gap-3">
													{isUserAnswer && (
														<span
															className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xl shadow-md ${isCorrect ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white" : "bg-gradient-to-br from-red-500 to-rose-600 text-white"}`}
														>
															{isCorrect ? "✓" : "✗"}
														</span>
													)}
													{isCorrect && !isUserAnswer && (
														<span className="flex-shrink-0 px-3 py-1 text-emerald-700 dark:text-emerald-400 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 rounded-lg uppercase tracking-wide">
															Зөв хариулт
														</span>
													)}
													<div
														className="flex-1 leading-relaxed font-medium"
														// biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized HTML from trusted API
														dangerouslySetInnerHTML={createMarkup(
															answer.answer_name_html || answer.answer_name,
														)}
													/>
												</div>
												{answer.answer_img && (
													<div className="mt-3 ml-11">
														<Image
															src={answer.answer_img}
															alt="Answer"
															className="max-w-sm rounded-xl border-2 border-border shadow-lg"
														/>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default ExamResultDetailPage;
