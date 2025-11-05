"use client";

import Image from "next/image";
import { PastExam } from "@/types/home";

interface PastExamListProps {
  pastExams: PastExam[];
}

export default function HomeSorilLists({ pastExams }: PastExamListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {pastExams.map((exam) => (
        <div
          key={exam.exam_id}
          className="border rounded-xl shadow overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300"
        >
          {/* Зураг эхэнд */}
          <div className="relative w-full h-40 bg-gray-200">
            {exam.filename && (
              <Image
                src={exam.filename}
                alt={exam.soril_name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>

          {/* Текст мэдээлэл */}
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-semibold line-clamp-2">
              {exam.soril_name}
            </h3>

            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="font-medium">Огноо:</span>{" "}
                {exam.sorildate !== "1900-01-01T00:00:00.000Z"
                  ? new Date(exam.sorildate).toLocaleDateString("mn-MN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Хугацаагүй"}
              </p>
              <p>
                <span className="font-medium">Асуулт:</span> {exam.que_cnt}
              </p>
              {exam.minut > 0 && (
                <p>
                  <span className="font-medium">Хугацаа:</span> {exam.minut}{" "}
                  минут
                </p>
              )}
            </div>

            <div className="pt-2 border-t dark:border-gray-700">
              <p
                className={`font-medium ${
                  exam.isguitset === 1 ? "text-green-600" : "text-orange-600"
                }`}
              >
                {exam.isguitset === 0 ? "✓ Гүйцэтгэсэн" : "○ Гүйцэтгээгүй"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
