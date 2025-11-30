"use client";

import { AlertCircle, Edit2, Send } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FillInTheBlankQuestionProps {
	questionId: number;
	questionText: string;
	value?: string;
	onAnswerChange?: (questionId: number, answerText: string) => void;
	readOnly?: boolean;
	showValidation?: boolean;
}

export default function FillInTheBlankQuestion({
	questionId,
	value = "",
	onAnswerChange,
	readOnly = false,
	showValidation = false,
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
		if (!answer.trim()) {
			alert("⚠ Хариултаа бичээд дараа нь илгээх товч дарна уу!");
			return;
		}

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

	const isNotSubmitted = showValidation && !isSubmitted;
	const hasAnswerButNotSubmitted = answer.trim() && !isSubmitted && isEditing;

	const inputClassName = isNotSubmitted
		? "border-red-500 bg-red-50"
		: hasAnswerButNotSubmitted
			? "border-red-500 border-2"
			: isSubmitted && !isEditing
				? "border-blue-500 bg-blue-50"
				: "border-primary/50 focus-visible:ring-primary";

	const canEdit = !readOnly;
	const showSubmitButton = canEdit && isEditing;
	const showEditButton = canEdit && isSubmitted && !isEditing;

	return (
		<div className="space-y-3">
			<div className="grid w-full items-center gap-2">
				<Label
					htmlFor={`input-${questionId}`}
					className="text-sm font-medium text-gray-700"
				>
					Хариултаа бичнэ үү: <span className="text-red-600">*</span>
					<span className="text-xs text-gray-500 ml-2">
						(Заавал илгээх товч дарна уу)
					</span>
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

						{isNotSubmitted && (
							<div className="absolute right-3 top-1/2 -translate-y-1/2">
								<AlertCircle className="w-5 h-5 text-red-600" />
							</div>
						)}
					</div>

					{showSubmitButton && (
						<Button
							onClick={handleSubmit}
							size="icon"
							className="bg-primary hover:bg-primary/90"
							title="Илгээх"
							disabled={!answer.trim()}
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

				{isNotSubmitted && (
					<div className="p-3 bg-red-50 border border-red-200 rounded-md">
						<p className="text-sm text-red-800 font-medium">
							⚠ Хариултаа заавал илгээх шаардлагатай!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
