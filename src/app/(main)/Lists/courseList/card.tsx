"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	BookOpen,
	Eye,
	Loader2,
	Sparkles,
	Star,
	User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CourseContent } from "@/types/course/courseList";

interface CourseCardProps {
	course: CourseContent;
	userId: number;
	index?: number;
}

export const CourseCard = ({ course, index = 0 }: CourseCardProps) => {
	const router = useRouter();
	const [isNavigating, setIsNavigating] = useState(false);

	const handleCardClick = async () => {
		if (isNavigating) return;
		setIsNavigating(true);
		try {
			await router.push(`/course/${course.content_id}`);
		} catch (error) {
			console.error("Navigation error:", error);
			setIsNavigating(false);
		}
	};

	const isPaid = course.ispay === 1;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			whileHover={{ scale: 0.98 }}
			className="h-full"
		>
			<Card
				onClick={handleCardClick}
				className={cn(
					"group relative flex flex-col h-full overflow-hidden rounded-[28px] border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out cursor-pointer hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20",
					isNavigating && "opacity-70 pointer-events-none",
				)}
			>
				{/* Header Section with Image/Gradient */}
				<div className="relative h-28 w-full overflow-hidden transition-all duration-700">
					{course.filename ? (
						<>
							<Image
								src={course.filename}
								alt={course.course_name}
								fill
								className="object-cover group-hover:scale-110 transition-transform duration-700"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
								priority={false}
							/>
							{/* Overlay */}
							<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
						</>
					) : (
						<>
							<div className="absolute inset-0 bg-linear-to-br from-slate-800 via-slate-700 to-slate-600" />
							<div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size[20px_20px] group-hover:scale-110 transition-transform duration-700" />
							<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
							<div className="absolute inset-0 flex items-center justify-center">
								<BookOpen className="w-12 h-12 text-white/50" />
							</div>
						</>
					)}

					{/* Badges */}
					<div className="absolute top-2 left-2 flex flex-col gap-1.5">
						<Badge
							className={cn(
								"px-3 py-1 rounded-full text-[10px] font-bold border-none shadow-lg w-fit transition-colors",
								isPaid
									? "bg-emerald-500 text-white"
									: "bg-orange-500 text-white",
							)}
						>
							{isPaid ? (
								<>
									<span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white inline-block animate-pulse" />
									✓ Төлбөр төлсөн
								</>
							) : (
								`${course.amount.toLocaleString()}₮`
							)}
						</Badge>
						{course.content_name && (
							<Badge className="px-3 py-1 rounded-full text-[10px] font-bold border-none shadow-lg bg-white/10 backdrop-blur-md text-white max-w-[180px] whitespace-normal text-center leading-tight">
								{course.content_name}
							</Badge>
						)}
					</div>

					{/* Stats Overlay */}
					<div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
						<div className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold">
							<Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
							{course.rate}
						</div>
						<div className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold">
							<Eye className="w-3.5 h-3.5 text-blue-300" />
							{course.views}
						</div>
					</div>
				</div>

				{/* Content Area */}
				<CardContent className="flex flex-col grow p-3 gap-2.5">
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<p className="text-[9px] font-black text-primary/80 uppercase tracking-[0.15em]">
								Хичээл
							</p>
							<Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
						</div>
						<h3 className="font-bold text-foreground leading-snug line-clamp-2 text-xs group-hover:text-primary transition-colors duration-300 min-h-8">
							{course.course_name}
						</h3>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-1 gap-1.5 mt-auto pt-2.5 border-t border-border/50">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="flex items-center gap-1.5" title="Багш">
									<User className="w-3.5 h-3.5 text-purple-500/80" />
									<span className="text-[10px] font-bold text-muted-foreground max-w-20">
										{course.teach_name}
									</span>
								</div>
								<div className="flex items-center gap-1.5" title="Контент">
									<BookOpen className="w-3.5 h-3.5 text-green-500/80" />
									<span className="text-[10px] font-bold text-muted-foreground">
										{course.contentcnt}
									</span>
								</div>
							</div>

							<div
								className={cn(
									"flex items-center justify-center min-w-8 h-8 rounded-full transition-all duration-300",
									"bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110",
								)}
							>
								{isNavigating ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<ArrowRight className="w-4 h-4" />
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};
