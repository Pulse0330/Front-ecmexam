"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, FileQuestion } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LessonFilter from "@/components/LessonFilter";
import { PageHeader } from "@/components/page/pageHeader";
import { EmptyState, LoadingState } from "@/components/page/pageStates";
import { getSorilFilterdresultlists, getTestFilter } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { SorilresultListResponseType } from "@/types/soril/sorilResultLists";
import { ResultStats, ScoreToggleButton } from "../examResult/resultStats";
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
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<LoadingState
					label="Сорилын үр дүнг ачааллаж байна..."
					className="min-h-[60vh]"
				/>
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-10 sm:px-6 lg:px-8">
			<PageHeader
				title="Сорилын үр дүн"
				description="Өгсөн сорилуудын оноо болон дэлгэрэнгүй хариулт"
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
					finishedLabel="Дууссан сорил"
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
					<span className="font-semibold text-foreground">{exams.length}</span>{" "}
					сорил
				</p>

				{exams.length > 0 ? (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{exams.map((exam, index) => (
							<ExamResultCard
								key={exam.exam_id}
								exam={exam}
								index={index}
								globalShowScore={globalShowScore}
							/>
						))}
					</div>
				) : (
					<EmptyState
						icon={FileQuestion}
						title={hasApiError ? "Сорил олдсонгүй" : "Сорил байхгүй байна"}
						description={
							hasApiError
								? "Үр дүн татахад алдаа гарлаа. Дахин оролдоно уу."
								: selectedLessonId === 0
									? "Танд одоогоор сорилын үр дүн байхгүй байна."
									: `${selectedLessonName || "Энэ хичээл"}-д сорилын үр дүн байхгүй байна.`
						}
					/>
				)}
			</section>
		</div>
	);
}
