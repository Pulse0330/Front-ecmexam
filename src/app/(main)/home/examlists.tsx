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
	Lock,
	Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QPayDialog from "@/app/(main)/Lists/examList/qpayDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Exam } from "@/types/home";
import type { QPayInvoiceResponse } from "@/types/Qpay/qpayinvoice";

interface ExamListProps {
	exams: Exam[];
	onPaymentSuccess?: () => void;
}

const MONGOLIAN_MONTHS = [
	"1-р сар",
	"2-р сар",
	"3-р сар",
	"4-р сар",
	"5-р сар",
	"6-р сар",
	"7-р сар",
	"8-р сар",
	"9-р сар",
	"10-р сар",
	"11-р сар",
	"12-р сар",
];

const formatMongolianDateTime = (dateString: string) => {
	const date = new Date(dateString);
	return {
		date: `${MONGOLIAN_MONTHS[date.getMonth()]} ${date.getDate()}`,
		time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
	};
};

export default function ExamList({ exams, onPaymentSuccess }: ExamListProps) {
	const router = useRouter();
	const { userId } = useAuthStore();

	// QPay states
	const [qpayDialogOpen, setQpayDialogOpen] = useState(false);
	const [qpayData, setQpayData] = useState<QPayInvoiceResponse | null>(null);
	const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

	// QPay invoice үүсгэх функц
	const handleCreateInvoice = async (exam: Exam, e: React.MouseEvent) => {
		e.stopPropagation(); // Card click-ээс зайлсхийх

		if (!userId) {
			alert("Нэвтрэх шаардлагатай");
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

			console.log("QPay Invoice Created:", response.data);

			if (response.data) {
				setQpayData(response.data);
				setQpayDialogOpen(true);
			}
		} catch (error) {
			console.error("Error creating QPay invoice:", error);
			alert("Төлбөрийн QR код үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
		} finally {
			setIsCreatingInvoice(false);
		}
	};

	// Төлбөр амжилттай төлөгдсөний дараа
	const handlePaymentSuccess = () => {
		if (onPaymentSuccess) {
			onPaymentSuccess();
		}
	};

	if (!exams?.length)
		return (
			<div className="flex flex-col items-center py-24 opacity-40">
				<HelpCircle className="w-12 h-12 mb-4 stroke-[1.5px]" />
				<p className="font-bold tracking-tight">Шалгалт олдсонгүй</p>
			</div>
		);

	return (
		<>
			<div className="px-2">
				{/* Compact 6-Column Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
					{exams.map((exam, index) => {
						const isActive = exam.flag === 1;
						const isPaid =
							exam.ispaydescr?.toLowerCase().includes("төлбөртэй") ||
							exam.ispaydescr?.toLowerCase().includes("paid");
						const isPurchased = exam.ispurchased === 1;
						const dt = formatMongolianDateTime(exam.ognoo);

						// Төлбөртэй боловч төлөгдөөгүй бол шалгалт өгч болохгүй
						const canTakeExam = isActive && (!isPaid || isPurchased);

						return (
							<motion.div
								key={exam.exam_id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: index * 0.1 }}
								className="h-full"
							>
								<Card
									onClick={() =>
										canTakeExam && router.push(`/exam/${exam.exam_id}`)
									}
									onKeyDown={(e) => {
										if (canTakeExam && (e.key === "Enter" || e.key === " ")) {
											e.preventDefault();
											router.push(`/exam/${exam.exam_id}`);
										}
									}}
									role="button"
									tabIndex={canTakeExam ? 0 : -1}
									aria-label={`${exam.title} шалгалт`}
									className={cn(
										"group h-full relative overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out",
										canTakeExam
											? "cursor-pointer hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20"
											: "opacity-50 cursor-not-allowed",
									)}
								>
									{/* Compact Image/Header Section */}
									<div className="relative w-full h-20 overflow-hidden">
										{/* Gradient Background */}
										<div className="w-full h-full bg-linear-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
											<Sparkles className="w-8 h-8 text-primary/30" />
										</div>

										{/* Decorative Pattern */}
										<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

										{/* Gradient Overlay */}
										<div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />

										{/* Status Badges */}
										<div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
											<Badge
												className={cn(
													"px-1.5 py-0 text-[10px] backdrop-blur-sm border-0 shadow-lg",
													isActive
														? "bg-green-500/90 text-white"
														: "bg-gray-500/90 text-white",
												)}
											>
												{isActive ? "Идэвхтэй" : "Хаагдсан"}
											</Badge>
											{isPaid && (
												<Badge
													className={cn(
														"px-1.5 py-0 text-[10px] backdrop-blur-sm border-0 shadow-lg",
														isPurchased
															? "bg-blue-500/90 text-white"
															: "bg-orange-500/90 text-white",
													)}
												>
													<Lock className="w-2.5 h-2.5 mr-0.5" />
													{isPurchased ? "Төлөгдсөн" : "Төлбөртэй"}
												</Badge>
											)}
										</div>

										{/* Date & Time Overlay */}
										<div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
											<div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur-md border border-border/40 shadow-sm">
												<Calendar className="w-2.5 h-2.5 text-muted-foreground" />
												<span className="text-[10px] font-medium text-foreground">
													{dt.date}
												</span>
											</div>
											<div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur-md border border-border/40 shadow-sm">
												<Clock className="w-2.5 h-2.5 text-muted-foreground" />
												<span className="text-[10px] font-medium text-foreground">
													{dt.time}
												</span>
											</div>
										</div>
									</div>

									{/* Compact Card Content */}
									<CardContent className="p-3 pb-11 space-y-2">
										{/* Title Section with Tooltip */}
										<div className="relative group/title space-y-1">
											<h3
												className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300"
												title={exam.title}
											>
												{exam.title}
											</h3>
											<p className="text-xs text-muted-foreground line-clamp-1">
												{exam.lesson_name}
											</p>

											{/* Tooltip on hover */}
											<div className="absolute left-0 top-full mt-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border z-50 opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all duration-200 pointer-events-none whitespace-normal max-w-xs">
												{exam.title}
												<div className="absolute -top-1 left-4 w-2 h-2 bg-popover border-l border-t border-border rotate-45"></div>
											</div>
										</div>

										{/* Payment Button - Төлбөртэй боловч төлөөгүй үед */}
										{isPaid && !isPurchased && isActive && (
											<Button
												onClick={(e) => handleCreateInvoice(exam, e)}
												disabled={isCreatingInvoice}
												size="sm"
												className="w-full h-8 text-xs bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md"
											>
												{isCreatingInvoice ? (
													"Уншиж байна..."
												) : (
													<>
														<CreditCard className="w-3.5 h-3.5 mr-1.5" />
														Төлбөр төлөх
													</>
												)}
											</Button>
										)}

										{/* Compact Stats Footer */}
										<div className="flex items-center gap-3 pt-1.5 border-t border-border/40">
											<div className="flex items-center gap-1 text-muted-foreground">
												<Clock className="w-3 h-3" />
												<span className="text-[10px] font-medium">
													{exam.exam_minute}м
												</span>
											</div>
											<div className="flex items-center gap-1 text-muted-foreground">
												<FileText className="w-3 h-3" />
												<span className="text-[10px] font-medium">
													{exam.que_cnt}
												</span>
											</div>
										</div>

										{/* Compact Action Circle */}
										<div
											className={cn(
												"absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
												canTakeExam
													? "bg-primary/10 group-hover:bg-primary group-hover:scale-110"
													: isPaid && !isPurchased
														? "bg-orange-500/10"
														: "bg-muted",
											)}
										>
											{isPaid && !isPurchased ? (
												<Lock className="w-3 h-3 text-orange-500" />
											) : (
												<ArrowRight
													className={cn(
														"w-3 h-3 transition-all",
														canTakeExam
															? "text-primary group-hover:text-primary-foreground group-hover:translate-x-0.5"
															: "text-muted-foreground",
													)}
												/>
											)}
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			</div>

			{/* QPay Dialog */}
			<QPayDialog
				open={qpayDialogOpen}
				onOpenChange={setQpayDialogOpen}
				qpayData={qpayData}
				userId={userId}
				onPaymentSuccess={handlePaymentSuccess}
			/>
		</>
	);
}
