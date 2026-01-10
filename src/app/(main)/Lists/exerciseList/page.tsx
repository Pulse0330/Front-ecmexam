"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	CheckCircle2,
	Filter,
	Loader2,
	Minus,
	Plus,
	Search,
	Target,
	X,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	getTestFilter,
	getTestFiltered,
	getTestGroup,
	getTestMixed,
} from "@/lib/api";
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
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

	// Fetch filter options (lessons list)
	const { data: filterData } = useQuery({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	// Fetch test groups based on selected course
	const { data, isLoading } = useQuery<GetTestGroupResponse>({
		queryKey: ["testGroup", userId, selectedCourse],
		queryFn: () => {
			if (selectedCourse === null || selectedCourse === 0) {
				return getTestGroup(userId || 0);
			}
			return getTestFiltered(userId || 0, selectedCourse);
		},
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
			return (
				item.name.toLowerCase().includes(query) ||
				item.coursename.toLowerCase().includes(query) ||
				item.ulesson_name.toLowerCase().includes(query)
			);
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
	}, [data, searchQuery]);

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

	const handleCourseFilterChange = useCallback((courseId: number | null) => {
		setSelectedCourse(courseId);
		setSelectedTests({});
		setSelectedCategory(null);
	}, []);

	const handleCategoryClick = useCallback((categoryKey: string) => {
		setSelectedCategory(categoryKey);
	}, []);

	const handleBackToCategories = useCallback(() => {
		setSelectedCategory(null);
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
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="text-center space-y-4">
					<Loader2 className="inline-block animate-spin w-12 h-12 text-emerald-600 dark:text-emerald-400" />
					<p className="text-base font-medium text-slate-700 dark:text-slate-300">
						{!userId ? "Нэвтрэх шаардлагатай" : "Өгөгдөл уншиж байна..."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-page-gradient py-6 px-4 sm:px-6 lg:px-8 pb-32">
			<div className="max-w-full mx-auto">
				{/* Header */}
				<div className="mb-8">
					<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
						<div className="flex items-center gap-3 mb-2">
							<div className="w-12 h-12 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
								<BookOpen className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
									Тестийн бүлгүүд
								</h1>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									Хичээл сонгож, амжилтаа дээшлүүлээрэй
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Search Bar */}
				<div className="mb-6">
					<div className="relative max-w-2xl">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
						<input
							type="text"
							placeholder="Хайх..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-12 pr-12 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
							>
								<X className="w-5 h-5" />
							</button>
						)}
					</div>
				</div>

				{/* Course Filter */}
				{filterData?.RetData && filterData.RetData.length > 0 && (
					<div className="mb-8">
						<div className="flex items-center gap-2 mb-4">
							<Filter className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
							<span className="text-base font-bold text-slate-900 dark:text-white">
								Хичээл шүүх
							</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{filterData.RetData.map((course: CourseFilterItem) => (
								<button
									key={course.lesson_id}
									type="button"
									onClick={() =>
										handleCourseFilterChange(
											course.lesson_id === 0 ? null : course.lesson_id,
										)
									}
									className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${
										(course.lesson_id === 0 && selectedCourse === null) ||
										selectedCourse === course.lesson_id
											? "bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105"
											: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md"
									}`}
								>
									{course.lesson_name}
								</button>
							))}
						</div>
					</div>
				)}

				{/* Category Grid OR Item Details */}
				{!selectedCategory ? (
					// Show category grid
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{[...groupedData.entries()].map(([key, category]) => {
							const categorySelectedCount = category.items.filter(
								(item) => selectedTests[item.id],
							).length;

							const categoryTotalQuestions = category.items.reduce(
								(sum, item) => sum + (selectedTests[item.id] || 0),
								0,
							);

							return (
								<button
									key={key}
									type="button"
									onClick={() => handleCategoryClick(key)}
									className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-xl text-left"
								>
									<div className="flex flex-col h-full">
										<div className="flex-1">
											<h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
												{category.ulesson_name}
											</h3>
											<div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
												<p>{category.coursename}</p>
												<p className="font-semibold">
													{category.items.length} тест
												</p>
											</div>
										</div>

										{categorySelectedCount > 0 && (
											<div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
												<div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
													<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
													<span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
														{categorySelectedCount}
													</span>
												</div>
												<div className="flex items-center gap-2 px-3 py-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-lg border border-sky-200 dark:border-sky-800">
													<Target className="w-4 h-4 text-sky-600 dark:text-sky-400" />
													<span className="text-sm font-bold text-sky-700 dark:text-sky-300">
														{categoryTotalQuestions}
													</span>
												</div>
											</div>
										)}
									</div>
								</button>
							);
						})}
					</div>
				) : (
					// Show selected category items
					(() => {
						const category = groupedData.get(selectedCategory);
						if (!category) return null;

						return (
							<div className="space-y-6">
								{/* Back button and category header */}
								<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border-2 border-slate-200 dark:border-slate-800">
									<button
										type="button"
										onClick={handleBackToCategories}
										className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-4 transition-colors"
									>
										<ArrowLeft className="w-5 h-5" />
										<span className="font-semibold">Буцах</span>
									</button>
									<h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
										{category.ulesson_name}
									</h2>
									<p className="text-slate-600 dark:text-slate-400">
										{category.coursename} • {category.items.length} тест
									</p>
								</div>

								{/* Items grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{category.items.map((item) => {
										const itemSelectedCount = selectedTests[item.id] || 0;
										const isSelected = itemSelectedCount > 0;

										return (
											<div
												key={item.id}
												className={`group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg transition-all hover:shadow-xl ${
													isSelected
														? "border-2 border-emerald-500 ring-4 ring-emerald-500/10"
														: "border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700"
												}`}
											>
												{/* Selected Badge */}
												{isSelected && (
													<div className="absolute -top-2 -right-2 flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg">
														<CheckCircle2 className="w-4 h-4" />
														{itemSelectedCount}
													</div>
												)}

												{/* Card Header */}
												<div className="mb-4">
													<h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-12">
														{item.name}
													</h4>
													<p className="text-sm text-slate-600 dark:text-slate-400">
														Нийт:{" "}
														<span className="font-semibold">{item.cnt}</span>{" "}
														тест
													</p>
												</div>

												{/* Controls */}
												<div className="space-y-3">
													<div className="flex items-center gap-2">
														<button
															type="button"
															onClick={() =>
																handleTestCountChange(
																	item.id,
																	Math.max(0, itemSelectedCount - 1),
																)
															}
															disabled={itemSelectedCount === 0}
															className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95"
															aria-label="Тоо хасах"
														>
															<Minus className="w-5 h-5" />
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
																className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-emerald-600"
																style={{
																	background: `linear-gradient(to right, rgb(5 150 105) 0%, rgb(5 150 105) ${(itemSelectedCount / item.cnt) * 100}%, rgb(226 232 240) ${(itemSelectedCount / item.cnt) * 100}%, rgb(226 232 240) 100%)`,
																}}
																aria-label={`${item.name} тестийн тоо`}
															/>
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
															className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
															aria-label="Тоо нэмэх"
														>
															<Plus className="w-5 h-5" />
														</button>
													</div>

													<div className="flex justify-between text-xs font-semibold">
														<span className="text-slate-500 dark:text-slate-400">
															0
														</span>
														<span
															className={`${
																isSelected
																	? "text-emerald-600 dark:text-emerald-400"
																	: "text-slate-600 dark:text-slate-400"
															}`}
														>
															{itemSelectedCount} / {item.cnt}
														</span>
														<span className="text-slate-500 dark:text-slate-400">
															{item.cnt}
														</span>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						);
					})()
				)}
			</div>

			{/* Floating Action Button */}
			{selectedCount > 0 && (
				<div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t-2 border-slate-200 dark:border-slate-800 p-4 shadow-2xl">
					<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
						<div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
							<div className="text-center px-4 py-2 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl text-white shadow-lg">
								<p className="text-xs font-medium opacity-90 mb-0.5">Бүлэг</p>
								<p className="text-2xl font-bold">{selectedCount}</p>
							</div>
							<div className="text-center px-4 py-2 bg-linear-to-br from-sky-500 to-sky-600 rounded-xl text-white shadow-lg">
								<p className="text-xs font-medium opacity-90 mb-0.5">Асуулт</p>
								<p className="text-2xl font-bold">{totalQuestions}</p>
							</div>
						</div>
						<Button
							onClick={handleSubmit}
							disabled={mutation.isPending}
							className="px-8 py-6 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 text-base"
						>
							{mutation.isPending ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin mr-2" />
									Илгээж байна...
								</>
							) : (
								<>
									<Zap className="w-5 h-5 mr-2" />
									Тест эхлүүлэх
									<ArrowRight className="w-5 h-5 ml-2" />
								</>
							)}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
