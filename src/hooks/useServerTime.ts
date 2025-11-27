"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { getServerDate } from "@/lib/api";

export function useServerTime() {
	const { data: serverDateString, isLoading } = useQuery({
		queryKey: ["serverTime"],
		queryFn: getServerDate,
		staleTime: 0,
		refetchOnWindowFocus: true,
		refetchInterval: 60000,
		retry: 3,
		retryDelay: 1000,
	});

	const serverDate = useMemo(
		() => (serverDateString ? new Date(serverDateString) : null),
		[serverDateString],
	);

	const serverDateRef = useRef<number | null>(null);
	const [tickCount, setTickCount] = useState(0);

	useEffect(() => {
		if (serverDate) {
			const newServerTime = serverDate.getTime();
			if (serverDateRef.current !== newServerTime) {
				serverDateRef.current = newServerTime;
				setTickCount(0);
			}
		}
	}, [serverDate]);

	useEffect(() => {
		const interval = setInterval(() => {
			setTickCount((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const currentTime = useMemo(() => {
		if (!serverDateRef.current) {
			return null;
		}
		return new Date(serverDateRef.current + tickCount * 1000);
	}, [tickCount]);

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
		tickCount, // ✅ ШИНЭ: Export хийх
		isLoading: isLoading && !currentTime,
		serverDate,
		isOnline,
	};
}
