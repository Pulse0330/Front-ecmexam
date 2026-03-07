"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getServerDate } from "@/lib/api";

export function useServerTime() {
	const { data: serverDateString, isLoading } = useQuery<string>({
		queryKey: ["serverTime"],
		queryFn: getServerDate,
		staleTime: 0,
		refetchOnWindowFocus: true,
		refetchInterval: 60000,
		retry: 3,
		retryDelay: 1000,
	});

	const syncedAtRef = useRef<{ serverMs: number; localMs: number } | null>(
		null,
	);
	const [currentTime, setCurrentTime] = useState<Date | null>(null);

	useEffect(() => {
		if (!serverDateString) return;

		// Timezone offset огт ашиглахгүй — ISO string шууд UTC-аар parse
		const parsed = new Date(serverDateString);
		if (Number.isNaN(parsed.getTime())) {
			console.error("Invalid server date:", serverDateString);
			return;
		}

		syncedAtRef.current = {
			serverMs: parsed.getTime(),
			localMs: Date.now(),
		};

		const update = () => {
			if (!syncedAtRef.current) return;
			const elapsed = Date.now() - syncedAtRef.current.localMs;
			setCurrentTime(new Date(syncedAtRef.current.serverMs + elapsed));
		};

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [serverDateString]);

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
		isLoading: isLoading && !currentTime,
		isOnline,
	};
}
