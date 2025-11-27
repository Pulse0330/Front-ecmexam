"use client";

import {
	Award,
	Calendar,
	CheckCircle,
	ChevronRight,
	Clock,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ExamresultListCardProps } from "@/types/exam/examResultList";

export const ExamCard: React.FC<ExamresultListCardProps> = ({ exam }) => {
	const router = useRouter();
	const finished = exam.isfinished === 1;
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

	// Calculate score color
	const getScoreColor = (percentage: number) => {
		if (percentage >= 90) return "text-green-600";
		if (percentage >= 75) return "text-blue-600";
		if (percentage >= 60) return "text-orange-600";
		return "text-red-600";
	};

	const getScoreBgColor = (percentage: number) => {
		if (percentage >= 90) return "bg-green-500/10";
		if (percentage >= 75) return "bg-blue-500/10";
		if (percentage >= 60) return "bg-orange-500/10";
		return "bg-red-500/10";
	};

	const getScoreGrade = (percentage: number) => {
		if (percentage >= 90) return "Маш сайн";
		if (percentage >= 75) return "Сайн";
		if (percentage >= 60) return "Дунд";
		return "Хангалтгүй";
	};

	const scoreColor = getScoreColor(exam.test_perc);
	const scoreBgColor = getScoreBgColor(exam.test_perc);

	// Handle card click
	const handleCardClick = () => {
		if (finished) {
			router.push(`/exam/resultDetail/${exam.exam_id}`);
		}
	};

	return (
		<Card
			className={`overflow-hidden transition-all duration-300 group border-border relative h-full ${
				finished
					? "cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:border-primary/50"
					: "cursor-default opacity-60"
			}`}
			onClick={handleCardClick}
		>
			{/* Status indicator line */}
			<div
				className={`absolute top-0 left-0 right-0 h-1.5 ${
					finished ? "bg-green-600" : "bg-orange-600"
				}`}
			/>

			{/* Header with score */}
			<div
				className={`relative ${scoreBgColor} p-6 border-b border-border transition-colors ${finished ? "group-hover:bg-primary/5" : ""}`}
			>
				<div className="flex items-start justify-between gap-3 mb-4">
					<h3
						className={`text-lg font-bold line-clamp-2 flex-1 transition-colors ${
							finished
								? "text-card-foreground group-hover:text-primary"
								: "text-muted-foreground"
						}`}
					>
						{exam.title}
					</h3>
					<div className="flex items-center gap-2 shrink-0">
						<Badge
							variant={finished ? "default" : "secondary"}
							className={
								finished ? "bg-green-600 hover:bg-green-700 shadow-md" : ""
							}
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
						{finished && (
							<div className="bg-primary/10 p-1.5 rounded-full group-hover:bg-primary/20 transition-colors">
								<ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-all" />
							</div>
						)}
					</div>
				</div>

				{/* Big Score Display */}
				<div className="flex items-center justify-center gap-6">
					<div className="text-center">
						<div className={`text-5xl font-bold ${scoreColor}`}>
							{exam.test_perc}%
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							{exam.test_dun} оноо
						</p>
					</div>
					{finished && (
						<div className="flex flex-col items-center">
							<div className={`p-3 ${scoreBgColor} rounded-full`}>
								<Award className={`w-8 h-8 ${scoreColor}`} />
							</div>
							<p className={`text-xs font-semibold mt-1 ${scoreColor}`}>
								{getScoreGrade(exam.test_perc)}
							</p>
						</div>
					)}
				</div>
			</div>

			<CardContent className="p-5 space-y-4">
				{/* Info Grid */}
				<div className="space-y-3">
					{/* Exam Date */}
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-500/10 rounded-lg">
							<Calendar className="w-4 h-4 text-blue-600" />
						</div>
						<div className="flex-1">
							<p className="text-xs text-muted-foreground">Шалгалтын огноо</p>
							<p className="text-sm font-medium text-card-foreground">
								{formatDate(examDate)} • {formatTime(examDate)}
							</p>
						</div>
					</div>

					{finished && exam.test_date && (
						<div className="flex items-center gap-3">
							<div className="p-2 bg-green-500/10 rounded-lg">
								<Clock className="w-4 h-4 text-green-600" />
							</div>
							<div className="flex-1">
								<p className="text-xs text-muted-foreground">Дууссан огноо</p>
								<p className="text-sm font-medium text-card-foreground">
									{exam.test_date}
								</p>
							</div>
						</div>
					)}

					<div className="grid grid-cols-2 gap-3">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-orange-500/10 rounded-lg">
								<TrendingUp className="w-4 h-4 text-orange-600" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Хугацаа</p>
								<p className="text-sm font-medium text-card-foreground">
									{exam.exam_minute} мин
								</p>
							</div>
						</div>

						{exam.test_time && (
							<div className="flex items-center gap-2">
								<div className="p-2 bg-purple-500/10 rounded-lg">
									<Clock className="w-4 h-4 text-purple-600" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground">Зарцуулсан</p>
									<p className="text-sm font-medium text-card-foreground">
										{exam.test_time}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="h-px bg-border" />

				{/* Footer */}
				{finished ? (
					<div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary font-semibold transition-all">
						<span>Дэлгэрэнгүй үзэх</span>
						<ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
					</div>
				) : (
					<div className="text-center py-3 px-4 rounded-lg bg-muted">
						<p className="text-sm text-muted-foreground font-medium">
							⏳ Шалгалт дуусаагүй байна
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
