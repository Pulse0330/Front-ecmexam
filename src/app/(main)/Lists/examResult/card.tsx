"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	Clock,
	Eye,
	EyeOff,
	Hourglass,
	Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExamresultListCardProps } from "@/types/exam/examResultList";
import { scoreTone } from "./resultStats";

interface ExamListItemProps extends ExamresultListCardProps {
	onViewRank?: (examId: number) => void;
	onViewResults?: (examId: number, testId: number) => void;
	globalShowScore?: boolean;
	index?: number;
}
const formatDateStr = (dateStr: string) => {
	const cleaned = dateStr.replace("T", " ").replace("Z", "").split(".")[0];
	return cleaned.slice(0, 16); // "2026-03-12 17:23"
};

export const ExamListItem: React.FC<ExamListItemProps> = ({
	exam,

	globalShowScore = false,
	index = 0,
}) => {
	const router = useRouter();
	const [localShowScore, setLocalShowScore] = useState(false);

	const finished = exam.isfinished === 1;
	const showScore = globalShowScore || localShowScore;
	const examDate = new Date(exam.Ognoo);

	const formatDate = (d: Date) =>
		`${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
	const formatTime = (d: Date) =>
		`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="h-full"
		>
			<article className="flex h-full flex-col rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
				{/* Төлөв + оноо */}
				<div className="flex items-start justify-between gap-3">
					{finished ? (
						<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
							<CheckCircle2 className="size-3.5" aria-hidden="true" />
							Дууссан
						</span>
					) : (
						<span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
							<Hourglass className="size-3.5" aria-hidden="true" />
							Үр дүн гараагүй
						</span>
					)}

					{finished && exam.test_perc !== undefined && (
						<div className="flex items-center gap-1">
							<span
								className={cn(
									"text-xl font-bold tabular-nums",
									showScore
										? scoreTone(exam.test_perc)
										: "blur-sm select-none text-foreground",
								)}
								aria-hidden={!showScore}
							>
								{exam.test_perc?.toFixed(1)}%
							</span>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									setLocalShowScore(!localShowScore);
								}}
								size="icon"
								variant="ghost"
								className="size-10 text-muted-foreground"
								aria-label={showScore ? "Оноо нуух" : "Оноо харуулах"}
								title={showScore ? "Оноо нуух" : "Оноо харуулах"}
							>
								{showScore ? (
									<EyeOff className="size-4" />
								) : (
									<Eye className="size-4" />
								)}
							</Button>
						</div>
					)}
				</div>

				{/* Гарчиг */}
				<h3
					className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-foreground"
					title={exam.title}
				>
					{exam.title}
				</h3>

				{/* Мэдээлэл */}
				<ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
					<li className="flex items-center gap-2">
						<Calendar className="size-4 shrink-0" aria-hidden="true" />
						<span>
							{formatDate(examDate)} · {formatTime(examDate)}
						</span>
					</li>
					<li className="flex items-center gap-2">
						<Timer className="size-4 shrink-0" aria-hidden="true" />
						<span>Хугацаа: {exam.exam_minute} мин</span>
					</li>
					{finished && (
						<li className="flex items-center gap-2">
							<Clock className="size-4 shrink-0" aria-hidden="true" />
							<span>
								Зарцуулсан:{" "}
								<span className="font-medium text-foreground">
									{exam.test_time}
								</span>
							</span>
						</li>
					)}
				</ul>

				{/* Үйлдэл */}
				<div className="mt-auto pt-4">
					{finished ? (
						<Button
							onClick={() =>
								router.push(`/examResult/${exam.exam_id}_${exam.test_id}`)
							}
							className="h-10 w-full gap-2"
						>
							Дэлгэрэнгүй харах
							<ArrowRight className="size-4" aria-hidden="true" />
						</Button>
					) : (
						<div className="rounded-xl border border-dashed bg-muted/50 px-3 py-2.5 text-center text-sm">
							<p className="text-muted-foreground">Үр дүн харагдах хугацаа</p>
							<p className="font-semibold text-foreground">
								{formatDateStr(exam.enddate)}
							</p>
						</div>
					)}
				</div>
			</article>
		</motion.div>
	);
};
