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

  const serverDate = useMemo(
    () => (serverDateString ? new Date(serverDateString) : null),
    [serverDateString]
  );

  const serverDateRef = useRef<number | null>(null);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => {
    if (serverDate) {
      if (serverDate.getTime() !== serverDateRef.current) {
        serverDateRef.current = serverDate.getTime();
        setTimeout(() => setTickCount(0), 0);
      }
    }
  }, [serverDate]);

  useEffect(() => {
    if (!serverDate) return;
    const interval = setInterval(() => {
      setTickCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [serverDate]);

  const currentTime = useMemo(() => {
    if (!serverDate) return null;
    return new Date(serverDate.getTime() + tickCount * 1000);
  }, [serverDate, tickCount]);

  if (isLoading || !currentTime) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg">
        <Clock className="w-4 h-4 animate-spin" />
        <span className="font-mono text-sm">--:--:--</span>
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
    <div
      className=" fixed bottom-6 left-6 z-40  p-2 shadow-mdg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60
       shadow-lg  transition-all duration-300 hover:scale-110
       inline-flex items-center gap-3 px-4 py-2 bg-secondary rounded-2xl "
    >
      {/* 🖥️ Desktop / Tablet view */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-semibold tabular-nums">
            {year}.{month}.{day}
          </span>
        </div>
        <div className="w-px h-5 bg-gray-400 dark:bg-gray-600"></div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 animate-pulse" />
          <div className="font-mono text-sm font-semibold tabular-nums">
            {hours}:{minutes}:{seconds}
          </div>
        </div>
      </div>

      {/* 📱 Mobile view — зөвхөн цаг */}
      <div className="flex sm:hidden items-center gap-2">
        <Clock className="w-4 h-4 animate-pulse" />
        <div className="font-mono text-sm font-semibold tabular-nums">
          {hours}:{minutes}:{seconds}
        </div>
      </div>
    </div>
  );
}
