"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import parse from "html-react-parser";
import { CheckCircle2, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
	is_true?: boolean;
	refid?: number;
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
	const prevPropsRef = useRef<number[]>(selectedAnswersProp);

	// ⭐ Remove duplicates based on refid
	const uniqueAnswers = useMemo(() => {
		const seen = new Map<number, AnswerData>();

		answers.forEach((answer) => {
			const key = answer.refid ?? answer.answer_id;
			if (!seen.has(key)) {
				seen.set(key, answer);
			}
		});

		const unique = Array.from(seen.values());

		if (unique.length > 0 && unique[0].refid !== undefined) {
			unique.sort((a, b) => (a.refid ?? 0) - (b.refid ?? 0));
		}

		console.log("=== Multi Select Debug ===");
		console.log("Question ID:", questionId);
		console.log("Total answers:", answers.length);
		console.log("Unique answers:", unique.length);
		console.log("Selected:", selectedAnswers);
		console.log("=========================");

		return unique;
	}, [answers, questionId, selectedAnswers]);

	useEffect(() => {
		const newSelected = Array.isArray(selectedAnswersProp)
			? selectedAnswersProp
			: [];
		const prevSelected = prevPropsRef.current;

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

	const renderQuestionContent = () => {
		const imageUrl = isValidImageUrl(questionImage) ? questionImage : null;
		if (!imageUrl) return null;

		return (
			<Dialog>
				<DialogTrigger asChild>
					<button
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
					</button>
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

	const renderOptionContent = (option: AnswerData) => {
		const imageUrl = isValidImageUrl(option.answer_img)
			? option.answer_img
			: null;

		if (imageUrl) {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<button
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
						</button>
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

	// ⭐ Check if all selected answers are correct
	const showAnswerFeedback = mode === "exam" && selectedAnswers.length > 0;
	const allCorrect =
		selectedAnswers.length > 0 &&
		selectedAnswers.every(
			(id) => uniqueAnswers.find((a) => a.answer_id === id)?.is_true,
		);

	return (
		<div className="space-y-4">
			{renderQuestionContent()}

			<div className="space-y-3">
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Олон хариулт сонгох боломжтой
				</p>
				{uniqueAnswers.map((option) => {
					const selected = isSelected(option.answer_id);
					const hasImage = isValidImageUrl(option.answer_img);
					const isCorrect = option.is_true;

					// ⭐ Show correct answers when user finished selecting (optional)
					const shouldHighlight = isReviewMode && isCorrect;

					return (
						<Button
							key={option.answer_id}
							onClick={(e) => handleToggle(option.answer_id, e)}
							variant="outline"
							disabled={isReviewMode}
							className={`flex items-center gap-3 w-full justify-start text-left p-3 border rounded-md transition-colors ${
								hasImage ? "h-auto min-h-[100px]" : "min-h-[50px]"
							} ${
								selected
									? "border-primary bg-primary/10"
									: shouldHighlight
										? "border-green-400 bg-green-50 dark:bg-green-900/20"
										: "border-border"
							} ${isReviewMode ? "cursor-default opacity-70" : ""}`}
						>
							<span
								className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
									hasImage ? "self-start mt-2" : ""
								} ${
									selected
										? "border-primary bg-primary"
										: shouldHighlight
											? "border-green-500 bg-green-500"
											: "border-border bg-background"
								}`}
							>
								{(selected || shouldHighlight) && (
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

							{/* ⭐ Show correct badge in review mode */}
							{isReviewMode && isCorrect && (
								<span className="text-green-600 dark:text-green-400 font-medium text-xs sm:text-sm flex items-center gap-1 flex-shrink-0">
									<CheckCircle2 className="w-4 h-4" />
									Зөв
								</span>
							)}
						</Button>
					);
				})}
			</div>

			{/* ⭐ Show feedback below */}
			{showAnswerFeedback && (
				<div className="mt-4">
					{allCorrect ? (
						<div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 sm:p-4 rounded-lg">
							<p className="text-green-800 dark:text-green-300 font-semibold text-sm sm:text-base flex items-center gap-2">
								<CheckCircle2 className="w-5 h-5" />
								Таны сонголт хадгалагдсан: {selectedAnswers.length} хариулт
							</p>
						</div>
					) : (
						<div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-3 sm:p-4 rounded-lg">
							<p className="text-purple-800 dark:text-purple-300 font-semibold text-sm sm:text-base">
								Таны сонголт хадгалагдсан: {selectedAnswers.length} хариулт
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
