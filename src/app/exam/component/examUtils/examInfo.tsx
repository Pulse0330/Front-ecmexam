// app/exam/component/ExamHeader.tsx
"use client";

import { Clock, FileText } from "lucide-react";

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
		<div className="top-0 z-30 py-1">
			<div className="mx-auto px-2 sm:px-4">
				<div className="flex items-center justify-between gap-2 px-3 py-2 border rounded-xl bg-white dark:bg-slate-900 shadow-sm">
					{/* Title */}
					<h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate min-w-0 flex-1">
						{examInfo.title}
					</h1>

					{/* Badges */}
					<div className="flex items-center gap-1.5 shrink-0">
						<div className="flex items-center gap-1 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-800">
							<FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
								{examInfo.que_cnt}
								<span className="hidden sm:inline ml-0.5 font-normal">
									асуулт
								</span>
							</span>
						</div>

						<div className="flex items-center gap-1 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-800">
							<Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
							<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
								{examInfo.minut}
								<span className="ml-0.5 font-normal">мин</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
