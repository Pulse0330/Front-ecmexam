// hooks/useServerTime.ts
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getServerDate } from "@/lib/api";

export function useServerTime() {
  const { data: serverDateString, isLoading } = useQuery({
    queryKey: ["serverTime"],
    queryFn: getServerDate,

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

  return {
    currentTime,
    isLoading,
    serverDate,
  };
}

// Formatted version hook
export function useFormattedServerTime() {
  const { currentTime, isLoading } = useServerTime();

  const formatted = useMemo(() => {
    if (!currentTime) {
      return {
        year: "--",
        month: "--",
        day: "--",
        hours: "--",
        minutes: "--",
        seconds: "--",
        date: "--/--/----",
        time: "--:--:--",
        full: "----/--/-- --:--:--",
      };
    }

    const year = currentTime.getUTCFullYear();
    const month = String(currentTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(currentTime.getUTCDate()).padStart(2, "0");
    const hours = String(currentTime.getUTCHours()).padStart(2, "0");
    const minutes = String(currentTime.getUTCMinutes()).padStart(2, "0");
    const seconds = String(currentTime.getUTCSeconds()).padStart(2, "0");

    return {
      year: String(year),
      month,
      day,
      hours,
      minutes,
      seconds,
      date: `${year}.${month}.${day}`,
      time: `${hours}:${minutes}:${seconds}`,
      full: `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`,
    };
  }, [currentTime]);

  return {
    ...formatted,
    currentTime,
    isLoading,
  };
}