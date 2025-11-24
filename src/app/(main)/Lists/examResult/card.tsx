"use client";

import {
	Award,
	Calendar,
	CheckCircle,
	Clock,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ExamresultListCardProps } from "@/types/exam/examResultList";

export const ExamCard: React.FC<ExamresultListCardProps> = ({ exam }) => {
	const router = useRouter();
	const finished = exam.isfinished === 0;
	const examDate = new Date(exam.Ognoo);

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("mn-MN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("mn-MN", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getScoreColor = (percentage: number) => {
		if (percentage >= 90) return "text-emerald-600";
		if (percentage >= 75) return "text-blue-600";
		if (percentage >= 60) return "text-amber-600";
		return "text-rose-600";
	};

	const getScoreBg = (percentage: number) => {
		if (percentage >= 90)
			return "bg-gradient-to-br from-emerald-500/10 to-emerald-600/5";
		if (percentage >= 75)
			return "bg-gradient-to-br from-blue-500/10 to-blue-600/5";
		if (percentage >= 60)
			return "bg-gradient-to-br from-amber-500/10 to-amber-600/5";
		return "bg-gradient-to-br from-rose-500/10 to-rose-600/5";
	};

	const getScoreGrade = (percentage: number) => {
		if (percentage >= 90) return "Маш сайн";
		if (percentage >= 75) return "Сайн";
		if (percentage >= 60) return "Дунд";
		return "Хангалтгүй";
	};

	const scoreColor = getScoreColor(exam.test_perc);
	const scoreBg = getScoreBg(exam.test_perc);

	const handleCardClick = () => {
		if (finished) {
			router.push(`/examResult/${exam.exam_id}`);
		}
	};

	return (
		<Card
			className={`relative overflow-hidden border transition-all duration-500 max-w-sm ${
				finished
					? "cursor-pointer hover:shadow-xl hover:-translate-y-1 border-border/50 hover:border-primary/30 bg-gradient-to-br from-background to-muted/20"
					: "cursor-default opacity-70 border-border/30 bg-muted/30"
			}`}
			onClick={handleCardClick}
		>
			{/* Decorative corner gradient */}
			<div
				className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity ${
					finished ? "group-hover:opacity-30" : ""
				} ${
					exam.test_perc >= 90
						? "bg-emerald-500"
						: exam.test_perc >= 75
							? "bg-blue-500"
							: exam.test_perc >= 60
								? "bg-amber-500"
								: "bg-rose-500"
				}`}
			/>

			<CardContent className="p-4 relative">
				{/* Header */}
				<div className="flex items-start justify-between gap-3 mb-4">
					<div className="flex-1 min-w-0">
						<h3
							className={`text-base font-bold mb-1.5 line-clamp-2 transition-colors ${
								finished ? "text-foreground" : "text-muted-foreground"
							}`}
						>
							{exam.title}
						</h3>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Calendar className="w-3.5 h-3.5" />
							<span>{formatDate(examDate)}</span>
							<span className="text-muted-foreground/50">•</span>
							<Clock className="w-3.5 h-3.5" />
							<span>{formatTime(examDate)}</span>
						</div>
					</div>

					<Badge
						variant={finished ? "default" : "secondary"}
						className={`shrink-0 text-xs ${
							finished
								? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
								: "bg-muted"
						}`}
					>
						{finished ? (
							<>
								<CheckCircle className="w-3 h-3 mr-1" />
								Дууссан
							</>
						) : (
							<>
								<XCircle className="w-3 h-3 mr-1" />
								Дуусаагүй
							</>
						)}
					</Badge>
				</div>

				{/* Score Section */}
				<div
					className={`${scoreBg} rounded-xl p-4 mb-4 border border-border/50 backdrop-blur-sm`}
				>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="relative">
								<div
									className={`text-3xl font-black tracking-tight ${scoreColor}`}
								>
									{exam.test_perc}
									<span className="text-lg">%</span>
								</div>
								<div className="text-xs text-muted-foreground mt-0.5 font-medium">
									{exam.test_dun} оноо
								</div>
							</div>

							{finished && (
								<div className="flex flex-col items-center gap-1">
									<div
										className={`p-2 rounded-xl ${scoreBg} border border-current/10`}
									>
										<Award className={`w-5 h-5 ${scoreColor}`} />
									</div>
									<span className={`text-xs font-bold ${scoreColor}`}>
										{getScoreGrade(exam.test_perc)}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Info Cards */}
				<div className="grid grid-cols-2 gap-2 mb-4">
					<div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
						<div className="p-1.5 rounded-lg bg-amber-500/10">
							<TrendingUp className="w-4 h-4 text-amber-600" />
						</div>
						<div>
							<div className="text-[10px] text-muted-foreground font-medium">
								Хугацаа
							</div>
							<div className="text-sm font-bold text-foreground">
								{exam.exam_minute} мин
							</div>
						</div>
					</div>

					{exam.test_time && (
						<div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
							<div className="p-1.5 rounded-lg bg-violet-500/10">
								<Clock className="w-4 h-4 text-violet-600" />
							</div>
							<div>
								<div className="text-[10px] text-muted-foreground font-medium">
									Зарцуулсан
								</div>
								<div className="text-sm font-bold text-foreground">
									{exam.test_time}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Action Button */}

				{finished ? (
					<Button
						type="button"
						className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 text-sm"
					>
						<span>Дэлгэрэнгүй үзэх</span>
					</Button>
				) : (
					<div className="w-full py-2.5 px-4 rounded-lg bg-muted border border-dashed border-border text-center">
						<span className="text-xs text-muted-foreground font-semibold">
							⏳ Шалгалт дуусаагүй байна
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
