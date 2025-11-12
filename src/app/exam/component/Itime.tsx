"use client";

import { AlertCircle, Clock, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExamStore } from "@/stores/useExamTime";

interface ExamTimerProps {
	examId: number;
	examMinutes: number;
}

export default function ExamTimer({ examId, examMinutes }: ExamTimerProps) {
	const startedTime = useExamStore((state) => state.startedExams[examId]);
	const [remainingSec, setRemainingSec] = useState(0);
	const [status, setStatus] = useState<"before" | "ongoing" | "ended">(
		"before",
	);

	// Countdown update
	useEffect(() => {
		if (!startedTime) {
			setStatus("before");
			setRemainingSec(examMinutes * 60);
			return;
		}

		const startDate = new Date(startedTime);
		const endDate = new Date(startDate.getTime() + examMinutes * 60000);

		const update = () => {
			const now = new Date();
			if (now < startDate) {
				setStatus("before");
				setRemainingSec(
					Math.floor((startDate.getTime() - now.getTime()) / 1000),
				);
			} else if (now >= startDate && now <= endDate) {
				setStatus("ongoing");
				setRemainingSec(Math.floor((endDate.getTime() - now.getTime()) / 1000));
			} else {
				setStatus("ended");
				setRemainingSec(0);
			}
		};

		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [startedTime, examMinutes]);

	const formatTime = (sec: number) => {
		const h = Math.floor(sec / 3600);
		const m = Math.floor((sec % 3600) / 60);
		const s = sec % 60;
		return `${h.toString().padStart(2, "0")}:${m
			.toString()
			.padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<Card className="w-full max-w-md mx-auto shadow-lg border">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{status === "before" && <Clock />}
					{status === "ongoing" && <PlayCircle className="animate-pulse" />}
					{status === "ended" && <AlertCircle />}
					{status === "before" && "Шалгалт эхлэхгүй байна"}
					{status === "ongoing" && "Шалгалт явагдаж байна"}
					{status === "ended" && "Шалгалт дууссан"}
				</CardTitle>
			</CardHeader>

			<CardContent className="text-center text-4xl font-mono font-bold">
				{status === "before" && "Шалгалт эхлээгүй"}
				{status === "ongoing" && formatTime(remainingSec)}
				{status === "ended" && "00:00:00"}
			</CardContent>
		</Card>
	);
}
