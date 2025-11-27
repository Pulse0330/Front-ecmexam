"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, CheckCircle, Clock, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
// ✅ АЛДААГ ЗАСАХ ИМПОРТУУД: Alert, AlertDescription
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// ✅ АЛДААГ ЗАСАХ ИМПОРТУУД: Select, SelectContent, SelectItem, SelectTrigger, SelectValue
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
	// State-ийг String-ээс SorilCategory руу өөрчилсөн
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

	// Төлөвлөгөөний жагсаалт
	const planNames = useMemo(() => {
		if (!queryData?.RetData) return [];
		return Array.from(
			new Set(queryData.RetData.map((e) => e.plan_name || "Төлөвлөгөөгүй")), // null plan_name-ийг "Төлөвлөгөөгүй" болгосон
		);
	}, [queryData]);

	// Статистик болон Ангилал
	const categorizedData = useMemo(() => {
		if (!queryData?.RetData)
			return {
				total: 0,
				completed: [],
				notstarted: [],
			};

		const allData = queryData.RetData;

		const completed = allData.filter(
			(e) => e.isguitset === 1 && e.test_resid > 0,
		);
		const notstarted = allData.filter(
			(e) => e.isguitset === 0 && e.test_resid === 0,
		);

		return {
			total: allData.length,
			completed,
			notstarted,
		};
	}, [queryData]);

	// Шүүлт хийх
	const filteredData = useMemo(() => {
		if (!queryData?.RetData) return [];

		let filtered: SorillistsData[] = [...queryData.RetData];

		// Төлөвөөр шүүх (Filter Badges ашиглана)
		if (selectedStatus !== "all") {
			filtered = categorizedData[selectedStatus];
		}

		// Хайлтаар шүүх
		if (searchQuery) {
			filtered = filtered.filter(
				(exam) =>
					exam.soril_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					(exam.plan_name || "Төлөвлөгөөгүй")
						.toLowerCase()
						.includes(searchQuery.toLowerCase()),
			);
		}

		// Төлөвлөгөөгөөр шүүх
		if (selectedPlan !== "all") {
			filtered = filtered.filter(
				(e) => (e.plan_name || "Төлөвлөгөөгүй") === selectedPlan,
			);
		}

		return filtered;
	}, [queryData, searchQuery, selectedStatus, selectedPlan, categorizedData]);

	// Бүлэглэх
	const groupedExams = useMemo(() => {
		return filteredData.reduce<Record<string, SorillistsData[]>>(
			(acc, exam) => {
				const planName = exam.plan_name || "Төлөвлөгөөгүй"; // null-ийг "Төлөвлөгөөгүй" болгосон
				if (!acc[planName]) acc[planName] = [];
				acc[planName].push(exam);
				return acc;
			},
			{},
		);
	}, [filteredData]);

	// Шүүлт цэвэрлэх
	const clearFilters = () => {
		setSearchQuery("");
		setSelectedStatus("all");
		setSelectedPlan("all");
	};

	const hasActiveFilters =
		searchQuery || selectedStatus !== "all" || selectedPlan !== "all";

	const handleExamClick = (examId: number) => {
		router.push(`/soril/${examId}`);
	};

	const categoryBadges = [
		{
			key: "all",
			label: "Бүгд",
			icon: <BookOpen size={14} />,
			count: queryData?.RetData?.length || 0,
			variant: "all",
		},
		{
			key: "notstarted",
			label: "Эхлээгүй",
			icon: <Clock size={14} />,
			count: categorizedData.notstarted.length,
			variant: "notstarted",
		},
		{
			key: "completed",
			label: "Дууссан",
			icon: <CheckCircle size={14} />,
			count: categorizedData.completed.length,
			variant: "completed",
		},
	] as const;

	return (
		<div className="min-h-screen bg-gradient-page p-4 md:p-6">
			<div className="max-w-7xl mx-auto">
				{/* Гарчиг */}
				<div className="mb-8 text-center space-y-1">
					<h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Сорилын жагсаалт
					</h1>
					<p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
						Өөрийн мэдлэгээ турших сорилуудаа сонгоно уу
					</p>
				</div>

				{/* Хайлт ба Шүүлтүүр (ExamListPage загварт оруулсан) */}
				<Card className="mb-8 shadow-md">
					<CardContent className="p-6">
						<div className="flex flex-col md:flex-row items-start justify-between gap-6">
							{/* Хайлт */}
							<div className="relative w-full md:w-1/3">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
								<Input
									placeholder="Сорил хайх..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 h-11"
								/>
							</div>

							{/* Төлөвлөгөөгөөр шүүх (Select) */}
							<div className="w-full md:w-1/3">
								<Select value={selectedPlan} onValueChange={setSelectedPlan}>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Бүх төлөвлөгөө" />
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
							</div>

							{/* Төлвөөр шүүх (Filter Badges) */}
							<div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-fit">
								{categoryBadges.map((cat) => (
									<CategoryBadge
										key={cat.key}
										active={selectedStatus === cat.key}
										onClick={() => setSelectedStatus(cat.key as SorilCategory)}
										count={cat.count}
										label={cat.label}
										icon={cat.icon}
										variant={cat.key}
									/>
								))}
							</div>
						</div>

						{/* Шүүлт цэвэрлэх */}
						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="mt-4 hover:bg-destructive/10 hover:text-destructive text-sm"
							>
								<X className="w-4 h-4 mr-2" />
								Шүүлтийг цэвэрлэх ({filteredData.length} олдлоо)
							</Button>
						)}
					</CardContent>
				</Card>

				{/* Ачаалж байна (Skeleton) */}
				{isPending && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Card key={i} className="overflow-hidden">
								<Skeleton className="h-48 w-full" />
								<CardContent className="p-5 space-y-3">
									<Skeleton className="h-6 w-20" />
									<Skeleton className="h-5 w-full" />
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-11 w-full mt-4" />
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Алдаа */}
				{error && (
					<div className="text-center">
						<Alert variant="destructive" className="mb-6 max-w-lg mx-auto">
							<AlertDescription className="flex items-center gap-2">
								<span className="text-lg">❌</span>
								Алдаа гарлаа. Сорилын жагсаалтыг татаж чадсангүй.
							</AlertDescription>
						</Alert>
					</div>
				)}

				{/* Сорилын жагсаалт */}
				{!isPending && filteredData.length > 0 && groupedExams && (
					<div className="space-y-10">
						{Object.entries(groupedExams).map(([planName, exams]) => (
							<section key={planName}>
								<div className="mb-6 flex items-center gap-3 pb-3 border-b-2 border-primary/20">
									<h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
										{planName}
									</h2>
									<span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-medium">
										{exams.length} сорил
									</span>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{exams.map((exam) => (
										<div key={exam.exam_id}>
											<SorilCard
												exam={exam}
												onClick={() => handleExamClick(exam.exam_id)}
											/>
										</div>
									))}
								</div>
							</section>
						))}
					</div>
				)}

				{/* Хоосон төлөв */}
				{!isPending && filteredData.length === 0 && (
					<div className="text-center py-16">
						<div className="bg-muted/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
							<BookOpen className="w-12 h-12 text-muted-foreground" />
						</div>
						<p className="text-xl font-semibold mb-2">
							{hasActiveFilters ? "Илэрц олдсонгүй" : "Сорил олдсонгүй"}
						</p>
						<p className="text-muted-foreground mb-4">
							{hasActiveFilters
								? "Өөр шүүлтүүр ашиглан үзнэ үү"
								: "Одоогоор сорил байхгүй байна"}
						</p>
						{hasActiveFilters && (
							<Button variant="outline" onClick={clearFilters}>
								<X className="w-4 h-4 mr-2" />
								Шүүлтийг цэвэрлэх
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

// ----------------------------------------------------------------------
// 🏆 Шинэ: Category Badge Component (ExamListPage-ээс авсан загвар)
// ----------------------------------------------------------------------

interface CategoryBadgeProps {
	active: boolean;
	onClick: () => void;
	count: number;
	label: string;
	variant: SorilCategory | "all"; // Variant-г тодорхойлно
	icon?: React.ReactNode;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = React.memo(
	function CategoryBadge({ active, onClick, count, label, variant, icon }) {
		const getStyle = () => {
			if (!active)
				return "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700";

			// ExamListPage-тэй ижил загваруудыг ашигласан
			switch (variant) {
				case "all":
					return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-2 border-blue-500 shadow-lg shadow-blue-500/30";
				case "notstarted":
					// Upcoming/Clock-той ижил загвар
					return "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-2 border-amber-500 shadow-lg shadow-amber-500/30";
				case "completed":
					// Active/Check-тэй ижил загвар
					return "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/30";
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
					"h-11", // Select-тэй ижил өндөр
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
