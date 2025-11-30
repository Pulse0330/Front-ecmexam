"use client";

import {
	Calendar,
	CheckCircle2,
	CircleDashed,
	Clock,
	HelpCircle,
	PlayCircle,
	ArrowRight,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { PastExam } from "@/types/home";

interface PastExamListProps {
	pastExams: PastExam[];
}

export default function HomeSorilLists({ pastExams }: PastExamListProps) {
	const router = useRouter();

	const handleExamClick = (examId: number) => {
		router.push(`/soril/${examId}`);
	};

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{pastExams.map((exam, index) => {
				const isCompleted = exam.isguitset === 0;

				return (
					<Card
						key={exam.exam_id}
						className="group relative overflow-hidden border-2 border-border animate-fadeInUp"
						style={{
							animationDelay: `${index * 100}ms`,
							animationFillMode: 'forwards',
						}}
					>
						{/* Image Section with Gradient Overlay */}
						<div className="relative w-full h-56 overflow-hidden">
							{exam.filename ? (
								<>
									<Image
										src={exam.filename}
										alt={exam.soril_name}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									/>
									{/* Gradient overlay */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
									
									{/* Decorative orbs */}
									<div className="absolute inset-0 pointer-events-none">
										<div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
										<div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
									</div>
								</>
							) : (
								<div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60 flex items-center justify-center">
									<HelpCircle className="w-20 h-20 text-muted-foreground/30" />
								</div>
							)}

							{/* Status Badge */}
							<div className="absolute top-4 right-4 z-10">
								<Badge
									variant={isCompleted ? "default" : "secondary"}
									className={`shadow-xl backdrop-blur-md px-3 py-1.5 border-0 ${
										isCompleted
											? "bg-gradient-to-r from-green-600 to-emerald-600"
											: "bg-gradient-to-r from-orange-600 to-amber-600"
									}`}
								>
									{isCompleted ? (
										<>
											<CheckCircle2 className="w-4 h-4 mr-1.5" />
											<span className="font-bold text-sm">Гүйцэтгэсэн</span>
										</>
									) : (
										<>
											<CircleDashed className="w-4 h-4 mr-1.5 animate-spin" />
											<span className="font-bold text-sm">Гүйцэтгээгүй</span>
										</>
									)}
								</Badge>
							</div>

							{/* Title Overlay on Image */}
							<div className="absolute bottom-0 left-0 right-0 p-5 z-10">
								<h3 className="text-xl font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">
									{exam.soril_name}
								</h3>
							</div>
						</div>

						<CardContent className="relative z-10 space-y-3 p-5">
							{/* Date Card */}
							<div className="group/item relative overflow-hidden rounded-xl border-2 border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-3.5">
								<div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl" />
								<div className="relative flex items-center gap-3">
									<div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-3">
										<Calendar className="w-5 h-5 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
											Огноо & Цаг
										</p>
										<p className="text-sm font-bold text-foreground truncate">
											{exam.sorildate !== "1900-01-01T00:00:00.000Z"
												? new Date(exam.sorildate).toLocaleDateString("mn-MN", {
														year: "numeric",
														month: "long",
														day: "numeric",
													})
												: "Хугацаагүй"}
										</p>
										{exam.sorildate !== "1900-01-01T00:00:00.000Z" && (
											<p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
												{new Date(exam.sorildate).toLocaleTimeString("mn-MN", {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Questions & Duration Grid */}
							<div className="grid grid-cols-2 gap-3">
								{/* Questions */}
								<div className="group/item relative overflow-hidden rounded-xl border-2 border-purple-100 dark:border-purple-900/30 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 p-3">
									<div className="absolute top-0 right-0 w-16 h-16 bg-purple-400/10 rounded-full blur-xl" />
									<div className="relative">
										<div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md mb-2 inline-flex transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-3">
											<HelpCircle className="w-4 h-4 text-white" />
										</div>
										<p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
											Асуулт
										</p>
										<p className="text-lg font-black text-foreground">
											{exam.que_cnt}
											<span className="text-xs font-semibold text-purple-600 dark:text-purple-400 ml-1">
												ш
											</span>
										</p>
									</div>
								</div>

								{/* Duration */}
								<div className="group/item relative overflow-hidden rounded-xl border-2 border-amber-100 dark:border-amber-900/30 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 p-3">
									<div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-full blur-xl" />
									<div className="relative">
										<div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-md mb-2 inline-flex transition-transform duration-300 group-hover/item:scale-110 group-hover/item:rotate-3">
											<Clock className="w-4 h-4 text-white" />
										</div>
										<p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
											Хугацаа
										</p>
										<p className="text-lg font-black text-foreground">
											{exam.minut > 0 ? exam.minut : "∞"}
											<span className="text-xs font-semibold text-amber-600 dark:text-amber-400 ml-1">
												{exam.minut > 0 ? "мин" : ""}
											</span>
										</p>
									</div>
								</div>
							</div>
						</CardContent>

						<CardFooter className="relative z-10 p-5 pt-2">
							<Button
								onClick={() => handleExamClick(exam.exam_id)}
								className={`group/button w-full h-14 font-bold text-base shadow-lg rounded-xl ${
									isCompleted
										? "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white"
										: "bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white"
								}`}
							>
								<span className="flex items-center justify-center gap-2.5">
									<span>Эхлүүлэх</span>
									<ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-2" />
								</span>
							</Button>
						</CardFooter>

						{/* Bottom Gradient Accent */}
						<div
							className={`absolute bottom-0 left-0 right-0 h-1.5 ${
								isCompleted
									? "bg-gradient-to-r from-green-500/50 via-emerald-500 to-teal-500/50"
									: "bg-gradient-to-r from-orange-500/50 via-amber-500 to-yellow-500/50"
							}`}
						/>

						{/* Sparkles decoration for completed */}
						{isCompleted && (
							<div className="absolute top-4 left-4 z-10">
								<Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
							</div>
						)}
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