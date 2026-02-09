import {
	ArrowRight,
	BookOpen,
	CheckCircle2,
	Minus,
	MinusIcon,
	Plus,
	PlusIcon,
	Search,
} from "lucide-react";
import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import type { TestGroupItem } from "@/types/exercise/testGroup";

// --- Types ---
export interface LessonGroup {
	lesson_id: number;
	lesson_name: string;
	totalTests: number;
}

export interface CategoryGroup {
	coursename: string;
	ulesson_name: string;
	items: TestGroupItem[];
}

// --- Components ---

export const SkeletonCard = memo(() => (
	<div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-slate-200 dark:border-slate-700 animate-pulse">
		<div className="h-4 sm:h-5 md:h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2 sm:mb-3"></div>
		<div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-1.5 sm:mb-2"></div>
		<div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
	</div>
));
SkeletonCard.displayName = "SkeletonCard";

export const EmptyState = memo(({ searchQuery }: { searchQuery: string }) => (
	<div className="text-center py-12 sm:py-16 md:py-20 w-full col-span-full">
		<div className="relative inline-block mb-4 sm:mb-6">
			<BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 dark:text-slate-600" />
			<div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 dark:bg-emerald-600 rounded-full flex items-center justify-center">
				<Search className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
			</div>
		</div>
		<h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1.5 sm:mb-2">
			{searchQuery ? "Хайлт олдсонгүй" : "Тест олдсонгүй"}
		</h3>
		<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
			{searchQuery
				? "Өөр түлхүүр үг ашиглан дахин оролдоно уу"
				: "Тестийн бүлгүүд удахгүй нэмэгдэх болно"}
		</p>
	</div>
));
EmptyState.displayName = "EmptyState";

export const LessonCard = memo(
	({
		lesson,
		selectedCount,
		totalQuestions,
		onClick,
	}: {
		lesson: LessonGroup;
		selectedCount: number;
		totalQuestions: number;
		onClick: () => void;
	}) => {
		const hasSelection = selectedCount > 0;

		return (
			<button
				type="button"
				onClick={onClick}
				className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors duration-200 text-left relative overflow-hidden w-full"
			>
				<div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
				<div className="relative flex flex-col h-full min-h-[50px] sm:min-h-[60px]">
					<div className="flex-1">
						<div className="mb-2 sm:mb-3">
							{hasSelection && (
								<div className="flex items-center justify-end gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-500 dark:bg-emerald-600 rounded-md sm:rounded-lg mb-2">
									<span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
										Сонгосон
									</span>
								</div>
							)}
							<h3 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight line-clamp-2 text-center">
								{lesson.lesson_name}
							</h3>
						</div>
					</div>
					{hasSelection && (
						<div className="mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-1.5 sm:gap-2">
							<div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-50 dark:bg-emerald-900/40 rounded-md border border-emerald-200 dark:border-emerald-800">
								<CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
								<span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
									{totalQuestions} асуулт
								</span>
							</div>
						</div>
					)}
					<div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-500 dark:text-emerald-400" />
					</div>
				</div>
			</button>
		);
	},
);
LessonCard.displayName = "LessonCard";

export const CategoryCard = memo(
	({
		category,
		categorySelectedCount,
		categoryTotalQuestions,
		onClick,
	}: {
		category: CategoryGroup;
		categorySelectedCount: number;
		categoryTotalQuestions: number;
		onClick: () => void;
	}) => {
		const hasSelection = categorySelectedCount > 0;

		return (
			<button
				type="button"
				onClick={onClick}
				className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors duration-200 text-left relative overflow-hidden w-full"
			>
				<div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
				<div className="relative flex flex-col h-full min-h-[140px] sm:min-h-40">
					<div className="flex-1">
						<div className="flex items-center justify-center mb-2 sm:mb-3 gap-2">
							<h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-1 leading-tight line-clamp-2">
								{category.ulesson_name}
							</h3>
							{hasSelection && (
								<div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-500 dark:bg-emerald-600 rounded-md sm:rounded-lg shrink-0">
									<span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
										Сонгосон
									</span>
								</div>
							)}
						</div>
						<div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
							<p className="flex items-center gap-1.5 sm:gap-2">
								<span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full shrink-0"></span>
								<span className="truncate">{category.coursename}</span>
							</p>
							<p className="font-semibold text-slate-700 dark:text-slate-300">
								{category.items.length} бүлэг тест
							</p>
						</div>
					</div>
					{hasSelection && (
						<div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-1.5 sm:gap-2">
							<div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-50 dark:bg-emerald-900/40 rounded-md border border-emerald-200 dark:border-emerald-800">
								<CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
								<span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
									{categoryTotalQuestions} асуулт
								</span>
							</div>
						</div>
					)}
					<div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						<ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-500 dark:text-emerald-400" />
					</div>
				</div>
			</button>
		);
	},
);
CategoryCard.displayName = "CategoryCard";

export const TestItemCard = memo(
	({
		item,
		selectedCount,
		onCountChange,
	}: {
		item: TestGroupItem;
		selectedCount: number;
		onCountChange: (id: number, count: number) => void;
	}) => {
		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				let val = parseInt(e.target.value, 10);
				if (Number.isNaN(val)) val = 0;
				val = Math.max(0, Math.min(item.cnt, val));
				onCountChange(item.id, val);
			},
			[item.cnt, item.id, onCountChange],
		);

		const handleDecrease = useCallback(() => {
			onCountChange(item.id, Math.max(0, selectedCount - 1));
		}, [item.id, selectedCount, onCountChange]);

		const handleIncrease = useCallback(() => {
			onCountChange(item.id, Math.min(item.cnt, selectedCount + 1));
		}, [item.id, item.cnt, selectedCount, onCountChange]);

		const handleRangeChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onCountChange(item.id, Number(e.target.value));
			},
			[item.id, onCountChange],
		);

		const isAtMin = selectedCount === 0;
		const isAtMax = selectedCount >= item.cnt;

		return (
			<div className="group relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700 transition-colors duration-200 w-full space-y-3 sm:space-y-4 flex flex-col justify-between">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<h1 className="text-xs sm:text-sm leading-tight font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 min-h-8 sm:min-h-9">
								{item.name}
							</h1>
						</TooltipTrigger>
						<TooltipContent>
							<p className="max-w-xs">{item.name}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<div className="flex justify-center">
					<div className="flex w-full items-stretch">
						<Button
							variant="outline"
							size="sm"
							onClick={handleDecrease}
							disabled={isAtMin}
							className="h-8 lg:h-9 w-8 lg:w-9 p-0 shrink-0 rounded-r-none border-r-0"
							aria-label="Decrease count"
						>
							<MinusIcon className="w-3 h-3 lg:w-4 lg:h-4" />
						</Button>

						<div className="flex-1 min-w-0 relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
							<input
								type="number"
								min="0"
								max={item.cnt}
								value={isAtMin ? "" : selectedCount}
								onChange={handleInputChange}
								placeholder="0"
								className="w-full h-full text-center bg-transparent outline-none border-none tabular-nums pr-8 text-slate-900 dark:text-slate-100"
								inputMode="numeric"
								pattern="[0-9]*"
								style={{
									fontSize: "13px",
									padding: "0 4px",
								}}
							/>
							<span
								className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400 whitespace-nowrap select-none"
								style={{ fontSize: "10px" }}
							>
								/{item.cnt}
							</span>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={handleIncrease}
							disabled={isAtMax}
							className="h-8 lg:h-9 w-8 lg:w-9 p-0 shrink-0 rounded-l-none border-l-0"
							aria-label="Increase count"
						>
							<PlusIcon className="w-3 h-3 lg:w-4 lg:h-4" />
						</Button>
					</div>
				</div>

				<div className="px-0.5 sm:px-1">
					<input
						type="range"
						min="0"
						max={item.cnt}
						value={selectedCount}
						onChange={handleRangeChange}
						className="w-full h-1.5 lg:h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500 dark:accent-emerald-400 bg-slate-200 dark:bg-slate-700"
						aria-label="Select count"
					/>
				</div>
			</div>
		);
	},
);
TestItemCard.displayName = "TestItemCard";

export const TestListItem = memo(
	({
		item,
		selectedCount,
		onCountChange,
	}: {
		item: TestGroupItem;
		selectedCount: number;
		onCountChange: (id: number, count: number) => void;
	}) => {
		const handleDecrease = useCallback(() => {
			onCountChange(item.id, Math.max(0, selectedCount - 1));
		}, [item.id, selectedCount, onCountChange]);

		const handleIncrease = useCallback(() => {
			onCountChange(item.id, Math.min(item.cnt, selectedCount + 1));
		}, [item.id, item.cnt, selectedCount, onCountChange]);

		return (
			<div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
				<div className="flex-1 w-full sm:w-auto text-center sm:text-left">
					<h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
						{item.name}
					</h4>
					<p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
						Нийт: {item.cnt} асуулт
					</p>
				</div>

				<div className="flex items-center gap-2 sm:gap-3">
					<Button
						size="sm"
						variant="outline"
						onClick={handleDecrease}
						className="rounded-lg h-7 w-7 sm:h-8 sm:w-8 p-0"
					>
						<Minus className="w-3 h-3 sm:w-4 sm:h-4" />
					</Button>

					<div className="w-10 sm:w-12 text-center font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
						{selectedCount}
					</div>

					<Button
						size="sm"
						onClick={handleIncrease}
						className="rounded-lg h-7 w-7 sm:h-8 sm:w-8 p-0"
					>
						<Plus className="w-3 h-3 sm:w-4 sm:h-4" />
					</Button>
				</div>
			</div>
		);
	},
);
TestListItem.displayName = "TestListItem";
