// hooks/useServerTime.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getServerDate } from "@/lib/api";

// --- Server time hook ---
export function useServerTime() {
	const { data: serverDateString, isLoading } = useQuery({
		queryKey: ["serverTime"],
		queryFn: getServerDate,
		staleTime: 5 * 60 * 1000, // 5 минут cache
	});

	const serverDate = useMemo(
		() => (serverDateString ? new Date(serverDateString) : null),
		[serverDateString],
	);

	const [tickCount, setTickCount] = useState(0);

	// Серверийн цаг ба tick тоолуур
	const serverTimestamp = serverDate?.getTime() ?? null;

	useEffect(() => {
		if (!serverTimestamp) return;

		// Tick-г reset хийх (ESLint rule зөрчиж байна гэдгийг мэднэ)
		// Гэхдээ энэ тохиолдолд cascading render үүсгэхгүй, учир нь зөвхөн
		// серверийн цаг ӨӨРЧЛӨГДӨХӨД л дуудагдана
		// eslint-disable-next-line react-hooks/exhaustive-deps
		setTickCount(0);

		// 1 секунд тутам tick нэмэгдүүлэх
		const interval = setInterval(() => {
			setTickCount((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [serverTimestamp]);

	// Одоогийн серверийн цаг тооцоолох
	// serverTimestamp өөрчлөгдөхөд tickCount автоматаар 0 болно (effect дахин ажиллахад)
	const currentTime = useMemo(() => {
		if (!serverDate) return null;
		return new Date(serverDate.getTime() + tickCount * 1000);
	}, [serverDate, tickCount]);

	return { currentTime, isLoading, serverDate };
}

// --- Formatted server time hook ---
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
