"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";
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

function useDebouncedLocalStorage<T>(
	key: string,
	initialValue: T,
	delay = 500,
) {
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

	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				setStoredValue((prevValue) => {
					const valueToStore =
						value instanceof Function ? value(prevValue) : value;

					if (timeoutId) {
						clearTimeout(timeoutId);
					}

					const newTimeoutId = setTimeout(() => {
						if (typeof window !== "undefined") {
							try {
								window.localStorage.setItem(key, JSON.stringify(valueToStore));
							} catch (e) {
								console.error(`Error writing to localStorage: ${e}`);
							}
						}
					}, delay);

					setTimeoutId(newTimeoutId);
					return valueToStore;
				});
			} catch (error) {
				console.error(`Error updating state for key "${key}":`, error);
			}
		},
		[key, delay, timeoutId],
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
// HELPER FUNCTIONS
// ============================================

function calculateLessonStats(
	lessonGroups: LessonGroup[],
	lessonTestsMap: Map<number, TestGroupItem[]>,
	selectedTests: Record<number, number>,
): Map<number, LessonStats> {
	const stats = new Map<number, LessonStats>();

	const selectedTestsMap = new Map(
		Object.entries(selectedTests).map(([k, v]) => [Number(k), v]),
	);

	for (const lesson of lessonGroups) {
		const lessonTests = lessonTestsMap.get(lesson.lesson_id);
		if (!lessonTests) {
			stats.set(lesson.lesson_id, DEFAULT_STATS);
			continue;
		}

		let selectedCount = 0;
		let totalQuestions = 0;

		for (const test of lessonTests) {
			const count = selectedTestsMap.get(test.id);
			if (count !== undefined) {
				selectedCount++;
				totalQuestions += count;
			}
		}

		stats.set(lesson.lesson_id, { selectedCount, totalQuestions });
	}

	return stats;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function TestGroupPage() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isMounted, setIsMounted] = useState(false);

	const [selectedTests, setSelectedTests] = useDebouncedLocalStorage<
		Record<number, number>
	>("selectedTests", {});
	const [selectedLesson, setSelectedLesson] = useDebouncedLocalStorage<
		number | null
	>("selectedLesson", null);
	const [selectedCategory, setSelectedCategory] = useDebouncedLocalStorage<
		string | null
	>("selectedCategory", null);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Prevent hydration mismatch
	useEffect(() => {
		setIsMounted(true);
	}, []);

	const skeletonKeys = useMemo(
		() => Array.from({ length: SKELETON_COUNT }, (_, i) => `skeleton-${i}`),
		[],
	);

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
		staleTime: 5 * 60 * 1000,
	});

	const { data: allLessonsData } = useQuery<GetTestGroupResponse>({
		queryKey: ["allLessonsTests", userId],
		queryFn: () => getTestFiltered(userId || 0, 0),
		enabled: !!userId,
		retry: RETRY_CONFIG.attempts,
		retryDelay: RETRY_CONFIG.delay,
		staleTime: 5 * 60 * 1000,
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
		staleTime: 5 * 60 * 1000,
	});

	const handleTestMutation = useCallback(
		async (tests: { testcnt: number; rlesson_id: number }[]) => {
			for (let attempt = 0; attempt < RETRY_CONFIG.attempts; attempt++) {
				try {
					const mixedResponse = await getTestMixed(userId || 0, tests);

					if (!mixedResponse.RetResponse?.ResponseType) {
						if (attempt < RETRY_CONFIG.attempts - 1) {
							await new Promise((resolve) =>
								setTimeout(resolve, RETRY_CONFIG.delay * (attempt + 1)),
							);
							continue;
						}
						throw new Error("Failed to mix tests");
					}

					return await gettTestFill(userId || 0);
				} catch (error) {
					if (attempt === RETRY_CONFIG.attempts - 1) {
						throw error;
					}
					await new Promise((resolve) =>
						setTimeout(
							resolve,
							RETRY_CONFIG.delay * RETRY_CONFIG.backoffMultiplier ** attempt,
						),
					);
				}
			}
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
			} else {
				setErrorMessage("Тест эхлүүлэхэд алдаа гарлаа. Дахин оролдоно уу.");
			}
		},
		onError: (error) => {
			console.error("Mutation error:", error);
			setErrorMessage("Сүлжээний алдаа. Дахин оролдоно уу.");
		},
	});

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
		return calculateLessonStats(lessonGroups, lessonTestsMap, selectedTests);
	}, [lessonGroups, lessonTestsMap, selectedTests]);

	const totals = useMemo(() => {
		const entries = Object.values(selectedTests);
		const questionCount = entries.reduce((sum, count) => sum + count, 0);

		return {
			groupCount: entries.length,
			questionCount,
		};
	}, [selectedTests]);

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
		startTransition(() => {
			setSelectedLesson(null);
			setSelectedCategory(null);
		});
	}, [setSelectedLesson, setSelectedCategory]);

	const handleLessonClick = useCallback(
		(lessonId: number) => {
			startTransition(() => {
				setSelectedLesson(lessonId);
			});
		},
		[setSelectedLesson],
	);

	const handleCategoryClick = useCallback(
		(categoryKey: string) => {
			startTransition(() => {
				setSelectedCategory(categoryKey);
			});
		},
		[setSelectedCategory],
	);

	const handleStartTest = useCallback(() => {
		setErrorMessage(null);
		const payload = Object.entries(selectedTests).map(([id, count]) => ({
			testcnt: count,
			rlesson_id: Number(id),
		}));

		mutation.mutate(payload);
	}, [selectedTests, mutation]);

	const renderSkeletons = useMemo(
		() => (
			<output
				className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 3xl:grid-cols-10 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6"
				aria-label="Хичээлүүдийг ачааллаж байна"
			>
				{skeletonKeys.map((key) => (
					<SkeletonCard key={key} />
				))}
				<span className="sr-only">Хичээлүүдийг ачааллаж байна...</span>
			</output>
		),
		[skeletonKeys],
	);

	const renderLessonCards = useMemo(
		() => (
			<ul className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 3xl:grid-cols-11 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 list-none">
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
		),
		[lessonGroups, lessonStats, handleLessonClick],
	);

	const renderCategoryCards = useMemo(
		() => (
			<ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6 list-none">
				{[...groupedData.entries()].map(([key, category]) => (
					<li key={key}>
						<CategoryCard
							category={category}
							categorySelectedCount={
								category.items.filter((i) => selectedTests[i.id]).length
							}
							categoryTotalQuestions={category.items.reduce(
								(sum, i) => sum + (selectedTests[i.id] || 0),
								0,
							)}
							onClick={() => handleCategoryClick(key)}
						/>
					</li>
				))}
				{groupedData.size === 0 && <EmptyState />}
			</ul>
		),
		[groupedData, selectedTests, handleCategoryClick],
	);

	const renderTestItems = useCallback(() => {
		if (!selectedCategory) return null;

		const categoryItems = groupedData.get(selectedCategory);
		if (!categoryItems) return null;

		return (
			<div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50">
					<div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
						<h2
							className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200 truncate flex-1 min-w-0"
							id="category-title"
						>
							{categoryItems.ulesson_name}
						</h2>
					</div>

					<fieldset className="flex bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-md sm:rounded-lg gap-0.5 sm:gap-1 shrink-0 border-0">
						<legend className="sr-only">Харагдах төрөл сонгох</legend>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setViewMode("grid")}
							className={cn(
								"rounded-md px-2 sm:px-2.5 h-7 sm:h-8 transition-all",
								viewMode === "grid" && "bg-white dark:bg-slate-700 shadow-sm",
							)}
							aria-label="Торны харагдац"
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
							aria-label="Жагсаалтын харагдац"
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
					{categoryItems.items.map((item) => (
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
	}, [
		selectedCategory,
		groupedData,
		viewMode,
		selectedTests,
		handleTestChange,
	]);

	const isLoading = selectedLesson ? isLoadingDetails : isLoadingLessons;
	const error = selectedLesson ? detailsError : lessonError;

	if (!userId) {
		return (
			<output
				className="h-screen flex items-center justify-center"
				aria-label="Нэвтэрч байна"
			>
				<Loader2 className="w-8 h-8 animate-spin text-slate-400" />
				<span className="sr-only">Нэвтэрч байна...</span>
			</output>
		);
	}

	if (error) {
		return (
			<div className="h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-500 mb-4">Алдаа гарлаа</p>
					<Button onClick={() => window.location.reload()}>
						Дахин ачаалах
					</Button>
				</div>
			</div>
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
									aria-label="Хичээл рүү буцах"
									disabled={isPending}
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

					{errorMessage && (
						<div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<p className="text-sm text-red-600 dark:text-red-400">
								{errorMessage}
							</p>
						</div>
					)}
				</header>

				<main>
					{isLoading
						? renderSkeletons
						: !selectedLesson
							? renderLessonCards
							: !selectedCategory
								? renderCategoryCards
								: renderTestItems()}
				</main>
			</div>

			{isMounted && totals.questionCount > 0 && (
				<section
					className="fixed bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-auto max-w-2xl z-50 px-2 sm:px-0"
					aria-label="Тестийн хураангуй"
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
									? "Тест ачааллаж байна"
									: `${totals.questionCount} асуулттай тест эхлүүлэх`
							}
						>
							{mutation.isPending ? (
								<Loader2
									className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4"
									aria-hidden="true"
								/>
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
