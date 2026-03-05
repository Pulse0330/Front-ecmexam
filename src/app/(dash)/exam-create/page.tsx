"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	BookOpen,
	CheckCircle2,
	Download,
	Grid2X2Plus,
	Loader2,
	School,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	ExamSelector,
	type SelectedExam,
} from "@/app/(dash)/exam-create/ExamSelector";
import {
	RoomSelector,
	type SelectedRoom,
} from "@/app/(dash)/exam-create/RoomSelector";
import { StudentSelector } from "@/app/(dash)/exam-create/StudentSelector";
// import { RoomSelector } from "@/a
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { batchRegisterExams, getSelectedStudents } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";

interface SelectedStudent {
	id: number;
	examinee_number: string;
}

export default function ExamCreatePage() {
	const { userId } = useAuthStore();
	// State-үүд
	const [selectedRoomID, setSelectedRoomID] = useState<string | null>(null);
	const [selectedEsisRoomID, setSelectedEsisRoomID] = useState<number | null>(
		null,
	);
	const [roomPCCount, setRoomPCCount] = useState<number>(0);

	//--------------

	const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>(
		[],
	);

	const [selectedExam, setSelectedExam] = useState<SelectedExam | null>(null);

	const handleRoomSelect = (room: SelectedRoom) => {
		setSelectedRoomID(room.id);
		setSelectedEsisRoomID(room.esisroomid);
		setRoomPCCount(room.pccnt);
		console.log("room", room);
	};

	const handleExamSelect = (exam: SelectedExam) => {
		setSelectedExam(exam);
		setSelectedStudents([]);
	};

	const { data: dbSelectedStudents = [] } = useQuery({
		queryKey: ["api_get_selected_students", selectedExam, selectedEsisRoomID],
		queryFn: () =>
			getSelectedStudents({
				dateId: selectedExam?.examDateId || 0,
				roomId: selectedEsisRoomID ? Number(selectedEsisRoomID) : 0,
			}),
		enabled: !!userId && !!selectedExam && !!selectedEsisRoomID,
		select: (res) => res.RetData,
	});

	useEffect(() => {
		if (dbSelectedStudents && dbSelectedStudents.length > 0) {
			const newStudents = dbSelectedStudents.map((s) => ({
				id: s.id,
				examinee_number: s.examinee_number,
			}));
			setSelectedStudents(newStudents);
		}
	}, [dbSelectedStudents]); // Зөвхөн API-аас ирэх дата өөрчлөгдөхөд л ажиллана

	const { mutate, isPending } = useMutation({
		mutationFn: batchRegisterExams,
		onSuccess: (res) => {
			if (res.RetResponse.ResponseCode === 11) {
				toast.error(res.RetResponse.ResponseMessage);
			} else {
				toast.success(res.RetResponse.ResponseMessage);
				// Сонголтуудыг цэвэрлэх
				setSelectedStudents([]);
				setSelectedRoomID(null);
				setSelectedEsisRoomID(null);
				setSelectedExam(null);
			}

			// Шаардлагатай бол кэш шинэчлэх
			// queryClient.invalidateQueries({ queryKey: ["some_key"] });
		},
	});

	const submit = () => {
		if (!selectedExam || !selectedEsisRoomID || !userId) return;

		const registrations = selectedStudents.map((student) => ({
			stu_id: student.id,
			examinee_number: student.examinee_number,
			exam_id: selectedExam?.examId,
			exam_date_id: selectedExam?.examDateId,
			exam_room_id: selectedEsisRoomID,
		}));

		mutate({
			userId: Number(userId),
			registrations: registrations,
		});
	};

	const handleStudentChange = useCallback((students: SelectedStudent[]) => {
		setSelectedStudents(students);
	}, []);

	const isOverCapacity = selectedStudents.length > roomPCCount;

	return (
		<div className="max-w-7xl py-6 mx-auto">
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b border-border pb-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
						<div className="bg-primary/10 p-2 rounded-lg text-primary">
							<School className="text-primary" />
						</div>
						Шалгалт зохион байгуулах
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Өрөө, шалгалт болон сурагчдаа сонгон бүртгэл хийнэ үү.
					</p>
				</div>
				<Button
					disabled={
						!selectedExam ||
						selectedStudents.length === 0 ||
						isPending ||
						isOverCapacity
					}
					className="gap-2"
					onClick={submit}
				>
					{isPending ? (
						<Loader2 size={16} className="animate-spin" />
					) : (
						<CheckCircle2 size={16} />
					)}
					{isOverCapacity
						? `Суудал хэтэрсэн (${selectedStudents.length}/${roomPCCount})`
						: `Бүртгэх (${selectedStudents.length}/${roomPCCount})`}
				</Button>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 h-auto lg:h-[calc(100vh-250px)]">
				{/* 1. БАГАНА: ӨРӨӨНҮҮД */}
				<Card className="lg:col-span-4 flex flex-col border-border bg-card overflow-hidden gap-0 pb-0 h-125 lg:h-full">
					<CardHeader className=" pb-0 shrink-0">
						<CardTitle className="text-sm font-semibold flex items-center gap-2 justify-between">
							<span className="flex items-center gap-2">
								<School size={16} /> 1. Шалгалтын өрөө
							</span>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 text-[10px] gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
								asChild
							>
								<Link href={"/room"}>
									<Grid2X2Plus size={10} />
									Өрөө бүртгэх
								</Link>
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 flex-1 overflow-hidden relative gap-0">
						<div className="absolute inset-0  ">
							<RoomSelector
								selectedId={selectedRoomID}
								onSelect={handleRoomSelect}
							/>
						</div>
					</CardContent>
				</Card>
				{/* 2. БАГАНА: ШАЛГАЛТУУД */}
				<Card className="lg:col-span-4 flex flex-col border-border bg-card overflow-hidden gap-0 pb-0 h-125 lg:h-full">
					<CardHeader className=" pb-0 shrink-0">
						<CardTitle className="text-sm font-semibold flex items-center gap-2 justify-between">
							<span className="flex items-center gap-2">
								<BookOpen size={16} /> 2. Шалгалт / Хуваарь
							</span>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 text-[10px] gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
								asChild
							>
								<Link href={"/exam-schedule"}>
									<Download size={10} />
									Хуваарь татах
								</Link>
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 flex-1 overflow-hidden relative gap-0">
						<div className="absolute inset-0  ">
							<ExamSelector
								onSelect={handleExamSelect}
								selectedExamDateId={selectedExam?.uiId || null}
							/>
						</div>
					</CardContent>
				</Card>
				{/* 3. БАГАНА: СУРАГЧИД */}
				<Card className="md:col-span-2 lg:col-span-4 flex flex-col border-border bg-card overflow-hidden gap-0 pb-0 h-125 lg:h-full">
					<CardHeader className=" pb-0 shrink-0">
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							<Users size={16} /> 3. Суралцагч сонгох
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 flex-1 overflow-hidden relative gap-0">
						<div className="absolute inset-0  ">
							<StudentSelector
								roomPCCount={roomPCCount}
								onSelectChange={handleStudentChange}
								selectedStudents={selectedStudents}
								initialSelectedStudents={dbSelectedStudents}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
