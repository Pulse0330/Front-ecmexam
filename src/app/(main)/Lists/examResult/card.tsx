"use client";

import {
	ArrowRight,
	BarChart3,
	Calendar,
	CheckCircle,
	Clock,
	Target,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ExamresultListCardProps } from "@/types/exam/examResultList";

interface ExamCardProps extends ExamresultListCardProps {
	onViewRank?: (examId: number) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onViewRank }) => {
	const router = useRouter();

	const finished = exam.isfinished === 0;
	const examDate = new Date(exam.Ognoo);

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("mn-MN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("mn-MN", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getScoreConfig = (percentage: number) => {
		if (percentage >= 90)
			return {
				gradient: "from-emerald-500 to-green-600",
				bg: "bg-emerald-50 dark:bg-emerald-950/20",
				border: "border-emerald-200 dark:border-emerald-800",
				text: "text-emerald-700 dark:text-emerald-300",
				glow: "shadow-emerald-500/20",
				grade: "Маш сайн",
				icon: "🏆",
			};
		if (percentage >= 75)
			return {
				gradient: "from-blue-500 to-indigo-600",
				bg: "bg-blue-50 dark:bg-blue-950/20",
				border: "border-blue-200 dark:border-blue-800",
				text: "text-blue-700 dark:text-blue-300",
				glow: "shadow-blue-500/20",
				grade: "Сайн",
				icon: "⭐",
			};
		if (percentage >= 60)
			return {
				gradient: "from-amber-500 to-orange-600",
				bg: "bg-amber-50 dark:bg-amber-950/20",
				border: "border-amber-200 dark:border-amber-800",
				text: "text-amber-700 dark:text-amber-300",
				glow: "shadow-amber-500/20",
				grade: "Дунд",
				icon: "👍",
			};
		return {
			gradient: "from-rose-500 to-red-600",
			bg: "bg-rose-50 dark:bg-rose-950/20",
			border: "border-rose-200 dark:border-rose-800",
			text: "text-rose-700 dark:text-rose-300",
			glow: "shadow-rose-500/20",
			grade: "Хангалтгүй",
			icon: "📚",
		};
	};

	const scoreConfig = getScoreConfig(exam.test_perc);

	const handleCardClick = () => {
		if (finished) {
			const url = `/examResult/${exam.exam_id}_${exam.test_id}`;
			router.push(url);
		}
	};

	const handleRankClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onViewRank && finished) {
			onViewRank(exam.exam_id);
		}
	};

	return (
		<Card
			className={`group relative overflow-hidden transition-all duration-500 ${
				finished
					? "cursor-pointer hover:shadow-2xl hover:-translate-y-2 border-border/50 hover:border-primary/30 bg-background"
					: "cursor-default opacity-60 border-2 border-dashed border-border/30 bg-muted/30"
			}`}
			onClick={handleCardClick}
		>
			{/* Animated gradient background */}
			{finished && (
				<div
					className={`absolute inset-0 bg-gradient-to-br ${scoreConfig.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
				/>
			)}

			{/* Corner decoration */}
			<div
				className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${scoreConfig.gradient} rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`}
			/>

			<CardContent className="p-6 relative space-y-5">
				{/* Header */}
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						<h3
							className={`text-lg font-bold mb-2 line-clamp-2 leading-snug ${
								finished ? "text-foreground" : "text-muted-foreground"
							}`}
						>
							{exam.title}
						</h3>
						<div className="flex items-center gap-3 text-sm text-muted-foreground">
							<div className="flex items-center gap-1.5">
								<Calendar className="w-4 h-4" />
								<span>{formatDate(examDate)}</span>
							</div>
							<span className="text-muted-foreground/30">•</span>
							<div className="flex items-center gap-1.5">
								<Clock className="w-4 h-4" />
								<span>{formatTime(examDate)}</span>
							</div>
						</div>
					</div>

					{/* Status badge */}
					<Badge
						variant={finished ? "default" : "secondary"}
						className={`shrink-0 text-xs px-3 py-1.5 ${
							finished
								? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg"
								: "bg-muted"
						}`}
					>
						{finished ? (
							<>
								<CheckCircle className="w-3.5 h-3.5 mr-1" />
								<span>Дууссан</span>
							</>
						) : (
							<>
								<XCircle className="w-3.5 h-3.5 mr-1" />
								<span>Дуусаагүй</span>
							</>
						)}
					</Badge>
				</div>

				{/* Score Display - Large and Bold */}
				<div
					className={`relative ${scoreConfig.bg} ${scoreConfig.border} border-2 rounded-2xl p-6 overflow-hidden`}
				>
					{/* Background pattern */}
					<div className="absolute inset-0 opacity-5">
						<div
							className="absolute top-0 left-0 w-full h-full"
							style={{
								backgroundImage:
									"radial-gradient(circle, currentColor 1px, transparent 1px)",
								backgroundSize: "20px 20px",
							}}
						/>
					</div>

					<div className="relative flex items-center justify-between">
						{/* Score */}
						<div className="flex items-end gap-2">
							<div className={`text-6xl font-black ${scoreConfig.text}`}>
								{exam.test_perc}
							</div>
							<div className="pb-2 space-y-0.5">
								<div className={`text-2xl font-bold ${scoreConfig.text}`}>
									%
								</div>
								<div className="text-sm text-muted-foreground font-semibold">
									{exam.test_dun} оноо
								</div>
							</div>
						</div>

						{/* Grade badge */}
						{finished && (
							<div className="flex flex-col items-end gap-2">
								<div className="text-4xl">{scoreConfig.icon}</div>
								<div
									className={`px-4 py-2 rounded-xl bg-background border-2 ${scoreConfig.border}`}
								>
									<span className={`text-sm font-black ${scoreConfig.text}`}>
										{scoreConfig.grade}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Info Grid */}
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
								<Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<div className="text-xs text-muted-foreground font-medium mb-0.5">
									Нийт хугацаа
								</div>
								<div className="text-lg font-black text-foreground">
									{exam.exam_minute}
									<span className="text-sm ml-0.5">мин</span>
								</div>
							</div>
						</div>
					</div>

					{exam.test_time && (
						<div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
									<Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<div className="text-xs text-muted-foreground font-medium mb-0.5">
										Зарцуулсан
									</div>
									<div className="text-lg font-black text-foreground">
										{exam.test_time}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Action Buttons */}
				{finished ? (
					<div className="flex gap-2">
						<Button
							type="button"
							className={`flex-1 py-4 px-6 rounded-xl bg-gradient-to-r ${scoreConfig.gradient} text-white font-bold shadow-xl ${scoreConfig.glow} hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group/btn`}
						>
							<span className="text-base">Дэлгэрэнгүй</span>
							<ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
						</Button>

						{onViewRank && (
							<Button
								type="button"
								onClick={handleRankClick}
								className="px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:from-purple-600 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
							>
								<BarChart3 className="w-5 h-5" />
								<span className="text-base">Rank</span>
							</Button>
						)}
					</div>
				) : (
					<div className="w-full py-4 px-6 rounded-xl bg-muted border-2 border-dashed border-border text-center">
						<span className="text-sm text-muted-foreground font-bold">
							⏳ Шалгалт дуусаагүй байна
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
