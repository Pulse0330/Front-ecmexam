"use client";

import { useQuery } from "@tanstack/react-query";
import { getSorilresultlists } from "@/lib/api";
import { SorilresultListResponseType } from "@/types/soril/sorilresultlists";
import { useAuthStore } from "@/stores/useAuthStore";
import { ExamCard } from "./card";

export default function ExamResultList() {
  const { userId } = useAuthStore();

  const { data, isLoading, isError, error } =
    useQuery<SorilresultListResponseType>({
      queryKey: ["examResults", userId],
      queryFn: () => getSorilresultlists(userId!),
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
      SorilRESULTLIST
      {exams.map((exam) => (
        <ExamCard key={exam.exam_id} exam={exam} />
      ))}
    </div>
  );
}
