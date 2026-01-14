"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Award,
	BookOpen,
	CheckCircle,
	Eye,
	EyeOff,
	Search,
	Sparkles,
	TrendingUp,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSorilFilterdresultlists, getTestFilter } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SorilresultListResponseType } from "@/types/soril/sorilResultLists";
import ExamResultCard from "./card";

type ResultCategory = "all" | "finished" | "ongoing";

interface Lesson {
	lesson_id: number;
	lesson_name: string;
	sort: number;
}

interface TestFilterResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: Lesson[];
}

export default function ExamResultList() {
	const { userId } = useAuthStore();
	const _router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<ResultCategory>("all");
	const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
	const [globalShowScore, setGlobalShowScore] = useState(false);

	// Lesson filter API
	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	// Exam results API
	const { data: queryData, isPending } = useQuery<SorilresultListResponseType>({
		queryKey: ["examResults", userId, selectedLessonId],
		queryFn: () =>
			getSorilFilterdresultlists(userId || 0, selectedLessonId || 0),
		enabled: !!userId,
	});

	const data = useMemo(() => queryData?.RetData || [], [queryData]);
	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);

	const skeletonIds = [1, 2, 3, 4, 5, 6];

	const categorizedData = useMemo(() => {
		return {
			finished: data.filter((e) => e.isfinished === 1),
			ongoing: data.filter((e) => e.isfinished === 0),
		};
	}, [data]);

	// Statistics
	const avgScore = useMemo(() => {
		const finished = categorizedData.finished;
		return finished.length > 0
			? Math.round(
					finished.reduce((sum, e) => sum + e.test_perc, 0) / finished.length,
				)
			: 0;
	}, [categorizedData.finished]);

	const highScore = useMemo(() => {
		const finished = categorizedData.finished;
		return finished.length > 0
			? Math.max(...finished.map((e) => e.test_perc))
			: 0;
	}, [categorizedData.finished]);

	// Filter logic
	const filteredData = useMemo(() => {
		let results = data;

		// Category filter
		switch (selectedCategory) {
			case "all":
				results = data;
				break;
			case "finished":
				results = categorizedData.finished;
				break;
			case "ongoing":
				results = categorizedData.ongoing;
				break;
			default:
				results = data;
		}

		// Search filter
		if (searchTerm.trim()) {
			results = results.filter((exam) =>
				exam.title?.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		return results;
	}, [data, categorizedData, selectedCategory, searchTerm]);

	const clearSearch = () => setSearchTerm("");

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-2">
					<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
					<p className="text-gray-600 dark:text-gray-400">Уншиж байна...</p>
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
						Сорилын үр дүн
					</h1>
					<p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
						Таны хийсэн сорилуудын үр дүн болон статистик
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
								key: "finished",
								label: "Дууссан",
								icon: <CheckCircle size={14} />,
								count: categorizedData.finished.length,
							},
							{
								key: "ongoing",
								label: "Явагдаж буй",
								icon: <Sparkles size={14} />,
								count: categorizedData.ongoing.length,
							},
						].map((cat) => (
							<CategoryBadge
								key={cat.key}
								active={selectedCategory === cat.key}
								onClick={() => setSelectedCategory(cat.key as ResultCategory)}
								count={cat.count}
								label={cat.label}
								icon={cat.icon || undefined}
								variant={cat.key as ResultCategory}
							/>
						))}
					</div>
				</div>

				{/* Lesson Filter */}
				{lessons.length > 0 && (
					<div className="flex items-center gap-3 pb-2">
						<div className="flex items-center gap-2 shrink-0">
							<BookOpen
								className="text-gray-500 dark:text-gray-400"
								size={18}
							/>
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Хичээл:
							</span>
						</div>

						{/* Desktop - Horizontal buttons */}
						<div className="hidden md:flex gap-2 flex-nowrap overflow-x-auto scrollbar-thin">
							{lessons.map((lesson) => (
								<Button
									key={lesson.lesson_id}
									type="button"
									onClick={() => setSelectedLessonId(lesson.lesson_id)}
									className={cn(
										"px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0",
										selectedLessonId === lesson.lesson_id
											? "bg-linear-to-r from-blue-500 to-blue-600 text-white border-2 border-blue-500 shadow-lg shadow-blue-500/30"
											: "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600",
									)}
									aria-label={`${lesson.lesson_name} хичээл сонгох`}
									aria-pressed={selectedLessonId === lesson.lesson_id}
								>
									{lesson.lesson_name}
								</Button>
							))}
						</div>

						{/* Mobile - Combobox/Select */}
						<select
							value={selectedLessonId ?? ""}
							onChange={(e) => {
								const value = e.target.value;
								setSelectedLessonId(value ? Number(value) : null);
							}}
							className="md:hidden flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
							aria-label="Хичээл сонгох"
						>
							<option value="">Хичээл сонгох</option>
							{lessons.map((lesson) => (
								<option key={lesson.lesson_id} value={lesson.lesson_id}>
									{lesson.lesson_name}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Statistics Cards */}
				{categorizedData.finished.length > 0 && (
					<div className="space-y-3">
						<div className="flex justify-end">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setGlobalShowScore(!globalShowScore)}
								className="h-9 text-xs gap-2 rounded-full shadow-sm hover:shadow-md transition-all"
							>
								{globalShowScore ? (
									<>
										<EyeOff className="w-3.5 h-3.5" />
										Оноонуудыг нуух
									</>
								) : (
									<>
										<Eye className="w-3.5 h-3.5" />
										Оноонуудыг харуулах
									</>
								)}
							</Button>
						</div>

						{globalShowScore && (
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<StatCard
									icon={<CheckCircle className="w-7 h-7 text-white" />}
									value={categorizedData.finished.length}
									label="Дууссан сорил"
									gradient="from-blue-500 to-blue-600"
								/>
								<StatCard
									icon={<TrendingUp className="w-7 h-7 text-white" />}
									value={`${avgScore}%`}
									label="Дундаж үр дүн"
									gradient="from-emerald-500 to-emerald-600"
								/>
								<StatCard
									icon={<Award className="w-7 h-7 text-white" />}
									value={`${highScore}%`}
									label="Хамгийн өндөр"
									gradient="from-amber-500 to-orange-600"
								/>
							</div>
						)}
					</div>
				)}

				{/* Results Info */}
				{(searchTerm || selectedLessonId !== 0) && (
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<AlertCircle size={16} />
						<span>
							<strong>{filteredData.length}</strong> үр дүн олдлоо
							{searchTerm && (
								<>
									{" "}
									&ldquo;<strong>{searchTerm}</strong>&rdquo; гэсэн хайлтаар
								</>
							)}
							{selectedLessonId !== 0 && (
								<>
									{" "}
									<strong>
										{
											lessons.find((l) => l.lesson_id === selectedLessonId)
												?.lesson_name
										}
									</strong>{" "}
									хичээлд
								</>
							)}
						</span>
					</div>
				)}

				{/* Results Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 items-stretch">
					{isPending
						? skeletonIds.map((id) => <SkeletonCard key={id} />)
						: filteredData.map((exam, index) => (
								<ExamResultCard
									key={exam.exam_id}
									exam={exam}
									index={index}
									globalShowScore={globalShowScore}
								/>
							))}
				</div>

				{/* Empty State */}
				{!isPending && filteredData.length === 0 && (
					<div className="text-center py-12 space-y-3">
						<AlertCircle
							className="mx-auto text-gray-400 dark:text-gray-600"
							size={48}
						/>
						<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
							Үр дүн олдсонгүй
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{searchTerm
								? `"${searchTerm}" хайлтад тохирох үр дүн олдсонгүй.`
								: selectedLessonId === 0
									? "Та одоогоор ямар ч сорил өгөөгүй байна."
									: `${lessons.find((l) => l.lesson_id === selectedLessonId)?.lesson_name || "Энэ хичээл"}-д үр дүн байхгүй байна.`}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

// Skeleton Card Component
const SkeletonCard = () => (
	<div className="h-[430px] w-full flex flex-col overflow-hidden rounded-[28px] border border-border/40 bg-card/50 backdrop-blur-md animate-pulse">
		<div className="h-40 w-full bg-slate-200 dark:bg-slate-800 relative">
			<div className="absolute top-4 left-4 flex flex-col gap-2">
				<div className="h-6 w-20 bg-slate-300 dark:bg-slate-700 rounded-full" />
				<div className="h-6 w-24 bg-slate-300 dark:bg-slate-700 rounded-full" />
			</div>
		</div>
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

// Stat Card Component
interface StatCardProps {
	icon: React.ReactNode;
	value: number | string;
	label: string;
	gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({
	icon,
	value,
	label,
	gradient,
}) => (
	<Card
		className={cn(
			"border-none shadow-lg text-white overflow-hidden group hover:shadow-xl transition-all duration-300 bg-linear-to-br",
			gradient,
		)}
	>
		<CardContent className="p-6 relative">
			<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
			<div className="relative flex items-center gap-4">
				<div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
					{icon}
				</div>
				<div className="flex-1 min-w-0">
					<div className="text-3xl font-bold mb-1">{value}</div>
					<div className="text-sm opacity-90">{label}</div>
				</div>
			</div>
		</CardContent>
	</Card>
);

// Category Badge Component
interface CategoryBadgeProps {
	active: boolean;
	onClick: () => void;
	count: number;
	label: string;
	variant: ResultCategory;
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
				case "finished":
					return "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/30";
				case "ongoing":
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
