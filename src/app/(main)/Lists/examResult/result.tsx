"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Award,
	CheckCircle2,
	FileText,
	Target,
	TrendingUp,
	XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getExamResults } from "@/lib/api";
import type { ExamResultsResponse } from "@/types/exam/examResult";

interface ExamAnswersDialogProps {
	examId: number;
	testId: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function ExamAnswersDialog({
	testId,
	open,
	onOpenChange,
}: ExamAnswersDialogProps) {
	const { data, isLoading, isError, error } = useQuery<ExamResultsResponse>({
		queryKey: ["examResults", testId],
		queryFn: () => getExamResults(testId),
		enabled: open && !!testId,
	});

	const result = data?.RetData?.[0];
	const isPassed = result && result.point_perc >= 60;

	const getGradeColor = (grade: string) => {
		switch (grade) {
			case "A":
			case "A+":
			case "A-":
				return "text-green-600 dark:text-green-400";
			case "B":
			case "B+":
			case "B-":
				return "text-blue-600 dark:text-blue-400";
			case "C":
			case "C+":
			case "C-":
				return "text-yellow-600 dark:text-yellow-400";
			case "D":
				return "text-orange-600 dark:text-orange-400";
			case "F":
				return "text-red-600 dark:text-red-400";
			default:
				return "text-gray-600 dark:text-gray-400";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
				{/* Header */}
				<DialogHeader className="border-b px-6 py-4">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-xl font-bold flex items-center gap-2">
							<FileText className="w-5 h-5" />
							Шалгалтын үр дүн
						</DialogTitle>
					</div>
					{result && (
						<p className="text-sm text-muted-foreground">{result.title}</p>
					)}
				</DialogHeader>

				<ScrollArea className="h-[calc(90vh-80px)]">
					<div className="p-6">
						{isLoading ? (
							<div className="space-y-4">
								<Skeleton className="h-40 w-40 rounded-full mx-auto" />
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{[...Array(4).keys()].map((i) => (
										<Skeleton key={`stat-${i}`} className="h-24" />
									))}
								</div>
								<Skeleton className="h-48" />
							</div>
						) : isError ? (
							<Alert variant="destructive">
								<AlertCircle className="w-4 h-4" />
								<AlertDescription>{(error as Error).message}</AlertDescription>
							</Alert>
						) : !result ? (
							<div className="text-center py-12">
								<FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
								<p className="text-muted-foreground">Үр дүн олдсонгүй</p>
							</div>
						) : (
							<div className="space-y-6">
								{/* Grade Display */}
								<div className="flex justify-center py-6">
									<div className="text-center">
										<div
											className={`text-8xl font-black mb-2 ${getGradeColor(
												result.unelgee,
											)}`}
										>
											{result.unelgee}
										</div>
										<Badge variant={isPassed ? "default" : "destructive"}>
											{isPassed ? "Тэнцсэн" : "Тэнцээгүй"}
										</Badge>
									</div>
								</div>

								{/* Stats Grid */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<Card>
										<CardContent className="p-4 text-center">
											<Award className="w-6 h-6 mx-auto mb-2 text-primary" />
											<div className="text-2xl font-bold">{result.point}</div>
											<div className="text-xs text-muted-foreground">
												Авсан оноо
											</div>
											<div className="text-xs text-muted-foreground">
												/ {result.ttl_point}
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardContent className="p-4 text-center">
											<Target className="w-6 h-6 mx-auto mb-2 text-purple-600" />
											<div className="text-2xl font-bold">
												{result.point_perc?.toFixed(1)}%
											</div>
											<div className="text-xs text-muted-foreground">
												Амжилт
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardContent className="p-4 text-center">
											<CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
											<div className="text-2xl font-bold">
												{result.correct_ttl}
											</div>
											<div className="text-xs text-muted-foreground">
												Зөв хариулт
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardContent className="p-4 text-center">
											<XCircle className="w-6 h-6 mx-auto mb-2 text-red-600" />
											<div className="text-2xl font-bold">
												{result.wrong_ttl}
											</div>
											<div className="text-xs text-muted-foreground">
												Буруу хариулт
											</div>
										</CardContent>
									</Card>
								</div>

								<Separator />

								{/* Performance Analysis */}
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="text-base flex items-center gap-2">
											<TrendingUp className="w-4 h-4" />
											Дэлгэрэнгүй үр дүн
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										{/* Total Score */}
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground flex items-center gap-2">
													<Award className="w-4 h-4" />
													Нийт оноо
												</span>
												<Badge variant="secondary">
													{result.point} / {result.ttl_point}
												</Badge>
											</div>
											<Progress
												value={(result.point / result.ttl_point) * 100}
												className="h-2"
											/>
										</div>

										{/* Correct Answers */}
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground flex items-center gap-2">
													<CheckCircle2 className="w-4 h-4 text-green-600" />
													Зөв хариулт
												</span>
												<Badge variant="outline" className="text-green-600">
													{result.correct_ttl} / {result.test_ttl} (
													{Math.round(
														(result.correct_ttl / result.test_ttl) * 100,
													)}
													%)
												</Badge>
											</div>
											<Progress
												value={(result.correct_ttl / result.test_ttl) * 100}
												className="h-2"
											/>
										</div>

										{/* Wrong Answers */}
										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-sm text-muted-foreground flex items-center gap-2">
													<XCircle className="w-4 h-4 text-red-600" />
													Буруу хариулт
												</span>
												<Badge variant="outline" className="text-red-600">
													{result.wrong_ttl} / {result.test_ttl} (
													{Math.round(
														(result.wrong_ttl / result.test_ttl) * 100,
													)}
													%)
												</Badge>
											</div>
											<Progress
												value={(result.wrong_ttl / result.test_ttl) * 100}
												className="h-2"
											/>
										</div>

										{/* Not Answered */}
										{result.not_answer > 0 && (
											<div className="space-y-2">
												<div className="flex justify-between items-center">
													<span className="text-sm text-muted-foreground flex items-center gap-2">
														<AlertCircle className="w-4 h-4 text-orange-600" />
														Хариулаагүй
													</span>
													<Badge variant="outline" className="text-orange-600">
														{result.not_answer} / {result.test_ttl} (
														{Math.round(
															(result.not_answer / result.test_ttl) * 100,
														)}
														%)
													</Badge>
												</div>
												<Progress
													value={(result.not_answer / result.test_ttl) * 100}
													className="h-2"
												/>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Additional Info */}
							</div>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
