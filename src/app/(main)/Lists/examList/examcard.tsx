"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	ClipboardCheck,
	Clock,
	Lock,
	Sparkles,
	User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ExamRulesDialog from "./dialog";

interface ExamlistsData {
	exam_id: number;
	title: string;
	ognoo: string;
	exam_minute: number;
	help: string;
	teach_name: string;
	lesson_name: string;
	exam_type: number;
	flag_name: string;
	flag: number;
	que_cnt: number;
	ispaydescr: string;
	amount: number;
	ispay: number;
	ispurchased: number;
	ispurchaseddescr: string;
	bill_type: number;
	plan_id: number | null;
	plan_name: string | null;
}

interface ExamCardProps {
	exam: ExamlistsData;
	index: number;
}

export default function ExamCard({ exam, index }: ExamCardProps) {
	const router = useRouter();
	const [showRulesDialog, setShowRulesDialog] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const updateWidth = () => setIsMobile(window.innerWidth < 640);
		updateWidth();
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, []);

	const isActive = exam.flag === 1;

	const handleCardClick = () => {
		if (isActive) {
			setShowRulesDialog(true);
		}
	};

	const handleStartExam = () => {
		router.push(`/exam/${exam.exam_id}`);
	};

	return (
		<>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: index * 0.05 }}
				whileHover={isActive ? { scale: 0.98 } : {}}
				className="h-full"
			>
				<Card
					onClick={handleCardClick}
					className={cn(
						"group relative flex flex-col h-full overflow-hidden rounded-[28px] border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out",
						isActive
							? "cursor-pointer hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20"
							: "opacity-70 grayscale-[0.5] cursor-not-allowed",
					)}
				>
					{/* Header Section with Gradient */}
					<div
						className={cn(
							"relative h-40 w-full overflow-hidden transition-all duration-700",
							isActive
								? "bg-linear-to-br from-slate-800 via-slate-700 to-slate-600"
								: "bg-slate-700",
						)}
					>
						{/* Decorative Patterns */}
						<div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size[20px_20px] group-hover:scale-110 transition-transform duration-700" />
						<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

						{/* Badges */}
						<div className="absolute top-4 left-4 flex flex-col gap-2">
							<Badge
								className={cn(
									"px-3 py-1 rounded-full text-[10px] font-bold border-none shadow-lg w-fit transition-colors",
									isActive
										? "bg-emerald-500 text-white"
										: "bg-slate-600 text-white",
								)}
							>
								<span
									className={cn(
										"mr-1.5 h-1.5 w-1.5 rounded-full bg-white inline-block",
										isActive && "animate-pulse",
									)}
								/>
								{exam.flag_name}
							</Badge>
							<Badge className="px-3 py-1 rounded-full text-[10px] font-bold border-none shadow-lg bg-white/10 backdrop-blur-md text-white w-fit">
								{exam.ispaydescr}
							</Badge>
						</div>

						{/* Date/Time Overlay */}
						<div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
							<div className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold">
								<Calendar className="w-3.5 h-3.5 text-blue-300" />
								{exam.ognoo}
							</div>
						</div>
					</div>

					{/* Content Area */}
					<CardContent className="flex flex-col grow p-5 gap-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<p className="text-[10px] font-black text-primary/80 uppercase tracking-[0.15em]">
									{exam.plan_name || "Шалгалт"}
								</p>
								{isActive && (
									<Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
								)}
							</div>
							<h3 className="font-bold text-foreground leading-snug line-clamp-2 text-[16px] group-hover:text-primary transition-colors duration-300 min-h-11">
								{exam.title}
							</h3>
							<h3 className="font-bold text-foreground leading-snug line-clamp-2 text-[16px] group-hover:text-primary transition-colors duration-300 min-h-11">
								{exam.lesson_name}
							</h3>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-1 gap-2 mt-auto pt-4 border-t border-border/50">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-1.5" title="Хугацаа">
										<Clock className="w-4 h-4 text-orange-500/80" />
										<span className="text-xs font-bold text-muted-foreground">
											{exam.exam_minute}м
										</span>
									</div>
									<div className="flex items-center gap-1.5" title="Асуулт">
										<ClipboardCheck className="w-4 h-4 text-blue-500/80" />
										<span className="text-xs font-bold text-muted-foreground">
											{exam.que_cnt}
										</span>
									</div>
									<div className="flex items-center gap-1.5" title="Багш">
										<User className="w-4 h-4 text-purple-500/80" />
										<span className="text-xs font-bold text-muted-foreground truncate max-w-20">
											{exam.teach_name?.split(".").pop() ?? ""}
										</span>
									</div>
								</div>

								<div
									className={cn(
										"flex items-center justify-center min-w-8 h-8 rounded-full transition-all duration-300",
										isActive
											? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110"
											: "bg-muted text-muted-foreground",
									)}
								>
									{isActive ? (
										<ArrowRight className="w-4 h-4" />
									) : (
										<Lock className="w-4 h-4" />
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{isActive && (
				<ExamRulesDialog
					open={showRulesDialog}
					onOpenChange={setShowRulesDialog}
					onConfirm={handleStartExam}
					isMobile={isMobile}
				/>
			)}
		</>
	);
}
