"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, Search, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSorillists } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ApiSorillistsResponse } from "@/types/soril/sorilLists";
import { SorilCard } from "./sorilcard";

type SorilCategory = "all" | "completed" | "notstarted";

export default function Sorillists() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<SorilCategory>("all");

	const {
		data: queryData,
		isPending,
		isError,
		error,
	} = useQuery<ApiSorillistsResponse>({
		queryKey: ["sorillists", userId],
		queryFn: () => getSorillists(userId || 0),
		enabled: !!userId && userId !== 0,
	});

	const data = useMemo(() => queryData?.RetData || [], [queryData]);

	const categorizedData = useMemo(() => {
		return {
			completed: data.filter((e) => e.isguitset === 1),
			notstarted: data.filter((e) => e.isguitset === 0),
		};
	}, [data]);

	const filteredData = useMemo(() => {
		let sorils = data;

		switch (selectedCategory) {
			case "all":
				sorils = data;
				break;
			case "completed":
				sorils = categorizedData.completed;
				break;
			case "notstarted":
				sorils = categorizedData.notstarted;
				break;
			default:
				sorils = data;
		}

		if (!searchTerm.trim()) return sorils;

		return sorils.filter(
			(soril) =>
				soril.soril_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(soril.plan_name || "")
					.toLowerCase()
					.includes(searchTerm.toLowerCase()),
		);
	}, [data, categorizedData, selectedCategory, searchTerm]);

	const clearSearch = () => setSearchTerm("");

	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<BookOpen className="w-12 h-12 mx-auto text-gray-400" />
					<h3 className="text-xl font-bold">Алдаа гарлаа</h3>
					<p className="text-gray-600 dark:text-gray-400">
						{error instanceof Error
							? error.message
							: "Жагсаалт татахад алдаа гарлаа"}
					</p>
					<Button
						onClick={() => window.location.reload()}
						className="rounded-full"
					>
						Дахин оролдох
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col overflow-auto">
			<div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				{/* Header */}
				<header className="text-center space-y-1">
					<h1 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Сорилын жагсаалт
					</h1>
					<p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
						Та өөрийн сорилуудыг энд харж, эхлүүлэх боломжтой
					</p>
				</header>

				{/* Search & Filter */}
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3">
					{/* Search */}
					<div className="relative w-full sm:max-w-md">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
							size={18}
						/>
						<input
							type="text"
							placeholder="Сорилын нэрээр хайх..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-8 py-2.5 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm sm:text-base text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
						/>
						{searchTerm && (
							<Button
								type="button"
								onClick={clearSearch}
								className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
								aria-label="Хайлт цэвэрлэх"
							>
								<X size={16} />
							</Button>
						)}
					</div>

					{/* Filter Badges */}
					<div className="flex flex-wrap gap-2 justify-center sm:justify-end">
						{[
							{
								key: "all",
								label: "Бүгд",
								icon: null,
								count: data.length,
							},
							{
								key: "notstarted",
								label: "Шинэ",
								icon: <Sparkles size={14} />,
								count: categorizedData.notstarted.length,
							},
							{
								key: "completed",
								label: "Дууссан",
								icon: <BookOpen size={14} />,
								count: categorizedData.completed.length,
							},
						].map((cat) => (
							<CategoryBadge
								key={cat.key}
								active={selectedCategory === cat.key}
								onClick={() => setSelectedCategory(cat.key as SorilCategory)}
								count={cat.count}
								label={cat.label}
								icon={cat.icon || undefined}
								variant={cat.key as SorilCategory}
							/>
						))}
					</div>
				</div>

				{/* Results Info */}
				{searchTerm && (
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<AlertCircle size={16} />
						<span>
							<strong>{filteredData.length}</strong> сорил олдлоо &ldquo;
							<strong>{searchTerm}</strong>&rdquo; гэсэн хайлтаар
						</span>
					</div>
				)}

				{/* Soril Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 items-stretch">
					{isPending ? (
						[1, 2, 3, 4, 5, 6, 7, 8].map((id) => <SkeletonCard key={id} />)
					) : filteredData.length > 0 ? (
						filteredData.map((soril) => (
							<SorilCard
								key={soril.exam_id}
								exam={soril}
								onClick={() => router.push(`/soril/${soril.exam_id}`)}
							/>
						))
					) : (
						<div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-60">
							<BookOpen className="w-12 h-12 mb-4 stroke-[1.5px]" />
							<h3 className="text-lg font-bold">Илэрц олдсонгүй</h3>
							<p className="text-sm text-muted-foreground">
								Хайлт эсвэл шүүлтүүрт тохирох сорил байхгүй байна.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// Skeleton Card Component
const SkeletonCard = () => (
	<div className="h-[430px] w-full flex flex-col overflow-hidden rounded-[28px] border border-border/40 bg-card/50 backdrop-blur-md animate-pulse">
		{/* Header Section Skeleton */}
		<div className="h-40 w-full bg-slate-200 dark:bg-slate-800 relative">
			<div className="absolute top-4 left-4 flex flex-col gap-2">
				<div className="h-6 w-20 bg-slate-300 dark:bg-slate-700 rounded-full" />
				<div className="h-6 w-24 bg-slate-300 dark:bg-slate-700 rounded-full" />
			</div>
		</div>

		{/* Content Area Skeleton */}
		<div className="flex flex-col grow p-5 gap-4">
			<div className="space-y-3">
				<div className="flex justify-between items-center">
					<div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded-full" />
				</div>
				<div className="space-y-2">
					<div className="h-5 w-full bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
				</div>
			</div>

			{/* Stats Grid Skeleton */}
			<div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
				<div className="flex gap-4">
					<div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
				</div>
				<div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
			</div>
		</div>
	</div>
);

// Category Badge Component
interface CategoryBadgeProps {
	active: boolean;
	onClick: () => void;
	count: number;
	label: string;
	variant: SorilCategory;
	icon?: React.ReactNode;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = React.memo(
	function CategoryBadge({ active, onClick, count, label, variant, icon }) {
		const getStyle = () => {
			if (!active)
				return "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700";

			switch (variant) {
				case "all":
					return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-2 border-blue-500 shadow-lg shadow-blue-500/30";
				case "notstarted":
					return "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/30";
				case "completed":
					return "bg-gradient-to-r from-purple-500 to-violet-500 text-white border-2 border-purple-500 shadow-lg shadow-purple-500/30";
				default:
					return "";
			}
		};

		return (
			<Button
				type="button"
				onClick={onClick}
				className={cn(
					"inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
					getStyle(),
					active ? "scale-105" : "hover:scale-102",
				)}
				aria-label={`${label} категори сонгох`}
				aria-pressed={active}
			>
				{icon && <span className="shrink-0">{icon}</span>}
				<span>{label}</span>
				<span
					className={cn(
						"ml-1 px-2 py-0.5 rounded-full text-xs font-bold",
						active
							? "bg-white/30 text-white"
							: "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
					)}
				>
					{count}
				</span>
			</Button>
		);
	},
);
