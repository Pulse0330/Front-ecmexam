"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookOpen, Download } from "lucide-react";
import { toast } from "sonner";
import { ExamTable } from "@/app/(dash)/exam-schedule/ExamTable";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getExam, getExamSave } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ExamMaterialsPage() {
	const { userId } = useAuthStore();

	const { data, isLoading } = useQuery({
		queryKey: ["get_exam"],
		queryFn: () => getExam({ userId: userId ? Number(userId) : 0 }),
		enabled: !!userId,
	});

	const { mutate: examSave, isPending } = useMutation({
		mutationFn: getExamSave,
		onSuccess: (res) => {
			toast.success(res.RetResponse.ResponseMessage || "Амжилттай");
		},
	});

	return (
		<div className="max-w-7xl mx-auto py-6">
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b pb-6 text-foreground">
				<div className="flex items-center gap-3">
					<div>
						<h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
							<div className="bg-primary/10 p-2 rounded-lg text-primary">
								<BookOpen className="text-primary" />
							</div>
							Шалгалтын хувиар
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Та хувиар татах дээр дарж шалгалтыг шинэчлэх боломжтой. | Нийт{" "}
							{data?.RetData?.length || 0} шалгалт байна.
						</p>
					</div>
				</div>
				<Button
					onClick={() => examSave()}
					disabled={isPending}
					className="w-full md:w-auto"
				>
					{isPending ? (
						<div className="flex items-center gap-2">
							<Spinner />
							Татаж байна...
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Download size={14} />
							Хувиар татах
						</div>
					)}
				</Button>
			</header>

			<ExamTable
				data={data?.RetData || []}
				isLoading={isLoading}
				onFetchData={() => examSave()}
			/>
		</div>
	);
}
