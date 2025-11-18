"use client";

import { AlertCircle, CalendarClock, Clock, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useServerTime } from "@/hooks/useServerTime";

interface ExamTimerProps {
	examStartTime: string;
	examEndTime: string;
	examMinutes: number;
	startedDate?: string;
	onTimeUp?: (isTimeUp: boolean) => void;
	// Шинэ props
	autoFinishOnTimeUp?: boolean; // Автоматаар дуусгах эсэх
	onAutoFinish?: () => Promise<void>; // Дуусгах функц
}

export default function ExamTimer({
	examStartTime,
	examEndTime,
	examMinutes,
	startedDate,
	onTimeUp,
	autoFinishOnTimeUp = false,
	onAutoFinish,
}: ExamTimerProps) {
	const { currentTime, isLoading, isOnline } = useServerTime();
	const hasNotifiedTimeUp = useRef(false);
	const hasAutoFinished = useRef(false);

	const { status, remainingSec, percentage, elapsedSec, endDateTime } =
		useMemo(() => {
			if (!currentTime) {
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
				calculatedEndTime = new Date(
					actualStartDate.getTime() + totalSec * 1000,
				);

				elapsed = Math.floor(
					(currentTime.getTime() - actualStartDate.getTime()) / 1000,
				);
				remaining = Math.max(0, totalSec - elapsed);

				if (currentTime >= calculatedEndTime) {
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
		}, [currentTime, examStartTime, examMinutes, startedDate]);

	// Цаг дуусахад автоматаар шалгалт дуусгах
	useEffect(() => {
		if (status === "ended" && !hasAutoFinished.current) {
			hasAutoFinished.current = true;

			// onTimeUp callback дуудах
			if (onTimeUp && !hasNotifiedTimeUp.current) {
				hasNotifiedTimeUp.current = true;
				onTimeUp(true);
			}

			// Автоматаар дуусгах
			if (autoFinishOnTimeUp && onAutoFinish) {
				onAutoFinish();
			}
		}
	}, [status, onTimeUp, autoFinishOnTimeUp, onAutoFinish]);

	const formatTime = (sec: number) => {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = sec % 60;
		return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	const formatDateTime = (dateStr: string | Date) => {
		const date =
			typeof dateStr === "string"
				? new Date(
						dateStr.includes("Z") ? dateStr : `${dateStr.replace(" ", "T")}Z`,
					)
				: dateStr;
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		const hours = date.getHours().toString().padStart(2, "0");
		const mins = date.getMinutes().toString().padStart(2, "0");
		return `${month}.${day} ${hours}:${mins}`;
	};

	const getTimeRemaining = () => {
		const totalMinutes = Math.floor(remainingSec / 60);
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;

		if (hours > 0) {
			return `${hours} цаг ${minutes} минут`;
		}
		return `${minutes} минут`;
	};

	const isWarning = percentage <= 20 && percentage > 10;
	const isDanger = percentage <= 10;

	const getStatusConfig = () => {
		if (status === "ended") {
			return {
				bg: "bg-gradient-to-br from-red-50 via-pink-50 to-red-50 dark:from-red-950/30 dark:via-pink-950/30 dark:to-red-950/30",
				border: "border-red-300 dark:border-red-700",
				icon: AlertCircle,
				iconColor: "text-red-600 dark:text-red-400",
				iconBg: "bg-red-100 dark:bg-red-900/40",
				timerColor: "text-red-600 dark:text-red-400",
				badge:
					"bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700",
				badgeText: "🛑 Дууссан",
				progressColor: "from-red-600 to-red-500",
				pulse: false,
			};
		}
		if (status === "before") {
			return {
				bg: "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30",
				border: "border-blue-200 dark:border-blue-800",
				icon: Clock,
				iconColor: "text-blue-600 dark:text-blue-400",
				iconBg: "bg-blue-100 dark:bg-blue-900/40",
				timerColor: "text-blue-600 dark:text-blue-400",
				badge:
					"bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700",
				badgeText: "⏳ Эхлээгүй",
				progressColor: "from-blue-600 to-indigo-600",
				pulse: true,
			};
		}
		if (isDanger) {
			return {
				bg: "bg-gradient-to-br from-red-50 via-orange-50 to-red-50 dark:from-red-950/30 dark:via-orange-950/30 dark:to-red-950/30",
				border: "border-red-300 dark:border-red-700",
				icon: AlertCircle,
				iconColor: "text-red-600 dark:text-red-400",
				iconBg: "bg-red-100 dark:bg-red-900/40",
				timerColor: "text-red-600 dark:text-red-400",
				badge:
					"bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse",
				badgeText: "⚠️ Анхаар!",
				progressColor: "from-red-600 to-red-500",
				pulse: true,
			};
		}
		if (isWarning) {
			return {
				bg: "bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-yellow-950/30",
				border: "border-yellow-300 dark:border-yellow-700",
				icon: Clock,
				iconColor: "text-yellow-600 dark:text-yellow-400",
				iconBg: "bg-yellow-100 dark:bg-yellow-900/40",
				timerColor: "text-yellow-600 dark:text-yellow-400",
				badge:
					"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
				badgeText: "⏰ Болгоомжтой",
				progressColor: "from-yellow-500 to-orange-500",
				pulse: false,
			};
		}
		return {
			bg: "bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-green-950/30",
			border: "border-green-200 dark:border-green-800",
			icon: PlayCircle,
			iconColor: "text-green-600 dark:text-green-400",
			iconBg: "bg-green-100 dark:bg-green-900/40",
			timerColor: "text-green-600 dark:text-green-400",
			badge:
				"bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-700",
			badgeText: "▶️ Явагдаж байна",
			progressColor: "from-green-600 to-emerald-600",
			pulse: false,
		};
	};

	const config = getStatusConfig();
	const Icon = config.icon;

	if (isLoading || !currentTime) {
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
			className={`rounded-lg sm:rounded-xl shadow-sm border-2 ${config.border} ${config.bg} w-full overflow-hidden transition-all duration-300 relative`}
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
				{/* Header with Timer */}
				<div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
					<div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
						<div
							className={`rounded-md sm:rounded-lg p-1 sm:p-1.5 flex-shrink-0 ${config.iconBg} ${config.pulse ? "animate-pulse" : ""}`}
						>
							<Icon
								className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${config.iconColor}`}
							/>
						</div>
						<div
							className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs md:text-sm font-bold border whitespace-nowrap ${config.badge}`}
						>
							{config.badgeText}
						</div>
					</div>
				</div>

				{/* Large Timer Display */}
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

				{/* Progress Bar */}
				<div className="mb-3 sm:mb-4">
					<div className="h-2.5 sm:h-3 md:h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
						<div
							className={`h-full bg-gradient-to-r ${config.progressColor} transition-all duration-500 ease-out`}
							style={{ width: `${percentage}%` }}
						/>
					</div>
					<div className="flex justify-between items-center mt-1.5 sm:mt-2">
						<span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
							{formatTime(elapsedSec)}
						</span>
						<span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded">
							{Math.round(percentage)}%
						</span>
						<span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
							{formatTime(examMinutes * 60)}
						</span>
					</div>
				</div>

				{/* Time Info */}
				<div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-slate-700">
					<div className="flex items-start gap-1.5 sm:gap-2 min-w-0">
						<CalendarClock className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
						<div className="min-w-0 flex-1">
							<p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight mb-1">
								{startedDate ? "Эхэлсэн" : "Эхлэх"}
							</p>
							<p className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white truncate leading-tight">
								{formatDateTime(startedDate || examStartTime)}
							</p>
						</div>
					</div>

					<div className="flex items-start gap-1.5 sm:gap-2 min-w-0">
						<CalendarClock className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
						<div className="min-w-0 flex-1">
							<p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight mb-1">
								Дуусах
							</p>
							<p className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white truncate leading-tight">
								{endDateTime
									? formatDateTime(endDateTime)
									: formatDateTime(examEndTime)}
							</p>
						</div>
					</div>
				</div>

				{/* Warning Messages */}
				{status === "ongoing" && isDanger && (
					<div className="mt-3 sm:mt-4 bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700 rounded-lg p-3 sm:p-4 animate-pulse shadow-lg">
						<p className="text-sm sm:text-base md:text-lg font-black text-red-700 dark:text-red-300 text-center leading-tight">
							⚠️ Цаг дуусч байна! Шалгалтаа дүүргээрэй!
						</p>
					</div>
				)}

				{status === "ended" && (
					<div className="mt-3 sm:mt-4 bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700 rounded-lg p-3 sm:p-4 shadow-lg">
						<p className="text-base sm:text-lg md:text-xl font-black text-red-700 dark:text-red-300 text-center leading-tight mb-1">
							🛑 Шалгалтын цаг дууслаа
						</p>
						{autoFinishOnTimeUp && (
							<p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center font-semibold">
								Автоматаар дуусгаж байна...
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
