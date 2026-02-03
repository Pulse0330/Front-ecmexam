"use client";

import { CheckCircle2 } from "lucide-react";
import StyledBackButton from "@/components/backButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContentView } from "@/types/course/contentView";

interface LessonSidebarProps {
	contents: ContentView[];
	currentLessonIndex: number;
	onLessonSelect: (index: number) => void;
	showBackButton?: boolean; // Нэмэлт prop
}

export function LessonSidebar({
	contents,
	currentLessonIndex,
	onLessonSelect,
	showBackButton = true, // Default утга
}: LessonSidebarProps) {
	return (
		<Card>
			<CardHeader className="pb-3 px-4 pt-4">
				<div className="flex items-center gap-3">
					{showBackButton && <StyledBackButton />}
					<CardTitle className="text-lg">Хичээлүүд</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
					{contents.map((item, index) => {
						const isActive = index === currentLessonIndex;
						return (
							<button
								key={item.content_id}
								onClick={() => onLessonSelect(index)}
								type="button"
								className={`
									w-full text-left py-3 border-b last:border-b-0 transition-all
									${isActive ? "pl-3.5 pr-4 border-l-4 border-l-blue-600 bg-blue-50/30" : "px-4"}
									${isActive ? "bg-blue-50/30" : "hover:bg-blue-50/30"}
								`}
							>
								<div className="flex items-start gap-3">
									<div className="shrink-0 mt-1">
										{item.stu_worked === 1 ? (
											<CheckCircle2 className="h-5 w-5 text-green-600" />
										) : (
											<div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
												<span className="text-xs font-medium">{index + 1}</span>
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0 space-y-1.5">
										<p className="text-sm font-medium line-clamp-2 leading-tight">
											{item.content_name}
										</p>
										<div className="flex items-center gap-2 flex-wrap">
											<Badge
												variant="secondary"
												className="text-xs px-2 py-0.5"
											>
												{item.elesson_type}
											</Badge>
											{item.exam_id && (
												<Badge
													variant="outline"
													className="text-xs px-2 py-0.5 border-orange-300 bg-orange-50"
												>
													Даалгавар
												</Badge>
											)}
										</div>
									</div>
								</div>
							</button>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
