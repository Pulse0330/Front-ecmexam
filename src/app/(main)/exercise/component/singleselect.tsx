"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { memo, useCallback, useRef } from "react";
import QuestionImage from "@/app/exam/component/question/questionImage";
import { MathContent } from "./matContent";

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
				<p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
					Нэг хариулт сонгоно уу
				</p>

				{answers.map((option) => {
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
								: "border-border bg-background"
						: showAnswerFeedback
							? isSelected
								? isCorrect
									? "border-green-500 bg-green-50 dark:bg-green-900/20"
									: "border-red-500 bg-red-50 dark:bg-red-900/20"
								: isCorrect
									? "border-green-400 bg-green-50/50 dark:bg-green-900/10"
									: "border-border bg-background"
							: isSelected
								? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
								: "border-border bg-background hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/50";

					return (
						<label
							key={option.answer_id}
							className={`group relative flex flex-col w-full rounded-xl border-2 transition-all duration-200 text-left overflow-hidden ${colorClass} ${
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
							<div className="flex items-start gap-3 p-3 sm:p-4 w-full">
								<div className="mt-1 shrink-0">
									<div
										className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
											isSelected
												? (isReviewMode || showAnswerFeedback)
													? isCorrect
														? "border-green-500 bg-green-500"
														: "border-red-500 bg-red-500"
													: "border-primary bg-primary"
												: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
										}`}
									>
										{isSelected && (
											<div className="w-2 h-2 bg-white rounded-full shadow-sm" />
										)}
									</div>
								</div>

								{hasContent && (
									<div className="flex-1 text-sm sm:text-base font-medium leading-relaxed pr-8">
										<div className="flex-1 text-sm sm:text-base font-medium leading-relaxed pr-8">
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
												<CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 fill-current bg-white rounded-full" />
												{!isReviewMode && (
													<span className="hidden sm:inline text-xs font-bold uppercase"></span>
												)}
											</div>
										) : isSelected ? (
											<XCircle className="text-red-600 dark:text-red-400 w-5 h-5 sm:w-6 sm:h-6 fill-current bg-white rounded-full" />
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
								<div className="px-12 pb-4 text-xs text-gray-400 italic">
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
