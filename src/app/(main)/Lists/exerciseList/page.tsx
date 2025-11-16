"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Minus, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getTestGroup, getTestMixed } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { GetTestGroupResponse } from "@/types/exercise/testGroup";

export default function TestGroupPage() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [selectedTests, setSelectedTests] = useState<Record<number, number>>(
		{},
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
		new Set(),
	);

	const { data, isLoading, isError, error } = useQuery<GetTestGroupResponse>({
		queryKey: ["testGroup", userId],
		queryFn: () => getTestGroup(userId || 0),
		enabled: !!userId,
	});

	const mutation = useMutation({
		mutationFn: (tests: { testcnt: number; rlesson_id: number }[]) =>
			getTestMixed(userId || 0, tests),
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

	const groupedData = useMemo(() => {
		if (!data?.RetData)
			return new Map<number, GetTestGroupResponse["RetData"][number][]>();

		const filtered = data.RetData.filter((item) => {
			const query = searchQuery.toLowerCase();
			return (
				item.name.toLowerCase().includes(query) ||
				item.coursename.toLowerCase().includes(query) ||
				item.ulesson_name.toLowerCase().includes(query)
			);
		});

		const grouped = new Map<
			number,
			GetTestGroupResponse["RetData"][number][]
		>();
		filtered.forEach((item) => {
			const existing = grouped.get(item.ulessonid) || [];
			grouped.set(item.ulessonid, [...existing, item]);
		});

		return grouped;
	}, [data, searchQuery]);

	const handleTestCountChange = (id: number, testcnt: number) => {
		if (testcnt > 0) {
			setSelectedTests((prev) => ({ ...prev, [id]: testcnt }));
		} else {
			setSelectedTests((prev) => {
				const newState = { ...prev };
				delete newState[id];
				return newState;
			});
		}
	};

	const handleSubmit = () => {
		const tests = Object.entries(selectedTests).map(
			([rlesson_id, testcnt]) => ({
				testcnt,
				rlesson_id: parseInt(rlesson_id, 10),
			}),
		);

		if (tests.length === 0) {
			alert("Та хамгийн багадаа нэг тест сонгоно уу!");
			return;
		}

		mutation.mutate(tests);
	};

	const toggleCategory = (categoryId: number) => {
		setExpandedCategories((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(categoryId)) newSet.delete(categoryId);
			else newSet.add(categoryId);
			return newSet;
		});
	};

	const selectedCount = Object.keys(selectedTests).length;
	const totalQuestions = Object.values(selectedTests).reduce(
		(sum, count) => sum + count,
		0,
	);

	const getPercentColor = (percent: number) => {
		if (percent >= 80) return "text-green-600";
		if (percent >= 60) return "text-blue-600";
		if (percent >= 40) return "text-orange-600";
		return "text-red-600";
	};

	const getProgressColor = (percent: number) => {
		if (percent >= 80) return "stroke-green-500";
		if (percent >= 60) return "stroke-blue-500";
		if (percent >= 40) return "stroke-orange-500";
		return "stroke-red-500";
	};

	if (!userId || isLoading || isError) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="text-center">
					{isLoading && (
						<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4" />
					)}
					<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
						{!userId
							? "Нэвтрэх шаардлагатай"
							: isError
								? (error as Error).message
								: "Өгөгдөл уншиж байна..."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
						Тестийн бүлгүүд
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Хичээл сонгож, тестийн тоог тохируулна уу
					</p>
				</div>

				{/* Search */}
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Хайх..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 outline-none transition-all"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								<X className="w-5 h-5" />
							</button>
						)}
					</div>
				</div>

				{/* Summary */}
				{selectedCount > 0 && (
					<div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
						<div className="flex items-center justify-between flex-wrap gap-4">
							<div className="flex items-center gap-6">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
										Сонгосон
									</p>
									<p className="text-2xl font-bold text-gray-900 dark:text-white">
										{selectedCount}
									</p>
								</div>
								<div className="w-px h-12 bg-gray-300 dark:bg-gray-600" />
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
										Нийт асуулт
									</p>
									<p className="text-2xl font-bold text-gray-900 dark:text-white">
										{totalQuestions}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={mutation.isPending}
								className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{mutation.isPending ? "Илгээж байна..." : "Тест эхлүүлэх"}
							</button>
						</div>
					</div>
				)}

				{/* Category List */}
				<div className="space-y-3">
					{Array.from(groupedData.entries()).map(([categoryId, items]) => {
						const isExpanded = expandedCategories.has(categoryId);
						const categoryName = items[0]?.ulesson_name || "Бусад";
						const courseName = items[0]?.coursename || "";
						const categorySelectedCount = items.filter(
							(item) => selectedTests[item.id],
						).length;

						return (
							<div
								key={categoryId}
								className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
							>
								{/* Category Header */}
								<button
									type="button"
									onClick={() => toggleCategory(categoryId)}
									className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
								>
									<div className="text-left">
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
											{categoryName}
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{courseName} • {items.length} тест
										</p>
									</div>
									<div className="flex items-center gap-3">
										{categorySelectedCount > 0 && (
											<span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
												{categorySelectedCount}
											</span>
										)}
										{isExpanded ? (
											<ChevronUp className="w-5 h-5 text-gray-400" />
										) : (
											<ChevronDown className="w-5 h-5 text-gray-400" />
										)}
									</div>
								</button>

								{/* Items */}
								{isExpanded && (
									<div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
										{items.map((item) => {
											const selectedCount = selectedTests[item.id] || 0;

											return (
												<div
													key={item.id}
													className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
												>
													<div className="flex items-start justify-between gap-4 mb-4">
														<div className="flex-1">
															<h4 className="font-medium text-gray-900 dark:text-white mb-1">
																{item.name}
															</h4>
															<p className="text-sm text-gray-600 dark:text-gray-400">
																Нийт: {item.cnt} тест
															</p>
														</div>

														{/* Progress Circle */}
														<div className="relative w-14 h-14 flex-shrink-0">
															<svg className="w-14 h-14 transform -rotate-90">
																<circle
																	cx="28"
																	cy="28"
																	r="24"
																	stroke="currentColor"
																	strokeWidth="4"
																	fill="none"
																	className="text-gray-200 dark:text-gray-700"
																/>
																<title>asd</title>
																<circle
																	cx="28"
																	cy="28"
																	r="24"
																	strokeWidth="4"
																	fill="none"
																	strokeDasharray={`${item.tpercent * 1.51} 151`}
																	strokeLinecap="round"
																	className={getProgressColor(item.tpercent)}
																/>
															</svg>
															<span
																className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getPercentColor(item.tpercent)}`}
															>
																{item.tpercent}%
															</span>
														</div>
													</div>

													{/* Controls */}
													<div className="flex items-center gap-3">
														<button
															type="button"
															onClick={() =>
																handleTestCountChange(
																	item.id,
																	Math.max(0, selectedCount - 1),
																)
															}
															disabled={selectedCount === 0}
															className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
														>
															<Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
														</button>

														<div className="flex-1 relative">
															<input
																type="range"
																min="0"
																max={item.cnt}
																value={selectedCount}
																onChange={(e) =>
																	handleTestCountChange(
																		item.id,
																		parseInt(e.target.value, 10),
																	)
																}
																className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
															/>
															<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
																<span>0</span>
																<span className="font-medium text-gray-700 dark:text-gray-300">
																	{selectedCount} / {item.cnt}
																</span>
																<span>{item.cnt}</span>
															</div>
														</div>

														<button
															type="button"
															onClick={() =>
																handleTestCountChange(
																	item.id,
																	Math.min(item.cnt, selectedCount + 1),
																)
															}
															disabled={selectedCount >= item.cnt}
															className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
														>
															<Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
														</button>

														<input
															type="number"
															min="0"
															max={item.cnt}
															value={selectedCount}
															onChange={(e) =>
																handleTestCountChange(
																	item.id,
																	Math.max(
																		0,
																		Math.min(
																			item.cnt,
																			parseInt(e.target.value, 10) || 0,
																		),
																	),
																)
															}
															className="w-16 text-center px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
														/>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</div>

				{groupedData.size === 0 && (
					<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
						<p className="text-gray-600 dark:text-gray-400">
							{searchQuery
								? `"${searchQuery}" хайлтад тохирох үр дүн олдсонгүй`
								: "Тестийн бүлэг байхгүй байна"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
