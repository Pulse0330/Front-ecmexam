"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	Clock,
	DollarSign,
	Search,
	Sparkles,
	X,
	Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useServerTime } from "@/hooks/useServerTime";
import { getExamlists } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	ApiExamlistsResponse,
	ExamlistsData,
} from "@/types/exam/examlist";
import ExamCard from "./examcard";

type ExamCategory = "all" | "active" | "upcoming" | "free" | "paid" | "expired";

export default function ExamListPage() {
	const { userId } = useAuthStore();
	const { currentTime, isLoading: isTimeLoading } = useServerTime();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<ExamCategory>("all");

	const { data: queryData, isPending } = useQuery<ApiExamlistsResponse>({
		queryKey: ["examlists", userId],
		queryFn: () => getExamlists(userId || 0),
		enabled: !!userId,
	});

	const data = useMemo(() => queryData?.RetData || [], [queryData]);

	// Дубликат exam_id-уудыг арилгах
	const uniqueData = useMemo(() => {
		const seen = new Set<number>();
		return data.filter((exam) => {
			if (seen.has(exam.exam_id)) return false;
			seen.add(exam.exam_id);
			return true;
		});
	}, [data]);
	const skeletonIds = [1, 2, 3, 4, 5, 6];
	// Server time ашиглан category-д ангилах
	const categorizedData = useMemo(() => {
		if (!currentTime)
			return {
				active: [],
				upcoming: [],
				free: [],
				paid: [],
				expired: [],
				now: new Date(),
			};
		const now = currentTime;

		return {
			active: uniqueData.filter((exam) => {
				const start = new Date(exam.ognoo);
				const end = new Date(start.getTime() + exam.exam_minute * 60000);
				const canAccess =
					exam.ispurchased === 1 || exam.ispaydescr === "Төлбөргүй";
				return now >= start && now <= end && canAccess;
			}),
			upcoming: uniqueData.filter((exam) => {
				const start = new Date(exam.ognoo);
				return now < start;
			}),
			free: uniqueData.filter((exam) => exam.ispaydescr === "Төлбөргүй"),
			paid: uniqueData.filter(
				(exam) => exam.ispaydescr === "Төлбөртэй" && exam.ispurchased === 0,
			),
			expired: uniqueData.filter((exam) => {
				const start = new Date(exam.ognoo);
				const end = new Date(start.getTime() + exam.exam_minute * 60000);
				return now > end;
			}),
			now,
		};
	}, [uniqueData, currentTime]);

	const filteredData = useMemo(() => {
		const exams: ExamlistsData[] =
			selectedCategory === "all"
				? uniqueData
				: categorizedData[selectedCategory] || [];

		if (!searchTerm.trim()) return exams;

		return exams.filter((exam) =>
			exam.title.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [uniqueData, categorizedData, selectedCategory, searchTerm]);

	const clearSearch = () => setSearchTerm("");

	if (isTimeLoading) return <div>Loading server time...</div>;

	return (
		<div className="min-h-screen h-screen flex flex-col py-6 px-4 overflow-hidden">
			<div className="max-w-7xl mx-auto w-full flex flex-col h-full">
				{/* Header */}
				<header className="mb-6 text-center space-y-2 shrink-0">
					<h1 className="text-4xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Шалгалтын жагсаалт
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Та өөрийн шалгалтуудыг энд харж, эхлүүлэх боломжтой
					</p>
				</header>

				{/* Search & Filter */}
				<div className="mb-4 flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0">
					{/* Search */}
					<div className="relative w-full lg:flex-1 max-w-md">
						<Search
							className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
							size={20}
						/>
						<input
							type="text"
							placeholder="Шалгалтын нэрээр хайх..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-12 pr-10 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
						/>
						{searchTerm && (
							<Button
								onClick={clearSearch}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
								aria-label="Хайлт цэвэрлэх"
							>
								<X size={18} />
							</Button>
						)}
					</div>

					{/* Filter Badges */}
					<div className="flex flex-wrap gap-2 justify-center lg:justify-end">
						{(
							[
								{
									key: "all",
									label: "Бүгд",
									icon: null,
									count: uniqueData.length,
								},
								{
									key: "active",
									label: "Идэвхтэй",
									icon: <Zap size={14} />,
									count: categorizedData.active.length,
								},
								{
									key: "upcoming",
									label: "Удахгүй",
									icon: <Clock size={14} />,
									count: categorizedData.upcoming.length,
								},
								{
									key: "free",
									label: "Төлбөргүй",
									icon: <Sparkles size={14} />,
									count: categorizedData.free.length,
								},
								{
									key: "paid",
									label: "Төлбөртэй",
									icon: <DollarSign size={14} />,
									count: categorizedData.paid.length,
								},
								{
									key: "expired",
									label: "Дууссан",
									icon: <CheckCircle2 size={14} />,
									count: categorizedData.expired.length,
								},
							] as const
						).map((cat) => (
							<CategoryBadge
								key={cat.key}
								active={selectedCategory === cat.key}
								onClick={() => setSelectedCategory(cat.key as ExamCategory)}
								count={cat.count}
								label={cat.label}
								icon={cat.icon || undefined}
								variant={cat.key as ExamCategory}
							/>
						))}
					</div>
				</div>

				{/* Results Info */}
				{searchTerm && (
					<div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 shrink-0">
						<AlertCircle size={16} />
						<span>
							<strong>{filteredData.length}</strong> шалгалт олдлоо &ldquo;
							<strong>{searchTerm}</strong>&rdquo; гэсэн хайлтаар
						</span>
					</div>
				)}

				{/* Scrollable Exam Grid Container */}

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-4">
					{isPending ? (
						skeletonIds.map((id) => <SkeletonCard key={id} />)
					) : filteredData.length === 0 ? (
						<EmptyState searchTerm={searchTerm} />
					) : (
						filteredData.map((exam) => (
							<ExamCard
								key={exam.exam_id}
								exam={exam}
								now={categorizedData.now}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}

// Skeleton Card Component
const SkeletonCard = () => (
	<div className="rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md animate-pulse p-5">
		<div className="space-y-3">
			<div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
			<div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
			<div className="space-y-2 pt-2">
				<div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
				<div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
			</div>
		</div>
	</div>
);

// Empty State Component
const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
	<div className="col-span-full flex flex-col items-center justify-center py-16 space-y-4">
		<div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
			<Search className="w-10 h-10 text-gray-400 dark:text-gray-600" />
		</div>
		<div className="text-center space-y-2">
			<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
				Шалгалт олдсонгүй
			</h3>
			<p className="text-gray-500 dark:text-gray-400 max-w-md">
				{searchTerm
					? `&ldquo;${searchTerm}&rdquo; гэсэн хайлтаар шалгалт олдсонгүй. Өөр түлхүүр үг ашиглаж үзнэ үү.`
					: "Энэ категорид шалгалт байхгүй байна."}
			</p>
		</div>
	</div>
);

// Category Badge Component
interface CategoryBadgeProps {
	active: boolean;
	onClick: () => void;
	count: number;
	label: string;
	variant: ExamCategory;
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
				case "active":
					return "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/30";
				case "upcoming":
					return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-2 border-amber-500 shadow-lg shadow-amber-500/30";
				case "free":
					return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-2 border-cyan-500 shadow-lg shadow-cyan-500/30";
				case "paid":
					return "bg-gradient-to-r from-rose-500 to-red-500 text-white border-2 border-rose-500 shadow-lg shadow-rose-500/30";
				case "expired":
					return "bg-gradient-to-r from-gray-500 to-slate-500 text-white border-2 border-gray-500 shadow-lg shadow-gray-500/30";
				default:
					return "";
			}
		};

		return (
			<Button
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
