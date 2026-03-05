"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import {
	CalendarRange,
	Clock,
	Download,
	Info,
	Printer,
	Users,
} from "lucide-react";
import { use, useMemo } from "react";
import { toast } from "sonner";
import ExamPrintService from "@/app/(dash)/exam-schedule/[time_id]/ExamPrintService";
import { ExamTimeTable } from "@/app/(dash)/exam-schedule/[time_id]/ExamTimeTable";
import { VariantList } from "@/app/(dash)/exam-schedule/[time_id]/VariantList";
import { mockExamTimeResponse } from "@/app/(dash)/exam-schedule/mock";
import { IBackButton } from "@/components/iBackButton";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton"; // Skeleton байвал ашиглах
import { Spinner } from "@/components/ui/spinner";
import {
	getExamInfo,
	getExamMateralVariantDownload,
	getExamMetaralList,
	getExamRegistrationList,
} from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";

interface ExamTimePageProps {
	params: Promise<{ time_id: string }>;
}

export default function ExamTimePage({ params }: ExamTimePageProps) {
	const queryClient = useQueryClient();

	const { time_id } = use(params);
	const { userId } = useAuthStore();

	const { data: registrationData, isLoading: isListLoading } = useQuery({
		queryKey: ["get_exam_registration_list", time_id, userId],
		queryFn: () =>
			getExamRegistrationList({
				userId: userId ? Number(userId) : 0,
				examDateId: Number(time_id),
			}),
		enabled: !!userId && !!time_id,
	});

	// const registrationData = mockExamTimeResponse;
	// const isListLoading = false;

	const { data: examInfo, isLoading: isInfoLoading } = useQuery({
		queryKey: ["api_exam_info_by_examdateid", time_id, userId],
		queryFn: () =>
			getExamInfo({
				userId: userId ? Number(userId) : 0,
				examDateId: Number(time_id),
			}),
		enabled: !!userId && !!time_id,
		select: (res) => res.RetData?.[0],
	});

	// Массив өгөгдлийг тогтворжуулах
	const examRooms = useMemo(
		() => registrationData?.RetData || [],
		[registrationData],
	);

	// Огноо форматлах туслах функц
	const formatDateSafe = (dateStr?: string) => {
		if (!dateStr) return "Тодорхойгүй";
		const date = new Date(dateStr);
		return isValid(date) ? format(date, "yyyy.MM.dd HH:mm") : "Буруу огноо";
	};

	const isLoading = isListLoading || isInfoLoading;

	const { data: materalData, isLoading: materalIsLoading } = useQuery({
		queryKey: ["get_exam_materal_list", time_id, userId, examInfo],
		queryFn: () =>
			getExamMetaralList({
				userId: userId ? Number(userId) : 0,
				examDateId: Number(time_id),
				examId: examInfo?.exam_id || 0,
			}),
		enabled: !!userId && !!time_id && !!examInfo,
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const payload = {
				userId: userId || 0,
				examId: examInfo?.exam_id || 0,
				examDateId: Number(time_id) || 0,
			};

			return getExamMateralVariantDownload(payload);
		},
		onSuccess: (res) => {
			if (res.RetData.error_code === "VAL_003") {
				toast.error(res.RetData.details);
			} else {
				queryClient.invalidateQueries({
					queryKey: ["get_exam_materal_list"],
				});
			}
		},
	});

	return (
		<div className="py-8 px-4 max-w-7xl mx-auto space-y-8">
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b pb-6 text-foreground">
				<div className="flex items-start gap-4">
					<IBackButton className="mt-1" />
					<div>
						<div className="text-2xl font-bold tracking-tight flex items-center gap-3">
							<div className="bg-primary/10 p-2 rounded-lg text-primary">
								<CalendarRange size={26} />
							</div>
							{isInfoLoading ? (
								<Skeleton className="h-8 w-64" />
							) : (
								<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
									{examInfo?.name || "Шалгалтын мэдээлэл"}
								</h1>
							)}
						</div>

						<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
							<span className="flex items-center gap-1.5">
								<Clock size={14} className="text-blue-500" />
								Үргэлжлэх хугацаа:{" "}
								<span className="font-semibold text-foreground">
									{examInfo?.duration || 0} минут
								</span>
							</span>
							{/* <span className="hidden md:inline text-slate-300">|</span> */}
							{/* <span className="flex items-center gap-1.5">
								<Info size={14} className="text-emerald-500" />
								Бүртгэл:{" "}
								<span className="font-semibold text-foreground">
									{`${formatDateSafe(
										examInfo?.register_start_date,
									)} | ${formatDateSafe(examInfo?.register_end_date)}`}
								</span>
							</span> */}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 w-full lg:w-auto">
					<Button onClick={() => mutate()}>
						{isPending ? (
							<div className="flex items-center gap-2">
								<Spinner />
								Татаж байна...
							</div>
						) : (
							<div className="flex items-center gap-2">
								<Download /> Шалгалтын материал вариентууд татах
							</div>
						)}
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<Printer />
								Багшийн хэвлэх хэсэг
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-60" align="center">
							<DropdownMenuGroup>
								<ExamPrintService exam_rooms={examRooms} examInfo={examInfo} />
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Users /> Бүртгэлийн хуудас
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
			<VariantList
				data={materalData?.RetData || null}
				isLoading={materalIsLoading}
				openExam={examInfo?.open_date}
			/>
			<ExamTimeTable
				data={examRooms}
				isLoading={isLoading}
				timeId={Number(time_id)}
				examInfo={examInfo}
			/>
		</div>
	);
}
