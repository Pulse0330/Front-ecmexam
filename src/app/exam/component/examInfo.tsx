// app/exam/component/ExamHeader.tsx
"use client";

import { Calendar, Clock, FileText, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ExamHeaderProps {
	examInfo: {
		title: string;
		descr: string;
		help: string;
		minut: number;
		que_cnt: number;
		exam_type_name: string;
		ognoo: string;
	};
}

export function ExamHeader({ examInfo }: ExamHeaderProps) {
	return (
		<div className=" top-0 z-30  py-3 sm:py-4">
			<div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
				<Card className="border-2 shadow-sm">
					<CardContent className="p-4 sm:p-6">
						{/* Main row */}
						<div className="flex items-center justify-between gap-3 sm:gap-4">
							{/* Left: Title */}
							<div className="min-w-0 flex-1">
								<h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
									{examInfo.title}
								</h1>
								{examInfo.descr && (
									<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate hidden sm:block mt-1">
										{examInfo.descr}
									</p>
								)}
							</div>

							{/* Right: Info badges */}
							<div className="flex items-center gap-2 shrink-0">
								{/* Type badge - Desktop only */}
								<div className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-slate-800">
									<Calendar className="w-4 h-4 text-gray-700 dark:text-gray-300" />
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										{examInfo.exam_type_name}
									</span>
								</div>

								{/* Questions count */}
								<div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-slate-800">
									<FileText className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-700 dark:text-gray-300" />
									<span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
										{examInfo.que_cnt}
										<span className="hidden sm:inline text-gray-600 dark:text-gray-400 font-normal ml-1">
											асуулт
										</span>
									</span>
								</div>

								{/* Duration */}
								<div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-slate-800">
									<Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-700 dark:text-gray-300" />
									<span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
										{examInfo.minut}
										<span className="text-gray-600 dark:text-gray-400 font-normal ml-0.5 sm:ml-1">
											мин
										</span>
									</span>
								</div>
							</div>
						</div>

						{/* Help text */}
						{examInfo.help && (
							<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
								<div className="flex items-start gap-2">
									<Info className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
									<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
										{examInfo.help}
									</p>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
