"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
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

const getScoreLevel = (score?: number) => {
	if (!score) return "none";
	if (score >= 90) return "excellent";
	if (score >= 75) return "good";
	if (score >= 60) return "average";
	if (score >= 40) return "pass";
	return "fail";
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
	const _scoreLevel = getScoreLevel(exam.test_perc);

	const formatDate = (d: Date) =>
		`${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
	const formatTime = (d: Date) =>
		`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

	const iconClass = "w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0";
	const textClass = "text-[8px] sm:text-[9px] md:text-xs";
	const btnClass =
		"h-6 sm:h-7 md:h-8 text-[8px] sm:text-[9px] md:text-xs px-1.5 sm:px-2";

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="h-full"
		>
			<div className="group h-full w-full relative flex flex-col border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 rounded-lg sm:rounded-xl overflow-hidden">
				{/* Image Header */}
				<div className="relative w-full aspect-4/2 bg-muted shrink-0">
					<div className={`absolute inset-0 bg-linear-to-br  opacity-20`} />
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
					<div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/50 to-transparent" />

					{/* Status Badge */}
					<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
						<Badge
							className={`border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap ${finished ? "bg-green-500/90 text-white" : ""}`}
						>
							{finished ? (
								<FileText className={`${iconClass} mr-0.5`} />
							) : (
								<XCircle className={`${iconClass} mr-0.5`} />
							)}
							{finished ? "Дууссан" : "Дуусаагүй"}
						</Badge>
					</div>

					{/* Date & Time */}
					<div className="absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 z-10 flex items-center gap-1 sm:gap-2">
						<div className="flex items-center gap-0.5 sm:gap-1">
							<Calendar className={`${iconClass} text-white/90`} />
							<span className={`font-medium ${textClass} text-white/90`}>
								{formatDate(examDate)}
							</span>
						</div>
						<div className="flex items-center gap-0.5 sm:gap-1">
							<Clock className={`${iconClass} text-white/90`} />
							<span className={`font-medium ${textClass} text-white/90`}>
								{formatTime(examDate)}
							</span>
						</div>
					</div>

					{/* Score Display */}
					{finished && exam.test_perc !== undefined && (
						<div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
							<div className="relative">
								<div
									className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl bg-linear-to-br flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-lg`}
								>
									<div
										className={`text-sm sm:text-base md:text-lg font-black leading-none text-white ${showScore ? "" : "blur-md select-none"}`}
									>
										{exam.test_perc?.toFixed(1)}%
									</div>
									<div
										className={`text-[6px] sm:text-[7px] md:text-[8px] font-medium mt-0.5 text-white ${showScore ? "opacity-80" : "opacity-0"}`}
									></div>
								</div>
								<Button
									onClick={(e) => {
										e.stopPropagation();
										setLocalShowScore(!localShowScore);
									}}
									size="icon"
									variant="outline"
									className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:scale-110 transition-transform duration-200 hover:border-blue-400 p-0"
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

				{/* Content */}
				<div className="p-1.5 sm:p-2 md:p-2.5 pb-16 sm:pb-18 md:pb-20 flex flex-col flex-1 space-y-1 sm:space-y-1.5">
					<div className="relative group/title">
						<h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors duration-300">
							{exam.title}
						</h3>
						{/* Tooltip */}
						<div className="absolute left-0 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all duration-200 pointer-events-none z-50 shadow-lg">
							{exam.title}
							<div className="absolute left-4 top-full w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
						</div>
					</div>

					{/* Stats */}
					<div className="flex items-center justify-between gap-1 sm:gap-1.5 pt-1 border-t border-border/50">
						<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
							<Target className={iconClass} />
							<span className={`font-medium ${textClass} truncate`}>
								{exam.exam_minute} мин
							</span>
						</div>
						{finished && exam.test_time && (
							<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
								<Clock className={iconClass} />
								<span className={`font-medium ${textClass} truncate`}>
									{exam.test_time}
								</span>
							</div>
						)}
					</div>

					{/* Actions */}
					{finished ? (
						<div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 flex flex-col gap-1 sm:gap-1.5">
							{/* Top Row - Rank & Score */}
							<div className="flex items-center gap-1 sm:gap-1.5">
								<Button
									onClick={() => onViewResults?.(exam.exam_id, exam.test_id)}
									size="sm"
									variant="outline"
									className={`flex-1 ${btnClass} hover:bg-blue-50 hover:border-blue-300`}
								>
									<FileText className={`${iconClass} mr-0.5 sm:mr-1`} />
									Оноо
								</Button>
								{onViewRank && (
									<Button
										onClick={(e) => {
											e.stopPropagation();
											onViewRank(exam.exam_id);
										}}
										size="sm"
										variant="outline"
										className={`flex-1 ${btnClass} hover:bg-purple-50 hover:border-purple-300`}
									>
										<Award className={`${iconClass} mr-0.5 sm:mr-1`} />
										Ранк
									</Button>
								)}
							</div>
							{/* Bottom Row - Details */}
							<Button
								onClick={() =>
									router.push(`/examResult/${exam.exam_id}_${exam.test_id}`)
								}
								size="sm"
								className={`group/btn w-full ${btnClass} bg-linear-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 relative overflow-hidden`}
							>
								<span className="flex items-center justify-center gap-1 relative z-10">
									<FileText className={`${iconClass}`} />
									Дэлгэрэнгүй үзэх
									<ArrowRight
										className={`${iconClass} transition-transform duration-300 group-hover/btn:translate-x-1`}
									/>
								</span>
							</Button>
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
