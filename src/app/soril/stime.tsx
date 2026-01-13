"use client";

import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ExamTimerProps {
	onElapsedChange?: (minutes: number) => void;
}

export default function ExamTimer({ onElapsedChange }: ExamTimerProps) {
	const [seconds, setSeconds] = useState(0);
	const onElapsedChangeRef = useRef(onElapsedChange);
	const lastMinuteReported = useRef(0);

	useEffect(() => {
		onElapsedChangeRef.current = onElapsedChange;
	}, [onElapsedChange]);

	useEffect(() => {
		const interval = setInterval(() => {
			setSeconds((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Минут солигдох үед callback дуудах
	useEffect(() => {
		const currentMinutes = Math.floor(seconds / 60);

		if (currentMinutes !== lastMinuteReported.current) {
			lastMinuteReported.current = currentMinutes;
			onElapsedChangeRef.current?.(currentMinutes);
		}
	}, [seconds]);

	const formatTime = (totalSeconds: number) => {
		const hrs = Math.floor(totalSeconds / 3600);
		const mins = Math.floor((totalSeconds % 3600) / 60);
		const secs = totalSeconds % 60;

		return {
			hrs,
			mins: mins.toString().padStart(2, "0"),
			secs: secs.toString().padStart(2, "0"),
		};
	};

	const { hrs, mins, secs } = formatTime(seconds);

	return (
		<div className="relative group">
			{/* Гэрэлтсэн арын эффект */}
			<div className="absolute -inset-1 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 animate-pulse"></div>

			{/* Үндсэн контейнер */}
			<div className="relative bg-linear-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-2xl shadow-xl overflow-hidden">
				{/* Дээд хэсэг - Гарчиг */}
				<div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2.5 flex items-center gap-2">
					<div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
						<Clock className="w-3.5 h-3.5 text-white animate-pulse" />
					</div>
					<span className="text-xs font-bold text-white uppercase tracking-wider">
						Үргэлжилсэн хугацаа
					</span>
				</div>

				{/* Цагийн харуулалт */}
				<div className="px-6 py-5 flex items-center justify-center">
					<div className="flex items-baseline gap-1 font-mono">
						{hrs > 0 && (
							<>
								<div className="flex flex-col items-center">
									<span className="text-4xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
										{hrs}
									</span>
									<span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
										ЦАГ
									</span>
								</div>
								<span className="text-3xl text-slate-400 dark:text-slate-600 mx-1 mb-4">
									:
								</span>
							</>
						)}

						<div className="flex flex-col items-center">
							<span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
								{mins}
							</span>
							<span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
								МИНУТ
							</span>
						</div>

						<span className="text-3xl text-slate-400 dark:text-slate-600 mx-1 mb-4 animate-pulse">
							:
						</span>

						<div className="flex flex-col items-center">
							<span className="text-4xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
								{secs}
							</span>
							<span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
								СЕК
							</span>
						</div>
					</div>
				</div>

				{/* Доод хэсэг - Өнгөт gradient accent */}
				<div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
			</div>
		</div>
	);
}
