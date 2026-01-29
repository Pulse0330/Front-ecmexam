"use client";

import { motion } from "framer-motion";
import {
	Award,
	Calendar,
	Clock,
	Eye,
	EyeOff,
	FileText,
	Target,
	XCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ExamresultListCardProps } from "@/types/exam/examResultList";

interface ExamListItemProps extends ExamresultListCardProps {
	onViewRank?: (examId: number) => void;
	onViewResults?: (examId: number, testId: number) => void;
	globalShowScore?: boolean;
	index?: number;
}

// Оноог үнэлэх
const getScoreLevel = (score?: number) => {
	if (!score) return "none";
	if (score >= 90) return "excellent";
	if (score >= 75) return "good";
	if (score >= 60) return "average";
	if (score >= 40) return "pass";
	return "fail";
};

// Оноо хэсгийн тохиргоо
const SCORE_CONFIG = {
	none: {
		label: "-",
		gradient: "from-gray-400 to-gray-500",
	},
	excellent: {
		label: "Маш сайн",
		gradient: "from-emerald-500 to-emerald-600",
	},
	good: {
		label: "Сайн",
		gradient: "from-green-500 to-green-600",
	},
	average: {
		label: "Дунд",
		gradient: "from-yellow-500 to-orange-500",
	},
	pass: {
		label: "Хангалттай",
		gradient: "from-orange-500 to-red-500",
	},
	fail: {
		label: "Хангалтгүй",
		gradient: "from-red-600 to-red-700",
	},
};

export const ExamListItem: React.FC<ExamListItemProps> = ({
	exam,
	onViewRank,
	onViewResults,
	globalShowScore = false,
	index = 0,
}) => {
	const router = useRouter();
	const [localShowScore, setLocalShowScore] = useState(false);

	const finished = exam.isfinished === 1;
	const showScore = globalShowScore || localShowScore;
	const examDate = new Date(exam.Ognoo);
	const scoreLevel = getScoreLevel(exam.test_perc);
	const config = SCORE_CONFIG[scoreLevel];

	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}/${month}/${day}`;
	};

	const formatTime = (date: Date) => {
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${hours}:${minutes}`;
	};

	const handleDetailsClick = () => {
		if (finished) {
			router.push(`/examResult/${exam.exam_id}_${exam.test_id}`);
		}
	};

	const handleRankClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onViewRank && finished) onViewRank(exam.exam_id);
	};

	const handleAnswersClick = () => {
		if (finished && onViewResults) {
			onViewResults(exam.exam_id, exam.test_id);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="h-full"
		>
			<div className="group h-full w-full relative flex flex-col border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 rounded-lg sm:rounded-xl overflow-hidden">
				{/* Image Header with Score */}
				<div className="relative w-full aspect-[5/2] bg-muted shrink-0">
					{/* Background gradient based on score */}
					<div
						className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20`}
					/>

					{/* Decorative pattern */}
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

					{/* Gradient Overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/50 to-transparent" />

					{/* Status Badge */}
					<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
						{finished ? (
							<Badge className="bg-green-500/90 text-white border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
								<FileText className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
								Дууссан
							</Badge>
						) : (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2 }}
							>
								<Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
									<XCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
									Дуусаагүй
								</Badge>
							</motion.div>
						)}
					</div>

					{/* Date & Time on Image */}
					<div className="absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 z-10">
						<div className="flex items-center gap-1 sm:gap-2">
							<div className="flex items-center gap-0.5 sm:gap-1">
								<Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/90 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs text-white/90">
									{formatDate(examDate)}
								</span>
							</div>
							<div className="flex items-center gap-0.5 sm:gap-1">
								<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/90 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs text-white/90">
									{formatTime(examDate)}
								</span>
							</div>
						</div>
					</div>

					{/* Score Display - Top Right */}
					{finished && exam.test_perc !== undefined && (
						<div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
							<div className="relative">
								<div
									className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${config.gradient} flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-lg`}
								>
									<div
										className={`text-sm sm:text-base md:text-lg font-black leading-none text-white transition-all duration-300 ${
											showScore ? "" : "blur-md select-none"
										}`}
									>
										{exam.test_perc?.toFixed(1)}%
									</div>
									<div
										className={`text-[6px] sm:text-[7px] md:text-[8px] font-medium mt-0.5 text-white transition-opacity duration-300 ${
											showScore ? "opacity-80" : "opacity-0"
										}`}
									>
										{config.label}
									</div>
								</div>
								<Button
									onClick={(e) => {
										e.stopPropagation();
										setLocalShowScore(!localShowScore);
									}}
									size="icon"
									variant="outline"
									className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:scale-110 transition-transform duration-200 hover:border-blue-400 p-0"
									title={showScore ? "Оноо нуух" : "Оноо харах"}
								>
									{showScore ? (
										<EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
									) : (
										<Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
									)}
								</Button>
							</div>
						</div>
					)}
				</div>

				{/* Content Section */}
				<div className="p-1.5 sm:p-2 md:p-2.5 pb-7 sm:pb-8 md:pb-9 flex flex-col flex-1 space-y-1 sm:space-y-1.5">
					{/* Title */}
					<div className="space-y-0.5 flex-1 min-h-0">
						<h3
							className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors duration-300"
							title={exam.title}
						>
							{exam.title}
						</h3>
					</div>

					{/* Stats */}
					<div className="flex items-center justify-between gap-1 sm:gap-1.5 pt-1 border-t border-border/50">
						<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
							<Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
							<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
								{exam.exam_minute} мин
							</span>
						</div>
						{finished && exam.test_time && (
							<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
								<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
								<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
									{exam.test_time}
								</span>
							</div>
						)}
					</div>

					{/* Action Buttons - Absolute positioned */}
					{finished ? (
						<div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 flex items-center gap-1 sm:gap-1.5">
							<Button
								onClick={handleDetailsClick}
								size="sm"
								className="flex-1 h-6 sm:h-7 md:h-8 text-[8px] sm:text-[9px] md:text-xs px-1.5 sm:px-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
							>
								<FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
								<span className="hidden sm:inline">Дэлгэрэнгүй</span>
								<span className="sm:hidden">Үзэх</span>
							</Button>

							<Button
								onClick={handleAnswersClick}
								size="sm"
								variant="outline"
								className="flex-1 h-6 sm:h-7 md:h-8 text-[8px] sm:text-[9px] md:text-xs px-1.5 sm:px-2 hover:bg-blue-50 hover:border-blue-300"
							>
								<FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-blue-600" />
								<span className="hidden sm:inline">Оноо</span>
								<span className="sm:hidden">Оноо</span>
							</Button>

							{onViewRank && (
								<Button
									onClick={handleRankClick}
									size="sm"
									variant="outline"
									className="h-6 sm:h-7 md:h-8 text-[8px] sm:text-[9px] md:text-xs px-1.5 sm:px-2 hover:bg-purple-50 hover:border-purple-300"
								>
									<Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600" />
								</Button>
							)}
						</div>
					) : (
						<div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 text-center py-1.5 sm:py-2 bg-gray-50 rounded-lg border border-dashed border-gray-200">
							<XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
							<p className="text-[8px] sm:text-[9px] font-semibold text-gray-600">
								Шалгалт дуусаагүй
							</p>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
};
