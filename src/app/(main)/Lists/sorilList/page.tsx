"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSorilFilteredlists, getTestFilter } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	ApiSorillistsResponse,
	SorillistsData,
} from "@/types/soril/sorilLists";
import { SorilCard } from "./sorilcard";

type SorilCategory = "all" | "completed" | "notstarted";

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

export default function Sorillists() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [searchTerm, _setSearchTerm] = useState("");
	const [selectedCategory, _setSelectedCategory] =
		useState<SorilCategory>("all");
	const [selectedLessonId, setSelectedLessonId] = useState<number>(0); // 0 = Бүгд
	const SKELETON_KEYS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);

	// Lesson filter API - хичээлийн жагсаалт
	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	// Soril list API - сонгосон хичээлээр шүүсэн сорилууд
	const { data: queryData, isPending } = useQuery<ApiSorillistsResponse>({
		queryKey: ["sorillists", userId, selectedLessonId],
		queryFn: () => getSorilFilteredlists(userId || 0, selectedLessonId),
		enabled: !!userId,
	});

	const data = useMemo(() => queryData?.RetData || [], [queryData]);
	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);

	const _skeletonIds = [1, 2, 3, 4, 5, 6];

	const categorizedData = useMemo(() => {
		return {
			completed: data.filter((e) => e.isguitset === 1),
			notstarted: data.filter((e) => e.isguitset === 0),
		};
	}, [data]);

	// Filter логик: Category + Search (Lesson нь API-аас шууд ирнэ)
	const filteredData = useMemo(() => {
		let sorils = data;

		// 1. Сонгосон категорийн дагуу шүүх
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

		// 2. Хайлтын шүүлтүүр
		if (searchTerm.trim()) {
			sorils = sorils.filter(
				(soril) =>
					soril.soril_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(soril.plan_name || "")
						.toLowerCase()
						.includes(searchTerm.toLowerCase()),
			);
		}

		return sorils;
	}, [data, categorizedData, selectedCategory, searchTerm]);

	// Handle soril click with payment check
	const handleSorilClick = useCallback(
		(soril: SorillistsData) => {
			// If exam is unpaid (ispay === 0), redirect to payment page
			if (soril.ispay === 0) {
				router.push("/Lists/paymentCoureList");
				return;
			}

			// If exam is paid, go to the exam page
			router.push(`/soril/${soril.exam_id}`);
		},
		[router],
	);

	return (
		<div className="min-h-screen flex flex-col overflow-auto">
			<div className="max-w-[1600px] mx-auto w-full flex flex-col px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				{/* Header */}
				<header className="mb-4 sm:mb-6">
					<h3 className="text-lg sm:text-2xl font-extrabold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent ">
						Сорилын жагсаалт
					</h3>
				</header>

				{/* Lesson Filter - Хичээлийн сонголт */}
				{lessons.length > 0 && (
					<div className="flex items-center gap-3 pb-2">
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
											? ""
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
								if (value) {
									setSelectedLessonId(Number(value));
								}
							}}
							className="md:hidden flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
							aria-label="Хичээл сонгох"
						>
							{lessons.map((lesson) => (
								<option key={lesson.lesson_id} value={lesson.lesson_id}>
									{lesson.lesson_name}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Results Info */}
				{(searchTerm || selectedLessonId !== 0) && (
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
						<AlertCircle size={16} />
						<span>
							<strong>{filteredData.length}</strong> сорил олдлоо
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

				{/* Soril Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 pb-4">
					{isPending
						? SKELETON_KEYS.map((key) => <SkeletonCard key={key} />)
						: filteredData.map((soril) => (
								<SorilCard
									key={soril.exam_id}
									exam={soril}
									onClick={() => handleSorilClick(soril)}
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
							Сорил олдсонгүй
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{searchTerm
								? `"${searchTerm}" хайлтад тохирох сорил олдсонгүй.`
								: selectedLessonId === 0
									? "Танд одоогоор сорил байхгүй байна."
									: `${lessons.find((l) => l.lesson_id === selectedLessonId)?.lesson_name || "Энэ хичээл"}-д сорил байхгүй байна.`}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

// Skeleton Card Component
const SkeletonCard = () => (
	<div className="h-full w-full flex flex-col overflow-hidden rounded-lg sm:rounded-xl border border-border/40 bg-card/50 backdrop-blur-md animate-pulse">
		<div className="w-full aspect-5/2 bg-slate-200 dark:bg-slate-800 relative">
			<div className="absolute top-2 left-2 flex flex-col gap-2">
				<div className="h-5 w-16 bg-slate-300 dark:bg-slate-700 rounded-full" />
			</div>
			<div className="absolute bottom-2 left-2">
				<div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
			</div>
		</div>
		<div className="flex flex-col grow p-2 gap-2">
			<div className="space-y-2">
				<div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
				<div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
			</div>
			<div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between">
				<div className="flex gap-2">
					<div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
				</div>
				<div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800" />
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

const _CategoryBadge: React.FC<CategoryBadgeProps> = React.memo(
	function CategoryBadge({ active, onClick, count, label, variant, icon }) {
		const getStyle = () => {
			if (!active)
				return "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700";

			switch (variant) {
				case "all":
					return "";
				case "notstarted":
					return "";
				case "completed":
					return "";
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
