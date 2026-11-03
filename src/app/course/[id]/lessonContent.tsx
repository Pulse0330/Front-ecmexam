"use client";

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContentView } from "@/types/course/contentView";
import { SafeHtmlContent } from "./safeHtmlContent";

interface LessonContentProps {
	lesson: ContentView;
	lessonIndex: number;
	totalLessons: number;
	isCompleted: boolean;
	onMarkComplete: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onFinish: () => void;
}

export function LessonContent({
	lesson,
	lessonIndex,
	totalLessons,
	isCompleted,
	onMarkComplete,
	onPrevious,
	onNext,
	onFinish,
}: LessonContentProps) {
	const isLastLesson = lessonIndex === totalLessons - 1;
	const isFirstLesson = lessonIndex === 0;

	return (
		<article className="rounded-2xl border bg-card shadow-sm">
			<header className="space-y-2 border-b p-4 sm:p-6">
				<div className="flex flex-wrap items-center gap-2">
					<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
						Хичээл {lessonIndex + 1} / {totalLessons}
					</span>
					{lesson.elesson_type && (
						<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
							{lesson.elesson_type}
						</span>
					)}
					{isCompleted && (
						<span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
							<CheckCircle2 className="size-3" />
							Үзсэн
						</span>
					)}
				</div>
				<h2 className="text-lg font-bold leading-snug text-foreground sm:text-xl">
					{lesson.content_name}
				</h2>
			</header>
			<div className="space-y-4 p-4 sm:p-6">
				<SafeHtmlContent
					html={lesson.url || ""}
					contentType={lesson.l_content_type || 0}
				/>

				{/* Navigation Buttons — нэг үндсэн үйлдэл */}
				<div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
					<Button
						variant="outline"
						onClick={onPrevious}
						disabled={isFirstLesson}
						className="h-11"
					>
						<ArrowLeft className="size-4" />
						Өмнөх
					</Button>

					<div className="flex flex-col-reverse gap-2 sm:flex-row">
						{!isLastLesson && (
							<Button
								onClick={onNext}
								variant={isCompleted ? "default" : "outline"}
								className="h-11"
							>
								Дараах
								<ArrowRight className="size-4" />
							</Button>
						)}

						{isLastLesson && (
							<Button
								onClick={onFinish}
								variant={isCompleted ? "default" : "outline"}
								className="h-11"
							>
								<BookOpen className="size-4" />
								Бусад хичээл
							</Button>
						)}

						{!isCompleted && (
							<Button onClick={onMarkComplete} className="h-11">
								<CheckCircle2 className="size-4" />
								Үзэж дууслаа
							</Button>
						)}
					</div>
				</div>
			</div>
		</article>
	);
}
