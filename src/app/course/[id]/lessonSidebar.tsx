"use client";

import { CheckCircle2 } from "lucide-react";
import StyledBackButton from "@/components/backButton";
import type { ContentView } from "@/types/course/contentView";

interface LessonSidebarProps {
	contents: ContentView[];
	currentLessonIndex: number;
	onLessonSelect: (index: number) => void;
	showBackButton?: boolean;
}

export function LessonSidebar({
	contents,
	currentLessonIndex,
	onLessonSelect,
	showBackButton = true,
}: LessonSidebarProps) {
	const doneCount = contents.filter((c) => c.stu_worked === 1).length;

	return (
		<div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
			<div className="flex items-center gap-3 border-b px-4 py-3">
				{showBackButton && <StyledBackButton />}
				<div className="min-w-0">
					<h2 className="text-base font-semibold text-foreground">Хичээлүүд</h2>
					{contents.length > 0 && (
						<p className="text-xs text-muted-foreground">
							{doneCount} / {contents.length} үзсэн
						</p>
					)}
				</div>
			</div>
			<div className="max-h-[600px] overflow-y-auto scrollbar-thin">
				{contents.length === 0 && (
					<p className="px-4 py-6 text-center text-sm text-muted-foreground">
						Хичээл алга байна
					</p>
				)}
				{contents.map((item, index) => {
					const isActive = index === currentLessonIndex;
					const isCompleted = item.stu_worked === 1;

					return (
						<button
							key={item.content_id}
							onClick={() => onLessonSelect(index)}
							type="button"
							aria-current={isActive ? "step" : undefined}
							className={`w-full border-b py-3 text-left transition-colors last:border-b-0 ${
								isActive
									? "border-l-4 border-l-primary bg-primary/10 pr-4 pl-3"
									: "px-4 hover:bg-muted/60"
							}`}
						>
							<div className="flex items-start gap-3">
								<div className="mt-0.5 shrink-0">
									{isCompleted ? (
										<CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
									) : (
										<span
											className={`flex size-6 items-center justify-center rounded-full border-2 text-xs font-semibold ${
												isActive
													? "border-primary text-primary"
													: "border-border text-muted-foreground"
											}`}
										>
											{index + 1}
										</span>
									)}
								</div>
								<div className="min-w-0 flex-1 space-y-1.5">
									<p
										className={`line-clamp-2 text-sm leading-snug ${
											isActive
												? "font-semibold text-primary"
												: "font-medium text-foreground"
										}`}
									>
										{item.content_name}
									</p>
									<div className="flex flex-wrap items-center gap-1.5">
										{item.elesson_type && (
											<span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
												{item.elesson_type}
											</span>
										)}
										{item.exam_id && (
											<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
												Даалгавар
											</span>
										)}
										{isCompleted && (
											<span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
												Үзсэн
											</span>
										)}
									</div>
								</div>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
