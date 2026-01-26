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
import { Card, CardContent } from "@/components/ui/card";
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
			{/* Compact 6-Column Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
				{pastExams.map((exam, index) => {
					const isCompleted = isSorilCompleted(exam.isguitset);

					return (
						<motion.div
							key={exam.exam_id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
							className="h-full"
						>
							<Card
								onClick={() => router.push(`/soril/${exam.exam_id}`)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										router.push(`/soril/${exam.exam_id}`);
									}
								}}
								role="button"
								tabIndex={0}
								aria-label={`${exam.soril_name} сорил нээх`}
								className="group h-full relative overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-md cursor-pointer transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20"
							>
								{/* Compact Image Section */}
								<div className="relative w-full h-20 overflow-hidden">
									{exam.filename ? (
										<Image
											src={exam.filename}
											alt={exam.soril_name}
											fill
											className="object-cover transition-transform duration-700 group-hover:scale-110"
											sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
										/>
									) : (
										<div className="w-full h-full bg-linear-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
											<Sparkles className="w-8 h-8 text-primary/30" />
										</div>
									)}

									{/* Decorative Pattern */}
									<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

									{/* Gradient Overlay */}
									<div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/20 to-transparent" />

									{/* Compact Status Badge */}
									<div className="absolute top-1.5 left-1.5 z-10">
										{isCompleted ? (
											<Badge className="bg-green-500/90 text-white backdrop-blur-sm border-0 px-1.5 py-0 text-[10px] shadow-lg">
												<ClipboardCheck className="w-2.5 h-2.5 mr-0.5" />
												Дууссан
											</Badge>
										) : (
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												transition={{ delay: 0.2 }}
											>
												<Badge className="bg-blue-500/90 text-white backdrop-blur-sm border-0 px-1.5 py-0 text-[10px] shadow-lg">
													<Clock className="w-2.5 h-2.5 mr-0.5" />
													Идэвхтэй
												</Badge>
											</motion.div>
										)}
									</div>

									{/* Compact Date Overlay */}
									<div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur-md border border-border/40 shadow-sm">
										<Calendar className="w-2.5 h-2.5 text-muted-foreground" />
										<span className="text-[10px] font-medium text-foreground">
											{formatSorilDate(exam.sorildate)}
										</span>
									</div>
								</div>

								{/* Compact Card Content */}
								<CardContent className="p-3 pb-11 space-y-2">
									<div className="relative group/title">
										<h3
											className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300"
											title={exam.soril_name}
										>
											{exam.soril_name}
										</h3>

										{/* Tooltip on hover */}
										<div className="absolute left-0 top-full mt-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border z-50 opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all duration-200 pointer-events-none whitespace-normal max-w-xs">
											{exam.soril_name}
											<div className="absolute -top-1 left-4 w-2 h-2 bg-popover border-l border-t border-border rotate-45"></div>
										</div>
									</div>

									{/* Compact Stats Footer */}
									<div className="flex items-center gap-3 pt-1.5 border-t border-border/40">
										<div className="flex items-center gap-1 text-muted-foreground">
											<Clock className="w-3 h-3" />
											<span className="text-[10px] font-medium">
												{exam.minut > 0 ? `${exam.minut}м` : "∞"}
											</span>
										</div>
										<div className="flex items-center gap-1 text-muted-foreground">
											<ClipboardCheck className="w-3 h-3" />
											<span className="text-[10px] font-medium">
												{exam.que_cnt}
											</span>
										</div>
									</div>

									{/* Compact Action Circle */}
									<div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 shadow-sm">
										<ArrowRight className="w-3 h-3 text-primary group-hover:text-primary-foreground group-hover:translate-x-0.5 transition-all" />
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
