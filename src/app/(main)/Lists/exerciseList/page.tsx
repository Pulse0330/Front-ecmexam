"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	ArrowRight,
	BookOpen,
	CheckCircle2,
	Filter,
	Loader2,
	Minus,
	Plus,
	Search,
	Target,
	TrendingUp,
	X,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTestFilter, getTestGroup, getTestMixed } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	GetTestGroupResponse,
	TestGroupItem,
} from "@/types/exercise/testGroup";

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

export default function TestGroupPage() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [selectedTests, setSelectedTests] = useState<Record<number, number>>(
		{},
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

	// Fetch test groups
	const { data, isLoading, isError, error } = useQuery<GetTestGroupResponse>({
		queryKey: ["testGroup", userId],
		queryFn: () => getTestGroup(userId || 0),
		enabled: !!userId,
	});

	// Fetch filter options
	const { data: filterData } = useQuery({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	// Submit mutation
	const mutation = useMutation({
		mutationFn: (tests: { testcnt: number; rlesson_id: number }[]) => {
			return getTestMixed(userId || 0, tests);
		},
		onSuccess: (response) => {
			if (response.RetResponse?.ResponseType) {
				router.push("/exercise");
			} else {
				alert(
					`Алдаа: ${response.RetResponse?.ResponseMessage || "Тодорхойгүй алдаа"}`,
				);
			}
		},
		onError: (error: Error) => {
			alert(`Алдаа гарлаа: ${error.message}`);
		},
	});

	// Group and filter data
	const groupedData = useMemo(() => {
		if (!data?.RetData) return new Map<string, CategoryGroup>();

		const filtered = data.RetData.filter((item) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				item.name.toLowerCase().includes(query) ||
				item.coursename.toLowerCase().includes(query) ||
				item.ulesson_name.toLowerCase().includes(query);

			const matchesCourse =
				selectedCourse === null || item.courseid === selectedCourse;

			return matchesSearch && matchesCourse;
		});

		const grouped = new Map<string, CategoryGroup>();

		for (const item of filtered) {
			const key = `${item.coursename}-${item.ulessonid}`;

			if (!grouped.has(key)) {
				grouped.set(key, {
					coursename: item.coursename,
					ulesson_name: item.ulesson_name,
					items: [],
				});
			}

			grouped.get(key)?.items.push(item);
		}

		return grouped;
	}, [data, searchQuery, selectedCourse]);

	// Calculate totals
	const { selectedCount, totalQuestions } = useMemo(() => {
		const count = Object.keys(selectedTests).length;
		const total = Object.values(selectedTests).reduce(
			(sum, val) => sum + val,
			0,
		);
		return { selectedCount: count, totalQuestions: total };
	}, [selectedTests]);

	// Handlers
	const handleTestCountChange = useCallback((id: number, testcnt: number) => {
		setSelectedTests((prev) => {
			if (testcnt > 0) {
				return { ...prev, [id]: testcnt };
			}
			const newState = { ...prev };
			delete newState[id];
			return newState;
		});
	}, []);

	const handleSubmit = useCallback(() => {
		const tests = Object.entries(selectedTests).map(
			([rlesson_id, testcnt]) => ({
				testcnt,
				rlesson_id: Number(rlesson_id),
			}),
		);

		if (tests.length === 0) {
			alert("Та хамгийн багадаа нэг тест сонгоно уу!");
			return;
		}

		if (!userId) {
			alert("Нэвтрэх шаардлагатай");
			return;
		}

		mutation.mutate(tests);
	}, [selectedTests, userId, mutation]);

	// Loading/Error states
	if (!userId || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
				<div className="text-center space-y-4">
					<Loader2 className="inline-block animate-spin w-12 h-12 text-emerald-600 dark:text-emerald-400" />
					<p className="text-base font-medium text-slate-700 dark:text-slate-300">
						{!userId ? "Нэвтрэх шаардлагатай" : "Өгөгдөл уншиж байна..."}
					</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
				<div className="text-center space-y-4 max-w-md">
					<AlertCircle className="inline-block w-12 h-12 text-rose-500" />
					<p className="text-base font-medium text-rose-600 dark:text-rose-400">
						{(error as Error).message}
					</p>
					<Button
						onClick={() => window.location.reload()}
						className="bg-rose-600 hover:bg-rose-700 text-white"
					>
						Дахин оролдох
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 pb-32">
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
						<div className="flex items-center gap-3 mb-2">
							<div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
								<BookOpen className="w-5 h-5 text-white" />
							</div>
							<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
								Тестийн бүлгүүд
							</h1>
						</div>
						<p className="text-sm text-slate-600 dark:text-slate-400">
							Хичээл сонгож, амжилтаа дээшлүүлээрэй
						</p>
					</div>
				</div>

				{/* Search Bar */}
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
						<input
							type="text"
							placeholder="Хайх..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						)}
					</div>
				</div>

				{/* Course Filter */}
				{filterData?.RetData && filterData.RetData.length > 0 && (
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-3">
							<Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
							<span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
								Хичээл шүүх
							</span>
						</div>
						<div className="flex items-center gap-2 overflow-x-auto pb-2">
							{filterData.RetData.filter(
								(course: CourseFilterItem) => course.lesson_id !== 0,
							).map((course: CourseFilterItem) => (
								<button
									key={course.lesson_id}
									type="button"
									onClick={() =>
										setSelectedCourse(
											selectedCourse === course.lesson_id
												? null
												: course.lesson_id,
										)
									}
									className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
										selectedCourse === course.lesson_id
											? "bg-emerald-600 text-white shadow-md"
											: "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500"
									}`}
								>
									{course.lesson_name}
								</button>
							))}
						</div>
					</div>
				)}

				{/* Stats Cards */}
				{selectedCount > 0 && (
					<div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
							<div className="flex items-center justify-between mb-1">
								<Zap className="w-6 h-6 text-emerald-600" />
								<span className="text-2xl font-bold text-emerald-600">
									{selectedCount}
								</span>
							</div>
							<p className="text-xs font-medium text-slate-600 dark:text-slate-400">
								Сонгосон бүлэг
							</p>
						</div>

						<div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
							<div className="flex items-center justify-between mb-1">
								<Target className="w-6 h-6 text-sky-600" />
								<span className="text-2xl font-bold text-sky-600">
									{totalQuestions}
								</span>
							</div>
							<p className="text-xs font-medium text-slate-600 dark:text-slate-400">
								Нийт асуулт
							</p>
						</div>

						<div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
							<div className="flex items-center justify-between mb-1">
								<TrendingUp className="w-6 h-6 text-amber-600" />
								<span className="text-2xl font-bold text-amber-600">
									{Math.round(totalQuestions / selectedCount) || 0}
								</span>
							</div>
							<p className="text-xs font-medium text-slate-600 dark:text-slate-400">
								Дундаж
							</p>
						</div>
					</div>
				)}

				{/* Category List */}
				<div className="space-y-6">
					{[...groupedData.entries()].map(([key, category]) => {
						const categorySelectedCount = category.items.filter(
							(item) => selectedTests[item.id],
						).length;

						const categoryTotalQuestions = category.items.reduce(
							(sum, item) => sum + (selectedTests[item.id] || 0),
							0,
						);

						return (
							<div key={key} className="space-y-3">
								{/* Category Header */}
								<div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
									<div className="flex items-center justify-between mb-1">
										<h3 className="text-lg font-bold text-slate-900 dark:text-white">
											{category.ulesson_name}
										</h3>
										{categorySelectedCount > 0 && (
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
													<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
													<span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
														{categorySelectedCount} бүлэг
													</span>
												</div>
												<div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 dark:bg-sky-900/30 rounded-md">
													<Target className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
													<span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
														{categoryTotalQuestions} асуулт
													</span>
												</div>
											</div>
										)}
									</div>
									<p className="text-sm text-slate-600 dark:text-slate-400">
										{category.coursename} • {category.items.length} тест
									</p>
								</div>

								{/* Test Items */}
								<div className="grid gap-3">
									{category.items.map((item) => {
										const itemSelectedCount = selectedTests[item.id] || 0;
										const isSelected = itemSelectedCount > 0;

										return (
											<div
												key={item.id}
												className={`p-4 rounded-lg border-2 transition-all ${
													isSelected
														? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
														: "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
												}`}
											>
												{/* Item Header */}
												<div className="flex items-start justify-between gap-3 mb-3">
													<div className="flex-1">
														<h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
															{item.name}
														</h4>
														<p className="text-sm text-slate-600 dark:text-slate-400">
															Нийт: {item.cnt} тест
														</p>
													</div>
													{isSelected && (
														<div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md font-semibold text-sm">
															<CheckCircle2 className="w-4 h-4" />
															{itemSelectedCount}
														</div>
													)}
												</div>

												{/* Controls */}
												<div className="flex items-center gap-3">
													<button
														type="button"
														onClick={() =>
															handleTestCountChange(
																item.id,
																Math.max(0, itemSelectedCount - 1),
															)
														}
														disabled={itemSelectedCount === 0}
														className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
														aria-label="Тоо хасах"
													>
														<Minus className="w-4 h-4" />
													</button>

													<div className="flex-1">
														<input
															type="range"
															min="0"
															max={item.cnt}
															value={itemSelectedCount}
															onChange={(e) =>
																handleTestCountChange(
																	item.id,
																	Number(e.target.value),
																)
															}
															className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-800 accent-emerald-600"
															aria-label={`${item.name} тестийн тоо`}
														/>
														<div className="flex justify-between text-xs mt-1.5">
															<span className="text-slate-500 dark:text-slate-400">
																0
															</span>
															<span className="font-semibold text-emerald-600 dark:text-emerald-400">
																{itemSelectedCount} / {item.cnt}
															</span>
															<span className="text-slate-500 dark:text-slate-400">
																{item.cnt}
															</span>
														</div>
													</div>

													<button
														type="button"
														onClick={() =>
															handleTestCountChange(
																item.id,
																Math.min(item.cnt, itemSelectedCount + 1),
															)
														}
														disabled={itemSelectedCount >= item.cnt}
														className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
														aria-label="Тоо нэмэх"
													>
														<Plus className="w-4 h-4" />
													</button>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>

				{/* Empty State */}
				{groupedData.size === 0 && (
					<div className="bg-white dark:bg-slate-900 rounded-lg p-12 text-center border border-slate-200 dark:border-slate-800">
						<AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
						<p className="text-base font-medium text-slate-600 dark:text-slate-400">
							{searchQuery
								? `"${searchQuery}" хайлтад тохирох үр дүн олдсонгүй`
								: "Тестийн бүлэг байхгүй байна"}
						</p>
					</div>
				)}
			</div>

			{/* Floating Action Button */}
			{selectedCount > 0 && (
				<div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 p-4 shadow-lg">
					<div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="text-center px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
								<p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">
									Бүлэг
								</p>
								<p className="text-xl font-bold text-slate-900 dark:text-white">
									{selectedCount}
								</p>
							</div>
							<div className="text-center px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
								<p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">
									Нийт асуулт
								</p>
								<p className="text-xl font-bold text-slate-900 dark:text-white">
									{totalQuestions}
								</p>
							</div>
						</div>
						<Button
							onClick={handleSubmit}
							disabled={mutation.isPending}
							className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{mutation.isPending ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin mr-2" />
									Илгээж байна...
								</>
							) : (
								<>
									<Zap className="w-4 h-4 mr-2" />
									Тест эхлүүлэх
									<ArrowRight className="w-4 h-4 ml-2" />
								</>
							)}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
