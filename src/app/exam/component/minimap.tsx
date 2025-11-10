// ExamMinimap.tsx
"use client";

import { Bookmark, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ExamMinimapProps {
	totalCount: number;
	answeredCount: number;
	currentQuestionIndex?: number;
	selectedAnswers: Record<
		number,
		number | number[] | string | Record<number, number> | null
	>;
	questions: Array<{ question_id: number }>;
	onQuestionClick?: (index: number) => void;
	timerComponent?: ReactNode;
	bookmarkedQuestions?: Set<number>;
}

export default function ExamMinimap({
	totalCount,
	answeredCount,
	currentQuestionIndex,
	selectedAnswers,
	questions,
	onQuestionClick,
	bookmarkedQuestions = new Set(),
}: ExamMinimapProps) {
	const progressPercentage =
		totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

	const bookmarkedCount = questions.filter((q) =>
		bookmarkedQuestions.has(q.question_id),
	).length;

	const isQuestionAnswered = (questionId: number): boolean => {
		const answer = selectedAnswers[questionId];
		if (Array.isArray(answer)) return answer.length > 0;
		if (typeof answer === "string") return answer.trim() !== "";
		if (
			typeof answer === "object" &&
			answer !== null &&
			!Array.isArray(answer)
		) {
			// Handle Record<number, number> for matching questions
			return Object.keys(answer).length > 0;
		}
		return answer !== null && answer !== undefined;
	};

	return (
		<Card className="shadow-lg border-border sticky top-4 overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl">
			<CardContent className="p-5 space-y-5">
				{/* Progress Card */}
				<div className="rounded-xl p-4 border-b">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium opacity-90">Явц</span>
						<span className="text-2xl font-bold">{progressPercentage}%</span>
					</div>
					<Progress value={progressPercentage} className="h-3 bg-blue-400" />
					<div className="flex items-center gap-2 mt-3 text-sm opacity-90">
						<CheckCircle2 className="w-5 h-5" />
						<span>
							{answeredCount} / {totalCount} хариулсан
						</span>
					</div>
				</div>

				{/* Question Grid */}
				<div>
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-semibold text-gray-700">Асуултууд</h3>
						<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
							{questions.length}
						</span>
					</div>
					<div className="grid grid-cols-5 gap-3">
						{questions.map((q, index) => {
							const isAnswered = isQuestionAnswered(q.question_id);
							const isCurrent = currentQuestionIndex === index;
							const isBookmarked = bookmarkedQuestions.has(q.question_id);

							return (
								<Button
									key={q.question_id}
									onClick={() => onQuestionClick?.(index)}
									variant="ghost"
									className={cn(
										"aspect-square rounded-lg flex items-center justify-center text-sm font-semibold relative group transition-all duration-300",
										"hover:scale-105 hover:shadow-md active:scale-95",
										isAnswered
											? "bg-gradient-to-br from-green-400 to-green-600 text-white"
											: "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600",
										isCurrent &&
											"ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-110 text-lg font-bold",
									)}
									title={`Асуулт ${index + 1} ${
										isAnswered ? "(✓ Хариулсан)" : "(Хариулаагүй)"
									}${isBookmarked ? " 🔖" : ""}`}
								>
									<span>{index + 1}</span>
									{isAnswered && (
										<CheckCircle2 className="w-4 h-4 absolute top-1 right-1 text-white opacity-90" />
									)}
									{isBookmarked && (
										<Bookmark className="w-4 h-4 absolute bottom-1 right-1 text-yellow-400 fill-yellow-400" />
									)}
									{isCurrent && (
										<div className="absolute inset-0 bg-blue-500/20 rounded-lg animate-pulse" />
									)}
								</Button>
							);
						})}
					</div>
				</div>

				{/* Stats */}
				<div className="rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-2 text-sm">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-green-500" />
							<span className="text-gray-700 font-medium">Хариулсан</span>
						</div>
						<span className="font-bold text-green-600">{answeredCount}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-gray-300" />
							<span className="text-gray-700 font-medium">Хариулаагүй</span>
						</div>
						<span className="font-bold text-gray-600">
							{totalCount - answeredCount}
						</span>
					</div>
					{bookmarkedCount > 0 && (
						<div className="flex items-center justify-between">
							<Bookmark className="w-3 h-3 text-yellow-500 fill-yellow-500" />
							<span className="text-gray-700 font-medium">Тэмдэглэсэн</span>
							<span className="font-bold text-yellow-600">
								{bookmarkedCount}
							</span>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
