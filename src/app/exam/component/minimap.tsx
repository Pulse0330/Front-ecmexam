"use client";

import { Bookmark, CheckCircle2, X } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { AnswerValue } from "@/types/exam/exam";

interface ExamMinimapProps {
	totalCount: number;
	answeredCount: number;
	currentQuestionIndex: number;
	selectedAnswers: Record<number, AnswerValue>;
	questions: Array<{
		question_id: number;
		que_type_id: number;
		question_name?: string;
	}>;
	onQuestionClick: (index: number) => void;
	bookmarkedQuestions: Set<number>;
	isMobileOverlay?: boolean;
	onClose?: () => void;
}

// ✅ FIX 1: render бүрт new Set() үүсгэхгүй — module-level constant
const EMPTY_BOOKMARKS = new Set<number>();

const ExamMinimap = memo(function ExamMinimap({
	totalCount,
	answeredCount,
	currentQuestionIndex,
	selectedAnswers,
	questions,
	onQuestionClick,
	bookmarkedQuestions = EMPTY_BOOKMARKS,
	isMobileOverlay = false,
	onClose,
}: ExamMinimapProps) {
	// ✅ FIX 2: useCallback — render бүрт шинэ функц үүсгэхгүй
	const isQuestionAnswered = useCallback(
		(questionId: number): boolean => {
			const answer = selectedAnswers[questionId];
			if (Array.isArray(answer)) return answer.length > 0;
			if (typeof answer === "string") return answer.trim() !== "";
			if (typeof answer === "object" && answer !== null) {
				return Object.keys(answer).length > 0;
			}
			return answer !== null && answer !== undefined;
		},
		[selectedAnswers],
	);

	// ✅ FIX 3: stats-аас bookmarked тооцооллыг салга — тус бүр өөрийн dependency-тэй
	const bookmarkedCount = useMemo(
		() =>
			questions.filter((q) => bookmarkedQuestions.has(q.question_id)).length,
		[questions, bookmarkedQuestions],
	);

	const bookmarkedQuestionsArray = useMemo(
		() => questions.filter((q) => bookmarkedQuestions.has(q.question_id)),
		[questions, bookmarkedQuestions],
	);

	// ✅ bookmarkedQuestionsArray-аас index хайх O(n) → Map болгох
	const questionIndexMap = useMemo(() => {
		return new Map(questions.map((q, idx) => [q.question_id, idx]));
	}, [questions]);

	const _progressPercentage =
		totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

	if (isMobileOverlay) {
		return (
			<div className="fixed inset-0 bg-black/50 z-50 flex items-end animate-in fade-in duration-200">
				<div className="w-full bg-white dark:bg-slate-900 rounded-t-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
					<div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
						<div>
							<h3 className="font-bold text-lg text-slate-900 dark:text-white">
								Асуултууд
							</h3>
							<p className="text-sm text-slate-600 dark:text-slate-400">
								{answeredCount}/{totalCount} хариулсан
							</p>
						</div>
						<Button
							onClick={onClose}
							className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
						>
							<X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
						</Button>
					</div>

					<div className="p-4 space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
								<div className="text-2xl font-black text-green-600 dark:text-green-400">
									{answeredCount}
								</div>
								<div className="text-xs text-green-700 dark:text-green-300 font-semibold">
									Хариулсан
								</div>
							</div>
							<div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
								<div className="text-2xl font-black text-orange-600 dark:text-orange-400">
									{totalCount - answeredCount}
								</div>
								<div className="text-xs text-orange-700 dark:text-orange-300 font-semibold">
									Үлдсэн
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
							<div className="flex items-center justify-between mb-3">
								<span className="text-sm font-bold text-slate-700 dark:text-slate-200">
									Бүх асуултууд
								</span>
								<span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full font-semibold text-slate-600 dark:text-slate-400">
									{questions.length}
								</span>
							</div>
							<div className="grid grid-cols-5 gap-2">
								{questions.map((q, idx) => {
									const answered = isQuestionAnswered(q.question_id);
									const isBookmarked = bookmarkedQuestions.has(q.question_id);
									const isCurrent = currentQuestionIndex === idx;

									return (
										<button
											type="button"
											key={`${q.question_id ?? "q"}-${idx}`}
											onClick={() => {
												onQuestionClick(idx);
												onClose?.();
											}}
											className={`relative aspect-square rounded-lg transition-all active:scale-90 flex items-center justify-center text-sm font-bold
												${
													answered
														? "bg-linear-to-br from-green-500 to-green-600 text-white shadow-sm"
														: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
												}
												${isCurrent ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-105" : ""}
											`}
										>
											{idx + 1}
											{isBookmarked && (
												<span className="absolute -top-1 -right-1 z-10">
													<div className="bg-yellow-400 rounded-full p-0.5 shadow-md">
														<Bookmark className="w-2 h-2 fill-white text-white" />
													</div>
												</span>
											)}
											{answered && (
												<CheckCircle2 className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-white opacity-80" />
											)}
										</button>
									);
								})}
							</div>
						</div>

						{bookmarkedQuestionsArray.length > 0 && (
							<div className="bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4">
								<div className="flex items-center gap-2 mb-3">
									<Bookmark className="w-4 h-4 fill-yellow-500 text-yellow-500" />
									<span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
										Тэмдэглэсэн ({bookmarkedCount})
									</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{bookmarkedQuestionsArray.map((q, bmIdx) => {
										// ✅ FIX 4: O(n) findIndex → O(1) Map.get()
										const questionIndex =
											questionIndexMap.get(q.question_id) ?? -1;
										return (
											<button
												type="button"
												key={`${q.question_id ?? "b"}-${bmIdx}`}
												onClick={() => {
													onQuestionClick(questionIndex);
													onClose?.();
												}}
												className="bg-white dark:bg-slate-800 border border-yellow-300 dark:border-yellow-700 rounded-md px-3 py-1.5 text-sm font-bold text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 active:scale-95 transition-all shadow-sm"
											>
												#{questionIndex + 1}
											</button>
										);
									})}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Desktop Version
	return (
		<div className="space-y-2 w-full">
			<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
				<div className="p-2.5 sm:p-3">
					<div className="flex items-center justify-between mb-2">
						<span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200">
							Асуултууд
						</span>
						<span className="text-[9px] sm:text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold text-slate-600 dark:text-slate-400">
							{questions.length}
						</span>
					</div>
					<div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-6 gap-1 sm:gap-1.5">
						{questions.map((q, idx) => {
							const answered = isQuestionAnswered(q.question_id);
							const isBookmarked = bookmarkedQuestions.has(q.question_id);
							const isCurrent = currentQuestionIndex === idx;

							return (
								<button
									type="button"
									key={`${q.question_id ?? "q"}-${idx}`}
									onClick={() => onQuestionClick(idx)}
									className={`relative aspect-square rounded-lg transition-all active:scale-90 flex items-center justify-center text-[10px] sm:text-xs font-bold w-full
										${
											answered
												? "bg-linear-to-br from-green-500 to-green-600 text-white shadow-sm hover:shadow-md"
												: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
										}
										${isCurrent ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 scale-105" : ""}
									`}
								>
									{idx + 1}
									{isBookmarked && (
										<span className="absolute -top-0.5 -right-0.5 z-10">
											<div className="bg-yellow-400 rounded-full p-0.5 shadow-md">
												<Bookmark className="w-1.5 h-1.5 sm:w-2 sm:h-2 fill-white text-white" />
											</div>
										</span>
									)}
									{answered && (
										<CheckCircle2 className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 text-white opacity-80" />
									)}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-1.5 sm:gap-2">
				<div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 sm:p-2.5 text-center">
					<div className="text-lg sm:text-xl md:text-2xl font-black text-green-600 dark:text-green-400">
						{answeredCount}
					</div>
					<div className="text-[9px] sm:text-[10px] md:text-xs text-green-700 dark:text-green-300 font-semibold">
						Хариулсан
					</div>
				</div>
				<div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2 sm:p-2.5 text-center">
					<div className="text-lg sm:text-xl md:text-2xl font-black text-orange-600 dark:text-orange-400">
						{totalCount - answeredCount}
					</div>
					<div className="text-[9px] sm:text-[10px] md:text-xs text-orange-700 dark:text-orange-300 font-semibold">
						Үлдсэн
					</div>
				</div>
			</div>

			{bookmarkedQuestionsArray.length > 0 && (
				<div className="bg-linear-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-800 overflow-hidden">
					<div className="p-2 sm:p-2.5">
						<div className="flex items-center gap-1.5 mb-1.5">
							<Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-500 text-yellow-500" />
							<span className="text-[10px] sm:text-xs font-bold text-yellow-800 dark:text-yellow-200">
								Тэмдэглэсэн ({bookmarkedCount})
							</span>
						</div>
						<div className="flex flex-wrap gap-1 sm:gap-1.5">
							{bookmarkedQuestionsArray.map((q, bmIdx) => {
								// ✅ FIX 4: O(n) findIndex → O(1) Map.get()
								const questionIndex = questionIndexMap.get(q.question_id) ?? -1;
								return (
									<button
										type="button"
										key={`${q.question_id ?? "b"}-${bmIdx}`}
										onClick={() => onQuestionClick(questionIndex)}
										className="bg-white dark:bg-slate-800 border border-yellow-300 dark:border-yellow-700 rounded-md px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 active:scale-95 transition-all shadow-sm"
									>
										#{questionIndex + 1}
									</button>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
});

export default ExamMinimap;
