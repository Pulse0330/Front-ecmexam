// sorilcard.tsx
"use client";

import { BookOpen, Calendar, Clock, Play } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SorillistsData } from "@/types/soril/sorilLists";

interface SorilCardProps {
	exam: SorillistsData;
	onClick?: () => void;
}

export const SorilCard: React.FC<SorilCardProps> = ({ exam, onClick }) => {
	const formatDate = (date: Date) => {
		return date.toLocaleDateString("mn-MN", {
			month: "2-digit",
			day: "2-digit",
		});
	};

	const sorilDate = new Date(exam.sorildate);

	return (
		<Card className="group relative flex flex-col h-full w-full max-w-[280px] overflow-hidden rounded-xl border border-gray-100 bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
			{/* --- Зураг хэсэг --- */}
			<div className="relative h-32 w-full overflow-hidden bg-gray-50 dark:bg-zinc-800">
				{exam.filename ? (
					<>
						<Image
							src={exam.filename}
							alt={exam.soril_name}
							fill
							className="object-cover transition-transform duration-500 group-hover:scale-110"
							sizes="(max-width: 768px) 100vw, 280px"
							priority={false}
						/>
						{/* Gradient Overlay for text contrast if needed */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-zinc-800">
						<BookOpen className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
					</div>
				)}

				{/* Status Badges - Top Right */}
				<div className="absolute top-2 right-2 flex gap-1">
					{exam.test_resid > 0 && (
						<Badge
							variant="secondary"
							className="bg-white/90 backdrop-blur text-xs font-mono shadow-sm hover:bg-white text-zinc-700 h-5 px-1.5"
						>
							#{exam.test_resid}
						</Badge>
					)}
				</div>
			</div>

			{/* --- Контент хэсэг --- */}
			<CardContent className="flex flex-col flex-grow p-4 gap-3">
				{/* Гарчиг */}
				<div>
					<h3 className="font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 text-[15px] group-hover:text-primary transition-colors">
						{exam.soril_name}
					</h3>

					{/* Огноо - Гарчгийн дор шууд байвал цэгцтэй */}
					<div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
						<Calendar className="w-3.5 h-3.5" />
						<span>{formatDate(sorilDate)}</span>
					</div>
				</div>

				{/* Stats Row - Clean minimalist style */}
				<div className="flex items-center gap-4 mt-auto pt-2">
					<div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
						<Clock className="w-3.5 h-3.5 text-orange-500" />
						<span>{exam.minut > 0 ? `${exam.minut}м` : "∞"}</span>
					</div>
					<div className="w-[1px] h-3 bg-gray-200 dark:bg-gray-700" />{" "}
					{/* Divider */}
					<div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
						<BookOpen className="w-3.5 h-3.5 text-blue-500" />
						<span>{exam.que_cnt} асуулт</span>
					</div>
				</div>
			</CardContent>

			{/* --- Footer / Action Button --- */}
			<div className="p-4 pt-0 mt-auto">
				<Button
					className={cn(
						"w-full h-9 rounded-lg text-sm font-semibold shadow-none transition-all duration-200",
						"bg-gray-900 text-white hover:bg-primary hover:text-primary-foreground dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-primary",
						"group-hover:ring-2 group-hover:ring-primary/20",
					)}
					onClick={onClick}
				>
					<Play className="w-3.5 h-3.5 mr-2 fill-current" />
					{exam.flag_name}
				</Button>
			</div>
		</Card>
	);
};
