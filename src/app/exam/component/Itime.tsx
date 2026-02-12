"use client";

import { AlertCircle, Clock, PlayCircle } from "lucide-react";
import { memo, useEffect, useMemo, useRef } from "react";
import { useServerTime } from "@/hooks/useServerTime";

interface ExamTimerProps {
	examStartTime: string;
	examEndTime: string;
	examMinutes: number;
	startedDate?: string; // ✅ ШАЛГАЛТ ЭХЭЛСЭН БОДИТ ЦАГ (API-аас ирнэ)
	onTimeUp?: (isTimeUp: boolean) => void;
	onAutoFinish?: () => void;
}

const ExamTimer = memo(function ExamTimer({
	examEndTime,
	examMinutes,
	startedDate, // ✅ Энэ нь хэрэглэгч анх шалгалт эхлүүлсэн цаг
	onTimeUp,
	onAutoFinish,
}: ExamTimerProps) {
	const { currentTime, isLoading, isOnline } = useServerTime();
	const hasNotifiedTimeUp = useRef(false);
	const hasAutoFinished = useRef(false);

	const onTimeUpRef = useRef(onTimeUp);
	const onAutoFinishRef = useRef(onAutoFinish);

	useEffect(() => {
		onTimeUpRef.current = onTimeUp;
		onAutoFinishRef.current = onAutoFinish;
	}, [onTimeUp, onAutoFinish]);

	// ✅ Parse dates ONCE
	const { endDateTime, startDateTime } = useMemo(() => {
		return {
			endDateTime: new Date(examEndTime),
			startDateTime: startedDate ? new Date(startedDate) : null,
		};
	}, [examEndTime, startedDate]);

	const currentTimeMs = currentTime?.getTime() ?? null;

	// ✅ ГООЛ ТООЦОО: Хэрэв startedDate байгаа бол тэр цагаас тооцох
	const { status, remainingSec, percentage } = useMemo(() => {
		if (currentTimeMs === null) {
			return {
				status: "before" as const,
				remainingSec: examMinutes * 60,
				percentage: 100,
			};
		}

		const totalSec = examMinutes * 60;

		// ✅ ГООЛ: Хэрэв startDateTime байгаа бол тэр цагаас тооцоолох
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

		// ✅ FALLBACK: Хэрэв startDateTime байхгүй бол endTime-аас тооцох (хуучин логик)
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

	// ✅ Auto-finish logic
	useEffect(() => {
		if (status !== "ended") return;

		console.log("🔴 Status = ended, auto-finish эхэллээ");

		if (!hasNotifiedTimeUp.current) {
			hasNotifiedTimeUp.current = true;
			console.log("⏰ Цаг дууслаа - onTimeUp дуудаж байна");
			onTimeUpRef.current?.(true);
		}

		if (!hasAutoFinished.current && onAutoFinishRef.current) {
			hasAutoFinished.current = true;
			console.log("⏰ Auto-finish ШУУД дуудагдаж байна");
			onAutoFinishRef.current();
		}
	}, [status]);

	// ✅ Format time
	const formatTime = useMemo(() => {
		return (sec: number) => {
			const h = Math.floor(sec / 3600);
			const m = Math.floor((sec % 3600) / 60);
			const s = sec % 60;
			return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
		};
	}, []);

	const _timeRemainingText = useMemo(() => {
		const totalMinutes = Math.floor(remainingSec / 60);
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return hours > 0 ? `${hours} цаг ${minutes} минут` : `${minutes} минут`;
	}, [remainingSec]);

	const { isWarning, isDanger } = useMemo(() => {
		return {
			isWarning: percentage <= 20 && percentage > 10,
			isDanger: percentage <= 10,
		};
	}, [percentage]);

	const config = useMemo(() => {
		if (status === "ended") {
			return {
				border: "border-red-300 dark:border-red-700",
				bg: "bg-white dark:bg-slate-900",
				icon: AlertCircle,
				iconColor: "text-red-600 dark:text-red-400",
				timerColor: "text-red-600 dark:text-red-400",
			};
		}
		if (isDanger) {
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

	const formattedTime = useMemo(() => {
		return formatTime(remainingSec);
	}, [remainingSec, formatTime]);

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
				{/* Offline Badge - Responsive */}
				{!isOnline && (
					<div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 z-10">
						<div className="bg-amber-500 text-white text-[9px] sm:text-[10px] md:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold flex items-center gap-1 shadow-md">
							<div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse" />
							<span className="hidden xs:inline">Offline</span>
							<span className="xs:hidden">OFF</span>
						</div>
					</div>
				)}

				{/* Main Content - Responsive Padding */}
				<div className="p-4 ">
					{/* Timer Display - Responsive Sizes */}
					<div className="text-center">
						<div
							className={`font-mono font-black  
						
							${config.timerColor} 
							tracking-tight 
							
							`}
						>
							{formattedTime}
						</div>
					</div>

					{/* Danger Warning - Responsive */}
					{status === "ongoing" && isDanger && (
						<div className="mt-4 sm:mt-6 md:mt-8 bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 animate-pulse shadow-lg">
							<p className="text-center font-black text-red-700 dark:text-red-300 text-sm sm:text-base md:text-lg lg:text-xl">
								⚠️ Цаг дуусч байна! Шалгалтаа дүүргээрэй!
							</p>
						</div>
					)}

					{/* Time's Up Message - Responsive */}
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
