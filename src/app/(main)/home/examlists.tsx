"use client";

import {
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	PlayCircle,
	User,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{exams.map((exam, index) => {
				const isActive = exam.flag === 1;

				return (
					<div
						key={exam.exam_id}
						className={`group relative border rounded-2xl shadow-lg p-6 transition-all duration-500 overflow-hidden hover:shadow-2xl hover:-translate-y-1 ${
							isActive
								? "border-green-200 dark:border-green-800 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10"
								: "border-red-200 dark:border-red-800 bg-gradient-to-br from-white to-red-50/30 dark:from-gray-800 dark:to-red-900/10"
						}`}
						style={{ animationDelay: `${index * 100}ms` }}
					>
						{/* Background gradient orb */}
						<div
							className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -z-0 opacity-30 ${
								isActive
									? "bg-gradient-to-br from-green-400 to-emerald-400"
									: "bg-gradient-to-br from-red-400 to-orange-400"
							}`}
						/>

						{/* Status Badge */}
						<div className="absolute top-4 right-4 z-10">
							<div
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
									isActive
										? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
										: "bg-gradient-to-r from-red-500 to-orange-600 text-white"
								}`}
							>
								{isActive ? (
									<>
										<CheckCircle className="w-3.5 h-3.5" />
										<span>{exam.flag_name}</span>
									</>
								) : (
									<>
										<XCircle className="w-3.5 h-3.5" />
										<span>{exam.flag_name}</span>
									</>
								)}
							</div>
						</div>

						{/* Content */}
						<div className="relative z-10 space-y-4">
							{/* Title */}
							<div className="pr-24">
								<h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
									{exam.title}
								</h3>
							</div>

							{/* Divider */}
							<div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

							{/* Details */}
							<div className="space-y-3">
								{/* Date & Time */}
								<div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
									<div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
										<Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
											Огноо
										</p>
										<p className="text-sm font-medium truncate">
											{new Date(exam.ognoo).toLocaleDateString("mn-MN", {
												year: "numeric",
												month: "2-digit",
												day: "2-digit",
											})}{" "}
											{new Date(exam.ognoo).toLocaleTimeString("mn-MN", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								</div>

								{/* Duration */}
								<div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
									<div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
										<Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
											Хугацаа
										</p>
										<p className="text-sm font-medium">
											{exam.exam_minute} минут
										</p>
									</div>
								</div>

								{/* Teacher */}
								<div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
									<div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
										<User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
											Багш
										</p>
										<p className="text-sm font-medium truncate">
											{exam.teach_name}
										</p>
									</div>
								</div>

								{/* Payment */}
								<div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
									<div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
										<CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
											Төлбөр
										</p>
										<p className="text-sm font-medium truncate">
											{exam.ispaydescr}
										</p>
									</div>
								</div>
							</div>

							{/* Action Button */}
							<div className="pt-2">
								{isActive ? (
									<Button
										onClick={() => handleStartExam(exam.exam_id)}
										className="w-full py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
									>
										<span className="flex items-center justify-center gap-2">
											<PlayCircle className="w-5 h-5" />
											Эхлүүлэх
										</span>
									</Button>
								) : (
									<Button
										disabled
										className="w-full py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-500 dark:text-gray-400 font-semibold rounded-xl shadow-inner cursor-not-allowed"
									>
										<span className="flex items-center justify-center gap-2">
											<XCircle className="w-5 h-5" />
											Идэвхгүй
										</span>
									</Button>
								)}
							</div>
						</div>

						{/* Bottom gradient accent */}
						<div
							className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 ${
								isActive
									? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 scale-x-0 group-hover:scale-x-100"
									: "bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 scale-x-100 opacity-30"
							}`}
						/>
					</div>
				);
			})}
		</div>
	);
}
