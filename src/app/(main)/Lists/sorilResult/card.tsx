import {
	ArrowRight,
	Calendar,
	Clock,
	Eye,
	EyeOff,
	FileText,
	PlayCircle,
	Target,
	TrendingUp,
	Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SorilresultListItem } from "@/types/soril/sorilResultLists";

interface ExamResultCardProps {
	exam: SorilresultListItem;
	index: number;
	globalShowScore: boolean;
}

// Оноог үнэлэх
const getScoreLevel = (score: number) => {
	if (score >= 90) return "excellent";
	if (score >= 75) return "good";
	if (score >= 60) return "average";
	if (score >= 40) return "pass";
	return "fail";
};

// Оноо хэсгийн тохиргоо
const SCORE_CONFIG = {
	excellent: {
		label: "Маш сайн",
		gradient: "from-emerald-500 to-emerald-600",
		bg: "bg-emerald-50",
		border: "border-emerald-200",
		text: "text-emerald-700",
	},
	good: {
		label: "Сайн",
		gradient: "from-green-500 to-green-600",
		bg: "bg-green-50",
		border: "border-green-200",
		text: "text-green-700",
	},
	average: {
		label: "Дунд",
		gradient: "from-yellow-500 to-orange-500",
		bg: "bg-yellow-50",
		border: "border-yellow-200",
		text: "text-yellow-700",
	},
	pass: {
		label: "Хангалттай",
		gradient: "from-orange-500 to-red-500",
		bg: "bg-orange-50",
		border: "border-orange-200",
		text: "text-orange-700",
	},
	fail: {
		label: "Хангалтгүй",
		gradient: "from-red-600 to-red-700",
		bg: "bg-red-50",
		border: "border-red-200",
		text: "text-red-700",
	},
};

function ExamResultCard({ exam, index, globalShowScore }: ExamResultCardProps) {
	const [localShowScore, setLocalShowScore] = useState(false);
	const router = useRouter();

	const isOngoing = exam.isfinished === 0;
	const showScore = globalShowScore || localShowScore;

	// Calculate score percentage
	const score =
		exam.test_perc ||
		(exam.test_ttl > 0
			? Math.round((exam.correct_ttl / exam.test_ttl) * 100)
			: 0);

	const scoreLevel = getScoreLevel(score);
	const config = SCORE_CONFIG[scoreLevel];

	const examDate = new Date(exam.test_date);

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
		if (!isOngoing) {
			router.push(`/sorilResult/${exam.exam_id}_${exam.test_id}`);
		}
	};

	return (
		<Card
			className={`group hover:border-blue-300 transition-all duration-300 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4 ${
				isOngoing ? "ring-2" : "bg-page"
			}`}
			style={{
				animationDelay: `${index * 50}ms`,
				animationFillMode: "both",
			}}
		>
			<CardHeader className="py-5 px-5">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						<div className="flex items-start gap-3 mb-3">
							{/* Title & Date */}
							<div className="flex-1">
								<h3 className="text-base font-bold transition-colors">
									{exam.title || "Нэргүй шалгалт"}
								</h3>
								<div className="flex flex-wrap gap-2 mt-2">
									<Badge variant="secondary" className="gap-1.5">
										<Calendar className="w-3.5 h-3.5" />
										{formatDate(examDate)}
									</Badge>
									<Badge variant="secondary" className="gap-1.5">
										<Clock className="w-3.5 h-3.5" />
										{formatTime(examDate)}
									</Badge>
									<Badge
										variant={isOngoing ? "outline" : "default"}
										className={`gap-1.5 ${
											isOngoing
												? "border-amber-500 text-amber-800 bg-amber-100 shadow-sm"
												: "bg-gray-100 text-gray-700"
										}`}
									>
										{isOngoing ? (
											<>
												<PlayCircle className="w-3.5 h-3.5 animate-pulse" />
												Явагдаж байна
											</>
										) : (
											<>
												<Trophy className="w-3.5 h-3.5" />
												Дууссан
											</>
										)}
									</Badge>
								</div>
							</div>
						</div>
					</div>

					{/* Score Display */}
					{!isOngoing && (
						<div className="relative">
							<div
								className={`relative shrink-0 w-20 h-20 rounded-xl transition-all duration-300 group-hover:scale-105 ${
									showScore ? `bg-linear-to-br ` : ""
								}`}
							>
								<div className="absolute inset-0 flex flex-col items-center justify-center">
									<div
										className={`text-2xl font-black leading-none transition-all duration-300 ${
											showScore
												? "text-white"
												: "text-gray-400 blur-md select-none"
										}`}
									>
										{score}
									</div>

									<div
										className={`text-[10px] font-medium mt-1 transition-opacity duration-300 ${
											showScore ? "opacity-80 text-white" : "opacity-0"
										}`}
									>
										{config.label}
									</div>
								</div>
							</div>
							<Button
								onClick={() => setLocalShowScore(!localShowScore)}
								size="icon"
								variant="outline"
								className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full hover:scale-110 transition-transform duration-200 hover:border-blue-400 bg-white"
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
				{/* Score Details - Only for finished exams when score is shown */}
				{!isOngoing && showScore && (
					<div
						className={`p-4 rounded-xl ${config.bg} border-2 ${config.border}`}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3 text-sm text-gray-600">
								<div className="flex items-center gap-1">
									<Target className="w-4 h-4 text-green-600" />
									<span className="font-semibold text-green-700">
										{exam.correct_ttl}
									</span>
								</div>
								<span className="text-gray-400">•</span>
								<div className="flex items-center gap-1">
									<span className="w-4 h-4 flex items-center justify-center text-red-600 font-bold">
										✕
									</span>
									<span className="font-semibold text-red-700">
										{exam.wrong_ttl}
									</span>
								</div>
								<span className="text-gray-400">•</span>
								<span className="text-gray-500">Нийт: {exam.test_ttl}</span>
							</div>
							<TrendingUp className={`w-6 h-6 ${config.text} opacity-40`} />
						</div>
					</div>
				)}

				{/* Exam Duration */}
				{exam.exam_minute > 0 && (
					<div className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50/30">
						<div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
							<Clock className="w-4 h-4 text-blue-600" />
							<span>Үргэлжлэх хугацаа</span>
						</div>
						<span className="text-lg font-bold text-gray-900">
							{exam.exam_minute} минут
						</span>
					</div>
				)}

				{/* Time Spent */}
				{!isOngoing && exam.test_time && (
					<div className="flex items-center justify-between text-sm px-1">
						<span className="font-medium ">Зарцуулсан хугацаа:</span>
						<span className=" font-bold">{exam.test_time}</span>
					</div>
				)}

				{/* Action Buttons */}
				{isOngoing ? (
					<Button
						variant="outline"
						className="w-full bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600 shadow-amber-200 font-semibold"
					>
						⚡ Үргэлжлүүлэх
						<ArrowRight className="w-4 h-4 ml-2" />
					</Button>
				) : (
					<Button
						onClick={handleDetailsClick}
						variant="outline"
						className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 border-0 font-semibold shadow-lg"
					>
						<FileText className="w-4 h-4 mr-2" />
						Дэлгэрэнгүй үзэх
						<ArrowRight className="w-4 h-4 ml-2" />
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

export default ExamResultCard;
