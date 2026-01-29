"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { CourseContent } from "@/types/course/courseList";

interface CourseCardProps {
	course: CourseContent;
	index?: number;
}

export const CourseCard = ({ course, index = 0 }: CourseCardProps) => {
	const router = useRouter();
	const isPaid = course.ispay === 1;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="h-full"
		>
			<button
				type="button"
				onClick={() => router.push(`/course/${course.content_id}`)}
				aria-label={`${course.course_name} хичээл нээх`}
				className="group h-full w-full relative flex flex-col border border-border/40 bg-card/50 backdrop-blur-md cursor-pointer transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 rounded-lg sm:rounded-xl overflow-hidden text-left"
			>
				{/* Image Header - Fixed aspect ratio */}
				<div className="relative w-full aspect-4/2 bg-muted shrink-0">
					{course.filename ? (
						<Image
							src={course.filename}
							alt={course.course_name}
							fill
							className="object-cover transition-transform duration-700"
							sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
							quality={90}
							priority={index < 6}
						/>
					) : (
						<div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
							<Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary/30" />
						</div>
					)}

					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/50 to-transparent" />

					{/* Status Badge on image - Responsive */}
					<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
						{isPaid ? (
							<Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap bg-emerald-500">
								Төлбөр төлсөн
							</Badge>
						) : (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2 }}
							>
								{/* 	<Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap bg-orange-500">
									{course.amount.toLocaleString()}₮
								</Badge> */}
							</motion.div>
						)}
					</div>

					{/* Stats on Image - Responsive */}
					{/* <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 z-10">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="flex items-center gap-1 sm:gap-1.5">
								<Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs text-white/90">
									{course.rate}
								</span>
							</div>
							<div className="flex items-center gap-1 sm:gap-1.5">
								<Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-blue-300 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs text-white/90">
									{course.views}
								</span>
							</div>
						</div>
					</div> */}
				</div>

				{/* Content Section - Responsive padding */}
				<div className="p-1.5 sm:p-2 md:p-3 pb-9 sm:pb-10 md:pb-12 flex flex-col flex-1 space-y-1.5 sm:space-y-2 md:space-y-3 min-h-0">
					{/* Title Section - Responsive */}
					<div className="space-y-0.5 flex-1 min-h-0 overflow-hidden">
						<h3
							className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300"
							title={course.course_name}
						>
							{course.course_name}
						</h3>
					</div>

					{/* Stats Grid - Responsive */}
					<div className="space-y-1 sm:space-y-1.5 shrink-0">
						<div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 pt-1 sm:pt-1.5 md:pt-2 border-t border-border/50 min-h-0">
							<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0 max-w-[60%]">
								<User className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs ">
									{course.teach_name}
								</span>
							</div>
							<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground shrink-0">
								<BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs whitespace-nowrap">
									{course.contentcnt}
								</span>
							</div>
						</div>
					</div>

					{/* Action Button - Responsive */}
					<div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 md:bottom-3 md:right-3 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-foreground group-hover:scale-110 transition-all duration-300">
						<ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
					</div>
				</div>
			</button>
		</motion.div>
	);
};
