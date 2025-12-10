"use client";

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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ExamresultListCardProps } from "@/types/exam/examResultList";

interface ExamListItemProps extends ExamresultListCardProps {
	onViewRank?: (examId: number) => void;
	onViewResults?: (examId: number, testId: number) => void;
	globalShowScore?: boolean;
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
		badge: "bg-gray-100 text-gray-600",
		icon: "bg-gray-100 text-gray-400",
	},
	excellent: {
		label: "Маш сайн",
		badge: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
		icon: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
	},
	good: {
		label: "Сайн",
		badge: "bg-gradient-to-br from-green-500 to-green-600 text-white",
		icon: "bg-gradient-to-br from-green-500 to-green-600 text-white",
	},
	average: {
		label: "Дунд",
		badge: "bg-gradient-to-br from-yellow-500 to-orange-500 text-white",
		icon: "bg-gradient-to-br from-yellow-500 to-orange-500 text-white",
	},
	pass: {
		label: "Хангалттай",
		badge: "bg-gradient-to-br from-orange-500 to-red-500 text-white",
		icon: "bg-gradient-to-br from-orange-500 to-red-500 text-white",
	},
	fail: {
		label: "Хангалтгүй",
		badge: "bg-gradient-to-br from-red-600 to-red-700 text-white",
		icon: "bg-gradient-to-br from-red-600 to-red-700 text-white",
	},
};

export const ExamListItem: React.FC<ExamListItemProps> = ({
	exam,
	onViewRank,
	onViewResults,
	globalShowScore = false,
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
		return `${year}.${month}.${day}`;
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
		<Card className="group hover:border-blue-300 transition-all duration-300 overflow-hidden bg-outercard">
			<CardHeader className="py-5 px-5">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						<div className="flex items-start gap-3 mb-3">
							{/* Title & Date */}
							<div className="flex-1">
								<h3 className="text-base font-bold ">{exam.title}</h3>
								<div className="flex flex-wrap gap-2">
									<Badge variant="secondary" className="gap-1.5">
										<Calendar className="w-3.5 h-3.5" />
										{formatDate(examDate)}
									</Badge>
									<Badge variant="secondary" className="gap-1.5">
										<Clock className="w-3.5 h-3.5" />
										{formatTime(examDate)}
									</Badge>
								</div>
							</div>
						</div>
					</div>

					{/* Score Badge */}
					{finished && exam.test_perc !== undefined && (
						<div className="relative">
							<div
								className={`relative shrink-0 w-20 h-20 rounded-xl transition-all duration-300 group-hover:scale-105 ${
									showScore ? config.badge : "bg-gray-200"
								}`}
							>
								<div className="absolute inset-0 flex flex-col items-center justify-center">
									<div
										className={`text-2xl font-black leading-none transition-all duration-300 ${
											showScore
												? "text-white"
												: "blur-md select-none text-gray-400"
										}`}
									>
										{showScore ? exam.test_perc : "88"}
									</div>

									<div
										className={`text-[10px] font-medium opacity-80 mt-1 ${
											showScore ? "text-white" : "text-gray-400"
										}`}
									>
										{showScore ? config.label : ""}
									</div>
								</div>
							</div>
							<Button
								onClick={() => setLocalShowScore(!localShowScore)}
								size="icon"
								variant="outline"
								className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full hover:scale-110 transition-transform duration-200 hover:border-blue-400"
								title={showScore ? "Оноо нуух" : "Оноо харах"}
							>
								{showScore ? (
									<EyeOff className="w-4 h-4 text-gray-600" />
								) : (
									<Eye className="w-4 h-4 text-blue-600" />
								)}
							</Button>
						</div>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-4 px-5 pb-5">
				{/* Exam Duration */}
				<div className="flex items-center justify-between p-3 rounded-lg border border-blue-200">
					<div className="flex items-center gap-2 text-sm font-semibold ">
						<Target className="w-4 h-4 " />
						<span>Үргэлжлэх хугацаа</span>
					</div>
					<span className="text-lg font-bold ">{exam.exam_minute} минут</span>
				</div>

				{/* Time Spent */}
				{finished && exam.test_time && (
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">Зарцуулсан хугацаа:</span>
						<span className=" font-bold">{exam.test_time}</span>
					</div>
				)}

				{/* Action Buttons */}
				{finished ? (
					<div className="space-y-2 pt-2">
						<Button
							className="w-full bg-linear-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
							onClick={handleDetailsClick}
						>
							<FileText className="w-4 h-4 mr-2" />
							<span>Дэлгэрэнгүй үзэх</span>
							<ArrowRight className="w-4 h-4 ml-2" />
						</Button>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								className="flex-1 hover:bg-blue-50 hover:border-blue-300 border-blue-200"
								onClick={handleAnswersClick}
							>
								<FileText className="w-4 h-4 mr-2 text-blue-600" />
								<span className="font-semibold">Шалгалтын оноо</span>
							</Button>

							{onViewRank && (
								<Button
									variant="outline"
									className="flex-1 hover:bg-purple-50 hover:border-purple-300 border-purple-200"
									onClick={handleRankClick}
								>
									<Award className="w-4 h-4 mr-2 text-purple-600" />
									<span className="font-semibold">Ранк харах</span>
								</Button>
							)}
						</div>
					</div>
				) : (
					<div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
						<XCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
						<p className="text-sm font-semibold text-gray-600">
							Шалгалт эхлээгүй байна
						</p>
						<p className="text-xs text-gray-500 mt-1">
							Та удахгүй шалгалт өгөх боломжтой
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
