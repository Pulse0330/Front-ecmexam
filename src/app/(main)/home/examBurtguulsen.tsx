import { MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { mnExamUserCheckType } from "@/types/mnExam/mnExamUserCheck";
import MnExamPrint from "./mnPrint"; // ← өөрийн замаар солино

interface ExamInfoCardProps {
	exam: mnExamUserCheckType;
	printData?: any[]; // ← нэмэгдлээ
}

export function ExamInfoCard({ exam, printData }: ExamInfoCardProps) {
	const _examSdate = exam?.start_date
		? exam.start_date.replace("T", " ").slice(0, 16)
		: "";
	const _examEDate = exam?.end_date
		? exam.end_date.replace("T", " ").slice(0, 16)
		: "";

	return (
		<div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-sm">
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-[10px] shrink-0">
					Таны бүртгэл баталгаажсан байна
				</Badge>
			</div>

			{/* Өрөө / суудал */}
			<div className="grid grid-cols-2 gap-2">
				<div className="flex items-center gap-1.5 text-muted-foreground">
					<MapPin className="w-3.5 h-3.5 shrink-0 text-violet-500/70" />
					<div className="min-w-0">
						<p className="text-[9px] uppercase tracking-wide font-medium">
							Өрөөний дугаар
						</p>
						<p className="text-xs font-semibold text-foreground">
							{exam.roomname} ({exam.room_number})
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5 text-muted-foreground">
					<User className="w-3.5 h-3.5 shrink-0 text-cyan-500/70" />
					<div className="min-w-0">
						<p className="text-[9px] uppercase tracking-wide font-medium">
							Суудлын дугаар
						</p>
						<p className="text-xs font-semibold text-foreground">
							{exam.seat_number}
						</p>
					</div>
				</div>
			</div>

			{exam.branchname && (
				<p className="text-[10px] text-muted-foreground truncate">
					📍 {exam.branchname}
				</p>
			)}

			{exam.description && (
				<p className="text-[10px] text-muted-foreground">{exam.description}</p>
			)}

			{/* Print хэсэг */}
			{printData && printData.length > 0 && (
				<MnExamPrint printList={printData} />
			)}
		</div>
	);
}
