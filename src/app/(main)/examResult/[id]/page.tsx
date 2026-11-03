"use client";

import { useQuery } from "@tanstack/react-query";
import parse from "html-react-parser";
import { ClipboardCheck, FileQuestion } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
	AnswerFilterTabs,
	AnswerTag,
	answerRowClass,
	OptionLetter,
	QuestionCardHeader,
	QuestionStatusBadge,
	ResultSummary,
	type RowTone,
} from "@/app/(main)/examResult/[id]/resultUi";
import MathContent from "@/app/exam/component/examUtils/MathContent";
import { SourceBlock } from "@/app/exam/component/examUtils/sourceCard";
import { PageHeader } from "@/components/page/pageHeader";
import { EmptyState, LoadingState } from "@/components/page/pageStates";
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

	const { userId } = useAuthStore();
	const [answerFilter, setAnswerFilter] = useState<"all" | "correct" | "wrong">(
		"all",
	);

	const id = params.id as string;
	const [examIdStr, testIdStr] = id?.split("_") || [];
	const examId = Number(examIdStr);
	const testId = Number(testIdStr);

	const { data, isLoading } = useQuery<ExamResponseMoreApiResponse>({
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
	const AnswerContent = ({
		html,
		text,
	}: {
		html?: string | null;
		text?: string | null;
	}) => {
		const content = html?.trim() ? html : text;
		if (!content?.trim()) return null;
		if (
			content.includes("<math") ||
			content.includes("\\(") ||
			content.includes("\\[")
		) {
			return <MathContent html={content} />;
		}
		// safeParse-ийг шууд дуудахгүй — parse import хийж ашиглана
		try {
			return <>{parse(content)}</>;
		} catch {
			return <>{content}</>;
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

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
				<LoadingState
					label="Шалгалтын үр дүнг ачааллаж байна..."
					className="min-h-[60vh]"
				/>
			</div>
		);
	}

	if (!data?.RetResponse?.ResponseType || !data?.RetDataSecond) {
		return (
			<div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
				<PageHeader title="Шалгалтын үр дүн" back />
				<EmptyState
					icon={FileQuestion}
					title="Мэдээлэл олдсонгүй"
					description={
						data?.RetResponse?.ResponseMessage ||
						"Шалгалтын дэлгэрэнгүй мэдээлэл олдсонгүй"
					}
				/>
			</div>
		);
	}

	const examSummary: ExamSummary | undefined = data.RetDataFirst?.[0];
	const questions: Question[] = data.RetDataSecond;
	const answers: Answer[] = data.RetDataThirt;
	const userAnswers: UserAnswer[] = data.RetDataFourth;

	const dunInfo = dunData?.RetData?.[0];
	return (
		<div className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
			<PageHeader
				title="Шалгалтын үр дүн"
				description="Таны оноо болон асуулт тус бүрийн хариулт"
				icon={ClipboardCheck}
				back
				backConfirmMessage="Үр дүнгийн хуудаснаас гарч өмнөх хуудас руу буцах уу?"
			/>
			<div className="space-y-5">
				{examSummary && (
					<ResultSummary
						title={examSummary.lesson_name}
						subtitle={examSummary.test_title}
						dunTitle={dunInfo?.title}
						tuval={dunInfo?.tuval}
						point={examSummary.point}
						ttlPoint={examSummary.ttl_point}
						perc={examSummary.point_perc}
						total={examSummary.test_ttl}
						correct={examSummary.correct_ttl}
						wrong={examSummary.wrong_ttl}
						notAnswer={examSummary.not_answer}
						testTime={examSummary.test_time}
					/>
				)}
				<AnswerFilterTabs value={answerFilter} onChange={setAnswerFilter} />
				<div className="space-y-5">
					{!questions || questions.length === 0 ? (
						<EmptyState icon={FileQuestion} title="Асуулт олдсонгүй" />
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
											className="overflow-hidden rounded-2xl border bg-card shadow-sm"
										>
											<QuestionCardHeader
												index={index}
												total={questions.length}
												typeLabel={getQuestionTypeLabel(question.que_type_id)}
												points={question.que_onoo}
											>
												<QuestionStatusBadge
													status={answerStatus}
													pendingReview={
														question.que_type_id === 4 && question.unelsen === 0
													}
													earnedPoints={earnedPoints}
													total={question.que_onoo}
												/>
											</QuestionCardHeader>
											<div className="px-4 pt-5 sm:px-6">
												<div>
													<div className="text-base leading-7 text-foreground sm:text-[17px] sm:leading-8">
														{/* 1. Асуултын үндсэн текст */}
														{question.question_name &&
															question.question_name.trim() !== "" && (
																<div className="mb-3">
																	<MathContent html={question.question_name} />
																</div>
															)}

														{/* 2. source_name - Эх бичвэр */}
														{(question.source_name || question.source_img) && (
															<SourceBlock
																sourceName={question.source_name}
																sourceImg={question.source_img}
															/>
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
																		className="h-auto max-w-full rounded-xl border"
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
																<div className="mt-4">
																	<div className="flex items-start gap-3 mb-2">
																		<div className="flex-1">
																			<div className="rounded-xl border bg-muted/40 p-3 text-base leading-7 text-foreground sm:p-4">
																				<MathContent
																					html={question.source_html}
																				/>
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
																		className="h-auto max-w-full rounded-xl border"
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
											<div className="space-y-4 px-4 pb-5 pt-4 sm:px-6 sm:pb-6">
												{question.que_type_id === 1 ? (
													questionAnswers.length === 0 ? (
														<p className="text-sm text-muted-foreground">
															Хариулт олдсонгүй
														</p>
													) : (
														<div className="space-y-4">
															<div className="space-y-3">
																{questionAnswers.map((answer, idx) => {
																	const isCorrect = answer.is_true === 1;
																	const isUserSelected =
																		userSelectedAnswers.some(
																			(ua) => ua.answer_id === answer.answer_id,
																		);
																	const isWrongSelection =
																		isUserSelected && !isCorrect;
																	const rowTone: RowTone = isWrongSelection
																		? "wrong"
																		: isUserSelected
																			? "correct"
																			: isCorrect &&
																					examSummary?.show_true_ans === 1
																				? "key"
																				: "neutral";
																	const hasImage =
																		answer.answer_img &&
																		answer.answer_img.trim() !== "";

																	return (
																		<div
																			key={answer.answer_id}
																			className={answerRowClass(rowTone)}
																		>
																			<div className="flex min-w-0 flex-1 items-start gap-3">
																				<OptionLetter
																					index={idx}
																					tone={rowTone}
																				/>
																				<div className="min-w-0 flex-1 self-center text-base leading-7">
																					{hasImage && (
																						<Image
																							src={answer.answer_img}
																							alt="Answer"
																							width={300}
																							height={200}
																							className="mt-2 h-auto max-w-full rounded-xl border"
																						/>
																					)}
																					<AnswerContent
																						html={answer.answer_name_html}
																						text={answer.answer_name}
																					/>
																					{!hasImage &&
																						!answer.answer_name_html?.trim() &&
																						!answer.answer_name?.trim() &&
																						"Хариулт байхгүй"}
																				</div>
																			</div>
																			<div className="shrink-0">
																				{isUserSelected && isCorrect && (
																					<AnswerTag kind="your-correct" />
																				)}
																				{isWrongSelection && (
																					<AnswerTag kind="your-wrong" />
																				)}
																				{isUserSelected &&
																					!isCorrect &&
																					!isWrongSelection && (
																						<AnswerTag kind="your-pick" />
																					)}
																				{!isUserSelected &&
																					isCorrect &&
																					examSummary?.show_true_ans === 1 && (
																						<AnswerTag kind="correct" />
																					)}
																			</div>
																		</div>
																	);
																})}
															</div>
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
																<div className="flex items-start gap-3 rounded-xl border border-red-500/60 bg-red-50 p-3 sm:p-4 dark:bg-red-950/20">
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
																{questionAnswers.map((answer, idx) => {
																	const isCorrect = answer.is_true === 1;
																	const isUserSelected =
																		userSelectedAnswers.some(
																			(ua) => ua.answer_id === answer.answer_id,
																		);
																	const isWrongSelection =
																		isUserSelected && !isCorrect;
																	const rowTone: RowTone = isWrongSelection
																		? "wrong"
																		: isUserSelected
																			? "correct"
																			: isCorrect &&
																					examSummary?.show_true_ans === 1
																				? "key"
																				: "neutral";

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
																			className={answerRowClass(rowTone)}
																		>
																			<div className="flex min-w-0 flex-1 items-start gap-3">
																				<OptionLetter
																					index={idx}
																					tone={rowTone}
																				/>
																				<div className="min-w-0 flex-1 self-center text-base leading-7">
																					{hasImage && (
																						<Image
																							src={answer.answer_img}
																							alt="Answer"
																							width={300}
																							height={200}
																							className="mt-2 h-auto max-w-full rounded-xl border"
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
																					<AnswerTag kind="your-correct" />
																				)}
																				{isWrongSelection && (
																					<AnswerTag kind="your-wrong" />
																				)}
																				{isUserSelected &&
																					!isCorrect &&
																					!isWrongSelection && (
																						<AnswerTag kind="your-pick" />
																					)}
																				{!isUserSelected &&
																					isCorrect &&
																					examSummary?.show_true_ans === 1 && (
																						<AnswerTag kind="correct" />
																					)}
																			</div>
																		</div>
																	);
																})}
															</div>
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
																		className={answerRowClass(
																			userInput
																				? isCorrect
																					? "correct"
																					: "wrong"
																				: "missing",
																		)}
																	>
																		{/* Асуултын label ба зураг */}
																		<div className="flex-1 min-w-0">
																			<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
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
																					<span className="font-medium text-amber-700 dark:text-amber-300">
																						Хариулаагүй
																					</span>
																				)}
																			</div>
																		</div>

																		{/* Status Badge */}
																		<div className="shrink-0">
																			{userInput && isCorrect && (
																				<AnswerTag kind="your-correct" />
																			)}
																			{userInput && !isCorrect && (
																				<AnswerTag kind="your-wrong" />
																			)}
																		</div>
																	</div>
																);
															})}
														</div>

														{/* Зөв хариултууд */}
														{examSummary?.show_true_ans === 1 && (
															<div className="rounded-xl border border-emerald-500/50 bg-emerald-50/60 p-4 dark:bg-emerald-950/15">
																<p className="mb-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
																	✓ Зөв хариултууд
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
														<div className="rounded-xl border bg-muted/40 p-4">
															<div className="flex items-start gap-4">
																{/* Icon */}
																<div className="shrink-0">
																	<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
																	<p className="mb-2 text-sm font-medium text-muted-foreground">
																		Таны бичсэн хариулт:
																	</p>
																	{userSelectedAnswers.length > 0 &&
																	userSelectedAnswers[0]?.answer ? (
																		<div className="rounded-lg border bg-card p-3 sm:p-4">
																			<p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
																				{userSelectedAnswers[0].answer}
																			</p>
																		</div>
																	) : (
																		<div className="rounded-lg border border-amber-500/50 bg-amber-50 p-3 sm:p-4 dark:bg-amber-950/20">
																			<p className="font-medium text-amber-700 dark:text-amber-300">
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
																className={`rounded-xl border p-4 ${
																	question.zad_onoo > 0
																		? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20"
																		: "border-red-500/50 bg-red-50 dark:bg-red-950/20"
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
																			Багш үнэлсэн
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
																				<div className="mt-3 rounded-lg border bg-card p-3">
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
															<div className="rounded-xl border border-amber-500/50 bg-amber-50 p-4 dark:bg-amber-950/20">
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
																			Багшийн үнэлгээ хүлээгдэж байна
																		</p>
																		<p className="text-sm text-amber-700 dark:text-amber-300">
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
															<p className="mb-2 text-sm font-medium text-muted-foreground">
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
																			className={answerRowClass(
																				!userInput
																					? "missing"
																					: isCorrect
																						? "correct"
																						: "wrong",
																			)}
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
																					<AnswerTag kind="your-correct" />
																				)}
																				{userInput && !isCorrect && (
																					<AnswerTag kind="your-wrong" />
																				)}
																				{!userInput && (
																					<AnswerTag kind="unanswered" />
																				)}
																			</div>
																		</div>
																	);
																})}
														</div>

														{/* Зөв дараалал */}
														{examSummary?.show_true_ans === 1 && (
															<div className="rounded-xl border border-emerald-500/50 bg-emerald-50/60 p-4 dark:bg-emerald-950/15">
																<p className="mb-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
																	✓ Зөв дараалал
																</p>
																<div className="space-y-3">
																	{questionAnswers
																		.sort((a, b) => a.refid - b.refid)
																		.map((answer) => (
																			<div
																				key={answer.answer_id}
																				className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-card p-3"
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
																		<p className="mb-2 text-sm font-medium text-muted-foreground">
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
																					className={answerRowClass(
																						!userMatch
																							? "missing"
																							: isCorrect
																								? "correct"
																								: "wrong",
																					)}
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
																								className="h-auto max-w-full rounded-lg border object-contain"
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
																					<div
																						className="shrink-0 text-xl text-muted-foreground"
																						aria-hidden="true"
																					>
																						<span className="sm:hidden">↓</span>
																						<span className="hidden sm:inline">
																							→
																						</span>
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
																									className="h-auto max-w-full rounded-lg border object-contain"
																								/>
																							) : (
																								<div className="text-base font-medium">
																									{userSelectedQuestion.answer_name_html ||
																										userSelectedQuestion.answer_name}
																								</div>
																							)
																						) : (
																							<span className="font-medium text-amber-700 dark:text-amber-300">
																								Харгалзуулаагүй
																							</span>
																						)}
																					</div>

																					{/* Status badge */}
																					<div className="shrink-0">
																						{userMatch && isCorrect && (
																							<AnswerTag kind="your-correct" />
																						)}
																						{userMatch && !isCorrect && (
																							<AnswerTag kind="your-wrong" />
																						)}
																						{!userMatch && (
																							<AnswerTag kind="unanswered" />
																						)}
																					</div>
																				</div>
																			);
																		})}
																	</div>
																	{examSummary?.show_true_ans === 1 && (
																		<div className="rounded-xl border border-emerald-500/50 bg-emerald-50/60 p-4 dark:bg-emerald-950/15">
																			<p className="mb-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
																				✓ Зөв харгалзуулалт
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
																							className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-card p-3"
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
																										className="h-auto max-w-full rounded-lg border object-contain"
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
																							<div
																								className="shrink-0 text-xl text-emerald-600"
																								aria-hidden="true"
																							>
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
																										className="h-auto max-w-full rounded-lg border object-contain"
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
