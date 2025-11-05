// src/app/(main)/home/ExamCard.tsx
"use client";

import React from "react";
import { ExamresultListCardProps } from "@/types/exam/examresiltlist";

export const ExamCard: React.FC<ExamresultListCardProps> = ({ exam }) => {
  const finished = exam.isfinished === 1;
  const examDate = new Date(exam.Ognoo);

  return (
    <div className="border rounded-xl shadow p-4 bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-1">{exam.title}</h3>
      <p className="text-sm text-gray-500">
        Огноо: {examDate.toLocaleDateString()} {examDate.toLocaleTimeString()}
      </p>
      <p className="text-sm text-gray-500">Хугацаа: {exam.exam_minute} минут</p>
      <p className="text-sm text-gray-500">
        Оноо: {exam.test_dun} ({exam.test_perc}%)
      </p>
      <p
        className={`mt-2 font-medium ${
          finished ? "text-green-600" : "text-red-600"
        }`}
      >
        {finished ? "Дууссан" : "Дуусаагүй"}
      </p>
    </div>
  );
};
