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
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ExamresultListCardProps } from "@/types/exam/examResultList";

interface ExamListItemProps extends ExamresultListCardProps {
	onViewRank?: (examId: number) => void;
}

export const ExamListItem: React.FC<ExamListItemProps> = ({
	exam,
	onViewRank,
}) => {
	const router = useRouter();

	const finished = exam.isfinished === 1;
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

	const handleRowClick = () => {
		if (finished) {
			const url = `/examResult/${exam.exam_id}_${exam.test_id}`;
			router.push(url);
		}
	};

	const handleDetailsClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		handleRowClick();
	};

	const handleRankClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onViewRank && finished) {
			onViewRank(exam.exam_id);
		}
	};

	return (
		<Card
			className={`transition-all duration-200 ${
				finished
					? "hover:shadow-md cursor-pointer"
					: "opacity-60 cursor-not-allowed"
			}`}
			onClick={finished ? handleRowClick : undefined}
		>
			<CardHeader className="pb-2 pt-4 px-4">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2.5">
						<div
							className={`w-9 h-9 rounded-lg flex items-center justify-center ${
								finished
									? "bg-primary/10 text-primary"
									: "bg-muted text-muted-foreground"
							}`}
						>
							{finished ? (
								<CheckCircle className="w-4.5 h-4.5" />
							) : (
								<XCircle className="w-4.5 h-4.5" />
							)}
						</div>
						<div>
							<CardTitle className="text-sm leading-tight">
								{exam.title}
							</CardTitle>
							<CardDescription className="text-xs mt-0.5">
								<Badge
									variant={finished ? "default" : "secondary"}
									className="text-xs h-4 px-1.5"
								>
									{finished ? "Дууссан" : "Дуусаагүй"}
								</Badge>
							</CardDescription>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-2 px-4 pb-3">
				{/* Info Grid */}
				<div className="grid grid-cols-2 gap-1.5 text-xs">
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Calendar className="w-3 h-3" />
						<span className="truncate">{formatDate(examDate)}</span>
					</div>

					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Clock className="w-3 h-3" />
						<span>{formatTime(examDate)}</span>
					</div>

					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Target className="w-3 h-3" />
						<span>{exam.exam_minute} мин</span>
					</div>

					{exam.test_time && finished && (
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<Clock className="w-3 h-3" />
							<span>{exam.test_time}</span>
						</div>
					)}
				</div>

				{/* Action Buttons */}
				{finished && (
					<div className="flex items-center gap-2 pt-1.5">
						<Button
							size="sm"
							variant="default"
							className="flex-1 h-7 text-xs"
							onClick={handleDetailsClick}
						>
							<span>Дэлгэрэнгүй</span>
							<ArrowRight className="w-3 h-3 ml-1" />
						</Button>

						{onViewRank && (
							<Button
								size="sm"
								variant="outline"
								className="h-7 text-xs px-2.5"
								onClick={handleRankClick}
							>
								<BarChart3 className="w-3 h-3 mr-1" />
								Rank
							</Button>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
