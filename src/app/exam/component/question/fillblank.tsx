// D:\Programms\Bymbaa\front\src\app\exam\component\question\fillInTheBlank.tsx
"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FillInTheBlankQuestionProps {
	questionId: number;
	questionText: string;
	correctAnswer?: string;
	value?: string;
	mode?: "exam" | "review";
	onAnswerChange?: (questionId: number, answerText: string) => void;
	readOnly?: boolean;
}

export default function FillInTheBlankQuestion({
	questionId,

	correctAnswer,
	value = "",
	mode = "exam",
	onAnswerChange,
	readOnly = false,
}: FillInTheBlankQuestionProps) {
	const [answer, setAnswer] = useState<string>(value);

	useEffect(() => {
		setAnswer(value);
	}, [value]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (readOnly) return;

		const newAnswer = event.target.value;
		setAnswer(newAnswer);

		if (onAnswerChange) {
			onAnswerChange(questionId, newAnswer);
		}
	};

	const isReviewMode = mode === "review";
	const isCorrect =
		isReviewMode && correctAnswer
			? answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
			: null;

	const inputClassName = isReviewMode
		? isCorrect === true
			? "border-green-500 bg-green-50"
			: isCorrect === false
				? "border-red-500 bg-red-50"
				: "border-gray-300 bg-gray-50"
		: "border-primary/50 focus-visible:ring-primary";

	return (
		<div className="space-y-3">
			<div className="grid w-full items-center gap-2">
				<Label
					htmlFor={`input-${questionId}`}
					className="text-sm font-medium text-gray-700"
				>
					{isReviewMode ? "Таны хариулт:" : "Хариултаа бичнэ үү:"}
				</Label>

				<div className="relative">
					<Input
						type="text"
						id={`input-${questionId}`}
						placeholder={readOnly ? "" : "Таны хариулт..."}
						value={answer}
						onChange={handleChange}
						readOnly={readOnly}
						disabled={readOnly}
						className={`w-full transition-colors ${inputClassName} ${
							readOnly ? "cursor-not-allowed" : ""
						}`}
					/>

					{isReviewMode && isCorrect !== null && (
						<div className="absolute right-3 top-1/2 -translate-y-1/2">
							{isCorrect ? (
								<CheckCircle2 className="w-5 h-5 text-green-600" />
							) : (
								<XCircle className="w-5 h-5 text-red-600" />
							)}
						</div>
					)}
				</div>

				{isReviewMode && isCorrect === false && correctAnswer && (
					<div className="p-3 bg-green-50 border border-green-200 rounded-md">
						<p className="text-sm text-green-800">
							<span className="font-semibold">Зөв хариулт:</span>{" "}
							{correctAnswer}
						</p>
					</div>
				)}

				{isReviewMode && isCorrect === true && (
					<div className="p-3 bg-green-50 border border-green-200 rounded-md">
						<p className="text-sm text-green-800 font-medium">✓ Зөв хариулт!</p>
					</div>
				)}
			</div>
		</div>
	);
}
