// src/app/(main)/home/paymentexam.tsx
"use client";

import React from "react";
import { Course } from "@/types/home";

interface PaymentExamProps {
  courses: Course[];
}

const PaymentExam: React.FC<PaymentExamProps> = ({ courses }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {courses.map((course) => (
        <div
          key={course.planid}
          className="border rounded-lg shadow p-4 bg-white dark:bg-gray-800"
        >
          <h3 className="font-semibold text-lg">{course.title}</h3>
          <p className="text-sm text-gray-500">Үнэ: {course.amount}₮</p>
          <p className="text-sm text-gray-500">Төлбөр: {course.paydescr}</p>
          <p className="text-sm text-gray-500">Үнэлгээ: {course.rate}</p>
        </div>
      ))}
    </div>
  );
};

export default PaymentExam;
