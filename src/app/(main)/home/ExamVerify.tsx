import { useMutation, } from "@tanstack/react-query";
import { BookOpen, School } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	RoomSelector,
	type SelectedRoom,
} from "@/app/(dash)/exam-create/RoomSelector";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userRegisterExams } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Exam1111 } from "@/types/dashboard/exam.types";
import { ExamSelectorV2, type SelectedExam } from "./StudentExamSelect";
import { isBurtguulsen } from "./page";


export function ExamVerifyDialog({

isFetched,
	examList,
	isLoading,
	
}: {
	examList: Exam1111[];
	isLoading: boolean;
	isFetched: boolean;

}) {
	const { userId, user } = useAuthStore();
	const [isOpen, setOpen] = useState(false);

	const [selectedRoomID, setSelectedRoomID] = useState<string | null>(null);
	const [selectedEsisRoomID, setSelectedEsisRoomID] = useState<number | null>(
		null,
	);

	const [selectedExam, setSelectedExam] = useState<SelectedExam | null>(null);

	const handleRoomSelect = (room: SelectedRoom) => {
		setSelectedRoomID(room.id);
		setSelectedEsisRoomID(room.esisroomid);
	};

	const handleExamSelect = (exam: SelectedExam) => {
		setSelectedExam(exam);
	};

	

	const { mutate, isPending } = useMutation({
		mutationFn: userRegisterExams,
		onSuccess: (res) => {
			if (res.RetResponse.ResponseCode === 11) {
				toast.error(res.RetResponse.ResponseMessage);
			} else {
				toast.success(res.RetResponse.ResponseMessage);
				// Сонголтуудыг цэвэрлэх
				setSelectedRoomID(null);
				setSelectedEsisRoomID(null);
				setSelectedExam(null);
			}
		},
	});

	const submit = () => {
		if (
			!selectedExam ||
			!selectedEsisRoomID ||
			!userId ||
			!selectedExam ||
			!user
		)
			return;

		mutate({
			userId: Number(userId),
			exam_id: selectedExam.examId,
			exam_date_id: selectedExam?.examDateId,
			exam_room_id: selectedEsisRoomID,
			examinee_number: String(user?.examinee_number),
		});
	};

	useEffect(() => {
		if (!isFetched) return; // ← fetch дуусаагүй бол юу ч хийхгүй

		if (user?.examinee_number && !isBurtguulsen(examList)) {
			setOpen(true);
		} else {
			setOpen(false);
		}
	}, [user, examList, isFetched, isBurtguulsen]);

	return (
		<AlertDialog open={isOpen} onOpenChange={setOpen}>
			<AlertDialogContent className="max-w-4xl sm:max-w-4xl">
				<AlertDialogHeader>
					<AlertDialogTitle>Шалгалтанд бүртгүүлэх</AlertDialogTitle>
					<AlertDialogDescription>
						Та шалгалтын өрөө, шалгалт өгөх хуваарь сонгож үргэжлүүлнэ үү
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="grid grid-cols-2 gap-4 h-auto lg:h-[calc(100vh-250px)] w-full">
					{/* 1. БАГАНА: ӨРӨӨНҮҮД */}
					<Card className=" flex flex-col border-border bg-card overflow-hidden gap-0 pb-0 h-125 lg:h-full">
						<CardHeader className=" pb-0 shrink-0">
							<CardTitle className="text-sm font-semibold flex items-center gap-2 justify-between">
								<span className="flex items-center gap-2">
									<School size={16} /> 1. Шалгалтын өрөө
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0 flex-1 overflow-hidden relative gap-0">
							<div className="absolute inset-0  ">
								<RoomSelector
									selectedId={selectedRoomID}
									onSelect={handleRoomSelect}
									acctionHidden={true}
								/>
							</div>
						</CardContent>
					</Card>
					{/* 2. БАГАНА: ШАЛГАЛТУУД */}
					<Card className=" flex flex-col border-border bg-card overflow-hidden gap-0 pb-0 h-125 lg:h-full">
						<CardHeader className=" pb-0 shrink-0">
							<CardTitle className="text-sm font-semibold flex items-center gap-2 justify-between">
								<span className="flex items-center gap-2">
									<BookOpen size={16} /> 2. Шалгалт / Хуваарь
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0 flex-1 overflow-hidden relative gap-0">
							<div className="absolute inset-0  ">
								<ExamSelectorV2
									onSelect={handleExamSelect}
									selectedExamDateId={selectedExam?.uiId || null}
									data={examList}
									isLoading={isLoading}
								/>
							</div>
						</CardContent>
					</Card>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel>Хaaх</AlertDialogCancel>
					<AlertDialogAction
						onClick={submit}
						disabled={!selectedExam || !selectedEsisRoomID || isPending}
						className="disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isPending ? "Бүртгэж байна..." : "Бүртгэх"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
