"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useState,
} from "react";
import AnimatedBackground from "@/components/animated-bg";
import { Button } from "@/components/ui/button";
import {
	getTestFilter,
	getTestFiltered,
	getTestMixed,
	gettTestFill,
} from "@/lib/api";
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

// --- Types ---
interface CourseFilterItem {
	lesson_id: number;
	lesson_name: string;
	sort: number;
}

// --- Main Page ---

export default function TestGroupPage() {
	const { userId } = useAuthStore();
	const router = useRouter();

	// localStorage-оос сонгосон тестүүдийг уншиж эхлүүлэх
	const [selectedTests, setSelectedTests] = useState<Record<number, number>>(
		() => {
			if (typeof window !== "undefined") {
				const saved = localStorage.getItem("selectedTests");
				return saved ? JSON.parse(saved) : {};
			}
			return {};
		},
	);

	const [searchQuery, setSearchQuery] = useState("");
	const deferredSearch = useDeferredValue(searchQuery);

	// localStorage-оос сонгосон хичээлийг уншиж эхлүүлэх
	const [selectedLesson, setSelectedLesson] = useState<number | null>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("selectedLesson");
			return saved ? JSON.parse(saved) : null;
		}
		return null;
	});

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	// localStorage-оос сонгосон категорийг уншиж эхлүүлэх
	const [selectedCategory, setSelectedCategory] = useState<string | null>(
		() => {
			if (typeof window !== "undefined") {
				const saved = localStorage.getItem("selectedCategory");
				return saved ? JSON.parse(saved) : null;
			}
			return null;
		},
	);

	const { data: lessonData, isLoading: isLoadingLessons } = useQuery({
		queryKey: ["testGroupByLesson", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId && !selectedLesson,
	});

	// БҮХ хичээлүүдийн тестүүдийг урьдчилан татах
	const { data: allLessonsData } = useQuery<GetTestGroupResponse>({
		queryKey: ["allLessonsTests", userId],
		queryFn: async () => {
			return getTestFiltered(userId || 0, 0);
		},
		enabled: !!userId,
	});

	const { data, isLoading: isLoadingDetails } = useQuery<GetTestGroupResponse>({
		queryKey: ["testFiltered", userId, selectedLesson],
		queryFn: () => getTestFiltered(userId || 0, selectedLesson || 0),
		enabled: !!userId && !!selectedLesson,
	});

	// selectedLesson өөрчлөгдөхөд localStorage-д хадгалах
	useEffect(() => {
		if (selectedLesson !== null) {
			localStorage.setItem("selectedLesson", JSON.stringify(selectedLesson));
		}
	}, [selectedLesson]);

	// selectedCategory өөрчлөгдөхөд localStorage-д хадгалах
	useEffect(() => {
		if (selectedCategory !== null) {
			localStorage.setItem(
				"selectedCategory",
				JSON.stringify(selectedCategory),
			);
		}
	}, [selectedCategory]);

	const mutation = useMutation({
		mutationFn: async (tests: { testcnt: number; rlesson_id: number }[]) => {
			console.log("🚀 1️⃣ /testsavedmixed дуудаж байна...");
			console.log("📦 Payload:", tests);

			const mixedResponse = await getTestMixed(userId || 0, tests);
			console.log("✅ Холих амжилттай:", mixedResponse);

			if (mixedResponse.RetResponse?.ResponseType) {
				console.log("🚀 2️⃣ /gettestfill дуудаж байна...");
				const fillResponse = await gettTestFill(userId || 0);
				console.log("✅ Тест татах амжилттай:", fillResponse);
				return fillResponse;
			}

			return mixedResponse;
		},
		onSuccess: (res) => {
			console.log("✅ Бүх үйл явц амжилттай!");
			console.log("📥 Final Response:", res);

			if (res.RetResponse?.ResponseType) {
				console.log("✈️ /exercise руу шилжиж байна...");
				localStorage.removeItem("selectedTests");
				localStorage.removeItem("selectedLesson");
				localStorage.removeItem("selectedCategory");
				router.push("/exercise");
			} else {
				console.log("❌ Алдаа:", res.RetResponse?.ResponseMessage);
				alert(res.RetResponse?.ResponseMessage || "Алдаа гарлаа");
			}
		},
		onError: (error) => {
			console.error("💥 API алдаа:", error);
			alert("Алдаа гарлаа. Дахин оролдоно уу.");
		},
	});

	const lessonGroups = useMemo(() => {
		if (!lessonData?.RetData) return [];
		const query = deferredSearch.toLowerCase();

		return lessonData.RetData.filter(
			(item: CourseFilterItem) =>
				item.lesson_id !== 0 && item.lesson_name.toLowerCase().includes(query),
		).map((item: CourseFilterItem) => ({
			lesson_id: item.lesson_id,
			lesson_name: item.lesson_name,
			totalTests: 0,
		}));
	}, [lessonData, deferredSearch]);

	const groupedData = useMemo(() => {
		if (!data?.RetData) return new Map<string, CategoryGroup>();
		const query = deferredSearch.toLowerCase();

		const filtered = data.RetData.filter(
			(i: TestGroupItem) =>
				i.name.toLowerCase().includes(query) ||
				i.coursename.toLowerCase().includes(query) ||
				i.ulesson_name.toLowerCase().includes(query),
		);

		const grouped = new Map<string, CategoryGroup>();
		filtered.forEach((item: TestGroupItem) => {
			const key = `${item.coursename}-${item.ulessonid}`;
			if (!grouped.has(key)) {
				grouped.set(key, {
					coursename: item.coursename,
					ulesson_name: item.ulesson_name,
					items: [],
				});
			}
			grouped.get(key)?.items.push(item);
		});
		return grouped;
	}, [data, deferredSearch]);

	const totals = useMemo(() => {
		const selectedKeys = Object.keys(selectedTests);
		return {
			groupCount: selectedKeys.length,
			questionCount: Object.values(selectedTests).reduce((a, b) => a + b, 0),
		};
	}, [selectedTests]);

	const handleTestChange = useCallback((id: number, count: number) => {
		console.log(`📝 Тест өөрчлөгдөж байна: ID=${id}, Count=${count}`);

		setSelectedTests((prev) => {
			const next = { ...prev };
			if (count > 0) {
				next[id] = count;
			} else {
				delete next[id];
			}
			console.log("📊 Сонгосон тестүүд:", next);
			localStorage.setItem("selectedTests", JSON.stringify(next));
			return next;
		});
	}, []);

	const handleBackToLessons = () => {
		setSelectedLesson(null);
		setSelectedCategory(null);
		localStorage.removeItem("selectedLesson");
		localStorage.removeItem("selectedCategory");
	};

	const handleStartTest = () => {
		console.log("🎯 ЭХЛЭХ товч дарагдлаа!");
		console.log("👤 User ID:", userId);
		console.log("📊 Сонгосон тестүүд:", selectedTests);

		const payload = Object.entries(selectedTests).map(([id, count]) => {
			const testId = Number(id);
			return {
				testcnt: count,
				rlesson_id: testId,
			};
		});

		console.log("📦 Бэлдсэн payload:", payload);
		console.log("📈 Нийт асуулт:", totals.questionCount);
		console.log("📚 Нийт бүлэг:", totals.groupCount);

		mutation.mutate(payload);
	};

	if (!userId)
		return (
			<div className="h-screen flex items-center justify-center font-bold text-slate-400">
				Нэвтэрнэ үү...
			</div>
		);

	const isLoading = selectedLesson ? isLoadingDetails : isLoadingLessons;

	return (
		<div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden pb-24 sm:pb-28 md:pb-32">
			<AnimatedBackground />

			<div className="container mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 pt-3 sm:pt-4 md:pt-6 lg:pt-8 relative z-10 max-w-[2000px]">
				{/* Header Section - Optimized для всех экранов */}
				<div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100/50 dark:border-slate-800/50 relative overflow-hidden">
					<div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 md:gap-6">
						<div className="flex items-center gap-2 sm:gap-3 md:gap-4">
							{selectedLesson && (
								<Button
									onClick={handleBackToLessons}
									variant="ghost"
									size="sm"
									className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-slate-500 font-bold hover:text-emerald-500 transition-colors p-1.5 sm:p-2 min-w-9 sm:min-w-10"
								>
									<ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
								</Button>
							)}

							<div>
								<h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
									{selectedLesson ? "Тест сонгох" : "Хичээл сонгох"}
								</h1>
							</div>
						</div>

						<div className="relative w-full sm:w-56 md:w-64 lg:w-72 xl:w-80">
							<Search className="absolute left-2.5 sm:left-3 md:left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 pointer-events-none" />
							<input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={selectedLesson ? "Тест хайх..." : "Хичээл хайх..."}
								className="w-full pl-8 sm:pl-9 md:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-none rounded-lg sm:rounded-xl md:rounded-2xl text-xs sm:text-sm md:text-base focus:ring-2 ring-emerald-500 transition-all placeholder:text-slate-400"
							/>
						</div>
					</div>
				</div>

				{/* Content Section - Максимально оптимизированные сетки */}
				{isLoading ? (
					<div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 3xl:grid-cols-10 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
							<SkeletonCard key={i} />
						))}
					</div>
				) : !selectedLesson ? (
					// Lesson Cards - Идеальная сетка для всех экранов
					<div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 3xl:grid-cols-11 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 animate-in slide-in-from-bottom-4 duration-500">
						{lessonGroups.map((lesson) => {
							const lessonTests =
								allLessonsData?.RetData?.filter(
									(item: TestGroupItem) => item.ulessonid === lesson.lesson_id,
								) || [];

							const lessonTestIds = lessonTests.map((t: TestGroupItem) => t.id);

							const lessonSelectedTests = Object.entries(selectedTests).filter(
								([testId]) => lessonTestIds.includes(Number(testId)),
							);

							const selectedCount = lessonSelectedTests.length;
							const totalQuestions = lessonSelectedTests.reduce(
								(sum, [, count]) => sum + count,
								0,
							);

							return (
								<LessonCard
									key={lesson.lesson_id}
									lesson={lesson}
									selectedCount={selectedCount}
									totalQuestions={totalQuestions}
									onClick={() => setSelectedLesson(lesson.lesson_id)}
								/>
							);
						})}
						{lessonGroups.length === 0 && (
							<EmptyState searchQuery={searchQuery} />
						)}
					</div>
				) : !selectedCategory ? (
					// Category Cards - Оптимизированная сетка
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-in slide-in-from-bottom-4 duration-500">
						{[...groupedData.entries()].map(([key, category]) => (
							<CategoryCard
								key={key}
								category={category}
								categorySelectedCount={
									category.items.filter(
										(i: TestGroupItem) => selectedTests[i.id],
									).length
								}
								categoryTotalQuestions={category.items.reduce(
									(sum: number, i: TestGroupItem) =>
										sum + (selectedTests[i.id] || 0),
									0,
								)}
								onClick={() => setSelectedCategory(key)}
							/>
						))}
						{groupedData.size === 0 && <EmptyState searchQuery={searchQuery} />}
					</div>
				) : (
					// Test Items - Оптимизированный вид
					<div className="space-y-3 sm:space-y-4 md:space-y-5 animate-in fade-in duration-300 relative z-10">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50">
							<div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
								<Button
									onClick={() => setSelectedCategory(null)}
									variant="ghost"
									size="sm"
									className="flex items-center gap-1 sm:gap-1.5 text-slate-500 font-bold hover:text-emerald-500 transition-colors p-1.5 sm:p-2 shrink-0 min-w-9 sm:min-w-10"
								>
									<ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
									<span className="text-xs sm:text-sm  xs:inline">Буцах</span>
								</Button>
								<div className="h-4 sm:h-5 md:h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1 shrink-0" />
								<h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200 truncate flex-1 min-w-0">
									{groupedData.get(selectedCategory)?.ulesson_name}
								</h2>
							</div>

							{/* View Mode Toggle - Компактный */}
							<div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-md sm:rounded-lg gap-0.5 sm:gap-1 shrink-0">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setViewMode("grid")}
									className={`rounded-md px-2 sm:px-2.5 h-7 sm:h-8 transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}`}
								>
									<div className="grid grid-cols-2 gap-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5">
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
									className={`rounded-md px-2 sm:px-2.5 h-7 sm:h-8 transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm" : ""}`}
								>
									<div className="flex flex-col gap-0.5 w-3 sm:w-3.5">
										<div className="h-0.5 sm:h-1 w-full bg-current rounded-full opacity-60" />
										<div className="h-0.5 sm:h-1 w-full bg-current rounded-full opacity-60" />
										<div className="h-0.5 sm:h-1 w-full bg-current rounded-full opacity-60" />
									</div>
								</Button>
							</div>
						</div>

						{/* Test Items Grid/List - Максимально адаптивная сетка */}
						<div
							className={
								viewMode === "grid"
									? "grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 3xl:grid-cols-10 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6"
									: "flex flex-col gap-2 sm:gap-2.5 md:gap-3"
							}
						>
							{groupedData
								.get(selectedCategory)
								?.items.map((item: TestGroupItem) =>
									viewMode === "grid" ? (
										<TestItemCard
											key={item.id}
											item={item}
											selectedCount={selectedTests[item.id] || 0}
											onCountChange={handleTestChange}
										/>
									) : (
										<TestListItem
											key={item.id}
											item={item}
											selectedCount={selectedTests[item.id] || 0}
											onCountChange={handleTestChange}
										/>
									),
								)}
						</div>
					</div>
				)}
			</div>

			{/* Floating Action Button - Идеально для всех экранов */}
			{totals.questionCount > 0 && (
				<div className="fixed bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-16px)] sm:w-[calc(100%-32px)] md:w-auto max-w-2xl z-50 px-2 sm:px-0">
					<div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 shadow-2xl border-2 border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
						<div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
							<div className="flex items-center gap-1 sm:gap-1.5">
								<span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
									Асуулт:
								</span>
								<span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white">
									{totals.questionCount}
								</span>
							</div>
							<div className="w-px h-3 sm:h-3.5 md:h-4 bg-slate-200 dark:bg-slate-700" />
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
						>
							{mutation.isPending ? (
								<Loader2 className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto" />
							) : (
								<div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 group cursor-pointer justify-center">
									<span>Эхлэх</span>
									<ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" />
								</div>
							)}
						</Button>
					</div>
				</div>
			)}

			<style jsx global>{`
                /* Smooth Scrolling */
                html {
                    scroll-behavior: smooth;
                }
                
                /* Hide Scrollbar */
                .no-scrollbar::-webkit-scrollbar { 
                    display: none; 
                }
                .no-scrollbar { 
                    -ms-overflow-style: none; 
                    scrollbar-width: none; 
                }
                
                /* Subtle Bounce Animation */
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s infinite ease-in-out;
                }
                
                /* Enhanced Touch Targets for Mobile */
                @media (max-width: 640px) {
                    button:not(.no-touch-target), 
                    a:not(.no-touch-target), 
                    input[type="button"]:not(.no-touch-target) {
                        min-height: 40px;
                    }
                }
                
                /* Optimized Text Rendering */
                * {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                }
                
                /* Extra small breakpoint */
                @media (min-width: 475px) {
                    .xs:grid-cols-3 {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                    .xs:inline {
                        display: inline;
                    }
                }
                
               
                @media (min-width: 1920px) {
                    .3xl:grid-cols-10 {
                        grid-template-columns: repeat(10, minmax(0, 1fr));
                    }
                    .3xl:grid-cols-11 {
                        grid-template-columns: repeat(11, minmax(0, 1fr));
                    }
                    .3xl:grid-cols-7 {
                        grid-template-columns: repeat(7, minmax(0, 1fr));
                    }
                }
                
          
                .truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
              
                @media (max-width: 375px) {
                    .container {
                        padding-left: 0.5rem;
                        padding-right: 0.5rem;
                    }
                }
            `}</style>
		</div>
	);
}
