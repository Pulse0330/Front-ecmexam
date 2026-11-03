"use client";

import { motion } from "framer-motion";
import {
	BookOpen,
	CheckCircle2,
	Loader2,
	PlayCircle,
	User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CourseContent } from "@/types/course/courseList";

interface CourseCardProps {
	course: CourseContent;
	index?: number;
}

export const CourseCard = ({ course, index = 0 }: CourseCardProps) => {
	const router = useRouter();
	const isPaid = course.ispay === 1;

	// Loading state
	const [isNavigating, setIsNavigating] = useState(false);

	const handleClick = () => {
		setIsNavigating(true);

		// Navigate with slight delay for animation
		setTimeout(() => {
			router.push(`/course/${course.content_id}`);
		}, 300);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.04 }}
			className="h-full"
		>
			<article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md">
				{/* Зураг */}
				<div className="relative aspect-[5/2] w-full shrink-0 bg-muted">
					{course.filename ? (
						<Image
							src={course.filename}
							alt={course.course_name}
							fill
							className="object-cover"
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
							quality={90}
							priority={index < 6}
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center bg-primary/5">
							<BookOpen className="size-8 text-primary/30" aria-hidden />
						</div>
					)}
				</div>

				<div className="flex flex-1 flex-col gap-3 p-4">
					{isPaid && (
						<span className="inline-flex w-fit items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
							<CheckCircle2 className="size-3.5" aria-hidden />
							Төлбөр төлсөн
						</span>
					)}

					<h3
						className="line-clamp-2 text-base font-semibold leading-snug text-foreground"
						title={course.course_name}
					>
						{course.course_name}
					</h3>

					<div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
						{course.teach_name && (
							<span
								className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-muted px-2.5 py-1"
								title="Багш"
							>
								<User className="size-3.5 shrink-0" aria-hidden />
								<span className="truncate font-medium text-foreground">
									{course.teach_name}
								</span>
							</span>
						)}
						<span
							className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1"
							title="Агуулгын тоо"
						>
							<BookOpen className="size-3.5" aria-hidden />
							<span className="font-medium text-foreground">
								{course.contentcnt} агуулга
							</span>
						</span>
					</div>

					<Button
						type="button"
						onClick={handleClick}
						disabled={isNavigating}
						className="mt-auto h-10 w-full"
						aria-label={`${course.course_name} — хичээл үзэх`}
					>
						{isNavigating ? (
							<>
								<Loader2 className="size-4 animate-spin" aria-hidden />
								Нээж байна...
							</>
						) : (
							<>
								<PlayCircle className="size-4" aria-hidden />
								Хичээл үзэх
							</>
						)}
					</Button>
				</div>
			</article>
		</motion.div>
	);
};
