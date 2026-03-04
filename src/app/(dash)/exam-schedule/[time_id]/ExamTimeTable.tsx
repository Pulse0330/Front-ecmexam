"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getExamRegistrationSend } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamInfoItem, StudentSeat } from "@/types/dashboard/exam.types";

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
	onAssignSeats?: (roomId: number) => void; // Нэмэгдсэн хэсэг
	examInfo: ExamInfoItem | undefined;
	timeId: number;
}

export function ExamTimeTable({
	data,
	isLoading,
	timeId,
	examInfo,
}: ExamRoomTableProps) {
	const { userId } = useAuthStore();
	const queryClient = useQueryClient();
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

	const { mutate, isPending } = useMutation({
		mutationFn: async (values: { room_id: number }) => {
			const payload = {
				examRoomId: values.room_id || 0,
				userId: userId || 0,
				examId: examInfo?.exam_id || 0,
				examDateId: timeId || 0,
			};

			return getExamRegistrationSend(payload);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["get_exam_registration_list"],
			});
		},
	});

	return (
		<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full">
			<div className="relative flex-1 overflow-hidden flex flex-col">
				<ScrollArea className="h-full">
					<Table>
						<TableHeader className="bg-muted/80 sticky top-0 z-20 backdrop-blur-md shadow-sm">
							<TableRow className="hover:bg-transparent border-b border-border">
								<TableHead className="w-12.5"></TableHead>
								<TableHead className="font-bold text-foreground text-sm  tracking-wider h-14">
									Өрөөний дугаар
								</TableHead>
								<TableHead className="font-bold text-foreground text-sm  tracking-wider text-center h-14">
									Нийт PC
								</TableHead>
								<TableHead className="font-bold text-foreground text-sm  tracking-wider text-center h-14">
									Хуваарилагдсан
								</TableHead>
								<TableHead className="text-right font-bold text-foreground text-sm  tracking-wider h-14 pr-6">
									Нийт сурагч
								</TableHead>
								<TableHead className="text-right font-bold text-foreground text-sm  tracking-wider h-14 pr-6"></TableHead>
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
							) : !data || data.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="h-60 text-center">
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
											<TableCell className="font-black text-sm text-foreground py-3">
												{room.room_number}-р өрөө
											</TableCell>
											<TableCell className="text-center py-2">
												<Badge
													variant="outline"
													className="font-bold text-sm h-7 px-3"
												>
													<Monitor size={12} className="mr-1 text-primary" />
													{room.num_of_pc}
												</Badge>
											</TableCell>
											<TableCell className="text-center py-3">
												<Badge
													variant="secondary"
													className="font-bold text-sm h-7  text-green-600 border-none px-3  dark:bg-green-500/10 bg-green-200"
												>
													<UserCheck size={12} className="mr-1" />
													{room.assigned_seats}
												</Badge>
											</TableCell>
											<TableCell className="text-right py-3 pr-6 font-bold text-primary">
												{room.total_students} сурагч
											</TableCell>
											<TableCell className="text-right py-3 pr-6 font-bold text-primary">
												<Button
													size={"sm"}
													variant={"outline"}
													className="hover:bg-primary hover:text-white transition-colors"
													onClick={(e) => {
														e.stopPropagation();
														mutate({ room_id: room.exam_room_id });
													}}
													disabled={isPending}
												>
													{isPending ? <Spinner /> : "Суудал хуваарилах "}
												</Button>
											</TableCell>
										</TableRow>

										{expandedRows[room.exam_room_id] && (
											<TableRow className="bg-muted/5 border-none">
												<TableCell colSpan={6} className="p-0 border-none">
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
																		<TableHead className="text-[11px] font-bold uppercase">
																			Овог нэр
																		</TableHead>
																		<TableHead className="text-[11px] font-bold uppercase">
																			Анги
																		</TableHead>
																		<TableHead className="text-[11px] font-bold uppercase pl-4">
																			Суудлын №
																		</TableHead>
																		<TableHead className="text-[11px] font-bold uppercase">
																			Бүртгэлийн №
																		</TableHead>
																		<TableHead className="text-[11px] font-bold uppercase text-right pr-4">
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
																			<TableCell className="py-1">
																				<div className="flex flex-col">
																					<span className="text-[12px] font-bold">
																						{student.last_name
																							? student.last_name[0]
																							: "-"}
																						. {student.first_name}
																					</span>
																					<span className="text-[11px] text-muted-foreground">
																						{student.register_number}
																					</span>
																				</div>
																			</TableCell>
																			<TableCell className="py-1">
																				<Badge
																					variant="outline"
																					className="text-[11px] h-4 py-0"
																				>
																					{student.studentgroupname}
																				</Badge>
																			</TableCell>
																			<TableCell className="py-1 pl-4 font-mono font-bold text-primary text-[11px]">
																				{student.seat_number}
																			</TableCell>

																			<TableCell className="py-1 text-[11px] font-medium">
																				{student.examinee_number
																					? student.examinee_number
																					: "-"}
																			</TableCell>

																			<TableCell className="py-1 text-right pr-4">
																				<span className="text-[11px] text-muted-foreground italic">
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
