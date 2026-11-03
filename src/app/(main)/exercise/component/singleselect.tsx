"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { memo, useCallback, useRef } from "react";
import QuestionImage from "@/app/exam/component/question/questionImage";
import { MathContent } from "./matContent";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

interface AnswerData {
	answer_id: number;
	answer_name_html: string;
	answer_img?: string;
	is_true?: boolean;
	refid?: number;
}

interface SingleSelectQuestionProps {
	questionId: number;
	questionText?: string;
	questionImage?: string;
	answers: AnswerData[];
	mode: "exam" | "review";
	selectedAnswer?: number | null;
	correctAnswerId?: number | null;
	onAnswerChange?: (questionId: number, answerId: number | null) => void;
}

function SingleSelectQuestion({
	questionId,
	questionImage,
	answers,
	mode,
	selectedAnswer,
	correctAnswerId,
	onAnswerChange,
}: SingleSelectQuestionProps) {
	const isReviewMode = mode === "review";
	const showAnswerFeedback = mode === "exam" && selectedAnswer !== null;

	// Ref ашиглан stale closure-аас сэргийлсэн handleSelect
	const selectedAnswerRef = useRef(selectedAnswer);
	selectedAnswerRef.current = selectedAnswer;

	const handleSelect = useCallback(
		(answerId: number) => {
			if (isReviewMode || !onAnswerChange) return;
			// toggle logic
			const newValue = selectedAnswer === answerId ? null : answerId;
			onAnswerChange(questionId, newValue);
		},
		[questionId, isReviewMode, onAnswerChange, selectedAnswer], // dependency-д нэмэх
	);

	return (
		<div className="space-y-3 sm:space-y-4 w-full">
			{questionImage && (
				<div className="mb-4 flex justify-center">
					<div className="w-full max-w-md">
						<QuestionImage src={questionImage} alt="Асуултын зураг" />
					</div>
				</div>
			)}

			<div className="space-y-2 sm:space-y-3">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Нэг хариулт сонгоно уу
				</p>

				{answers.map((option, idx) => {
					const label = OPTION_LABELS[idx] ?? String(idx + 1);
					const isSelected = selectedAnswer === option.answer_id;
					const isCorrect =
						option.is_true || correctAnswerId === option.answer_id;
					const hasContent = !!option.answer_name_html;
					const imageUrl = option.answer_img;

					const colorClass = isReviewMode
						? isCorrect
							? "border-green-500 bg-green-50 dark:bg-green-900/20"
							: isSelected
								? "border-red-500 bg-red-50 dark:bg-red-900/20"
								: "border-border bg-card"
						: showAnswerFeedback
							? isSelected
								? isCorrect
									? "border-green-500 bg-green-50 dark:bg-green-900/20"
									: "border-red-500 bg-red-50 dark:bg-red-900/20"
								: isCorrect
									? "border-green-400 bg-green-50/50 dark:bg-green-900/10"
									: "border-border bg-card"
							: isSelected
								? "border-primary bg-primary/5 ring-1 ring-primary"
								: "border-border bg-card hover:border-primary/40 hover:bg-muted/50";

					return (
						<label
							key={option.answer_id}
							className={`group relative flex flex-col w-full rounded-xl border transition-all duration-200 text-left overflow-hidden ${colorClass} ${
								isReviewMode
									? "cursor-default"
									: "active:scale-[0.99] cursor-pointer"
							}`}
						>
							{/* ✅ Visually hidden native radio — a11y + keyboard free */}
							<input
								type="radio"
								name={`question-${questionId}`}
								value={option.answer_id}
								checked={isSelected}
								disabled={isReviewMode}
								onChange={() => handleSelect(option.answer_id)}
								className="sr-only"
							/>

							{/* Дээд хэсэг */}
							<div className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4 w-full">
								{/* A/B/C үсэгтэй сонголтын тэмдэг */}
								<span
									className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
										isSelected
											? isReviewMode || showAnswerFeedback
												? isCorrect
													? "border-green-600 bg-green-600 text-white"
													: "border-red-600 bg-red-600 text-white"
												: "border-primary bg-primary text-primary-foreground"
											: "border-border bg-background text-muted-foreground"
									}`}
								>
									{label}
								</span>

								{hasContent && (
									<div className="min-w-0 flex-1 self-center text-[15px] leading-7 text-foreground sm:text-base">
										<div>
											<div className="math-container block w-full">
												{/* option.answer_id-г key болгож өгөх нь маш чухал */}
												<MathContent
													// Маш чухал: key дотор isSelected-ийг оруулснаар
													// сонголт хийх үед компонентыг хүчээр дахин "мэндлүүлнэ"
													key={`${option.answer_id}-${isSelected}`}
													html={option.answer_name_html}
												/>
											</div>
										</div>
									</div>
								)}

								{(isReviewMode || showAnswerFeedback) && (
									<div className="shrink-0 ml-auto self-start sm:self-center">
										{isCorrect ? (
											<div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
												<CheckCircle2 className="size-5 sm:size-6" />
												<span className="hidden text-xs font-semibold sm:inline">
													Зөв
												</span>
											</div>
										) : isSelected ? (
											<span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
												<XCircle className="size-5 sm:size-6" />
												<span className="hidden text-xs font-semibold sm:inline">
													Буруу
												</span>
											</span>
										) : null}
									</div>
								)}
							</div>

							{imageUrl && (
								<div className="px-3 sm:px-4 pb-3 sm:pb-4 flex justify-center">
									<div className="w-full max-w-xs">
										<QuestionImage src={imageUrl} alt="Хариултын зураг" />
									</div>
								</div>
							)}

							{!hasContent && !imageUrl && (
								<div className="px-14 pb-4 text-xs italic text-muted-foreground">
									Хоосон хариулт
								</div>
							)}
						</label>
					);
				})}
			</div>
		</div>
	);
}

export default memo(SingleSelectQuestion);
