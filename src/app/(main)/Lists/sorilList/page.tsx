"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle, Clock, Filter, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import type React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getSorillists } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	ApiSorillistsResponse,
	SorillistsData,
} from "@/types/soril/sorilLists";
import { SorilCard } from "./sorilcard";

type SorilCategory = "all" | "completed" | "notstarted";

export default function SorilListPage() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<SorilCategory>("all");
	const [selectedPlan, setSelectedPlan] = useState<string>("all");

	const {
		data: queryData,
		isPending,
		error,
	} = useQuery<ApiSorillistsResponse>({
		queryKey: ["examlists", userId],
		queryFn: () => getSorillists(userId || 0),
		enabled: !!userId,
	});

	const planNames = useMemo(() => {
		if (!queryData?.RetData) return [];
		return Array.from(
			new Set(queryData.RetData.map((e) => e.plan_name || "Төлөвлөгөөгүй")),
		);
	}, [queryData]);

	const categorizedData = useMemo(() => {
		if (!queryData?.RetData) return { total: 0, completed: [], notstarted: [] };
		const allData = queryData.RetData;
		return {
			total: allData.length,
			completed: allData.filter((e) => e.isguitset === 1 && e.test_resid > 0),
			notstarted: allData.filter(
				(e) => e.isguitset === 0 && e.test_resid === 0,
			),
		};
	}, [queryData]);

	const filteredData = useMemo(() => {
		if (!queryData?.RetData) return [];
		let filtered = [...queryData.RetData];
		if (selectedStatus !== "all") filtered = categorizedData[selectedStatus];
		if (searchQuery) {
			filtered = filtered.filter(
				(exam) =>
					exam.soril_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(exam.plan_name || "")
						.toLowerCase()
						.includes(searchQuery.toLowerCase()),
			);
		}
		if (selectedPlan !== "all") {
			filtered = filtered.filter(
				(e) => (e.plan_name || "Төлөвлөгөөгүй") === selectedPlan,
			);
		}
		return filtered;
	}, [queryData, searchQuery, selectedStatus, selectedPlan, categorizedData]);

	const groupedExams = useMemo(() => {
		return filteredData.reduce<Record<string, SorillistsData[]>>(
			(acc, exam) => {
				const planName = exam.plan_name || "Бусад сорилууд";
				if (!acc[planName]) acc[planName] = [];
				acc[planName].push(exam);
				return acc;
			},
			{},
		);
	}, [filteredData]);

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedStatus("all");
		setSelectedPlan("all");
	};

	const hasActiveFilters =
		searchQuery || selectedStatus !== "all" || selectedPlan !== "all";

	return (
		<div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 p-4 md:p-8">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* --- Header: Жижиг бөгөөд цэгцтэй --- */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 border-zinc-200 dark:border-zinc-800">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
							Сорилын жагсаалт
						</h1>
						<p className="text-sm text-zinc-500 mt-1">
							Нийт {queryData?.RetData?.length || 0} сорил байна
						</p>
					</div>

					{/* Төлөвөөр шүүх (Badges) - Header-ийн баруун талд */}
					<div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
						{(
							[
								{
									key: "all",
									label: "Бүгд",
									icon: <BookOpen size={14} />,
									count: queryData?.RetData?.length || 0,
								},
								{
									key: "notstarted",
									label: "Эхлээгүй",
									icon: <Clock size={14} />,
									count: categorizedData.notstarted.length,
								},
								{
									key: "completed",
									label: "Дууссан",
									icon: <CheckCircle size={14} />,
									count: categorizedData.completed.length,
								},
							] as const
						).map((cat) => (
							<CategoryBadge
								key={cat.key}
								active={selectedStatus === cat.key}
								onClick={() => setSelectedStatus(cat.key)}
								count={cat.count}
								label={cat.label}
								icon={cat.icon}
								variant={cat.key}
							/>
						))}
					</div>
				</div>

				{/* --- Search & Plan Filter Row --- */}
				<div className="flex flex-col sm:flex-row items-center gap-3">
					<div className="relative w-full sm:max-w-sm">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
						<Input
							placeholder="Сорил хайх..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 h-9 text-sm bg-white dark:bg-zinc-900 shadow-sm"
						/>
					</div>

					<Select value={selectedPlan} onValueChange={setSelectedPlan}>
						<SelectTrigger className="h-9 w-full sm:w-[200px] bg-white dark:bg-zinc-900 shadow-sm text-sm">
							<div className="flex items-center gap-2">
								<Filter className="w-3.5 h-3.5 text-zinc-400" />
								<SelectValue placeholder="Төлөвлөгөө" />
							</div>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Бүх төлөвлөгөө</SelectItem>
							{planNames.map((plan) => (
								<SelectItem key={plan} value={plan}>
									{plan}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{hasActiveFilters && (
						<Button
							variant="ghost"
							size="sm"
							onClick={clearFilters}
							className="h-9 text-xs text-zinc-500"
						>
							<X className="w-3.5 h-3.5 mr-1" /> Цэвэрлэх
						</Button>
					)}
				</div>

				{/* --- Content Area --- */}
				{isPending ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} className="h-[280px] rounded-xl" />
						))}
					</div>
				) : (
					<div className="space-y-12">
						{Object.entries(groupedExams).map(([planName, exams]) => (
							<section key={planName} className="space-y-4">
								<div className="flex items-center gap-2">
									<div className="h-4 w-1 bg-primary rounded-full" />
									<h2 className="text-lg font-semibold tracking-tight">
										{planName}
									</h2>
									<span className="text-xs text-zinc-400 font-medium">
										({exams.length})
									</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
									{exams.map((exam) => (
										<SorilCard
											key={exam.exam_id}
											exam={exam}
											onClick={() => router.push(`/soril/${exam.exam_id}`)}
										/>
									))}
								</div>
							</section>
						))}
					</div>
				)}

				{/* --- Empty State --- */}
				{!isPending && filteredData.length === 0 && (
					<div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl border-zinc-100 dark:border-zinc-800">
						<div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-full mb-4">
							<BookOpen className="w-8 h-8 text-zinc-300" />
						</div>
						<h3 className="text-lg font-medium">Илэрц олдсонгүй</h3>
						<p className="text-sm text-zinc-500 max-w-xs mx-auto mt-1">
							Таны хайсан сорил олдсонгүй. Өөр түлхүүр үгээр хайж үзнэ үү.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

// ----------------------------------------------------------------------
// 🏆 Compact Category Badge
// ----------------------------------------------------------------------

interface CategoryBadgeProps {
	active: boolean;
	onClick: () => void;
	count: number;
	label: string;
	variant: SorilCategory;
	icon?: React.ReactNode;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
	active,
	onClick,
	count,
	label,
	variant,
	icon,
}) => {
	const styles = {
		all: active
			? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
			: "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50",
		notstarted: active
			? "bg-orange-500 text-white border-orange-500"
			: "bg-white text-orange-600 border-orange-100 hover:bg-orange-50",
		completed: active
			? "bg-emerald-600 text-white border-emerald-600"
			: "bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50",
	};

	return (
		<Button
			onClick={onClick}
			className={cn(
				"flex items-center gap-2 px-3 h-8 rounded-lg text-xs font-semibold transition-all border shadow-sm",
				styles[variant],
			)}
		>
			<span className={cn("shrink-0", active ? "text-current" : "opacity-70")}>
				{icon}
			</span>
			<span className="whitespace-nowrap">{label}</span>
			<span
				className={cn(
					"flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-bold",
					active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500",
				)}
			>
				{count}
			</span>
		</Button>
	);
};
