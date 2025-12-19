"use client";

import {
	ArrowRight,
	Calendar,
	Clock,
	CreditCard,
	PlayCircle,
	Sparkles,
	User,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import type { Exam } from "@/types/home";

interface ExamListProps {
	exams: Exam[];
}

export default function ExamList({ exams }: ExamListProps) {
	const router = useRouter();

	const handleStartExam = (examId: number) => {
		router.push(`/exam/${examId}`);
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
			{exams.map((exam, index) => {
				const isActive = exam.flag === 1;

				return (
					<Card
						key={`exam-${exam.exam_id}-${index}`}
						className={`relative overflow-hidden border-2 animate-fadeInUp ${
							isActive
								? "border-primary/20"
								: "border-destructive/20 bg-muted/30"
						}`}
						style={{
							animationDelay: `${index * 100}ms`,
							animationFillMode: "forwards",
						}}
					>
						{/* Background Orbs */}
						<div className="absolute inset-0 pointer-events-none overflow-hidden">
							<div
								className={`absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-20 ${
									isActive
										? "bg-linear-to-r from-green-500/50 via-emerald-500 to-teal-500/50"
										: "bg-linear-to-br from-destructive/10 to-destructive/5"
								}`}
							/>
							<div
								className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-10 ${
									isActive
										? "bg-linear-to-r from-green-500/50 via-emerald-500 to-teal-500/50"
										: "bg-linear-to-tr from-destructive/10 to-destructive/5"
								}`}
							/>
						</div>

						{/* Status Badge */}
						<div className="absolute top-0 right-0 z-20 overflow-hidden rounded-bl-2xl rounded-tr-2xl">
							<Badge
								variant={isActive ? "default" : "destructive"}
								className={`shadow-xl backdrop-blur-md px-4 py-2 rounded-none border-0 ${
									isActive
										? "bg-linear-to-r from-green-500/50 via-emerald-500 to-teal-500/50"
										: "bg-linear-to-br from-destructive via-destructive/90 to-destructive/80"
								}`}
							>
								{isActive ? (
									<>
										<span className="font-bold text-sm">{exam.flag_name}</span>
										<Sparkles className="w-3.5 h-3.5 ml-1.5" />
									</>
								) : (
									<>
										<XCircle className="w-4 h-4 mr-1.5" />
										<span className="font-bold text-sm">{exam.flag_name}</span>
									</>
								)}
							</Badge>
						</div>

						<CardHeader className="relative z-10 pb-4 pt-6">
							<div className="pr-24">
								<h3
									className={`text-xl font-bold line-clamp-2 leading-tight ${
										isActive ? "text-foreground" : "text-muted-foreground"
									}`}
								>
									{exam.title}
								</h3>
							</div>
						</CardHeader>

						{/* Divider */}
						<div className="mx-6 mb-4">
							<div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
						</div>

						<CardContent className="relative z-10 space-y-3 pb-4">
							{/* Date & Time */}
							<div className="group/item relative overflow-hidden rounded-xl border-2 border-blue-100 dark:border-blue-900/30 bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-3.5">
								<div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl" />
								<div className="relative flex items-center gap-3">
									<div className="p-2.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-3">
										<Calendar className="w-5 h-5 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
											Огноо & Цаг
										</p>
										<p className="text-sm font-bold text-foreground">
											{new Date(exam.ognoo).toLocaleDateString("mn-MN", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
										<p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
											{new Date(exam.ognoo).toLocaleTimeString("mn-MN", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								</div>
							</div>

							{/* Duration & Teacher Grid */}
							<div className="grid grid-cols-2 gap-3">
								{/* Duration */}
								<div className="group/item relative overflow-hidden rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 p-3">
									<div className="absolute top-0 right-0 w-16 h-16 bg-purple-400/10 rounded-full blur-xl" />
									<div className="relative">
										<div className="p-2 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg shadow-md mb-2 inline-flex transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-3">
											<Clock className="w-4 h-4 text-white" />
										</div>
										<p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
											Хугацаа
										</p>
										<p className="text-lg font-black text-foreground">
											{exam.exam_minute}
											<span className="text-xs font-semibold text-purple-600 dark:text-purple-400 ml-1">
												мин
											</span>
										</p>
									</div>
								</div>

								{/* Teacher */}
								<div className="group/item relative overflow-hidden rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30 bg-linear-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 p-3">
									<div className="absolute top-0 right-0 w-16 h-16 bg-indigo-400/10 rounded-full blur-xl" />
									<div className="relative">
										<div className="p-2 bg-linear-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md mb-2 inline-flex transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-3">
											<User className="w-4 h-4 text-white" />
										</div>
										<p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
											Багш
										</p>
										<p
											className="text-sm font-bold text-foreground truncate"
											title={exam.teach_name}
										>
											{exam.teach_name}
										</p>
									</div>
								</div>
							</div>

							{/* Payment */}
							<div className="group/item relative overflow-hidden rounded-xl border-2 border-emerald-100 dark:border-emerald-900/30 bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-3.5">
								<div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl" />
								<div className="relative flex items-center gap-3">
									<div className="p-2.5 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-3">
										<CreditCard className="w-5 h-5 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
											Төлбөрийн төрөл
										</p>
										<p className="text-sm font-bold text-foreground truncate">
											{exam.ispaydescr}
										</p>
									</div>
								</div>
							</div>
						</CardContent>

						<CardFooter className="relative z-10 pt-2 pb-6">
							{isActive ? (
								<Button
									onClick={() => handleStartExam(exam.exam_id)}
									className="group/button w-full h-14 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-bold text-base shadow-lg rounded-xl"
								>
									<span className="flex items-center justify-center gap-2.5">
										<PlayCircle className="w-5 h-5 transition-transform duration-300 group-hover/button:scale-110" />
										<span className="text-base">{exam.flag_name}</span>
										<ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-2" />
									</span>
								</Button>
							) : (
								<Button
									disabled
									variant="secondary"
									className="w-full h-14 cursor-not-allowed bg-muted text-muted-foreground font-semibold text-base rounded-xl"
								>
									<span className="flex items-center justify-center gap-2">
										<XCircle className="w-5 h-5" />
										<span>Идэвхгүй байна</span>
									</span>
								</Button>
							)}
						</CardFooter>

						{/* Bottom Accent Line */}
						<div
							className={`absolute bottom-0 left-0 right-0 h-1.5 ${
								isActive
									? "bg-linear-to-r from-green-500/50 via-emerald-500 to-teal-500/50"
									: "bg-linear-to-r from-destructive/30 via-destructive/50 to-destructive/30 opacity-40"
							}`}
						/>
					</Card>
				);
			})}

			<style jsx>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				
				.animate-fadeInUp {
					animation-name: fadeInUp;
					animation-duration: 0.6s;
					animation-timing-function: ease-out;
					opacity: 0;
				}
			`}</style>
		</div>
	);
}
