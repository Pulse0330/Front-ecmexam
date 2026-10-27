"use client";

import { memo, useCallback, useRef } from "react";
import MathContent from "../examUtils/MathContent";
import QuestionImage from "./questionImage";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

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
	onAnswerChange?: (questionId: number, answerId: number) => void; // ✅ null хасав — parent шийдэх
}

function SingleSelectQuestion({
	questionId,
	questionImage,
	answers,
	selectedAnswer,
	onAnswerChange,
}: SingleSelectQuestionProps) {
	// ✅ Ref — стale closure-аас хамгаалах
	const selectedAnswerRef = useRef(selectedAnswer);
	selectedAnswerRef.current = selectedAnswer;

	const handleSelect = useCallback(
		(answerId: number) => {
			if (!onAnswerChange) return;
			// ✅ Ref-ээс уншина — үргэлж шинэ утга
			if (selectedAnswerRef.current === answerId) return; // toggle хийхгүй — parent шийдэх
			onAnswerChange(questionId, answerId);
		},
		[questionId, onAnswerChange], // ✅ selectedAnswer dependency хасагдсан
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
			<div className="space-y-2.5 sm:space-y-3">
				<p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
					Нэг хариулт сонгоно уу
				</p>
				{answers.map((option, idx) => {
					const isSelected = selectedAnswer === option.answer_id;
					const hasContent = option.answer_name_html || option.answer_name;
					const hasImage = option.answer_img || option.source_img;
					const imageUrl = option.answer_img || option.source_img;
					const label = OPTION_LABELS[idx] ?? String(idx + 1);

					return (
						<div
							key={option.answer_id}
							className={`relative w-full rounded-xl border transition-all duration-150 overflow-hidden ${
								isSelected
									? "border-primary ring-1 ring-primary bg-primary/5"
									: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800/50"
							}`}
						>
							<button
								type="button"
								onClick={() => handleSelect(option.answer_id)}
								className="w-full text-left px-3 py-3 sm:px-4 sm:py-3.5 flex items-start gap-3 sm:gap-4 bg-transparent border-0 cursor-pointer"
								// ✅ Давхар дарахаас хамгаалах
								aria-pressed={isSelected}
							>
								<span
									className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-sm font-semibold transition-colors ${
										isSelected
											? "border-primary bg-primary text-primary-foreground"
											: "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
									}`}
								>
									{label}
								</span>
								<div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden self-center">
									{hasContent && (
										<div
											className="text-left text-[15px] sm:text-base w-full text-slate-800 dark:text-slate-100"
											style={{ lineHeight: "1.7" }}
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

export default memo(
	SingleSelectQuestion,
	(prev, next) =>
		// ✅ Зөвхөн шаардлагатай prop өөрчлөгдөхөд re-render
		prev.selectedAnswer === next.selectedAnswer &&
		prev.questionId === next.questionId &&
		prev.answers === next.answers &&
		prev.onAnswerChange === next.onAnswerChange,
);
