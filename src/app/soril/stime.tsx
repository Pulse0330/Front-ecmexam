"use client";

import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ExamTimerProps {
	storageKey?: string;
	onElapsedChange?: (minutes: number) => void;
}

export default function ExamTimer({
	storageKey = "exam_timer",
	onElapsedChange,
}: ExamTimerProps) {
	const [seconds, setSeconds] = useState(0);
	const onElapsedChangeRef = useRef(onElapsedChange);

	// Initial load
	useEffect(() => {
		const saved = localStorage.getItem(storageKey);
		if (saved) setSeconds(parseInt(saved, 10));
	}, [storageKey]);

	useEffect(() => {
		onElapsedChangeRef.current = onElapsedChange;
	}, [onElapsedChange]);

	useEffect(() => {
		const interval = setInterval(() => {
			setSeconds((prev) => {
				const newSec = prev + 1;
				localStorage.setItem(storageKey, newSec.toString());

				// Минут солигдох үед л callback дуудах (performance сайжруулалт)
				if (newSec % 60 === 0) {
					onElapsedChangeRef.current?.(Math.floor(newSec / 60));
				}

				return newSec;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [storageKey]);

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
		<div className="group relative">
			{/* Арын гэрэлтэлт эффект (Glow) */}
			<div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

			<div className="relative flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
				{/* Икон хэсэг */}
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
					<Clock className="w-4.5 h-4.5 animate-pulse" />
				</div>

				{/* Цаг хэсэг */}
				<div className="flex flex-col">
					<span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold leading-none mb-1"></span>
					<div className="flex items-baseline gap-1 font-mono text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">
						{hrs > 0 && (
							<>
								<span>{hrs}</span>
								<span className="text-sm text-slate-400 font-normal">h</span>
							</>
						)}
						<span>{mins}</span>
						<span className="text-sm text-slate-400 font-normal">:</span>
						<span className="text-blue-600 dark:text-blue-400">{secs}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
