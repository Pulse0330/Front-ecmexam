"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	CheckCircle,
	Clock,
	FileText,
	Loader2,
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
	RetData: number; // Test ID
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

	// Finish Exam Mutation
	const finishMutation = useMutation<
		FinishExamResponse,
		Error,
		FinishExamRequest
	>({
		mutationFn: (payload) => finishExam(payload),
		onSuccess: (res) => {
			if (res.RetResponse.ResponseCode === "10") {
				toast.success("Шалгалт амжилттай дуусгалаа");
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

	// Fetch Results
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
		// finishedTestId болон examId-г Number() болгон хөрвүүлэх
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
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader className="text-center">
							<Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
							<DialogTitle>Үр Дүнг Татаж Байна...</DialogTitle>
							<DialogDescription>Түр хүлээнэ үү.</DialogDescription>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			);
		}

		if (!resultInfo) {
			return (
				<Dialog open={true} onOpenChange={handleCloseResults}>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader className="text-center">
							<XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
							<DialogTitle>Үр Дүн Олдсонгүй</DialogTitle>
							<DialogDescription>Мэдээлэл хоосон байна.</DialogDescription>
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

		return (
			<Dialog open={true} onOpenChange={handleCloseResults}>
				<DialogContent className="sm:max-w-[450px] border-t-4">
					<DialogHeader className="text-center">
						<Trophy
							className={`w-12 h-12 mx-auto mb-2 ${isPassed ? "text-yellow-500" : "text-gray-400"}`}
						/>
						<DialogTitle className="text-2xl font-extrabold text-blue-700">
							🎉 Шалгалтын Үр Дүн
						</DialogTitle>
						<DialogDescription className="pt-2 text-md font-semibold text-gray-700">
							{isPassed
								? "Баяр хүргэе, та шалгалтад тэнцлээ!"
								: "Дараагийн удаад амжилт хүсье!"}
						</DialogDescription>
					</DialogHeader>

					<div className="py-4 space-y-3">
						<div className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
							<span className="font-semibold text-gray-700">Нийт Оноо:</span>
							<div className="text-right">
								<p className="text-3xl font-bold text-blue-600">
									{resultInfo.point_perc}%
								</p>
								<p className="text-sm text-gray-600">
									{resultInfo.point}/{resultInfo.ttl_point} оноо
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3 text-sm">
							<div className="bg-green-50 p-3 rounded-md border border-green-200">
								<div className="flex items-center mb-1">
									<CheckCircle className="w-4 h-4 mr-2 text-green-600" />
									<span className="font-medium text-green-700">Зөв</span>
								</div>
								<p className="text-2xl font-bold text-green-600">
									{resultInfo.correct_ttl}
								</p>
							</div>
							<div className="bg-red-50 p-3 rounded-md border border-red-200">
								<div className="flex items-center mb-1">
									<XCircle className="w-4 h-4 mr-2 text-red-600" />
									<span className="font-medium text-red-700">Буруу</span>
								</div>
								<p className="text-2xl font-bold text-red-600">
									{resultInfo.wrong_ttl}
								</p>
							</div>
						</div>

						<div className="flex justify-between text-sm pt-2 text-muted-foreground border-t">
							<div className="flex items-center">
								<Clock className="w-4 h-4 mr-2" />
								<span>{resultInfo.test_time}</span>
							</div>
							<div className="flex items-center">
								<Zap className="w-4 h-4 mr-2" />
								<span>{resultInfo.unelgee}</span>
							</div>
						</div>
					</div>

					<DialogFooter className="mt-4 gap-2">
						<Button
							variant="outline"
							onClick={handleCloseResults}
							className="flex-1"
						>
							Хаах
						</Button>
						<Button
							onClick={handleViewDetails}
							className="flex-1 font-semibold"
						>
							<FileText className="w-4 h-4 mr-2" />
							Дэлгэрэнгүй харах
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	// Default Confirmation Dialog
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="font-semibold px-6 py-3">Шалгалт дуусгах</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Шалгалтыг баталгаажуулж дуусгах</DialogTitle>
					<DialogDescription className="pt-2 text-base text-gray-700">
						Та шалгалтыг дуусгах гэж байна. Дуусгасны дараа хариултуудыг өөрчлөх
						боломжгүй. Та итгэлтэй байна уу?
					</DialogDescription>
				</DialogHeader>

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
