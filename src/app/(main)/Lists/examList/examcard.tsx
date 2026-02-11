import { motion } from "framer-motion";
import {
	ArrowRight,
	CheckCircle2,
	Clock,
	CreditCard,
	FileText,
	Loader2,
	Lock,
	User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ExamRulesDialog from "@/components/examRuleDialog";
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
	const handleRulesConfirm = () => {
		if (selectedExamId) {
			router.push(`/exam/${selectedExamId}`);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="h-full"
		>
			<div
				className={cn(
					"group h-full w-full relative flex flex-col border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 rounded-lg sm:rounded-xl overflow-hidden",
					isExpired && "opacity-60 grayscale-[0.5]",
				)}
			>
				{/* Header Section - Fixed aspect ratio matching image cards */}
				<div className="relative w-full aspect-4/2 bg-linear-to-br from-primary/20 via-primary/10 to-background shrink-0">
					{/* Decorative Pattern */}
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/50 to-transparent" />

					{/* Top Badges */}
					<div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 md:top-2 md:left-2 z-10 flex flex-col gap-0.5 sm:gap-1 max-w-[calc(100%-2.5rem)]">
						{/* Payment Status Badge */}

						<span
							className={cn(
								"px-0.5 sm:px-1 md:px-1.5 lg:px-2 py-0.5 rounded-full text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] font-semibold backdrop-blur-sm border-0 shadow-lg w-fit max-w-full truncate whitespace-nowrap leading-tight",
								isPaid && "bg-orange-500/90 text-white",
								!isPaid &&
									exam.ispurchased === 1 &&
									"bg-green-500/90 text-white",
								!isPaid &&
									exam.ispaydescr === "Төлбөргүй" &&
									"bg-blue-500/90 text-white",
							)}
						>
							{exam.ispaydescr}
							{isPaid && exam.amount > 0 && (
								<span className="hidden sm:inline">
									{" "}
									- {exam.amount.toLocaleString()}₮
								</span>
							)}
						</span>

						{/* Flag Status Badge */}

						<span
							className={cn(
								"px-0.5 sm:px-1 md:px-1.5 lg:px-2 py-0.5 rounded-full text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] font-semibold backdrop-blur-sm border-0 shadow-lg w-fit max-w-full truncate whitespace-nowrap leading-tight",
								exam.flag === 1 && "bg-green-500/90 text-white",
								exam.flag === 2 && "bg-yellow-500/90 text-white",
								exam.flag === 3 && "bg-red-500/90 text-white",
							)}
						>
							{exam.flag_name}
						</span>
					</div>

					{/* Lock icon for paid exams */}
					{isPaid && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 md:top-2 md:right-2 z-10">
									<Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white/90" />
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Төлбөр төлөх шаардлагатай</p>
							</TooltipContent>
						</Tooltip>
					)}

					{/* Lesson name overlay - Bottom */}
					<div className="absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 md:p-2 z-10">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5">
									<FileText className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 text-white/90 shrink-0" />
									<span className="font-medium text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs text-white/90 truncate">
										{exam.lesson_name}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>{exam.lesson_name} хичээл</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>

				{/* Content Section - Responsive padding */}
				<div className="p-1 sm:p-1.5 md:p-2 lg:p-3 pb-7 sm:pb-8 md:pb-9 lg:pb-12 flex flex-col flex-1 space-y-0.5 sm:space-y-1 md:space-y-1.5 lg:space-y-2">
					{/* Title Section */}
					<div className="space-y-0.5 flex-1 min-h-0">
						<Tooltip>
							<TooltipTrigger asChild>
								<h3 className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
									{exam.title}
								</h3>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs">
								<p>{exam.title}</p>
							</TooltipContent>
						</Tooltip>
					</div>

					{/* Stats Grid */}
					<div className="space-y-0.5 sm:space-y-1 md:space-y-1.5">
						<div className="flex items-center justify-between gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 pt-0.5 sm:pt-1 md:pt-1.5 lg:pt-2 border-t border-border/50">
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-0.5 text-muted-foreground min-w-0">
										<Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 shrink-0" />
										<span className="font-medium text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs truncate">
											{exam.exam_minute}
											<span className="hidden xs:inline">м</span>
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>Шалгалтын хугацаа: {exam.exam_minute} минут</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-0.5 text-muted-foreground min-w-0 flex-1">
										<User className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 shrink-0" />
										<span className="font-medium text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs truncate">
											{exam.teach_name}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>Багш: {exam.teach_name}</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-0.5 text-muted-foreground min-w-0">
										<FileText className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 shrink-0" />
										<span className="font-medium text-[7px] sm:text-[8px] md:text-[9px] lg:text-xs truncate">
											{exam.que_cnt}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p>Нийт асуулт: {exam.que_cnt}</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>

					{/* Action Buttons - Positioned Absolutely */}
					{(isPaid && !isExpired) || exam.ispurchased === 1 || isExpired ? (
						<div className="absolute bottom-1 left-1 right-1 sm:bottom-1.5 sm:left-1.5 sm:right-1.5 md:bottom-2 md:left-2 md:right-2 lg:bottom-3 lg:left-3 lg:right-3 z-20">
							{isPaid && !isExpired ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											onClick={onPayClick}
											disabled={isCreatingInvoice}
											size="sm"
											className={cn(
												"w-full bg-primary hover:bg-primary/90",
												"text-primary-foreground font-semibold rounded-md sm:rounded-lg h-5 sm:h-6 md:h-7",
												"transition-all duration-200 shadow-sm",
												"flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs",
											)}
										>
											{isCreatingInvoice ? (
												<>
													<Loader2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 animate-spin shrink-0" />
													<span className="truncate">
														<span className="hidden xs:inline">Уншиж </span>
														байна...
													</span>
												</>
											) : (
												<>
													<CreditCard className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 shrink-0" />
													<span className="truncate">
														<span className="hidden xs:inline">Төлбөр </span>
														төлөх
													</span>
												</>
											)}
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>QPay төлбөрийн QR код үүсгэх</p>
									</TooltipContent>
								</Tooltip>
							) : exam.ispurchased === 1 ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 p-0.5 sm:p-1 md:p-1.5 bg-green-500/10 rounded-md sm:rounded-lg h-5 sm:h-6 md:h-7">
											<CheckCircle2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 shrink-0 text-green-600 dark:text-green-400" />
											<span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-green-600 dark:text-green-400 truncate">
												<span className="hidden xs:inline">Төлбөр </span>
												төлөгдсөн
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Төлбөр амжилттай төлөгдсөн</p>
									</TooltipContent>
								</Tooltip>
							) : isExpired ? (
								<Tooltip>
									<TooltipTrigger asChild>
										<div className="text-center text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground py-0.5 sm:py-1 h-5 sm:h-6 md:h-7 flex items-center justify-center">
											Хугацаа дууссан
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Шалгалтын хугацаа дууссан байна</p>
									</TooltipContent>
								</Tooltip>
							) : null}
						</div>
					) : null}
					<ExamRulesDialog
						open={rulesDialogOpen}
						onOpenChange={setRulesDialogOpen}
						onConfirm={handleRulesConfirm}
						isMobile={false}
					/>
					{/* Action Circle - Only for available exams */}
					{canTakeExam && (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									onClick={() => {
										setSelectedExamId(exam.exam_id);
										setRulesDialogOpen(true);
									}}
									className="block absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 md:bottom-2 md:right-2 lg:bottom-3 lg:right-3 z-10"
								>
									<div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-foreground group-hover:scale-110 transition-all duration-300">
										<ArrowRight className="w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
									</div>
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Дарж шалгалт өгөх</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</div>
		</motion.div>
	);
}
