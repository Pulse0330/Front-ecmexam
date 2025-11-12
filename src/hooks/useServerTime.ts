"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { getServerDate } from "@/lib/api";

/**
 * Серверийн цагийг авдаг, секунд тутам шинэчилдэг hook
 */
export function useServerTime() {
	const { data: serverDateString, isLoading } = useQuery({
		queryKey: ["serverTime"],
		queryFn: getServerDate,
		staleTime: 0,
		refetchOnWindowFocus: false,
	});

	// Серверийн string-г Date болгож хөрвүүлэх
	const serverDate = useMemo(
		() => (serverDateString ? new Date(serverDateString) : null),
		[serverDateString],
	);

	const serverDateRef = useRef<number | null>(null);
	const [tickCount, setTickCount] = useState(0);

	// Серверийн цаг ирэхэд tick-ийг дахин эхлүүлэх
	useEffect(() => {
		if (serverDate) {
			if (serverDate.getTime() !== serverDateRef.current) {
				serverDateRef.current = serverDate.getTime();
				setTickCount(0);
			}
		}
	}, [serverDate]);

	// Секунд тутам tick нэмэх
	useEffect(() => {
		if (!serverDate) return;
		const interval = setInterval(() => setTickCount((prev) => prev + 1), 1000);
		return () => clearInterval(interval);
	}, [serverDate]);

	// Одоогийн серверийн цаг
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

/**
 * Форматласан серверийн цаг
 */
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
