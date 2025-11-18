"use client";

import {
	Award,
	Calendar,
	CheckCircle,
	Clock,
	TrendingUp,
	XCircle,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ExamresultListCardProps } from "@/types/exam/examResultList";

export const ExamCard: React.FC<ExamresultListCardProps> = ({ exam }) => {
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
		if (percentage >= 90) return "text-chart-2";
		if (percentage >= 75) return "text-chart-1";
		if (percentage >= 60) return "text-chart-5";
		return "text-destructive";
	};

	const getScoreGrade = (percentage: number) => {
		if (percentage >= 90) return "Маш сайн";
		if (percentage >= 75) return "Сайн";
		if (percentage >= 60) return "Дунд";
		return "Хангалтгүй";
	};

	const scoreColor = getScoreColor(exam.test_perc);

	// Handle view results
	const handleViewResults = () => {
		console.log("Үр дүн харах:", exam.exam_id);
		// window.location.href = `/exam-result/${exam.exam_id}`;
	};

	return (
		<Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-border relative">
			{/* Status indicator line */}
			<div
				className={`absolute top-0 left-0 right-0 h-1 ${finished ? "bg-chart-2" : "bg-chart-5"}`}
			/>

			{/* Header with score */}
			<div className="relative bg-gradient-to-br from-primary/5 to-primary/10 p-6 border-b border-border">
				<div className="flex items-start justify-between gap-3 mb-4">
					<h3 className="text-lg font-bold text-card-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors">
						{exam.title}
					</h3>
					<Badge
						variant={finished ? "default" : "secondary"}
						className="shrink-0"
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

				{/* Big Score Display */}
				<div className="flex items-center justify-center gap-4">
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
							<div className="p-3 bg-accent rounded-full">
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
						<div className="p-2 bg-accent rounded-lg">
							<Calendar className="w-4 h-4 text-chart-1" />
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
							<div className="p-2 bg-accent rounded-lg">
								<Clock className="w-4 h-4 text-chart-2" />
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
							<div className="p-2 bg-accent rounded-lg">
								<TrendingUp className="w-4 h-4 text-chart-5" />
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
								<div className="p-2 bg-accent rounded-lg">
									<Clock className="w-4 h-4 text-chart-3" />
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

				{finished ? (
					<Button className="w-full " onClick={handleViewResults}>
						Дэлгэрэнгүй үзэх
					</Button>
				) : (
					<div className="text-center py-2">
						<p className="text-sm text-muted-foreground">
							Шалгалт дуусаагүй байна
						</p>
					</div>
				)}
			</CardContent>

			<div className="absolute bottom-0 left-0 right-0 h-1 " />
		</Card>
	);
};
