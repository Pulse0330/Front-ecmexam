"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	getTestFilter,
	getTestFiltered,
	getTestMixed,
	gettTestFill,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	GetTestGroupResponse,
	TestGroupItem,
} from "@/types/exercise/testGroup";
import {
	CategoryCard,
	type CategoryGroup,
	EmptyState,
	LessonCard,
	SkeletonCard,
	TestItemCard,
	TestListItem,
} from "./exericeCard";

// ============================================
// CUSTOM HOOKS
// ============================================

function useLocalStorage<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === "undefined") return initialValue;
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				setStoredValue((prevValue) => {
					const valueToStore =
						value instanceof Function ? value(prevValue) : value;

					if (typeof window !== "undefined") {
						window.localStorage.setItem(key, JSON.stringify(valueToStore));
					}

					return valueToStore;
				});
			} catch (error) {
				console.error(`Error writing localStorage key "${key}":`, error);
			}
		},
		[key],
	);

	return [storedValue, setValue] as const;
}

// ============================================
// TYPES
// ============================================

interface LessonGroup {
	lesson_id: number;
	lesson_name: string;
	totalTests: number;
}

interface LessonStats {
	selectedCount: number;
	totalQuestions: number;
}

interface LessonDataItem {
	lesson_id: number;
	lesson_name: string;
}

interface LessonDataResponse {
	RetData: LessonDataItem[];
}

// ============================================
// CONSTANTS
// ============================================

const GRID_CLASSES =
	"grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-8 3xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6";

const LIST_CLASSES = "flex flex-col gap-2 sm:gap-2.5 md:gap-3";

const SKELETON_COUNT = 12;

const IS_DEV = process.env.NODE_ENV === "development";

const RETRY_CONFIG = {
	attempts: 3,
	delay: 1000,
	backoffMultiplier: 2,
	maxRetries: 2,
} as const;

const DEFAULT_STATS: LessonStats = {
	selectedCount: 0,
	totalQuestions: 0,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function TestGroupPage() {
	const { userId } = useAuthStore();
	const router = useRouter();

	// State management
	const [selectedTests, setSelectedTests] = useLocalStorage<
		Record<number, number>
	>("selectedTests", {});
	const [selectedLesson, setSelectedLesson] = useLocalStorage<number | null>(
		"selectedLesson",
		null,
	);
	const [selectedCategory, setSelectedCategory] = useLocalStorage<
		string | null
	>("selectedCategory", null);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [retryCount, setRetryCount] = useState(0);

	// Generate stable skeleton keys once
	const skeletonKeys = useMemo(
		() =>
			Array.from(
				{ length: SKELETON_COUNT },
				(_, i) => `skeleton-${i}-${crypto.randomUUID()}`,
			),
		[],
	);

	// Data fetching
	const {
		data: lessonData,
		isLoading: isLoadingLessons,
		error: lessonError,
	} = useQuery<LessonDataResponse>({
		queryKey: ["testGroupByLesson", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId && !selectedLesson,
		retry: RETRY_CONFIG.attempts,
		retryDelay: RETRY_CONFIG.delay,
	});

	const { data: allLessonsData } = useQuery<GetTestGroupResponse>({
		queryKey: ["allLessonsTests", userId],
		queryFn: () => getTestFiltered(userId || 0, 0),
		enabled: !!userId,
		retry: RETRY_CONFIG.attempts,
		retryDelay: RETRY_CONFIG.delay,
	});

	const {
		data,
		isLoading: isLoadingDetails,
		error: detailsError,
	} = useQuery<GetTestGroupResponse>({
		queryKey: ["testFiltered", userId, selectedLesson],
		queryFn: () => getTestFiltered(userId || 0, selectedLesson || 0),
		enabled: !!userId && !!selectedLesson,
		retry: RETRY_CONFIG.attempts,
		retryDelay: RETRY_CONFIG.delay,
	});

	// Mutations
	const handleTestMutation = useCallback(
		async (tests: { testcnt: number; rlesson_id: number }[]) => {
			if (IS_DEV) {
				console.log("Starting test mutation:", tests);
			}

			let lastError: Error | null = null;

			for (let attempt = 0; attempt < RETRY_CONFIG.attempts; attempt++) {
				try {
					const mixedResponse = await getTestMixed(userId || 0, tests);

					if (!mixedResponse.RetResponse?.ResponseType) {
						await new Promise((resolve) =>
							setTimeout(resolve, RETRY_CONFIG.delay * (attempt + 1)),
						);
						continue;
					}

					if (IS_DEV) {
						console.log("Mixed response success, fetching test fill");
					}

					return await gettTestFill(userId || 0);
				} catch (error) {
					lastError = error as Error;
					if (IS_DEV) {
						console.log(`Attempt ${attempt + 1} failed, retrying...`);
					}
					await new Promise((resolve) =>
						setTimeout(
							resolve,
							RETRY_CONFIG.delay * RETRY_CONFIG.backoffMultiplier ** attempt,
						),
					);
				}
			}

			throw lastError || new Error("Operation failed");
		},
		[userId],
	);

	const mutation = useMutation({
		mutationFn: handleTestMutation,
		onSuccess: (res) => {
			if (res?.RetResponse?.ResponseType) {
				localStorage.removeItem("selectedTests");
				localStorage.removeItem("selectedLesson");
				localStorage.removeItem("selectedCategory");
				router.push("/exercise");
			}
		},
		onError: () => {
			if (IS_DEV) {
				console.log("Mutation failed, silent retry active");
			}
		},
	});

	// Computed values
	const lessonGroups = useMemo(() => {
		if (!lessonData?.RetData) return [];

		return lessonData.RetData.reduce<LessonGroup[]>((acc, item) => {
			if (item.lesson_id !== 0) {
				acc.push({
					lesson_id: item.lesson_id,
					lesson_name: item.lesson_name,
					totalTests: 0,
				});
			}
			return acc;
		}, []);
	}, [lessonData]);

	const groupedData = useMemo(() => {
		if (!data?.RetData) return new Map<string, CategoryGroup>();

		const grouped = new Map<string, CategoryGroup>();
		for (const item of data.RetData) {
			const key = `${item.coursename}-${item.ulessonid}`;
			const existing = grouped.get(key);

			if (!existing) {
				grouped.set(key, {
					coursename: item.coursename,
					ulesson_name: item.ulesson_name,
					items: [item],
				});
			} else {
				existing.items.push(item);
			}
		}
		return grouped;
	}, [data]);

	const lessonTestsMap = useMemo(() => {
		if (!allLessonsData?.RetData) return new Map<number, TestGroupItem[]>();

		const map = new Map<number, TestGroupItem[]>();

		for (const item of allLessonsData.RetData) {
			const existing = map.get(item.ulessonid);
			if (!existing) {
				map.set(item.ulessonid, [item]);
			} else {
				existing.push(item);
			}
		}

		return map;
	}, [allLessonsData]);

	const lessonStats = useMemo(() => {
		const stats = new Map<number, LessonStats>();

		lessonGroups.forEach((lesson) => {
			const lessonTests = lessonTestsMap.get(lesson.lesson_id) || [];
			const lessonTestIds = lessonTests.map((t) => t.id);

			const lessonSelectedTests = Object.entries(selectedTests).filter(
				([testId]) => lessonTestIds.includes(Number(testId)),
			);

			stats.set(lesson.lesson_id, {
				selectedCount: lessonSelectedTests.length,
				totalQuestions: lessonSelectedTests.reduce(
					(sum, [, count]) => sum + (count as number),
					0,
				),
			});
		});

		return stats;
	}, [lessonGroups, lessonTestsMap, selectedTests]);

	const totals = useMemo(() => {
		const values = Object.values(selectedTests);
		const questionCount = values.reduce(
			(sum, count) => sum + (count as number),
			0,
		);

		return {
			groupCount: values.length,
			questionCount,
		};
	}, [selectedTests]);

	// Event handlers
	const handleTestChange = useCallback(
		(id: number, count: number) => {
			setSelectedTests((prev) => {
				if (count > 0) {
					return { ...prev, [id]: count };
				}
				const { [id]: _, ...rest } = prev;
				return rest;
			});
		},
		[setSelectedTests],
	);

	const handleBackToLessons = useCallback(() => {
		setSelectedLesson(null);
		setSelectedCategory(null);
	}, [setSelectedLesson, setSelectedCategory]);

	const handleLessonClick = useCallback(
		(lessonId: number) => {
			setSelectedLesson(lessonId);
		},
		[setSelectedLesson],
	);

	const handleCategoryClick = useCallback(
		(categoryKey: string) => {
			setSelectedCategory(categoryKey);
		},
		[setSelectedCategory],
	);

	const handleCategoryBack = useCallback(() => {
		setSelectedCategory(null);
	}, [setSelectedCategory]);

	const handleStartTest = useCallback(() => {
		setRetryCount(0);
		const payload = Object.entries(selectedTests).map(([id, count]) => ({
			testcnt: count as number,
			rlesson_id: Number(id),
		}));

		const attemptMutation = (currentPayload: typeof payload, attempt = 0) => {
			mutation.mutate(currentPayload, {
				onError: () => {
					if (attempt < RETRY_CONFIG.maxRetries) {
						setRetryCount(attempt + 1);
						setTimeout(
							() => {
								attemptMutation(currentPayload, attempt + 1);
							},
							RETRY_CONFIG.delay * (attempt + 1),
						);
					}
				},
			});
		};

		attemptMutation(payload);
	}, [selectedTests, mutation]);

	// Render helpers
	const renderSkeletons = () => (
		<output
			className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 3xl:grid-cols-10 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6"
			aria-label="Loading lessons"
		>
			{skeletonKeys.map((key) => (
				<SkeletonCard key={key} />
			))}
			<span className="sr-only">Хичээлүүдийг ачааллаж байна...</span>
		</output>
	);

	const renderLessonCards = () => (
		<ul className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 3xl:grid-cols-11 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 animate-in slide-in-from-bottom-4 duration-500 list-none">
			{lessonGroups.map((lesson) => {
				const stats = lessonStats.get(lesson.lesson_id) || DEFAULT_STATS;

				return (
					<li key={lesson.lesson_id}>
						<LessonCard
							lesson={lesson}
							selectedCount={stats.selectedCount}
							totalQuestions={stats.totalQuestions}
							onClick={() => handleLessonClick(lesson.lesson_id)}
						/>
					</li>
				);
			})}
			{lessonGroups.length === 0 && <EmptyState />}
		</ul>
	);

	const renderCategoryCards = () => (
		<ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-in slide-in-from-bottom-4 duration-500 list-none">
			{[...groupedData.entries()].map(([key, category]) => (
				<li key={key}>
					<CategoryCard
						category={category}
						categorySelectedCount={
							category.items.filter((i: TestGroupItem) => selectedTests[i.id])
								.length
						}
						categoryTotalQuestions={category.items.reduce(
							(sum: number, i: TestGroupItem) =>
								sum + ((selectedTests[i.id] as number) || 0),
							0,
						)}
						onClick={() => handleCategoryClick(key)}
					/>
				</li>
			))}
			{groupedData.size === 0 && <EmptyState />}
		</ul>
	);

	const renderTestItems = () => {
		if (!selectedCategory) return null;

		const categoryItems = groupedData.get(selectedCategory);
		if (!categoryItems) return null;

		return (
			<div className="space-y-3 sm:space-y-4 md:space-y-5 animate-in fade-in duration-300 relative z-10">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50">
					<div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
						<Button
							onClick={handleCategoryBack}
							variant="ghost"
							size="sm"
							className="flex items-center gap-1 sm:gap-1.5 text-slate-500 font-bold hover:text-emerald-500 transition-colors p-1.5 sm:p-2 shrink-0 min-w-9 sm:min-w-10"
							aria-label="Буцах"
						>
							<ArrowLeft
								className="w-3.5 h-3.5 sm:w-4 sm:h-4"
								aria-hidden="true"
							/>
							<span className="text-xs sm:text-sm xs:inline">Буцах</span>
						</Button>
						<div
							className="h-4 sm:h-5 md:h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 shrink-0"
							aria-hidden="true"
						/>
						<h2
							className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200 truncate flex-1 min-w-0"
							id="category-title"
						>
							{categoryItems.ulesson_name}
						</h2>
					</div>

					<fieldset className="flex bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-md sm:rounded-lg gap-0.5 sm:gap-1 shrink-0 border-0">
						<legend className="sr-only">View mode toggle</legend>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode("grid")}
							className={cn(
								"rounded-md px-2 sm:px-2.5 h-7 sm:h-8 transition-all",
								viewMode === "grid" && "bg-white dark:bg-slate-700 shadow-sm",
							)}
							aria-label="Grid view"
							aria-pressed={viewMode === "grid"}
						>
							<div
								className="grid grid-cols-2 gap-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5"
								aria-hidden="true"
							>
								<div className="bg-current rounded-sm opacity-60" />
								<div className="bg-current rounded-sm opacity-60" />
								<div className="bg-current rounded-sm opacity-60" />
								<div className="bg-current rounded-sm opacity-60" />
							</div>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode("list")}
							className={cn(
								"rounded-md px-2 sm:px-2.5 h-7 sm:h-8 transition-all",
								viewMode === "list" && "bg-white dark:bg-slate-700 shadow-sm",
							)}
							aria-label="List view"
							aria-pressed={viewMode === "list"}
						>
							<div
								className="flex flex-col gap-0.5 w-3 sm:w-3.5"
								aria-hidden="true"
							>
								<div className="h-0.5 sm:h-1 w-full bg-current rounded-full opacity-60" />
								<div className="h-0.5 sm:h-1 w-full bg-current rounded-full opacity-60" />
								<div className="h-0.5 sm:h-1 w-full bg-current rounded-full opacity-60" />
							</div>
						</Button>
					</fieldset>
				</div>

				<ul
					className={cn(
						viewMode === "grid" ? GRID_CLASSES : LIST_CLASSES,
						"list-none",
					)}
					aria-labelledby="category-title"
				>
					{categoryItems.items.map((item: TestGroupItem) => (
						<li key={item.id}>
							{viewMode === "grid" ? (
								<TestItemCard
									item={item}
									selectedCount={selectedTests[item.id] || 0}
									onCountChange={handleTestChange}
								/>
							) : (
								<TestListItem
									item={item}
									selectedCount={selectedTests[item.id] || 0}
									onCountChange={handleTestChange}
								/>
							)}
						</li>
					))}
				</ul>
			</div>
		);
	};

	const isLoading = selectedLesson ? isLoadingDetails : isLoadingLessons;
	const _error = selectedLesson ? detailsError : lessonError;

	if (!userId) {
		return (
			<output
				className="h-screen flex items-center justify-center"
				aria-label="Loading user authentication"
			>
				<Loader2 className="w-8 h-8 animate-spin text-slate-400" />
				<span className="sr-only">Нэвтэрч байна...</span>
			</output>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden pb-24 sm:pb-28 md:pb-32">
			<div className="container mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 pt-3 sm:pt-4 md:pt-6 lg:pt-8 relative z-10 max-w-[2000px] h-full overflow-y-auto">
				<header className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100/50 dark:border-slate-800/50 relative overflow-hidden">
					<div
						className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"
						aria-hidden="true"
					/>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 md:gap-6">
						<div className="flex items-center gap-2 sm:gap-3 md:gap-4">
							{selectedLesson && (
								<Button
									onClick={handleBackToLessons}
									variant="ghost"
									size="sm"
									className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-slate-500 font-bold hover:text-emerald-500 transition-colors p-1.5 sm:p-2 min-w-9 sm:min-w-10"
									aria-label="Back to lessons"
								>
									<ArrowLeft
										className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5"
										aria-hidden="true"
									/>
								</Button>
							)}

							<div>
								<h1 className="flex items-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-black">
									{selectedLesson ? "Тест сонгох" : "Хичээл сонгох"}
								</h1>
							</div>
						</div>
					</div>
				</header>

				<main>
					{isLoading
						? renderSkeletons()
						: !selectedLesson
							? renderLessonCards()
							: !selectedCategory
								? renderCategoryCards()
								: renderTestItems()}
				</main>
			</div>

			{totals.questionCount > 0 && (
				<section
					className="fixed bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-auto max-w-2xl z-50 px-2 sm:px-0"
					aria-label="Test summary and start button"
				>
					<output className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 shadow-2xl border-2 border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
						<div
							className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0"
							aria-live="polite"
						>
							<div className="flex items-center gap-1 sm:gap-1.5">
								<span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
									Асуулт:
								</span>
								<span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white">
									{totals.questionCount}
								</span>
							</div>
							<div
								className="w-px h-3 sm:h-3.5 md:h-4 bg-slate-200 dark:bg-slate-700"
								aria-hidden="true"
							/>
							<div className="flex items-center gap-1 sm:gap-1.5">
								<span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
									Бүлэг:
								</span>
								<span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white">
									{totals.groupCount}
								</span>
							</div>
						</div>
						<Button
							onClick={handleStartTest}
							disabled={mutation.isPending}
							size="sm"
							className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-full px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 font-semibold text-xs sm:text-sm md:text-base transition-all active:scale-95 shrink-0 min-w-[72px] sm:min-w-20 md:min-w-[100px]"
							aria-label={
								mutation.isPending
									? "Loading test"
									: `Start test with ${totals.questionCount} questions`
							}
						>
							{mutation.isPending ? (
								<div className="flex flex-col items-center gap-1">
									<Loader2
										className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4"
										aria-hidden="true"
									/>
									<span className="sr-only">Уншиж байна...</span>
									{retryCount > 0 && (
										<span
											className="text-[8px] sm:text-[9px] opacity-70"
											aria-live="polite"
										>
											Уншиж байна...
										</span>
									)}
								</div>
							) : (
								<div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 group cursor-pointer justify-center">
									<span>Эхлэх</span>
									<ArrowRight
										className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1"
										aria-hidden="true"
									/>
								</div>
							)}
						</Button>
					</output>
				</section>
			)}
		</div>
	);
}
