"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarRange, Clock, Download } from "lucide-react";
import { use } from "react";
import { toast } from "sonner";
import { ExamTimeTable } from "@/app/(dash)/exam-schedule/[time_id]/ExamTimeTable";
import { VariantList } from "@/app/(dash)/exam-schedule/[time_id]/VariantList";
import { PageHeader } from "@/components/page/pageHeader";
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
		<div className="mx-auto max-w-7xl space-y-6 pb-10">
			<PageHeader
				back
				icon={CalendarRange}
				className="border-b"
				title={
					isInfoLoading ? (
						<Skeleton className="h-8 w-64" />
					) : (
						examInfo?.name || "Шалгалтын мэдээлэл"
					)
				}
				description={
					<span className="flex items-center gap-1.5">
						<Clock size={14} className="text-primary" />
						Үргэлжлэх хугацаа:{" "}
						<span className="font-semibold text-foreground">
							{examInfo?.duration || 0} минут
						</span>
					</span>
				}
				actions={
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="w-full sm:w-auto">
									<Button
										onClick={() => mutate()}
										disabled={isPending || hasMaterial}
										className="h-10 w-full gap-2 sm:w-auto"
									>
										{isPending ? <Spinner /> : <Download />}
										{isPending
											? "Татаж байна..."
											: hasMaterial
												? "Материал татагдсан"
												: "Материал татах"}
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
				}
			/>
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
