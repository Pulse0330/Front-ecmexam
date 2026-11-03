"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Download } from "lucide-react";
import { toast } from "sonner";
import { ExamTable } from "@/app/(dash)/exam-schedule/ExamTable";
import { PageHeader } from "@/components/page/pageHeader";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getExam, getExamSave } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ExamMaterialsPage() {
	const queryClient = useQueryClient();
	const { userId } = useAuthStore();

	const { data, isLoading } = useQuery({
		queryKey: ["get_exam"],
		queryFn: () => getExam({ userId: userId ? Number(userId) : 0 }),
		enabled: !!userId,
	});

	const { mutate: examSave, isPending } = useMutation({
		mutationFn: getExamSave,
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ["get_exam"] });
			toast.success(res.RetResponse.ResponseMessage || "Амжилттай");
		},
	});

	return (
		<div className="mx-auto max-w-7xl pb-10">
			<PageHeader
				title="Шалгалтын хуваарь"
				description={`Нийт ${data?.RetData?.length || 0} шалгалт. Шалгалт дээр дарж цагийн хуваарийг нээнэ үү.`}
				icon={BookOpen}
				className="mb-2 border-b"
				actions={
					userId === 303866 && (
						<Button
							onClick={() => examSave()}
							disabled={isPending}
							className="h-10 w-full gap-2 md:w-auto"
						>
							{isPending ? <Spinner /> : <Download size={16} />}
							{isPending ? "Татаж байна..." : "Хуваарь татах"}
						</Button>
					)
				}
			/>

			<ExamTable
				data={data?.RetData || []}
				isLoading={isLoading}
				onFetchData={() => examSave()}
			/>
		</div>
	);
}
