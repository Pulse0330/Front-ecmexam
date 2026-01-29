"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	ClipboardCheck,
	Clock,
	HelpCircle,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatSorilDate, isSorilCompleted, type PastExam } from "@/types/home";

interface HomeSorilListsProps {
	pastExams: PastExam[];
}

export default function HomeSorilLists({ pastExams }: HomeSorilListsProps) {
	const router = useRouter();

	if (!pastExams?.length)
		return (
			<div className="flex flex-col items-center py-24 opacity-40">
				<HelpCircle className="w-12 h-12 mb-4 stroke-[1.5px]" />
				<p className="font-bold tracking-tight">Сорил олдсонгүй</p>
			</div>
		);

	return (
		<div className="px-2">
			{/* Grid - Responsive columns */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
				{pastExams.map((exam, index) => {
					const isCompleted = isSorilCompleted(exam.isguitset);

					return (
						<motion.div
							key={exam.exam_id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.05 }}
							className="h-full"
						>
							<button
								type="button"
								onClick={() => router.push(`/soril/${exam.exam_id}`)}
								aria-label={`${exam.soril_name} сорил нээх`}
								className="group h-full w-full relative flex flex-col border border-border/40 bg-card/50 backdrop-blur-md cursor-pointer transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 rounded-lg sm:rounded-xl overflow-hidden text-left"
							>
								{/* Image Header - Fixed aspect ratio */}
								<div className="relative w-full aspect-4/2 bg-muted shrink-0">
									{exam.filename ? (
										<Image
											src={exam.filename}
											alt={exam.soril_name}
											fill
											quality={90}
											priority={index < 6}
										/>
									) : (
										<div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
											<Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary/30" />
										</div>
									)}

									{/* Gradient Overlay */}
									<div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/50 to-transparent" />

									{/* Status Badge on image - Responsive */}
									<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
										{isCompleted ? (
											<Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
												Гүйцэтгэсэн
											</Badge>
										) : (
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												transition={{ delay: 0.2 }}
											>
												<Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
													Гүйцэтгээгүй
												</Badge>
											</motion.div>
										)}
									</div>

									{/* Date on Image - Responsive */}
									<div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 z-10">
										<div className="flex items-center gap-1 sm:gap-1.5">
											<Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-white/90 shrink-0" />
											<span className="font-medium text-[8px] sm:text-[9px] md:text-xs text-white/90 truncate">
												{formatSorilDate(exam.sorildate)}
											</span>
										</div>
									</div>
								</div>

								{/* Content Section - Responsive padding */}
								<div className="p-1.5 sm:p-2 md:p-3 pb-9 sm:pb-10 md:pb-12 flex flex-col flex-1 space-y-1.5 sm:space-y-2 md:space-y-3">
									{/* Title Section - Responsive */}
									<div className="space-y-0.5 flex-1 min-h-0">
										<h3
											className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300"
											title={exam.soril_name}
										>
											{exam.soril_name}
										</h3>
									</div>

									{/* Stats Grid - Responsive */}
									<div className="space-y-1 sm:space-y-1.5">
										<div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 pt-1 sm:pt-1.5 md:pt-2 border-t border-border/50">
											<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
												<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 shrink-0" />
												<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
													{exam.minut > 0 ? `${exam.minut} минут` : "∞"}
												</span>
											</div>
											<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
												<ClipboardCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 shrink-0" />
												<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
													{exam.que_cnt} асуулт
												</span>
											</div>
										</div>
									</div>

									{/* Action Button - Responsive */}
									<div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 md:bottom-3 md:right-3 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-foreground group-hover:scale-110 transition-all duration-300">
										<ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
									</div>
								</div>
							</button>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
