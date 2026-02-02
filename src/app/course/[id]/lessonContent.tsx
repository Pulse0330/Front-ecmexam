"use client";

import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Badge variant="secondary">{lesson.elesson_type}</Badge>
							{isCompleted && (
								<Badge className="bg-green-600">
									<CheckCircle2 className="h-3 w-3 mr-1" />
									Дууссан
								</Badge>
							)}
						</div>
						<CardTitle className="text-xl">
							Хичээл {lessonIndex + 1}: {lesson.content_name}
						</CardTitle>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<SafeHtmlContent
					html={lesson.url || ""}
					contentType={lesson.l_content_type || 0}
				/>

				{/* Navigation Buttons */}
				<div className="flex items-center justify-between pt-4 border-t">
					<Button
						variant="outline"
						onClick={onPrevious}
						disabled={isFirstLesson}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Өмнөх
					</Button>

					<div className="flex gap-2">
						{!isCompleted && (
							<Button
								onClick={onMarkComplete}
								className="bg-green-600 hover:bg-green-700"
							>
								<CheckCircle2 className="mr-2 h-4 w-4" />
								Дууссан
							</Button>
						)}

						{!isLastLesson && (
							<Button onClick={onNext}>
								Дараах
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						)}

						{isLastLesson && (
							<Button
								onClick={onFinish}
								className="bg-blue-600 hover:bg-blue-700"
							>
								Бусад хичээл
								<BookOpen className="ml-2 h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
