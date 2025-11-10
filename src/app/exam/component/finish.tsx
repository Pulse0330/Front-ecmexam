"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	CheckCircle,
	Clock,
	Loader2,
	Trophy,
	XCircle,
	Zap,
} from "lucide-react";
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

// --- Finish Exam Request (API-тай тохирсон) ---
interface FinishExamRequest {
	exam_id: number;
	exam_type: number;
	start_eid: number;
	exam_time: number;
	user_id: number;
}

// --- Finish Exam Response ---
interface FinishExamResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: number; // Test ID
}

// --- Exam Results Төрлүүд ---
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

// --- Props ---
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
	const [open, setOpen] = useState(false);
	const [finishedTestId, setFinishedTestId] = useState<number | null>(null);

	// --- 1. Шалгалт Дуусгах Mutation ---
	const finishMutation = useMutation<
		FinishExamResponse,
		Error,
		FinishExamRequest
	>({
		mutationFn: async (payload) => {
			console.log("📤 Sending finish exam request:", payload);
			return finishExam(payload);
		},
		onSuccess: (response) => {
			console.log("✅ Finish exam response:", response);

			if (response.RetResponse.ResponseCode === "10") {
				toast.success("Шалгалт амжилттай дуусгалаа. Үр дүнг татаж байна...");

				const newTestId = response.RetData;
				if (newTestId) {
					console.log("🆔 Test ID:", newTestId);
					setFinishedTestId(newTestId);
				} else {
					toast.warning("Шалгалтын ID олдсонгүй.");
					setOpen(false);
				}
			} else {
				toast.warning(
					response.RetResponse.ResponseMessage ||
						"Шалгалт дуусгах хүсэлт амжилтгүй боллоо.",
				);
				setOpen(false);
			}
		},
		onError: (error) => {
			console.error("❌ Finish exam error:", error);
			toast.error("Шалгалт дуусгах үед алдаа гарлаа.");
			setOpen(false);
		},
	});

	// --- 2. Үр Дүн Татаж Авах Query ---
	const { data: resultsData, isLoading: isLoadingResults } =
		useQuery<ExamResultsResponse>({
			queryKey: ["examResults", finishedTestId],
			queryFn: () => {
				if (finishedTestId !== null) {
					console.log("📊 Fetching results for test ID:", finishedTestId);
					return getExamResults(finishedTestId);
				}
				return Promise.reject("finishedTestId олдсонгүй");
			},
			enabled: !!finishedTestId,
			retry: 3,
			retryDelay: 1000,
		});

	const handleFinish = () => {
		if (!userId) {
			toast.error("Хэрэглэгчийн мэдээлэл олдсонгүй.");
			return;
		}

		// Хоёр минут хөрвүүлэх (examTime is in minutes)
		const examTimeInMinutes = examTime;

		const payload: FinishExamRequest = {
			exam_id: examId,
			exam_type: examType,
			start_eid: startEid,
			exam_time: examTimeInMinutes,
			user_id: userId,
		};

		console.log("🚀 Finishing exam with payload:", payload);
		finishMutation.mutate(payload);
	};

	// Явцын тооцоолол
	const progressPercentage =
		totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
	const unansweredCount = totalCount - answeredCount;

	const resultInfo = resultsData?.RetData?.[0];

	// --- RESULT VIEW РЕНДЕРЛЭХ ---
	if (finishedTestId) {
		const handleCloseResults = () => {
			setFinishedTestId(null);
			setOpen(false);
			// Redirect to results page if needed
			// router.push(`/exam/results/${finishedTestId}`);
		};

		// A. Loading View
		if (isLoadingResults) {
			return (
				<Dialog open={true} onOpenChange={handleCloseResults}>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader className="text-center">
							<Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
							<DialogTitle className="text-xl font-bold">
								Үр Дүнг Татаж Байна...
							</DialogTitle>
							<DialogDescription>
								Түр хүлээнэ үү. Энэ нь хэдхэн секунд үргэлжилнэ.
							</DialogDescription>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			);
		}

		// B. Error View
		if (!resultInfo) {
			return (
				<Dialog open={true} onOpenChange={handleCloseResults}>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader className="text-center">
							<XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
							<DialogTitle className="text-xl font-bold">
								Үр Дүн Олдсонгүй
							</DialogTitle>
							<DialogDescription>
								Үр дүнг татах явцад алдаа гарлаа эсвэл мэдээлэл хоосон байна.
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

		// C. Success Result View
		const isPassed = resultInfo.point_perc >= 60;

		return (
			<Dialog open={true} onOpenChange={handleCloseResults}>
				<DialogContent className="sm:max-w-[450px] border-t-4">
					<DialogHeader className="text-center">
						<Trophy
							className={`w-12 h-12 mx-auto mb-2 ${
								isPassed ? "text-yellow-500" : "text-gray-400"
							}`}
						/>
						<DialogTitle className="text-2xl font-extrabold text-blue-700">
							🎉 Шалгалтын Үр Дүн: {resultInfo.title}
						</DialogTitle>
						<DialogDescription className="pt-2 text-md font-semibold text-gray-700">
							{isPassed
								? "Баяр хүргэе, та шалгалтад тэнцлээ!"
								: "Дараагийн удаад амжилт хүсье!"}
						</DialogDescription>
					</DialogHeader>

					<div className="py-4 space-y-3">
						<div className="flex justify-between font-bold text-xl p-3 rounded-lg ">
							<span>Нийт Оноо (%):</span>
							<span>{resultInfo.point_perc}%</span>
						</div>

						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="bg-green-50 p-3 rounded-md flex items-center justify-between">
								<CheckCircle className="w-4 h-4 mr-2 text-green-600" />
								<span className="font-medium text-green-700">Зөв хариулт:</span>
								<span className="font-bold">{resultInfo.correct_ttl}</span>
							</div>
							<div className="bg-red-50 p-3 rounded-md flex items-center justify-between">
								<XCircle className="w-4 h-4 mr-2 text-red-600" />
								<span className="font-medium text-red-700">Буруу хариулт:</span>
								<span className="font-bold">{resultInfo.wrong_ttl}</span>
							</div>
						</div>

						<div className="flex justify-between text-sm pt-2 text-muted-foreground">
							<div className="flex items-center">
								<Clock className="w-4 h-4 mr-2" />
								<span>Хугацаа: {resultInfo.test_time}</span>
							</div>
							<div className="flex items-center">
								<Zap className="w-4 h-4 mr-2" />
								<span>Үнэлгээ: {resultInfo.unelgee}</span>
							</div>
						</div>
					</div>

					<DialogFooter className="mt-4">
						<Button
							onClick={handleCloseResults}
							className="w-full font-semibold"
						>
							Хаах
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	// --- CONFIRMATION VIEW (Default) ---
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="font-semibold px-6 py-3">Шалгалт дуусгах</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="">
						Шалгалтыг баталгаажуулж дуусгах
					</DialogTitle>
					<DialogDescription className="pt-2 text-base text-gray-700">
						Та шалгалтыг дуусгах гэж байна. Дуусгасны дараа хариултуудыг өөрчлөх
						боломжгүй. Та итгэлтэй байна уу?
					</DialogDescription>
				</DialogHeader>

				{/* Явцын мэдээлэл */}
				<div className="py-4 border-y border-dashed my-2">
					<p className="text-sm font-semibold text-gray-700 mb-2">
						Шалгалтын явцын мэдээлэл:
					</p>
					<div className="flex justify-between items-center text-sm font-medium mb-3">
						<span className="text-gray-500">Нийт асуулт:</span>
						<span className="text-lg font-bold text-blue-600">
							{totalCount}
						</span>
					</div>
					<div className="grid grid-cols-2 gap-3 text-sm mb-4">
						<div className="flex items-center text-green-700 font-medium">
							<CheckCircle className="w-4 h-4 mr-2" />
							<span>Хариулсан: {answeredCount}</span>
						</div>
						<div className="flex items-center text-red-700 font-medium">
							<XCircle className="w-4 h-4 mr-2" />
							<span>Хариулаагүй: {unansweredCount}</span>
						</div>
					</div>
					<p className="text-xs text-muted-foreground mb-1">
						Гүйцэтгэлийн хувь:
					</p>
					<Progress value={progressPercentage} className="h-2" />
					<p className="text-sm font-bold text-center mt-2 text-blue-600">
						{progressPercentage}%
					</p>
				</div>

				{/* Footer buttons */}
				<DialogFooter className="flex sm:justify-between gap-3 pt-4 border-t">
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						className="w-full sm:w-auto"
						disabled={finishMutation.isPending}
					>
						Болих
					</Button>
					<Button
						onClick={handleFinish}
						disabled={finishMutation.isPending}
						className="w-full sm:w-auto font-semibold"
					>
						{finishMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Дуусгаж байна...
							</>
						) : (
							"Тийм, шалгалт дуусгах"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
