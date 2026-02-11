"use client";

import axios from "axios";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	Clock,
	CreditCard,
	FileText,
	HelpCircle,
	Loader2,
	Lock,
	Unlock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QPayDialog from "@/app/(main)/Lists/examList/qpayDialog";
import ExamRulesDialog from "@/components/examRuleDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
];

const formatMongolianDateTime = (dateString: string) => {
	const date = new Date(dateString);
	return {
		date: `${date.getFullYear()} оны ${MONGOLIAN_MONTHS[date.getMonth()]} ${date.getDate()}`,
		time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
	};
};

export default function ExamList({ exams, onPaymentSuccess }: ExamListProps) {
	const router = useRouter();
	const { userId } = useAuthStore();

	const [qpayDialogOpen, setQpayDialogOpen] = useState(false);
	const [qpayData, setQpayData] = useState<QPayInvoiceResponse | null>(null);
	const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

	// Rules dialog state
	const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
	const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

	// Loading state for navigation
	const [isNavigating, setIsNavigating] = useState(false);

	const handleCreateInvoice = async (exam: Exam, e: React.MouseEvent) => {
		e.stopPropagation();

		if (!userId) {
			// Алдааг зүгээр log хийнэ, хэрэглэгчид харуулахгүй
			console.warn("User not authenticated");
			return;
		}

		try {
			setIsCreatingInvoice(true);

			const response = await axios.post("/api/examqpay/invoice", {
				amount: exam.amount?.toString() || "0",
				userid: userId.toString(),
				device_token: "",
				orderid: exam.bill_type?.toString() || "0",
				bilid: exam.exam_id.toString(),
				classroom_id: "0",
			});

			if (response.data) {
				setQpayData(response.data);
				setQpayDialogOpen(true);
			}
		} catch (error) {
			// Алдааг зөвхөн console-д log хийнэ
			console.error("Error creating QPay invoice:", error);
			// Хэрэглэгчид ямар ч мэдэгдэл харуулахгүй
		} finally {
			setIsCreatingInvoice(false);
		}
	};

	const handlePaymentSuccess = () => {
		if (onPaymentSuccess) {
			onPaymentSuccess();
		}
	};

	// Handle exam card click - show rules dialog first
	const handleExamClick = (examId: number, canTake: boolean) => {
		if (!canTake || isNavigating) return;
		setSelectedExamId(examId);
		setRulesDialogOpen(true);
	};

	// Handle rules confirmation - navigate to exam
	const handleRulesConfirm = () => {
		if (selectedExamId) {
			setIsNavigating(true);
			router.push(`/exam/${selectedExamId}`);
		}
	};

	if (!exams?.length)
		return (
			<div className="flex flex-col items-center py-24 text-muted-foreground col-span-full">
				<HelpCircle className="w-12 h-12 mb-4 stroke-[1.5px]" />
				<p className="font-medium tracking-tight">Шалгалт олдсонгүй</p>
			</div>
		);

	return (
		<TooltipProvider>
			{/* Loading Overlay */}
			{isNavigating && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="w-12 h-12 animate-spin text-primary" />
						<p className="text-sm font-medium text-foreground">
							Шалгалт ачааллаж байна...
						</p>
					</div>
				</div>
			)}

			{exams.map((exam, index) => {
				const isActive = exam.flag === 1;
				const isPaid =
					exam.ispaydescr?.toLowerCase().includes("төлбөртэй") ||
					exam.ispaydescr?.toLowerCase().includes("paid");
				const isPurchased = exam.ispurchased === 1;
				const dt = formatMongolianDateTime(exam.ognoo);

				const canTakeExam = isActive && (!isPaid || isPurchased);

				return (
					<motion.div
						key={exam.exam_id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: index * 0.05 }}
						className="h-full"
					>
						<Tooltip>
							<TooltipTrigger asChild>
								<Card
									onClick={() =>
										canTakeExam && handleExamClick(exam.exam_id, canTakeExam)
									}
									onKeyDown={(e) => {
										if (canTakeExam && (e.key === "Enter" || e.key === " ")) {
											e.preventDefault();
											handleExamClick(exam.exam_id, canTakeExam);
										}
									}}
									role="button"
									tabIndex={canTakeExam ? 0 : -1}
									aria-label={`${exam.title} шалгалт`}
									className={cn(
										"group h-full relative flex flex-col overflow-hidden rounded-lg sm:rounded-xl border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out",
										canTakeExam && !isNavigating
											? "cursor-pointer hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20"
											: "opacity-60 cursor-not-allowed",
									)}
								>
									<CardContent className="p-2 sm:p-3 pb-10 sm:pb-12 flex flex-col flex-1 space-y-2 sm:space-y-3">
										{/* Status Badges */}
										<div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
											<Tooltip>
												<TooltipTrigger asChild>
													<Badge
														variant={isActive ? "default" : "secondary"}
														className="px-1.5 sm:px-2 py-0 text-[8px] sm:text-[9px] font-medium"
													>
														{isActive ? "Идэвхтэй" : "Хаагдсан"}
													</Badge>
												</TooltipTrigger>
											</Tooltip>

											{isPaid && (
												<Tooltip>
													<TooltipTrigger asChild>
														<Badge
															variant={isPurchased ? "default" : "outline"}
															className="px-1.5 sm:px-2 py-0 text-[8px] sm:text-[9px] font-medium"
														>
															{isPurchased ? (
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
															{isPurchased
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

										{/* Info Grid */}
										<div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs">
											{/* Date & Time */}
											<div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-1.5 sm:pb-2 border-b border-border/50">
												<div className="flex items-center gap-1 sm:gap-1.5">
													<Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
													<span className="font-medium text-[9px] sm:text-xs">
														{dt.date}
													</span>
												</div>

												<div className="flex items-center gap-1 sm:gap-1.5">
													<Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
													<span className="font-medium text-[9px] sm:text-xs">
														{dt.time}
													</span>
												</div>
											</div>

											{/* Stats */}
											<div className="flex items-center justify-between gap-1.5 sm:gap-2">
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
										</div>

										{/* Payment Button */}
										{isPaid && !isPurchased && isActive && (
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														onClick={(e) => handleCreateInvoice(exam, e)}
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
										{canTakeExam && (!isPaid || isPurchased) && (
											<div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-foreground group-hover:scale-110 transition-all duration-300">
												<ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
											</div>
										)}
									</CardContent>
								</Card>
							</TooltipTrigger>
						</Tooltip>
					</motion.div>
				);
			})}

			{/* QPay Dialog */}
			<QPayDialog
				open={qpayDialogOpen}
				onOpenChange={setQpayDialogOpen}
				qpayData={qpayData}
				userId={userId}
				onPaymentSuccess={handlePaymentSuccess}
			/>

			{/* Exam Rules Dialog */}
			<ExamRulesDialog
				open={rulesDialogOpen}
				onOpenChange={setRulesDialogOpen}
				onConfirm={handleRulesConfirm}
				isMobile={false}
			/>
		</TooltipProvider>
	);
}
