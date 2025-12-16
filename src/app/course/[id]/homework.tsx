"use client";

import {
	AlertCircle,
	BookOpen,
	CheckCircle2,
	Clock,
	FileText,
	PlayCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentView } from "@/types/course/contentView";

interface HomeworkProps {
	content: ContentView;
	onStartExam?: (examId: number) => void;
}

export function Homework({ content, onStartExam }: HomeworkProps) {
	const [isStarting, setIsStarting] = useState(false);

	const handleStartExam = async () => {
		if (!content.exam_id || !onStartExam) return;

		setIsStarting(true);
		try {
			await onStartExam(content.exam_id);
		} catch (error) {
			console.error("Error starting exam:", error);
		} finally {
			setIsStarting(false);
		}
	};

	const getContentIcon = (type: number) => {
		if (type === 3) return <PlayCircle className="h-5 w-5" />;
		return <FileText className="h-5 w-5" />;
	};

	// Гэрийн даалгавар эсэхийг шалгах
	const isHomework = content.exam_id && content.examname;

	if (!isHomework) return null;

	return (
		<Card className="border-2 border-orange-500/50 bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10 shadow-lg">
			<CardHeader className="pb-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 space-y-3">
						<div className="flex items-center gap-3 flex-wrap">
							<Badge className="bg-gradient-to-r from-orange-600 to-amber-600">
								<BookOpen className="h-3.5 w-3.5 mr-1" />
								Гэрийн даалгавар
							</Badge>
							<div className="p-2 rounded-lg bg-orange-500/10">
								{getContentIcon(content.l_content_type)}
							</div>
						</div>
						<CardTitle className="text-xl md:text-2xl">
							{content.examname}
						</CardTitle>
					</div>
					{content.stu_worked === 1 && (
						<Badge className="bg-green-600 shrink-0">
							<CheckCircle2 className="h-4 w-4 mr-1" />
							Дууссан
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Exam Info */}
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{/* Асуултын тоо */}
					{content.testcnt && (
						<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
							<div className="flex items-center gap-2">
								<div className="p-2 bg-blue-500/10 rounded-lg">
									<FileText className="h-4 w-4 text-blue-600" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground">Асуулт</p>
									<p className="text-lg font-bold">{content.testcnt}</p>
								</div>
							</div>
						</div>
					)}

					{/* Хугацаа */}
					{content.minut && (
						<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
							<div className="flex items-center gap-2">
								<div className="p-2 bg-orange-500/10 rounded-lg">
									<Clock className="h-4 w-4 text-orange-600" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground">Хугацаа</p>
									<p className="text-lg font-bold">
										{content.minut > 0 ? `${content.minut} мин` : "∞"}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Төлөв */}
					<div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50">
						<div className="flex items-center gap-2">
							<div
								className={`p-2 rounded-lg ${
									content.stu_worked === 1
										? "bg-green-500/10"
										: "bg-gray-500/10"
								}`}
							>
								{content.stu_worked === 1 ? (
									<CheckCircle2 className="h-4 w-4 text-green-600" />
								) : (
									<AlertCircle className="h-4 w-4 text-gray-600" />
								)}
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Төлөв</p>
								<p className="text-sm font-bold">
									{content.stu_worked === 1 ? "Хийсэн" : "Хийгээгүй"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Help/Description */}
				{content.help && (
					<div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
							<div>
								<p className="font-semibold text-sm text-blue-700 dark:text-blue-400 mb-1">
									Анхааруулга
								</p>
								<p className="text-sm text-blue-600 dark:text-blue-500 leading-relaxed">
									{content.help}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Action Button */}
				{content.stu_worked === 0 ? (
					<Button
						className="w-full md:w-auto group bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
						onClick={handleStartExam}
						disabled={isStarting}
					>
						{isStarting ? (
							<>
								<Clock className="mr-2 h-4 w-4 animate-spin" />
								Ачааллаж байна...
							</>
						) : (
							<>
								<PlayCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
								Эхлүүлэх
							</>
						)}
					</Button>
				) : (
					<div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
						<div className="p-2 bg-green-500 rounded-full">
							<CheckCircle2 className="h-5 w-5 text-white" />
						</div>
						<div>
							<p className="font-semibold text-green-700 dark:text-green-400">
								Даалгавар хийсэн байна
							</p>
							<p className="text-sm text-green-600 dark:text-green-500">
								Та энэ даалгаврыг амжилттай хийж дууслаа
							</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
