// src/components/iTimer.tsx
"use client";

import React, { useMemo, useEffect } from "react";
import { Clock } from "lucide-react";
import { useServerTime } from "@/hooks/useServerTime";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// HH:MM:SS хэлбэрт хөрвүүлэх туслах функц (Хэвээр)
const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

interface ITimerProps {
  examEndTime: string | undefined; // Дуусах цаг (ISO string)
  totalDurationSeconds: number; // Нийт үргэлжлэх хугацаа (секундээр, жишээ нь minut-аас)
  answeredCount: number; // Хариулсан асуултын тоо
  totalCount: number; // Нийт асуултын тоо
  onTimeEnd: () => void; // Цаг дууссан үед дуудах функц
  onTimeUpdate: (elapsedTime: number) => void; // Зарцуулсан хугацааг page.tsx руу буцаах
}

export const ITimer: React.FC<ITimerProps> = ({
  examEndTime,
  totalDurationSeconds,
  answeredCount,
  totalCount,
  onTimeEnd,
  onTimeUpdate,
}) => {
  const { currentTime: serverTime, isLoading: isServerTimeLoading } =
    useServerTime();

  // 1. Шалгалт дуусах цагийг (Timestamp) тооцоолох
  const examEndTimeStamp = useMemo(() => {
    if (!examEndTime) return null;
    try {
      return new Date(examEndTime).getTime();
    } catch (e) {
      return null;
    }
  }, [examEndTime]);

  // 2. Үлдсэн Цагийг Серверийн Цагт Үндэслэн Тооцоолох (Remaining Time)
  const remainingTime = useMemo(() => {
    if (!serverTime || !examEndTimeStamp) return 0;

    const diff = examEndTimeStamp - serverTime.getTime();
    const remainingSeconds = Math.max(0, Math.floor(diff / 1000));

    return remainingSeconds;
  }, [serverTime, examEndTimeStamp]);

  // 3. Зарцуулсан Хугацааг Тооцоолох (Elapsed Time)
  const elapsedTime = useMemo(() => {
    if (totalDurationSeconds === 0) return 0;

    // Зарцуулсан Хугацаа = Нийт Үргэлжлэх Хугацаа - Үлдсэн Хугацаа
    const calculatedElapsedTime = totalDurationSeconds - remainingTime;
    return Math.max(0, calculatedElapsedTime);
  }, [totalDurationSeconds, remainingTime]);

  // 4. Явцын Тооцоолол
  const progressPercentage =
    totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // 5. Цаг дуусахыг шалгах & Зарцуулсан хугацааг буцаах
  useEffect(() => {
    // Цаг дуусахыг мэдэгдэх
    if (
      remainingTime <= 0 &&
      totalDurationSeconds > 0 &&
      !isServerTimeLoading
    ) {
      onTimeEnd();
    }
    // Зарцуулсан хугацааг page.tsx руу буцаах (Finish API руу явахын тулд)
    onTimeUpdate(elapsedTime);
  }, [
    remainingTime,
    totalDurationSeconds,
    onTimeEnd,
    onTimeUpdate,
    elapsedTime,
    isServerTimeLoading,
  ]);

  if (isServerTimeLoading || !serverTime || !examEndTime) {
    return (
      <Card className="shadow-lg border-t-4 border-gray-300 sticky top-0 z-10 p-6">
        <div className="text-gray-500 flex items-center text-lg font-medium">
          <Clock className="w-6 h-6 mr-2 animate-spin" /> Цагийн мэдээлэл
          ачааллаж байна...
        </div>
      </Card>
    );
  }

  const isTimeCritical = remainingTime < 300; // 5 минутаас бага

  return (
    <Card className="shadow-lg border-t-4 border-blue-500 sticky top-0 z-10">
      <CardHeader className="p-4 md:p-6 pb-2">
        <div className="flex justify-between items-center mb-2">
          {/* 1. Үлдсэн Хугацаа */}
          <CardTitle className="text-xl font-bold flex items-center">
            <Clock
              className={`w-6 h-6 mr-2 ${
                isTimeCritical ? "text-red-500 animate-pulse" : "text-blue-600"
              }`}
            />
            Үлдсэн:
            <span
              className={`ml-2 text-2xl font-extrabold ${
                isTimeCritical ? "text-red-600" : "text-blue-700"
              }`}
            >
              {formatTime(remainingTime)}
            </span>
          </CardTitle>

          {/* 2. Зарцуулсан Хугацаа */}
          <div className="text-base font-semibold text-gray-700">
            Зарцуулсан:
            <span className="text-lg text-blue-500 font-bold ml-2">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        {/* 3. Явцын мэдээлэл */}
        <div className="flex justify-end items-center text-base font-semibold text-gray-700">
          Хариулт: {answeredCount} / {totalCount}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <Progress value={progressPercentage} className="h-2" />
      </CardContent>
    </Card>
  );
};
