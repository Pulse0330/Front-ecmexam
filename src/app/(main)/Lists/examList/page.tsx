"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useServerTime } from "@/hooks/useServerTime";
import { getexamfiltertlists, getTestFilter } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	ApiExamlistsResponse,
	ExamlistsData,
} from "@/types/exam/examList";
import type { QPayInvoiceResponse } from "@/types/Qpay/qpayinvoice";
import ExamCard from "./examcard";
import QPayDialog from "./qpayDialog";

interface Lesson {
	lesson_id: number;
	lesson_name: string;
	sort: number;
}

interface TestFilterResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: Lesson[];
}

export default function ExamListPage() {
	const { userId } = useAuthStore();
	const { isLoading: isTimeLoading } = useServerTime();
	const [searchTerm, _setSearchTerm] = useState("");
	const [selectedLessonId, setSelectedLessonId] = useState<number>(0);
	const SKELETON_KEYS = Array.from({ length: 6 }, (_, i) => `skeleton-${i}`);
	// QPay states
	const [qpayDialogOpen, setQpayDialogOpen] = useState(false);
	const [qpayData, setQpayData] = useState<QPayInvoiceResponse | null>(null);
	const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	const {
		data: queryData,
		isPending,
		refetch,
	} = useQuery<ApiExamlistsResponse>({
		queryKey: ["examlists", userId, selectedLessonId],
		queryFn: () => getexamfiltertlists(userId || 0, selectedLessonId),
		enabled: !!userId,
	});

	const data = useMemo(() => queryData?.RetData || [], [queryData]);
	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);

	// Remove duplicates by exam_id
	const uniqueData = useMemo(() => {
		const seen = new Set<number>();
		return data.filter((exam) => {
			if (seen.has(exam.exam_id)) return false;
			seen.add(exam.exam_id);
			return true;
		});
	}, [data]);

	// Filter exams by search term
	const filteredData = useMemo(() => {
		if (!searchTerm.trim()) return uniqueData;

		const lowercaseSearch = searchTerm.toLowerCase();
		return uniqueData.filter((exam) =>
			exam.title.toLowerCase().includes(lowercaseSearch),
		);
	}, [uniqueData, searchTerm]);

	const handleCreateInvoice = async (exam: ExamlistsData) => {
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

	const handlePaymentSuccess = () => {
		refetch();
	};

	if (isTimeLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-2">
					<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
					<p className="text-gray-600 dark:text-gray-400">Уншиж байна...</p>
				</div>
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div className="min-h-screen flex flex-col overflow-auto">
				<div className="max-w-[1600px] mx-auto w-full flex flex-col px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
					{/* Header */}
					<header className="mb-4 sm:mb-6">
						<h3 className="text-lg sm:text-2xl font-extrabold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
							Шалгалтын жагсаалт
						</h3>
					</header>

					{/* Lesson Filter */}
					<div className="mb-4">
						{/* Desktop & Tablet */}
						<div className="hidden sm:flex gap-2 flex-wrap">
							{lessons.map((lesson) => (
								<Tooltip key={lesson.lesson_id}>
									<TooltipTrigger asChild>
										<Button
											type="button"
											onClick={() => setSelectedLessonId(lesson.lesson_id)}
											className={cn(
												"px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
												selectedLessonId === lesson.lesson_id
													? ""
													: "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700",
											)}
											aria-label={`${lesson.lesson_name} хичээл сонгох`}
											aria-pressed={selectedLessonId === lesson.lesson_id}
										>
											{lesson.lesson_name}
										</Button>
									</TooltipTrigger>
								</Tooltip>
							))}
						</div>

						{/* Mobile */}
						<select
							value={selectedLessonId}
							onChange={(e) => setSelectedLessonId(Number(e.target.value))}
							className="sm:hidden w-full px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
							aria-label="Хичээл сонгох"
						>
							{lessons.map((lesson) => (
								<option key={lesson.lesson_id} value={lesson.lesson_id}>
									{lesson.lesson_name}
								</option>
							))}
						</select>
					</div>

					{/* Search Results Info */}
					{(searchTerm || selectedLessonId !== 0) && (
						<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
							<AlertCircle size={16} />
							<span>
								<strong>{filteredData.length}</strong> шалгалт олдлоо
								{searchTerm && (
									<>
										{" "}
										&ldquo;<strong>{searchTerm}</strong>&rdquo; гэсэн хайлтаар
									</>
								)}
								{selectedLessonId !== 0 && (
									<>
										{" "}
										<strong>
											{
												lessons.find((l) => l.lesson_id === selectedLessonId)
													?.lesson_name
											}
										</strong>{" "}
										хичээлд
									</>
								)}
							</span>
						</div>
					)}

					{/* Exam Cards Grid */}
					<div className="grid grid-cols-3 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-3 sm:gap-4 pb-4 auto-rows-fr">
						{isPending
							? SKELETON_KEYS.map((key) => <SkeletonCard key={key} />)
							: filteredData.map((exam) => (
									<ExamCard
										key={exam.exam_id}
										exam={exam}
										isPaid={
											exam.ispaydescr === "Төлбөртэй" && exam.ispurchased === 0
										}
										isExpired={
											exam.flag === 3 || exam.flag_name === "Хугацаа дууссан"
										}
										onPayClick={() => handleCreateInvoice(exam)}
										isCreatingInvoice={isCreatingInvoice}
									/>
								))}
					</div>

					{/* Empty State */}
					{!isPending && filteredData.length === 0 && (
						<div className="text-center py-12 space-y-3">
							<AlertCircle
								className="mx-auto text-gray-400 dark:text-gray-600"
								size={48}
							/>
							<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
								Шалгалт олдсонгүй
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Өөр хайлт эсвэл шүүлтүүр ашиглан дахин оролдоно уу
							</p>
						</div>
					)}
				</div>
			</div>

			<QPayDialog
				open={qpayDialogOpen}
				onOpenChange={setQpayDialogOpen}
				qpayData={qpayData}
				userId={userId}
				onPaymentSuccess={handlePaymentSuccess}
			/>
		</TooltipProvider>
	);
}

const SkeletonCard = () => (
	<div className="w-full flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-md animate-pulse">
		<div className="h-20 w-full bg-slate-200 dark:bg-slate-800 relative shrink-0">
			<div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
				<div className="h-4 w-16 bg-slate-300 dark:bg-slate-700 rounded-full" />
				<div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded-full" />
			</div>
		</div>

		<div className="flex flex-col flex-1 p-3 gap-3">
			<div className="space-y-2 flex-1">
				<div className="flex justify-between items-center">
					<div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-3 w-3 bg-slate-200 dark:bg-slate-800 rounded-full" />
				</div>
				<div className="space-y-1.5">
					<div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
				</div>
			</div>

			<div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between">
				<div className="flex gap-3">
					<div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
				</div>
			</div>

			<div className="h-7 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
		</div>
	</div>
);
