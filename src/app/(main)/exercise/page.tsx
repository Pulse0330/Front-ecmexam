"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	Clock,
	HelpCircle,
	Sparkles,
	Star,
	Trophy,
	User,
	XCircle,
	Zap,
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
	const year = date.getFullYear();
	const month = MONGOLIAN_MONTHS[date.getMonth()];
	const day = date.getDate();
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	return `${year} оны ${month} ${day}, ${hours}:${minutes}`;
};

const getStatusConfig = (isActive: boolean) => {
	if (isActive) {
		return {
			badge: {
				className:
					"bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 border-emerald-400/50",
				icon: CheckCircle2,
				text: "Идэвхтэй",
				glow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]",
			},
			button:
				"bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-700 shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_30px_rgba(16,185,129,0.5)]",
		};
	}
	return {
		badge: {
			className:
				"bg-linear-to-r from-slate-500 to-slate-600 border-slate-400/50",
			icon: XCircle,
			text: "Идэвхгүй",
			glow: "shadow-[0_0_15px_rgba(100,116,139,0.3)]",
		},
		button:
			"bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-lg",
	};
};

const CARD_GRADIENTS = [
	{
		from: "from-violet-600",
		via: "via-purple-600",
		to: "to-indigo-600",
		accent: "violet",
	},
	{
		from: "from-pink-600",
		via: "via-rose-600",
		to: "to-red-600",
		accent: "pink",
	},
	{
		from: "from-blue-600",
		via: "via-cyan-600",
		to: "to-teal-600",
		accent: "blue",
	},
	{
		from: "from-amber-600",
		via: "via-orange-600",
		to: "to-yellow-600",
		accent: "amber",
	},
	{
		from: "from-emerald-600",
		via: "via-green-600",
		to: "to-teal-600",
		accent: "emerald",
	},
];

const StatCard = ({
	icon: Icon,
	label,
	value,
	unit,
	accentColor,
}: {
	icon: React.ElementType;
	label: string;
	value: string | number;
	unit?: string;
	accentColor: string;
}) => {
	const gradientClasses: Record<string, string> = {
		violet: "from-violet-500 to-violet-600 shadow-violet-500/30",
		pink: "from-pink-500 to-pink-600 shadow-pink-500/30",
		blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
		amber: "from-amber-500 to-amber-600 shadow-amber-500/30",
		emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/30",
	};

	const gradientClass = gradientClasses[accentColor] || gradientClasses.violet;

	return (
		<div className="group/stat relative overflow-hidden rounded-xl border border-border/40 bg-linear-to-br from-background/95 to-muted/30 backdrop-blur-xl p-3.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
			<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
			<div className="relative flex items-center gap-3">
				<div
					className={`p-2.5 rounded-xl bg-linear-to-br ${gradientClass} shadow-lg group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-transform duration-300`}
				>
					<Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 opacity-80">
						{label}
					</p>
					<p className="text-sm font-extrabold text-foreground truncate">
						{value}
						{unit && (
							<span className="text-xs font-medium text-muted-foreground ml-1.5">
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
	const autoplayPlugin = React.useRef(
		Autoplay({ delay: 5000, stopOnInteraction: true }),
	);

	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			loop: true,
			align: "start",
			skipSnaps: false,
		},
		[autoplayPlugin.current],
	);

	const [selectedIndex, setSelectedIndex] = React.useState(0);

	const slides = React.useMemo(() => {
		if (!exams || exams.length === 0) {
			return [];
		}
		const result = [];
		for (let i = 0; i < exams.length; i += 4) {
			result.push(exams.slice(i, i + 4));
		}
		return result;
	}, [exams]);

	const scrollTo = React.useCallback(
		(index: number) => emblaApi?.scrollTo(index),
		[emblaApi],
	);

	const onSelect = React.useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	React.useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		emblaApi.on("select", onSelect);
		emblaApi.on("reInit", onSelect);
	}, [emblaApi, onSelect]);

	const handleStartExam = (examId: number) => {
		router.push(`/exam/${examId}`);
	};

	if (!exams || exams.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-32 px-4">
				<div className="relative mb-8">
					<div className="absolute inset-0 bg-linear-to-r from-primary/20 to-primary/10 blur-3xl rounded-full animate-pulse" />
					<div className="relative w-32 h-32 rounded-3xl bg-linear-to-br from-muted to-muted/50 flex items-center justify-center shadow-2xl">
						<HelpCircle
							className="w-16 h-16 text-muted-foreground"
							strokeWidth={1.5}
						/>
					</div>
				</div>
				<h3 className="text-2xl font-bold text-foreground mb-2">
					Шалгалт олдсонгүй
				</h3>
				<p className="text-base text-muted-foreground">
					Удахгүй шинэ шалгалтууд нэмэгдэх болно
				</p>
			</div>
		);
	}

	return (
		<div className="relative -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
			{/* Carousel Container */}
			<div
				className="overflow-hidden px-3 sm:px-4 md:px-6 lg:px-8"
				ref={emblaRef}
			>
				<div className="flex">
					{slides.map((slideExams) => {
						const slideKey = slideExams.map((e) => e.exam_id).join("-");
						return (
							<div key={slideKey} className="flex-[0_0_100%] min-w-0 pl-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pr-4">
									{slideExams.map((exam) => {
										const isActive = exam.flag === 1;
										const statusConfig = getStatusConfig(isActive);
										const BadgeIcon = statusConfig.badge.icon;
										const gradient =
											CARD_GRADIENTS[exam.exam_id % CARD_GRADIENTS.length];

										return (
											<Card
												key={exam.exam_id}
												className="group/card relative overflow-hidden border-2 border-border/30 hover:border-primary/30 bg-card shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 isolate"
												style={{
													animation: `fadeIn 600ms ease-out backwards`,
												}}
											>
												{/* Animated Background Glow */}
												<div
													className={`absolute inset-0 bg-linear-to-br ${gradient.from} ${gradient.via} ${gradient.to} opacity-0 group-hover/card:opacity-[0.07] blur-2xl transition-opacity duration-700`}
												/>

												{/* Premium Glass Effect Overlay */}
												<div className="absolute inset-0 bg-linear-to-br from-white/[0.07] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

												{/* Header with Dynamic Gradient */}
												<div
													className={`relative h-48 overflow-hidden bg-linear-to-br ${gradient.from} ${gradient.via} ${gradient.to}`}
												>
													{/* Animated Mesh Pattern */}
													<div className="absolute inset-0 opacity-20">
														<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30 group-hover/card:opacity-50 transition-opacity duration-500" />
													</div>

													{/* Dark Gradient Overlay */}
													<div className="absolute inset-0 bg-linear-to-t from-background/98 via-background/60 to-transparent" />

													{/* Premium Sparkles for Active Exams */}
													{isActive && (
														<>
															<div className="absolute top-5 left-5 animate-float">
																<Sparkles
																	className="w-7 h-7 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
																	strokeWidth={2}
																/>
															</div>
															<div
																className="absolute top-7 right-7 animate-float"
																style={{ animationDelay: "0.3s" }}
															>
																<Star
																	className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
																	strokeWidth={2}
																	fill="currentColor"
																/>
															</div>
															<div
																className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-float"
																style={{ animationDelay: "0.6s" }}
															>
																<Zap
																	className="w-5 h-5 text-yellow-200 drop-shadow-[0_0_6px_rgba(254,240,138,0.8)]"
																	strokeWidth={2}
																	fill="currentColor"
																/>
															</div>
															<div
																className="absolute top-1/2 right-8 -translate-y-1/2 animate-float"
																style={{ animationDelay: "0.9s" }}
															>
																<Trophy
																	className="w-5 h-5 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]"
																	strokeWidth={2}
																/>
															</div>
														</>
													)}

													{/* Premium Status Badge */}
													<div className="absolute top-4 right-4 z-10">
														<Badge
															className={`${statusConfig.badge.className} ${statusConfig.badge.glow} backdrop-blur-xl px-3.5 py-1.5 font-bold text-xs border-2 shadow-lg`}
														>
															<BadgeIcon
																className="w-4 h-4 mr-1.5"
																strokeWidth={2.5}
															/>
															{statusConfig.badge.text}
														</Badge>
													</div>

													{/* Title with Enhanced Typography */}
													<div className="absolute bottom-0 left-0 right-0 p-6">
														<h3 className="text-xl font-black text-white leading-tight line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-tight">
															{exam.title}
														</h3>
													</div>

													{/* Decorative Blur Elements */}
													<div className="absolute -right-16 -bottom-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
													<div className="absolute -left-12 top-12 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
												</div>

												<CardContent className="relative p-6 space-y-4">
													{/* Premium Date Card */}
													<div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm p-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group/date">
														<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover/date:opacity-100 transition-opacity duration-300" />
														<div className="relative flex items-center gap-3.5">
															<div className="p-3 rounded-xl bg-linear-to-br from-primary via-primary/90 to-primary/80 shadow-xl shadow-primary/30">
																<Calendar
																	className="w-5 h-5 text-primary-foreground"
																	strokeWidth={2.5}
																/>
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-80">
																	Огноо & Цаг
																</p>
																<p className="text-sm font-extrabold text-foreground truncate leading-tight">
																	{formatMongolianDateTime(exam.ognoo)}
																</p>
															</div>
														</div>
													</div>

													{/* Stats Grid with Enhanced Design */}
													<div className="grid grid-cols-2 gap-3">
														<StatCard
															icon={Clock}
															label="Хугацаа"
															value={exam.exam_minute}
															unit="мин"
															accentColor={gradient.accent}
														/>
														<div className="group/stat relative overflow-hidden rounded-xl border border-border/40 bg-linear-to-br from-background/95 to-muted/30 backdrop-blur-xl p-3.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
															<div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
															<div className="relative flex items-start gap-3">
																<div
																	className={`p-2.5 rounded-xl bg-linear-to-br ${((): string => {
																		const gradientClasses: Record<
																			string,
																			string
																		> = {
																			violet:
																				"from-violet-500 to-violet-600 shadow-violet-500/30",
																			pink: "from-pink-500 to-pink-600 shadow-pink-500/30",
																			blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
																			amber:
																				"from-amber-500 to-amber-600 shadow-amber-500/30",
																			emerald:
																				"from-emerald-500 to-emerald-600 shadow-emerald-500/30",
																		};
																		return (
																			gradientClasses[gradient.accent] ||
																			gradientClasses.violet
																		);
																	})()} shadow-lg group-hover/stat:scale-110 group-hover/stat:rotate-3 transition-transform duration-300 shrink-0`}
																>
																	<User
																		className="w-4 h-4 text-white"
																		strokeWidth={2.5}
																	/>
																</div>
																<div className="flex-1 min-w-0">
																	<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 opacity-80">
																		Багш
																	</p>
																	<p className="text-sm font-extrabold text-foreground wrap-break-words leading-tight">
																		{exam.teach_name}
																	</p>
																</div>
															</div>
														</div>
													</div>
												</CardContent>

												<CardFooter className="relative p-6 pt-0">
													<Button
														onClick={() => handleStartExam(exam.exam_id)}
														disabled={!isActive}
														className={`w-full h-14 font-bold text-base rounded-2xl ${statusConfig.button} text-white transition-all duration-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group/btn relative overflow-hidden`}
													>
														<span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
														<span className="relative flex items-center justify-center gap-3">
															<span className="font-extrabold tracking-wide">
																{isActive ? "Эхлүүлэх" : "Идэвхгүй"}
															</span>
															<ArrowRight
																className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300"
																strokeWidth={2.5}
															/>
														</span>
													</Button>
												</CardFooter>

												{/* Premium Corner Accent */}
												<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-white/5 to-transparent rounded-bl-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
											</Card>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Premium Pagination */}
			{slides.length > 1 && (
				<div className="flex items-center justify-center gap-6 mt-8 sm:mt-10 md:mt-12 px-3 sm:px-4 md:px-6 lg:px-8">
					<div className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-muted/50 backdrop-blur-xl border-2 border-border/50 shadow-lg">
						{slides.map((slide, idx) => (
							<Button
								key={`pagination-${idx}-${slide[0]?.exam_id || idx}`}
								onClick={() => scrollTo(idx)}
								className={`relative transition-all duration-500 rounded-full ${
									idx === selectedIndex
										? "w-12 h-3 bg-linear-to-r from-primary via-primary/80 to-primary shadow-lg shadow-primary/30"
										: "w-3 h-3 bg-muted-foreground/30 hover:bg-muted-foreground/50 hover:scale-125"
								}`}
								aria-label={`Go to slide ${idx + 1}`}
							>
								{idx === selectedIndex && (
									<div className="absolute inset-0 bg-linear-to-r from-primary-foreground/20 to-transparent rounded-full origin-left animate-progress" />
								)}
							</Button>
						))}
					</div>
					<div className="px-5 py-2.5 rounded-full bg-linear-to-r from-primary/10 to-primary/5 backdrop-blur-xl border-2 border-primary/20 shadow-lg">
						<span className="text-sm font-extrabold text-foreground tracking-wide">
							{selectedIndex + 1} / {slides.length}
						</span>
					</div>
				</div>
			)}

			<style jsx>{`
				@keyframes progress {
					from { transform: scaleX(0); }
					to { transform: scaleX(1); }
				}
				
				@keyframes float {
					0%, 100% { transform: translateY(0px) rotate(0deg); }
					50% { transform: translateY(-8px) rotate(5deg); }
				}
				
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}
				
				.animate-progress {
					animation: progress 5s linear;
				}
				
				.animate-float {
					animation: float 3s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
}
