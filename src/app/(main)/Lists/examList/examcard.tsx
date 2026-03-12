"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	Clock,
	CreditCard,
	FileText,
	Lock,
	Timer,
	Unlock,
	User,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ExamRulesDialog from "@/components/examRuleDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ExamlistsData } from "@/types/exam/examList";

interface ExamCardProps {
	exam: ExamlistsData;
	isPaid: boolean;
	isExpired: boolean;
	onPayClick?: () => void;
	isCreatingInvoice?: boolean;
}
const formatDate = (dateStr: string) => {
	const cleaned = dateStr.replace("T", " ").replace("Z", "").split(".")[0];
	return cleaned.slice(0, 16); // "2026-03-12 17:23"
};
// flag: 0 = Эхлээгүй (хөх), 1 = Идэвхтэй (ногоон), 2+ = Дууссан (саарал)
const getFlagConfig = (flag: number) => {
	switch (flag) {
		case 1:
			return {
				label: "Идэвхтэй",
				Icon: Zap,
				badgeClass: "bg-emerald-500 hover:bg-emerald-600 text-white",
				cardBorder:
					"border-border/40 hover:border-emerald-400/40 hover:shadow-emerald-500/10",
				headerGradient: "from-emerald-500/80 via-emerald-500/30",
				titleHover: "group-hover:text-emerald-500",
				arrowBg: "bg-muted/50 group-hover:bg-emerald-500 group-hover:scale-110",
				arrowIconClass: "text-muted-foreground group-hover:text-white",
			};
		case 0:
			return {
				label: "Эхлээгүй",
				Icon: Timer,
				badgeClass: "bg-blue-500/90 hover:bg-blue-600 text-white",
				cardBorder:
					"border-border/40 hover:border-blue-400/40 hover:shadow-blue-500/10",
				headerGradient: "from-blue-500/70 via-blue-500/30",
				titleHover: "group-hover:text-blue-500",
				arrowBg: "bg-muted/50 group-hover:bg-blue-500 group-hover:scale-110",
				arrowIconClass: "text-muted-foreground group-hover:text-white",
			};
		default:
			return {
				label: "Та энэ шалгалтанд оролцоогүй байна",
				Icon: Clock,
				badgeClass: "bg-slate-500/80 text-white",
				cardBorder:
					"border-border/40 hover:border-slate-400/40 hover:shadow-slate-500/10",
				headerGradient: "from-slate-600/70 via-slate-500/30",
				titleHover: "group-hover:text-slate-400",
				arrowBg: "bg-muted/50 group-hover:bg-slate-500 group-hover:scale-110",
				arrowIconClass: "text-muted-foreground group-hover:text-white",
			};
	}
};

export default function ExamCard({
	exam,
	isPaid,
	isExpired,
	onPayClick,
	isCreatingInvoice,
}: ExamCardProps) {
	const canTakeExam = !isPaid && !isExpired && exam.flag === 1;
	const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
	const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
	const router = useRouter();

	const flagConfig = getFlagConfig(exam.flag);
	const isPurchased = exam.ispurchased === 1;
	const isLocked = isPaid && !isPurchased;

	const handleRulesConfirm = () => {
		if (selectedExamId) {
			router.push(`/exam/${selectedExamId}`);
		}
	};

	const handleCardClick = () => {
		if (canTakeExam) {
			setSelectedExamId(exam.exam_id);
			setRulesDialogOpen(true);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="h-full"
		>
			<button
				type="button"
				onClick={handleCardClick}
				disabled={!canTakeExam}
				aria-label={`${exam.title} шалгалт`}
				className={cn(
					"group h-full w-full relative flex flex-col backdrop-blur-md transition-all duration-500 ease-out rounded-lg sm:rounded-xl overflow-hidden text-left",
					isLocked
						? "border border-amber-500/40 bg-card/30 hover:shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/60"
						: `border bg-card/50 hover:shadow-xl ${flagConfig.cardBorder}`,
					(!canTakeExam || isExpired) && "opacity-60 cursor-not-allowed",
					canTakeExam && !isExpired && "cursor-pointer",
				)}
			>
				{/* Image Header */}
				<div className="relative w-full aspect-5/2 bg-muted shrink-0">
					<div className="absolute inset-0 bg-linear-to-br from-zinc-700 via-zinc-800 to-zinc-900 dark:from-zinc-800 dark:via-zinc-900 dark:to-black" />

					{isLocked && (
						<div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
							<Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
						</div>
					)}

					<div
						className={cn(
							"absolute inset-0 bg-linear-to-t to-transparent",
							isLocked
								? "from-background/85 via-background/50"
								: flagConfig.headerGradient,
						)}
					/>

					{/* Status badge */}
					<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20">
						{isLocked ? (
							<Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
								<Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
								Төлбөртэй
							</Badge>
						) : isPurchased ? (
							<Badge className="bg-green-500/90 text-white border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
								<Unlock className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
								Төлөгдсөн
							</Badge>
						) : (
							<Badge
								className={cn(
									"border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap",
									flagConfig.badgeClass,
								)}
							>
								<flagConfig.Icon className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
								{flagConfig.label}
							</Badge>
						)}
					</div>
				</div>

				{/* Content Section */}
				<div className="p-2 sm:p-3 pb-10 sm:pb-12 flex flex-col flex-1 space-y-2 sm:space-y-3">
					{/* Title Section */}
					<div className="space-y-0.5 sm:space-y-1 flex-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<h3
									className={cn(
										"text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-tight transition-colors duration-300",
										isLocked
											? "group-hover:text-amber-500"
											: flagConfig.titleHover,
									)}
								>
									{exam.title}
								</h3>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs">
								<p>{exam.title}</p>
							</TooltipContent>
						</Tooltip>
						<p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
							{exam.lesson_name}
						</p>
						<p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
							Эхлэх огноо :{exam.ognoo}
						</p>
						<p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
							Дуусах огноо : {formatDate(exam.enddate)}
						</p>
					</div>

					{/* Stats Grid */}
					<div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs">
						<div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-1.5 sm:pb-2 border-b border-border/50">
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1 sm:gap-1.5">
										<Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
										<span className="font-medium text-[9px] sm:text-xs">
											{exam.exam_minute} минут
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>Шалгалтын нийт хугацаа</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1 sm:gap-1.5">
										<FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
										<span className="font-medium text-[9px] sm:text-xs">
											{exam.que_cnt} асуулт
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>Нийт асуултын тоо</p>
								</TooltipContent>
							</Tooltip>
						</div>

						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1 sm:gap-1.5">
									<User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
									<span className="font-medium text-[9px] sm:text-xs">
										{exam.teach_name}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Багш: {exam.teach_name}</p>
							</TooltipContent>
						</Tooltip>
					</div>

					{/* Payment Button */}
					{isPaid && !isExpired && !isPurchased && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									onClick={(e) => {
										e.stopPropagation();
										onPayClick?.();
									}}
									disabled={isCreatingInvoice}
									size="sm"
									variant="default"
									className="w-full h-7 sm:h-8 text-[10px] sm:text-xs mt-1.5 sm:mt-2 bg-amber-500 hover:bg-amber-600 border-0"
								>
									{isCreatingInvoice ? (
										"Уншиж байна..."
									) : (
										<>
											<CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
											Төлбөр төлөх
										</>
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>QPay төлбөрийн QR код үүсгэх</p>
							</TooltipContent>
						</Tooltip>
					)}

					{/* Arrow */}
					<div
						className={cn(
							"absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-none",
							isLocked
								? "bg-amber-500/20 group-hover:bg-amber-500 group-hover:scale-110"
								: flagConfig.arrowBg,
						)}
					>
						{isLocked ? (
							<Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 group-hover:text-white transition-all" />
						) : (
							<ArrowRight
								className={cn(
									"w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-all",
									flagConfig.arrowIconClass,
								)}
							/>
						)}
					</div>
				</div>
			</button>

			<ExamRulesDialog
				open={rulesDialogOpen}
				onOpenChange={setRulesDialogOpen}
				onConfirm={handleRulesConfirm}
				isMobile={false}
			/>
		</motion.div>
	);
}
