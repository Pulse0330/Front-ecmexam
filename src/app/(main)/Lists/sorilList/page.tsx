"use client";

import { useQuery } from "@tanstack/react-query";
import {
	BookOpen,
	Filter as FilterIcon,
	Search,
	TrendingUp,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	ApiSorillistsResponse,
	SorillistsData,
} from "@/types/soril/sorilLists";
import { SorilCard } from "./sorilcard";

export default function SorilListPage() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
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

	// Статистик тооцоолох
	const stats = useMemo(() => {
		if (!queryData?.RetData) return null;

		const total = queryData.RetData.length;
		const completed = queryData.RetData.filter(
			(e) => e.isguitset === 1 && e.test_resid > 0,
		).length;
		const notStarted = queryData.RetData.filter(
			(e) => e.isguitset === 0 && e.test_resid === 0,
		).length;

		return { total, completed, notStarted };
	}, [queryData]);

	// Төлөвлөгөөний жагсаалт
	const planNames = useMemo(() => {
		if (!queryData?.RetData) return [];
		return Array.from(new Set(queryData.RetData.map((e) => e.plan_name)));
	}, [queryData]);

	// Шүүлт хийх
	const filteredData = useMemo(() => {
		if (!queryData?.RetData) return [];

		let filtered = [...queryData.RetData];

		// Хайлтаар шүүх
		if (searchQuery) {
			filtered = filtered.filter(
				(exam) =>
					exam.soril_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					exam.plan_name.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		// Төлвөөр шүүх
		if (selectedStatus !== "all") {
			if (selectedStatus === "completed") {
				filtered = filtered.filter(
					(e) => e.isguitset === 1 && e.test_resid > 0,
				);
			} else if (selectedStatus === "notstarted") {
				filtered = filtered.filter(
					(e) => e.isguitset === 0 && e.test_resid === 0,
				);
			}
		}

		// Төлөвлөгөөгөөр шүүх
		if (selectedPlan !== "all") {
			filtered = filtered.filter((e) => e.plan_name === selectedPlan);
		}

		return filtered;
	}, [queryData, searchQuery, selectedStatus, selectedPlan]);

	// Бүлэглэх
	const groupedExams = useMemo(() => {
		return filteredData.reduce<Record<string, SorillistsData[]>>(
			(acc, exam) => {
				const planName = exam.plan_name;
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

	return (
		<div className="min-h-screen bg-gradient-page p-4 md:p-6">
			<div className="max-w-7xl mx-auto">
				{/* Гарчиг */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold mb-2">Сорилын жагсаалт</h1>
					<p className="text-muted-foreground">
						Өөрийн мэдлэгээ турших сорилуудаа сонгоно уу
					</p>
				</div>

				{/* Статистик */}
				{stats && (
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Нийт</p>
										<p className="text-2xl font-bold">{stats.total}</p>
									</div>
									<BookOpen className="w-8 h-8 text-blue-500" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Дууссан</p>
										<p className="text-2xl font-bold text-green-600">
											{stats.completed}
										</p>
									</div>
									<TrendingUp className="w-8 h-8 text-green-500" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">Эхлээгүй</p>
										<p className="text-2xl font-bold text-muted-foreground">
											{stats.notStarted}
										</p>
									</div>
									<FilterIcon className="w-8 h-8 text-muted-foreground" />
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Хайлт ба Шүүлтүүр */}
				<Card className="mb-6">
					<CardContent className="p-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Хайлт */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<Input
									placeholder="Сорил хайх..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>

							{/* Төлвөөр шүүх */}
							<Select value={selectedStatus} onValueChange={setSelectedStatus}>
								<SelectTrigger>
									<SelectValue placeholder="Бүх төлөв" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Бүх төлөв</SelectItem>
									<SelectItem value="notstarted">Эхлээгүй</SelectItem>
									<SelectItem value="completed">Дууссан</SelectItem>
								</SelectContent>
							</Select>

							{/* Төлөвлөгөөгөөр шүүх */}
							<Select value={selectedPlan} onValueChange={setSelectedPlan}>
								<SelectTrigger>
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

						{/* Шүүлт цэвэрлэх */}
						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="mt-4"
							>
								<X className="w-4 h-4 mr-2" />
								Шүүлтийг цэвэрлэх
							</Button>
						)}
					</CardContent>
				</Card>

				{/* Ачаалж байна */}
				{isPending && (
					<div className="space-y-8">
						<div className="space-y-4">
							<Skeleton className="h-8 w-64" />
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<Card key={i}>
										<Skeleton className="h-40" />
										<CardContent className="p-5 space-y-3">
											<Skeleton className="h-6 w-20" />
											<Skeleton className="h-5 w-full" />
											<Skeleton className="h-5 w-3/4" />
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-2/3" />
											<Skeleton className="h-10 w-full" />
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Алдаа */}
				{error && (
					<Alert variant="destructive">
						<AlertDescription>
							❌ Алдаа гарлаа. Дахин оролдоно уу.
						</AlertDescription>
					</Alert>
				)}

				{/* Сорилын жагсаалт */}
				{filteredData.length > 0 && groupedExams && (
					<div className="space-y-8">
						{Object.entries(groupedExams).map(([planName, exams]) => (
							<section key={planName}>
								<div className="mb-4 flex items-center gap-3">
									<BookOpen className="w-6 h-6 text-primary" />
									<h2 className="text-xl font-semibold">{planName}</h2>
									<span className="text-sm text-muted-foreground">
										({exams.length} сорил)
									</span>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{exams.map((exam) => (
										<Button
											type="button"
											key={exam.exam_id}
											onClick={() => handleExamClick(exam.exam_id)}
											className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg text-left w-full p-0 border-0 bg-transparent"
										>
											<SorilCard exam={exam} />
										</Button>
									))}
								</div>
							</section>
						))}
					</div>
				)}

				{/* Хоосон төлөв */}
				{!isPending && filteredData.length === 0 && (
					<div className="text-center py-12">
						<BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
						<p className="text-lg mb-2">
							{hasActiveFilters ? "Илэрц олдсонгүй" : "Сорил олдсонгүй"}
						</p>
						{hasActiveFilters && (
							<Button variant="link" onClick={clearFilters}>
								Шүүлтийг цэвэрлэх
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
