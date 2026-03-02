"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BookOpen, CalendarClock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { getExam } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Exam, ExamDate } from "@/types/dashboard/exam.types";

// Сонгогдсон шалгалтын төрөл
export interface SelectedExam {
	uiId: string; // RadioGroup-д ашиглах date.id
	examId: number; // exam.id
	examDateId: number; // exam_date_id (ESIS)
}

interface ExamSelectorProps {
	selectedExamDateId: string | null;
	onSelect: (exam: SelectedExam) => void;
}

export function ExamSelector({
	selectedExamDateId,
	onSelect,
}: ExamSelectorProps) {
	const { userId } = useAuthStore();

	const { data: exams = [], isLoading } = useQuery({
		queryKey: ["get_exam"],
		queryFn: () => getExam({ userId: userId ? Number(userId) : 0 }),
		enabled: !!userId,
		select: (res) => res.RetData || [],
	});

	// Сонголт хийх үед exam_date_id болон exam_id-г олох логик
	const handleValueChange = (dateIdStr: string) => {
		const dateId = Number(dateIdStr);
		for (const exam of exams) {
			const foundDate = exam.exam_dates.find((d) => d.id === dateId);
			if (foundDate) {
				onSelect({
					uiId: dateIdStr, // RadioGroup-ийн сонголтыг идэвхжүүлнэ
					examId: exam.exam_id,
					examDateId: foundDate.exam_date_id,
				});
				break;
			}
		}
	};

	return (
		<div className="h-full p-4 overflow-y-auto overflow-x-hidden">
			{isLoading ? (
				<div className="space-y-4 p-1">
					{[1, 2, 3].map((i) => (
						<div key={i} className="space-y-3">
							<Skeleton className="h-6 w-3/4" />
							<div className="pl-6 space-y-2">
								<Skeleton className="h-12 w-full rounded-lg" />
							</div>
						</div>
					))}
				</div>
			) : exams.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
					<BookOpen size={32} className="mb-2 opacity-20" />
					<p className="text-sm italic">Шалгалт олдсонгүй</p>
				</div>
			) : (
				<div className="space-y-6">
					{exams.map((exam: Exam) => (
						<div key={exam.id} className="space-y-3">
							<div className="flex items-center gap-2 px-1">
								<h3 className="font-bold text-[13px] uppercase tracking-tight text-foreground/80">
									{exam.name}
								</h3>
								<Badge variant="outline" className="text-[10px] ml-auto h-5">
									{exam.duration} мин
								</Badge>
							</div>

							<RadioGroup
								value={selectedExamDateId || ""}
								onValueChange={handleValueChange}
								className="pl-4 space-y-2 border-l-2 border-muted ml-2"
							>
								{exam.exam_dates.map((date: ExamDate) => (
									<Label
										key={date.id}
										htmlFor={`date-${date.id}`}
										className={`relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
											selectedExamDateId === String(date.id)
												? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
												: "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
										}`}
									>
										<div className="flex items-center gap-3">
											<RadioGroupItem
												value={String(date.id)}
												id={`date-${date.id}`}
											/>
											<div className="flex flex-col gap-0.5">
												<div className="flex items-center gap-2 font-bold text-xs">
													<CalendarClock size={13} className="text-primary" />
													{format(new Date(date.start_date), "yyyy.MM.dd")}
												</div>
												<div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
													<Clock size={12} />
													<span>
														{format(new Date(date.start_date), "HH:mm")} -{" "}
														{format(new Date(date.end_date), "HH:mm")}
													</span>
												</div>
											</div>
										</div>
										{selectedExamDateId === String(date.id) && (
											<Badge className="bg-primary text-[9px] h-4 px-1.5 uppercase font-black">
												Сонгосон
											</Badge>
										)}
									</Label>
								))}
							</RadioGroup>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
