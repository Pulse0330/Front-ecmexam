"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
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
import { forwardRef, useImperativeHandle, useState } from "react";
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
import type {
	FinishExamRequest,
	FinishExamResponse,
} from "@/types/exam/examFinish";

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
	elapsedSeconds: number; // ✅ секундээр
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
		{ examId, examType, startEid, elapsedSeconds, answeredCount, totalCount },
		ref,
	) => {
		const { userId } = useAuthStore();
		const router = useRouter();
		const [open, setOpen] = useState(false);
		const [finishedTestId, setFinishedTestId] = useState<number | null>(null);

		const isDadlaga = examType === 2;

		const finishMutation = useMutation<
			FinishExamResponse,
			Error,
			FinishExamRequest
		>({
			mutationFn: (payload) => finishExam(payload),
			onSuccess: (res) => {
				if (res.RetResponse.ResponseCode === "10") {
					const testId = res.RetData;

					if (isDadlaga) {
						toast.success("✅ Сорил амжилттай дууслаа!");
						setTimeout(() => {
							router.push("/home");
						}, 1500);
					} else {
						toast.success("✅ Сорил амжилттай дууслаа");
						if (testId) setFinishedTestId(testId);
					}
				} else {
					toast.error(res.RetResponse.ResponseMessage);
					setOpen(false);
				}
			},
			onError: () => {
				toast.error(
					isDadlaga
						? "Сорил дуусгах үед алдаа гарлаа"
						: "Сорил дуусгах үед алдаа гарлаа",
				);
				setOpen(false);
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

		// ✅ finish.tsx дээр console.log нэмээд шалгах
		const handleFinish = () => {
			if (!userId) {
				toast.error("Хэрэглэгчийн мэдээлэл олдсонгүй");
				return;
			}

			// ✅ elapsedSeconds нь одоо үнэхээр секунд байна
			const hours = Math.floor(elapsedSeconds / 3600);
			const minutes = Math.floor((elapsedSeconds % 3600) / 60);
			const seconds = elapsedSeconds % 60;

			const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

			const payload = {
				exam_id: examId,
				exam_type: examType,
				start_eid: startEid,
				exam_time: formattedTime, // ✅ Одоо зөв утгатай байх болно
				user_id: userId,
			};

			console.log("📤 Илгээж буй payload:", payload);
			finishMutation.mutate(payload);
		};
		// Expose triggerFinish method to parent via ref
		useImperativeHandle(ref, () => ({
			triggerFinish: () => {
				setOpen(true);
				// Auto-trigger finish after showing dialog
				setTimeout(handleFinish, 100);
			},
		}));

		const progressPercentage =
			totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
		const unansweredCount = totalCount - answeredCount;
		const resultInfo = resultsData?.RetData?.[0];

		const handleCloseResults = () => {
			setFinishedTestId(null);
			setOpen(false);
		};

		// Result Dialog
		if (finishedTestId && !isDadlaga) {
			if (isLoadingResults) {
				return (
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button className="w-full h-11 gap-2 font-semibold text-base bg-green-600 text-white shadow-sm hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
								<Send className="w-4 h-4" />
								Сорил дуусгах
							</Button>
						</DialogTrigger>

						<DialogContent className="w-full sm:max-w-[550px] border-t-4 border-t-blue-500 p-4 sm:p-6">
							<div className="flex justify-center items-center py-8">
								<Loader2 className="w-10 h-10 animate-spin text-blue-600" />
							</div>
						</DialogContent>
					</Dialog>
				);
			}

			if (!resultInfo) {
				return (
					<Dialog open={true} onOpenChange={handleCloseResults}>
						<DialogContent className="w-full sm:max-w-[450px] p-6">
							<DialogHeader className="text-center">
								<XCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
								<DialogTitle className="text-xl">Үр дүн олдсонгүй</DialogTitle>
								<DialogDescription>
									Мэдээлэл хоосон байна. Дахин оролдоно уу.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									onClick={handleCloseResults}
									className="w-full sm:w-auto"
								>
									Хаах
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				);
			}

			const isPassed = resultInfo.point_perc >= 60;
			const isExcellent = resultInfo.point_perc >= 90;

			return (
				<Dialog open={true} onOpenChange={handleCloseResults}>
					<DialogContent
						className={`w-full sm:max-w-[550px] border-t-4 shadow-2xl ${
							isPassed ? "border-t-green-500" : "border-t-red-500"
						} p-4 sm:p-6`}
					>
						<DialogHeader className="text-center space-y-4">
							<div className="relative inline-block mx-auto">
								<div
									className={`absolute inset-0 blur-2xl opacity-30 rounded-full ${
										isExcellent
											? "bg-yellow-400"
											: isPassed
												? "bg-green-400"
												: "bg-gray-400"
									}`}
								/>
								<Trophy
									className={`relative w-20 h-20 ${
										isExcellent
											? "text-yellow-500 animate-bounce"
											: isPassed
												? "text-green-500"
												: "text-gray-400"
									}`}
								/>
							</div>

							<div>
								<DialogTitle className="text-3xl sm:text-4xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
									Сорилын үр дүн
								</DialogTitle>
								<DialogDescription className="text-lg sm:text-xl font-semibold mt-2">
									{isExcellent
										? "🌟 Гайхалтай! Та маш сайн өгүүлэв!"
										: isPassed
											? "🎉 Баяр хүргэе! Та сорилд тэнцлээ!"
											: "💪 Дараагийн удаад амжилт хүсье!"}
								</DialogDescription>
							</div>
						</DialogHeader>

						<div className="space-y-4 py-6">
							<div
								className={`relative overflow-hidden rounded-2xl p-6 ${
									isPassed
										? "bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-700"
										: "bg-linear-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-300 dark:border-red-700"
								}`}
							>
								<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<Award
											className={`w-10 h-10 ${
												isPassed
													? "text-green-600 dark:text-green-400"
													: "text-red-600 dark:text-red-400"
											}`}
										/>
										<div>
											<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
												Нийт оноо
											</p>
											<p className="text-xs text-gray-600 dark:text-gray-400">
												{resultInfo.point} / {resultInfo.ttl_point} оноо
											</p>
										</div>
									</div>
									<div className="text-5xl font-black text-center sm:text-right">
										{resultInfo.point_perc}%
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-center">
									<Target className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
									<p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
										Нийт
									</p>
									<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
										{resultInfo.test_ttl}
									</p>
								</div>

								<div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-xl border-2 border-green-200 dark:border-green-800 text-center">
									<CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
									<p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
										Зөв
									</p>
									<p className="text-2xl font-bold text-green-600 dark:text-green-400">
										{resultInfo.correct_ttl}
									</p>
								</div>

								<div className="bg-linear-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-4 rounded-xl border-2 border-red-200 dark:border-red-800 text-center">
									<XCircle className="w-6 h-6 mx-auto mb-2 text-red-600 dark:text-red-400" />
									<p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
										Буруу
									</p>
									<p className="text-2xl font-bold text-red-600 dark:text-red-400">
										{resultInfo.wrong_ttl}
									</p>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-sm">
								<div className="flex items-center gap-2">
									<Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
									<span className="text-gray-700 dark:text-gray-300">
										{resultInfo.unelgee}
									</span>
								</div>
							</div>
						</div>

						<DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
							<Button
								variant="outline"
								onClick={() => router.push("/Lists/sorilResult")}
								className="flex-1 font-semibold h-12"
							>
								Гарах
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			);
		}

		// Confirmation Dialog
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					{/* Гол үйлдэл — тод ногоон, бүтэн өргөнтэй, бүтэн нэртэй */}
					<Button className="w-full h-11 gap-2 font-semibold text-base bg-green-600 text-white shadow-sm hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
						<Send className="w-4 h-4" />
						Сорил дуусгах
					</Button>
				</DialogTrigger>

				<DialogContent className="w-full sm:max-w-[550px] border-t-4 border-t-blue-500 p-4 sm:p-6">
					<DialogHeader className="text-center space-y-3">
						<div className="mx-auto w-16 h-16 bg-linear-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 rounded-full flex items-center justify-center">
							<Flag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
						</div>
						<DialogTitle className="text-2xl font-bold">
							{isDadlaga ? "Дадлага дуусгах уу?" : "Сорилыг дуусгах уу?"}
						</DialogTitle>
						<DialogDescription>
							{isDadlaga
								? "Дуусгасны дараа дадлага дууссан тул нүүр хуудас руу шилжих болно."
								: "Дуусгасны дараа хариултуудыг өөрчлөх боломжгүй болно."}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800 shadow-inner">
							<div className="flex items-center justify-between mb-4">
								<span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
									<Target className="w-5 h-5 text-blue-600" />
									Нийт асуулт
								</span>
								<span className="text-3xl font-black text-blue-600 dark:text-blue-400">
									{totalCount}
								</span>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
								<div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg shadow-sm border border-green-200 dark:border-green-800">
									<div className="bg-green-100 dark:bg-green-900/50 rounded-full p-2">
										<CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
									</div>
									<div>
										<p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
											Хариулсан
										</p>
										<p className="text-2xl font-bold text-green-600 dark:text-green-400">
											{answeredCount}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
									<div className="bg-red-100 dark:bg-red-900/50 rounded-full p-2">
										<XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
									</div>
									<div>
										<p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
											Хариулаагүй
										</p>
										<p className="text-2xl font-bold text-red-600 dark:text-red-400">
											{unansweredCount}
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
									<span className="flex items-center gap-2">
										<Zap className="w-4 h-4" />
										Гүйцэтгэл
									</span>
									<span className="font-bold text-lg">
										{progressPercentage}%
									</span>
								</div>
								<Progress
									value={progressPercentage}
									className="h-3 shadow-inner"
								/>
							</div>

							{/* ✅ НЭМЭГДСЭН: Үргэлжилсэн хугацааг харуулах */}
							<div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
										<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
										Үргэлжилсэн хугацаа
									</span>
									<span className="text-lg font-bold text-blue-600 dark:text-blue-400">
										{(() => {
											const h = Math.floor(elapsedSeconds / 3600);
											const m = Math.floor((elapsedSeconds % 3600) / 60);
											const s = elapsedSeconds % 60;
											if (h > 0) return `${h} цаг ${m} минут ${s} секунд`;
											if (m > 0) return `${m} минут ${s} секунд`;
											return `${s} секунд`;
										})()}
									</span>
								</div>
							</div>
						</div>

						{unansweredCount > 0 && (
							<div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4 flex items-start gap-3">
								<div className="bg-amber-100 dark:bg-amber-900/50 rounded-full p-1.5 shrink-0">
									<XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
								</div>
								<div className="flex-1">
									<p className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-1">
										Анхааруулга
									</p>
									<p className="text-xs text-amber-700 dark:text-amber-300">
										Танд {unansweredCount} хариулаагүй асуулт байна. Дуусгахаас
										өмнө шалгана уу.
									</p>
								</div>
							</div>
						)}
					</div>

					<DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
						{/* Буцах — ✕-ыг хайлгүйгээр сорил руугаа буцна */}
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={finishMutation.isPending}
							className="w-full sm:flex-1 h-11 sm:h-12 gap-2 font-semibold order-2 sm:order-1"
						>
							<ArrowLeft className="h-4 w-4" />
							Сорил руу буцах
						</Button>
						<Button
							onClick={handleFinish}
							disabled={finishMutation.isPending}
							className="w-full sm:flex-1 font-semibold h-11 sm:h-12 bg-green-600 text-white hover:bg-green-700 shadow-sm order-1 sm:order-2"
						>
							{finishMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-5 w-5 animate-spin" />
									Дуусгаж байна...
								</>
							) : (
								<>
									<Send className="mr-2 h-5 w-5" />
									Тийм, дуусгах
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
