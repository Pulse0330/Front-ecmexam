// ========== D:\Programms\Bymbaa\front\src\app\exam\component\question\singleSelect.tsx ==========
"use client";

import parse from "html-react-parser";
import { CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface AnswerData {
	answer_id: number;
	answer_name_html?: string;
	answer_img?: string;
	is_true?: boolean;
}

interface SingleSelectQuestionProps {
	questionId: number;
	questionText?: string;
	answers: AnswerData[];
	mode: "exam" | "review";
	selectedAnswer?: number | null;
	correctAnswerId?: number | null;
	onAnswerChange?: (questionId: number, answerId: number | null) => void;
	initialMatches?: Record<number, number>;
}

function SingleSelectQuestion({
	questionId,
	answers,
	mode,
	selectedAnswer,
	correctAnswerId,
	onAnswerChange,
}: SingleSelectQuestionProps) {
	const isReviewMode = mode === "review";

	const handleSelect = useCallback(
		(answerId: number) => {
			if (isReviewMode || !onAnswerChange) return;
			const newValue = selectedAnswer === answerId ? null : answerId;
			onAnswerChange(questionId, newValue);
		},
		[questionId, selectedAnswer, isReviewMode, onAnswerChange],
	);

	return (
		<div className="space-y-3 sm:space-y-4">
			<div className="space-y-2 sm:space-y-3">
				<p>Нэг хариулт сонгох боломжтой</p>
				{answers.map((option) => {
					const isSelected = selectedAnswer === option.answer_id;
					const isCorrect =
						option.is_true || correctAnswerId === option.answer_id;

					const colorClass = isReviewMode
						? isCorrect
							? "border-green-500 bg-green-50"
							: isSelected
								? "border-red-500 bg-red-50"
								: "border-border bg-background"
						: isSelected
							? "border-primary bg-primary/10"
							: "border-border bg-background";

					return (
						<Button
							key={option.answer_id}
							onClick={() => handleSelect(option.answer_id)}
							variant="outline"
							disabled={isReviewMode}
							className={`relative flex items-start gap-2 sm:gap-3 w-full justify-start p-2 sm:p-3 rounded-md border transition-colors h-auto min-h-11 ${colorClass}`}
						>
							{isReviewMode && (
								<div className="absolute right-3 top-3">
									{isCorrect ? (
										<CheckCircle2 className="text-green-600 w-5 h-5" />
									) : isSelected ? (
										<XCircle className="text-red-600 w-5 h-5" />
									) : null}
								</div>
							)}

							{/* Radio circle */}
							<span
								className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5
                ${
									isSelected
										? isReviewMode
											? isCorrect
												? "border-green-500 bg-green-500"
												: "border-red-500 bg-red-500"
											: "border-primary bg-primary"
										: "border-border bg-background"
								}`}
							>
								{isSelected && (
									<span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary-foreground rounded-full" />
								)}
							</span>

							{option.answer_img && (
								<div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border rounded-md overflow-hidden bg-white">
									<Image
										src={option.answer_img}
										alt={`Answer ${option.answer_id}`}
										width={80}
										height={80}
										className="w-full h-full object-cover"
									/>
								</div>
							)}

							<span className="flex-1 min-w-0 text-left text-sm sm:text-base wrap-break-words leading-relaxed whitespace-pre-wrap">
								{option.answer_name_html ? parse(option.answer_name_html) : ""}
							</span>
						</Button>
					);
				})}
			</div>
		</div>
	);
}

export default memo(SingleSelectQuestion);
