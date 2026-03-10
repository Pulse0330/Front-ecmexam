"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	Award,
	CheckCircle,
	Clock,
	Flag,
	Loader2,
	Send,
	Target,
	Trophy,
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
import { finishExam, getExamResults } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

interface FinishExamRequest {
	exam_id: number;
	exam_type: number;
	start_eid: number;
	exam_time: string;
	user_id: number;
}

interface FinishExamResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: number;
}

interface ExamResultData {
	test_id: number;
	title: string;
	test_date: string;
	test_time: string;
	fname: string;
	test_ttl: number;
	correct_ttl: number;
	wrong_ttl: number;
	ttl_point: number;
	point: number;
	point_perc: number;
	unelgee: string;
}

interface ExamResultsResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: ExamResultData[];
}

interface FinishExamResultDialogProps {
	examId: number;
	examType: number;
	startEid: number;
	examTime: number;
	answeredCount: number;
	totalCount: number;
}

export interface FinishExamDialogHandle {
	triggerFinish: () => void;
}

const FinishExamResultDialog = forwardRef<
	FinishExamDialogHandle,
	FinishExamResultDialogProps
>(
	(
		{ examId, examType, startEid, examTime, answeredCount, totalCount },
		ref,
	) => {
		const { userId } = useAuthStore();
		const router = useRouter();
		const [open, setOpen] = useState(false);
		const [finishedTestId, setFinishedTestId] = useState<number | null>(null);
		const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
		const autoRedirectTimerRef = useRef<NodeJS.Timeout | null>(null); // ✅ Auto-redirect timer // ✅ Auto-submit state

		const isDadlaga = examType === 1 || examType === 2;

		const finishMutation = useMutation<
			FinishExamResponse,
			Error,
			FinishExamRequest
		>({
			mutationFn: (payload) => {
				console.log("📡 finishExam API дуудаж байна:", payload);
				return finishExam(payload);
			},
			onSuccess: (res) => {
				if (res.RetResponse.ResponseCode === "10") {
					const testId = res.RetData;

					if (isDadlaga) {
						toast.success("✅ Шалгалт амжилттай дууслаа!");
						setTimeout(() => {
							router.push("/Lists/examResult");
						}, 1500);
						setIsAutoSubmitting(false);
						return;
					}

					if (isAutoSubmitting) {
						toast.success(" Цаг дууслаа. Шалгалт автоматаар дууслаа!");
					} else {
						toast.success("✅ Шалгалт амжилттай дууслаа");
					}

					if (testId) {
						setFinishedTestId(testId);

						// ✅ Цаг дуусахад 5 секундийн дараа автоматаар examList руу шилжих
						if (isAutoSubmitting) {
							autoRedirectTimerRef.current = setTimeout(() => {
								router.push("/Lists/examResult");
							}, 500);
						}
					}

					setIsAutoSubmitting(false);
				} else {
					console.error(
						"❌ Finish exam failed:",
						res.RetResponse.ResponseMessage,
					);
					toast.error(res.RetResponse.ResponseMessage);
					setOpen(false);
					setIsAutoSubmitting(false);
				}
			},
			onError: () => {
				toast.error(
					isDadlaga
						? "Шалгалт дуусгах үед алдаа гарлаа"
						: "Шалгалт дуусгах үед алдаа гарлаа",
				);
				setOpen(false);
				router.push("/Lists/examResult");
			},
		});

		const { data: resultsData, isLoading: isLoadingResults } =
			useQuery<ExamResultsResponse>({
				queryKey: ["examResults", finishedTestId],
				queryFn: () => {
					if (finishedTestId !== null) return getExamResults(finishedTestId);
					return Promise.reject("finishedTestId олдсонгүй");
				},
				enabled: !!finishedTestId && !isDadlaga,
				retry: 3,
				retryDelay: 1000,
			});

		const handleFinish = () => {
			if (!userId) {
				toast.error("Хэрэглэгчийн мэдээлэл олдсонгүй");
				return;
			}

			console.log("📤 finishMutation.mutate() дуудаж байна");

			finishMutation.mutate({
				exam_id: examId,
				exam_type: examType,
				start_eid: startEid,
				exam_time: format(examTime, "HH:mm:ss"),
				user_id: userId,
			});
		};

		// ✅ ЗАСВАРЛАСАН: Expose triggerFinish method - AUTO SUBMIT
		useImperativeHandle(ref, () => ({
			triggerFinish: () => {
				console.log(
					"🔴 triggerFinish дуудагдлаа - Автоматаар дуусгаж байна...",
				);

				setIsAutoSubmitting(true);
				setOpen(true); // Dialog нээх (loading харуулах)

				// Шууд дуусгах (confirmation харуулахгүй)
				setTimeout(() => {
					handleFinish();
				}, 500); // 500ms хүлээх (UX-ийн хувьд)
			},
		}));

		const progressPercentage =
			totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
		const unansweredCount = totalCount - answeredCount;
		const resultInfo = resultsData?.RetData?.[0];

		const formattedPercentage = resultInfo
			? Number(resultInfo.point_perc).toFixed(2)
			: "0.00";

		const handleCloseResults = () => {
			// ✅ Cleanup timer
			if (autoRedirectTimerRef.current) {
				clearTimeout(autoRedirectTimerRef.current);
			}
			setFinishedTestId(null);
			setOpen(false);
		};

		// ✅ Auto-submitting Loading Dialog - зөвхөн API дуудаж байх үед
		if (isAutoSubmitting && finishMutation.isPending) {
			return (
				<Dialog open={true} onOpenChange={() => {}}>
					<DialogTrigger asChild>
						<Button className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2">
							<span className="hidden sm:inline">
								{isDadlaga ? "Шалгалт дуусгах" : "Шалгалт дуусгах"}
							</span>
							<span className="sm:hidden">Дуусгах</span>
							<Send className="w-4 h-4 sm:w-5 sm:h-5" />
						</Button>
					</DialogTrigger>

					<DialogContent className="w-[95vw] max-w-[450px] sm:max-w-[550px] border-t-4 border-t-red-500 p-4 sm:p-6">
						<div className="flex flex-col justify-center items-center py-8 space-y-4">
							<Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-red-600" />
							<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium text-center">
								⏰ Цаг дууслаа. Автоматаар дуусгаж байна...
							</p>
						</div>
					</DialogContent>
				</Dialog>
			);
		}

		// Result Dialog - Loading State
		if (finishedTestId && !isDadlaga && isLoadingResults) {
			return (
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2">
							<span className="hidden sm:inline">Шалгалт дуусгах</span>
							<span className="sm:hidden">Дуусгах</span>
							<Send className="w-4 h-4 sm:w-5 sm:h-5" />
						</Button>
					</DialogTrigger>

					<DialogContent className="w-[95vw] max-w-[450px] sm:max-w-[550px] border-t-4 border-t-blue-500 p-4 sm:p-6">
						<div className="flex flex-col justify-center items-center py-8 space-y-4">
							<Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-blue-600" />
							<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
								Үр дүн тооцоолж байна...
							</p>
						</div>
					</DialogContent>
				</Dialog>
			);
		}

		// Result Dialog - No Data
		if (finishedTestId && !isDadlaga && !isLoadingResults && !resultInfo) {
			return (
				<Dialog open={true} onOpenChange={handleCloseResults}>
					<DialogContent className="w-[95vw] max-w-[400px] sm:max-w-[450px] p-4 sm:p-6">
						<DialogHeader className="text-center space-y-3">
							<XCircle className="w-12 h-12 sm:w-14 sm:h-14 mx-auto text-red-500" />
							<DialogTitle className="text-lg sm:text-xl">
								Үр дүн олдсонгүй
							</DialogTitle>
							<DialogDescription className="text-sm">
								Мэдээлэл хоосон байна. Дахин оролдоно уу.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter className="mt-4">
							<Button
								onClick={handleCloseResults}
								className="w-full h-11 font-semibold"
							>
								Хаах
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			);
		}

		// Result Dialog - Success (same as before...)
		if (finishedTestId && !isDadlaga && resultInfo) {
			const isPassed = resultInfo.point_perc >= 60;
			const isExcellent = resultInfo.point_perc >= 90;

			return (
				<Dialog open={true} onOpenChange={handleCloseResults}>
					<DialogContent
						className={`w-[95vw] max-w-[500px] sm:max-w-[600px] border-t-4 shadow-2xl ${
							isPassed ? "border-t-green-500" : "border-t-red-500"
						} p-4 sm:p-6 max-h-[90vh] overflow-y-auto`}
					>
						<DialogHeader className="text-center space-y-3 sm:space-y-4">
							<div className="relative inline-block mx-auto">
								<div
									className={`absolute inset-0 blur-xl sm:blur-2xl opacity-30 rounded-full ${
										isExcellent
											? "bg-yellow-400"
											: isPassed
												? "bg-green-400"
												: "bg-gray-400"
									}`}
								/>
								<Trophy
									className={`relative w-16 h-16 sm:w-20 sm:h-20 ${
										isExcellent
											? "text-yellow-500 animate-bounce"
											: isPassed
												? "text-green-500"
												: "text-gray-400"
									}`}
								/>
							</div>

							<div>
								<DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-2">
									Шалгалтын үр дүн
								</DialogTitle>
								<DialogDescription className="text-base sm:text-lg md:text-xl font-semibold mt-2 px-2">
									{isExcellent
										? "🌟 Гайхалтай! Та маш сайн өгүүлэв!"
										: isPassed
											? "🎉 Баяр хүргэе! Та шалгалтад тэнцлээ!"
											: "💪 Дараагийн удаад амжилт хүсье!"}
								</DialogDescription>
							</div>
						</DialogHeader>

						<div className="space-y-3 sm:space-y-4 py-4 sm:py-6">
							{/* Main Score Card */}
							<div
								className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 ${
									isPassed
										? "bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-700"
										: "bg-linear-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-300 dark:border-red-700"
								}`}
							>
								<div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
									<div className="flex items-center gap-3">
										<Award
											className={`w-8 h-8 sm:w-10 sm:h-10 ${
												isPassed
													? "text-green-600 dark:text-green-400"
													: "text-red-600 dark:text-red-400"
											}`}
										/>
										<div className="text-center sm:text-left">
											<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
												Нийт оноо
											</p>
											<p className="text-xs text-gray-600 dark:text-gray-400">
												{resultInfo.point} / {resultInfo.ttl_point} оноо
											</p>
										</div>
									</div>
									<div className="text-4xl sm:text-5xl font-black">
										{formattedPercentage}%
									</div>
								</div>
							</div>

							{/* Stats Grid */}
							<div className="grid grid-cols-3 gap-2 sm:gap-3">
								<div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-blue-200 dark:border-blue-800 text-center">
									<Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-blue-600 dark:text-blue-400" />
									<p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
										Нийт
									</p>
									<p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
										{resultInfo.test_ttl}
									</p>
								</div>

								<div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-green-200 dark:border-green-800 text-center">
									<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-green-600 dark:text-green-400" />
									<p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
										Зөв
									</p>
									<p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
										{resultInfo.correct_ttl}
									</p>
								</div>

								<div className="bg-linear-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-red-200 dark:border-red-800 text-center">
									<XCircle className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-red-600 dark:text-red-400" />
									<p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
										Буруу
									</p>
									<p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
										{resultInfo.wrong_ttl}
									</p>
								</div>
							</div>

							{/* Additional Info */}
							<div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm">
								<div className="flex items-center justify-center sm:justify-start gap-2">
									<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 shrink-0" />
									<span className="text-gray-700 dark:text-gray-300">
										{resultInfo.test_time}
									</span>
								</div>
								<div className="flex items-center justify-center sm:justify-start gap-2">
									<Zap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 shrink-0" />
									<span className="text-gray-700 dark:text-gray-300 text-center sm:text-left">
										{resultInfo.unelgee}
									</span>
								</div>
							</div>
						</div>

						<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
							<Button
								variant="outline"
								onClick={() => router.push("/Lists/examList")}
								className="w-full font-semibold h-11 sm:h-12"
							>
								Гарах
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			);
		}

		// Confirmation Dialog (Manual Submit)
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2">
						<span className="hidden sm:inline">
							{isDadlaga ? "Шалгалт дуусгах" : "Шалгалт дуусгах"}
						</span>
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
							{isDadlaga ? "Шалгалт дуусгах уу?" : "Шалгалт дуусгах уу?"}
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
							onClick={handleFinish}
							disabled={finishMutation.isPending}
							className="w-full font-semibold h-11 sm:h-12 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all order-1 sm:order-2"
						>
							{finishMutation.isPending ? (
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
	},
);

FinishExamResultDialog.displayName = "FinishExamResultDialog";

export default FinishExamResultDialog;
