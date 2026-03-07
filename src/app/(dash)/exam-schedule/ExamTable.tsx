"use client";

import { format } from "date-fns";
import {
	CalendarDays,
	ChevronDown,
	ChevronRight,
	Clock,
	Download,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Exam } from "@/types/dashboard/exam.types";

interface ExamTableProps {
	data: Exam[];
	isLoading?: boolean;
	onFetchData?: () => void;
}

export function ExamTable({ data, isLoading, onFetchData }: ExamTableProps) {
	const route = useRouter();
	const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

	const toggleRow = (id: number) => {
		setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	useEffect(() => {
		if (data.length > 0) {
			const allExpanded = data.reduce(
				(acc, exam) => {
					acc[exam.id] = true;
					return acc;
				},
				{} as Record<number, boolean>,
			);
			setExpandedRows(allExpanded);
		}
	}, [data]);

	return (
		<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full">
			<div className="relative flex-1 overflow-hidden flex flex-col">
				<ScrollArea className="h-full">
					<Table>
						<TableHeader className="bg-muted/80 sticky top-0 z-20 backdrop-blur-md shadow-sm">
							<TableRow className="hover:bg-transparent border-b border-border">
								<TableHead className="w-12.5"></TableHead>
								<TableHead className="font-semibold text-foreground text-sm  tracking-wider h-11">
									Шалгалтын нэр
								</TableHead>
								<TableHead className="font-semibold text-foreground text-sm  tracking-wider text-center h-11">
									Хугацаа
								</TableHead>
								<TableHead className="font-semibold text-foreground text-sm  tracking-wider h-11 leading-4">
									Бүртгэл эхлэх / дуусах <br /> огноо
								</TableHead>

								<TableHead className="font-semibold text-foreground text-sm  tracking-wider h-11 leading-4">
									Даалгаврын сан <br /> нээгдэх огноо
								</TableHead>
								<TableHead className="text-right font-semibold text-foreground text-sm  tracking-wider h-11 pr-6">
									Шалгалтын хуваарь
								</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody className="border-0">
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={6} className="h-60 text-center">
										<div className="flex flex-col items-center justify-center gap-3">
											<Loader2 className="h-7 w-7 animate-spin text-primary" />
											<p className="text-xs font-medium text-muted-foreground">
												Ачаалж байна...
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : data.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="h-60 text-center">
										<div className="flex flex-col items-center justify-center gap-4 py-10">
											<div className="rounded-full bg-primary/5 p-6 mb-4 ring-8 ring-primary/2">
												<Download className="h-8 w-8 text-muted-foreground/40" />
											</div>
											<div className="space-y-1">
												<h3 className="text-xl font-bold tracking-tight">
													Жагсаалт хоосон байна
												</h3>
												<Button
													onClick={onFetchData}
													variant="outline"
													className="mt-6 gap-2 rounded-full px-6 shadow-sm"
												>
													<Download size={14} /> Хуваарь татах
												</Button>
											</div>
										</div>
									</TableCell>
								</TableRow>
							) : (
								data.map((exam) => (
									<React.Fragment key={exam.id}>
										<TableRow
											className={`group cursor-pointer transition-all border-b border-border/40 ${
												expandedRows[exam.id]
													? "bg-primary/5"
													: "hover:bg-muted/40"
											}`}
											onClick={() => toggleRow(exam.id)}
										>
											<TableCell className="py-3">
												<div className="flex justify-center">
													{expandedRows[exam.id] ? (
														<ChevronDown size={16} className="text-primary" />
													) : (
														<ChevronRight
															size={16}
															className="text-muted-foreground"
														/>
													)}
												</div>
											</TableCell>
											<TableCell className="font-bold text-[13px] text-foreground py-3">
												{exam.name}
											</TableCell>
											<TableCell className="text-center py-3">
												<Badge
													variant="outline"
													className="font-bold bg-background text-[10px] py-0 h-7 px-2 border-border/60 border"
												>
													<Clock size={10} className="mr-1 text-primary" />
													{exam.duration} мин
												</Badge>
											</TableCell>
											<TableCell className="py-3 flex gap-2 items-center">
												<div className="flex flex-col">
													<span className="font-semibold text-foreground text-[12px]">
														{format(
															new Date(exam.register_start_date),
															"yyyy.MM.dd",
														)}
													</span>
													<span className="text-[10px] text-muted-foreground uppercase leading-none">
														{format(
															new Date(exam.register_start_date),
															"HH:mm",
														)}
													</span>
												</div>
												-
												<div className="flex flex-col">
													<span className="font-semibold text-foreground text-[12px]">
														{format(
															new Date(exam.register_end_date),
															"yyyy.MM.dd",
														)}
													</span>
													<span className="text-[10px] text-muted-foreground uppercase leading-none">
														{format(new Date(exam.register_end_date), "HH:mm")}
													</span>
												</div>
											</TableCell>

											<TableCell className="py-3">
												<div className="flex flex-col">
													<span className="font-semibold text-foreground text-[12px]">
														{format(
															new Date(exam.item_open_date),
															"yyyy.MM.dd",
														)}
													</span>
													<span className="text-[10px] text-muted-foreground uppercase leading-none">
														{format(new Date(exam.item_open_date), "HH:mm")}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-right py-3 pr-6">
												<Badge
													variant="secondary"
													className="px-2 py-0 h-5 text-[10px] font-bold bg-primary/10 text-primary border-none"
												>
													{exam.exam_dates.length} хуваарь
												</Badge>
											</TableCell>
										</TableRow>

										{expandedRows[exam.id] && (
											<TableRow className="bg-muted/5 border-none">
												<TableCell colSpan={6} className="p-0 border-none">
													<div className="px-8 py-4 border-l-3 border-muted bg-background/40 ml-3 my-1 rounded-r-xl animate-in fade-in slide-in-from-top-1 duration-200">
														<div className="flex items-center gap-2 mb-3">
															<CalendarDays
																size={14}
																className="text-primary"
															/>
															<h4 className="text-[11px] font-black text-foreground uppercase tracking-wider">
																Шалгалтын цагийн хуваарь
															</h4>
														</div>
														<div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
															<Table>
																<TableHeader className="bg-muted/30">
																	<TableRow className="h-8 hover:bg-transparent border-b border-border/50">
																		<TableHead className="text-[9px] font-bold uppercase  h-8 pl-4 ">
																			Эхлэх цаг
																		</TableHead>
																		<TableHead className="text-[9px] font-bold uppercase  h-8 px-4">
																			Дуусах цаг
																		</TableHead>
																		<TableHead className="text-[9px] font-bold uppercase  h-8 text-right">
																			Үйлдэл
																		</TableHead>
																	</TableRow>
																</TableHeader>
																<TableBody>
																	{exam.exam_dates.map((date) => (
																		<TableRow
																			key={date.id}
																			className="h-10 hover:bg-primary/5 border-b border-border/30 last:border-0"
																			onClick={() => {
																				route.push(
																					`/exam-schedule/${date.exam_date_id}-${date.exam_id}`,
																				);
																			}}
																		>
																			<TableCell className="py-1 pl-4">
																				<div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-lg bg-background border border-border/60">
																					<span className="text-[11px] font-medium">
																						{format(
																							new Date(date.start_date),
																							"yyyy.MM.dd",
																						)}
																					</span>
																					<span className="text-[11px] font-bold text-primary border-l pl-2 border-border/60">
																						{format(
																							new Date(date.start_date),
																							"HH:mm",
																						)}
																					</span>
																				</div>
																			</TableCell>
																			<TableCell className="py-1 ">
																				<div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-lg  bg-background border border-border/60">
																					<span className="text-[11px] font-medium">
																						{format(
																							new Date(date.end_date),
																							"yyyy.MM.dd",
																						)}
																					</span>
																					<span className="text-[11px] font-bold ml-1">
																						{format(
																							new Date(date.end_date),
																							"HH:mm",
																						)}
																					</span>
																				</div>
																			</TableCell>
																			<TableCell className="py-1   items-center w-full">
																				<div className="flex justify-end ">
																					<Button
																						asChild
																						size={"xs"}
																						variant={"outline"}
																					>
																						<Link
																							href={`/exam-schedule/${date.exam_date_id}-${date.exam_id}`}
																						>
																							Дэлгэрэнгүй
																						</Link>
																					</Button>
																				</div>
																			</TableCell>
																		</TableRow>
																	))}
																</TableBody>
															</Table>
														</div>
													</div>
												</TableCell>
											</TableRow>
										)}
									</React.Fragment>
								))
							)}
						</TableBody>
					</Table>
				</ScrollArea>
			</div>
		</div>
	);
}
