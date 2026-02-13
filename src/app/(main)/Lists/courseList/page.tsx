"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen } from "lucide-react";
import { useMemo, useState } from "react";
import LessonFilter from "@/components/LessonFilter";
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

const CourseListPage = () => {
	const { userId } = useAuthStore();
	const [selectedLessonId, setSelectedLessonId] = useState<number>(0);

	// Хичээлийн жагсаалт татах
	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	// Хичээлээр шүүсэн course жагсаалт татах
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

	// API алдаа биш ResponseType false ирсэн тохиолдолд хоосон массив буцаах
	const courses = useMemo(() => {
		if (!queryData) return [];
		if (!queryData.RetResponse.ResponseType) return [];
		return queryData.RetData || [];
	}, [queryData]);

	const skeletonIds = [1, 2, 3, 4, 5, 6, 7, 8];

	// Loading state
	if (isPending) {
		return (
			<div className="min-h-screen flex flex-col overflow-auto">
				<div className="max-w-[1600px] mx-auto w-full flex flex-col gap-4 sm:gap-6 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
					<header className="text-center space-y-1">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
							Миний хичээлүүд
						</h1>
					</header>

					<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 pb-4 auto-rows-fr">
						{skeletonIds.map((id) => (
							<SkeletonCard key={id} />
						))}
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<div className="text-center space-y-4 max-w-md">
					<div className="mb-6 p-6 bg-red-50 dark:bg-red-950/20 rounded-full inline-block">
						<AlertCircle className="w-16 h-16 text-red-500" />
					</div>
					<h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
						Алдаа гарлаа
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						{error?.message || "Мэдээлэл татахад алдаа гарлаа"}
					</p>
				</div>
			</div>
		);
	}

	// No user ID state
	if (!userId) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center p-8">
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Хэрэглэгчийн мэдээлэл олдсонгүй
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col overflow-auto">
			<div className="container mx-auto w-full flex flex-col gap-4 sm:gap-6 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				<header className=" space-y-1">
					<h3 className="text-lg sm:text-2xl font-extrabold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
						Миний хичээлүүд
					</h3>
				</header>

				{/* Хичээлийн filter */}
				<LessonFilter
					lessons={lessons}
					selectedLessonId={selectedLessonId}
					onLessonSelect={setSelectedLessonId}
				/>

				{/* Results info */}
				{selectedLessonId !== 0 && (
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<AlertCircle size={16} />
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

				{/* Course grid */}
				<div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3 sm:gap-4 pb-4 auto-rows-fr">
					{courses.map((course, idx) => (
						<CourseCard key={course.content_id} course={course} index={idx} />
					))}
				</div>

				{/* No results */}
				{courses.length === 0 && (
					<div className="text-center py-12 space-y-3">
						<div className="mb-6 p-6 bg-gray-100 dark:bg-gray-800/50 rounded-full inline-block">
							<BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600" />
						</div>
						<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
							Хичээл олдсонгүй
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{selectedLessonId !== 0
								? "Энэ хичээлд контент олдсонгүй."
								: "Та одоогоор ямар ч хичээлд бүртгүүлээгүй байна."}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

const SkeletonCard = () => (
	<div className="w-full flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-md animate-pulse">
		<div className="h-32 w-full bg-gray-200 dark:bg-gray-800 relative shrink-0" />
		<div className="flex flex-col flex-1 p-3 gap-3">
			<div className="space-y-2 flex-1">
				<div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
				<div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
			</div>
			<div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
		</div>
	</div>
);

export default CourseListPage;
