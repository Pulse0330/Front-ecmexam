"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Award,
	Calendar,
	CheckCircle2,
	Clock,
	FileText,
	Sparkles,
	Target,
	TrendingUp,
	X,
	XCircle,
} from "lucide-react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
				return "from-green-500 to-emerald-600 border-green-400";
			case "B":
			case "B+":
			case "B-":
				return "from-blue-500 to-cyan-600 border-blue-400";
			case "C":
			case "C+":
			case "C-":
				return "from-yellow-500 to-orange-500 border-yellow-400";
			case "D":
				return "from-orange-500 to-red-500 border-orange-400";
			case "F":
				return "from-red-500 to-rose-600 border-red-400";
			default:
				return "from-gray-500 to-slate-600 border-gray-400";
		}
	};

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
			onClick={() => onOpenChange(false)}
			onKeyDown={(e) => e.key === "Escape" && onOpenChange(false)}
			role="dialog"
			aria-modal="true"
		>
			<Card
				className="max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border-2"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{/* Header with gradient */}
				<CardHeader className="sticky top-0 bg-linear-to-r from-primary via-primary/90 to-primary p-6 z-10 border-b">
					<div className="flex items-center justify-between text-primary-foreground">
						<div className="flex items-center gap-3">
							<div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
								<FileText className="w-6 h-6" />
							</div>
							<div>
								<h2 className="text-2xl font-black tracking-tight">
									Шалгалтын үр дүн
								</h2>
								<p className="text-sm text-primary-foreground/90 font-medium">
									{result?.title || "Дэлгэрэнгүй мэдээлэл"}
								</p>
							</div>
						</div>
						<Button
							onClick={() => onOpenChange(false)}
							variant="ghost"
							size="icon"
							className="text-primary-foreground hover:bg-white/20 rounded-full h-10 w-10"
						>
							<X className="w-5 h-5" />
						</Button>
					</div>
				</CardHeader>

				<div className="overflow-auto max-h-[calc(90vh-112px)] bg-linear-to-b from-background to-muted/20">
					{isLoading ? (
						<CardContent className="p-12 text-center">
							<UseAnimations
								animation={loading2}
								size={60}
								strokeColor="hsl(var(--primary))"
								loop
								className="mx-auto mb-4"
							/>
							<p className="font-semibold text-muted-foreground">
								Үр дүнг ачааллаж байна...
							</p>
						</CardContent>
					) : isError ? (
						<CardContent className="p-12">
							<Alert variant="destructive" className="max-w-md mx-auto">
								<AlertCircle className="w-5 h-5" />
								<AlertDescription className="ml-2">
									{(error as Error).message}
								</AlertDescription>
							</Alert>
						</CardContent>
					) : !result ? (
						<CardContent className="p-12 text-center">
							<FileText className="w-20 h-20 mx-auto text-muted-foreground mb-4 opacity-50" />
							<p className="text-lg text-muted-foreground font-medium">
								Үр дүн олдсонгүй.
							</p>
						</CardContent>
					) : (
						<CardContent className="p-6 space-y-6">
							{/* Grade Display with gradient and animation */}
							<div className="flex justify-center py-6">
								<div className="relative">
									<div
										className={`absolute inset-0 bg-linear-to-br ${getGradeColor(
											result.unelgee,
										)} opacity-20 blur-2xl rounded-full animate-pulse`}
									/>
									<div
										className={`relative w-40 h-40 rounded-full  flex flex-col items-center justify-center bg-linear-to-br ${getGradeColor(
											result.unelgee,
										)} text-white shadow-2xl`}
									>
										<Sparkles className="w-6 h-6 mb-1 animate-pulse" />
										<span className="text-6xl font-black tracking-tight">
											{result.unelgee}
										</span>
										<span className="text-sm font-semibold opacity-90">
											{isPassed ? "Тэнцсэн" : "Тэнцээгүй"}
										</span>
									</div>
								</div>
							</div>

							{/* Stats Grid with modern cards */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-all">
									<CardContent className="p-4 text-center">
										<Award className="w-8 h-8 mx-auto mb-2 text-primary" />
										<div className="text-3xl font-black text-primary">
											{result.point}
										</div>
										<div className="text-xs text-muted-foreground mt-1 font-medium">
											Авсан оноо
										</div>
										<div className="text-xs text-muted-foreground font-semibold">
											/ {result.ttl_point}
										</div>
									</CardContent>
								</Card>

								<Card className="border-2 border-purple-200 bg-linear-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all">
									<CardContent className="p-4 text-center">
										<Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
										<div className="text-3xl font-black text-purple-600">
											{result.point_perc}%
										</div>
										<div className="text-xs text-muted-foreground mt-1 font-medium">
											Амжилт
										</div>
									</CardContent>
								</Card>

								<Card className="border-2 border-green-300 bg-linear-to-br from-green-50 to-emerald-100 hover:shadow-lg transition-all">
									<CardContent className="p-4 text-center">
										<CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
										<div className="text-3xl font-black text-green-600">
											{result.correct_ttl}
										</div>
										<div className="text-xs text-muted-foreground mt-1 font-medium">
											Зөв хариулт
										</div>
									</CardContent>
								</Card>

								<Card className="border-2 border-red-300 bg-linear-to-br from-red-50 to-rose-100 hover:shadow-lg transition-all">
									<CardContent className="p-4 text-center">
										<XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
										<div className="text-3xl font-black text-red-600">
											{result.wrong_ttl}
										</div>
										<div className="text-xs text-muted-foreground mt-1 font-medium">
											Буруу хариулт
										</div>
									</CardContent>
								</Card>
							</div>

							<Separator className="my-6" />

							{/* Performance Analysis with modern styling */}
							<Card className="border-2 bg-linear-to-br from-muted/30 to-muted/50">
								<CardHeader className="pb-4">
									<CardTitle className="text-lg flex items-center gap-2">
										<TrendingUp className="w-5 h-5 text-primary" />
										<span>Дэлгэрэнгүй үр дүн</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-5">
									{/* Total Score */}
									<div className="space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
												<Award className="w-4 h-4" />
												Нийт оноо
											</span>
											<Badge variant="secondary" className="font-bold">
												{result.point} / {result.ttl_point}
											</Badge>
										</div>
										<Progress
											value={(result.point / result.ttl_point) * 100}
											className="h-3 bg-muted"
										/>
									</div>

									{/* Correct Answers */}
									<div className="space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
												<CheckCircle2 className="w-4 h-4 text-green-600" />
												Зөв хариулт
											</span>
											<Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-bold">
												{result.correct_ttl} / {result.test_ttl} (
												{Math.round(
													(result.correct_ttl / result.test_ttl) * 100,
												)}
												%)
											</Badge>
										</div>
										<Progress
											value={(result.correct_ttl / result.test_ttl) * 100}
											className="h-3 [&>div]:bg-green-600 bg-green-100"
										/>
									</div>

									{/* Wrong Answers */}
									<div className="space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
												<XCircle className="w-4 h-4 text-red-600" />
												Буруу хариулт
											</span>
											<Badge className="bg-red-100 text-red-700 hover:bg-red-100 font-bold">
												{result.wrong_ttl} / {result.test_ttl} (
												{Math.round((result.wrong_ttl / result.test_ttl) * 100)}
												%)
											</Badge>
										</div>
										<Progress
											value={(result.wrong_ttl / result.test_ttl) * 100}
											className="h-3 [&>div]:bg-red-600 bg-red-100"
										/>
									</div>

									{/* Not Answered */}
									{result.not_answer > 0 && (
										<div className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
													<AlertCircle className="w-4 h-4 text-orange-600" />
													Хариулаагүй
												</span>
												<Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-bold">
													{result.not_answer} / {result.test_ttl} (
													{Math.round(
														(result.not_answer / result.test_ttl) * 100,
													)}
													%)
												</Badge>
											</div>
											<Progress
												value={(result.not_answer / result.test_ttl) * 100}
												className="h-3 [&>div]:bg-orange-600 bg-orange-100"
											/>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Summary Alert with modern design */}
							<Alert
								className={`border-2 ${
									isPassed
										? "border-green-500 bg-linear-to-r from-green-50 to-emerald-50"
										: "border-red-500 bg-linear-to-r from-red-50 to-rose-50"
								}`}
							>
								<AlertDescription className="text-center py-2">
									{isPassed ? (
										<div className="space-y-3">
											<div className="text-4xl">🎉</div>
											<p className="font-black text-xl text-green-700">
												Баяр хүргэе! Та шалгалтанд тэнцлээ!
											</p>
											<p className="text-sm text-green-600 font-semibold">
												Таны үр дүн {result.point_perc}% байна. Маш сайн!
											</p>
										</div>
									) : (
										<div className="space-y-3">
											<div className="text-4xl">💪</div>
											<p className="font-black text-xl text-red-700">
												Дахин оролдоорой!
											</p>
											<p className="text-sm text-red-600 font-semibold">
												Таны үр дүн {result.point_perc}%. Та чадна!
											</p>
										</div>
									)}
								</AlertDescription>
							</Alert>

							{/* Additional Info Cards */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Card className="border border-primary/20">
									<CardContent className="p-4 flex items-center gap-3">
										<div className="p-2 bg-primary/10 rounded-lg">
											<Calendar className="w-5 h-5 text-primary" />
										</div>
										<div>
											<p className="text-xs text-muted-foreground font-medium">
												Огноо
											</p>
											<p className="font-bold text-sm">
												{new Date(result.test_date).toLocaleDateString("mn-MN")}
											</p>
										</div>
									</CardContent>
								</Card>

								<Card className="border border-primary/20">
									<CardContent className="p-4 flex items-center gap-3">
										<div className="p-2 bg-primary/10 rounded-lg">
											<Clock className="w-5 h-5 text-primary" />
										</div>
										<div>
											<p className="text-xs text-muted-foreground font-medium">
												Хугацаа
											</p>
											<p className="font-bold text-sm">{result.test_time}</p>
										</div>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					)}
				</div>
			</Card>
		</div>
	);
}
