"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarRange } from "lucide-react";
import { use } from "react";
import { ExamTimeTable } from "@/app/(dash)/exam-schedule/[time_id]/ExamTimeTable";
import { getExamRegistrationList } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";

interface ExamTimePageProps {
	params: Promise<{ time_id: string }>; // params-ийн төрлийг Promise гэж тодорхойлно
}
export default function ExamTimePage({ params }: ExamTimePageProps) {
	const unwrappedParams = use(params);
	const _timeId1 = unwrappedParams.time_id;

	const timeId = 57;

	const { userId } = useAuthStore();

	const { data, isLoading } = useQuery({
		queryKey: ["get_exam_registration_list", timeId],
		queryFn: () =>
			getExamRegistrationList({
				userId: userId ? Number(userId) : 0,
				examDateId: Number(timeId),
			}),
		enabled: !!userId,
	});

	return (
		<div className="py-6 max-w-7xl mx-auto">
			{" "}
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b pb-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
						<div className="bg-primary/10 p-2 rounded-lg text-primary">
							<CalendarRange size={24} />
						</div>
						Шалгалтын өрөөнүүд
					</h1>
					<p className="text-sm text-muted-foreground mt-1 font-medium">
						{/* {isLoading
							? "Өрөөний мэдээллийг шалгаж байна..."
							: `Нийт ${data?.length || 0} өрөө бүртгэгдсэн байна.`} */}
						aaa
					</p>
				</div>
				{/* <Button
					onClick={() => {
						setSelectedRoomId(null);
						setIsOpen(true);
					}}
					className="gap-2 shadow-sm"
				>
					<Plus size={18} />
					Шинэ өрөө нэмэх
				</Button> */}
			</header>{" "}
			<ExamTimeTable data={data?.RetData || []} isLoading={isLoading} />
		</div>
	);
}
