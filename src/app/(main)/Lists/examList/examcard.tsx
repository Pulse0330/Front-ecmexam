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
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ExamlistsData } from "@/types/exam/examList";

interface ExamCardProps {
	exam: ExamlistsData;
	index: number;
	isPaid: boolean;
	isExpired: boolean;
	onPayClick?: () => void;
	isCreatingInvoice?: boolean;
}

export default function ExamCard({
	exam,
	index,
	isPaid,
	isExpired,
	onPayClick,
	isCreatingInvoice,
}: ExamCardProps) {
	const canTakeExam = !isPaid && !isExpired && exam.flag === 1;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.1 }}
			className="h-full"
		>
			<Card
				className={cn(
					"group h-full relative overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20",
					isExpired && "opacity-60",
				)}
			>
				{/* Header Section */}
				<div className="relative w-full h-20 overflow-hidden bg-linear-to-br from-primary/20 via-primary/10 to-background">
					{/* Decorative Pattern */}
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />

					{/* Badges */}
					<div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
						{/* Payment Status Badge */}
						<span
							className={cn(
								"px-1.5 py-0 rounded-full text-[10px] font-semibold backdrop-blur-sm border-0 shadow-lg w-fit",
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
							{isPaid &&
								exam.amount > 0 &&
								` - ${exam.amount.toLocaleString()}₮`}
						</span>

						{/* Flag Status Badge */}
						<span
							className={cn(
								"px-1.5 py-0 rounded-full text-[10px] font-semibold backdrop-blur-sm border-0 shadow-lg w-fit",
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
						<div className="absolute top-1.5 right-1.5 z-10">
							<Lock className="w-5 h-5 text-foreground/70" />
						</div>
					)}

					{/* Lesson name overlay */}
					<div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur-md border border-border/40 shadow-sm">
						<FileText className="w-2.5 h-2.5 text-muted-foreground" />
						<span className="text-[10px] font-medium text-foreground">
							{exam.lesson_name}
						</span>
					</div>
				</div>

				{/* Card Content */}
				<CardContent className="p-3 pb-11 space-y-2">
					{/* Title */}
					<div className="relative group/title">
						<h3
							className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300"
							title={exam.title}
						>
							{exam.title}
						</h3>

						{/* Tooltip on hover */}
						<div className="absolute left-0 top-full mt-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border z-50 opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all duration-200 pointer-events-none whitespace-normal max-w-xs">
							{exam.title}
							<div className="absolute -top-1 left-4 w-2 h-2 bg-popover border-l border-t border-border rotate-45"></div>
						</div>
					</div>

					{/* Stats Footer */}
					<div className="flex items-center gap-3 pt-1.5 border-t border-border/40">
						<div className="flex items-center gap-1 text-muted-foreground">
							<Clock className="w-3 h-3" />
							<span className="text-[10px] font-medium">
								{exam.exam_minute}м
							</span>
						</div>
						<div className="flex items-center gap-1 text-muted-foreground">
							<User className="w-3 h-3" />
							<span className="text-[10px] font-medium truncate max-w-[60px]">
								{exam.teach_name}
							</span>
						</div>
						<div className="flex items-center gap-1 text-muted-foreground">
							<FileText className="w-3 h-3" />
							<span className="text-[10px] font-medium">{exam.que_cnt}</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="space-y-2">
						{isPaid ? (
							<Button
								onClick={onPayClick}
								disabled={isCreatingInvoice}
								size="sm"
								className={cn(
									"w-full bg-primary hover:bg-primary/90",
									"text-primary-foreground font-semibold rounded-lg h-7",
									"transition-all duration-200 shadow-sm",
									"flex items-center justify-center gap-1.5 text-xs",
								)}
							>
								{isCreatingInvoice ? (
									<>
										<Loader2 className="w-3 h-3 animate-spin" />
										<span>Уншиж байна...</span>
									</>
								) : (
									<>
										<CreditCard className="w-3 h-3" />
										<span>Төлбөр төлөх</span>
									</>
								)}
							</Button>
						) : exam.ispurchased === 1 ? (
							<div className="flex items-center justify-center gap-1.5 p-1.5 bg-green-500/10 rounded-lg">
								<CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
								<span className="text-[10px] font-medium text-green-600 dark:text-green-400">
									Төлбөр төлөгдсөн
								</span>
							</div>
						) : null}

						{isExpired && (
							<div className="text-center text-[10px] text-muted-foreground py-1">
								Хугацаа дууссан
							</div>
						)}
					</div>

					{/* Action Circle */}
					{canTakeExam && (
						<Link href={`/exam/${exam.exam_id}`} className="block">
							<div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 shadow-sm">
								<ArrowRight className="w-3 h-3 text-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all" />
							</div>
						</Link>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
