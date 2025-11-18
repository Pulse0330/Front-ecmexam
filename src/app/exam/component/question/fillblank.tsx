"use client";

import { CheckCircle2, Edit2, Send, XCircle } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
	const [isSubmitted, setIsSubmitted] = useState<boolean>(!!value);
	const [isEditing, setIsEditing] = useState<boolean>(!value);

	useEffect(() => {
		setAnswer(value);
		if (value) {
			setIsSubmitted(true);
			setIsEditing(false);
		}
	}, [value]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (readOnly || (isSubmitted && !isEditing)) return;

		const newAnswer = event.target.value;
		setAnswer(newAnswer);
	};

	const handleSubmit = () => {
		if (!answer.trim()) return;

		setIsSubmitted(true);
		setIsEditing(false);

		// Backend-рүү хадгалах
		if (onAnswerChange) {
			onAnswerChange(questionId, answer);
		}
	};

	const handleEdit = () => {
		setIsEditing(true);
		setIsSubmitted(false);
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
		: isSubmitted && !isEditing
			? "border-blue-500 bg-blue-50"
			: "border-primary/50 focus-visible:ring-primary";

	const canEdit = !readOnly && !isReviewMode;
	const showSubmitButton = canEdit && isEditing && answer.trim();
	const showEditButton = canEdit && isSubmitted && !isEditing;

	return (
		<div className="space-y-3">
			<div className="grid w-full items-center gap-2">
				<Label
					htmlFor={`input-${questionId}`}
					className="text-sm font-medium text-gray-700"
				>
					{isReviewMode ? "Таны хариулт:" : "Хариултаа бичнэ үү:"}
				</Label>

				<div className="flex gap-2">
					<div className="relative flex-1">
						<Input
							type="text"
							id={`input-${questionId}`}
							placeholder={readOnly ? "" : "Таны хариулт..."}
							value={answer}
							onChange={handleChange}
							readOnly={readOnly || (isSubmitted && !isEditing)}
							disabled={readOnly}
							className={`w-full transition-colors ${inputClassName} ${
								readOnly || (isSubmitted && !isEditing)
									? "cursor-not-allowed"
									: ""
							}`}
							onKeyDown={(e) => {
								if (e.key === "Enter" && showSubmitButton) {
									handleSubmit();
								}
							}}
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

					{showSubmitButton && (
						<Button
							onClick={handleSubmit}
							size="icon"
							className="bg-primary hover:bg-primary/90"
							title="Илгээх"
						>
							<Send className="w-4 h-4" />
						</Button>
					)}

					{showEditButton && (
						<Button
							onClick={handleEdit}
							size="icon"
							variant="outline"
							className="border-blue-500 text-blue-600 hover:bg-blue-50"
							title="Засах"
						>
							<Edit2 className="w-4 h-4" />
						</Button>
					)}
				</div>

				{isSubmitted && !isEditing && !isReviewMode && <div></div>}

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
