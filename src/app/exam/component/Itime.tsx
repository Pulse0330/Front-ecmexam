"use client";

import { AlertCircle, Clock, PlayCircle } from "lucide-react";
import { memo, useEffect, useMemo, useRef } from "react";
import { useServerTime } from "@/hooks/useServerTime";

interface ExamTimerProps {
	examStartTime: string;
	examEndTime: string;
	examMinutes: number;
	startedDate?: string;
	onTimeUp?: (isTimeUp: boolean) => void;
	onAutoFinish?: () => void;
	onTimeUpdate?: (display: string) => void;
}

const formatTime = (sec: number): string => {
	const h = Math.floor(sec / 3600);
	const m = Math.floor((sec % 3600) / 60);
	const s = sec % 60;
	return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * "2026-03-07 14:00" эсвэл "2026-03-07 11:0" гэх мэт
 * local-date string-ийг local time-аар parse хийнэ.
 *
 * new Date("2026-03-07 14:00") нь зарим browser-т UTC болгон
 * тайлбарлаж timezone offset нэмдэг — T нэмэн ISO 8601 болгоход
 * local time-аар тогтвортой parse хийгддэг.
 */
const parseLocalDate = (dateStr: string): Date => {
	// ISO 8601 / UTC format бол шууд parse
	if (dateStr.includes("T") || dateStr.endsWith("Z")) {
		return new Date(dateStr);
	}
	// "2026-03-07 14:00" → UTC гэж тайлбарлана (server цагтай нийцүүлсэн)
	const normalized = `${dateStr.replace(" ", "T")}Z`;
	return new Date(normalized);
};
const ExamTimer = memo(function ExamTimer({
	examEndTime,
	examMinutes,
	startedDate,
	onTimeUp,
	onAutoFinish,
	onTimeUpdate,
}: ExamTimerProps) {
	const { currentTime, isLoading, isOnline } = useServerTime();
	const hasNotifiedTimeUp = useRef(false);
	const hasAutoFinished = useRef(false);

	const onTimeUpRef = useRef(onTimeUp);
	const onAutoFinishRef = useRef(onAutoFinish);
	const onTimeUpdateRef = useRef(onTimeUpdate);

	useEffect(() => {
		onTimeUpRef.current = onTimeUp;
		onAutoFinishRef.current = onAutoFinish;
		onTimeUpdateRef.current = onTimeUpdate;
	}, [onTimeUp, onAutoFinish, onTimeUpdate]);

	// Parse dates ONCE — local time-аар тайлбарлана
	const { endDateTime, startDateTime } = useMemo(() => {
		return {
			endDateTime: parseLocalDate(examEndTime),
			startDateTime: startedDate ? parseLocalDate(startedDate) : null,
		};
	}, [examEndTime, startedDate]);

	const currentTimeMs = currentTime?.getTime() ?? null;

	const { status, remainingSec, percentage } = useMemo(() => {
		if (currentTimeMs === null) {
			return {
				status: "before" as const,
				remainingSec: examMinutes * 60,
				percentage: 100,
			};
		}

		const totalSec = examMinutes * 60;

		if (startDateTime) {
			const elapsedMs = currentTimeMs - startDateTime.getTime();
			const elapsedSec = Math.floor(elapsedMs / 1000);
			const remaining = Math.max(0, totalSec - elapsedSec);
			const stat: "before" | "ongoing" | "ended" =
				elapsedSec < 0 ? "before" : remaining > 0 ? "ongoing" : "ended";
			const pct = totalSec > 0 ? (remaining / totalSec) * 100 : 0;
			return {
				status: stat,
				remainingSec: remaining,
				percentage: Math.max(0, Math.min(100, pct)),
			};
		}

		// Fallback: endTime-аас тооцох
		const remainingMs = endDateTime.getTime() - currentTimeMs;
		const remaining = Math.max(0, Math.floor(remainingMs / 1000));
		const stat: "before" | "ongoing" | "ended" =
			remainingMs <= 0 ? "ended" : "ongoing";
		const pct = totalSec > 0 ? (remaining / totalSec) * 100 : 0;
		return {
			status: stat,
			remainingSec: remaining,
			percentage: Math.max(0, Math.min(100, pct)),
		};
	}, [currentTimeMs, endDateTime, examMinutes, startDateTime]);

	// Auto-finish logic
	useEffect(() => {
		if (status !== "ended") return;
		if (!hasNotifiedTimeUp.current) {
			hasNotifiedTimeUp.current = true;
			onTimeUpRef.current?.(true);
		}
		if (!hasAutoFinished.current && onAutoFinishRef.current) {
			hasAutoFinished.current = true;
			onAutoFinishRef.current();
		}
	}, [status]);

	const formattedTime = formatTime(remainingSec);

	// onTimeUpdate-г тус тусдаа useEffect-д дуудна —
	// auto-finish logic-тай холилдохгүй, render бүрт шинэчлэгдэнэ
	useEffect(() => {
		onTimeUpdateRef.current?.(formattedTime);
	}, [formattedTime]);

	const { isWarning, isDanger } = useMemo(() => {
		return {
			isWarning: percentage <= 20 && percentage > 10,
			isDanger: percentage <= 10,
		};
	}, [percentage]);

	// ended болон isDanger config нэгтгэсэн — давтагдал арилсан
	const config = useMemo(() => {
		if (status === "ended" || isDanger) {
			return {
				border: "border-red-300 dark:border-red-700",
				bg: "bg-white dark:bg-slate-900",
				icon: AlertCircle,
				iconColor: "text-red-600 dark:text-red-400",
				timerColor: "text-red-600 dark:text-red-400",
			};
		}
		if (isWarning) {
			return {
				border: "border-yellow-300 dark:border-yellow-700",
				bg: "bg-white dark:bg-slate-900",
				icon: Clock,
				iconColor: "text-yellow-600 dark:text-yellow-400",
				timerColor: "text-yellow-600 dark:text-yellow-400",
			};
		}
		return {
			border: "border-green-200 dark:border-green-700",
			bg: "bg-white dark:bg-slate-900",
			icon: PlayCircle,
			iconColor: "text-green-600 dark:text-green-400",
			timerColor: "text-green-600 dark:text-green-400",
		};
	}, [status, isDanger, isWarning]);

	if (isLoading || currentTimeMs === null) {
		return (
			<div className="w-full max-w-2xl mx-auto">
				<div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 md:p-8">
					<div className="flex items-center justify-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-400">
						<Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-spin" />
						<span className="text-sm sm:text-base md:text-lg">
							Ачааллаж байна...
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-2xl mx-auto">
			<div
				className={`rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border-2 ${config.border} ${config.bg} w-full overflow-hidden transition-all duration-300 relative`}
			>
				{/* Offline Badge */}
				{!isOnline && (
					<div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 z-10">
						<div className="bg-amber-500 text-white text-[9px] sm:text-[10px] md:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold flex items-center gap-1 shadow-md">
							<div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse" />
							<span className="hidden xs:inline">Offline</span>
							<span className="xs:hidden">OFF</span>
						</div>
					</div>
				)}

				<div className="p-4">
					{/* Timer Display */}
					<div className="text-center">
						<div
							className={`font-mono font-black ${config.timerColor} tracking-tight`}
						>
							{formattedTime}
						</div>
					</div>

					{/* Danger Warning */}
					{status === "ongoing" && isDanger && (
						<div className="mt-4 sm:mt-6 md:mt-8 bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 animate-pulse shadow-lg">
							<p className="text-center font-black text-red-700 dark:text-red-300 text-sm sm:text-base md:text-lg lg:text-xl">
								⚠️ Цаг дуусч байна! Шалгалтаа дүүргээрэй!
							</p>
						</div>
					)}

					{/* Time's Up Message */}
					{status === "ended" && (
						<div className="mt-4 sm:mt-6 md:mt-8 bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 shadow-lg">
							<p className="text-center font-black text-red-700 dark:text-red-300 text-sm sm:text-base md:text-lg lg:text-xl">
								🛑 Шалгалтын цаг дууслаа. Автоматаар дуусгаж байна...
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

export default ExamTimer;
