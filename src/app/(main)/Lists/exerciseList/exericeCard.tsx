import { ArrowRight, CheckCircle2, Minus, Plus } from "lucide-react";
import { memo, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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

// Сонгосон асуултын тоог харуулах ногоон чип
const SelectedChip = ({ count }: { count: number }) => (
	<span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
		<CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
		{count} асуулт сонгосон
	</span>
);

export const SkeletonCard = memo(() => (
	<div className="rounded-2xl border bg-card p-4 shadow-sm animate-pulse">
		<div className="mb-3 h-5 w-3/4 rounded bg-muted" />
		<div className="mb-2 h-4 w-1/2 rounded bg-muted" />
		<div className="h-4 w-1/3 rounded bg-muted" />
	</div>
));
SkeletonCard.displayName = "SkeletonCard";

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
				className={cn(
					"group flex h-full min-h-32 w-full cursor-pointer flex-col justify-between gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
					hasSelection && "border-primary ring-1 ring-primary",
				)}
				aria-label={`${lesson.lesson_name}${hasSelection ? `, ${totalQuestions} асуулт сонгосон` : ""}`}
			>
				<div className="space-y-2">
					<h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
						{lesson.lesson_name}
					</h3>
					{hasSelection && <SelectedChip count={totalQuestions} />}
				</div>
				<span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
					Сонгох
					<ArrowRight
						className="size-4 transition-transform group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</span>
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
				className={cn(
					"group flex h-full min-h-36 w-full cursor-pointer flex-col justify-between gap-3 rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/60 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-5",
					hasSelection && "border-primary ring-1 ring-primary",
				)}
				aria-label={`${category.ulesson_name}, ${category.items.length} бүлэг тест${hasSelection ? `, ${categoryTotalQuestions} асуулт сонгосон` : ""}`}
			>
				<div className="space-y-2">
					<h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground sm:text-lg">
						{category.ulesson_name}
					</h3>
					<p className="truncate text-sm text-muted-foreground">
						{category.coursename}
					</p>
					<div className="flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
							{category.items.length} бүлэг тест
						</span>
						{hasSelection && <SelectedChip count={categoryTotalQuestions} />}
					</div>
				</div>
				<span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
					Асуулт сонгох
					<ArrowRight
						className="size-4 transition-transform group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</span>
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
		const inputRef = useRef<HTMLInputElement>(null);

		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const inputValue = e.target.value;

				if (inputValue === "") {
					onCountChange(item.id, 0);
					return;
				}

				if (!/^\d+$/.test(inputValue)) {
					return;
				}

				const val = Math.max(0, Math.min(item.cnt, parseInt(inputValue, 10)));
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

		// Auto-focus optimization removed for better performance
		useEffect(() => {
			if (
				selectedCount > 0 &&
				inputRef.current &&
				document.activeElement !== inputRef.current
			) {
				// Only focus if not already focused to prevent scroll jumps
				inputRef.current.focus();
			}
		}, [selectedCount]);

		const isAtMin = selectedCount === 0;
		const isAtMax = selectedCount >= item.cnt;

		return (
			<div
				className={cn(
					"flex h-full w-full flex-col justify-between gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-colors sm:p-4",
					!isAtMin && "border-primary ring-1 ring-primary",
				)}
			>
				<div className="space-y-1">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<h4 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-foreground">
									{item.name}
								</h4>
							</TooltipTrigger>
							<TooltipContent>
								<p className="max-w-xs">{item.name}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<p className="text-xs text-muted-foreground">
						Нийт {item.cnt} асуулт
					</p>
				</div>

				<fieldset className="m-0 flex justify-center border-0 p-0">
					<legend className="sr-only">{item.name} асуултын тоо сонгох</legend>
					<div className="flex w-full items-stretch">
						<Button
							variant="outline"
							onClick={handleDecrease}
							disabled={isAtMin}
							className="size-10 shrink-0 rounded-r-none border-r-0 p-0"
							aria-label="Багасгах"
						>
							<Minus className="size-4" />
						</Button>

						<div className="relative min-w-0 flex-1 border bg-background">
							<input
								ref={inputRef}
								type="number"
								min="0"
								max={item.cnt}
								value={isAtMin ? "" : selectedCount}
								onChange={handleInputChange}
								placeholder="0"
								className="h-full w-full border-none bg-transparent px-1 pr-9 text-center text-sm font-semibold tabular-nums text-foreground outline-none"
								inputMode="numeric"
								pattern="[0-9]*"
								aria-label="Асуултын тоо"
							/>
							<span
								className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-xs text-muted-foreground"
								aria-hidden="true"
							>
								/{item.cnt}
							</span>
						</div>

						<Button
							variant="outline"
							onClick={handleIncrease}
							disabled={isAtMax}
							className="size-10 shrink-0 rounded-l-none border-l-0 p-0"
							aria-label="Нэмэгдүүлэх"
						>
							<Plus className="size-4" />
						</Button>
					</div>
				</fieldset>

				<div className="px-0.5">
					<input
						type="range"
						min="0"
						max={item.cnt}
						value={selectedCount}
						onChange={handleRangeChange}
						className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
						aria-label="Асуултын тоо сонгох"
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

		const isAtMin = selectedCount === 0;
		const isAtMax = selectedCount >= item.cnt;

		return (
			<div
				className={cn(
					"flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-colors sm:gap-4 sm:p-4",
					!isAtMin && "border-primary ring-1 ring-primary",
				)}
			>
				<div className="min-w-0 flex-1">
					<h4 className="line-clamp-2 text-sm font-semibold text-foreground sm:text-base">
						{item.name}
					</h4>
					<p className="text-xs text-muted-foreground">
						Нийт {item.cnt} асуулт
					</p>
				</div>

				<fieldset className="m-0 flex shrink-0 items-center gap-1.5 border-0 p-0 sm:gap-2">
					<legend className="sr-only">{item.name} асуултын тоо</legend>
					<Button
						variant="outline"
						onClick={handleDecrease}
						disabled={isAtMin}
						className="size-10 p-0"
						aria-label="Багасгах"
					>
						<Minus className="size-4" />
					</Button>

					<output
						className="w-9 text-center text-base font-bold tabular-nums text-foreground sm:w-12 sm:text-lg"
						aria-live="polite"
					>
						{selectedCount}
					</output>

					<Button
						variant="outline"
						onClick={handleIncrease}
						disabled={isAtMax}
						className="size-10 p-0"
						aria-label="Нэмэгдүүлэх"
					>
						<Plus className="size-4" />
					</Button>
				</fieldset>
			</div>
		);
	},
);
TestListItem.displayName = "TestListItem";
