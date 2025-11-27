"use client";

import {
	Calendar,
	CheckCircle2,
	CircleDashed,
	Clock,
	HelpCircle,
	PlayCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
					<div
						key={exam.exam_id}
						className="group relative border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
						style={{ animationDelay: `${index * 100}ms` }}
					>
						{/* Image Section */}
						<div className="relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
							{exam.filename ? (
								<>
									<Image
										src={exam.filename}
										alt={exam.soril_name}
										fill
										className="object-cover transition-transform duration-500 group-hover:scale-110"
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									/>
									{/* Image overlay gradient */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
								</>
							) : (
								<div className="absolute inset-0 flex items-center justify-center">
									<HelpCircle className="w-16 h-16 text-gray-400 dark:text-gray-500" />
								</div>
							)}

							{/* Status Badge on Image */}
							<div className="absolute top-3 right-3 z-10">
								<div
									className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
										isCompleted
											? "bg-green-500/90 text-white"
											: "bg-orange-500/90 text-white"
									}`}
								>
									{isCompleted ? (
										<>
											<CheckCircle2 className="w-3.5 h-3.5" />
											<span>Гүйцэтгэсэн</span>
										</>
									) : (
										<>
											<CircleDashed className="w-3.5 h-3.5" />
											<span>Гүйцэтгээгүй</span>
										</>
									)}
								</div>
							</div>
						</div>

						{/* Content Section */}
						<div className="p-5 space-y-4">
							{/* Title */}
							<h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
								{exam.soril_name}
							</h3>

							{/* Divider */}
							<div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

							{/* Info Cards */}
							<div className="space-y-2.5">
								{/* Date */}
								<div className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
									<div className="p-1.5 bg-blue-500 rounded-lg">
										<Calendar className="w-3.5 h-3.5 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">
											Огноо
										</p>
										<p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
											{exam.sorildate !== "1900-01-01T00:00:00.000Z"
												? new Date(exam.sorildate).toLocaleDateString("mn-MN", {
														year: "numeric",
														month: "2-digit",
														day: "2-digit",
														hour: "2-digit",
														minute: "2-digit",
													})
												: "Хугацаагүй"}
										</p>
									</div>
								</div>

								{/* Questions & Duration */}
								<div className="grid grid-cols-2 gap-2.5">
									{/* Questions */}
									<div className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
										<div className="p-1.5 bg-purple-500 rounded-lg">
											<HelpCircle className="w-3.5 h-3.5 text-white" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-0.5">
												Асуулт
											</p>
											<p className="text-xs font-bold text-gray-700 dark:text-gray-300">
												{exam.que_cnt}
											</p>
										</div>
									</div>

									{/* Duration */}
									{exam.minut > 0 && (
										<div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
											<div className="p-1.5 bg-amber-500 rounded-lg">
												<Clock className="w-3.5 h-3.5 text-white" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-0.5">
													Хугацаа
												</p>
												<p className="text-xs font-bold text-gray-700 dark:text-gray-300">
													{exam.minut}м
												</p>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Action Button */}
							<div className="pt-2">
								<Button
									onClick={() => handleExamClick(exam.exam_id)}
									className={`w-full py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
										isCompleted ? "" : ""
									}`}
								>
									<span className="flex items-center justify-center gap-2">
										<PlayCircle className="w-5 h-5" />
										{isCompleted ? "Эхлүүлэх" : "Эхлүүлэх"}
									</span>
								</Button>
							</div>
						</div>

						{/* Bottom gradient accent */}
						<div
							className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 ${
								isCompleted
									? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
									: "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
							} scale-x-0 group-hover:scale-x-100`}
						/>
					</div>
				);
			})}
		</div>
	);
}
