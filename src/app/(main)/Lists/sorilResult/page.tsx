"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Award,
	CheckCircle,
	Eye,
	EyeOff,
	FileQuestion,
	TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSorilFilterdresultlists, getTestFilter } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SorilresultListResponseType } from "@/types/soril/sorilResultLists";
import ExamResultCard from "./card";

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
	const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
	const [globalShowScore, setGlobalShowScore] = useState(false);

	// Fetch lesson filter options
	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
	});

	// Auto-select "Бүгд" (lesson_id: 0) when lessons are loaded
	useEffect(() => {
		if (lessonData?.RetData && selectedLessonId === null) {
			setSelectedLessonId(0);
		}
	}, [lessonData, selectedLessonId]);

	// Fetch exam results - uses API filtering based on selected lesson
	const { data, isLoading } = useQuery<SorilresultListResponseType>({
		queryKey: ["examResults", userId, selectedLessonId],
		queryFn: async (): Promise<SorilresultListResponseType> => {
			return getSorilFilterdresultlists(userId || 0, selectedLessonId || 0);
		},
		enabled: !!userId && selectedLessonId !== null,
		staleTime: 2 * 60 * 1000,
	});

	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);
	const exams = useMemo(() => data?.RetData || [], [data]);

	// Calculate stats
	const finishedExams = useMemo(
		() => exams.filter((e) => e.isfinished === 1),
		[exams],
	);

	const avgScore = useMemo(
		() =>
			finishedExams.length > 0
				? Math.round(
						finishedExams.reduce((sum, e) => sum + e.test_perc, 0) /
							finishedExams.length,
					)
				: 0,
		[finishedExams],
	);

	const highScore = useMemo(
		() =>
			finishedExams.length > 0
				? Math.max(...finishedExams.map((e) => e.test_perc))
				: 0,
		[finishedExams],
	);

	const hasApiError = useMemo(
		() => !data?.RetResponse?.ResponseType,
		[data?.RetResponse?.ResponseType],
	);

	const selectedLessonName = useMemo(
		() => lessons.find((l) => l.lesson_id === selectedLessonId)?.lesson_name,
		[lessons, selectedLessonId],
	);

	// Loading state
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
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
		);
	}

	return (
		<TooltipProvider>
			<div className="h-full flex flex-col">
				<div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
					{/* Header */}
					<header className="flex items-center justify-between animate-in fade-in-0 slide-in-from-top-4 duration-500">
						<div className="text-start">
							<h3 className="text-lg sm:text-2xl font-extrabold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
								Сорилын үр дүн
							</h3>
						</div>

						{finishedExams.length > 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setGlobalShowScore(!globalShowScore)}
										className="h-8 text-xs gap-2 shadow-sm hover:shadow-md transition-all"
									>
										{globalShowScore ? (
											<>
												<EyeOff className="w-3.5 h-3.5" />
												Оноо нуух
											</>
										) : (
											<>
												<Eye className="w-3.5 h-3.5" />
												Оноо харуулах
											</>
										)}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>
										{globalShowScore
											? "Үр дүнгийн статистик нуух"
											: "Үр дүнгийн статистик харуулах"}
									</p>
								</TooltipContent>
							</Tooltip>
						)}
					</header>

					{/* Stats Section */}
					{finishedExams.length > 0 && globalShowScore && (
						<div className="animate-in fade-in-0 slide-in-from-top-2 duration-500">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<Tooltip>
									<TooltipTrigger asChild>
										<Card className="border-none shadow-md bg-linear-to-br from-blue-500 to-blue-600 text-white overflow-hidden group hover:shadow-lg transition-all duration-300">
											<CardContent className="p-4 relative">
												<div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
												<div className="relative flex items-center gap-3">
													<div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
														<CheckCircle className="w-5 h-5" />
													</div>
													<div className="flex-1 min-w-0">
														<div className="text-2xl font-bold mb-0.5">
															{finishedExams.length}
														</div>
														<div className="text-xs opacity-90">
															Дууссан сорил
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									</TooltipTrigger>
									<TooltipContent>
										<p>Таны бүрэн гүйцэтгэсэн сорилын тоо</p>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<Card className="border-none shadow-md bg-linear-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden group hover:shadow-lg transition-all duration-300">
											<CardContent className="p-4 relative">
												<div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
												<div className="relative flex items-center gap-3">
													<div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
														<TrendingUp className="w-5 h-5" />
													</div>
													<div className="flex-1 min-w-0">
														<div className="text-2xl font-bold mb-0.5">
															{avgScore}%
														</div>
														<div className="text-xs opacity-90">
															Дундаж үр дүн
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									</TooltipTrigger>
									<TooltipContent>
										<p>
											Таны бүх сорилын дундаж амжилт: {finishedExams.length}{" "}
											сорил
										</p>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<Card className="border-none shadow-md bg-linear-to-br from-amber-500 to-orange-500 text-white overflow-hidden group hover:shadow-lg transition-all duration-300">
											<CardContent className="p-4 relative">
												<div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
												<div className="relative flex items-center gap-3">
													<div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
														<Award className="w-5 h-5" />
													</div>
													<div className="flex-1 min-w-0">
														<div className="text-2xl font-bold mb-0.5">
															{highScore}%
														</div>
														<div className="text-xs opacity-90">
															Хамгийн өндөр
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									</TooltipTrigger>
									<TooltipContent>
										<p>Таны хамгийн өндөр оноо</p>
									</TooltipContent>
								</Tooltip>
							</div>
						</div>
					)}

					{/* Lesson Filter Section */}
					{lessons.length > 0 && (
						<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
							<div className="flex items-center gap-3 pb-2">
								{/* Desktop - Horizontal buttons */}
								<div className="hidden md:flex gap-2 flex-wrap">
									{lessons.map((lesson) => (
										<Tooltip key={lesson.lesson_id}>
											<TooltipTrigger asChild>
												<Button
													type="button"
													onClick={() => setSelectedLessonId(lesson.lesson_id)}
													variant={
														selectedLessonId === lesson.lesson_id
															? "default"
															: "outline"
													}
													className={cn(
														"px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
														selectedLessonId === lesson.lesson_id &&
															"shadow-lg",
													)}
												>
													{lesson.lesson_name}
												</Button>
											</TooltipTrigger>
										</Tooltip>
									))}
								</div>

								{/* Mobile - Select dropdown */}
								<select
									value={selectedLessonId ?? ""}
									onChange={(e) => setSelectedLessonId(Number(e.target.value))}
									className="md:hidden flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-background border-2 border-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
									aria-label="Хичээл сонгох"
								>
									{lessons.map((lesson) => (
										<option key={lesson.lesson_id} value={lesson.lesson_id}>
											{lesson.lesson_name}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					{/* Results Section */}
					<div className="animate-in fade-in-0 duration-700 delay-300">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<h2 className="text-lg font-extrabold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
										{selectedLessonId === 0
											? "Сорилууд"
											: `${selectedLessonName || ""} - Сорилууд`}
									</h2>
								</div>
								<Badge
									variant="secondary"
									className="text-sm font-semibold shadow-sm"
								>
									{exams.length} сорил
								</Badge>
							</div>
						</CardHeader>

						<CardContent className="p-6 space-y-5">
							{/* Exam Grid or Empty State */}
							{exams.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
									{exams.map((exam, index) => (
										<div
											key={exam.exam_id}
											className="animate-in fade-in-0 slide-in-from-bottom-4"
											style={{
												animationDelay: `${index * 50}ms`,
												animationFillMode: "both",
											}}
										>
											<ExamResultCard
												exam={exam}
												index={index}
												globalShowScore={globalShowScore}
											/>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
										<FileQuestion className="w-8 h-8 text-muted-foreground" />
									</div>
									<h3 className="text-lg font-semibold text-foreground mb-2">
										{hasApiError ? "Сорил олдсонгүй" : "Сорил байхгүй байна"}
									</h3>
									<p className="text-sm text-muted-foreground max-w-sm">
										{hasApiError
											? "Үр дүн татахад алдаа гарлаа. Дахин оролдоно уу."
											: selectedLessonId === 0
												? "Танд одоогоор сорилын үр дүн байхгүй байна."
												: `${selectedLessonName || "Энэ хичээл"}-д сорилын үр дүн байхгүй байна.`}
									</p>
								</div>
							)}
						</CardContent>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}
