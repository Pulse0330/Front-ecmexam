"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import StyledBackButton from "@/components/backButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getContentView } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ContentViewResponse } from "@/types/course/contentView";
import { Homework } from "./homework";
import { LessonContent } from "./lessonContent";
import { LessonSidebar } from "./lessonSidebar";

// Loading component мемоизлох
const LoadingSpinner = memo(() => (
	<div className="flex items-center justify-center min-h-screen px-4">
		<div className="text-center space-y-4">
			<Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-primary mx-auto" />
			<p className="text-sm md:text-base text-muted-foreground">
				Ачааллаж байна...
			</p>
		</div>
	</div>
));
LoadingSpinner.displayName = "LoadingSpinner";

// Error component мемоизлох
const ErrorMessage = memo(({ message }: { message: string }) => (
	<div className="flex items-center justify-center min-h-screen px-4">
		<Card className="max-w-md w-full">
			<CardContent className="pt-6 space-y-4">
				<div className="text-center">
					<p className="text-base md:text-lg font-semibold mb-2 text-destructive">
						Алдаа гарлаа
					</p>
					<p className="text-xs md:text-sm text-muted-foreground">{message}</p>
				</div>
				<StyledBackButton />
			</CardContent>
		</Card>
	</div>
));
ErrorMessage.displayName = "ErrorMessage";

// Completion message мемоизлох
const CompletionMessage = memo(() => (
	<Card className="mt-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
		<CardContent className="p-3 md:p-4">
			<div className="flex items-center gap-2 md:gap-3">
				<CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400 shrink-0" />
				<div>
					<p className="text-sm md:text-base font-semibold text-green-900 dark:text-green-100">
						Амжилттай дүүргэлээ!
					</p>
					<p className="text-xs md:text-sm text-green-700 dark:text-green-300">
						Та энэ хичээлийг бүрэн судаллаа
					</p>
				</div>
			</div>
		</CardContent>
	</Card>
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
			<div className="border-b bg-card sticky top-0 z-10">
				<div className="px-3 md:px-4 py-2.5 md:py-3">
					<div className="flex items-center gap-2 mb-2 md:mb-3">
						<StyledBackButton
							onClick={() => router.push("/Lists/courseList")}
						/>
						<span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
							Буцах
						</span>
					</div>
					<div className="flex items-center justify-between">
						<h1 className="text-base md:text-xl font-bold truncate flex-1 mr-2">
							{contents[0]?.content_name || "Хичээлийн агуулга"}
						</h1>
						{/* Mobile menu toggle */}
						<Button
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="lg:hidden p-2 rounded-md hover:bg-accent"
							aria-label="Toggle lesson list"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Menu</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</Button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="px-3 md:px-4 py-3 md:py-4">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
					{/* Sidebar - Lesson List */}
					<div
						className={`
							lg:col-span-1
							${isSidebarOpen ? "block" : "hidden lg:block"}
							${isSidebarOpen ? "fixed inset-0 z-50 bg-background lg:relative" : ""}
						`}
					>
						{isSidebarOpen && (
							<div className="lg:hidden p-3 border-b flex items-center justify-between sticky top-0 bg-background">
								<h2 className="font-semibold">Хичээлийн жагсаалт</h2>
								<Button
									onClick={() => setIsSidebarOpen(false)}
									className="p-2 rounded-md hover:bg-accent"
									aria-label="Close lesson list"
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Close</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
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
								showBackButton={contents.length > 1}
							/>
						</div>
					</div>

					{/* Main Lesson Content */}
					<div className="lg:col-span-3">
						<div
							id={`lesson-${currentLessonIndex}`}
							className="max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
						>
							{isHomework ? (
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
