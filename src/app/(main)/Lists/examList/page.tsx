"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	BookOpen,
	DollarSign,
	Search,
	Sparkles,
	X,
	Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useServerTime } from "@/hooks/useServerTime";
import { getexamfiltertlists, getTestFilter } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	ApiExamlistsResponse,
	ExamlistsData,
} from "@/types/exam/examList";
import ExamCard from "./examcard";

type ExamCategory = "all" | "active" | "upcoming" | "free" | "paid" | "expired";

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

export default function ExamListPage() {
	const { userId } = useAuthStore();
	const { currentTime, isLoading: isTimeLoading } = useServerTime();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<ExamCategory>("all");
	const [selectedLessonId, setSelectedLessonId] = useState<number>(0); // 0 = Бүгд

	// Lesson filter API - хичээлийн жагсаалт
	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	// Exam list API - сонгосон хичээлээр шүүсэн шалгалтууд
	const { data: queryData, isPending } = useQuery<ApiExamlistsResponse>({
		queryKey: ["examlists", userId, selectedLessonId],
		queryFn: () => getexamfiltertlists(userId || 0, selectedLessonId),
		enabled: !!userId,
	});

	const data = useMemo(() => queryData?.RetData || [], [queryData]);
	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);

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

	// Server time ашиглан category-д зөв ангилах
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
				const canAccess =
					exam.ispurchased === 1 || exam.ispaydescr === "Төлбөргүй";
				return now >= start && canAccess && exam.flag !== 3;
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
				return exam.flag === 3 || exam.flag_name === "Хугацаа дууссан";
			}),

			now,
		};
	}, [uniqueData, currentTime]);

	// Filter логик: Category + Search (Lesson нь API-аас шууд ирнэ)
	const filteredData = useMemo(() => {
		let exams: ExamlistsData[] = [];

		// 1. Сонгосон категорийн дагуу шүүх
		switch (selectedCategory) {
			case "all":
				exams = uniqueData;
				break;
			case "active":
				exams = categorizedData.active;
				break;
			case "upcoming":
				exams = categorizedData.upcoming;
				break;
			case "free":
				exams = categorizedData.free;
				break;
			case "paid":
				exams = categorizedData.paid;
				break;
			case "expired":
				exams = categorizedData.expired;
				break;
			default:
				exams = uniqueData;
		}

		// 2. Хайлтын шүүлтүүр
		if (searchTerm.trim()) {
			exams = exams.filter((exam) =>
				exam.title.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		return exams;
	}, [uniqueData, categorizedData, selectedCategory, searchTerm]);

	const clearSearch = () => setSearchTerm("");

	if (isTimeLoading) {
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
						Шалгалтын жагсаалт
					</h1>
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
							placeholder="Шалгалтын нэрээр хайх..."
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
								count: uniqueData.length,
							},
							{
								key: "active",
								label: "Идэвхтэй",
								icon: <Zap size={14} />,
								count: categorizedData.active.length,
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
								icon: <X size={14} />,
								count: categorizedData.expired.length,
							},
						].map((cat) => (
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

				{/* Lesson Filter - Хичээлийн сонголт */}
				<div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
					<div className="flex items-center gap-2 shrink-0">
						<BookOpen className="text-gray-500 dark:text-gray-400" size={18} />
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Хичээл:
						</span>
					</div>
					<div className="flex gap-2 flex-wrap">
						{lessons.map((lesson) => (
							<Button
								key={lesson.lesson_id}
								type="button"
								onClick={() => setSelectedLessonId(lesson.lesson_id)}
								className={cn(
									"px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap hover:scale-3d",
									selectedLessonId === lesson.lesson_id
										? "bg-linear-to-r from-blue-500 to-blue-500 shadow-lg shadow-purple-500/30"
										: "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700",
								)}
								aria-label={`${lesson.lesson_name} хичээл сонгох`}
								aria-pressed={selectedLessonId === lesson.lesson_id}
							>
								{lesson.lesson_name}
							</Button>
						))}
					</div>
				</div>

				{/* Results Info */}
				{(searchTerm || selectedLessonId !== 0) && (
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<AlertCircle size={16} />
						<span>
							<strong>{filteredData.length}</strong> шалгалт олдлоо
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

				{/* Exam Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 items-stretch">
					{isPending
						? skeletonIds.map((id) => <SkeletonCard key={id} />)
						: filteredData.map((exam, index) => (
								<ExamCard key={exam.exam_id} exam={exam} index={index} />
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
							Шалгалт олдсонгүй
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Өөр хайлт эсвэл шүүлтүүр ашиглан дахин оролдоно уу
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
