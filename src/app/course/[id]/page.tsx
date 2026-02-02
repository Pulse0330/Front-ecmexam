"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import StyledBackButton from "@/components/backButton";
import { Card, CardContent } from "@/components/ui/card";
import { getContentView } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ContentViewResponse } from "@/types/course/contentView";
import { Homework } from "./homework";
import { LessonContent } from "./lessonContent";
import { LessonSidebar } from "./lessonSidebar";

// Loading component мемоизлох
const LoadingSpinner = memo(() => (
	<div className="flex items-center justify-center min-h-screen">
		<div className="text-center space-y-4">
			<Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
			<p className="text-muted-foreground">Ачааллаж байна...</p>
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
					<p className="text-lg font-semibold mb-2 text-destructive">
						Алдаа гарлаа
					</p>
					<p className="text-muted-foreground text-sm">{message}</p>
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
		<CardContent className="p-4">
			<div className="flex items-center gap-3">
				<CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
				<div>
					<p className="font-semibold text-green-900 dark:text-green-100">
						Амжилттай дүүргэлээ!
					</p>
					<p className="text-sm text-green-700 dark:text-green-300">
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
	const queryClient = useQueryClient();

	const content_id = Number(params.id);
	const { userId } = useAuthStore();

	const { data, isPending, isError, error } = useQuery<ContentViewResponse>({
		queryKey: ["contentView", content_id, userId],
		queryFn: () => getContentView(content_id, userId || 0),
		enabled: !!content_id && !!userId,
		staleTime: 5 * 60 * 1000, // 5 минут
		gcTime: 10 * 60 * 1000, // 10 минут cache хадгална
		refetchOnWindowFocus: false, // Window focus дээр дахин татахгүй
		refetchOnMount: false, // Mount дээр дахин татахгүй
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

	// Mark lesson as complete mutation optimized
	const markCompleteMutation = useMutation({
		mutationFn: async (_lessonId: number) => {
			// Replace with your actual API call
			// await markLessonComplete(lessonId, userId);
			return { success: true };
		},
		onMutate: async (lessonId) => {
			// Optimistic update
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
			// Rollback on error
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
		// Move to next lesson
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
			<div className="border-b bg-card">
				<div className="px-4 py-3">
					<div className="mb-2">
						<StyledBackButton />
					</div>

					<h1 className="text-xl font-bold mb-3">
						{contents[0]?.content_name || "Хичээлийн агуулга"}
					</h1>
				</div>
			</div>

			{/* Main Content */}
			<div className="px-4 py-4">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
					{/* Sidebar - Lesson List */}
					<div className="lg:col-span-1">
						<LessonSidebar
							contents={contents}
							currentLessonIndex={currentLessonIndex}
							onLessonSelect={setCurrentLessonIndex}
						/>
					</div>

					{/* Main Lesson Content */}
					<div className="lg:col-span-3">
						<div
							id={`lesson-${currentLessonIndex}`}
							className="max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
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
