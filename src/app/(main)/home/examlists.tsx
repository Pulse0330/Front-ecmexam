"use client";

import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	HelpCircle,
	Sparkles,
	User,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Exam } from "@/types/home";

interface ExamListProps {
	exams: Exam[];
}

// Helper function
const getStatusConfig = (isActive: boolean) => {
	if (isActive) {
		return {
			badge: {
				className: "bg-emerald-500/90 dark:bg-emerald-600/80",
				icon: CheckCircle2,
				text: "Идэвхтэй",
			},
			button:
				"bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
		};
	}

	return {
		badge: {
			className: "bg-slate-500/80 dark:bg-slate-600/70",
			icon: XCircle,
			text: "Идэвхгүй",
		},
		button:
			"bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700",
	};
};

// Stat Card Component
const StatCard = ({
	icon: Icon,
	label,
	value,
	unit,
	color,
}: {
	icon: React.ElementType;
	label: string;
	value: string | number;
	unit?: string;
	color: "blue" | "purple" | "amber" | "indigo";
}) => {
	const colorClasses = {
		blue: {
			border: "border-sky-200/60 dark:border-sky-800/40",
			bg: "bg-sky-50/50 dark:bg-sky-950/30",
			icon: "bg-sky-600 dark:bg-sky-500",
			text: "text-sky-700 dark:text-sky-400",
		},
		purple: {
			border: "border-violet-200/60 dark:border-violet-800/40",
			bg: "bg-violet-50/50 dark:bg-violet-950/30",
			icon: "bg-violet-600 dark:bg-violet-500",
			text: "text-violet-700 dark:text-violet-400",
		},
		amber: {
			border: "border-amber-200/60 dark:border-amber-800/40",
			bg: "bg-amber-50/50 dark:bg-amber-950/30",
			icon: "bg-amber-600 dark:bg-amber-500",
			text: "text-amber-700 dark:text-amber-400",
		},
		indigo: {
			border: "border-indigo-200/60 dark:border-indigo-800/40",
			bg: "bg-indigo-50/50 dark:bg-indigo-950/30",
			icon: "bg-indigo-600 dark:bg-indigo-500",
			text: "text-indigo-700 dark:text-indigo-400",
		},
	};

	const colors = colorClasses[color];

	return (
		<div
			className={`relative overflow-hidden rounded-lg border ${colors.border} ${colors.bg} p-2.5`}
		>
			<div className="relative flex items-center gap-2">
				<div className={`p-1.5 ${colors.icon} rounded-md inline-flex`}>
					<Icon className="w-3.5 h-3.5 text-white" />
				</div>
				<div className="flex-1 min-w-0">
					<p
						className={`text-[10px] font-medium ${colors.text} uppercase tracking-wide`}
					>
						{label}
					</p>
					<p className="text-sm font-semibold text-foreground truncate">
						{value}
						{unit && (
							<span className={`text-[10px] font-normal ${colors.text} ml-0.5`}>
								{unit}
							</span>
						)}
					</p>
				</div>
			</div>
		</div>
	);
};

export default function ExamList({ exams }: ExamListProps) {
	const router = useRouter();
	const [currentIndex, setCurrentIndex] = React.useState(0);
	const [itemsPerPage, setItemsPerPage] = React.useState(4);
	const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);

	React.useEffect(() => {
		const updateItemsPerPage = () => {
			if (window.innerWidth < 640) setItemsPerPage(1);
			else if (window.innerWidth < 1024) setItemsPerPage(2);
			else if (window.innerWidth < 1280) setItemsPerPage(3);
			else setItemsPerPage(4);
		};

		updateItemsPerPage();
		window.addEventListener("resize", updateItemsPerPage);
		return () => window.removeEventListener("resize", updateItemsPerPage);
	}, []);

	const totalPages = Math.ceil(exams.length / itemsPerPage);

	// Auto-play carousel
	React.useEffect(() => {
		if (!isAutoPlaying || totalPages <= 1) return;

		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % totalPages);
		}, 5000);

		return () => clearInterval(interval);
	}, [isAutoPlaying, totalPages]);

	const handleStartExam = (examId: number) => {
		router.push(`/exam/${examId}`);
	};

	if (!exams || exams.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 px-4">
				<HelpCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
				<p className="text-lg font-semibold text-muted-foreground">
					Шалгалт олдсонгүй
				</p>
			</div>
		);
	}

	const startIndex = currentIndex * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentExams = exams.slice(startIndex, endIndex);

	const goToNext = () => {
		setCurrentIndex((prev) => (prev + 1) % totalPages);
		setIsAutoPlaying(false);
	};

	const goToPrev = () => {
		setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
		setIsAutoPlaying(false);
	};

	const goToPage = (pageNum: number) => {
		setCurrentIndex(pageNum);
		setIsAutoPlaying(false);
	};

	return (
		<>
			<div className="relative group">
				{/* Navigation Buttons */}
				{totalPages > 1 && (
					<>
						<Button
							onClick={goToPrev}
							variant="outline"
							size="icon"
							className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/95 backdrop-blur-sm hover:scale-110"
							aria-label="Previous"
						>
							<ChevronLeft className="w-6 h-6" />
						</Button>
						<Button
							onClick={goToNext}
							variant="outline"
							size="icon"
							className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/95 backdrop-blur-sm hover:scale-110"
							aria-label="Next"
						>
							<ChevronRight className="w-6 h-6" />
						</Button>
					</>
				)}

				{/* Cards Container */}
				<div className="overflow-hidden">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-all duration-500 ease-in-out">
						{currentExams.map((exam, index) => {
							const isActive = exam.flag === 1;
							const statusConfig = getStatusConfig(isActive);
							const BadgeIcon = statusConfig.badge.icon;

							return (
								<Card
									key={exam.exam_id}
									className="group/card relative overflow-hidden border border-border hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4"
									style={{
										animationDelay: `${index * 100}ms`,
										animationFillMode: "backwards",
									}}
								>
									{/* Image Section - Placeholder with gradient */}
									<div className="relative w-full h-40 overflow-hidden">
										<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
											<div className="text-center space-y-2">
												<Calendar className="w-12 h-12 text-primary/40 mx-auto" />
												<p className="text-xs font-semibold text-muted-foreground">
													Шалгалт
												</p>
											</div>
										</div>
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

										{/* Status Badge */}
										<div className="absolute top-2 right-2 z-10">
											<Badge
												variant="default"
												className={`shadow-lg backdrop-blur-sm px-2 py-1 border-0 ${statusConfig.badge.className}`}
											>
												<BadgeIcon
													className={`w-3 h-3 mr-1 ${!isActive ? "animate-spin" : ""}`}
												/>
												<span className="font-semibold text-xs">
													{statusConfig.badge.text}
												</span>
											</Badge>
										</div>

										{/* Title */}
										<div className="absolute bottom-0 left-0 right-0 p-3 z-10">
											<h3 className="text-base font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
												{exam.title}
											</h3>
										</div>
									</div>

									<CardContent className="relative z-10 space-y-2.5 p-3">
										{/* Date Card */}
										<div className="relative overflow-hidden rounded-lg border border-sky-200/60 dark:border-sky-800/40 bg-sky-50/50 dark:bg-sky-950/30 p-2.5">
											<div className="relative flex items-center gap-2">
												<div className="p-1.5 bg-sky-600 dark:bg-sky-500 rounded-md">
													<Calendar className="w-3.5 h-3.5 text-white" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-[10px] font-medium text-sky-700 dark:text-sky-400 uppercase tracking-wide">
														Огноо & Цаг
													</p>
													<p className="text-xs font-semibold text-foreground truncate">
														{new Date(exam.ognoo).toLocaleDateString("mn-MN", {
															year: "numeric",
															month: "short",
															day: "numeric",
														})}{" "}
														{new Date(exam.ognoo).toLocaleTimeString("mn-MN", {
															hour: "2-digit",
															minute: "2-digit",
														})}
													</p>
												</div>
											</div>
										</div>

										{/* Stats Grid */}
										<div className="grid grid-cols-2 gap-2">
											<StatCard
												icon={Clock}
												label="Хугацаа"
												value={exam.exam_minute}
												unit="мин"
												color="purple"
											/>
											<StatCard
												icon={User}
												label="Багш"
												value={exam.teach_name}
												color="indigo"
											/>
										</div>
									</CardContent>

									<CardFooter className="relative z-10 p-3 pt-0">
										<Button
											onClick={() => handleStartExam(exam.exam_id)}
											disabled={!isActive}
											className={`w-full h-10 font-medium text-sm rounded-lg ${statusConfig.button} text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
										>
											<span className="flex items-center justify-center gap-2">
												<span>{isActive ? "Эхлүүлэх" : "Идэвхгүй"}</span>
												<ArrowRight className="w-4 h-4" />
											</span>
										</Button>
									</CardFooter>

									{/* Sparkles for active exams */}
									{isActive && (
										<div className="absolute top-2 left-2 z-10">
											<Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
										</div>
									)}
								</Card>
							);
						})}
					</div>
				</div>

				{/* Modern Pagination Indicators */}
				{totalPages > 1 && (
					<div className="flex items-center justify-center gap-3 mt-8">
						{/* Dots */}
						<div className="flex gap-2">
							{Array.from({ length: totalPages }, (_, i) => i).map(
								(pageNum) => (
									<Button
										key={pageNum}
										onClick={() => goToPage(pageNum)}
										className={`relative h-2 rounded-full transition-all duration-300 ${
											pageNum === currentIndex
												? "w-8 bg-primary"
												: "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
										}`}
										aria-label={`Go to page ${pageNum + 1}`}
									>
										{/* Progress bar for current page */}
										{pageNum === currentIndex && isAutoPlaying && (
											<div
												className="absolute inset-0 bg-primary-foreground/30 rounded-full origin-left"
												style={{
													animation: "progress 5s linear",
												}}
											/>
										)}
									</Button>
								),
							)}
						</div>

						{/* Page counter */}
						<div className="text-sm text-muted-foreground font-medium ml-2">
							{currentIndex + 1} / {totalPages}
						</div>
					</div>
				)}
			</div>

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
				
				@keyframes progress {
					from {
						transform: scaleX(0);
					}
					to {
						transform: scaleX(1);
					}
				}
				
				.animate-fadeInUp {
					animation-name: fadeInUp;
					animation-duration: 0.6s;
					animation-timing-function: ease-out;
					opacity: 0;
				}
			`}</style>
		</>
	);
}
