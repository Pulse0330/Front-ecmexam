// components/LessonFilter.tsx
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
	selectedLessonId: number | null; // null-г нэмсэн
	onLessonSelect: (lessonId: number) => void;
}

export default function LessonFilter({
	lessons,
	selectedLessonId,
	onLessonSelect,
}: LessonFilterProps) {
	// Хэрэв lessons хоосон эсвэл selectedLessonId null бол харуулахгүй
	if (lessons.length === 0 || selectedLessonId === null) {
		return null;
	}

	return (
		<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
			<div className="flex items-center gap-3 pb-2">
				{/* Desktop - Horizontal buttons */}
				<div className="hidden md:flex gap-2 flex-wrap">
					{lessons.map((lesson) => (
						<Tooltip key={lesson.lesson_id}>
							<TooltipTrigger asChild>
								<Button
									type="button"
									onClick={() => onLessonSelect(lesson.lesson_id)}
									variant={
										selectedLessonId === lesson.lesson_id
											? "default"
											: "outline"
									}
									className={cn(
										"px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
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

				{/* Mobile - Select dropdown */}
				<select
					value={selectedLessonId}
					onChange={(e) => onLessonSelect(Number(e.target.value))}
					className="md:hidden flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-background border-2 border-input text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
					aria-label="Хичээл сонгох"
				>
					{lessons.map((lesson) => (
						<option key={lesson.lesson_id} value={lesson.lesson_id}>
							{lesson.lesson_name}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
