"use client";

import { useQuery } from "@tanstack/react-query";
import { getexamresultlists } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamresultListResponseType } from "@/types/exam/examResultList";
import { ExamCard } from "./card";

export default function ExamResultList() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError, error } =
		useQuery<ExamresultListResponseType>({
			queryKey: ["examResults", userId],
			queryFn: () => getexamresultlists(userId || 0),
			enabled: !!userId,
		});

	if (!userId)
		return <p className="text-center mt-10">Хэрэглэгч нэвтрээгүй байна.</p>;

	if (isLoading) return <p className="text-center mt-10">Уншиж байна...</p>;

	if (isError)
		return (
			<p className="text-center mt-10 text-red-500">
				API Error: {(error as Error).message}
			</p>
		);

	const exams = data?.RetData || [];

	if (exams.length === 0)
		return <p className="text-center mt-10">Шалгалтын үр дүн олдсонгүй.</p>;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
			examresult
			{exams.map((exam) => (
				<ExamCard key={exam.exam_id} exam={exam} />
			))}
		</div>
	);
}
