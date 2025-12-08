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
}

// ✅ Memoize component to prevent unnecessary re-renders
const ExamTimer = memo(function ExamTimer({
	examEndTime,
	examMinutes,
	startedDate,
	onTimeUp,
	onAutoFinish,
}: ExamTimerProps) {
	const { currentTime, isLoading, isOnline } = useServerTime();
	const hasNotifiedTimeUp = useRef(false);
	const hasAutoFinished = useRef(false);

	const onTimeUpRef = useRef(onTimeUp);
	const onAutoFinishRef = useRef(onAutoFinish);

	// ✅ Update refs without triggering re-renders
	useEffect(() => {
		onTimeUpRef.current = onTimeUp;
		onAutoFinishRef.current = onAutoFinish;
	}, [onTimeUp, onAutoFinish]);

	// ✅ Cache parsed dates to avoid repeated parsing
	const { endDateTime, startDateTime } = useMemo(() => {
		return {
			endDateTime: new Date(examEndTime),
			startDateTime: startedDate ? new Date(startedDate) : null,
		};
	}, [examEndTime, startedDate]);

	const currentTimeMs = currentTime?.getTime() ?? null;

	// ✅ Optimized calculation with early returns
	const { status, remainingSec, percentage } = useMemo(() => {
		// Early return if no current time
		if (currentTimeMs === null) {
			return {
				status: "before" as const,
				remainingSec: examMinutes * 60,
				percentage: 100,
			};
		}

		const totalSec = examMinutes * 60;

		// Early return if not started
		if (!startDateTime) {
			return {
				status: "before" as const,
				remainingSec: totalSec,
				percentage: 100,
			};
		}

		// Calculate remaining time
		const remainingMs = endDateTime.getTime() - currentTimeMs;
		const remaining = Math.max(0, Math.floor(remainingMs / 1000));

		// Determine status
		let stat: "before" | "ongoing" | "ended";
		if (currentTimeMs < startDateTime.getTime()) {
			stat = "before";
		} else if (remainingMs <= 0) {
			stat = "ended";
		} else {
			stat = "ongoing";
		}

		// Calculate percentage
		const pct = totalSec > 0 ? (remaining / totalSec) * 100 : 0;

		return {
			status: stat,
			remainingSec: remaining,
			percentage: Math.max(0, Math.min(100, pct)),
		};
	}, [currentTimeMs, endDateTime, examMinutes, startDateTime]);

	// ✅ Auto-finish logic - only runs when status changes to "ended"
	useEffect(() => {
		if (status !== "ended") return;

		console.log("🔴 Status = ended, auto-finish эхэллээ");

		// Step 1: onTimeUp notification
		if (!hasNotifiedTimeUp.current) {
			hasNotifiedTimeUp.current = true;
			console.log("⏰ Цаг дууслаа - onTimeUp дуудаж байна");
			onTimeUpRef.current?.(true);
		}

		// Step 2: Auto-finish
		if (!hasAutoFinished.current && onAutoFinishRef.current) {
			hasAutoFinished.current = true;
			console.log("⏰ Auto-finish ШУУД дуудагдаж байна");
			onAutoFinishRef.current();
		}
	}, [status]);

	// ✅ Memoize format function
	const formatTime = useMemo(() => {
		return (sec: number) => {
			const h = Math.floor(sec / 3600);
			const m = Math.floor((sec % 3600) / 60);
			const s = sec % 60;
			return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
		};
	}, []);

	// ✅ Memoize time remaining text
	const timeRemainingText = useMemo(() => {
		const totalMinutes = Math.floor(remainingSec / 60);
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return hours > 0 ? `${hours} цаг ${minutes} минут` : `${minutes} минут`;
	}, [remainingSec]);

	// ✅ Memoize warning states
	const { isWarning, isDanger } = useMemo(() => {
		return {
			isWarning: percentage <= 20 && percentage > 10,
			isDanger: percentage <= 10,
		};
	}, [percentage]);

	// ✅ Memoize status config
	const config = useMemo(() => {
		if (status === "ended") {
			return {
				border: "border-red-300",
				icon: AlertCircle,
				iconColor: "text-red-600",
				timerColor: "text-red-600",
			};
		}
		if (isDanger) {
			return {
				border: "border-red-300",
				icon: AlertCircle,
				iconColor: "text-red-600",
				timerColor: "text-red-600",
			};
		}
		if (isWarning) {
			return {
				border: "border-yellow-300",
				icon: Clock,
				iconColor: "text-yellow-600",
				timerColor: "text-yellow-600",
			};
		}
		return {
			border: "border-green-200",
			icon: PlayCircle,
			iconColor: "text-green-600",
			timerColor: "text-green-600",
		};
	}, [status, isDanger, isWarning]);

	// ✅ Memoize formatted time string
	const formattedTime = useMemo(() => {
		return formatTime(remainingSec);
	}, [remainingSec, formatTime]);

	// Loading state
	if (isLoading || currentTimeMs === null) {
		return (
			<div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
				<div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
					<Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
					<span className="text-xs sm:text-sm">Ачааллаж байна...</span>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`rounded-lg sm:rounded-xl shadow-sm border-2 ${config.border} w-full overflow-hidden transition-all duration-300 relative`}
		>
			{!isOnline && (
				<div className="absolute top-1 right-1 z-10">
					<div className="bg-amber-500 text-white text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
						<div className="w-1 h-1 bg-white rounded-full animate-pulse" />
						Offline
					</div>
				</div>
			)}

			<div className="p-3 sm:p-4">
				<div className="mb-3 sm:mb-4 text-center">
					<div
						className={`font-mono font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl ${config.timerColor} tracking-tight mb-1 sm:mb-2`}
					>
						{formattedTime}
					</div>
					{status === "ongoing" && (
						<p className="text-sm sm:text-base md:text-lg font-bold text-slate-700 dark:text-slate-300">
							<span className={config.timerColor}>{timeRemainingText}</span>{" "}
							үлдсэн
						</p>
					)}
				</div>

				{status === "ongoing" && isDanger && (
					<div className="mt-3 sm:mt-4 bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700 rounded-lg p-3 sm:p-4 animate-pulse shadow-lg">
						<p className="text-center font-black text-red-700 dark:text-red-300">
							⚠️ Цаг дуусч байна! Шалгалтаа дүүргээрэй!
						</p>
					</div>
				)}

				{status === "ended" && (
					<div className="mt-3 sm:mt-4 bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700 rounded-lg p-3 sm:p-4 shadow-lg">
						<p className="text-center font-black text-red-700 dark:text-red-300">
							🛑 Шалгалтын цаг дууслаа. Автоматаар дуусгаж байна...
						</p>
					</div>
				)}
			</div>
		</div>
	);
});

export default ExamTimer;
