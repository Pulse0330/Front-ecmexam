"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import parse from "html-react-parser";
import { ZoomIn } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface AnswerData {
	answer_id: number;
	answer_name_html?: string;
	answer_img?: string;
	answer_type: number;
}

interface MultiSelectQuestionProps {
	questionId: number;
	questionText?: string;
	questionImage?: string | null;
	answers: AnswerData[];
	mode: "exam" | "review";
	selectedAnswers?: number[];
	onAnswerChange?: (questionId: number, answerIds: number[]) => void;
	readOnly?: boolean;
}

const isValidImageUrl = (url: string | null | undefined): boolean => {
	if (!url || url.trim() === "") return false;
	return url.startsWith("http") || url.startsWith("/");
};

export default function MultiSelectQuestion({
	questionId,
	questionText,
	questionImage,
	answers,
	mode,
	selectedAnswers: selectedAnswersProp = [],
	onAnswerChange,
	readOnly = false,
}: MultiSelectQuestionProps) {
	const [selectedAnswers, setSelectedAnswers] =
		useState<number[]>(selectedAnswersProp);
	const isReviewMode = mode === "review" || readOnly;

	// ✅ Use ref to track previous prop value
	const prevPropsRef = useRef<number[]>(selectedAnswersProp);

	// ✅ Fixed: Sync with props without causing infinite loop
	useEffect(() => {
		const newSelected = Array.isArray(selectedAnswersProp)
			? selectedAnswersProp
			: [];
		const prevSelected = prevPropsRef.current;

		// Only update if props actually changed (compare sorted arrays)
		const hasChanged =
			newSelected.length !== prevSelected.length ||
			newSelected.some((id, idx) => id !== prevSelected[idx]);

		if (hasChanged) {
			setSelectedAnswers(newSelected);
			prevPropsRef.current = newSelected;
		}
	}, [selectedAnswersProp]);

	const handleToggle = useCallback(
		(answerId: number, event?: React.MouseEvent) => {
			// Dialog trigger дарахад checkbox toggle хийхгүй
			if (event) {
				const target = event.target as HTMLElement;
				if (target.closest("[data-dialog-trigger]")) return;
			}

			if (isReviewMode) return;

			const newSelected = selectedAnswers.includes(answerId)
				? selectedAnswers.filter((id) => id !== answerId)
				: [...selectedAnswers, answerId];

			setSelectedAnswers(newSelected);

			if (onAnswerChange) {
				onAnswerChange(questionId, newSelected);
			}
		},
		[questionId, selectedAnswers, isReviewMode, onAnswerChange],
	);

	const isSelected = (answerId: number) => selectedAnswers.includes(answerId);

	// Асуултын зураг render
	const renderQuestionContent = () => {
		const imageUrl = isValidImageUrl(questionImage) ? questionImage : null;
		if (!imageUrl) return null;

		return (
			<Dialog>
				<DialogTrigger asChild>
					<Button
						type="button"
						className="relative mb-4 w-full cursor-pointer hover:opacity-90 transition-opacity border rounded-md overflow-hidden group"
					>
						<Image
							src={imageUrl}
							alt={questionText || "Question"}
							width={800}
							height={300}
							className="w-full h-auto object-contain bg-gray-50 max-h-[300px]"
						/>
						<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
							<ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
						</div>
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-[90vw] max-h-[90vh]">
					<VisuallyHidden>
						<DialogTitle>Асуултын зураг</DialogTitle>
					</VisuallyHidden>
					<div className="relative w-full h-[80vh] flex items-center justify-center">
						<Image
							src={imageUrl}
							alt={questionText || "Question"}
							width={1200}
							height={800}
							className="max-w-full max-h-full object-contain"
						/>
					</div>
				</DialogContent>
			</Dialog>
		);
	};

	// Сонголт render
	const renderOptionContent = (option: AnswerData) => {
		const imageUrl = isValidImageUrl(option.answer_img)
			? option.answer_img
			: null;

		if (imageUrl) {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<Button
							type="button"
							data-dialog-trigger
							className="cursor-pointer hover:opacity-90 transition-opacity rounded overflow-hidden border w-full"
							onClick={(e) => e.stopPropagation()}
						>
							<Image
								src={imageUrl}
								alt={option.answer_name_html || "Option"}
								width={400}
								height={150}
								className="w-full h-auto object-contain max-h-[150px]"
							/>
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-[90vw] max-h-[90vh]">
						<VisuallyHidden>
							<DialogTitle>Сонголтын зураг</DialogTitle>
						</VisuallyHidden>
						<div className="space-y-4">
							<div className="relative w-full h-[70vh] flex items-center justify-center">
								<Image
									src={imageUrl}
									alt={option.answer_name_html || "Option"}
									width={1200}
									height={800}
									className="max-w-full max-h-full object-contain"
								/>
							</div>
							{option.answer_name_html && (
								<p className="text-center text-lg font-medium">
									{parse(option.answer_name_html)}
								</p>
							)}
						</div>
					</DialogContent>
				</Dialog>
			);
		}

		return (
			<span className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
				{option.answer_name_html ? parse(option.answer_name_html) : ""}
			</span>
		);
	};

	return (
		<div className="space-y-4">
			{renderQuestionContent()}

			<div className="space-y-3">
				<p>Олон хариулт сонгох боломжтой</p>
				{answers.map((option) => {
					const selected = isSelected(option.answer_id);
					const hasImage = isValidImageUrl(option.answer_img);

					return (
						<Button
							key={option.answer_id}
							onClick={(e) => handleToggle(option.answer_id, e)}
							variant="outline"
							disabled={isReviewMode}
							className={`flex items-center gap-3 w-full justify-start text-left p-3 border rounded-md transition-colors ${
								hasImage ? "h-auto min-h-[100px]" : "min-h-[50px]"
							} ${selected ? "border-primary bg-primary/10" : "border-border"} ${
								isReviewMode ? "cursor-default opacity-70" : ""
							}`}
						>
							<span
								className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
									hasImage ? "self-start mt-2" : ""
								} ${selected ? "border-primary bg-primary" : "border-border bg-background"}`}
							>
								{selected && (
									<svg
										className="w-3 h-3 text-primary-foreground"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<title>Checkmark</title>
										<path d="M5 13l4 4L19 7" />
									</svg>
								)}
							</span>

							<div className="flex-1">{renderOptionContent(option)}</div>
						</Button>
					);
				})}
			</div>

			{selectedAnswers.length > 0 && (
				<div className="text-sm text-muted-foreground">
					{selectedAnswers.length} сонголт сонгосон
				</div>
			)}
		</div>
	);
}
