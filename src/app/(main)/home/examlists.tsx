// src/components/ExamList.tsx
"use client";

import React from "react";
import { Exam } from "@/types/home";

interface ExamListProps {
  exams: Exam[];
}

export default function ExamList({ exams }: ExamListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {exams.map((exam) => (
        <div
          key={exam.exam_id}
          className="border rounded-xl shadow p-4 bg-white dark:bg-gray-800"
        >
          <h3 className="text-lg font-semibold mb-1">{exam.title}</h3>
          <p className="text-sm text-gray-500">
            Огноо: {new Date(exam.ognoo).toLocaleDateString()}{" "}
            {new Date(exam.ognoo).toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-500">
            Хугацаа: {exam.exam_minute} минут
          </p>
          <p className="text-sm text-gray-500">Багш: {exam.teach_name}</p>
          <p className="text-sm text-gray-500">Төлбөр: {exam.ispaydescr}</p>
          <p
            className={`mt-2 font-medium ${
              exam.flag === 1 ? "text-green-600" : "text-red-600"
            }`}
          >
            {exam.flag_name}
          </p>
        </div>
      ))}
    </div>
  );
}
