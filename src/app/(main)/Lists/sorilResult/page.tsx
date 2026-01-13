"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Award,
	BookmarkCheck,
	CheckCircle,
	ChevronDown,
	Eye,
	EyeOff,
	FileQuestion,
	PlayCircle,
	Search,
	TrendingUp,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getSorilresultlists } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SorilresultListResponseType } from "@/types/soril/sorilResultLists";
import ExamResultCard from "./card";

export default function ExamResultList() {
	const { userId } = useAuthStore();

	const [globalShowScore, setGlobalShowScore] = useState(false);
	const [isResultsOpen, setIsResultsOpen] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	const { data, isLoading } = useQuery<SorilresultListResponseType>({
		queryKey: ["examResults", userId],
		queryFn: () => getSorilresultlists(userId || 0),
		enabled: !!userId,
	});

	const isResponseFailed =
		!data?.RetResponse?.ResponseType || data?.RetData === null;
	const exams = data?.RetData || [];

	// Separate ongoing and finished exams
	const ongoingExams = useMemo(() => {
		return exams.filter((e) => e.isfinished === 0);
	}, [exams]);

	const finishedExams = useMemo(() => {
		return exams.filter((e) => e.isfinished === 1);
	}, [exams]);

	// Filter exams based on search query
	const filteredExams = useMemo(() => {
		if (!searchTerm.trim()) return exams;

		const query = searchTerm.toLowerCase();
		return exams.filter((exam) => exam.title?.toLowerCase().includes(query));
	}, [exams, searchTerm]);

	const avgScore =
		finishedExams.length > 0
			? Math.round(
					finishedExams.reduce((sum, e) => sum + e.test_perc, 0) /
						finishedExams.length,
				)
			: 0;
	const highScore =
		finishedExams.length > 0
			? Math.max(...finishedExams.map((e) => e.test_perc))
			: 0;

	const clearSearch = () => setSearchTerm("");

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center space-y-8">
					<div className="relative">
						<div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
						<UseAnimations
							animation={loading2}
							size={80}
							strokeColor="hsl(var(--primary))"
							loop
						/>
					</div>
					<div className="space-y-3 text-center">
						<p className="text-xl font-bold text-foreground animate-pulse">
							Уншиж байна...
						</p>
						<p className="text-sm text-muted-foreground">
							Таны үр дүнг ачааллаж байна
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (isResponseFailed || exams.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Alert className="max-w-md border-none shadow-2xl">
					<div className="flex flex-col items-center text-center space-y-4 py-6">
						<div className="relative">
							<div className="absolute inset-0 bg-blue-800/20 rounded-full" />
							<div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
								<FileQuestion className="w-10 h-10 text-white" />
							</div>
						</div>
						<AlertDescription className="space-y-3">
							<h3 className="text-xl font-bold">Сорилын үр дүн олдсонгүй</h3>
						</AlertDescription>
					</div>
				</Alert>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col overflow-auto">
			<div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				{/* Header */}
				<header className="text-center space-y-1">
					<h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Сорилын үр дүн
					</h1>
					<p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
						Таны хийсэн сорилуудын үр дүн болон статистик
					</p>
				</header>

				{/* Ongoing Exams Alert */}
				{ongoingExams.length > 0 && (
					<Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 animate-in fade-in-0 slide-in-from-top-4 duration-500">
						<PlayCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
						<AlertDescription className="ml-2">
							<span className="font-semibold text-amber-900 dark:text-amber-100">
								{ongoingExams.length} шалгалт явагдаж байна
							</span>
							<span className="text-amber-700 dark:text-amber-300 ml-2">
								- Шалгалтаа дуусгаснаар үр дүн энд харагдана
							</span>
						</AlertDescription>
					</Alert>
				)}

				{/* Stats Section */}
				{finishedExams.length > 0 && (
					<div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
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
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in-0 slide-in-from-top-2 duration-500">
								<Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden group hover:shadow-xl transition-all duration-300">
									<CardContent className="p-6 relative">
										<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
										<div className="relative flex items-center gap-4">
											<div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
												<CheckCircle className="w-7 h-7 text-white" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-3xl font-bold mb-1">
													{finishedExams.length}
												</div>
												<div className="text-sm text-blue-100">
													Дууссан шалгалт
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden group hover:shadow-xl transition-all duration-300">
									<CardContent className="p-6 relative">
										<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
										<div className="relative flex items-center gap-4">
											<div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
												<TrendingUp className="w-7 h-7 text-white" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-3xl font-bold mb-1">
													{avgScore}%
												</div>
												<div className="text-sm text-emerald-100">
													Дундаж үр дүн
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden group hover:shadow-xl transition-all duration-300">
									<CardContent className="p-6 relative">
										<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
										<div className="relative flex items-center gap-4">
											<div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
												<Award className="w-7 h-7 text-white" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-3xl font-bold mb-1">
													{highScore}%
												</div>
												<div className="text-sm text-amber-100">
													Хамгийн өндөр
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						)}
					</div>
				)}

				{/* Results Section */}
				<div className="animate-in fade-in-0 duration-700 delay-300">
					<Collapsible open={isResultsOpen} onOpenChange={setIsResultsOpen}>
						<CardHeader className="px-0">
							<CollapsibleTrigger className="w-full">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="relative">
											<div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full" />
											<div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg transition-transform duration-300 hover:scale-110 hover:rotate-6">
												<BookmarkCheck className="w-7 h-7 text-white" />
											</div>
										</div>
										<h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
											Бүх сорилууд
										</h2>
									</div>
									<div className="flex items-center gap-3">
										<Badge
											variant="secondary"
											className="text-sm font-semibold shadow-sm"
										>
											{exams.length} сорил
										</Badge>
										<ChevronDown
											className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${
												isResultsOpen ? "rotate-180" : ""
											}`}
										/>
									</div>
								</div>
							</CollapsibleTrigger>
						</CardHeader>
						<CollapsibleContent>
							<CardContent className="px-0 space-y-5">
								{/* Search Bar */}
								<div className="relative">
									<Search
										className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
										size={18}
									/>
									<input
										type="text"
										placeholder="Шалгалтын нэр эсвэл хичээлээр хайх..."
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

								{/* Results Count */}
								{searchTerm && (
									<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
										<span className="font-medium">{filteredExams.length}</span>
										<span>үр дүн олдлоо</span>
										{filteredExams.length !== exams.length && (
											<span className="text-gray-400 dark:text-gray-500">
												({exams.length}-аас)
											</span>
										)}
									</div>
								)}

								{/* Exam Grid */}
								{filteredExams.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
										{filteredExams.map((exam, index) => (
											<ExamResultCard
												key={exam.exam_id}
												exam={exam}
												index={index}
												globalShowScore={globalShowScore}
											/>
										))}
									</div>
								) : (
									<div className="flex flex-col items-center justify-center py-16 text-center">
										<div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
											<Search className="w-8 h-8 text-gray-400" />
										</div>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
											Үр дүн олдсонгүй
										</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
											"{searchTerm}" хайлтад тохирох шалгалт олдсонгүй. Өөр
											нэрээр хайж үзнэ үү.
										</p>
									</div>
								)}
							</CardContent>
						</CollapsibleContent>
					</Collapsible>
				</div>
			</div>
		</div>
	);
}
