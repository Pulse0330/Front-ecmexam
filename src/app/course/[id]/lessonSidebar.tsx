"use client";

import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentView } from "@/types/course/contentView";

interface LessonSidebarProps {
	contents: ContentView[];
	currentLessonIndex: number;
	onLessonSelect: (index: number) => void;
}

export function LessonSidebar({
	contents,
	currentLessonIndex,
	onLessonSelect,
}: LessonSidebarProps) {
	return (
		<Card>
			<CardHeader className="pb-3 px-4 pt-4">
				<CardTitle className="text-lg">Хичээлүүд</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
					{contents.map((item, index) => (
						<button
							key={item.content_id}
							onClick={() => onLessonSelect(index)}
							type="button"
							className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
								index === currentLessonIndex
									? "bg-blue-50 border-l-4 border-l-blue-600 pl-3,5"
									: ""
							}`}
						>
							<div className="flex items-start gap-3">
								<div className="shrink-0 mt-1">
									{item.stu_worked === 1 ? (
										<CheckCircle2 className="h-5 w-5 text-green-600" />
									) : (
										<div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
											<span className="text-xs text-gray-500 font-medium">
												{index + 1}
											</span>
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0 space-y-1.5">
									<p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
										{item.content_name}
									</p>
									<div className="flex items-center gap-2 flex-wrap">
										<Badge variant="secondary" className="text-xs px-2 py-0.5">
											{item.elesson_type}
										</Badge>
										{item.exam_id && (
											<Badge
												variant="outline"
												className="text-xs px-2 py-0.5 border-orange-300 text-orange-700 bg-orange-50"
											>
												Даалгавар
											</Badge>
										)}
									</div>
								</div>
							</div>
						</button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
