import { Clock, MapPin, Timer, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { mnExamUserCheckType } from "@/types/mnExam/mnExamUserCheck";

interface ExamInfoCardProps {
	exam: mnExamUserCheckType;
}

export function ExamInfoCard({ exam }: ExamInfoCardProps) {
	const examSdate = exam?.start_date
		? exam.start_date.replace("T", " ").slice(0, 16)
		: "";
	const examEDate = exam?.end_date
		? exam.end_date.replace("T", " ").slice(0, 16)
		: "";

	return (
		<div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-sm">
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<div className="space-y-0.5 flex-1 min-w-0">
					<p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
						{exam.exam_number}
					</p>
					<h3 className="text-sm font-semibold leading-snug ">{exam.name}</h3>
				</div>
				<Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-[10px] shrink-0">
					Таны бүртгэлтэй шалгалт
				</Badge>
			</div>

			<div className="h-px bg-border/50" />

			{/* Цаг хугацаа */}
			<div className="grid grid-cols-2 gap-2">
				<div className="flex items-center gap-1.5 text-muted-foreground">
					<Clock className="w-3.5 h-3.5 shrink-0 text-blue-500/70" />
					<div className="min-w-0">
						<p className="text-[9px] uppercase tracking-wide font-medium">
							эхлэх
						</p>
						<p className="text-xs font-semibold text-foreground ">
							{examSdate}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5 text-muted-foreground">
					<Clock className="w-3.5 h-3.5 shrink-0 text-red-500/70" />
					<div className="min-w-0">
						<p className="text-[9px] uppercase tracking-wide font-medium">
							Дуусах
						</p>
						<p className="text-xs font-semibold text-foreground truncate">
							{examEDate}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5 text-muted-foreground">
					<Timer className="w-3.5 h-3.5 shrink-0 text-amber-500/70" />
					<div className="min-w-0">
						<p className="text-[9px] uppercase tracking-wide font-medium">
							{" "}
							үргэлжлэх хугацаа{" "}
						</p>
						<p className="text-xs font-semibold text-foreground">
							{exam.duration} мин
						</p>
					</div>
				</div>
			</div>

			<div className="h-px bg-border/50" />

			{/* Өрөө / суудал */}
			<div className="grid grid-cols-2 gap-2">
				<div className="flex items-center gap-1.5 text-muted-foreground">
					<MapPin className="w-3.5 h-3.5 shrink-0 text-violet-500/70" />
					<div className="min-w-0">
						<p className="text-[9px] uppercase tracking-wide font-medium">
							Өрөөний дугаар
						</p>
						<p className="text-xs font-semibold text-foreground truncate">
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
		</div>
	);
}
