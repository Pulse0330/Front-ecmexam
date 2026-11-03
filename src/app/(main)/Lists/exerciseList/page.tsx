"use client";

import {
	type UseQueryResult,
	useMutation,
	useQueries,
	useQuery,
} from "@tanstack/react-query";
import {
	ArrowRight,
	ChevronUp,
	Inbox,
	LayoutGrid,
	List,
	Loader2,
	PencilLine,
	Trash2,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";
import { PageHeader } from "@/components/page/pageHeader";
import { EmptyState, LoadingState } from "@/components/page/pageStates";
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

// Сонгосон тестийн нэр — сонгох үед хадгална (өөр хичээлийн өгөгдөл ачаалагдаагүй
// үед ч доод мөрөнд "Тест #id" биш нэрээр нь харуулахын тулд)
type SelectedTestMeta = Record<
	number,
	{ name: string; ulesson_name: string; coursename: string }
>;

// useQueries-ийн combine — module түвшинд тул React Query үр дүнг memoize хийнэ
// (inline бол render бүрт шинэ массив үүсч картууд дахин зурагдана)
const combineLessonTests = (
	results: UseQueryResult<GetTestGroupResponse>[],
) => ({
	items: results.flatMap((r) => r.data?.RetData ?? []),
	isFetching: results.some((r) => r.isFetching),
});

const toMeta = (item: TestGroupItem) => ({
	name: item.name,
	ulesson_name: item.ulesson_name,
	coursename: item.coursename,
});

// ============================================
// CONSTANTS
// ============================================

const GRID_CLASSES =
	"grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3";

const LIST_CLASSES = "flex flex-col gap-2 sm:gap-3";

// Хичээлийн картуудын нэгдсэн тор
const CARD_GRID_CLASSES =
	"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 list-none";

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
	const [_isPending, _startTransition] = useTransition();
	const [isMounted, setIsMounted] = useState(false);

	// FIX: Зөв destructuring хэлбэр
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

	const { data: lessonData, isLoading: isLoadingLessons } =
		useQuery<LessonDataResponse>({
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
		retry: false,
	});

	const { data, isLoading: isLoadingDetails } = useQuery<GetTestGroupResponse>({
		queryKey: ["testFiltered", userId, selectedLesson],
		queryFn: () => getTestFiltered(userId || 0, selectedLesson || 0),
		enabled: !!userId && !!selectedLesson,
		retry: false,
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
				localStorage.removeItem("selectedTestsMeta");
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

	// FIX: Type-safe totals
	const totals = useMemo(() => {
		const entries = Object.values(selectedTests);
		const questionCount = entries.reduce(
			(sum: number, count: number) => sum + count,
			0,
		);

		return {
			groupCount: entries.length,
			questionCount,
		};
	}, [selectedTests]);

	// Сонгосон тестүүдийн нэр — доод мөрөөс шууд харж, хасах боломжтой
	// (өмнө нь болиулахын тулд тухайн хичээл/сэдэв рүү буцаж очих шаардлагатай байсан)
	const [selectedMeta, setSelectedMeta] =
		useDebouncedLocalStorage<SelectedTestMeta>("selectedTestsMeta", {});

	// Нэр нь мэдэгдэхгүй сонголт байвал хичээл бүрийн тестийг ачаалж нэрийг олно.
	// queryKey нь хичээл нээх үеийнхтэй ижил тул cache хуваалцана (давхар хүсэлтгүй).
	const hasUnnamed = useMemo(
		() => Object.keys(selectedTests).some((id) => !selectedMeta[Number(id)]),
		[selectedTests, selectedMeta],
	);
	const lessonTests = useQueries({
		queries: lessonGroups.map((lesson) => ({
			queryKey: ["testFiltered", userId, lesson.lesson_id],
			queryFn: () => getTestFiltered(userId || 0, lesson.lesson_id),
			enabled: !!userId && hasUnnamed,
			retry: false,
			staleTime: 5 * 60 * 1000,
		})),
		combine: combineLessonTests,
	});

	// Ачаалагдсан тестүүд (бүх хичээл + хичээл тус бүр + одоогийн хичээл) — ID-аар
	const loadedTestsById = useMemo(() => {
		const byId = new Map<number, TestGroupItem>();
		for (const item of allLessonsData?.RetData ?? []) byId.set(item.id, item);
		for (const item of lessonTests.items) byId.set(item.id, item);
		for (const item of data?.RetData ?? []) byId.set(item.id, item);
		return byId;
	}, [allLessonsData, lessonTests.items, data]);

	// Өмнө нь нэргүй хадгалагдсан сонголтуудын нэрийг өгөгдөл ачаалагдахад нөхнө
	useEffect(() => {
		const missing = Object.keys(selectedTests)
			.map(Number)
			.filter((id) => !selectedMeta[id] && loadedTestsById.has(id));
		if (missing.length === 0) return;
		setSelectedMeta((prev) => {
			const next = { ...prev };
			for (const id of missing) {
				const item = loadedTestsById.get(id);
				if (item) next[id] = toMeta(item);
			}
			return next;
		});
	}, [selectedTests, selectedMeta, loadedTestsById, setSelectedMeta]);

	const selectedList = useMemo(
		() =>
			Object.entries(selectedTests).map(([id, count]) => {
				const loaded = loadedTestsById.get(Number(id));
				return {
					id: Number(id),
					count,
					item: loaded ? toMeta(loaded) : selectedMeta[Number(id)],
				};
			}),
		[selectedTests, loadedTestsById, selectedMeta],
	);

	const [showSelected, setShowSelected] = useState(false);
	const [confirmClear, setConfirmClear] = useState(false);

	const handleClearAll = useCallback(() => {
		setSelectedTests({});
		setSelectedMeta({});
		setConfirmClear(false);
		setShowSelected(false);
	}, [setSelectedTests, setSelectedMeta]);

	const handleTestChange = useCallback(
		(id: number, count: number) => {
			setSelectedTests((prev: Record<number, number>) => {
				if (count > 0) {
					return { ...prev, [id]: count };
				}
				const { [id]: _, ...rest } = prev;
				return rest;
			});
			// Нэрийг хамт хадгалах / хасах
			setSelectedMeta((prev) => {
				if (count > 0) {
					const item = loadedTestsById.get(id);
					return item && !prev[id] ? { ...prev, [id]: toMeta(item) } : prev;
				}
				if (!prev[id]) return prev;
				const { [id]: _, ...rest } = prev;
				return rest;
			});
		},
		[setSelectedTests, setSelectedMeta, loadedTestsById],
	);

	const handleBackToLessons = useCallback(() => {
		if (selectedCategory) {
			if (typeof window !== "undefined") {
				window.localStorage.removeItem("selectedCategory");
			}
			setSelectedCategory(null);
		} else if (selectedLesson) {
			if (typeof window !== "undefined") {
				window.localStorage.removeItem("selectedLesson");
			}
			setSelectedLesson(null);
		}
	}, [
		selectedCategory,
		selectedLesson,
		setSelectedCategory,
		setSelectedLesson,
	]);

	const handleLessonClick = useCallback(
		(lessonId: number) => {
			if (typeof window !== "undefined") {
				window.localStorage.setItem("selectedLesson", JSON.stringify(lessonId));
			}
			setSelectedLesson(lessonId);
		},
		[setSelectedLesson],
	);

	const handleCategoryClick = useCallback(
		(categoryKey: string) => {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(
					"selectedCategory",
					JSON.stringify(categoryKey),
				);
			}
			setSelectedCategory(categoryKey);
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
			<output className={CARD_GRID_CLASSES} aria-label="Ачааллаж байна">
				{skeletonKeys.map((key) => (
					<SkeletonCard key={key} />
				))}
				<span className="sr-only">Ачааллаж байна...</span>
			</output>
		),
		[skeletonKeys],
	);

	const renderLessonCards = useMemo(
		() =>
			lessonGroups.length === 0 ? (
				<EmptyState
					icon={Inbox}
					title="Хичээл олдсонгүй"
					description="Одоогоор дасгал ажиллах хичээл алга байна."
				/>
			) : (
				<ul className={CARD_GRID_CLASSES}>
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
				</ul>
			),
		[lessonGroups, lessonStats, handleLessonClick],
	);

	const renderCategoryCards = useMemo(
		() =>
			groupedData.size === 0 ? (
				<EmptyState
					icon={Inbox}
					title="Бүлэг сэдэв олдсонгүй"
					description="Энэ хичээлд одоогоор дасгал алга. Өөр хичээл сонгоно уу."
				/>
			) : (
				<ul className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 list-none">
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
				</ul>
			),
		[groupedData, selectedTests, handleCategoryClick],
	);

	const renderTestItems = useCallback(() => {
		if (!selectedCategory) return null;

		const categoryItems = groupedData.get(selectedCategory);
		if (!categoryItems) return null;

		return (
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
		);
	}, [
		selectedCategory,
		groupedData,
		viewMode,
		selectedTests,
		handleTestChange,
	]);

	const isLoading = selectedLesson ? isLoadingDetails : isLoadingLessons;

	if (!userId) {
		return <LoadingState className="h-screen" label="Нэвтэрч байна..." />;
	}

	// Алхам бүрийн гарчиг, тайлбар — хэрэглэгч хаана байгаагаа ойлгоно
	const currentCategory = selectedCategory
		? groupedData.get(selectedCategory)
		: undefined;
	const headerTitle = !selectedLesson
		? "Хичээл сонгох"
		: !selectedCategory
			? "Бүлэг сэдэв сонгох"
			: currentCategory?.ulesson_name || "Асуулт сонгох";
	const headerDescription = !selectedLesson
		? "1-р алхам: Дасгал ажиллах хичээлээ сонгоно уу."
		: !selectedCategory
			? "2-р алхам: Дасгал ажиллах бүлэг сэдвээ сонгоно уу."
			: "3-р алхам: Тест бүрээс хэдэн асуулт ажиллахаа сонгоод «Дасгал эхлүүлэх» дарна уу.";

	// 3-р алхамд (асуулт сонгох) "Дасгал эхлүүлэх" товч үргэлж харагдана —
	// сонгоогүй үед идэвхгүй байж, юу хийхийг зааж өгнө (өмнө нь огт харагддаггүй байсан)
	const hasSelection = totals.questionCount > 0;
	const showSummary = isMounted && (hasSelection || !!selectedCategory);

	return (
		<div className="h-full">
			<div
				className={cn(
					"mx-auto flex w-full flex-col gap-2 px-4 pb-6 lg:px-6",
					showSummary && "pb-32",
				)}
			>
				<PageHeader
					title={headerTitle}
					description={headerDescription}
					icon={PencilLine}
					back={selectedLesson ? handleBackToLessons : undefined}
					actions={
						selectedCategory && (
							// Харагдах төрөл: тор / жагсаалт
							<fieldset className="flex shrink-0 gap-1 rounded-lg border-0 bg-muted p-1">
								<legend className="sr-only">Харагдах төрөл сонгох</legend>
								<Button
									variant="ghost"
									onClick={() => setViewMode("grid")}
									className={cn(
										"h-10 gap-1.5 px-3 text-sm",
										viewMode === "grid" &&
											"bg-background text-foreground shadow-sm",
									)}
									aria-pressed={viewMode === "grid"}
								>
									<LayoutGrid className="size-4" aria-hidden="true" />
									Тор
								</Button>
								<Button
									variant="ghost"
									onClick={() => setViewMode("list")}
									className={cn(
										"h-10 gap-1.5 px-3 text-sm",
										viewMode === "list" &&
											"bg-background text-foreground shadow-sm",
									)}
									aria-pressed={viewMode === "list"}
								>
									<List className="size-4" aria-hidden="true" />
									Жагсаалт
								</Button>
							</fieldset>
						)
					}
				/>

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

			{showSummary && (
				<section
					className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-primary/40 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.25)]"
					aria-label="Сонгосон асуултын хураангуй"
				>
					<div className="mx-auto flex max-w-3xl flex-col gap-2">
						{errorMessage && (
							<p
								role="alert"
								className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300"
							>
								{errorMessage}
							</p>
						)}

						{/* Сонгосон тестүүд — нэг бүрчлэн хасах / бүгдийг цэвэрлэх */}
						{hasSelection && showSelected && (
							<div className="rounded-xl border bg-card">
								<div className="flex items-center justify-between gap-2 border-b px-3 py-2">
									<p className="text-sm font-semibold">Сонгосон тестүүд</p>
									{confirmClear ? (
										<div className="flex items-center gap-1.5">
											<span className="hidden text-xs text-muted-foreground sm:inline">
												Бүгдийг хасах уу?
											</span>
											<Button
												variant="outline"
												size="sm"
												className="h-9"
												onClick={() => setConfirmClear(false)}
											>
												Болих
											</Button>
											<Button
												size="sm"
												className="h-9 bg-red-600 text-white hover:bg-red-700"
												onClick={handleClearAll}
											>
												Тийм, цэвэрлэх
											</Button>
										</div>
									) : (
										<Button
											variant="ghost"
											size="sm"
											className="h-9 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
											onClick={() => setConfirmClear(true)}
										>
											<Trash2 className="size-4" aria-hidden="true" />
											Бүгдийг цэвэрлэх
										</Button>
									)}
								</div>
								<ul className="max-h-[40vh] divide-y overflow-y-auto">
									{selectedList.map(({ id, count, item }) => (
										<li
											key={id}
											className="flex items-center justify-between gap-3 px-3 py-2"
										>
											<div className="min-w-0">
												<p className="truncate text-sm font-medium">
													{/* Хэрэглэгчид ID хэрэггүй — нэр, эсвэл ачаалж буйг харуулна */}
													{item?.name ??
														(lessonTests.isFetching
															? "Нэр ачаалж байна…"
															: "Сонгосон тест")}
												</p>
												{item && (
													<p className="truncate text-xs text-muted-foreground">
														{item.coursename} · {item.ulesson_name}
													</p>
												)}
											</div>
											<div className="flex shrink-0 items-center gap-2">
												<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
													{count} асуулт
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="size-9 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
													onClick={() => handleTestChange(id, 0)}
													aria-label={`${item?.name ?? "Тест"} хасах`}
													title="Хасах"
												>
													<X className="size-4" />
												</Button>
											</div>
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="flex items-center justify-between gap-3">
							<output
								className="flex min-w-0 flex-col text-sm"
								aria-live="polite"
							>
								{hasSelection ? (
									<>
										<span className="font-semibold text-foreground">
											{totals.questionCount} асуулт сонгосон
										</span>
										{/* Сонголтоо харах / засах */}
										<button
											type="button"
											onClick={() => {
												setShowSelected((v) => !v);
												setConfirmClear(false);
											}}
											className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary hover:underline"
											aria-expanded={showSelected}
										>
											{totals.groupCount} бүлэг тест ·{" "}
											{showSelected ? "Нуух" : "Харах / хасах"}
											<ChevronUp
												className={cn(
													"size-3.5 transition-transform",
													!showSelected && "rotate-180",
												)}
												aria-hidden="true"
											/>
										</button>
									</>
								) : (
									<>
										<span className="font-semibold text-foreground">
											Асуулт сонгоогүй байна
										</span>
										<span className="text-xs text-muted-foreground">
											Доорх тестүүдээс «+» товчоор асуултын тоогоо сонгоно уу
										</span>
									</>
								)}
							</output>
							<Button
								onClick={handleStartTest}
								disabled={mutation.isPending || !hasSelection}
								className="h-11 shrink-0 gap-2 px-5 text-base font-semibold"
								aria-label={
									mutation.isPending
										? "Дасгал ачааллаж байна"
										: `${totals.questionCount} асуулттай дасгал эхлүүлэх`
								}
							>
								{mutation.isPending ? (
									<>
										<Loader2
											className="size-4 animate-spin"
											aria-hidden="true"
										/>
										Түр хүлээнэ үү...
									</>
								) : (
									<>
										Дасгал эхлүүлэх
										<ArrowRight className="size-4" aria-hidden="true" />
									</>
								)}
							</Button>
						</div>
					</div>
				</section>
			)}
		</div>
	);
}
