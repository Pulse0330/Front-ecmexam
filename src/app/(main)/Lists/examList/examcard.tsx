import { motion } from "framer-motion";
import {
	ArrowRight,
	Clock,
	CreditCard,
	FileText,
	Lock,
	Unlock,
	User,
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
					"group h-full w-full relative flex flex-col border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out rounded-lg sm:rounded-xl overflow-hidden text-left",
					canTakeExam
						? "cursor-pointer hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20"
						: "opacity-60 cursor-not-allowed",
				)}
			>
				{/* Content Section - Responsive padding */}
				<div className="p-2 sm:p-3 pb-10 sm:pb-12 flex flex-col flex-1 space-y-2 sm:space-y-3">
					{/* Status Badges */}
					<div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
						<Tooltip>
							<TooltipTrigger asChild>
								<Badge
									variant={exam.flag === 1 ? "default" : "secondary"}
									className="px-1.5 sm:px-2 py-0 text-[8px] sm:text-[9px] font-medium"
								>
									{exam.flag === 1 ? "Идэвхтэй" : exam.flag_name}
								</Badge>
							</TooltipTrigger>
						</Tooltip>

						{isPaid && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge
										variant={exam.ispurchased === 1 ? "default" : "outline"}
										className="px-1.5 sm:px-2 py-0 text-[8px] sm:text-[9px] font-medium"
									>
										{exam.ispurchased === 1 ? (
											<>
												<Unlock className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
												Төлөгдсөн
											</>
										) : (
											<>
												<Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
												Төлбөртэй
											</>
										)}
									</Badge>
								</TooltipTrigger>
								<TooltipContent>
									<p>
										{exam.ispurchased === 1
											? "Төлбөр төлөгдсөн"
											: `Төлбөрийн дүн: ${exam.amount || 0}₮`}
									</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>

					{/* Title Section */}
					<div className="space-y-0.5 sm:space-y-1 flex-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-tight">
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
					{isPaid && !isExpired && exam.ispurchased !== 1 && (
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
									className="w-full h-7 sm:h-8 text-[10px] sm:text-xs mt-1.5 sm:mt-2"
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

					{/* Action Button - Only for accessible exams */}
					{canTakeExam && (!isPaid || exam.ispurchased === 1) && (
						<div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-foreground group-hover:scale-110 transition-all duration-300 pointer-events-none">
							<ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
						</div>
					)}
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
