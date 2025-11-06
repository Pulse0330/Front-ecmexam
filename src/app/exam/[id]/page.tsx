"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { useParams } from "next/navigation";
import { getExamById, saveExamAnswer } from "@/lib/api"; // API функцууд
import { ApiExamResponse } from "@/types/exam/exam"; // Төрлүүд
import { useFormattedServerTime } from "@/hooks/useServerTime";

// Компонентууд
import SingleSelectQuestion from "@/app/exam/component/question/singleSelect";
import FinishExamResultDialog from "@/app/exam/component/finish";

// shadcn/ui компонентууд
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ExamPage() {
  const { userId } = useAuthStore();
  const { id } = useParams();

  const { data: examData, isLoading } = useQuery<ApiExamResponse>({
    queryKey: ["exam", userId, id],
    queryFn: () => getExamById(userId!, Number(id)),
    enabled: !!userId && !!id,
    staleTime: 5 * 60 * 1000,
  });

  // --- Server Time Hook ---
  const {
    currentTime,
    isLoading: serverTimeLoading,
    full: formattedServerTime,
  } = useFormattedServerTime();

  // --- Entered At: Lazy initializer ашиглан хуудсанд орсон мөчийг хадгалах ---
  const [enteredAt] = useState<Date | null>(() => currentTime ?? null);

  // --- Single Select Асуултууд ---
  const singleSelectQuestions = useMemo(() => {
    if (!examData) return [];
    return examData.Questions.filter((q) => q.que_type_id === 1).map((q) => {
      const answers = examData.Answers.filter(
        (a) => a.question_id === q.question_id && a.answer_type === 1
      ).map((a) => ({
        answer_id: a.answer_id,
        answer_name_html: a.answer_name_html,
        answer_img: a.answer_img || undefined,
        is_true: false,
      }));
      return { ...q, answers };
    });
  }, [examData]);

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number | null>
  >({});

  // --- Progress ---
  const totalCount = singleSelectQuestions.length;
  const answeredCount = useMemo(
    () =>
      Object.values(selectedAnswers).filter((answer) => answer !== null).length,
    [selectedAnswers]
  );
  const progressPercentage =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // --- Save Answer Mutation ---
  const saveAnswerMutation = useMutation({
    mutationFn: ({
      questionId,
      answerId,
      queTypeId,
      rowNum,
    }: {
      questionId: number;
      answerId: number;
      queTypeId: number;
      rowNum: number;
    }) => {
      return saveExamAnswer(
        userId!,
        examData!.ExamInfo[0].id,
        questionId,
        answerId,
        queTypeId,
        "",
        rowNum
      );
    },
    onSuccess: (response) => console.log("Server response:", response),
    onError: (err) => console.error("Failed to save answer", err),
  });

  // --- Handle Answer Change ---
  const handleAnswerChange = (questionId: number, answerId: number | null) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
    if (!examData || answerId === null) return;
    const question = examData.Questions.find(
      (q) => q.question_id === questionId
    );
    if (!question) return;

    saveAnswerMutation.mutate({
      questionId,
      answerId,
      queTypeId: question.que_type_id,
      rowNum: Number(question.row_num),
    });
  };

  // --- Loading / Error States ---
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium">
        ⏳ Шалгалтын мэдээлэл ачааллаж байна...
      </div>
    );

  if (!examData || examData.Questions.length === 0)
    return (
      <div className="p-8 text-center text-xl font-medium text-red-600">
        ❌ Шалгалт олдсонгүй эсвэл асуулт байхгүй байна.
      </div>
    );

  // --- Render Section ---
  return (
    <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <Card className="shadow-lg border-t-4 border-blue-500 sticky top-0 z-10">
        <CardHeader className="p-4 md:p-6 pb-0">
          <CardTitle className="text-xl font-bold flex justify-between items-center">
            Шалгалтын явц
            <span className="text-blue-600">
              {answeredCount} / {totalCount}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-2">
          <div className="text-sm text-gray-500 mb-2">
            **{progressPercentage}%**-ийг бөглөсөн
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {singleSelectQuestions.map((q, index) => (
          <div
            key={q.question_id}
            className={`border rounded-xl p-5 shadow-sm transition-all duration-300 ${
              selectedAnswers[q.question_id] !== null
                ? "border-green-400 bg-green-50/50"
                : "hover:shadow-md"
            }`}
          >
            <h2 className="font-bold mb-4 text-lg">
              <span className="text-blue-600 mr-2">{index + 1}.</span>{" "}
              {q.question_name}
            </h2>
            <SingleSelectQuestion
              questionId={q.question_id}
              questionText={q.question_name}
              answers={q.answers}
              mode="exam"
              selectedAnswer={selectedAnswers[q.question_id] ?? null}
              onAnswerChange={handleAnswerChange}
            />
          </div>
        ))}
      </div>

      {/* Entered At Display */}
      <div className="text-right text-sm text-gray-500 mb-2">
        Хуудас руу орсон цаг:{" "}
        {serverTimeLoading ? "Ачааллаж байна..." : enteredAt?.toLocaleString()}
      </div>

      {/* Finish Exam Button */}
      {examData && examData.ExamInfo.length > 0 && (
        <div className="mt-8 pt-4 border-t flex justify-end">
          <FinishExamResultDialog
            examId={examData.ExamInfo[0].id}
            examType={examData.ExamInfo[0].exam_type}
            startEid={examData.ExamInfo[0].start_eid}
            examTime={examData.ExamInfo[0].minut}
            answeredCount={answeredCount}
            totalCount={totalCount}
          />
        </div>
      )}
    </div>
  );
}
