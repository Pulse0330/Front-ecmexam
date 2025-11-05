"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getServerDate } from "@/lib/api";
import { Clock, Calendar } from "lucide-react";

export default function ServerDate() {
  const { data: serverDateString, isLoading } = useQuery({
    queryKey: ["serverTime"],
    queryFn: getServerDate,
    staleTime: 0,
  });

  // Серверээс ирсэн огноог Date болгож хадгалах
  const serverDate = useMemo(
    () => (serverDateString ? new Date(serverDateString) : null),
    [serverDateString]
  );

  // Серверийн огнооны timestamp-г хадгалах ref
  const serverDateRef = useRef<number | null>(null);

  // Tick тоолуур
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => {
    if (serverDate) {
      if (serverDate.getTime() !== serverDateRef.current) {
        serverDateRef.current = serverDate.getTime();
        // Tick reset-ийг deferred state update-аар хийх
        setTimeout(() => setTickCount(0), 0);
      }
    }
  }, [serverDate]);

  // Секунд тутам tick нэмэх
  useEffect(() => {
    if (!serverDate) return;

    const interval = setInterval(() => {
      setTickCount((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [serverDate]);

  // Одоогийн цаг = серверийн цаг + tick count
  const currentTime = useMemo(() => {
    if (!serverDate) return null;
    return new Date(serverDate.getTime() + tickCount * 1000);
  }, [serverDate, tickCount]);

  if (isLoading || !currentTime) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg">
        <Clock className="w-4 h-4 animate-spin " />
        <span className="font-mono text-sm ">--:--:--</span>
      </div>
    );
  }

  const year = currentTime.getUTCFullYear();
  const month = String(currentTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(currentTime.getUTCDate()).padStart(2, "0");
  const hours = String(currentTime.getUTCHours()).padStart(2, "0");
  const minutes = String(currentTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(currentTime.getUTCSeconds()).padStart(2, "0");

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2  bg-gray-700 rounded-2xl">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-semibold tabular-nums">
          {year}.{month}.{day}
        </span>
      </div>
      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 animate-pulse" />
        <div className="font-mono text-sm font-semibold tabular-nums">
          {hours}:{minutes}:{seconds}
        </div>
      </div>
    </div>
  );
}
