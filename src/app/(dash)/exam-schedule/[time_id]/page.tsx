"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarRange, Clock, Download } from "lucide-react";
import { use } from "react";
import { toast } from "sonner";
import { ExamTimeTable } from "@/app/(dash)/exam-schedule/[time_id]/ExamTimeTable";
import { VariantList } from "@/app/(dash)/exam-schedule/[time_id]/VariantList";
import { IBackButton } from "@/components/iBackButton";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton"; // Skeleton байвал ашиглах
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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

	const { time_id: rawId } = use(params);
	const { userId } = useAuthStore();
	const [time_id, exam_id] = rawId.split("-");

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

	const { data: materalData, isLoading: materalIsLoading } = useQuery({
		queryKey: ["api_examination_variants", time_id, userId, exam_id],
		queryFn: () =>
			getExamMetaralList({
				userId: userId ? Number(userId) : 0,
				examDateId: Number(time_id),
				examId: Number(exam_id),
			}),
		enabled: !!userId && !!time_id && !!exam_id,
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			const payload = {
				userId: userId || 0,
				examId: Number(exam_id),
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

	const hasMaterial = (materalData?.RetData?.length ?? 0) > 0;

	return (
		<div className="py-6 max-w-7xl mx-auto space-y-8">
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b pb-6 text-foreground">
				<div className="flex items-start gap-4 w-full">
					<IBackButton className="mt-1" />
					<div>
						<div className="text-2xl font-bold tracking-tight flex items-center gap-3 ">
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
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2  lg:w-auto">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span>
									<Button
										onClick={() => mutate()}
										disabled={isPending || hasMaterial}
									>
										{isPending ? (
											<div className="flex items-center gap-2">
												<Spinner />
												Татаж байна...
											</div>
										) : (
											<div className="flex items-center gap-2">
												<Download /> Материал татах
											</div>
										)}
									</Button>
								</span>
							</TooltipTrigger>
							{hasMaterial && (
								<TooltipContent>
									<p>Материал татагдсан байна, дахин татах шаардлагагүй</p>
								</TooltipContent>
							)}
						</Tooltip>
					</TooltipProvider>
				</div>
			</header>
			<VariantList
				data={materalData?.RetData || null}
				isLoading={materalIsLoading}
			/>
			<ExamTimeTable
				data={registrationData?.RetData || []} // Шууд датаг дамжуулна
				isLoading={isListLoading || isInfoLoading}
				timeId={Number(time_id)}
				exam_id={Number(exam_id)}
			/>
		</div>
	);
}
