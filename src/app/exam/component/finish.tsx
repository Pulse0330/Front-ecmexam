"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	Award,
	CheckCircle,
	Clock,
	FileText,
	Loader2,
	Target,
	Trophy,
	XCircle,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
	exam_time: number;
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

export default function FinishExamResultDialog({
	examId,
	examType,
	startEid,
	examTime,
	answeredCount,
	totalCount,
}: FinishExamResultDialogProps) {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [finishedTestId, setFinishedTestId] = useState<number | null>(null);

	const finishMutation = useMutation<
		FinishExamResponse,
		Error,
		FinishExamRequest
	>({
		mutationFn: (payload) => finishExam(payload),
		onSuccess: (res) => {
			if (res.RetResponse.ResponseCode === "10") {
				toast.success("Шалгалт амжилттай дууслаа");
				const testId = res.RetData;
				if (testId) setFinishedTestId(testId);
			} else {
				toast.error(res.RetResponse.ResponseMessage);
				setOpen(false);
			}
		},
		onError: () => {
			toast.error("Шалгалт дуусгах үед алдаа гарлаа");
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
			enabled: !!finishedTestId,
			retry: 3,
			retryDelay: 1000,
		});

	const handleFinish = () => {
		if (!userId) {
			toast.error("Хэрэглэгчийн мэдээлэл олдсонгүй");
			return;
		}

		finishMutation.mutate({
			exam_id: examId,
			exam_type: examType,
			start_eid: startEid,
			exam_time: examTime,
			user_id: userId,
		});
	};

	const handleViewDetails = () => {
		const finishIdNum = Number(finishedTestId);
		const examIdNum = Number(examId);

		if (!Number.isNaN(finishIdNum) && !Number.isNaN(examIdNum)) {
			router.push(`/exam/resultDetail/${finishIdNum}?examId=${examIdNum}`);
			setOpen(false);
		} else {
			console.error(
				"finishedTestId эсвэл examId буруу байна:",
				finishedTestId,
				examId,
			);
			toast.error("ID буруу байна, дэлгэрэнгүй харах боломжгүй байна.");
		}
	};

	const progressPercentage =
		totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
	const unansweredCount = totalCount - answeredCount;
	const resultInfo = resultsData?.RetData?.[0];

	// Result Dialog
	if (finishedTestId) {
		const handleCloseResults = () => {
			setFinishedTestId(null);
			setOpen(false);
		};

		if (isLoadingResults) {
			return (
				<Dialog open={true} onOpenChange={handleCloseResults}>
					<DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
						<div className="flex flex-col items-center justify-center py-12 space-y-4">
							<div className="relative">
								<div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20" />
								<Loader2 className="w-16 h-16 animate-spin text-blue-600" />
							</div>
							<div className="text-center space-y-2">
								<h3 className="text-xl font-bold text-gray-900 dark:text-white">
									Үр дүнг боловсруулж байна
								</h3>
								<p className="text-gray-600 dark:text-gray-400">
									Түр хүлээнэ үү...
								</p>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			);
		}

		if (!resultInfo) {
			return (
				<Dialog open={true} onOpenChange={handleCloseResults}>
					<DialogContent className="sm:max-w-[450px]">
						<DialogHeader className="text-center">
							<XCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
							<DialogTitle className="text-xl">Үр дүн олдсонгүй</DialogTitle>
							<DialogDescription>
								Мэдээлэл хоосон байна. Дахин оролдоно уу.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button onClick={handleCloseResults} className="w-full">
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
					className={`sm:max-w-[550px] border-t-4 ${
						isPassed ? "border-t-green-500" : "border-t-red-500"
					} shadow-2xl`}
				>
					<DialogHeader className="text-center space-y-4 pt-6">
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
							<DialogTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								Шалгалтын үр дүн
							</DialogTitle>
							<DialogDescription className="text-lg font-semibold mt-2">
								{isExcellent
									? "🌟 Гайхалтай! Та маш сайн өгүүлэв!"
									: isPassed
										? "🎉 Баяр хүргэе! Та шалгалтад тэнцлээ!"
										: "💪 Дараагийн удаад амжилт хүсье!"}
							</DialogDescription>
						</div>
					</DialogHeader>

					<div className="space-y-4 py-6">
						{/* Main Score */}
						<div
							className={`relative overflow-hidden rounded-2xl p-6 ${
								isPassed
									? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-700"
									: "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-300 dark:border-red-700"
							}`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Award
										className={`w-10 h-10 ${isPassed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
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
								<div className="text-right">
									<div
										className={`text-5xl font-black ${
											isPassed
												? "text-green-600 dark:text-green-400"
												: "text-red-600 dark:text-red-400"
										}`}
									>
										{resultInfo.point_perc}%
									</div>
								</div>
							</div>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-3 gap-3">
							<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-center">
								<Target className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
								<p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
									Нийт
								</p>
								<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
									{resultInfo.test_ttl}
								</p>
							</div>

							<div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-xl border-2 border-green-200 dark:border-green-800 text-center">
								<CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
								<p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
									Зөв
								</p>
								<p className="text-2xl font-bold text-green-600 dark:text-green-400">
									{resultInfo.correct_ttl}
								</p>
							</div>

							<div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-4 rounded-xl border-2 border-red-200 dark:border-red-800 text-center">
								<XCircle className="w-6 h-6 mx-auto mb-2 text-red-600 dark:text-red-400" />
								<p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
									Буруу
								</p>
								<p className="text-2xl font-bold text-red-600 dark:text-red-400">
									{resultInfo.wrong_ttl}
								</p>
							</div>
						</div>

						{/* Additional Info */}
						<div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-2">
								<Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									Хугацаа: {resultInfo.test_time}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
								<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{resultInfo.unelgee}
								</span>
							</div>
						</div>
					</div>

					<DialogFooter className="gap-2 pt-4 border-t">
						<Button
							variant="outline"
							onClick={handleCloseResults}
							className="flex-1 font-semibold"
						>
							Хаах
						</Button>
						<Button
							onClick={handleViewDetails}
							className="flex-1 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
						>
							<FileText className="w-4 h-4 mr-2" />
							Дэлгэрэнгүй
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
				<Button className="font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
					Шалгалт дуусгах
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">
						Шалгалт дуусгах уу?
					</DialogTitle>
					<DialogDescription className="text-base">
						Дуусгасны дараа хариултуудыг өөрчлөх боломжгүй болно.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-6">
					{/* Progress Card */}
					<div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800">
						<div className="flex items-center justify-between mb-4">
							<span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
								Нийт асуулт
							</span>
							<span className="text-3xl font-black text-blue-600 dark:text-blue-400">
								{totalCount}
							</span>
						</div>

						<div className="grid grid-cols-2 gap-3 mb-4">
							<div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
								<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
								<div>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										Хариулсан
									</p>
									<p className="text-xl font-bold text-green-600 dark:text-green-400">
										{answeredCount}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
								<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
								<div>
									<p className="text-xs text-gray-600 dark:text-gray-400">
										Хариулаагүй
									</p>
									<p className="text-xl font-bold text-red-600 dark:text-red-400">
										{unansweredCount}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
								<span>Гүйцэтгэл</span>
								<span className="font-bold">{progressPercentage}%</span>
							</div>
							<Progress value={progressPercentage} className="h-3" />
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2 pt-4 border-t">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={finishMutation.isPending}
						className="flex-1 font-semibold"
					>
						Үгүй
					</Button>
					<Button
						onClick={handleFinish}
						disabled={finishMutation.isPending}
						className="flex-1 font-semibold "
					>
						{finishMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-5 w-5 animate-spin" />
								Дуусгаж байна...
							</>
						) : (
							"Тийм, дуусгах"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
