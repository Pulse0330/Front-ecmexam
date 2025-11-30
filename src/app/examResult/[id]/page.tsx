"use client";

import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import { AlertCircle, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
const questions = data.RetDataSecond;    // ✅ ЗӨВ
const answers = data.RetDataThirt;       // ✅ ЗӨВ
const userAnswers = data.RetDataFourth;  // ✅ ЗӨВ
	
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

				<div className="space-y-6">
					{!questions || questions.length === 0 ? (
						<div className="text-center p-8 bg-card/50 rounded-xl border">
							<p className="text-muted-foreground">Асуулт олдсонгүй</p>
						</div>
					) : (
						questions.map((question, index) => {
							const questionAnswers = answers?.filter(
								(answer) => answer.exam_que_id === question.exam_que_id
							) || [];

							const userSelectedAnswers = userAnswers?.filter(
								(ua) => ua.exam_que_id === question.exam_que_id
							) || [];

							return (
								<div key={question.exam_que_id} className="bg-card border rounded-2xl p-6 shadow-lg">
									<div className="flex items-start gap-4 mb-6">
										<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
											<span className="text-primary-foreground font-bold">{index + 1}</span>
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-lg">
													{getQuestionTypeLabel(question.que_type_id)}
												</span>
												<span className="text-sm text-muted-foreground">{question.que_onoo} оноо</span>
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
										{/* TYPE 6: MATCHING */}
										{question.que_type_id === 6 ? (
											<div className="space-y-4">
												{(() => {
													// Column A: Questions (ref_child_id >= 1)
													const columnA = questionAnswers.filter(a => a.ref_child_id && a.ref_child_id >= 1);
													// Column B: Options (ref_child_id === -1)
													const columnB = questionAnswers.filter(a => a.ref_child_id === -1);

													return (
														<div className="space-y-3">
															<div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
																<p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
																	💡 А багана → Б багана: Зөв харгалзааг олоорой
																</p>
															</div>
															{columnA.map((itemA, idx) => {
																// Find correct match using refid
																const correctMatchB = columnB.find(
																	b => b.refid === itemA.refid
																);

																// Find user's answer
																const userAnswerForA = userSelectedAnswers.find(
																	ua => ua.answer_id === itemA.answer_id
																);

																// User's selected position (answer field contains the position)
																const userSelectedPosition = userAnswerForA ? parseInt(userAnswerForA.answer) : null;

																// Find which B item user selected based on position
																const userMatchedB = userSelectedPosition 
																	? columnB.find(b => b.refid === userSelectedPosition)
																	: null;

																const isCorrect = userMatchedB?.answer_id === correctMatchB?.answer_id;

																return (
																	<div 
																		key={itemA.answer_id}
																		className={`p-4 rounded-xl border-2 ${
																			isCorrect
																				? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
																				: userMatchedB
																				? 'border-red-500 bg-red-50 dark:bg-red-950/30'
																				: 'border-border bg-muted/30'
																		}`}
																	>
																		<div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
																			<div className="flex items-center gap-3">
																				<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
																					{String.fromCharCode(65 + idx)}
																				</div>
																				<div className="flex-1 font-medium">
																					{safeParse(itemA.answer_name_html) || itemA.answer_name}
																				</div>
																			</div>

																			<div className="flex flex-col items-center justify-center px-4">
																				<div className="text-3xl text-muted-foreground">→</div>
																			</div>

																			<div className="space-y-2">
																				{correctMatchB && (
																					<div>
																						<p className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">
																							Зөв хариулт:
																						</p>
																						<div className={`flex items-center gap-3 p-2 border rounded-lg ${
																							isCorrect 
																								? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500'
																								: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400'
																						}`}>
																							<div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
																								isCorrect ? 'bg-emerald-500' : 'bg-emerald-400'
																							}`}>
																								{correctMatchB.refid}
																							</div>
																							<div className="flex-1 font-medium text-sm">
																								{safeParse(correctMatchB.answer_name_html) || correctMatchB.answer_name}
																							</div>
																							{isCorrect && (
																								<span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded">
																									Зөв сонгосон
																								</span>
																							)}
																						</div>
																					</div>
																				)}
																				{userMatchedB && !isCorrect && (
																					<div>
																						<p className="text-xs font-semibold mb-1 text-red-600 dark:text-red-400">
																							Таны хариулт:
																						</p>
																						<div className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-950/30 border border-red-400 rounded-lg">
																							<div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
																								{userMatchedB.refid}
																							</div>
																							<div className="flex-1 font-medium text-sm">
																								{safeParse(userMatchedB.answer_name_html) || userMatchedB.answer_name}
																							</div>
																							<span className="text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">
																								Буруу
																							</span>
																						</div>
																					</div>
																				)}
																			</div>
																		</div>
																	</div>
																);
															})}
														</div>
													);
												})()}
											</div>
										) : question.que_type_id === 3 ? (
											/* TYPE 3: NUMBER INPUT */
											<div className="space-y-3">
												{questionAnswers.map((answer) => {
													const userAnswer = userSelectedAnswers.find(
														(ua) => ua.answer_id === answer.answer_id
													);
													
													const userValue = userAnswer?.answer || "";
													const correctValue = answer.answer_name_html || answer.answer_name;
													const isCorrect = userValue === correctValue;
													
													return (
														<div key={answer.answer_id} className="space-y-2">
															<div className="flex items-start gap-3">
																<span className="font-semibold text-foreground min-w-[80px] mt-2">
																	{answer.answer_name}:
																</span>
																<div className="flex-1 space-y-2">
																	{userValue && (
																		<div>
																			<p className="text-xs font-semibold mb-1 text-primary">
																				Таны хариулт:
																			</p>
																			<div className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${
																				isCorrect
																					? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500'
																					: 'bg-red-50 dark:bg-red-950/30 border-red-500'
																			}`}>
																				<span className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
																					{userValue}
																				</span>
																				{isCorrect ? (
																					<CheckCircle className="w-4 h-4 text-emerald-600 ml-auto" />
																				) : (
																					<XCircle className="w-4 h-4 text-red-600 ml-auto" />
																				)}
																			</div>
																		</div>
																	)}
																	<div>
																		<p className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">
																			Зөв хариулт:
																		</p>
																		<div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500 rounded-lg">
																			<span className="font-bold text-emerald-600">{correctValue}</span>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													);
												})}
											</div>
										) : question.que_type_id === 4 ? (
											/* TYPE 4: ESSAY */
											<div className="bg-muted/30 border border-border rounded-xl p-4">
												<p className="text-sm text-muted-foreground mb-3 font-semibold">Таны хариулт:</p>
												<div className="bg-card border border-border p-4 rounded-lg">
													<p className="text-foreground whitespace-pre-wrap">
														{userSelectedAnswers[0]?.answer || "Хариулт ороогүй байна"}
													</p>
												</div>
												{questionAnswers[0]?.answer_descr && (
													<div className="mt-4 pt-4 border-t border-border">
														<p className="text-sm text-muted-foreground mb-2 font-semibold">Зааварчилгаа:</p>
														<div className="text-sm text-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
															{safeParse(questionAnswers[0].answer_descr)}
														</div>
													</div>
												)}
											</div>
										) : question.que_type_id === 5 ? (
											/* TYPE 5: ORDERING */
											<div className="space-y-2">
												{questionAnswers.map((answer, idx) => {
													const userAnswerIndex = userSelectedAnswers.findIndex(
														(ua) => ua.answer_id === answer.answer_id
													);
													const userOrder = userAnswerIndex >= 0 ? userAnswerIndex + 1 : null;
													const correctOrder = idx + 1;
													const isCorrect = userOrder === correctOrder;
													
													return (
														<div key={answer.answer_id} className="space-y-2">
															{userOrder && (
																<div>
																	<p className="text-xs font-semibold mb-1 text-primary">Таны дараалал:</p>
																	<div
																		className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
																			isCorrect
																				? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
																				: 'border-red-500 bg-red-50 dark:bg-red-950/30'
																		}`}
																	>
																		<div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
																			isCorrect 
																				? 'bg-emerald-500 text-white' 
																				: 'bg-red-500 text-white'
																		}`}>
																			{userOrder}
																		</div>
																		<div className="flex-1">
																			{answer.answer_name_html && answer.answer_name_html.trim() !== '' ? (
																				safeParse(answer.answer_name_html)
																			) : answer.answer_img && answer.answer_img.trim() !== '' ? (
																				<Image
																					src={answer.answer_img}
																					alt="Answer"
																					width={200}
																					height={150}
																					className="rounded-lg"
																				/>
																			) : (
																				answer.answer_name
																			)}
																		</div>
																		{isCorrect ? (
																			<CheckCircle className="w-5 h-5 text-emerald-600" />
																		) : (
																			<XCircle className="w-5 h-5 text-red-600" />
																		)}
																	</div>
																</div>
															)}
															<div>
																<p className="text-xs font-semibold mb-1 text-emerald-600 dark:text-emerald-400">
																	Зөв дараалал:
																</p>
																<div className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30">
																	<div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-lg text-white">
																		{correctOrder}
																	</div>
																	<div className="flex-1">
																		{answer.answer_name_html && answer.answer_name_html.trim() !== '' ? (
																			safeParse(answer.answer_name_html)
																		) : answer.answer_img && answer.answer_img.trim() !== '' ? (
																			<Image
																				src={answer.answer_img}
																				alt="Answer"
																				width={200}
																				height={150}
																				className="rounded-lg"
																			/>
																		) : (
																			answer.answer_name
																		)}
																	</div>
																</div>
															</div>
														</div>
													);
												})}
											</div>
										) : (
											/* TYPE 1 & 2: SINGLE & MULTIPLE CHOICE */
											<>
												{questionAnswers.length === 0 ? (
													<p className="text-sm text-muted-foreground">Хариулт олдсонгүй</p>
												) : (
													<div className="space-y-3">
														{/* Show user's answers first if any */}
														{userSelectedAnswers.length > 0 && (
															<div>
																<p className="text-xs font-semibold mb-2 text-primary">
																	Таны {question.que_type_id === 2 ? 'сонголтууд' : 'хариулт'}:
																</p>
																<div className="space-y-2">
																	{questionAnswers
																		.filter(answer => userSelectedAnswers.some(ua => ua.answer_id === answer.answer_id))
																		.map((answer) => {
																			const isCorrect = answer.is_true === 1;
																			return (
																				<div
																					key={answer.answer_id}
																					className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
																						isCorrect
																							? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
																							: 'border-red-500 bg-red-50 dark:bg-red-950/30'
																					}`}
																				>
																					<div className="flex-shrink-0">
																						{isCorrect ? (
																							<CheckCircle className="w-5 h-5 text-emerald-600" />
																						) : (
																							<XCircle className="w-5 h-5 text-red-600" />
																						)}
																					</div>
																					<div className="flex-1">
																						{answer.answer_name_html && answer.answer_name_html.trim() !== '' ? (
																							safeParse(answer.answer_name_html)
																						) : answer.answer_name && answer.answer_name.trim() !== '' ? (
																							safeParse(answer.answer_name)
																						) : answer.answer_img && answer.answer_img.trim() !== '' ? (
																							<Image
																								src={answer.answer_img}
																								alt="Answer"
																								width={200}
																								height={150}
																								className="rounded-lg"
																							/>
																						) : (
																							'Хариулт байхгүй'
																						)}
																					</div>
																				</div>
																			);
																		})}
																</div>
															</div>
														)}
														
														{/* Show correct answers */}
														<div>
															<p className="text-xs font-semibold mb-2 text-emerald-600 dark:text-emerald-400">
																Зөв хариулт{question.que_type_id === 2 ? 'ууд' : ''}:
															</p>
															<div className="space-y-2">
																{questionAnswers
																	.filter(answer => answer.is_true === 1)
																	.map((answer) => {
																		const isUserSelected = userSelectedAnswers.some(ua => ua.answer_id === answer.answer_id);
																		return (
																			<div
																				key={answer.answer_id}
																				className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
																			>
																				<div className="flex-shrink-0">
																					<CheckCircle className="w-5 h-5 text-emerald-600" />
																				</div>
																				<div className="flex-1">
																					{answer.answer_name_html && answer.answer_name_html.trim() !== '' ? (
																						safeParse(answer.answer_name_html)
																					) : answer.answer_name && answer.answer_name.trim() !== '' ? (
																						safeParse(answer.answer_name)
																					) : answer.answer_img && answer.answer_img.trim() !== '' ? (
																						<Image
																							src={answer.answer_img}
																							alt="Answer"
																							width={200}
																							height={150}
																							className="rounded-lg"
																						/>
																					) : (
																						'Хариулт байхгүй'
																					)}
																				</div>
																				{isUserSelected && (
																					<span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded">
																						Та зөв сонгосон
																					</span>
																				)}
																			</div>
																		);
																	})}
															</div>
														</div>
														
														{/* For type 2, show missed correct answers */}
														{question.que_type_id === 2 && userSelectedAnswers.length > 0 && (
															(() => {
																const missedCorrect = questionAnswers.filter(
																	answer => answer.is_true === 1 && !userSelectedAnswers.some(ua => ua.answer_id === answer.answer_id)
																);
																if (missedCorrect.length > 0) {
																	return (
																		<div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
																			<p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
																				⚠️ Та {missedCorrect.length} зөв хариултыг сонгоогүй байна
																			</p>
																		</div>
																	);
																}
																return null;
															})()
														)}
													</div>
												)}
											</>
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