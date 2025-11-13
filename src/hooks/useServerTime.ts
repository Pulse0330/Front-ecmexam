"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { getServerDate } from "@/lib/api";

/**
 * Серверийн цагийг авдаг, секунд тутам шинэчилдэг hook
 * Internet салсан ч client дээр цаг үргэлжлүүлнэ
 * Дахин холбогдоход серверийн цагтай sync хийнэ
 */
export function useServerTime() {
	const { data: serverDateString, isLoading } = useQuery({
		queryKey: ["serverTime"],
		queryFn: getServerDate,
		staleTime: 0,
		refetchOnWindowFocus: true, // Tab буцаж ироход шинэчлэх
		refetchInterval: 60000, // 1 минут тутам серверээс шалгах
		retry: 3,
		retryDelay: 1000,
	});

	// Серверийн string-г Date болгож хөрвүүлэх
	const serverDate = useMemo(
		() => (serverDateString ? new Date(serverDateString) : null),
		[serverDateString],
	);

	const serverDateRef = useRef<number | null>(null);
	const [tickCount, setTickCount] = useState(0);

	// Серверийн цаг ирэхэд sync хийх
	useEffect(() => {
		if (serverDate) {
			const newServerTime = serverDate.getTime();

			// Анхны эсвэл шинэ серверийн цаг ирсэн
			if (serverDateRef.current !== newServerTime) {
				serverDateRef.current = newServerTime;
				setTickCount(0);
			}
		}
	}, [serverDate]);

	// Секунд тутам tick нэмэх
	useEffect(() => {
		const interval = setInterval(() => {
			setTickCount((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Одоогийн серверийн цаг (internet салсан ч үргэлжилнэ)
	const currentTime = useMemo(() => {
		if (!serverDateRef.current) {
			return null;
		}

		// tickCount ашиглан тооцоолох (секунд тутам шинэчлэгдэх)
		return new Date(serverDateRef.current + tickCount * 1000);
	}, [tickCount]);

	// Online/offline status
	const [isOnline, setIsOnline] = useState(true);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return {
		currentTime,
		isLoading: isLoading && !currentTime, // Анхны ачааллалт
		serverDate,
		isOnline,
	};
}

/**
 * Форматласан серверийн цаг
 */
export function useFormattedServerTime() {
	const { currentTime, isLoading, isOnline } = useServerTime();

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

		const year = currentTime.getFullYear();
		const month = String(currentTime.getMonth() + 1).padStart(2, "0");
		const day = String(currentTime.getDate()).padStart(2, "0");
		const hours = String(currentTime.getHours()).padStart(2, "0");
		const minutes = String(currentTime.getMinutes()).padStart(2, "0");
		const seconds = String(currentTime.getSeconds()).padStart(2, "0");

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
		isOnline,
	};
}
