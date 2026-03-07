"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Armchair,
	BookOpen,
	Check,
	ClipboardList,
	Database,
	Hash,
	Layers,
	Monitor,
	School,
	Upload,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ExamPrintService from "@/app/(dash)/exam-schedule/[time_id]/ExamPrintService";
import { UploadPDFDialog } from "@/app/(dash)/exam-schedule/[time_id]/UploadPDF";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	getExamEsseUpload,
	getExamRegistrationSend,
	getVariantDistribute,
} from "@/lib/dash.api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamInfoItem, StudentSeat } from "@/types/dashboard/exam.types";
import type { UploadFileResult } from "@/utils/upload";

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
	examInfo: ExamInfoItem | undefined;
	timeId: number;
}

export function ExamTimeTable({ data, timeId, examInfo }: ExamRoomTableProps) {
	const { userId } = useAuthStore();
	const queryClient = useQueryClient();
	const [selectedRoomId, setSelectedRoomId] = useState<string>("");
	const [pdfUploadOpen, setPdfUploadOpen] = useState<boolean>(false);
	const [selectRow, setSelectRow] = useState<StudentSeat | null>(null);

	// Зөвхөн сурагчтай өрөөнүүдийг шүүх
	const filteredRooms = useMemo(
		() => data?.filter((r) => r.total_students > 0) || [],
		[data],
	);
	const selectedRoom = useMemo(
		() =>
			filteredRooms.find((r) => r.exam_room_id.toString() === selectedRoomId),
		[filteredRooms, selectedRoomId],
	);

	const { mutate, isPending } = useMutation({
		mutationFn: async (values: { room_id: number }) => {
			return getExamRegistrationSend({
				examRoomId: values.room_id,
				userId: userId || 0,
				examId: examInfo?.exam_id || 0,
				examDateId: timeId || 0,
			});
		},
		onSuccess: (res) => {
			if (res.RetResponse.ResponseCode === 11) {
				toast.error(res.RetResponse.ResponseMessage);
			} else {
				queryClient.invalidateQueries({
					queryKey: ["get_exam_registration_list"],
				});
				toast.success(res.RetResponse.ResponseMessage);
			}
		},
	});
	// ExamTimeTable.tsx дотор нэмэх
	const { mutate: submitPdfRecord } = useMutation({
		mutationFn: async (payload: {
			exam_register_id: number;
			question_id: number;
			file_url: string;
			file_type: string;
		}) => getExamEsseUpload(payload),
		onSuccess: (res) => {
			if (res.RetResponse.ResponseCode === 11) {
				toast.error(res.RetResponse.ResponseMessage);
			} else {
				toast.success(res.RetResponse.ResponseMessage);
			}
			queryClient.invalidateQueries({
				queryKey: ["get_exam_registration_list"],
			});
		},
		onError: () => {
			toast.error("Серверт бүртгэхэд алдаа гарлаа");
		},
	});

	const succesPdf = (result: UploadFileResult) => {
		// 1. selectRow байхгүй эсвэл exam_registration_id байхгүй бол зогсоох
		if (
			!selectRow ||
			!selectRow.exam_registration_id ||
			!selectRow.questionId
		) {
			toast.error("Сонгогдсон сурагчийн мэдээлэл дутуу байна.");
			return;
		}
		const fileExtension = result.file.name.split(".").pop();

		// 3. Мутаци руу илгээх
		submitPdfRecord({
			exam_register_id: selectRow.exam_registration_id,
			question_id: selectRow.questionId, // Одоо энэ нь заавал number байна
			file_url: result.file.url,
			file_type: fileExtension || "unknown",
		});
	};

	const { mutate: variantMunate, isPending: variantIsPending } = useMutation({
		mutationFn: async (values: { room_id: number }) => {
			return getVariantDistribute({
				examRoomId: values.room_id,
				examId: examInfo?.exam_id || 0,
				examDateId: timeId || 0,
			});
		},
		onSuccess: (res) => {
			if (res.RetResponse.ResponseCode === 11) {
				toast.error(res.RetResponse.ResponseMessage);
			} else {
				toast.success(res.RetResponse.ResponseMessage);
			}
		},
	});

	// Хуваарилалтын явц тооцоолох
	// const assignProgress = selectedRoom
	// 	? Math.round(
	// 			(selectedRoom.assigned_seats / selectedRoom.total_students) * 100,
	// 		)
	// 	: 0;

	return (
		<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full">
			{/* ── Header ── */}
			<div className="px-5 py-3.5 border-b flex items-center justify-between bg-muted/30 gap-4 flex-wrap">
				<div className="flex items-center gap-3">
					<Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
						<SelectTrigger className="w-64 h-9 text-sm">
							<SelectValue placeholder="Өрөөгөө сонгоно уу..." />
						</SelectTrigger>
						<SelectContent>
							{filteredRooms.map((room) => (
								<SelectItem
									key={room.exam_room_id}
									value={room.exam_room_id.toString()}
								>
									<span className="flex items-center gap-2">
										<Monitor size={13} className="text-muted-foreground" />
										{room.room_number}-р өрөө
										<span className="ml-auto text-xs text-muted-foreground">
											({room.total_students} сурагч)
										</span>
									</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{selectedRoom && (
					<div className="flex items-center gap-2">
						<Button
							onClick={() => mutate({ room_id: selectedRoom.exam_room_id })}
							disabled={isPending}
							size="sm"
						>
							{isPending ? (
								<>
									<Spinner /> 'Түр хүлээнэ үү...'
								</>
							) : (
								<>
									<Armchair size={14} />
									Суудал хуваарилах
								</>
							)}
						</Button>
						<Button
							onClick={() =>
								variantMunate({ room_id: selectedRoom.exam_room_id })
							}
							disabled={variantIsPending}
							size="sm"
						>
							{variantIsPending ? (
								<>
									<Spinner /> 'Түр хүлээнэ үү...'
								</>
							) : (
								<>
									<Layers />
									Вариант хуваарилах{" "}
								</>
							)}
						</Button>

						<ExamPrintService
							examInfo={examInfo}
							timeId={timeId}
							roomId={Number(selectedRoomId)}
							students={selectedRoom.students} // ← нэмэх
						/>
					</div>
				)}
			</div>

			{/* ── Body ── */}
			<ScrollArea className="flex-1">
				{selectedRoom ? (
					<div className="p-5 space-y-5">
						{/* Stat cards */}
						<div className="grid grid-cols-3 gap-3">
							<StatCard
								icon={<Monitor size={16} />}
								label="Компьютерын тоо"
								value={selectedRoom.num_of_pc}
							/>
							<StatCard
								icon={<Armchair size={16} />}
								label="Хуваарилагдсан"
								value={selectedRoom.assigned_seats}
							/>
							<StatCard
								icon={<Users size={16} />}
								label="Нийт сурагч"
								value={selectedRoom.total_students}
							/>
						</div>

						{/* Progress bar */}
						{/* <div className="space-y-1.5">
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span className="flex items-center gap-1">
									<Layers size={11} />
									Хуваарилалтын явц
								</span>
								<span className="font-semibold text-foreground">
									{assignProgress}%
								</span>
							</div>
							<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
								<div
									className="h-full rounded-full bg-primary transition-all duration-500"
									style={{ width: `${assignProgress}%` }}
								/>
							</div>
						</div> */}

						{/* Table */}
						<div className="rounded-lg border border-border overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow className="bg-muted/40 hover:bg-muted/40">
										<TableHead className="w-8 text-center">
											<Hash
												size={13}
												className="mx-auto text-muted-foreground"
											/>
										</TableHead>
										<TableHead>
											<span className="flex items-center gap-1.5">
												<BookOpen size={13} className="text-muted-foreground" />
												Овог нэр
											</span>
										</TableHead>
										<TableHead>
											<span className="flex items-center gap-1.5">
												<School size={13} className="text-muted-foreground" />
												Анги
											</span>
										</TableHead>
										<TableHead>
											<span className="flex items-center gap-1.5">
												<Armchair size={13} className="text-muted-foreground" />
												Суудал №
											</span>
										</TableHead>
										<TableHead>
											<span className="flex items-center gap-1.5">
												<ClipboardList
													size={13}
													className="text-muted-foreground"
												/>
												Төлөв
											</span>
										</TableHead>
										<TableHead>
											<span className="flex items-center gap-1.5 justify-end">
												<Upload size={13} className="text-muted-foreground" />
												Хариултын хуудас илгээх
											</span>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{selectedRoom.students.map((s, idx) => {
										const hasUploaded = !!s.file_url;
										return (
											<TableRow key={s.id} className="group">
												<TableCell className="text-center text-xs text-muted-foreground w-8">
													{idx + 1}
												</TableCell>
												<TableCell className="font-medium">
													<span className="text-muted-foreground">
														{s.last_name[0]}.
													</span>{" "}
													{s.first_name}
												</TableCell>
												<TableCell>
													<Badge
														variant="outline"
														className="gap-1 font-normal text-xs"
													>
														<School size={10} />
														{s.studentgroupname}
													</Badge>
												</TableCell>
												<TableCell>
													<span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary font-bold text-sm">
														{s.seat_number}
													</span>
												</TableCell>
												<TableCell>{s.status_text}</TableCell>
												{
													<TableCell>
														<div className="flex justify-end items-center">
															{hasUploaded ? (
																<Badge
																	variant="secondary"
																	className="gap-1 h-7 px-3 text-green-500"
																>
																	<Check size={12} />
																	Илгээгдсэн
																</Badge>
															) : (
																<Button
																	size={"icon-sm"}
																	variant={"outline"}
																	onClick={() => {
																		setPdfUploadOpen(true);
																		setSelectRow(s);
																	}}
																	disabled={s.status_code !== 3}
																>
																	<Upload />
																</Button>
															)}
														</div>
													</TableCell>
												}
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					</div>
				) : (
					/* Empty state */
					<div className="h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground select-none">
						<div className="p-4 rounded-2xl bg-muted/40">
							<Database size={36} className="opacity-40" />
						</div>
						<div className="text-center space-y-0.5">
							<p className="text-sm font-medium text-foreground/60">
								Өрөө сонгогдоогүй байна
							</p>
							<p className="text-xs text-muted-foreground">
								Үргэлжлүүлэхийн тулд дээрээс өрөө сонгоно уу.
							</p>
						</div>
					</div>
				)}
			</ScrollArea>
			<UploadPDFDialog
				open={pdfUploadOpen}
				onOpenChange={setPdfUploadOpen}
				onUploadSuccess={succesPdf}
				selectRow={selectRow}
			/>
			{/* <StudentsInfo /> */}
		</div>
	);
}

function StatCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: number;
}) {
	return (
		<div
			className={cn(
				"rounded-xl p-4 flex flex-col gap-2 border border-transparent bg-muted",
			)}
		>
			<div className={cn("flex items-center gap-1.5 text-xs font-medium")}>
				{icon}
				{label}
			</div>
			<p className={cn("text-2xl font-bold leading-none")}>{value}</p>
		</div>
	);
}
