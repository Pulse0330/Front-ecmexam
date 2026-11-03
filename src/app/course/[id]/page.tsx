"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, List, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import StyledBackButton from "@/components/backButton";
import { PageHeader } from "@/components/page/pageHeader";
import {
	EmptyState,
	ErrorState,
	LoadingState,
} from "@/components/page/pageStates";
import { Button } from "@/components/ui/button";
import { getContentView } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ContentViewResponse } from "@/types/course/contentView";
import { Homework } from "./homework";
import { LessonContent } from "./lessonContent";
import { LessonSidebar } from "./lessonSidebar";

// Loading component мемоизлох
const LoadingSpinner = memo(() => (
	<div className="flex min-h-[60vh] items-center justify-center px-4">
		<LoadingState label="Хичээл ачааллаж байна..." />
	</div>
));
LoadingSpinner.displayName = "LoadingSpinner";

// Error component мемоизлох
const ErrorMessage = memo(({ message }: { message: string }) => (
	<div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4">
		<ErrorState
			title="Хичээл нээж чадсангүй"
			description={message}
			className="w-full"
		/>
		<StyledBackButton />
	</div>
));
ErrorMessage.displayName = "ErrorMessage";

// Completion message мемоизлох
const CompletionMessage = memo(() => (
	<div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
		<div className="flex items-center gap-3">
			<CheckCircle2 className="size-6 shrink-0 text-green-600 dark:text-green-400" />
			<div>
				<p className="text-base font-semibold text-green-900 dark:text-green-100">
					Амжилттай дүүргэлээ!
				</p>
				<p className="text-sm text-green-700 dark:text-green-300">
					Та энэ хичээлийг бүрэн судаллаа
				</p>
			</div>
		</div>
	</div>
));
CompletionMessage.displayName = "CompletionMessage";

export default function CoursePage() {
	const router = useRouter();
	const params = useParams();
	const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
	const queryClient = useQueryClient();

	const content_id = Number(params.id);
	const { userId } = useAuthStore();

	const { data, isPending, isError, error } = useQuery<ContentViewResponse>({
		queryKey: ["contentView", content_id, userId],
		queryFn: () => getContentView(content_id, userId || 0),
		enabled: !!content_id && !!userId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});

	// Auto-scroll optimized
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			const element = document.getElementById(`lesson-${currentLessonIndex}`);
			if (element) {
				element.scrollIntoView({
					behavior: "smooth",
					block: "start",
					inline: "nearest",
				});
			}
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [currentLessonIndex]);

	// Close sidebar when lesson changes on mobile
	useEffect(() => {
		setIsSidebarOpen(false);
	}, []);

	// Mark lesson as complete mutation optimized
	const markCompleteMutation = useMutation({
		mutationFn: async (_lessonId: number) => {
			return { success: true };
		},
		onMutate: async (lessonId) => {
			await queryClient.cancelQueries({
				queryKey: ["contentView", content_id, userId],
			});

			const previousData = queryClient.getQueryData<ContentViewResponse>([
				"contentView",
				content_id,
				userId,
			]);

			if (previousData?.RetData) {
				queryClient.setQueryData<ContentViewResponse>(
					["contentView", content_id, userId],
					{
						...previousData,
						RetData: previousData.RetData.map((item) =>
							item.content_id === lessonId ? { ...item, stu_worked: 1 } : item,
						),
					},
				);
			}

			return { previousData };
		},
		onError: (_err, _lessonId, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(
					["contentView", content_id, userId],
					context.previousData,
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["contentView", content_id, userId],
			});
		},
	});

	// Memoized callbacks
	const handleMarkComplete = useCallback(() => {
		if (
			data?.RetData?.[currentLessonIndex] &&
			data.RetData[currentLessonIndex].stu_worked !== 1
		) {
			markCompleteMutation.mutate(data.RetData[currentLessonIndex].content_id);
		}
		if (data?.RetData && currentLessonIndex < data.RetData.length - 1) {
			setCurrentLessonIndex(currentLessonIndex + 1);
		}
	}, [currentLessonIndex, data?.RetData, markCompleteMutation]);

	const handlePrevious = useCallback(() => {
		if (currentLessonIndex > 0) {
			setCurrentLessonIndex(currentLessonIndex - 1);
		}
	}, [currentLessonIndex]);

	const handleNext = useCallback(() => {
		if (data?.RetData && currentLessonIndex < data.RetData.length - 1) {
			setCurrentLessonIndex(currentLessonIndex + 1);
		}
	}, [currentLessonIndex, data?.RetData]);

	const handleStartExam = useCallback(
		(examId: number) => {
			router.push(`/exam/${examId}`);
		},
		[router],
	);

	const handleFinish = useCallback(() => {
		router.push("/Lists/courseList");
	}, [router]);

	const handleLessonSelect = useCallback((index: number) => {
		setCurrentLessonIndex(index);
		setIsSidebarOpen(false);
	}, []);

	// Memoized values
	const contents = useMemo(() => data?.RetData || [], [data?.RetData]);
	const currentLesson = useMemo(
		() => contents[currentLessonIndex],
		[contents, currentLessonIndex],
	);
	const isCompleted = useMemo(
		() => currentLesson?.stu_worked === 1,
		[currentLesson?.stu_worked],
	);
	const isHomework = useMemo(
		() => !!(currentLesson?.exam_id && currentLesson?.examname),
		[currentLesson?.exam_id, currentLesson?.examname],
	);

	if (isPending) {
		return <LoadingSpinner />;
	}

	if (isError) {
		return <ErrorMessage message={error.message} />;
	}

	if (!data?.RetResponse?.ResponseType) {
		return (
			<ErrorMessage
				message={data?.RetResponse?.ResponseMessage || "Тодорхойгүй алдаа"}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="sticky top-0 z-10 border-b bg-card">
				<div className="mx-auto w-full max-w-7xl px-4">
					<PageHeader
						className="py-3 sm:py-3"
						back={() => router.push("/Lists/courseList")}
						icon={BookOpen}
						title={
							<span className="line-clamp-2 sm:line-clamp-1">
								{contents[0]?.content_name || "Хичээлийн агуулга"}
							</span>
						}
						description={
							contents.length > 0
								? `Хичээл ${currentLessonIndex + 1} / ${contents.length}`
								: undefined
						}
						actions={
							contents.length > 0 && (
								<Button
									variant="outline"
									onClick={() => setIsSidebarOpen(!isSidebarOpen)}
									className="h-10 lg:hidden"
								>
									<List className="size-4" />
									Хичээлүүд
								</Button>
							)
						}
					/>
				</div>
			</div>

			{/* Main Content */}
			<div className="mx-auto w-full max-w-7xl px-4 py-4">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
					{/* Sidebar - Lesson List */}
					<div
						className={`
							lg:col-span-1
							${isSidebarOpen ? "block" : "hidden lg:block"}
							${isSidebarOpen ? "fixed inset-0 z-50 bg-background lg:relative" : ""}
						`}
					>
						{isSidebarOpen && (
							<div className="sticky top-0 flex items-center justify-between border-b bg-background p-3 lg:hidden">
								<h2 className="text-base font-semibold">Хичээлийн жагсаалт</h2>
								<Button
									variant="outline"
									onClick={() => setIsSidebarOpen(false)}
									className="h-10"
								>
									<X className="size-4" />
									Хаах
								</Button>
							</div>
						)}
						<div
							className={
								isSidebarOpen ? "p-3 overflow-y-auto h-[calc(100vh-60px)]" : ""
							}
						>
							<LessonSidebar
								contents={contents}
								currentLessonIndex={currentLessonIndex}
								onLessonSelect={handleLessonSelect}
								showBackButton={false}
							/>
						</div>
					</div>

					{/* Main Lesson Content */}
					<div className="lg:col-span-3">
						<div
							id={`lesson-${currentLessonIndex}`}
							className="max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin md:max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-200px)]"
						>
							{!currentLesson ? (
								<EmptyState
									icon={BookOpen}
									title="Хичээл олдсонгүй"
									description="Энэ сургалтад одоогоор хичээл нэмэгдээгүй байна."
									action={
										<Button
											variant="outline"
											onClick={handleFinish}
											className="h-11"
										>
											Бусад сургалт үзэх
										</Button>
									}
								/>
							) : isHomework ? (
								<Homework
									content={currentLesson}
									onStartExam={handleStartExam}
								/>
							) : (
								<>
									<LessonContent
										lesson={currentLesson}
										lessonIndex={currentLessonIndex}
										totalLessons={contents.length}
										isCompleted={isCompleted}
										onMarkComplete={handleMarkComplete}
										onPrevious={handlePrevious}
										onNext={handleNext}
										onFinish={handleFinish}
									/>

									{/* Completion Message */}
									{isCompleted && <CompletionMessage />}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
