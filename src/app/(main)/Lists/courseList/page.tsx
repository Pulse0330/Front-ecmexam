"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LessonFilter from "@/components/LessonFilter";
import { PageHeader } from "@/components/page/pageHeader";
import { EmptyState, ErrorState } from "@/components/page/pageStates";
import { Button } from "@/components/ui/button";
import { getFilteredContnView, getTestFilter } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CourseListResponse } from "@/types/course/courseList";
import { CourseCard } from "./card";

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

const ITEMS_PER_PAGE = 18;

const CourseListPage = () => {
	const { userId } = useAuthStore();
	const [selectedLessonId, setSelectedLessonId] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState(1);

	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	const {
		data: queryData,
		isPending,
		isError,
		error,
	} = useQuery<CourseListResponse>({
		queryKey: ["filteredCourseList", userId, selectedLessonId],
		queryFn: () => getFilteredContnView(userId || 0, selectedLessonId),
		enabled: !!userId,
		staleTime: 0,
		refetchOnMount: true,
	});

	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);

	const courses = useMemo(() => {
		if (!queryData) return [];
		if (!queryData.RetResponse.ResponseType) return [];
		return queryData.RetData || [];
	}, [queryData]);

	const paginatedCourses = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return courses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [courses, currentPage]);

	const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

	// Шүүлтүүр өөрчлөгдөхөд хуудсыг 1 рүү буцаах
	useEffect(() => {
		setCurrentPage(1);
	}, []);

	const skeletonIds = [1, 2, 3, 4, 5, 6, 7, 8];

	const header = (
		<PageHeader
			title="Миний хичээлүүд"
			description="Таны бүртгүүлсэн видео хичээлүүд. Хичээлээ сонгоод «Хичээл үзэх» дарна уу."
			icon={BookOpen}
		/>
	);

	if (isPending) {
		return (
			<div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 sm:px-6 lg:px-8">
				{header}
				<div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
					{skeletonIds.map((id) => (
						<SkeletonCard key={id} />
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 sm:px-6 lg:px-8">
				{header}
				<ErrorState
					description={error?.message || "Мэдээлэл татахад алдаа гарлаа"}
				/>
			</div>
		);
	}

	if (!userId) {
		return (
			<div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 sm:px-6 lg:px-8">
				{header}
				<EmptyState
					title="Хэрэглэгчийн мэдээлэл олдсонгүй"
					description="Дахин нэвтэрч орно уу."
				/>
			</div>
		);
	}

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 pb-6 sm:px-6 lg:px-8">
			{header}

			<LessonFilter
				lessons={lessons}
				selectedLessonId={selectedLessonId}
				onLessonSelect={setSelectedLessonId}
			/>

			{selectedLessonId !== 0 && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Info className="size-4 shrink-0" aria-hidden />
					<span>
						<strong>{courses.length}</strong> хичээл олдлоо{" "}
						<strong>
							{
								lessons.find((l) => l.lesson_id === selectedLessonId)
									?.lesson_name
							}
						</strong>{" "}
						хичээлд
					</span>
				</div>
			)}

			<div className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
				{paginatedCourses.map((course, idx) => (
					<CourseCard key={course.content_id} course={course} index={idx} />
				))}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<nav
					aria-label="Хуудаслалт"
					className="mt-8 mb-10 flex items-center justify-center gap-2"
				>
					<Button
						variant="outline"
						size="icon"
						onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
						disabled={currentPage === 1}
						className="size-10 shrink-0 rounded-full"
						aria-label="Өмнөх хуудас"
					>
						<ChevronLeft size={18} />
					</Button>

					<div className="flex min-w-0 flex-wrap items-center justify-center gap-1">
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<Button
								key={page}
								variant={currentPage === page ? "default" : "ghost"}
								size="sm"
								onClick={() => setCurrentPage(page)}
								className="size-10 rounded-full"
								aria-current={currentPage === page ? "page" : undefined}
							>
								{page}
							</Button>
						))}
					</div>

					<Button
						variant="outline"
						size="icon"
						onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
						className="size-10 shrink-0 rounded-full"
						aria-label="Дараах хуудас"
					>
						<ChevronRight size={18} />
					</Button>
				</nav>
			)}

			{courses.length === 0 && (
				<EmptyState
					icon={BookOpen}
					title="Хичээл олдсонгүй"
					description={
						selectedLessonId !== 0
							? "Энэ хичээлд контент олдсонгүй."
							: "Та одоогоор ямар ч хичээлд бүртгүүлээгүй байна."
					}
				/>
			)}
		</div>
	);
};

const SkeletonCard = () => (
	<div className="flex w-full animate-pulse flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
		<div className="aspect-[5/2] w-full shrink-0 bg-muted" />
		<div className="flex flex-1 flex-col gap-3 p-4">
			<div className="h-4 w-3/4 rounded bg-muted" />
			<div className="h-6 w-1/2 rounded-full bg-muted" />
			<div className="h-10 w-full rounded-md bg-muted" />
		</div>
	</div>
);

export default CourseListPage;
