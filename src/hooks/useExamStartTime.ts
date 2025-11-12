"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getServerDate } from "@/lib/api";

/**
 * Серверийн яг тухайн цагийг авч, түүнээс хойших хугацааг real-time харуулна.
 * localStorage ашиглахгүй, зөвхөн серверийн цаг дээр тулгуурлана.
 */
export function useExamStartTime(examId: number | string) {
	const {
		data: serverDateString,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["examStartTime", examId],
		queryFn: getServerDate,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: false,
		staleTime: Infinity, // нэг удаа авна
	});

	const [tick, setTick] = useState(0);

	// Тухайн хуудас руу орсон серверийн timestamp
	const startTime = useMemo(() => {
		if (!serverDateString) return null;
		return new Date(serverDateString);
	}, [serverDateString]);

	// 1 секунд тутам elapsed хугацааг шинэчилнэ
	useEffect(() => {
		if (!startTime) return;

		const interval = setInterval(() => {
			setTick((t) => t + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [startTime]);

	// elapsed time (секундээр)
	const elapsedMs = startTime ? tick * 1000 : 0;

	// current серверийн цаг = start + elapsed
	const currentTime = useMemo(() => {
		if (!startTime) return null;
		return new Date(startTime.getTime() + elapsedMs);
	}, [startTime, elapsedMs]);

	return {
		startTime,
		currentTime,
		elapsedSeconds: tick,
		isLoading,
		isError,
	};
}
