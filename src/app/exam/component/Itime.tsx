"use client";

import { AlertCircle, Clock, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useServerTime } from "@/hooks/useServerTime";

interface ExamTimerProps {
	examStartTime: string;
	examEndTime: string;
	examMinutes: number;
	startedDate?: string;
	onTimeUp?: (isTimeUp: boolean) => void;
	onAutoFinish?: () => void;
}

export default function ExamTimer({
	examStartTime,
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

	// ✅ Props update хийх
	useEffect(() => {
		onTimeUpRef.current = onTimeUp;
		onAutoFinishRef.current = onAutoFinish;
	}, [onTimeUp, onAutoFinish]);

	const currentTimeMs = currentTime?.getTime() ?? null;

	// ✅ ЭХЛЭЭД status тооцоолох
	const { status, remainingSec, percentage } = useMemo(() => {
		if (currentTimeMs === null) {
			return {
				status: "before" as const,
				remainingSec: examMinutes * 60,
				percentage: 100,
				elapsedSec: 0,
				endDateTime: null,
			};
		}

		const startDate = new Date(`${examStartTime.replace(" ", "T")}Z`);
		const totalSec = examMinutes * 60;

		let stat: "before" | "ongoing" | "ended";
		let remaining: number;
		let elapsed: number;
		let calculatedEndTime: Date | null = null;

		if (!startedDate) {
			stat = "before";
			remaining = totalSec;
			elapsed = 0;
			calculatedEndTime = new Date(startDate.getTime() + totalSec * 1000);
		} else {
			const actualStartDate = new Date(startedDate);
			calculatedEndTime = new Date(actualStartDate.getTime() + totalSec * 1000);
			elapsed = Math.floor((currentTimeMs - actualStartDate.getTime()) / 1000);
			remaining = Math.max(0, totalSec - elapsed);

			if (currentTimeMs >= calculatedEndTime.getTime()) {
				stat = "ended";
				remaining = 0;
				elapsed = totalSec;
			} else {
				stat = "ongoing";
			}
		}

		const pct = totalSec > 0 ? (remaining / totalSec) * 100 : 0;

		return {
			status: stat,
			remainingSec: Math.max(0, remaining),
			percentage: Math.max(0, Math.min(100, pct)),
			elapsedSec: Math.max(0, elapsed),
			endDateTime: calculatedEndTime,
		};
	}, [currentTimeMs, examStartTime, examMinutes, startedDate]);

	// ✅ ДАРАА НЬ status ашиглан auto-finish хийх
	useEffect(() => {
		if (status === "ended") {
			console.log("🔴 Status = ended, auto-finish эхэллээ");

			// Step 1: onTimeUp notification
			if (!hasNotifiedTimeUp.current) {
				hasNotifiedTimeUp.current = true;
				console.log("⏰ Цаг дууслаа - onTimeUp дуудаж байна");
				if (onTimeUpRef.current) {
					onTimeUpRef.current(true);
				}
			}

			// Step 2: Auto-finish ШУУД дуудах (delay байхгүй)
			if (!hasAutoFinished.current && onAutoFinishRef.current) {
				hasAutoFinished.current = true;
				console.log("⏰ Auto-finish ШУУД дуудагдаж байна");
				onAutoFinishRef.current();
			}
		}
	}, [status]); // ✅ status dependency

	const formatTime = (sec: number) => {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = sec % 60;
		return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	const getTimeRemaining = () => {
		const totalMinutes = Math.floor(remainingSec / 60);
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return hours > 0 ? `${hours} цаг ${minutes} минут` : `${minutes} минут`;
	};

	const isWarning = percentage <= 20 && percentage > 10;
	const isDanger = percentage <= 10;

	const getStatusConfig = () => {
		if (status === "ended")
			return {
				border: "border-red-300",
				icon: AlertCircle,
				iconColor: "text-red-600",
				timerColor: "text-red-600",
			};
		if (isDanger)
			return {
				border: "border-red-300",
				icon: AlertCircle,
				iconColor: "text-red-600",
				timerColor: "text-red-600",
			};
		if (isWarning)
			return {
				border: "border-yellow-300",
				icon: Clock,
				iconColor: "text-yellow-600",
				timerColor: "text-yellow-600",
			};
		return {
			border: "border-green-200",
			icon: PlayCircle,
			iconColor: "text-green-600",
			timerColor: "text-green-600",
		};
	};

	const config = getStatusConfig();

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
						className={`font-mono font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl ${config.timerColor} tracking-tight mb-1 sm:mb-2`}
					>
						{formatTime(remainingSec)}
					</div>
					{status === "ongoing" && (
						<p className="text-sm sm:text-base md:text-lg font-bold text-slate-700 dark:text-slate-300">
							<span className={config.timerColor}>{getTimeRemaining()}</span>{" "}
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
}
