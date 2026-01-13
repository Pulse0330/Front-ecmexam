"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	CheckCircle2,
	Loader2,
	Minus,
	Plus,
	Search,
	Sparkles,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useDeferredValue, useMemo, useState } from "react";
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

// --- Types ---
interface CourseFilterItem {
	lesson_id: number;
	lesson_name: string;
	sort: number;
}

interface CategoryGroup {
	coursename: string;
	ulesson_name: string;
	items: TestGroupItem[];
}

interface LessonGroup {
	lesson_id: number;
	lesson_name: string;
	totalTests: number;
}

// --- Sub-components ---

const SkeletonCard = () => (
	<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border-2 border-slate-200 dark:border-slate-800 animate-pulse">
		<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
		<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
		<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
	</div>
);

const EmptyState = ({ searchQuery }: { searchQuery: string }) => (
	<div className="text-center py-20 animate-in fade-in zoom-in duration-500 w-full col-span-full">
		<div className="relative inline-block mb-6">
			<BookOpen className="w-20 h-20 text-slate-300 dark:text-slate-600" />
			<div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
				<Search className="w-4 h-4 text-white" />
			</div>
		</div>
		<h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
			{searchQuery ? "Хайлт олдсонгүй" : "Тест олдсонгүй"}
		</h3>
		<p className="text-slate-500 dark:text-slate-400">
			{searchQuery
				? "Өөр түлхүүр үг ашиглан дахин оролдоно уу"
				: "Тестийн бүлгүүд удахгүй нэмэгдэх болно"}
		</p>
	</div>
);

const LessonCard = memo(
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
	}) => (
		<button
			type="button"
			onClick={onClick}
			className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-slate-200/50 dark:border-slate-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] text-left relative overflow-hidden active:scale-95"
		>
			<div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
			<div className="relative flex flex-col h-full">
				<div className="flex-1">
					<div className="flex items-start justify-between mb-3">
						<h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-1 pr-2">
							{lesson.lesson_name}
						</h3>
						{selectedCount > 0 && (
							<div className="flex items-center gap-1 px-2 py-1 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg animate-pulse shrink-0">
								<Sparkles className="w-3 h-3 text-white" />
								<span className="text-[10px] font-bold text-white uppercase tracking-wider">
									{selectedCount} тест
								</span>
							</div>
						)}
					</div>
				</div>
				{selectedCount > 0 && (
					<div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
						<div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-md border border-emerald-100 dark:border-emerald-800">
							<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
							<span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
								{totalQuestions} асуулт
							</span>
						</div>
					</div>
				)}
				<div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
					<ArrowRight className="w-5 h-5 text-emerald-500" />
				</div>
			</div>
		</button>
	),
);
LessonCard.displayName = "LessonCard";

const CategoryCard = memo(
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
	}) => (
		<button
			type="button"
			onClick={onClick}
			className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-slate-200/50 dark:border-slate-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] text-left relative overflow-hidden active:scale-95"
		>
			<div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
			<div className="relative flex flex-col h-full">
				<div className="flex-1">
					<div className="flex items-start justify-between mb-3">
						<h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-1 pr-2">
							{category.ulesson_name}
						</h3>
						{categorySelectedCount > 0 && (
							<div className="flex items-center gap-1 px-2 py-1 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg animate-pulse shrink-0">
								<Sparkles className="w-3 h-3 text-white" />
								<span className="text-[10px] font-bold text-white uppercase tracking-wider">
									Сонгосон
								</span>
							</div>
						)}
					</div>
					<div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
						<p className="flex items-center gap-2">
							<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
							{category.coursename}
						</p>
						<p className="font-semibold text-slate-700 dark:text-slate-300">
							{category.items.length} бүлэг тест
						</p>
					</div>
				</div>
				{categorySelectedCount > 0 && (
					<div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
						<div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-md border border-emerald-100 dark:border-emerald-800">
							<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
							<span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
								{categoryTotalQuestions} асуулт
							</span>
						</div>
					</div>
				)}
				<div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
					<ArrowRight className="w-5 h-5 text-emerald-500" />
				</div>
			</div>
		</button>
	),
);
CategoryCard.displayName = "CategoryCard";

const TestItemCard = memo(
	({
		item,
		selectedCount,
		onCountChange,
	}: {
		item: TestGroupItem;
		selectedCount: number;
		onCountChange: (id: number, count: number) => void;
	}) => {
		const isSelected = selectedCount > 0;

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			let val = parseInt(e.target.value, 10);
			if (Number.isNaN(val)) val = 0;
			if (val > item.cnt) val = item.cnt;
			if (val < 0) val = 0;
			onCountChange(item.id, val);
		};

		return (
			<div
				className={`group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-md transition-all duration-300 ${
					isSelected
						? "border-2 border-emerald-500 ring-4 ring-emerald-500/5 scale-[1.02] shadow-emerald-200/50 dark:shadow-emerald-900/20"
						: "border-2 border-slate-100/50 dark:border-slate-800/50 hover:border-emerald-300"
				}`}
			>
				{isSelected && (
					<div className="absolute -top-3 -right-2 flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full font-bold text-xs shadow-lg animate-bounce-subtle z-10">
						{selectedCount} асуулт
					</div>
				)}

				<h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 line-clamp-2 min-h-12">
					{item.name}
				</h4>

				<div className="space-y-5">
					<div className="flex items-center justify-between gap-2">
						<Button
							onClick={() =>
								onCountChange(item.id, Math.max(0, selectedCount - 1))
							}
							disabled={selectedCount === 0}
							className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-90 transition-transform"
						>
							<Minus className="w-5 h-5" />
						</Button>

						<div className="relative flex-1 group/input">
							<input
								type="number"
								min="0"
								max={item.cnt}
								value={selectedCount === 0 ? "" : selectedCount}
								onChange={handleInputChange}
								placeholder="0"
								className="w-full text-center text-xl font-black bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500 focus:ring-0 rounded-xl py-2 transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							/>
							<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
								/ {item.cnt}
							</span>
						</div>

						<Button
							onClick={() =>
								onCountChange(item.id, Math.min(item.cnt, selectedCount + 1))
							}
							disabled={selectedCount >= item.cnt}
							className="w-10 h-10 rounded-xl bg-emerald-500 text-white shadow-md active:scale-90 transition-transform"
						>
							<Plus className="w-5 h-5" />
						</Button>
					</div>

					<div className="px-1">
						<input
							type="range"
							min="0"
							max={item.cnt}
							value={selectedCount}
							onChange={(e) => onCountChange(item.id, Number(e.target.value))}
							className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500 bg-slate-200 dark:bg-slate-700"
						/>
					</div>
				</div>
			</div>
		);
	},
);
TestItemCard.displayName = "TestItemCard";

// --- Main Page ---

export default function TestGroupPage() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [selectedTests, setSelectedTests] = useState<Record<number, number>>(
		{},
	);

	const [searchQuery, setSearchQuery] = useState("");
	const deferredSearch = useDeferredValue(searchQuery);
	const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	const { data: lessonData, isLoading: isLoadingLessons } = useQuery({
		queryKey: ["testGroupByLesson", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId && !selectedLesson,
	});

	const { data, isLoading: isLoadingDetails } = useQuery<GetTestGroupResponse>({
		queryKey: ["testFiltered", userId, selectedLesson],
		queryFn: () => getTestFiltered(userId || 0, selectedLesson || 0),
		enabled: !!userId && !!selectedLesson,
	});

	const mutation = useMutation({
		mutationFn: async (tests: { testcnt: number; rlesson_id: number }[]) => {
			console.log("🚀 1️⃣ /testsavedmixed дуудаж байна...");
			console.log("📦 Payload:", tests);

			// Эхлээд тестүүдийг холих
			const mixedResponse = await getTestMixed(userId || 0, tests);
			console.log("✅ Холих амжилттай:", mixedResponse);

			// Холих амжилттай бол тестүүдийг татах
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
			return next;
		});
	}, []);

	const handleBackToLessons = () => {
		setSelectedLesson(null);
		setSelectedCategory(null);
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
		<div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden pb-40">
			<AnimatedBackground />

			<div className="container mx-auto px-4 pt-8 relative z-10">
				<div className="mb-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-8 rounded-4xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100/50 dark:border-slate-800/50 relative overflow-hidden">
					<div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="flex items-center gap-5">
							{selectedLesson && (
								<Button
									onClick={handleBackToLessons}
									variant="ghost"
									className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-500 transition-colors"
								>
									<ArrowLeft className="w-5 h-5" />
								</Button>
							)}
							<div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
								<Zap className="text-white w-7 h-7 fill-white" />
							</div>
							<div>
								<h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
									{selectedLesson ? "Тест сонгох" : "Хичээл сонгох"}
								</h1>
								<p className="text-slate-500 font-medium">
									{selectedLesson
										? "Өөртөө тохирсон дасгалаа бэлдээрэй"
										: "Хичээлээ сонгоод эхэлцгээе"}
								</p>
							</div>
						</div>

						<div className="relative w-full md:w-72">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
							<input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={selectedLesson ? "Тест хайх..." : "Хичээл хайх..."}
								className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-none rounded-2xl text-sm focus:ring-2 ring-emerald-500 transition-all"
							/>
						</div>
					</div>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{[1, 2, 3, 4].map((i) => (
							<SkeletonCard key={i} />
						))}
					</div>
				) : !selectedLesson ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
						{lessonGroups.map((lesson) => {
							// data?.RetData-аас тухайн хичээлийн тестүүдийг олох
							const lessonTests =
								data?.RetData?.filter(
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
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
						{[...groupedData.entries()].map(([key, category]) => (
							<CategoryCard
								key={key}
								category={category}
								categorySelectedCount={
									category.items.filter((i) => selectedTests[i.id]).length
								}
								categoryTotalQuestions={category.items.reduce(
									(sum, i) => sum + (selectedTests[i.id] || 0),
									0,
								)}
								onClick={() => setSelectedCategory(key)}
							/>
						))}
						{groupedData.size === 0 && <EmptyState searchQuery={searchQuery} />}
					</div>
				) : (
					<div className="space-y-6 animate-in fade-in duration-300 relative z-10">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50">
							<div className="flex items-center gap-2">
								<Button
									onClick={() => setSelectedCategory(null)}
									variant="ghost"
									className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-500 transition-colors"
								>
									<ArrowLeft className="w-4 h-4" /> Буцах
								</Button>
								<div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block" />
								<h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
									{groupedData.get(selectedCategory)?.ulesson_name}
								</h2>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{groupedData.get(selectedCategory)?.items.map((item) => (
								<TestItemCard
									key={item.id}
									item={item}
									selectedCount={selectedTests[item.id] || 0}
									onCountChange={handleTestChange}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			{totals.questionCount > 0 && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-50">
					<div className="bg-slate-900/90 dark:bg-emerald-950/90 text-white rounded-4xl p-4 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
						<div className="flex items-center gap-6 pl-4">
							<div className="flex flex-col">
								<span className="text-[10px] uppercase font-black text-emerald-400 leading-none mb-1">
									Нийт асуулт
								</span>
								<span className="text-2xl font-black">
									{totals.questionCount}
								</span>
							</div>
							<div className="w-px h-8 bg-white/10" />
							<div className="flex flex-col">
								<span className="text-[10px] uppercase font-black text-emerald-400 leading-none mb-1">
									Сонгосон бүлэг
								</span>
								<span className="text-2xl font-black">{totals.groupCount}</span>
							</div>
						</div>
						<Button
							onClick={handleStartTest}
							disabled={mutation.isPending}
							className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-3xl px-8 py-7 font-black text-lg transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
						>
							{mutation.isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<div className="flex items-center gap-2">
									ЭХЛЭХ <ArrowRight className="w-5 h-5" />
								</div>
							)}
						</Button>
					</div>
				</div>
			)}

			<style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s infinite ease-in-out;
                }
            `}</style>
		</div>
	);
}
