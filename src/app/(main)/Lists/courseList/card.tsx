"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Loader2, Sparkles, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { CourseContent } from "@/types/course/courseList";

// import { toast } from "sonner"; // Uncomment if using sonner

interface CourseCardProps {
	course: CourseContent;
	index?: number;
}

export const CourseCard = ({ course, index = 0 }: CourseCardProps) => {
	const router = useRouter();
	const isPaid = course.ispay === 1;

	// Loading state
	const [isNavigating, setIsNavigating] = useState(false);

	// Ripple effect state
	const [ripple, setRipple] = useState({ x: 0, y: 0, show: false });

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		// Ripple effect
		const rect = e.currentTarget.getBoundingClientRect();
		setRipple({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			show: true,
		});

		// Set loading state
		setIsNavigating(true);

		// Optional: Show toast notification
		// toast.loading(`${course.course_name} хичээл нээж байна...`, {
		// 	id: `course-${course.content_id}`
		// });

		// Navigate with slight delay for animation
		setTimeout(() => {
			router.push(`/course/${course.content_id}`);
		}, 300);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="h-full"
		>
			<motion.button
				type="button"
				onClick={handleClick}
				disabled={isNavigating}
				aria-label={`${course.course_name} хичээл нээх`}
				whileHover={{ y: -4, scale: 1.01 }}
				whileTap={{ scale: 0.98 }}
				className="group h-full w-full relative flex flex-col border border-border/40 bg-card/50 backdrop-blur-md cursor-pointer transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 rounded-lg sm:rounded-xl overflow-hidden text-left disabled:opacity-70 disabled:cursor-wait disabled:hover:shadow-none"
			>
				{/* Ripple Effect */}
				{ripple.show && (
					<motion.span
						initial={{ scale: 0, opacity: 1 }}
						animate={{ scale: 4, opacity: 0 }}
						transition={{ duration: 0.6 }}
						onAnimationComplete={() => setRipple({ ...ripple, show: false })}
						className="absolute bg-primary/20 rounded-full pointer-events-none z-50"
						style={{
							left: ripple.x - 10,
							top: ripple.y - 10,
							width: 20,
							height: 20,
						}}
					/>
				)}

				{/* Loading Overlay */}
				{isNavigating && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3"
					>
						<Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
						<span className="text-xs sm:text-sm font-medium text-foreground">
							Хичээл нээж байна...
						</span>
					</motion.div>
				)}

				{/* Image Header - Fixed aspect ratio */}
				<div className="relative w-full aspect-4/2 bg-muted shrink-0">
					{course.filename ? (
						<Image
							src={course.filename}
							alt={course.course_name}
							fill
							className="object-cover transition-transform duration-700 group-hover:scale-105"
							sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
							quality={90}
							priority={index < 6}
						/>
					) : (
						<div className="absolute inset-0 bg--to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
							<Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary/30" />
						</div>
					)}

					{/* Gradient Overlay */}
					<div className="absolute inset-0" />

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
								{/* Uncomment if you want to show price */}
								{/* <Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap bg-orange-500">
									{course.amount.toLocaleString()}₮
								</Badge> */}
							</motion.div>
						)}
					</div>
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
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
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

					{/* Action Button - Responsive with enhanced animation */}
					<motion.div
						className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 md:bottom-3 md:right-3 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-foreground transition-all duration-300"
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
					>
						<ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
					</motion.div>
				</div>
			</motion.button>
		</motion.div>
	);
};
