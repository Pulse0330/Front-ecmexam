"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExamTimerProps {
	/** Шалгалт эхлэх хүртэлх секунд */
	initialSeconds: number;
}

export default function ExamTimer({ initialSeconds }: ExamTimerProps) {
	const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

	useEffect(() => {
		if (secondsLeft <= 0) return;

		const timer = setInterval(() => {
			setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);

		return () => clearInterval(timer);
	}, [secondsLeft]);

	const hours = Math.floor(secondsLeft / 3600);
	const minutes = Math.floor((secondsLeft % 3600) / 60);
	const seconds = secondsLeft % 60;

	return (
		<Card className="w-full max-w-sm mx-auto border border-border shadow-md rounded-2xl">
			<CardHeader className="flex items-center justify-between pb-2">
				<CardTitle className="text-lg font-semibold flex items-center gap-2">
					<Clock className="w-5 h-5 text-primary" />
					Шалгалт эхлэх хүртэл
				</CardTitle>
			</CardHeader>

			<CardContent className="text-center space-y-3">
				{secondsLeft > 0 ? (
					<div className="flex justify-center gap-4 text-2xl font-bold">
						<div>
							<span className="text-3xl">{String(hours).padStart(2, "0")}</span>
							<div className="text-xs text-muted-foreground uppercase">цаг</div>
						</div>
						<div>
							<span className="text-3xl">
								{String(minutes).padStart(2, "0")}
							</span>
							<div className="text-xs text-muted-foreground uppercase">
								минут
							</div>
						</div>
						<div>
							<span className="text-3xl">
								{String(seconds).padStart(2, "0")}
							</span>
							<div className="text-xs text-muted-foreground uppercase">
								секунд
							</div>
						</div>
					</div>
				) : (
					<p className="text-green-600 font-medium text-lg">
						🟢 Шалгалт эхэлсэн байна!
					</p>
				)}
			</CardContent>
		</Card>
	);
}
