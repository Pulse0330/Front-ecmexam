"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { CalendarRange, Clock, Info } from "lucide-react";
import { use, useMemo } from "react";
import ExamPrintService from "@/app/(dash)/exam-schedule/[time_id]/ExamPrintService";
import { ExamTimeTable } from "@/app/(dash)/exam-schedule/[time_id]/ExamTimeTable";
import { IBackButton } from "@/components/iBackButton";
import { Skeleton } from "@/components/ui/skeleton"; // Skeleton байвал ашиглах
import { getExamInfo, getExamRegistrationList } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";

interface ExamTimePageProps {
	params: Promise<{ time_id: string }>;
}

export default function ExamTimePage({ params }: ExamTimePageProps) {
	const { time_id } = use(params);
	const { userId } = useAuthStore();

	// Queries
	const { data: registrationData, isLoading: isListLoading } = useQuery({
		queryKey: ["get_exam_registration_list", time_id, userId],
		queryFn: () =>
			getExamRegistrationList({
				userId: userId ? Number(userId) : 0,
				examDateId: Number(time_id),
			}),
		enabled: !!userId && !!time_id,
	});

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

	return (
		<div className="py-8 px-4 max-w-7xl mx-auto space-y-8">
			<header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b pb-8">
				<div className="flex items-start gap-4">
					<IBackButton className="mt-1" />
					<div className="space-y-1">
						<div className="flex items-center gap-3">
							<div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0">
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
								Үргэлжлэх:{" "}
								<span className="font-semibold text-foreground">
									{examInfo?.duration || 0} минут
								</span>
							</span>
							<span className="hidden md:inline text-slate-300">|</span>
							<span className="flex items-center gap-1.5">
								<Info size={14} className="text-emerald-500" />
								Бүртгэл:{" "}
								<span className="font-semibold text-foreground">
									{`${formatDateSafe(
										examInfo?.register_start_date,
									)} | ${formatDateSafe(examInfo?.register_end_date)}`}
								</span>
							</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3 w-full lg:w-auto">
					<ExamPrintService exam_rooms={examRooms} />
				</div>
			</header>

			<ExamTimeTable
				data={examRooms}
				isLoading={isLoading}
				timeId={Number(time_id)}
				examInfo={examInfo}
			/>
		</div>
	);
}
