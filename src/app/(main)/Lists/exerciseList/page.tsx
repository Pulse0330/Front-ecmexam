"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider"; // <-- ⭐ НЭМЛЭЭ
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

	const _getPercentColor = (percent: number) => {
		if (percent >= 80) return "from-green-500 to-emerald-500";
		if (percent >= 60) return "from-blue-500 to-cyan-500";
		if (percent >= 40) return "from-yellow-500 to-orange-500";
		return "from-red-500 to-pink-500";
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
		<div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				{/* HEADER */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
						Тестийн бүлгүүд
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Хичээл сонгож, тестийн тоог тохируулна уу
					</p>
				</div>

				{/* SEARCH */}
				<div className="mb-6">
					<div className="relative">
						<input
							type="text"
							placeholder="Хайх... (нэр, хичээл, сэдэв)"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full px-12 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 outline-none transition-all"
						/>
					</div>
				</div>

				{/* SUMMARY */}
				{selectedCount > 0 && (
					<div className="mb-6 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg">
						<div className="flex items-center justify-between flex-wrap gap-4">
							<div className="flex items-center gap-6">
								<div>
									<p className="text-sm text-gray-600 mb-1">Сонгосон тест</p>
									<p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
										{selectedCount}
									</p>
								</div>
								<div className="w-px h-12 bg-gray-300 dark:bg-gray-600" />
								<div>
									<p className="text-sm text-gray-600 mb-1">Нийт асуулт</p>
									<p className="text-3xl font-bold ">{totalQuestions}</p>
								</div>
							</div>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={mutation.isPending}
								className="px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
							>
								{mutation.isPending ? "Илгээж байна..." : "Тест эхлүүлэх"}
							</button>
						</div>
					</div>
				)}

				{/* CATEGORY LIST */}
				<div className="space-y-4">
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
								className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
							>
								{/* HEADER */}
								<button
									type="button"
									onClick={() => toggleCategory(categoryId)}
									className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
								>
									<div className="flex items-center gap-4">
										<div className="text-left">
											<h3 className="text-lg font-bold text-gray-900 dark:text-white">
												{categoryName}
											</h3>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{courseName} • {items.length} тест
											</p>
										</div>
									</div>
									<div className="flex items-center gap-4">
										{categorySelectedCount > 0 && (
											<span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
												{categorySelectedCount} сонгосон
											</span>
										)}
										{isExpanded ? (
											<ChevronUp className="w-6 h-6" />
										) : (
											<ChevronDown className="w-6 h-6" />
										)}
									</div>
								</button>

								{/* CONTENT */}
								{isExpanded && (
									<div className="border-t border-gray-200 dark:border-gray-700">
										{items.map((item) => {
											const selectedCount = selectedTests[item.id] || 0;

											return (
												<div
													key={item.id}
													className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
												>
													<div className="flex items-center justify-between gap-4 mb-3">
														<div className="flex-1">
															<h4 className="font-semibold text-gray-900 dark:text-white mb-1">
																{item.name}
															</h4>
															<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
																<span>Нийт: {item.cnt} тест</span>
																<span>•</span>
																<span className="font-medium">
																	{item.tpercent}%
																</span>
															</div>
														</div>

														{/* PROGRESS CIRCLE */}
														<div className="relative w-16 h-16">
															<svg className="w-16 h-16 transform -rotate-90">
																<circle
																	cx="32"
																	cy="32"
																	r="28"
																	stroke="currentColor"
																	strokeWidth="4"
																	fill="none"
																	className="text-gray-200 dark:text-gray-700"
																/>
																<title>asd</title>
																<circle
																	cx="32"
																	cy="32"
																	r="28"
																	stroke="url(#gradient)"
																	strokeWidth="4"
																	fill="none"
																	strokeDasharray={`${item.tpercent * 1.76} 176`}
																	strokeLinecap="round"
																/>

																<defs>
																	<linearGradient
																		id="gradient"
																		x1="0%"
																		y1="0%"
																		x2="100%"
																		y2="0%"
																	>
																		<stop offset="0%" />
																		<stop offset="100%" />
																	</linearGradient>
																</defs>
															</svg>
															<span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
																{item.tpercent}%
															</span>
														</div>
													</div>

													{/* SLIDER + +- BUTTONS */}
													<div className="space-y-2">
														<div className="flex items-center gap-3">
															{/* MINUS */}
															<button
																type="button"
																onClick={() =>
																	handleTestCountChange(
																		item.id,
																		Math.max(0, selectedCount - 1),
																	)
																}
																disabled={selectedCount === 0}
																className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
															>
																<Minus className="w-4 h-4" />
															</button>

															{/* ⭐ NEW SHADCN SLIDER ⭐ */}
															<Slider
																value={[selectedCount]}
																min={0}
																max={item.cnt}
																step={1}
																onValueChange={(value) =>
																	handleTestCountChange(item.id, value[0])
																}
																className="flex-1"
															/>

															{/* PLUS */}
															<button
																type="button"
																onClick={() =>
																	handleTestCountChange(
																		item.id,
																		Math.min(item.cnt, selectedCount + 1),
																	)
																}
																disabled={selectedCount >= item.cnt}
																className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center disabled:opacity-30"
															>
																<Plus className="w-4 h-4" />
															</button>

															{/* NUMBER INPUT */}
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
																className="w-20 text-center px-3 py-1.5 border-2 rounded-lg bg-white dark:bg-gray-700"
															/>
														</div>

														<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
															<span>0</span>
															<span className="font-semibold">
																{selectedCount} / {item.cnt}
															</span>
															<span>{item.cnt}</span>
														</div>
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
			</div>
		</div>
	);
}
