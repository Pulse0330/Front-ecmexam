"use client";

import { Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ExamTimerProps {
	onElapsedChange?: (seconds: number) => void;
}

export default function ExamTimer({ onElapsedChange }: ExamTimerProps) {
	const [seconds, setSeconds] = useState(0);
	const onElapsedChangeRef = useRef(onElapsedChange);

	// ✅ Ref-г update хийх
	useEffect(() => {
		onElapsedChangeRef.current = onElapsedChange;
	}, [onElapsedChange]);

	// ✅ Timer effect
	useEffect(() => {
		const interval = setInterval(() => {
			setSeconds((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	// ✅ ШИНЭ: Секунд өөрчлөгдөх бүрт callback дуудах (тусдаа effect)
	useEffect(() => {
		if (seconds > 0) {
			onElapsedChangeRef.current?.(seconds);
		}
	}, [seconds]); // ✅ seconds өөрчлөгдөх бүрт л дуудагдана

	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	return (
		<div className="relative inline-block min-w-60">
			<div className="absolute -inset-0.5 bg-slate-200 dark:bg-slate-800 rounded-2xl blur-sm opacity-50"></div>
			<div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
				<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
					<div className="flex items-center gap-2">
						<Timer className="w-4 h-4 text-indigo-500" />
						<span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
							Хугацаа
						</span>
					</div>
				</div>

				<div className="px-6 py-6 flex items-center justify-center bg-white dark:bg-slate-900">
					<div className="flex items-center font-mono">
						{hrs > 0 && (
							<>
								<div className="text-center group">
									<div className="text-3xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
										{hrs.toString().padStart(2, "0")}
									</div>
									<div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
										Цаг
									</div>
								</div>
								<div className="text-2xl text-slate-300 dark:text-slate-700 px-2 self-start mt-1">
									:
								</div>
							</>
						)}

						<div className="text-center">
							<div className="text-3xl font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-none">
								{mins.toString().padStart(2, "0")}
							</div>
							<div className="text-[9px] font-bold text-slate-400 uppercase mt-2">
								минут
							</div>
						</div>

						<div className="text-2xl text-slate-300 dark:text-slate-700 px-2 self-start mt-1">
							:
						</div>

						<div className="text-center">
							<div className="text-3xl font-bold text-indigo-500 dark:text-indigo-400 tabular-nums leading-none">
								{secs.toString().padStart(2, "0")}
							</div>
							<div className="text-[9px] font-bold text-slate-400 uppercase mt-2">
								секунд
							</div>
						</div>
					</div>
				</div>

				<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800">
					<div
						className="h-full bg-indigo-500/40 transition-all duration-1000 ease-linear"
						style={{ width: `${(secs / 60) * 100}%` }}
					></div>
				</div>
			</div>
		</div>
	);
}
