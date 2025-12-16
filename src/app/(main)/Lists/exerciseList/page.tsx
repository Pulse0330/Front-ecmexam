"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Minus,
	Plus,
	Search,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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

	// Console log хийх userId-г
	console.log("📌 Current userId:", userId);

	const { data, isLoading, isError, error } = useQuery<GetTestGroupResponse>({
		queryKey: ["testGroup", userId],
		queryFn: () => {
			console.log("🔍 GET Request - Fetching test groups for userId:", userId);
			return getTestGroup(userId || 0);
		},
		enabled: !!userId,
	});

	const mutation = useMutation({
		mutationFn: (tests: { testcnt: number; rlesson_id: number }[]) => {
			console.log("📤 POST Request Payload:");
			console.log("  userId:", userId);
			console.log("  tests array:", tests);
			console.log("  tests count:", tests.length);
			console.log(
				"  Full payload:",
				JSON.stringify({ userId, tests }, null, 2),
			);

			return getTestMixed(userId || 0, tests);
		},
		onSuccess: (response) => {
			console.log("✅ POST Response Success:");
			console.log("  Full response:", response);
			console.log("  ResponseType:", response.RetResponse?.ResponseType);
			console.log("  ResponseMessage:", response.RetResponse?.ResponseMessage);

			if (response.RetResponse?.ResponseType) {
				console.log("✅ Redirecting to /exercise");
				router.push("/exercise");
			} else {
				const errorMsg = `Алдаа: ${response.RetResponse?.ResponseMessage || "Тодорхойгүй алдаа"}`;
				console.log("❌ Response indicated failure:", errorMsg);
				alert(errorMsg);
			}
		},
		onError: (error: Error) => {
			console.log("❌ POST Request Error:");
			console.log("  Error message:", error.message);
			console.log("  Error object:", error);
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
		console.log(`🔄 Test count changed - ID: ${id}, Count: ${testcnt}`);

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
		console.log("🚀 Submit button clicked");
		console.log("  Current selectedTests state:", selectedTests);

		const tests = Object.entries(selectedTests).map(
			([rlesson_id, testcnt]) => ({
				testcnt,
				rlesson_id: parseInt(rlesson_id, 10),
			}),
		);

		console.log("  Transformed tests array:", tests);

		if (tests.length === 0) {
			console.log("⚠️ No tests selected");
			alert("Та хамгийн багадаа нэг тест сонгоно уу!");
			return;
		}

		if (!userId) {
			console.log("⚠️ No userId available");
			alert("Нэвтрэх шаардлагатай");
			return;
		}

		console.log("✅ Validation passed, calling mutation...");
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

	// Console log хийх state-үүдийг
	console.log("📊 Current state:", {
		selectedCount,
		totalQuestions,
		selectedTests,
		isLoading: mutation.isPending,
	});

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
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 pb-32">
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
					<div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg">
						<div className="flex items-center justify-between flex-wrap gap-4">
							<div className="flex items-center gap-6">
								<div className="flex items-center gap-2">
									<CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
									<div>
										<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
											Сонгосон бүлэг
										</p>
										<p className="text-2xl font-bold text-gray-900 dark:text-white">
											{selectedCount}
										</p>
									</div>
								</div>
								<div className="w-px h-12 bg-gray-300 dark:bg-gray-600" />
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
										Нийт асуулт
									</p>
									<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
										{totalQuestions}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={mutation.isPending}
								className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
							>
								{mutation.isPending
									? "Илгээж байна..."
									: `Тест эхлүүлэх (${totalQuestions} асуулт)`}
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
						const categoryTotalQuestions = items.reduce(
							(sum, item) => sum + (selectedTests[item.id] || 0),
							0,
						);

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
											<div className="flex items-center gap-2">
												<span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
													{categorySelectedCount} бүлэг
												</span>
												<span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-bold">
													{categoryTotalQuestions} асуулт
												</span>
											</div>
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
											const isSelected = selectedCount > 0;

											return (
												<div
													key={item.id}
													className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
														isSelected
															? "bg-blue-50/50 dark:bg-blue-900/10"
															: ""
													}`}
												>
													<div className="flex items-start justify-between gap-4 mb-4">
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-1">
																<h4 className="font-medium text-gray-900 dark:text-white">
																	{item.name}
																</h4>
																{isSelected && (
																	<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
																		<CheckCircle2 className="w-3 h-3" />
																		{selectedCount}
																	</span>
																)}
															</div>
															<p className="text-sm text-gray-600 dark:text-gray-400">
																Нийт: {item.cnt} тест
															</p>
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
																<span
																	className={`font-medium ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}
																>
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
															className={`w-16 text-center px-2 py-1.5 border rounded-lg text-sm focus:ring-1 outline-none transition-colors ${
																isSelected
																	? "border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 focus:ring-blue-500"
																	: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
															}`}
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

			{/* Sticky Bottom Summary */}
			{selectedCount > 0 && (
				<div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-blue-200 dark:border-blue-800 shadow-2xl p-4 z-50">
					<div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
						<div className="flex items-center gap-6">
							<div className="text-center">
								<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
									Бүлэг
								</p>
								<p className="text-xl font-bold text-gray-900 dark:text-white">
									{selectedCount}
								</p>
							</div>
							<div className="w-px h-10 bg-gray-300 dark:bg-gray-600" />
							<div className="text-center">
								<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
									Нийт асуулт
								</p>
								<p className="text-xl font-bold text-blue-600 dark:text-blue-400">
									{totalQuestions}
								</p>
							</div>
						</div>
						<Button
							type="button"
							onClick={handleSubmit}
							disabled={mutation.isPending}
							className="px-8 py-3 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
						>
							{mutation.isPending ? "Илгээж байна..." : `Тест эхлүүлэх →`}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
