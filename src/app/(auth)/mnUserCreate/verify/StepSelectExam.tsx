"use client";

import {
	BookOpen,
	Calendar,
	ChevronRight,
	GraduationCap,
	Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "./backButton";
import ExamCard from "./examCard";
import type { ExamItem, ExamineeItem, ExamRoom } from "./types";
import { CARD_CLS } from "./utils";

interface StepSelectExamProps {
	examinee: ExamineeItem | null;
	examList: ExamItem[];
	examLoading: boolean;
	isLoading: boolean;
	selectedExam: ExamItem | null;
	selectedExamDateId: number | null;
	selectedRoomId: number | null; // ← verifyForm-аас props-оор ирнэ
	rooms: ExamRoom[];
	roomsLoading: boolean;
	onSelectExam: (exam: ExamItem) => void;
	onSelectDate: (dateId: number) => void;
	onSelectRoom: (roomId: number) => void; // ← verifyForm-ын setSelectedRoomId
	onRegister: () => void;
	onBack: () => void;
}

export function StepSelectExam({
	examinee,
	examList,
	examLoading,
	isLoading,
	selectedExam,
	selectedExamDateId,
	selectedRoomId, // ← дотоод state БАЙХГҮЙ, prop ашиглана
	rooms,
	roomsLoading,
	onSelectExam,
	onSelectDate,
	onSelectRoom, // ← verifyForm-ын setSelectedRoomId шууд
	onRegister,
	onBack,
}: StepSelectExamProps) {
	const needsDate = !!selectedExam && selectedExam.exam_dates.length > 0;
	const canRegister =
		!!selectedExam &&
		(!needsDate || (!!selectedExamDateId && !!selectedRoomId));

	return (
		<div className="space-y-4">
			{/* ── Examinee info ── */}
			{examinee && (
				<Card className={`${CARD_CLS} border-primary/20`}>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
									<GraduationCap size={16} className="text-primary" />
								</div>
								<div>
									<p className="text-sm font-semibold">
										{examinee.last_name} {examinee.first_name}
									</p>
									<p className="text-[11px] text-muted-foreground font-mono">
										Шалгуулагч №{examinee.examinee_number}
									</p>
								</div>
							</div>
							<Badge
								variant="outline"
								className={`text-[10px] ${
									examinee.flag === 1
										? "border-green-500/40 text-green-600 bg-green-500/5"
										: "border-amber-500/40 text-amber-600 bg-amber-500/5"
								}`}
							>
								{examinee.flagname}
							</Badge>
						</div>
					</CardContent>
				</Card>
			)}

			{/* ── Exam list ── */}
			<div>
				<div className="flex items-center gap-2 mb-3">
					<BookOpen size={14} className="text-primary" />
					<h2 className="text-sm font-bold">Шалгалт сонгох</h2>
					{examLoading && (
						<Loader2 size={13} className="animate-spin text-muted-foreground" />
					)}
				</div>

				{examLoading ? (
					<Card className={CARD_CLS}>
						<CardContent className="p-6 flex items-center justify-center gap-2">
							<Loader2
								size={16}
								className="animate-spin text-muted-foreground"
							/>
							<span className="text-sm text-muted-foreground">
								Шалгалтын жагсаалт татаж байна...
							</span>
						</CardContent>
					</Card>
				) : examList.length === 0 ? (
					<Card className={CARD_CLS}>
						<CardContent className="p-6 text-center space-y-2">
							<Calendar size={28} className="text-muted-foreground mx-auto" />
							<p className="text-sm text-muted-foreground">
								Тохирох шалгалт олдсонгүй
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-3">
						{examList.map((exam) => (
							<ExamCard
								key={exam.id}
								exam={exam}
								selected={selectedExam?.id === exam.id}
								selectedDateId={
									selectedExam?.id === exam.id ? selectedExamDateId : null
								}
								rooms={rooms}
								roomsLoading={roomsLoading}
								selectedRoomId={
									selectedExam?.id === exam.id ? selectedRoomId : null
								}
								isLoading={isLoading}
								onSelect={() => onSelectExam(exam)}
								onSelectDate={onSelectDate}
								onSelectRoom={onSelectRoom} // ← verifyForm setSelectedRoomId
								onRegister={onRegister} // ← verifyForm handleRegister
							/>
						))}
					</div>
				)}
			</div>

			{/* ── Actions ── */}
			<div className="space-y-2 pt-1">
				{needsDate && (!selectedExamDateId || !selectedRoomId) && (
					<p className="text-[11px] text-center text-amber-600 dark:text-amber-400 font-medium">
						⚠{" "}
						{!selectedExamDateId
							? "Шалгалт өгөх цагаа сонгоно уу"
							: "Шалгалтын өрөөгөө сонгоно уу"}
					</p>
				)}

				<Button
					onClick={onRegister}
					disabled={!canRegister || isLoading}
					className="w-full h-12 font-bold shadow-lg gap-2"
				>
					{isLoading ? (
						<>
							<Loader2 size={16} className="animate-spin" />
							Бүртгэж байна...
						</>
					) : (
						<>
							Бүртгүүлэх <ChevronRight size={16} />
						</>
					)}
				</Button>

				<BackButton onClick={onBack} label="Мэдээлэл рүү буцах" />
			</div>
		</div>
	);
}
