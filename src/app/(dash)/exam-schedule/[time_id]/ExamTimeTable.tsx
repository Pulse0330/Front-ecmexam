"use client";

import {
	ChevronDown,
	ChevronRight,
	Database,
	Loader2,
	Monitor,
	UserCheck,
	Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { StudentSeat } from "@/types/dashboard/exam.types";

// Өгөгдлийн төрөл тодорхойлох

interface ExamRoom {
	exam_room_id: number;
	room_number: string;
	num_of_pc: number;
	assigned_seats: number;
	total_students: number;
	students: StudentSeat[];
}

interface ExamRoomTableProps {
	data: ExamRoom[];
	isLoading?: boolean;
}

export function ExamTimeTable({ data, isLoading }: ExamRoomTableProps) {
	const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

	const toggleRow = (id: number) => {
		setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	// Анх ачаалахад бүх өрөөг дэлгэсэн байх
	useEffect(() => {
		if (data && data.length > 0) {
			const allExpanded = data.reduce(
				(acc, room) => {
					acc[room.exam_room_id] = true;
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
								<TableHead className="w-[50px]"></TableHead>
								<TableHead className="font-bold text-foreground text-[11px] uppercase tracking-wider h-11">
									Өрөөний дугаар
								</TableHead>
								<TableHead className="font-bold text-foreground text-[11px] uppercase tracking-wider text-center h-11">
									Нийт PC
								</TableHead>
								<TableHead className="font-bold text-foreground text-[11px] uppercase tracking-wider text-center h-11">
									Хуваарилагдсан
								</TableHead>
								<TableHead className="text-right font-bold text-foreground text-[11px] uppercase tracking-wider h-11 pr-6">
									Нийт сурагч
								</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody className="border-0">
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={5} className="h-60 text-center">
										<div className="flex flex-col items-center justify-center gap-3">
											<Loader2 className="h-7 w-7 animate-spin text-primary" />
											<p className="text-xs font-medium text-muted-foreground">
												Ачаалж байна...
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : !data || data.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="h-60 text-center">
										<div className="flex flex-col items-center justify-center gap-4 py-10 text-muted-foreground">
											<Database size={32} strokeWidth={1} />
											<p className="text-sm font-bold">Мэдээлэл олдсонгүй</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								data.map((room) => (
									<React.Fragment key={room.exam_room_id}>
										<TableRow
											className={`group cursor-pointer transition-all border-b border-border/40 ${
												expandedRows[room.exam_room_id]
													? "bg-primary/5"
													: "hover:bg-muted/40"
											}`}
											onClick={() => toggleRow(room.exam_room_id)}
										>
											<TableCell className="py-3 text-center">
												{expandedRows[room.exam_room_id] ? (
													<ChevronDown
														size={16}
														className="text-primary inline"
													/>
												) : (
													<ChevronRight
														size={16}
														className="text-muted-foreground inline"
													/>
												)}
											</TableCell>
											<TableCell className="font-black text-[14px] text-foreground py-3">
												{room.room_number}-р өрөө
											</TableCell>
											<TableCell className="text-center py-3">
												<Badge
													variant="outline"
													className="font-bold text-[10px] h-5"
												>
													<Monitor size={10} className="mr-1 text-primary" />
													{room.num_of_pc}
												</Badge>
											</TableCell>
											<TableCell className="text-center py-3">
												<Badge
													variant="secondary"
													className="font-bold text-[10px] h-5 bg-green-50 text-green-600 border-none"
												>
													<UserCheck size={10} className="mr-1" />
													{room.assigned_seats}
												</Badge>
											</TableCell>
											<TableCell className="text-right py-3 pr-6 font-bold text-primary">
												{room.total_students} сурагч
											</TableCell>
										</TableRow>

										{expandedRows[room.exam_room_id] && (
											<TableRow className="bg-muted/5 border-none">
												<TableCell colSpan={5} className="p-0 border-none">
													<div className="px-6 py-4 border-l-4 border-primary/20 bg-background/40 ml-4 my-2 rounded-r-xl shadow-inner">
														<div className="flex items-center gap-2 mb-3">
															<Users size={14} className="text-primary" />
															<h4 className="text-[11px] font-black text-foreground uppercase tracking-widest">
																Сурагчдын жагсаалт
															</h4>
														</div>
														<div className="rounded-lg border border-border bg-card overflow-hidden">
															<Table>
																<TableHeader className="bg-muted/30">
																	<TableRow className="h-8 hover:bg-transparent">
																		<TableHead className="text-[9px] font-bold uppercase pl-4">
																			Суудлын №
																		</TableHead>
																		<TableHead className="text-[9px] font-bold uppercase">
																			Овог нэр
																		</TableHead>
																		<TableHead className="text-[9px] font-bold uppercase">
																			Бүртгэлийн №
																		</TableHead>
																		<TableHead className="text-[9px] font-bold uppercase">
																			Анги
																		</TableHead>
																		<TableHead className="text-[9px] font-bold uppercase text-right pr-4">
																			Төлөв
																		</TableHead>
																	</TableRow>
																</TableHeader>
																<TableBody>
																	{room.students.map((student) => (
																		<TableRow
																			key={student.id}
																			className="h-10 hover:bg-primary/5 last:border-0"
																		>
																			<TableCell className="py-1 pl-4 font-mono font-bold text-primary text-[11px]">
																				{student.seat_number}
																			</TableCell>
																			<TableCell className="py-1">
																				<div className="flex flex-col">
																					<span className="text-[12px] font-bold">
																						{student.last_name
																							? student.last_name[0]
																							: "-"}
																						. {student.first_name}
																					</span>
																					<span className="text-[9px] text-muted-foreground">
																						{student.register_number}
																					</span>
																				</div>
																			</TableCell>
																			<TableCell className="py-1 text-[11px] font-medium">
																				{student.examinee_number
																					? student.examinee_number
																					: "-"}
																			</TableCell>
																			<TableCell className="py-1">
																				<Badge
																					variant="outline"
																					className="text-[9px] h-4 py-0"
																				>
																					{student.studentgroupname}
																				</Badge>
																			</TableCell>
																			<TableCell className="py-1 text-right pr-4">
																				<span className="text-[10px] text-muted-foreground italic">
																					{student.status_text}
																				</span>
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
