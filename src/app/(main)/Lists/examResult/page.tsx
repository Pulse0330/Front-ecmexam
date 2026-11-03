"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, FileQuestion } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import LessonFilter from "@/components/LessonFilter";
import { PageHeader } from "@/components/page/pageHeader";
import { EmptyState, LoadingState } from "@/components/page/pageStates";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
	getexamFinishFiltertLists,
	getexamresultlists,
	getTestFilter,
} from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamresultListResponseType } from "@/types/exam/examResultList";
import { ExamListItem } from "./card";
import RankModal from "./rank";
import { ResultStats, ScoreToggleButton } from "./resultStats";

// Dynamic import for Result Modal
const ExamAnswersDialog = dynamic(() => import("./result"), {
	ssr: false,
	loading: () => <LoadingState label="Ачааллаж байна..." className="py-8" />,
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

	// Fetch exam results
	const { data, isLoading } = useQuery<ExamresultListResponseType>({
		queryKey: ["examResults", userId, selectedLessonId],
		queryFn: async (): Promise<ExamresultListResponseType> => {
			if (selectedLessonId === 0) {
				return getexamresultlists(userId || 0);
			}
			return getexamFinishFiltertLists(userId || 0, selectedLessonId || 0);
		},
		enabled: !!userId && selectedLessonId !== null,
		staleTime: 2 * 60 * 1000,
	});

	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);
	const exams = useMemo(() => data?.RetData || [], [data]);

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
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<LoadingState
					label="Шалгалтын үр дүнг ачааллаж байна..."
					className="min-h-[60vh]"
				/>
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-10 sm:px-6 lg:px-8">
				<PageHeader
					title="Шалгалтын үр дүн"
					description="Өгсөн шалгалтуудын оноо болон дэлгэрэнгүй хариулт"
					icon={ClipboardCheck}
					actions={
						finishedExams.length > 0 && (
							<ScoreToggleButton
								shown={globalShowScore}
								onToggle={() => setGlobalShowScore(!globalShowScore)}
							/>
						)
					}
				/>

				{/* Статистик */}
				{finishedExams.length > 0 && globalShowScore && (
					<ResultStats
						finishedCount={finishedExams.length}
						finishedLabel="Дууссан шалгалт"
						avgScore={avgScore}
						highScore={highScore}
					/>
				)}

				{selectedLessonId !== null && (
					<LessonFilter
						lessons={lessons}
						selectedLessonId={selectedLessonId}
						onLessonSelect={setSelectedLessonId}
					/>
				)}

				{/* Үр дүнгийн жагсаалт */}
				<section className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Нийт{" "}
						<span className="font-semibold text-foreground">
							{exams.length}
						</span>{" "}
						шалгалт
					</p>

					{exams.length > 0 ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{exams.map((exam) => (
								<ExamListItem
									key={exam.exam_id}
									exam={exam}
									onViewRank={setSelectedExamId}
									onViewResults={handleViewResults}
									globalShowScore={globalShowScore}
								/>
							))}
						</div>
					) : (
						<EmptyState
							icon={FileQuestion}
							title={
								hasApiError ? "Шалгалт олдсонгүй" : "Шалгалт байхгүй байна"
							}
							description={
								hasApiError
									? "Үр дүн татахад алдаа гарлаа. Дахин оролдоно уу."
									: selectedLessonId === 0
										? "Танд одоогоор шалгалтын үр дүн байхгүй байна."
										: `${selectedLessonName || "Энэ хичээл"}-д шалгалтын үр дүн байхгүй байна.`
							}
						/>
					)}
				</section>
			</div>

			{/* Rank Modal */}
			{selectedExamId && userId && (
				<RankModal
					examId={selectedExamId}
					userId={userId}
					open={!!selectedExamId}
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
		</TooltipProvider>
	);
}
