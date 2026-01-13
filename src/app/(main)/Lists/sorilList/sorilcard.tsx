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
import { Card, CardContent } from "@/components/ui/card";
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
			return date.toLocaleDateString("mn-MN", {
				month: "short",
				day: "2-digit",
			});
		} catch {
			return "Огноо тодорхойгүй";
		}
	};

	const isCompleted = exam.isguitset === 1;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			whileHover={{ scale: 0.95 }}
			className="h-full"
		>
			<Card
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
				<div className="relative h-48 overflow-hidden">
					{exam.filename ? (
						<Image
							src={exam.filename}
							alt={exam.soril_name}
							fill
							className="object-cover transition-transform duration-700 group-hover:scale-110"
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
							loading={index < 4 ? "eager" : "lazy"}
						/>
					) : (
						<div className="w-full h-full bg-linear-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
							<Sparkles className="w-12 h-12 text-primary/20" />
						</div>
					)}

					{/* Decorative Pattern */}
					<div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size[20px_20px] group-hover:scale-110 transition-transform duration-700" />

					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

					{/* Status Badge */}
					<div className="absolute top-4 left-4">
						<Badge
							className={cn(
								"px-3 py-1 rounded-full text-[10px] font-bold border-none shadow-lg w-fit",
								isCompleted
									? "bg-emerald-500 text-white"
									: "bg-primary text-white",
							)}
						>
							{!isCompleted && (
								<span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white animate-pulse inline-block" />
							)}
							{isCompleted ? "Дууссан" : "Шинэ сорил"}
						</Badge>
					</div>

					{/* Date Overlay */}
					<div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-xs font-medium">
						<Calendar className="w-3.5 h-3.5" />
						{formatDate(exam.sorildate)}
					</div>
				</div>

				{/* --- Content Section --- */}
				<CardContent className="flex flex-col grow p-6 gap-5">
					<div className="space-y-2">
						<p className="text-[10px] font-black text-primary/80 uppercase tracking-[0.15em]">
							{exam.plan_name || "Хичээлийн сорил"}
						</p>
						<h3 className="font-bold text-foreground leading-snug line-clamp-2 text-[17px] group-hover:text-primary transition-colors duration-300">
							{exam.soril_name}
						</h3>
					</div>

					{/* Stats Footer */}
					<div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1.5" title="Хугацаа">
								<Clock className="w-4 h-4 text-orange-500/80" />
								<span className="text-xs font-bold text-muted-foreground">
									{exam.minut > 0 ? `${exam.minut} минут` : "∞"}
								</span>
							</div>
							<div className="flex items-center gap-1.5" title="Асуултын тоо">
								<ClipboardCheck className="w-4 h-4 text-blue-500/80" />
								<span className="text-xs font-bold text-muted-foreground">
									{exam.que_cnt}
								</span>
							</div>
						</div>

						{/* Action Circle */}
						<div className="flex items-center justify-center min-w-9 h-9 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
							<ArrowRight className="w-5 h-5" />
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};
