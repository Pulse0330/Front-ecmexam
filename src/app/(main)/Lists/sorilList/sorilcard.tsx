"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	ClipboardCheck,
	Clock,
	Lock,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SorillistsData } from "@/types/soril/sorilLists";

interface SorilCardProps {
	exam: SorillistsData;
	onClick?: () => void;
}

export const SorilCard: React.FC<SorilCardProps> = ({ exam, onClick }) => {
	const formatDate = (dateStr: string | Date) => {
		try {
			const date = new Date(dateStr);
			if (Number.isNaN(date.getTime())) return "Огноо тодорхойгүй";

			const mongoliaDate = new Date(
				date.toLocaleString("en-US", {
					timeZone: "Asia/Ulaanbaatar",
				}),
			);

			const year = mongoliaDate.getFullYear();
			const month = mongoliaDate.getMonth() + 1;
			const day = mongoliaDate.getDate();

			return `${year}/${month}/${day}`;
		} catch {
			return "Огноо тодорхойгүй";
		}
	};

	const isCompleted = exam.isguitset === 1;
	const isPaid = exam.ispay === 1; // Check if exam is paid

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="h-full"
		>
			<button
				type="button"
				onClick={onClick}
				aria-label={`${exam.soril_name} сорил ${!isPaid ? "(Төлбөр шаардлагатай)" : "нээх"}`}
				className={`group h-full w-full relative flex flex-col backdrop-blur-md cursor-pointer transition-all duration-500 ease-out rounded-lg sm:rounded-xl overflow-hidden text-left ${
					!isPaid
						? "border border-amber-500/40 bg-card/30 hover:shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/60"
						: "border border-border/40 bg-card/50 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20"
				}`}
			>
				<div className="relative w-full aspect-5/2 bg-muted shrink-0">
					{exam.filename ? (
						<Image
							src={exam.filename}
							alt={exam.soril_name}
							fill
							className={`object-cover transition-all duration-700 ${!isPaid ? "brightness-75 group-hover:brightness-90" : ""}`}
							sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
							quality={90}
						/>
					) : (
						<div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
							<Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary/30" />
						</div>
					)}

					{/* Lock Overlay for Unpaid Exams */}
					{!isPaid && (
						<div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
							<div className="">
								<Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
							</div>
						</div>
					)}

					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/50 to-transparent" />

					{/* Status Badge on image - Responsive */}
					<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20">
						{!isPaid ? (
							<Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
								<Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
								Төлбөртэй
							</Badge>
						) : isCompleted ? (
							<Badge className="bg-green-500/90 text-white border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
								<ClipboardCheck className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
								Гүйцэтгэсэн
							</Badge>
						) : (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2 }}
							>
								<Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
									Гүйцэтгээгүй
								</Badge>
							</motion.div>
						)}
					</div>

					{/* Date on Image - Responsive */}
					<div className="absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 z-10">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-0.5 sm:gap-1">
									<Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3  shrink-0" />
									<span className="font-medium text-[8px] sm:text-[9px] md:text-xs  truncate">
										{formatDate(exam.sorildate)}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Сорилын огноо: {formatDate(exam.sorildate)}</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>

				{/* Content Section - багасгасан padding */}
				<div className="p-1.5 sm:p-2 md:p-2.5 pb-7 sm:pb-8 md:pb-9 flex flex-col flex-1 space-y-1 sm:space-y-1.5">
					{/* Plan Name - Optional */}
					{exam.plan_name && (
						<p className="text-[7px] sm:text-[8px] font-medium text-muted-foreground uppercase tracking-wider truncate">
							{exam.plan_name}
						</p>
					)}

					{/* Title Section - line-clamp-1 */}
					<div className="space-y-0.5 flex-1 min-h-0">
						<Tooltip>
							<TooltipTrigger asChild>
								<h3
									className={`text-[10px] sm:text-xs md:text-sm font-semibold line-clamp-1 leading-tight transition-colors duration-300 ${
										!isPaid
											? "text-foreground group-hover:text-amber-500"
											: "text-foreground group-hover:text-primary"
									}`}
								>
									{exam.soril_name}
								</h3>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs">
								<p>{exam.soril_name}</p>
								{!isPaid && (
									<p className="text-amber-500 mt-1">
										Төлбөр төлөх шаардлагатай
									</p>
								)}
							</TooltipContent>
						</Tooltip>
					</div>

					{/* Stats Grid - багасгасан */}
					<div className="flex items-center justify-between gap-1 sm:gap-1.5 pt-1 border-t border-border/50">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
									<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
									<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
										{exam.minut > 0 ? `${exam.minut} мин` : "∞"}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{exam.minut > 0
										? `Сорилын хугацаа: ${exam.minut} минут`
										: "Хугацаа хязгааргүй"}
								</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
									<ClipboardCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
									<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
										{exam.que_cnt} асуулт
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Нийт асуулт: {exam.que_cnt}</p>
							</TooltipContent>
						</Tooltip>
					</div>

					{/* Action Button - багасгасан */}
					<div
						className={`absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 md:bottom-2.5 md:right-2.5 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
							!isPaid
								? "bg-amber-500/20 group-hover:bg-amber-500 group-hover:scale-110"
								: "bg-muted/50 group-hover:bg-foreground group-hover:scale-110"
						}`}
					>
						{!isPaid ? (
							<Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-amber-600 group-hover:text-white transition-all" />
						) : (
							<ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
						)}
					</div>
				</div>
			</button>
		</motion.div>
	);
};
