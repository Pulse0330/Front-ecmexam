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
				<div className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						Сорилын жагсаалт
					</h1>
					<p className="text-muted-foreground text-lg">
						Өөрийн мэдлэгээ турших сорилуудаа сонгоно уу
					</p>
				</div>

				{/* Статистик */}
				{stats && (
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
						<Card className="hover:shadow-lg transition-shadow duration-300 border-primary/20">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Нийт</p>
										<p className="text-3xl font-bold">{stats.total}</p>
									</div>
									<div className="bg-blue-500/10 p-3 rounded-full">
										<BookOpen className="w-8 h-8 text-blue-500" />
									</div>
								</div>
							</CardContent>
						</Card>
						<Card className="hover:shadow-lg transition-shadow duration-300 border-green-500/20">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">
											Дууссан
										</p>
										<p className="text-3xl font-bold text-green-600">
											{stats.completed}
										</p>
									</div>
									<div className="bg-green-500/10 p-3 rounded-full">
										<TrendingUp className="w-8 h-8 text-green-500" />
									</div>
								</div>
							</CardContent>
						</Card>
						<Card className="hover:shadow-lg transition-shadow duration-300 border-muted/50 col-span-2 md:col-span-1">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground mb-1">
											Эхлээгүй
										</p>
										<p className="text-3xl font-bold text-muted-foreground">
											{stats.notStarted}
										</p>
									</div>
									<div className="bg-muted/50 p-3 rounded-full">
										<FilterIcon className="w-8 h-8 text-muted-foreground" />
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Хайлт ба Шүүлтүүр */}
				<Card className="mb-8 shadow-md">
					<CardContent className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Хайлт */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
								<Input
									placeholder="Сорил хайх..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 h-11"
								/>
							</div>

							{/* Төлвөөр шүүх */}
							<Select value={selectedStatus} onValueChange={setSelectedStatus}>
								<SelectTrigger className="h-11">
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

						{/* Шүүлт цэвэрлэх */}
						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="mt-4 hover:bg-destructive/10 hover:text-destructive"
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
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{[1, 2, 3, 4, 5, 6].map((i) => (
									<Card key={i} className="overflow-hidden">
										<Skeleton className="h-48 w-full" />
										<CardContent className="p-5 space-y-3">
											<Skeleton className="h-6 w-20" />
											<Skeleton className="h-5 w-full" />
											<Skeleton className="h-5 w-3/4" />
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-2/3" />
											<Skeleton className="h-11 w-full mt-4" />
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Алдаа */}
				{error && (
					<Alert variant="destructive" className="mb-6">
						<AlertDescription className="flex items-center gap-2">
							<span className="text-lg">❌</span>
							Алдаа гарлаа. Дахин оролдоно уу.
						</AlertDescription>
					</Alert>
				)}

				{/* Сорилын жагсаалт */}
				{filteredData.length > 0 && groupedExams && (
					<div className="space-y-10">
						{Object.entries(groupedExams).map(([planName, exams]) => (
							<section key={planName}>
								<div className="mb-6 flex items-center gap-3 pb-3 border-b-2 border-primary/20">
									<div className="bg-primary/10 p-2 rounded-lg">
										<BookOpen className="w-6 h-6 text-primary" />
									</div>
									<h2 className="text-2xl font-semibold">{planName}</h2>
									<span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
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
