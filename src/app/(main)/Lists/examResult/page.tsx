"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Award,
	CheckCircle,
	ChevronDown,
	Eye,
	EyeOff,
	FileQuestion,
	Search,
	TrendingUp,
	X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	getexamFinishFiltertLists,
	getexamresultlists,
	getTestFilter,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamresultListResponseType } from "@/types/exam/examResultList";
import { ExamListItem } from "./card";
import RankModal from "./rank";

// Dynamic import for Result Modal to avoid build errors
const ExamAnswersDialog = dynamic(() => import("./result"), {
	ssr: false,
	loading: () => <div>Loading...</div>,
});

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
	const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
	const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
	const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

	const [globalShowScore, setGlobalShowScore] = useState(false);
	const [isResultsOpen, setIsResultsOpen] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch lesson filter options
	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	// Auto-select "Бүгд" (lesson_id: 0) when lessons are loaded
	useEffect(() => {
		if (lessonData?.RetData && selectedLessonId === null) {
			setSelectedLessonId(0);
		}
	}, [lessonData, selectedLessonId]);

	// Fetch exam results - uses API filtering based on selected lesson
	const { data, isLoading } = useQuery<ExamresultListResponseType>({
		queryKey: ["examResults", userId, selectedLessonId],
		queryFn: async (): Promise<ExamresultListResponseType> => {
			if (selectedLessonId === 0) {
				return getexamresultlists(userId || 0);
			}
			return getexamFinishFiltertLists(userId || 0, selectedLessonId || 0);
		},
		enabled: !!userId && selectedLessonId !== null,
	});

	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);
	const exams = useMemo(() => data?.RetData || [], [data]);

	// Filter exams based on search query
	const filteredExams = useMemo(() => {
		if (!searchQuery.trim()) return exams;
		const query = searchQuery.toLowerCase();
		return exams.filter((exam) => exam.title?.toLowerCase().includes(query));
	}, [exams, searchQuery]);

	// Handler for viewing results modal
	const handleViewResults = (_examId: number, testId: number) => {
		setSelectedTestId(testId);
		setGlobalShowScore(true);
	};

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

	// API error check
	const hasApiError = !data?.RetResponse?.ResponseType;

	return (
		<>
			<div className="h-full flex flex-col">
				<div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
					{/* Header */}
					<header className="text-center space-y-1 animate-in fade-in-0 slide-in-from-top-4 duration-500">
						<h1 className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
							Шалгалтын үр дүн
						</h1>
					</header>
					{/* Stats Section */}
					{finishedExams.length > 0 && (
						<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
							<div className="flex justify-end mb-3">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setGlobalShowScore(!globalShowScore)}
									className="h-8 text-xs gap-2 shadow-sm hover:shadow-md transition-all"
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
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in-0 slide-in-from-top-2 duration-500">
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
														Дууссан шалгалт
													</div>
												</div>
											</div>
										</CardContent>
									</Card>

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
								</div>
							)}
						</div>
					)}

					{/* Lesson Filter Section */}
					{lessons.length > 0 && (
						<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
							<div className="flex items-center gap-3 pb-2">
								{/* Desktop - Horizontal buttons */}
								<div className="hidden md:flex gap-2 flex-wrap">
									{lessons.map((lesson) => (
										<Button
											key={lesson.lesson_id}
											type="button"
											onClick={() => setSelectedLessonId(lesson.lesson_id)}
											variant={
												selectedLessonId === lesson.lesson_id
													? "default"
													: "outline"
											}
											className={cn(
												"px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
												selectedLessonId === lesson.lesson_id && "shadow-lg",
											)}
										>
											{lesson.lesson_name}
										</Button>
									))}
								</div>

								{/* Mobile - Combobox/Select */}
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
						<Collapsible open={isResultsOpen} onOpenChange={setIsResultsOpen}>
							<CardHeader>
								<CollapsibleTrigger className="w-full">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4">
											<div className="relative">
												<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
											</div>
											<h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
												{selectedLessonId === 0
													? "Бүх шалгалтууд"
													: `${lessons.find((l) => l.lesson_id === selectedLessonId)?.lesson_name || ""} - Шалгалтууд`}
											</h2>
										</div>
										<div className="flex items-center gap-3">
											<Badge
												variant="secondary"
												className="text-sm font-semibold shadow-sm"
											>
												{exams.length} шалгалт
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
								<CardContent className="p-6 space-y-5">
									{/* Search Bar */}
									{exams.length > 0 && (
										<div className="relative">
											<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
											<input
												type="text"
												placeholder="Шалгалтын нэр эсвэл хичээлээр хайх..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
												className="w-full pl-12 pr-10 h-12 border-2 border-input focus:border-primary focus:outline-none rounded-xl shadow-sm transition-all duration-200 text-sm bg-background"
											/>
											{searchQuery && (
												<button
													type="button"
													onClick={() => setSearchQuery("")}
													className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-accent rounded-full transition-colors"
												>
													<X className="w-4 h-4 text-muted-foreground" />
												</button>
											)}
										</div>
									)}

									{/* Results Count */}
									{searchQuery && exams.length > 0 && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<span className="font-medium">
												{filteredExams.length}
											</span>
											<span>үр дүн олдлоо</span>
											{filteredExams.length !== exams.length && (
												<span className="text-muted-foreground/60">
													({exams.length}-аас)
												</span>
											)}
										</div>
									)}

									{/* Exam Grid or Empty State */}
									{filteredExams.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
											{filteredExams.map((exam, index) => (
												<div
													key={exam.exam_id}
													className="animate-in fade-in-0 slide-in-from-bottom-4"
													style={{
														animationDelay: `${index * 50}ms`,
														animationFillMode: "both",
													}}
												>
													<ExamListItem
														exam={exam}
														onViewRank={setSelectedExamId}
														onViewResults={handleViewResults}
														globalShowScore={globalShowScore}
													/>
												</div>
											))}
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-16 text-center">
											<div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
												{hasApiError ? (
													<FileQuestion className="w-8 h-8 text-muted-foreground" />
												) : (
													<Search className="w-8 h-8 text-muted-foreground" />
												)}
											</div>
											<h3 className="text-lg font-semibold text-foreground mb-2">
												{hasApiError
													? "Шалгалт олдсонгүй"
													: "Өөр хайлт эсвэл шүүлтүүр ашиглан дахин оролдоно уу"}
											</h3>
											<p className="text-sm text-muted-foreground max-w-sm">
												{hasApiError
													? "Үр дүн татахад алдаа гарлаа. Дахин оролдоно уу."
													: searchQuery
														? `"${searchQuery}" хайлтад тохирох шалгалт олдсонгүй. Өөр нэрээр хайж үзнэ үү.`
														: selectedLessonId === 0
															? "Танд одоогоор шалгалтын үр дүн байхгүй байна."
															: `${lessons.find((l) => l.lesson_id === selectedLessonId)?.lesson_name || "Энэ хичээл"}-д шалгалтын үр дүн байхгүй байна.`}
											</p>
										</div>
									)}
								</CardContent>
							</CollapsibleContent>
						</Collapsible>
					</div>
				</div>
			</div>

			{/* Rank Modal */}
			{selectedExamId && userId && (
				<RankModal
					examId={selectedExamId}
					userId={userId}
					onClose={() => setSelectedExamId(null)}
				/>
			)}

			{/* Result Modal */}
			{globalShowScore && selectedTestId && (
				<ExamAnswersDialog
					examId={0}
					testId={selectedTestId}
					open={globalShowScore}
					onOpenChange={setGlobalShowScore}
				/>
			)}
		</>
	);
}
