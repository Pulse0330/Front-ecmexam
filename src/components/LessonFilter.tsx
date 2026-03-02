// components/exam/LessonFilter.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Lesson {
	lesson_id: number;
	lesson_name: string;
	sort: number;
}

interface LessonFilterProps {
	lessons: Lesson[];
	selectedLessonId: number;
	onLessonSelect: (lessonId: number) => void;
}

export default function LessonFilter({
	lessons,
	selectedLessonId,
	onLessonSelect,
}: LessonFilterProps) {
	return (
		<div className="mb-4">
			{/* Desktop & Tablet */}
			<div className="hidden sm:flex gap-2 flex-wrap">
				{lessons.map((lesson) => (
					<Tooltip key={lesson.lesson_id}>
						<TooltipTrigger asChild>
							<Button
								type="button"
								onClick={() => onLessonSelect(lesson.lesson_id)}
								variant={
									selectedLessonId === lesson.lesson_id ? "default" : "outline"
								}
								className={cn(
									"px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
									selectedLessonId === lesson.lesson_id && "shadow-lg",
								)}
								aria-label={`${lesson.lesson_name} хичээл сонгох`}
								aria-pressed={selectedLessonId === lesson.lesson_id}
							>
								{lesson.lesson_name}
							</Button>
						</TooltipTrigger>
					</Tooltip>
				))}
			</div>

			{/* Mobile */}
			<select
				value={selectedLessonId}
				onChange={(e) => onLessonSelect(Number(e.target.value))}
				className="sm:hidden w-full px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
				aria-label="Хичээл сонгох"
			>
				{lessons.map((lesson) => (
					<option key={lesson.lesson_id} value={lesson.lesson_id}>
						{lesson.lesson_name}
					</option>
				))}
			</select>
		</div>
	);
}
