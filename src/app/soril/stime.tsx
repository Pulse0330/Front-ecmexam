"use client";

import { Clock } from "lucide-react";
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
		<div className="w-full rounded-2xl border bg-card shadow-sm overflow-hidden">
			<div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
				<Clock className="w-4 h-4 text-primary" />
				<span className="text-sm font-medium text-muted-foreground">
					Зарцуулсан хугацаа
				</span>
			</div>

			<div className="px-4 py-5 flex items-center justify-center">
				<div className="flex items-center font-mono">
					{hrs > 0 && (
						<>
							<div className="text-3xl font-bold text-foreground tabular-nums leading-none">
								{hrs.toString().padStart(2, "0")}
							</div>
							<div className="text-2xl text-muted-foreground px-1.5">:</div>
						</>
					)}

					<div className="text-3xl font-bold text-foreground tabular-nums leading-none">
						{mins.toString().padStart(2, "0")}
					</div>

					<div className="text-2xl text-muted-foreground px-1.5">:</div>

					<div className="text-3xl font-bold text-primary tabular-nums leading-none">
						{secs.toString().padStart(2, "0")}
					</div>
				</div>
			</div>
		</div>
	);
}
