"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { memo, useCallback } from "react";
import MathContent from "@/app/exam/component/examUtils/MathContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AnswerValue } from "@/types/exam/exam";
import type { ExamQuestion } from "./examTypes";
import QuestionRenderer from "./questionRenderer";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface QuestionCardProps {
	question: ExamQuestion;
	index?: number;
	selectedAnswer: AnswerValue | undefined;
	isBookmarked: boolean;
	isTyping: boolean;
	onAnswerChange: (questionId: number, answer: AnswerValue) => void;
	onBookmarkToggle: (questionId: number) => void;
	examId?: number;
	userId: number;
	variant?: "desktop" | "mobile";
	showTypingIndicator?: boolean;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function isAnsweredValue(answer: AnswerValue | undefined): boolean {
	if (answer === undefined || answer === null) return false;
	if (Array.isArray(answer)) return answer.length > 0;
	if (typeof answer === "string") return answer.trim() !== "";
	if (typeof answer === "number") return !Number.isNaN(answer) && answer !== 0;
	if (typeof answer === "object") return Object.keys(answer).length > 0;
	return false;
}

function getBorderClass(
	isAnswered: boolean,
	isBookmarked: boolean,
	isTyping: boolean,
): string {
	if (isTyping) return "border-2 border-blue-400 shadow-lg";
	if (isAnswered && isBookmarked) return "border-2 border-amber-500 shadow-sm";
	if (isAnswered) return "border-2 border-blue-600 shadow-sm";
	if (isBookmarked) return "border-2 border-amber-400 shadow-sm";
	return "border border-gray-200";
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
const BOUNCE_DELAYS = [0, 150, 300];
const TypingIndicator = memo(function TypingIndicator() {
	return (
		<div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 rounded-md">
			<div className="flex gap-0.5">
				{BOUNCE_DELAYS.map((delay) => (
					<span key={delay} style={{ animationDelay: `${delay}ms` }} />
				))}
			</div>
		</div>
	);
});

interface BookmarkButtonProps {
	isBookmarked: boolean;
	onClick: () => void;
	className?: string;
}

const BookmarkButton = memo(function BookmarkButton({
	isBookmarked,
	onClick,
	className,
}: BookmarkButtonProps) {
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={onClick}
			className={className}
			title={isBookmarked ? "Тэмдэглэгээ хасах" : "Тэмдэглэх"}
		>
			{isBookmarked ? (
				<BookmarkCheck className="w-5 h-5 text-yellow-500 fill-yellow-500" />
			) : (
				<Bookmark className="w-5 h-5 text-slate-400" />
			)}
		</Button>
	);
});

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export const QuestionCard = memo(function QuestionCard({
	question: q,

	selectedAnswer,
	isBookmarked,
	isTyping,
	onAnswerChange,
	onBookmarkToggle,
	examId,
	userId,
	variant = "desktop",
	showTypingIndicator = true,
}: QuestionCardProps) {
	const handleBookmark = useCallback(
		() => onBookmarkToggle(q.question_id),
		[onBookmarkToggle, q.question_id],
	);

	const isAnswered = isAnsweredValue(selectedAnswer);
	const borderClass = getBorderClass(isAnswered, isBookmarked, isTyping);

	// ── Desktop layout ──────────────────────────────────────────
	if (variant === "desktop") {
		return (
			<div id={`question-${q.question_id}`}>
				<Card className={borderClass}>
					<CardContent className="p-6">
						<div className="flex gap-4">
							<div className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-semibold">
								{q.row_num}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2 mb-4">
									<div className="font-semibold text-lg flex-1 leading-relaxed prose prose-sm max-w-none">
										 <MathContent html={q.question_name.replace(/<img[^>]*>/gi, "")} />
									</div>
									<BookmarkButton
										isBookmarked={isBookmarked}
										onClick={handleBookmark}
										className="hover:bg-gray-100 shrink-0"
									/>
								</div>
								<QuestionRenderer
									question={q}
									selectedAnswer={selectedAnswer}
									onAnswerChange={onAnswerChange}
									examId={examId}
									userId={userId}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// ── Mobile layout ───────────────────────────────────────────
	return (
		<Card className={`${borderClass} shadow-sm`}>
			<CardContent className="p-4">
				<div className="flex items-start gap-3 mb-4">
					<div className="shrink-0 w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
						{q.row_num}
					</div>
					<div className="flex-1 min-w-0">
						<div className="font-semibold leading-relaxed prose prose-sm max-w-none text-sm">
							 <MathContent html={q.question_name.replace(/<img[^>]*>/gi, "")} />
						</div>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						{showTypingIndicator && isTyping && <TypingIndicator />}
						<BookmarkButton
							isBookmarked={isBookmarked}
							onClick={handleBookmark}
							className="shrink-0 h-9 w-9"
						/>
					</div>
				</div>
				<div className="mt-4">
					<QuestionRenderer
						question={q}
						selectedAnswer={selectedAnswer}
						onAnswerChange={onAnswerChange}
						examId={examId}
						userId={userId}
					/>
				</div>
			</CardContent>
		</Card>
	);
});

// ─────────────────────────────────────────────
// Backwards-compatible named exports
// ─────────────────────────────────────────────

export function DesktopQuestionCard(props: Omit<QuestionCardProps, "variant">) {
	return <QuestionCard {...props} variant="desktop" />;
}

export function MobileQuestionCard(props: Omit<QuestionCardProps, "variant">) {
	return <QuestionCard {...props} variant="mobile" />;
}
