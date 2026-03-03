import { AlertCircle, Calendar, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ExamItem } from "./types";
import { fmtDateTime } from "./utils";

const WEEKDAYS = ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям"];

function formatExamDate(start: string, end: string) {
	const s = new Date(start);
	const e = new Date(end);
	const date = s.toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const weekday = WEEKDAYS[s.getDay()];
	const startTime = s.toLocaleTimeString("mn-MN", {
		hour: "2-digit",
		minute: "2-digit",
	});
	const endTime = e.toLocaleTimeString("mn-MN", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return { date, weekday, startTime, endTime };
}

export function ExamCard({
	exam,
	selected,
	selectedDateId,
	onSelect,
	onSelectDate,
}: {
	exam: ExamItem;
	selected: boolean;
	selectedDateId: number | null;
	onSelect: () => void;
	onSelectDate: (dateId: number) => void;
}) {
	const now = new Date();
	const isOpen =
		now >= new Date(exam.register_start_date) &&
		now <= new Date(exam.register_end_date);
	const isExpired = now > new Date(exam.register_end_date);

	return (
		<div
			className={[
				"w-full text-left rounded-xl border-2 p-4 transition-all duration-200",
				"bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl",
				isOpen
					? selected
						? "border-primary bg-primary/5 shadow-md"
						: "border-gray-200/50 dark:border-gray-700/50"
					: "border-gray-200/30 dark:border-gray-700/30 opacity-60",
			].join(" ")}
		>
			{/* ── Exam header ── */}
			<button
				type="button"
				onClick={isOpen ? onSelect : undefined}
				disabled={!isOpen}
				className={[
					"w-full text-left transition-all",
					isOpen ? "cursor-pointer" : "cursor-not-allowed",
				].join(" ")}
			>
				<div className="flex items-start justify-between gap-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap mb-1.5">
							<span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
								{exam.exam_number}
							</span>
							<Badge
								variant="outline"
								className={`text-[10px] px-1.5 py-0 h-4 ${
									isOpen
										? "border-green-500/40 text-green-600 bg-green-500/5"
										: isExpired
											? "border-destructive/30 text-destructive/70 bg-destructive/5"
											: "border-amber-500/40 text-amber-600 bg-amber-500/5"
								}`}
							>
								{isOpen
									? "Бүртгэл нээлттэй"
									: isExpired
										? "Бүртгэл дууссан"
										: "Бүртгэл эхлээгүй"}
							</Badge>
						</div>
						<p className="text-sm font-semibold leading-snug">{exam.name}</p>
						<div className="flex items-center gap-1 mt-1.5">
							<Clock size={11} className="text-muted-foreground" />
							<span className="text-[11px] text-muted-foreground">
								Үргэлжлэх хугацаа: {exam.duration} минут
							</span>
						</div>
					</div>
					<div
						className={[
							"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
							selected
								? "border-primary bg-primary"
								: "border-muted-foreground/30",
						].join(" ")}
					>
						{selected && <div className="w-2 h-2 rounded-full bg-white" />}
					</div>
				</div>

				{/* Бүртгэлийн хугацаа */}
				<div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 grid grid-cols-2 gap-2">
					<div>
						<p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
							Бүртгэл эхлэх
						</p>
						<p className="text-[11px] font-medium">
							{fmtDateTime(exam.register_start_date)}
						</p>
					</div>
					<div>
						<p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
							Бүртгэл дуусах
						</p>
						<p className="text-[11px] font-medium">
							{fmtDateTime(exam.register_end_date)}
						</p>
					</div>
				</div>
			</button>

			{/* ── Цаг / өрөө сонгох ── */}
			{selected && isOpen && exam.exam_dates.length > 0 && (
				<div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
					<div className="flex items-center gap-1.5">
						<Calendar size={11} className="text-primary" />
						<p className="text-[10px] font-bold text-foreground uppercase tracking-wider">
							Шалгалт өгөх цаг сонгоно уу
						</p>
						<span className="ml-auto text-[10px] text-muted-foreground">
							{exam.exam_dates.length} боломжит цаг
						</span>
					</div>

					<div className="grid gap-2">
						{exam.exam_dates.map((ed, idx) => {
							const isSelected = selectedDateId === ed.id;
							const { date, weekday, startTime, endTime } = formatExamDate(
								ed.start_date,
								ed.end_date,
							);
							return (
								<button
									key={ed.id}
									type="button"
									onClick={() => onSelectDate(ed.id)}
									className={[
										"w-full text-left rounded-xl border-2 px-4 py-3 transition-all duration-150",
										isSelected
											? "border-primary bg-primary/10"
											: "border-gray-200/60 dark:border-gray-700/60 hover:border-primary/50 hover:bg-primary/5",
									].join(" ")}
								>
									<div className="flex items-center justify-between gap-3">
										{/* Зүүн: radio + дугаар + өрөө */}
										<div className="flex items-center gap-2.5">
											<div
												className={[
													"w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
													isSelected
														? "border-primary bg-primary"
														: "border-muted-foreground/30",
												].join(" ")}
											>
												{isSelected && (
													<div className="w-1.5 h-1.5 rounded-full bg-white" />
												)}
											</div>
											<div>
												<p
													className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}
												>
													{idx + 1}-р ээлж
												</p>
												<div className="flex items-center gap-1 mt-0.5">
													<MapPin size={9} className="text-muted-foreground" />
													<span className="text-[10px] text-muted-foreground">
														Өрөө #{ed.exam_skuul_id}
													</span>
												</div>
											</div>
										</div>

										{/* Баруун: огноо + гараг + цаг */}
										<div className="text-right">
											<div className="flex items-center justify-end gap-1">
												<span
													className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}
												>
													{date}
												</span>
												<span className="text-[10px] text-muted-foreground">
													({weekday})
												</span>
											</div>
											<div className="flex items-center justify-end gap-1 mt-0.5">
												<Clock size={9} className="text-muted-foreground" />
												<span className="text-[11px] text-muted-foreground font-medium">
													{startTime} – {endTime}
												</span>
											</div>
										</div>
									</div>
								</button>
							);
						})}
					</div>

					{!selectedDateId && (
						<div className="flex items-center gap-1.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
							<AlertCircle size={11} className="text-amber-600 shrink-0" />
							<p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
								Шалгалт өгөх цагаа сонгоно уу
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
