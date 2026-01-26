"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	ClipboardCheck,
	Clock,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SorillistsData } from "@/types/soril/sorilLists";

interface SorilCardProps {
	exam: SorillistsData;
	onClick?: () => void;
	index?: number;
}

export const SorilCard: React.FC<SorilCardProps> = ({
	exam,
	onClick,
	index = 0,
}) => {
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

			return `${year} оны ${month} сарын ${day}`;
		} catch {
			return "Огноо тодорхойгүй";
		}
	};

	const isCompleted = exam.isguitset === 1;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1, duration: 0.4 }}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
			role="button"
			tabIndex={0}
			aria-label={`${exam.soril_name} сорил нээх`}
			className={cn(
				"group h-full relative overflow-hidden rounded-[28px] border border-border/40 bg-card/50 backdrop-blur-md cursor-pointer",
				"transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20",
			)}
		>
			{/* --- Image Section --- */}
			<div className="relative w-full h-24 overflow-hidden">
				{exam.filename ? (
					<Image
						src={exam.filename}
						alt={exam.soril_name}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-110"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				) : (
					<div className="w-full h-full bg-linear-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
						<Sparkles className="w-10 h-10 text-primary/30" />
					</div>
				)}

				{/* Decorative Pattern */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

				{/* Gradient Overlay */}
				<div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />

				{/* Status Badge */}
				<div className="absolute top-2 left-2 z-10">
					{!isCompleted && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2 }}
						></motion.div>
					)}
					{isCompleted && (
						<Badge className="bg-green-500/90 text-white backdrop-blur-sm border-0 px-2.5 py-0.5 text-xs">
							<ClipboardCheck className="w-3 h-3 mr-1" />
							Дууссан
						</Badge>
					)}
				</div>

				{/* Date Overlay */}
				<div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/40">
					<Calendar className="w-3 h-3 text-muted-foreground" />
					<span className="text-xs font-medium text-foreground">
						{formatDate(exam.sorildate)}
					</span>
				</div>
			</div>

			{/* --- Content Section --- */}
			<CardContent className="p-4 space-y-3">
				<div className="space-y-2">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						{exam.plan_name || "Хичээлийн сорил"}
					</p>
					<h3 className="text-base font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
						{exam.soril_name}
					</h3>
				</div>

				{/* Stats Footer */}
				<div className="flex items-center gap-4 pt-2 border-t border-border/40">
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Clock className="w-4 h-4" />
						<span className="text-xs font-medium">
							{exam.minut > 0 ? `${exam.minut} мин` : "Хязгааргүй"}
						</span>
					</div>
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<ClipboardCheck className="w-4 h-4" />
						<span className="text-xs font-medium">{exam.que_cnt} асуулт</span>
					</div>
				</div>

				{/* Action Circle */}
				<div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
					<ArrowRight className="w-4 h-4 text-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all" />
				</div>
			</CardContent>
		</motion.div>
	);
};
