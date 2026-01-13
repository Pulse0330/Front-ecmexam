"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	ClipboardCheck,
	Clock,
	HelpCircle,
	Sparkles,
	User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Exam } from "@/types/home";

interface ExamListProps {
	exams: Exam[];
}

const MONGOLIAN_MONTHS = [
	"1-р сар",
	"2-р сар",
	"3-р сар",
	"4-р сар",
	"5-р сар",
	"6-р сар",
	"7-р сар",
	"8-р сар",
	"9-р сар",
	"10-р сар",
	"11-р сар",
	"12-р сар",
];

const formatMongolianDateTime = (dateString: string) => {
	const date = new Date(dateString);
	return {
		date: `${MONGOLIAN_MONTHS[date.getMonth()]} ${date.getDate()}`,
		time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
	};
};

export default function ExamList({ exams }: ExamListProps) {
	const router = useRouter();

	if (!exams?.length)
		return (
			<div className="flex flex-col items-center py-24 opacity-40">
				<HelpCircle className="w-12 h-12 mb-4 stroke-[1.5px]" />
				<p className="font-bold tracking-tight">Шалгалт олдсонгүй</p>
			</div>
		);

	return (
		<div className="px-2">
			{/* Simple Grid Layout */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{exams.map((exam, index) => {
					const isActive = exam.flag === 1;
					const dt = formatMongolianDateTime(exam.ognoo);

					return (
						<motion.div
							key={exam.exam_id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.05 }}
							whileHover={isActive ? { scale: 0.95 } : {}}
							className="h-full"
						>
							<Card
								onClick={() => isActive && router.push(`/exam/${exam.exam_id}`)}
								className={cn(
									"group relative flex flex-col h-full overflow-hidden rounded-[28px] border border-border/40 bg-card/50 backdrop-blur-md transition-all duration-500 ease-out",
									isActive
										? "cursor-pointer hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20"
										: "opacity-60 grayscale cursor-not-allowed",
								)}
							>
								{/* Header Section with Animated Gradient */}
								<div
									className={cn(
										"relative h-44 w-full overflow-hidden transition-all duration-700",
										isActive
											? "bg-linear-to-br from-slate-800 via-slate-700 to-slate-600"
											: "bg-slate-700",
									)}
								>
									{/* Decorative Pattern */}
									<div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size[:20px_20px] group-hover:scale-110 transition-transform duration-700" />
									<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

									{/* Badges Container */}
									<div className="absolute top-4 left-4 flex flex-col gap-2">
										<Badge
											className={cn(
												"px-3 py-1 rounded-full text-[10px] font-bold border-none shadow-lg w-fit transition-colors",
												isActive
													? "bg-emerald-500 text-white"
													: "bg-slate-600 text-white",
											)}
										>
											<span
												className={cn(
													"mr-1.5 h-1.5 w-1.5 rounded-full bg-white inline-block",
													isActive && "animate-pulse",
												)}
											/>
											{isActive ? "Идэвхтэй" : "Хаагдсан"}
										</Badge>
										<Badge className="px-3 py-1 rounded-full text-[10px] font-bold border-none shadow-lg bg-white/10 backdrop-blur-md text-white w-fit">
											{exam.ispaydescr}
										</Badge>
									</div>

									{/* Schedule Overlay */}
									<div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
										<div className="flex items-center gap-1.5 text-white/90 text-[11px] font-semibold">
											<Calendar className="w-3.5 h-3.5 text-blue-300" />
											{dt.date}
										</div>
										<div className="flex items-center gap-1.5 text-white text-[11px] font-bold">
											<Clock className="w-3.5 h-3.5 text-orange-400" />
											{dt.time}
										</div>
									</div>
								</div>

								{/* Card Content Area */}
								<CardContent className="flex flex-col grow p-6 gap-5">
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<p className="text-[10px] font-black text-primary/80 uppercase tracking-[0.15em]">
												{exam.flag_name}
											</p>
											{isActive && (
												<Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
											)}
										</div>
										<h3 className="font-bold text-foreground leading-snug line-clamp-2 text-[17px] group-hover:text-primary transition-colors duration-300">
											{exam.title}
										</h3>
									</div>

									{/* Stats Footer */}
									<div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
										<div className="flex items-center gap-3">
											<div
												className="flex items-center gap-1.5"
												title="Хугацаа"
											>
												<Clock className="w-4 h-4 text-orange-500/80" />
												<span className="text-xs font-bold text-muted-foreground">
													{exam.exam_minute} минут
												</span>
											</div>
											<div className="flex items-center gap-1.5" title="Асуулт">
												<ClipboardCheck className="w-4 h-4 text-blue-500/80" />
												<span className="text-xs font-bold text-muted-foreground">
													{exam.que_cnt}
												</span>
											</div>
											<div className="flex items-center gap-1.5" title="Багш">
												<User className="w-4 h-4 text-purple-500/80" />
												<span className="text-xs font-bold text-muted-foreground truncate max-w-[70px]">
													{exam.teach_name.split(".").pop()}
												</span>
											</div>
										</div>

										<div
											className={cn(
												"flex items-center justify-center min-w-9 h-9 rounded-full transition-all duration-300",
												isActive
													? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110"
													: "bg-muted text-muted-foreground",
											)}
										>
											<ArrowRight className="w-5 h-5" />
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
