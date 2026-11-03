"use client";

import {
	AlertCircle,
	BookOpen,
	CheckCircle2,
	Clock,
	FileText,
	Loader2,
	PlayCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
		<article className="rounded-2xl border border-amber-500/30 bg-card shadow-sm">
			<header className="space-y-3 border-b p-4 sm:p-6">
				<div className="flex flex-wrap items-center gap-2">
					<span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
						<BookOpen className="size-3.5" />
						Гэрийн даалгавар
					</span>
					<span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
						{getContentIcon(content.l_content_type)}
					</span>
					{content.stu_worked === 1 && (
						<span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
							<CheckCircle2 className="size-3.5" />
							Дууссан
						</span>
					)}
				</div>
				<h2 className="text-lg font-bold leading-snug text-foreground sm:text-xl">
					{content.examname}
				</h2>
			</header>

			<div className="space-y-5 p-4 sm:p-6">
				{/* Exam Info */}
				<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
					{/* Асуултын тоо */}
					{content.testcnt && (
						<div className="rounded-xl bg-muted/50 p-3">
							<div className="flex items-center gap-2">
								<span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<FileText className="size-4" />
								</span>
								<div>
									<p className="text-xs text-muted-foreground">Асуулт</p>
									<p className="text-base font-semibold text-foreground">
										{content.testcnt}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Хугацаа */}
					{content.minut && (
						<div className="rounded-xl bg-muted/50 p-3">
							<div className="flex items-center gap-2">
								<span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<Clock className="size-4" />
								</span>
								<div>
									<p className="text-xs text-muted-foreground">Хугацаа</p>
									<p className="text-base font-semibold text-foreground">
										{content.minut > 0 ? `${content.minut} мин` : "Хугацаагүй"}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Төлөв */}
					<div className="rounded-xl bg-muted/50 p-3">
						<div className="flex items-center gap-2">
							<span
								className={`flex size-9 items-center justify-center rounded-lg ${
									content.stu_worked === 1
										? "bg-green-500/10 text-green-600 dark:text-green-400"
										: "bg-muted text-muted-foreground"
								}`}
							>
								{content.stu_worked === 1 ? (
									<CheckCircle2 className="size-4" />
								) : (
									<AlertCircle className="size-4" />
								)}
							</span>
							<div>
								<p className="text-xs text-muted-foreground">Төлөв</p>
								<p className="text-sm font-semibold text-foreground">
									{content.stu_worked === 1 ? "Хийсэн" : "Хийгээгүй"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Help/Description */}
				{content.help && (
					<div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
						<AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
						<div>
							<p className="mb-1 text-sm font-semibold text-foreground">
								Анхааруулга
							</p>
							<p className="text-sm leading-relaxed text-muted-foreground">
								{content.help}
							</p>
						</div>
					</div>
				)}

				{/* Action Button */}
				{content.stu_worked === 0 ? (
					<Button
						className="h-11 w-full md:w-auto"
						onClick={handleStartExam}
						disabled={isStarting}
					>
						{isStarting ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Ачааллаж байна...
							</>
						) : (
							<>
								<PlayCircle className="size-4" />
								Даалгавар эхлүүлэх
							</>
						)}
					</Button>
				) : (
					<div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
						<CheckCircle2 className="size-6 shrink-0 text-green-600 dark:text-green-400" />
						<div>
							<p className="font-semibold text-green-900 dark:text-green-100">
								Даалгавар хийсэн байна
							</p>
							<p className="text-sm text-green-700 dark:text-green-300">
								Та энэ даалгаврыг амжилттай хийж дууслаа
							</p>
						</div>
					</div>
				)}
			</div>
		</article>
	);
}
