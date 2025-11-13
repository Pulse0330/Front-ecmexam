"use client";

import { AlertCircle, CalendarClock, Clock, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ExamTimerProps {
	examStartTime: string; // "2025-11-13 03:10" (UTC)
	examEndTime: string; // "2025-11-13T04:10:00.000Z" (ISO UTC)
	examMinutes: number; // 60
	serverDate?: string; // "2025-11-13T15:56:31.823Z" (ISO UTC)
}

export default function ExamTimer({
	examStartTime,
	examEndTime,
	examMinutes,
	serverDate,
}: ExamTimerProps) {
	const [currentTime, setCurrentTime] = useState<Date | null>(null);

	// Серверийн цаг болон локал цагийн offset тооцоолох
	const timeOffset = useMemo(() => {
		if (serverDate) {
			const serverTime = new Date(serverDate);
			const localTime = new Date();
			console.log("⏰ Server sync:", {
				serverDate,
				serverTime: serverTime.toISOString(),
				localTime: localTime.toISOString(),
				offset: serverTime.getTime() - localTime.getTime(),
			});
			return serverTime.getTime() - localTime.getTime();
		}
		console.warn("⚠️ No serverDate provided, using local time");
		return 0;
	}, [serverDate]);

	// Цаг шинэчлэх
	useEffect(() => {
		const updateTime = () => {
			const now = new Date(Date.now() + timeOffset);
			setCurrentTime(now);
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, [timeOffset]);

	// Статус, үлдсэн цаг тооцоолох
	const { status, remainingSec, percentage } = useMemo(() => {
		if (!currentTime) {
			return {
				status: "before" as const,
				remainingSec: examMinutes * 60,
				percentage: 100,
			};
		}

		// UTC цагуудыг зөв parse хийх
		const startDate = new Date(`${examStartTime.replace(" ", "T")}Z`);
		const endDate = new Date(examEndTime);
		const totalSec = examMinutes * 60;

		let stat: "before" | "ongoing" | "ended";
		let remaining: number;

		if (currentTime < startDate) {
			stat = "before";
			remaining = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
		} else if (currentTime >= endDate) {
			stat = "ended";
			remaining = 0;
		} else {
			stat = "ongoing";
			remaining = Math.floor(
				(endDate.getTime() - currentTime.getTime()) / 1000,
			);
		}

		const pct = totalSec > 0 ? (remaining / totalSec) * 100 : 0;

		return {
			status: stat,
			remainingSec: Math.max(0, remaining),
			percentage: Math.max(0, Math.min(100, pct)),
		};
	}, [currentTime, examStartTime, examEndTime, examMinutes]);

	const formatTime = (sec: number) => {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = sec % 60;
		return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	const formatDateTime = (dateStr: string) => {
		const date = new Date(
			dateStr.includes("Z") ? dateStr : `${dateStr.replace(" ", "T")}Z`,
		);
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		const hours = date.getHours().toString().padStart(2, "0");
		const mins = date.getMinutes().toString().padStart(2, "0");
		return `${month}.${day} ${hours}:${mins}`;
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

	if (!currentTime) {
		return (
			<div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
				<div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
					<Clock className="w-4 h-4 animate-spin" />
					<span className="text-xs sm:text-sm">Ачааллаж байна...</span>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`rounded-xl shadow-sm border-2 ${config.border} ${config.bg} w-full overflow-hidden transition-all duration-300`}
		>
			<div className="p-2.5 sm:p-3 md:p-4">
				{/* Header with Timer */}
				<div className="flex items-center justify-between mb-2 sm:mb-2.5 md:mb-3">
					<div className="flex items-center gap-1.5 sm:gap-2">
						<div
							className={`rounded-lg p-1 sm:p-1.5 ${config.iconBg} ${config.pulse ? "animate-pulse" : ""}`}
						>
							<Icon
								className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${config.iconColor}`}
							/>
						</div>
						<div
							className={`px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-bold border ${config.badge}`}
						>
							{config.badgeText}
						</div>
					</div>
					<div
						className={`font-mono font-black text-lg sm:text-xl md:text-2xl lg:text-3xl ${config.timerColor} tracking-tight`}
					>
						{formatTime(remainingSec)}
					</div>
				</div>

				{/* Progress Bar */}
				<div className="mb-2 sm:mb-2.5 md:mb-3">
					<div className="h-1.5 sm:h-2 md:h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
						<div
							className={`h-full bg-gradient-to-r ${config.progressColor} transition-all duration-500 ease-out`}
							style={{ width: `${percentage}%` }}
						/>
					</div>
					<div className="flex justify-between items-center mt-1">
						<span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">
							0:00
						</span>
						<span className="text-[9px] sm:text-[10px] font-semibold text-slate-600 dark:text-slate-300">
							{Math.round(percentage)}%
						</span>
						<span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">
							{formatTime(examMinutes * 60)}
						</span>
					</div>
				</div>

				{/* Time Info */}
				<div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
					<div className="flex items-start gap-1 sm:gap-1.5">
						<CalendarClock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
						<div className="min-w-0 flex-1">
							<p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-tight">
								Эхлэх
							</p>
							<p className="font-semibold text-[10px] sm:text-[11px] md:text-xs text-slate-900 dark:text-white truncate leading-tight">
								{formatDateTime(examStartTime)}
							</p>
						</div>
					</div>

					<div className="flex items-start gap-1 sm:gap-1.5">
						<CalendarClock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
						<div className="min-w-0 flex-1">
							<p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-tight">
								Дуусах
							</p>
							<p className="font-semibold text-[10px] sm:text-[11px] md:text-xs text-slate-900 dark:text-white truncate leading-tight">
								{formatDateTime(examEndTime)}
							</p>
						</div>
					</div>
				</div>

				{/* Warning Messages */}
				{status === "ongoing" && isDanger && (
					<div className="mt-2 sm:mt-2.5 md:mt-3 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-1.5 sm:p-2 md:p-2.5 animate-pulse">
						<p className="text-[10px] sm:text-xs md:text-sm font-bold text-red-700 dark:text-red-300 text-center">
							⚠️ Цаг дуусч байна! Шалгалтаа дүүргээрэй!
						</p>
					</div>
				)}

				{status === "ended" && (
					<div className="mt-2 sm:mt-2.5 md:mt-3 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-2 sm:p-2.5 md:p-3">
						<p className="text-xs sm:text-sm md:text-base font-bold text-red-700 dark:text-red-300 text-center">
							🛑 Шалгалтын цаг дууслаа
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
