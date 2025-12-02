"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Award,
	CheckCircle,
	Eye,
	EyeOff,
	FileQuestion,
	TrendingUp,
	Trophy,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getexamresultlists } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamresultListResponseType } from "@/types/exam/examResultList";

import { ExamListItem } from "./card";
import RankModal from "./rank";

export default function ExamResultList() {
	const { userId } = useAuthStore();
	const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
	const [showStats, setShowStats] = useState(true);

	const { data } = useQuery<ExamresultListResponseType>({
		queryKey: ["examResults", userId],
		queryFn: () => getexamresultlists(userId || 0),
		enabled: !!userId,
	});

	const isResponseFailed =
		!data?.RetResponse?.ResponseType || data?.RetData === null;
	const exams = data?.RetData || [];

	if (isResponseFailed || exams.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Alert className="max-w-md">
					<div className="flex flex-col items-center text-center space-y-4 py-4">
						<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
							<FileQuestion className="w-10 h-10 text-primary" />
						</div>
						<AlertDescription className="space-y-4">
							<div>
								<h3 className="text-2xl font-bold text-foreground mb-3">
									Шалгалтын үр дүн олдсонгүй
								</h3>
								<p className="text-muted-foreground">
									Одоогоор дууссан шалгалт байхгүй байна.
								</p>
								{data?.RetResponse?.ResponseMessage && (
									<p className="text-sm text-muted-foreground italic mt-2">
										{data.RetResponse.ResponseMessage}
									</p>
								)}
							</div>
							<p className="text-sm text-muted-foreground">
								Та эхлээд шалгалт өгснөөр энд үр дүн харагдах болно.
							</p>
						</AlertDescription>
					</div>
				</Alert>
			</div>
		);
	}

	const finishedExams = exams.filter((e) => e.isfinished === 0);
	const avgScore =
		finishedExams.length > 0
			? Math.round(
					finishedExams.reduce((sum, e) => sum + e.test_perc, 0) /
						finishedExams.length,
				)
			: 0;
	const highScore =
		finishedExams.length > 0
			? Math.max(...finishedExams.map((e) => e.test_perc))
			: 0;

	return (
		<>
			<div className="min-h-screen bg-page-gradient py-8 px-4">
				<div className="max-w-7xl mx-auto space-y-8">
					{/* Header Section */}
					<div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
						<Badge variant="secondary" className="gap-2">
							<Trophy className="w-4 h-4" />
							Шалгалтын үр дүн
						</Badge>
						<h1 className="text-4xl md:text-5xl font-black text-foreground">
							Миний үр дүнгүүд
						</h1>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Таны өгсөн бүх шалгалтын дэлгэрэнгүй үр дүн болон статистик
						</p>
					</div>

					{/* Stats Grid with Toggle */}
					{finishedExams.length > 0 && (
						<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
							<div className="flex justify-end">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowStats(!showStats)}
									className="gap-2"
								>
									{showStats ? (
										<>
											<EyeOff className="w-4 h-4" />
											Оноо нуух
										</>
									) : (
										<>
											<Eye className="w-4 h-4" />
											Оноо харуулах
										</>
									)}
								</Button>
							</div>

							{showStats && (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<Card>
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="p-3 bg-primary/10 rounded-xl">
													<CheckCircle className="w-6 h-6 text-primary" />
												</div>
												<div className="text-4xl font-black text-foreground">
													{finishedExams.length}
												</div>
											</div>
											<div className="text-muted-foreground text-sm font-semibold">
												Дууссан шалгалт
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="p-3 bg-primary/10 rounded-xl">
													<TrendingUp className="w-6 h-6 text-primary" />
												</div>
												<div className="text-4xl font-black text-foreground">
													{avgScore}%
												</div>
											</div>
											<div className="text-muted-foreground text-sm font-semibold">
												Дундаж үр дүн
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="p-3 bg-primary/10 rounded-xl">
													<Award className="w-6 h-6 text-primary" />
												</div>
												<div className="text-4xl font-black text-foreground">
													{highScore}%
												</div>
											</div>
											<div className="text-muted-foreground text-sm font-semibold">
												Хамгийн өндөр оноо
											</div>
										</CardContent>
									</Card>
								</div>
							)}
						</div>
					)}

					{/* Exams List */}
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-2xl font-black text-foreground">
								Бүх шалгалтууд
							</h2>
							<Badge variant="secondary">{exams.length} шалгалт</Badge>
						</div>

						<CardContent className="space-y-4">
							{exams.map((exam, index) => (
								<div
									key={exam.exam_id}
									className="animate-in fade-in-0 slide-in-from-bottom-2"
									style={{ animationDelay: `${index * 50}ms` }}
								>
									<ExamListItem exam={exam} onViewRank={setSelectedExamId} />
								</div>
							))}
						</CardContent>
					</div>
				</div>
			</div>

			{/* Rank Modal */}
			{selectedExamId && userId && (
				<RankModal
					examId={selectedExamId}
					userId={userId}
					onClose={() => setSelectedExamId(null)}
				/>
			)}
		</>
	);
}
