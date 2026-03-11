"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	Clock,
	CreditCard,
	FileText,
	Loader2,
	Lock,
	Unlock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo, useState } from "react";
import QPayDialog from "@/app/(main)/Lists/examList/qpayDialog";
import ExamRulesDialog from "@/components/examRuleDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Exam } from "@/types/home";
import type { QPayInvoiceResponse } from "@/types/Qpay/qpayinvoice";

interface ExamListProps {
	exams: Exam[];
	onPaymentSuccess?: () => void;
}

const MONGOLIAN_MONTHS = [
	"1-р сарын",
	"2-р сарын",
	"3-р сарын",
	"4-р сарын",
	"5-р сарын",
	"6-р сарын",
	"7-р сарын",
	"8-р сарын",
	"9-р сарын",
	"10-р сарын",
	"11-р сарын",
	"12-р сарын",
] as const;

const dateFormatCache = new Map<string, { date: string; time: string }>();

function formatMongolianDateTime(dateString: string) {
	const cached = dateFormatCache.get(dateString);
	if (cached) return cached;
	const d = new Date(dateString);
	const result = {
		date: `${MONGOLIAN_MONTHS[d.getMonth()]} ${d.getDate()}`,
		time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
	};
	dateFormatCache.set(dateString, result);
	return result;
}

function computeExamStatus(exam: Exam) {
	const isActive = exam.flag === 1;
	const descr = exam.ispaydescr?.toLowerCase() ?? "";
	const isPaid = descr.includes("төлбөртэй") || descr.includes("paid");
	const isPurchased = exam.ispurchased === 1;
	const isLocked = isPaid && !isPurchased;
	const canTakeExam = isActive && (!isPaid || isPurchased);
	return { isActive, isPaid, isPurchased, isLocked, canTakeExam };
}

// ============================================================================
// SINGLE EXAM CARD
// ============================================================================

interface ExamCardItemProps {
	exam: Exam;
	index: number;
	isNavigating: boolean;
	loadingExamId: number | null;
	onExamClick: (examId: number, canTake: boolean) => void;
	onCreateInvoice: (exam: Exam, e: React.MouseEvent) => void;
}

const ExamCardItem = memo(
	({
		exam,
		index,
		isNavigating,
		loadingExamId,
		onExamClick,
		onCreateInvoice,
	}: ExamCardItemProps) => {
		const { isActive, isPurchased, isLocked, canTakeExam } = useMemo(
			() => computeExamStatus(exam),
			[exam],
		);

		const dt = formatMongolianDateTime(exam.ognoo);
		const isThisCardLoading = loadingExamId === exam.exam_id;

		const handleClick = useCallback(() => {
			onExamClick(exam.exam_id, canTakeExam);
		}, [exam.exam_id, canTakeExam, onExamClick]);

		const handleInvoice = useCallback(
			(e: React.MouseEvent) => onCreateInvoice(exam, e),
			[exam, onCreateInvoice],
		);

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: index * 0.05 }}
				className="h-full"
			>
				<button
					type="button"
					onClick={handleClick}
					aria-label={`${exam.title} шалгалт`}
					className={cn(
						"group h-full w-full relative flex flex-col backdrop-blur-md transition-all duration-500 ease-out rounded-lg sm:rounded-xl overflow-hidden text-left",
						isLocked
							? "border border-amber-500/40 bg-card/30 hover:shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/60"
							: "border border-border/40 bg-card/50 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20",
						(!canTakeExam || isNavigating) && "opacity-60 cursor-not-allowed",
						canTakeExam && !isNavigating && "cursor-pointer",
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

						<div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/50 to-transparent" />

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
									variant={isActive ? "default" : "secondary"}
									className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap"
								>
									{isActive ? "Идэвхтэй" : "Идэвхгүй"}
								</Badge>
							)}
						</div>

						{/* Date */}
						<div className="absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 z-10">
							<div className="flex items-center gap-0.5 sm:gap-1">
								<Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
									{dt.date}
								</span>
							</div>
						</div>
					</div>

					{/* Body */}
					<div className="p-1.5 sm:p-2 md:p-2.5 pb-7 sm:pb-8 md:pb-9 flex flex-col flex-1 space-y-1 sm:space-y-1.5">
						<div className="space-y-0.5 flex-1 min-h-0">
							<Tooltip>
								<TooltipTrigger asChild>
									<h3
										className={cn(
											"text-[10px] sm:text-xs md:text-sm font-semibold line-clamp-1 leading-tight transition-colors duration-300",
											isLocked
												? "text-foreground group-hover:text-amber-500"
												: "text-foreground group-hover:text-primary",
										)}
									>
										{exam.title}
									</h3>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<p>{exam.title}</p>
								</TooltipContent>
							</Tooltip>
							{exam.lesson_name && (
								<p className="text-[7px] sm:text-[8px] font-medium text-muted-foreground uppercase tracking-wider truncate">
									{exam.lesson_name}
								</p>
							)}
						</div>

						{/* Stats */}
						<div className="flex items-center justify-between gap-1 sm:gap-1.5 pt-1 border-t border-border/50">
							<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
								<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
									{exam.exam_minute} мин
								</span>
							</div>
							<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
								<FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
									{exam.que_cnt} асуулт
								</span>
							</div>
						</div>

						{/* Pay button */}
						{isLocked && isActive && (
							<Button
								onClick={handleInvoice}
								disabled={isThisCardLoading}
								size="sm"
								variant="default"
								className="w-full h-7 sm:h-8 text-[10px] sm:text-xs bg-amber-500 hover:bg-amber-600 border-0"
							>
								{isThisCardLoading ? (
									<Loader2 className="w-3 h-3 animate-spin" />
								) : (
									<>
										<CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
										Төлбөр төлөх
									</>
								)}
							</Button>
						)}

						{/* Arrow */}
						<div
							className={cn(
								"absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 md:bottom-2.5 md:right-2.5 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all duration-300",
								isLocked
									? "bg-amber-500/20 group-hover:bg-amber-500 group-hover:scale-110"
									: "bg-muted/50 group-hover:bg-foreground group-hover:scale-110",
							)}
						>
							{isLocked ? (
								<Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-amber-600 group-hover:text-white transition-all" />
							) : (
								<ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
							)}
						</div>
					</div>
				</button>
			</motion.div>
		);
	},
	(prev, next) =>
		prev.exam === next.exam &&
		prev.isNavigating === next.isNavigating &&
		(prev.loadingExamId === next.loadingExamId ||
			(prev.loadingExamId !== prev.exam.exam_id &&
				next.loadingExamId !== next.exam.exam_id)),
);

ExamCardItem.displayName = "ExamCardItem";

// ============================================================================
// EXAM LIST PARENT
// ============================================================================

const ExamList = memo(function ExamList({
	exams,
	onPaymentSuccess,
}: ExamListProps) {
	const router = useRouter();
	const { userId } = useAuthStore();
	const queryClient = useQueryClient();

	const [qpayDialogOpen, setQpayDialogOpen] = useState(false);
	const [qpayData, setQpayData] = useState<QPayInvoiceResponse | null>(null);
	const [loadingExamId, setLoadingExamId] = useState<number | null>(null);
	const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
	const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
	const [isNavigating, setIsNavigating] = useState(false);

	const handleCreateInvoice = useCallback(
		async (exam: Exam, e: React.MouseEvent) => {
			e.stopPropagation();
			if (!userId) return;
			setLoadingExamId(exam.exam_id);
			try {
				const response = await axios.post("/api/examqpay/invoice", {
					amount: exam.amount?.toString() ?? "0",
					userid: userId.toString(),
					device_token: "",
					orderid: exam.bill_type?.toString() ?? "0",
					bilid: exam.exam_id.toString(),
					classroom_id: "0",
				});
				if (response.data) {
					setQpayData(response.data);
					setQpayDialogOpen(true);
				}
			} catch {
				// silent
			} finally {
				setLoadingExamId(null);
			}
		},
		[userId],
	);

	const handlePaymentSuccess = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ["homeScreen"] });
		queryClient.invalidateQueries({ queryKey: ["examList"] });
		onPaymentSuccess?.();
	}, [onPaymentSuccess, queryClient]);

	const handleExamClick = useCallback(
		(examId: number, canTake: boolean) => {
			if (!canTake || isNavigating) return;
			setSelectedExamId(examId);
			setRulesDialogOpen(true);
		},
		[isNavigating],
	);

	const handleRulesConfirm = useCallback(async () => {
		if (!selectedExamId) return;
		try {
			setIsNavigating(true);
			await router.push(`/exam/${selectedExamId}`);
		} catch {
			// silent
		} finally {
			setIsNavigating(false);
		}
	}, [selectedExamId, router]);

	if (!exams?.length) return null;

	return (
		<TooltipProvider>
			{exams.map((exam, index) => (
				<ExamCardItem
					key={exam.exam_id}
					exam={exam}
					index={index}
					isNavigating={isNavigating}
					loadingExamId={loadingExamId}
					onExamClick={handleExamClick}
					onCreateInvoice={handleCreateInvoice}
				/>
			))}

			<QPayDialog
				open={qpayDialogOpen}
				onOpenChange={setQpayDialogOpen}
				qpayData={qpayData}
				userId={userId}
				onPaymentSuccess={handlePaymentSuccess}
			/>

			<ExamRulesDialog
				open={rulesDialogOpen}
				onOpenChange={setRulesDialogOpen}
				onConfirm={handleRulesConfirm}
				isMobile={false}
			/>
		</TooltipProvider>
	);
});

export default ExamList;
