"use client";

import { format } from "date-fns";
import { BookOpen, CalendarClock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import type { Exam1111 } from "@/types/dashboard/exam.types";

interface ExamListItem {
	exam_id: number;
	exam_date_id: number;
	open_date: string;
	exam_number: string;
	duration: number;
	name: string;
	start_date: string;
	end_date: string;
	burtguulsen: number;
}

export interface SelectedExam {
	uiId: string;
	examId: number;
	examDateId: number;
}

// export interface ExamSelectorV2Props {
// 	selectedExamDateId: string | null;
// 	onSelect: (exam: SelectedExam) => void;
// 	data: Exam1111[];
// 	isLoading: boolean;
// }

// export default async function getExamList(
// 	userId: number,
// 	examinee_number: string,
// ): Promise<{ RetData: ExamListItem[] }> {
// 	const res = await fetch("https://backend.skuul.mn/api/list", {
// 		method: "POST",
// 		headers: { "Content-Type": "application/json" },
// 		body: JSON.stringify({
// 			procname: "api_exam_mhl_choose_list",
// 			examinee_number: examinee_number,
// 			userid: userId,
// 			conn: "skuul",
// 		}),
// 	});
// 	return res.json();
// }

// export function ExamSelectorV2({
// 	selectedExamDateId,
// 	onSelect,
// 	data,
// 	isLoading,
// }: ExamSelectorV2Props) {
// 	const handleValueChange = (value: string) => {
// 		const [examIdStr, examDateIdStr] = value.split("-");
// 		onSelect({
// 			uiId: value,
// 			examId: Number(examIdStr),
// 			examDateId: Number(examDateIdStr),
// 		});
// 	};

// 	return (
// 		<div className="h-full p-4 overflow-y-auto overflow-x-hidden">
// 			{isLoading ? (
// 				<div className="space-y-2 p-1">
// 					{[1, 2, 3].map((i) => (
// 						<Skeleton key={i} className="h-16 w-full rounded-xl" />
// 					))}
// 				</div>
// 			) : data.length === 0 ? (
// 				<div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
// 					<BookOpen size={32} className="mb-2 opacity-20" />
// 					<p className="text-sm italic">Шалгалт олдсонгүй</p>
// 				</div>
// 			) : (
// 				<RadioGroup
// 					value={selectedExamDateId || ""}
// 					onValueChange={handleValueChange}
// 					className="space-y-2"
// 				>
// 					{data.map((item: ExamListItem) => {
// 						const uid = `${item.exam_id}-${item.exam_date_id}`;
// 						const isSelected = selectedExamDateId === uid;
// 						return (
// 							<Label
// 								key={uid}
// 								htmlFor={`date-${uid}`}
// 								className={`relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
// 									isSelected
// 										? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
// 										: "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
// 								}`}
// 							>
// 								<div className="flex items-center gap-3">
// 									<RadioGroupItem value={uid} id={`date-${uid}`} />
// 									<div className="flex flex-col gap-0.5">
// 										<span className="font-semibold text-xs">{item.name}</span>
// 										<div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
// 											<CalendarClock size={11} className="text-primary" />
// 											<span>
// 												{format(new Date(item.start_date), "yyyy.MM.dd")}
// 											</span>
// 											<Clock size={11} />
// 											<span>
// 												{format(new Date(item.start_date), "HH:mm")} -{" "}
// 												{format(new Date(item.end_date), "HH:mm")}
// 											</span>
// 											<Badge
// 												variant="outline"
// 												className="text-[10px] h-4 px-1.5"
// 											>
// 												{item.duration} мин
// 											</Badge>
// 										</div>
// 									</div>
// 								</div>
// 								{isSelected && (
// 									<Badge className="bg-primary text-[9px] h-4 px-1.5 uppercase font-black">
// 										Сонгосон
// 									</Badge>
// 								)}
// 							</Label>
// 						);
// 					})}
// 				</RadioGroup>
// 			)}
// 		</div>
// 	);
// }
export interface ExamSelectorV2Props {
	selectedExamDateId: string | null;
	onSelect: (exam: SelectedExam) => void;
	data: Exam1111[];
	isLoading: boolean;
	disabled?: boolean; // ✅ нэмсэн
}

export function ExamSelectorV2({
	selectedExamDateId,
	onSelect,
	data,
	isLoading,
	disabled = false, // ✅ нэмсэн
}: ExamSelectorV2Props) {
	const handleValueChange = (value: string) => {
		if (disabled) return; // ✅ guard
		const [examIdStr, examDateIdStr] = value.split("-");
		onSelect({
			uiId: value,
			examId: Number(examIdStr),
			examDateId: Number(examDateIdStr),
		});
	};

	return (
		<div className="h-full p-4 overflow-y-auto overflow-x-hidden">
			{isLoading ? (
				<div className="space-y-2 p-1">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-16 w-full rounded-xl" />
					))}
				</div>
			) : data.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
					<BookOpen size={32} className="mb-2 opacity-20" />
					<p className="text-sm italic">Шалгалт олдсонгүй</p>
				</div>
			) : (
				<div
					className={`space-y-2 ${disabled ? "pointer-events-none opacity-70" : ""}`}
				>
					{data.map((item: ExamListItem) => {
						const uid = `${item.exam_id}-${item.exam_date_id}`;
						const isSelected = selectedExamDateId === uid;
						return (
							<button
								key={uid}
								type="button"
								onClick={() => handleValueChange(uid)}
								className={`relative flex w-full items-center justify-between p-3 rounded-xl border transition-all text-left
                                ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                                ${
																	isSelected
																		? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
																		: !disabled
																			? "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
																			: "border-border bg-card"
																}
                            `}
							>
								<div className="flex items-center gap-3">
									<div
										className={`aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-colors
                                    ${isSelected ? "border-primary bg-primary" : "border-input bg-transparent"}
                                    ${disabled ? "opacity-50" : ""}
                                `}
									>
										{isSelected && (
											<div className="flex items-center justify-center w-full h-full">
												<div className="size-2 rounded-full bg-white" />
											</div>
										)}
									</div>
									<div className="flex flex-col gap-0.5">
										<span className="font-semibold text-xs">{item.name}</span>
										<div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
											<CalendarClock size={11} className="text-primary" />
											<span>
												{format(new Date(item.start_date), "yyyy.MM.dd")}
											</span>
											<Clock size={11} />
											<span>
												{format(new Date(item.start_date), "HH:mm")} -{" "}
												{format(new Date(item.end_date), "HH:mm")}
											</span>
											<Badge
												variant="outline"
												className="text-[10px] h-4 px-1.5"
											>
												{item.duration} мин
											</Badge>
										</div>
									</div>
								</div>
								{isSelected && (
									<Badge className="bg-primary text-[9px] h-4 px-1.5 uppercase font-black">
										Сонгосон
									</Badge>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
