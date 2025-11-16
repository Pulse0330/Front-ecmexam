"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { getExamResultMore } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamResponseMoreApiResponse } from "@/types/exam/examResultMore";

export default function ExamResultDetailPage() {
	const { userId } = useAuthStore();
	const params = useParams();
	const searchParams = useSearchParams();

	const finishedTestId = Number(params?.id);
	const examId = searchParams?.get("examId")
		? Number(searchParams.get("examId"))
		: undefined;

	const { data, isLoading, isError, error } =
		useQuery<ExamResponseMoreApiResponse>({
			queryKey: ["examResultMore", finishedTestId, examId, userId],
			queryFn: () => {
				if (examId === undefined) throw new Error("examId байхгүй байна");
				return getExamResultMore(finishedTestId, examId, userId || 0);
			},
		});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
				<span className="ml-2">Үр дүн татаж байна...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-red-500 font-semibold">Алдаа гарлаа</p>
					<p className="text-sm text-gray-600">{(error as Error)?.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Шалгалтын Дэлгэрэнгүй Үр Дүн</h1>

			{data?.RetDataFirst.map((q) => {
				const rowNum = Number(q.row_num); // string -> number

				const answers = data.RetDataSecond.filter(
					(a) => a.question_id === q.question_id,
				);

				return (
					<div key={q.question_id} className="p-4 border rounded mb-4">
						<p className="font-semibold mb-2">
							{rowNum}. {q.question_html}
						</p>
						<ul className="ml-4 space-y-1">
							{answers.map((a) => (
								<li
									key={a.answer_id}
									className={`flex items-center gap-2 ${
										a.is_true === 1 ? "text-green-600 font-semibold" : ""
									}`}
								>
									{a.is_true === 1 && <CheckCircle className="w-4 h-4" />}
									{a.is_true === 0 && (
										<XCircle className="w-4 h-4 text-red-500" />
									)}
									<span />
								</li>
							))}
						</ul>
					</div>
				);
			})}
		</div>
	);
}
