"use client";

import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	CircleDashed,
	HelpCircle,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ContentCard } from "@/types/home";

interface HomeSorilListsProps {
	pastExams: ContentCard[];
}

// Helper functions
const getStatusConfig = (isCompleted: boolean) => {
	if (isCompleted) {
		return {
			badge: {
				className: "bg-gradient-to-r from-green-600 to-emerald-600",
				icon: CheckCircle2,
				text: "Гүйцэтгэсэн",
			},
			button: "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600",
			accent:
				"bg-gradient-to-r from-green-500/50 via-emerald-500 to-teal-500/50",
		};
	}

	return {
		badge: {
			className: "bg-gradient-to-r from-orange-600 to-amber-600",
			icon: CircleDashed,
			text: "Гүйцэтгээгүй",
		},
		button: "bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600",
		accent:
			"bg-gradient-to-r from-orange-500/50 via-amber-500 to-yellow-500/50",
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
	color: "blue" | "purple" | "amber";
}) => {
	const colorClasses = {
		blue: {
			border: "border-blue-100 dark:border-blue-900/30",
			bg: "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20",
			orb: "bg-blue-400/10",
			icon: "from-blue-500 to-blue-600",
			text: "text-blue-600 dark:text-blue-400",
		},
		purple: {
			border: "border-purple-100 dark:border-purple-900/30",
			bg: "from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20",
			orb: "bg-purple-400/10",
			icon: "from-purple-500 to-purple-600",
			text: "text-purple-600 dark:text-purple-400",
		},
		amber: {
			border: "border-amber-100 dark:border-amber-900/30",
			bg: "from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
			orb: "bg-amber-400/10",
			icon: "from-amber-500 to-amber-600",
			text: "text-amber-600 dark:text-amber-400",
		},
	};

	const colors = colorClasses[color];

	return (
		<div
			className={`group/item relative overflow-hidden rounded-xl border-2 ${colors.border} bg-linear-to-br ${colors.bg} p-3`}
		>
			<div
				className={`absolute top-0 right-0 w-16 h-16 ${colors.orb} rounded-full blur-xl`}
			/>
			<div className="relative">
				<div
					className={`p-2 bg-linear-to-br ${colors.icon} rounded-lg shadow-md mb-2 inline-flex transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-3`}
				>
					<Icon className="w-4 h-4 text-white" />
				</div>
				<p
					className={`text-xs font-bold ${colors.text} uppercase tracking-wider mb-1`}
				>
					{label}
				</p>
				<p className="text-lg font-black text-foreground">
					{value}
					{unit && (
						<span className={`text-xs font-semibold ${colors.text} ml-1`}>
							{unit}
						</span>
					)}
				</p>
			</div>
		</div>
	);
};

export default function HomeSorilLists({ pastExams }: HomeSorilListsProps) {
	const router = useRouter();

	const handleExamClick = (contentId: number) => {
		router.push(`/soril/${contentId}`);
	};

	if (!pastExams || pastExams.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 px-4">
				<HelpCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
				<p className="text-lg font-semibold text-muted-foreground">
					Сорил олдсонгүй
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{pastExams.map((exam, index) => {
					const isCompleted = exam.ispay === 1;
					const uniqueKey = `exam-${exam.content_id}-${index}`;
					const statusConfig = getStatusConfig(isCompleted);
					const BadgeIcon = statusConfig.badge.icon;

					return (
						<Card
							key={uniqueKey}
							className="group relative overflow-hidden border-2 border-border animate-fadeInUp hover:shadow-2xl transition-all duration-300"
							style={{
								animationDelay: `${index * 100}ms`,
								animationFillMode: "forwards",
							}}
						>
							{/* Image Section */}
							<div className="relative w-full h-56 overflow-hidden">
								{exam.filename ? (
									<>
										<Image
											src={exam.filename}
											alt={exam.content_name || "Шалгалтын зураг"}
											fill
											className="object-cover transition-transform duration-500 group-hover:scale-110"
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											priority={index < 3}
										/>
										<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
										<div className="absolute inset-0 pointer-events-none">
											<div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
											<div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
										</div>
									</>
								) : (
									<div className="absolute inset-0 bg-linear-to-br from-muted via-muted/80 to-muted/60 flex items-center justify-center">
										<HelpCircle className="w-20 h-20 text-muted-foreground/30" />
									</div>
								)}

								{/* Status Badge */}
								<div className="absolute top-4 right-4 z-10">
									<Badge
										variant="default"
										className={`shadow-xl backdrop-blur-md px-3 py-1.5 border-0 ${statusConfig.badge.className}`}
									>
										<BadgeIcon
											className={`w-4 h-4 mr-1.5 ${!isCompleted ? "animate-spin" : ""}`}
										/>
										<span className="font-bold text-sm">
											{statusConfig.badge.text}
										</span>
									</Badge>
								</div>

								{/* Title */}
								<div className="absolute bottom-0 left-0 right-0 p-5 z-10">
									<h3 className="text-xl font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">
										{exam.content_name}
									</h3>
									{exam.teach_name && (
										<p className="text-sm font-medium text-white/80 mt-1">
											{exam.teach_name}
										</p>
									)}
								</div>
							</div>

							<CardContent className="relative z-10 space-y-3 p-5">
								{/* Course Name */}
								<div className="group/item relative overflow-hidden rounded-xl border-2 border-blue-100 dark:border-blue-900/30 bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-3.5">
									<div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl" />
									<div className="relative flex items-center gap-3">
										<div className="p-2.5 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg transition-transform duration-300 group-hover/item:scale-110">
											<Calendar className="w-5 h-5 text-white" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
												Хичээл
											</p>
											<p className="text-sm font-bold text-foreground truncate">
												{exam.course_name}
											</p>
										</div>
									</div>
								</div>

								{/* Stats */}
								<div className="grid grid-cols-2 gap-3">
									<StatCard
										icon={HelpCircle}
										label="Үзсэн"
										value={exam.views}
										unit="удаа"
										color="purple"
									/>
									<StatCard
										icon={Sparkles}
										label="Үнэлгээ"
										value={exam.rate}
										unit="⭐"
										color="amber"
									/>
								</div>

								{/* Content Count */}
								<div className="text-center py-2 px-3 bg-muted rounded-lg">
									<p className="text-sm font-semibold text-muted-foreground">
										Нийт контент:{" "}
										<span className="text-foreground font-bold">
											{exam.contentcnt}
										</span>
									</p>
								</div>
							</CardContent>

							<CardFooter className="relative z-10 p-5 pt-2">
								<Button
									onClick={() => handleExamClick(exam.content_id)}
									className={`group/button w-full h-14 font-bold text-base shadow-lg rounded-xl ${statusConfig.button} text-white hover:scale-105 transition-transform duration-300`}
								>
									<span className="flex items-center justify-center gap-2.5">
										<span>{exam.paydescr || "Эхлүүлэх"}</span>
										<ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-2" />
									</span>
								</Button>
							</CardFooter>

							{/* Bottom Accent */}
							<div
								className={`absolute bottom-0 left-0 right-0 h-1.5 ${statusConfig.accent}`}
							/>

							{/* Sparkles */}
							{isCompleted && (
								<div className="absolute top-4 left-4 z-10">
									<Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
								</div>
							)}
						</Card>
					);
				})}
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
