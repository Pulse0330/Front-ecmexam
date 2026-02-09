"use client";

import { memo, useCallback } from "react";
import MathContent from "./MathContent";
import QuestionImage from "./questionImage";

interface AnswerData {
	answer_id: number;
	answer_name?: string;
	answer_name_html?: string;
	answer_img?: string;
	source_img?: string;
	is_true?: boolean;
}

interface SingleSelectQuestionProps {
	questionId: number;
	questionText?: string;
	questionImage?: string;
	answers: AnswerData[];
	selectedAnswer?: number | null;
	onAnswerChange?: (questionId: number, answerId: number | null) => void;
}

function SingleSelectQuestion({
	questionId,
	questionImage,
	answers,
	selectedAnswer,
	onAnswerChange,
}: SingleSelectQuestionProps) {
	const handleSelect = useCallback(
		(answerId: number) => {
			if (!onAnswerChange) return;
			const newValue = selectedAnswer === answerId ? null : answerId;
			onAnswerChange(questionId, newValue);
		},
		[questionId, selectedAnswer, onAnswerChange],
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
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Нэг хариулт сонгох боломжтой
				</p>
				{answers.map((option) => {
					const isSelected = selectedAnswer === option.answer_id;
					const hasContent = option.answer_name_html || option.answer_name;
					const hasImage = option.answer_img || option.source_img;
					const imageUrl = option.answer_img || option.source_img;

					const colorClass = isSelected
						? "border-primary bg-primary/10"
						: "border-border bg-background hover:bg-gray-50 dark:hover:bg-gray-800/50";

					return (
						<div
							key={option.answer_id}
							className={`relative w-full rounded-lg border-2 transition-all duration-200 ${colorClass} overflow-hidden`}
						>
							<button
								type="button"
								onClick={() => handleSelect(option.answer_id)}
								className="w-full text-left p-3 sm:p-4 flex items-start gap-2 sm:gap-3 bg-transparent border-0 cursor-pointer"
							>
								<span
									className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all
				${
					isSelected
						? "border-primary bg-primary"
						: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
				}`}
								>
									{isSelected && (
										<span className="w-2.5 h-2.5 bg-white rounded-full" />
									)}
								</span>

								<div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">
									{hasContent && (
										<div
											className="text-left text-sm sm:text-base w-full"
											style={{
												lineHeight: "1.8",
												maxWidth: "100%",
												overflow: "visible",
											}}
										>
											{option.answer_name_html ? (
												<MathContent html={option.answer_name_html} />
											) : (
												<span className="text-gray-900 dark:text-gray-100">
													{option.answer_name}
												</span>
											)}
										</div>
									)}
									{!hasImage && !hasContent && (
										<span className="text-sm text-gray-400 italic">
											Хариулт байхгүй
										</span>
									)}
								</div>
							</button>

							{hasImage && imageUrl && (
								<div className="px-3 sm:px-4 pb-3 sm:pb-4 flex justify-center">
									<div className="w-full max-w-xs">
										<QuestionImage src={imageUrl} alt="Хариултын зураг" />
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default memo(SingleSelectQuestion);
