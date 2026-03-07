"use client";

import { useMutation } from "@tanstack/react-query";
import {
	CheckCircle,
	Flag,
	Loader2,
	Send,
	Target,
	XCircle,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { getMNExamFinish } from "@/lib/api";

// ---- Types ----
interface FinishExamResultDialogProps {
	examId: number;
	examType: number;
	startEid: number;
	examTime: number;
	answeredCount: number;
	totalCount: number;
	examRegId?: number;
	variantId?: number;
}

export interface FinishExamDialogHandle {
	triggerFinish: () => void;
}

// ─────────────────────────────────────────────
const FinishExamResultDialog = forwardRef<
	FinishExamDialogHandle,
	FinishExamResultDialogProps
>(({ examType, answeredCount, totalCount, examRegId, variantId }, ref) => {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [_isAutoSubmitting, setIsAutoSubmitting] = useState(false);
	const autoRedirectTimerRef = useRef<NodeJS.Timeout | null>(null);

	const isDadlaga = examType === 1 || examType === 2;

	// ── MN Exam finish mutation ──
	const mnFinishMutation = useMutation({
		mutationFn: () => {
			if (!examRegId || !variantId)
				throw new Error("examRegId эсвэл variantId олдсонгүй");
			return getMNExamFinish(examRegId, variantId);
		},
		onSuccess: () => {
			toast.success("✅ Шалгалт амжилттай дууслаа!");
			setIsAutoSubmitting(false);
			setOpen(false);
			autoRedirectTimerRef.current = setTimeout(() => {
				router.replace("/Lists/examResult");
			}, 1500);
		},
		onError: () => {
			toast.error("Шалгалт дуусгах үед алдаа гарлаа");
			setIsAutoSubmitting(false);
			setOpen(false);
			router.replace("/Lists/examResult");
		},
	});

	// ── Derived ──
	const isPending = mnFinishMutation.isPending;

	const progressPercentage =
		totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
	const unansweredCount = totalCount - answeredCount;

	// ── Handlers ──
	const handleFinish = () => {
		if (!examRegId || !variantId) {
			toast.error("examRegId эсвэл variantId олдсонгүй");
			return;
		}
		mnFinishMutation.mutate();
	};

	const handleCloseResults = () => {
		if (autoRedirectTimerRef.current)
			clearTimeout(autoRedirectTimerRef.current);
		setOpen(false);
	};

	useImperativeHandle(ref, () => ({
		triggerFinish: () => {
			// setIsAutoSubmitting(true);
			setOpen(true);
			// setTimeout(() => handleFinish(), 500);
		},
	}));

	// ── Render: Auto-submit loading ──
	// if (isAutoSubmitting && isPending) {
	// 	return (
	// 		<Dialog open={true} onOpenChange={() => {}}>
	// 			<DialogTrigger asChild>
	// 				<Button className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2">
	// 					<span className="hidden sm:inline">Шалгалт дуусгах</span>
	// 					<span className="sm:hidden">Дуусгах</span>
	// 					<Send className="w-4 h-4 sm:w-5 sm:h-5" />
	// 				</Button>
	// 			</DialogTrigger>
	// 			<DialogContent className="w-[95vw] max-w-[450px] sm:max-w-[550px] border-t-4 border-t-red-500 p-4 sm:p-6">
	// 				<div className="flex flex-col justify-center items-center py-8 space-y-4">
	// 					<Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-red-600" />
	// 					<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium text-center">
	// 						⏰ Цаг дууслаа. Автоматаар дуусгаж байна...
	// 					</p>
	// 				</div>
	// 			</DialogContent>
	// 		</Dialog>
	// 	);
	// }

	// ── Render: Confirmation dialog ──
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2">
					<span className="hidden sm:inline">Шалгалт дуусгах</span>
					<span className="sm:hidden">Дуусгах</span>
					<Send className="w-4 h-4 sm:w-5 sm:h-5" />
				</Button>
			</DialogTrigger>

			<DialogContent className="w-[95vw] max-w-[500px] sm:max-w-[600px] border-t-4 border-t-blue-500 p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
				<DialogHeader className="text-center space-y-2 sm:space-y-3">
					<div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-full flex items-center justify-center">
						<Flag className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
					</div>
					<DialogTitle className="text-xl sm:text-2xl font-bold px-2">
						Шалгалт дуусгах уу?
					</DialogTitle>
					<DialogDescription className="text-sm px-2">
						{isDadlaga
							? "Дуусгасны дараа шалгалт дууссан тул нүүр хуудас руу шилжих болно."
							: "Дуусгасны дараа хариултуудыг өөрчлөх боломжгүй болно."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
					<div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-3 sm:p-4 border-2 border-blue-200 dark:border-blue-800 shadow-inner">
						<div className="flex items-center justify-between mb-3 sm:mb-4">
							<span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
								<Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
								<span className="hidden sm:inline">Нийт асуулт</span>
								<span className="sm:hidden">Нийт</span>
							</span>
							<span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
								{totalCount}
							</span>
						</div>

						<div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
							<div className="flex items-center gap-2 sm:gap-3 bg-white/70 dark:bg-gray-800/70 p-3 sm:p-4 rounded-lg shadow-sm border border-green-200 dark:border-green-800">
								<div className="bg-green-100 dark:bg-green-900/50 rounded-full p-1.5 sm:p-2 shrink-0">
									<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
								</div>
								<div className="min-w-0">
									<p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
										Хариулсан
									</p>
									<p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
										{answeredCount}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 sm:gap-3 bg-white/70 dark:bg-gray-800/70 p-3 sm:p-4 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
								<div className="bg-red-100 dark:bg-red-900/50 rounded-full p-1.5 sm:p-2 shrink-0">
									<XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
								</div>
								<div className="min-w-0">
									<p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
										Хариулаагүй
									</p>
									<p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
										{unansweredCount}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
								<span className="flex items-center gap-1 sm:gap-2">
									<Zap className="w-3 h-3 sm:w-4 sm:h-4" />
									Гүйцэтгэл
								</span>
								<span className="font-bold text-base sm:text-lg">
									{progressPercentage}%
								</span>
							</div>
							<Progress
								value={progressPercentage}
								className="h-2 sm:h-3 shadow-inner"
							/>
						</div>
					</div>

					{unansweredCount > 0 && (
						<div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
							<div className="bg-amber-100 dark:bg-amber-900/50 rounded-full p-1 sm:p-1.5 shrink-0">
								<XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-semibold text-amber-900 dark:text-amber-100 text-xs sm:text-sm mb-1">
									Анхааруулга
								</p>
								<p className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-300">
									Танд {unansweredCount} хариулаагүй асуулт байна. Дуусгахаас
									өмнө шалгана уу.
								</p>
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
					<Button
						variant="outline"
						onClick={handleCloseResults}
						className="w-full font-semibold h-11 sm:h-12 order-2 sm:order-1"
					>
						Болих
					</Button>
					<Button
						onClick={handleFinish}
						disabled={isPending}
						className="w-full font-semibold h-11 sm:h-12 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all order-1 sm:order-2"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
								<span className="text-sm sm:text-base">Дуусгаж байна...</span>
							</>
						) : (
							<>
								<Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
								<span className="text-sm sm:text-base">Тийм, дуусгах</span>
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
});

FinishExamResultDialog.displayName = "FinishExamResultDialog";

export default FinishExamResultDialog;
