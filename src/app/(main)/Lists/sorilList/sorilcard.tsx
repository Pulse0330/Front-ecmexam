// sorilcard.tsx
"use client";

import { BookOpen, Calendar, CheckCircle, Clock, Play } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SorillistsData } from "@/types/soril/sorilLists";

interface SorilCardProps {
	exam: SorillistsData;
	onClick?: () => void;
}

export const SorilCard: React.FC<SorilCardProps> = ({ exam, onClick }) => {
	const formatDate = (date: Date) => {
		return date.toLocaleDateString("mn-MN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("mn-MN", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const sorilDate = new Date(exam.sorildate);
	const endTime = new Date(sorilDate.getTime() + exam.minut * 60000);

	// isguitset: 0 = эхлээгүй, 1 = дууссан
	// test_resid: 0 = хийгээгүй, > 0 = хийсэн
	const isCompleted = exam.isguitset === 1 && exam.test_resid > 0;

	return (
		<Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-border h-full">
			{/* Зураг хэсэг */}
			<div className="relative h-48 overflow-hidden bg-muted">
				{exam.filename ? (
					<>
						<Image
							src={exam.filename}
							alt={exam.soril_name}
							fill
							className="object-cover group-hover:scale-105 transition-transform duration-300"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							priority={false}
						/>
						{/* Gradient overlay */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
						<div className="text-center">
							<BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-2" />
							<p className="text-xs text-muted-foreground">Зураг байхгүй</p>
						</div>
					</div>
				)}

				{/* Төлвийн badges */}
				<div className="absolute top-3 right-3 flex flex-col gap-2">
					{isCompleted && (
						<Badge className="bg-green-600 hover:bg-green-700 text-white shadow-lg border-0">
							<CheckCircle className="w-3 h-3 mr-1" />
							Дууссан
						</Badge>
					)}
				</div>
			</div>

			<CardContent className="p-5 space-y-4">
				{/* План нэр */}
				{exam.plan_name && (
					<Badge
						variant="secondary"
						className="w-full justify-center text-xs py-1"
					>
						{exam.plan_name.trim()}
					</Badge>
				)}

				{/* Сорилын нэр */}
				<h3 className="text-lg font-bold text-card-foreground line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
					{exam.soril_name}
				</h3>

				{/* Мэдээллийн хэсэг */}
				<div className="space-y-3">
					{/* Эхлэх огноо */}
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-500/10 rounded-lg">
							<Calendar className="w-4 h-4 text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs text-muted-foreground">Эхлэх</p>
							<p className="text-sm font-medium text-card-foreground">
								{formatDate(sorilDate)}
							</p>
						</div>
					</div>

					{/* Дуусах цаг болон асуулт */}
					<div className="grid grid-cols-2 gap-3">
						<div className="flex items-center gap-2">
							<div className="p-2 bg-orange-500/10 rounded-lg">
								<Clock className="w-4 h-4 text-orange-600" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Дуусах</p>
								<p className="text-sm font-medium text-card-foreground">
									{exam.minut > 0 ? formatTime(endTime) : "Хязгааргүй"}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<div className="p-2 bg-green-500/10 rounded-lg">
								<BookOpen className="w-4 h-4 text-green-600" />
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Асуулт</p>
								<p className="text-sm font-medium text-card-foreground">
									{exam.que_cnt}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="h-px bg-border" />

				{/* Төлөв */}
				<div className="flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Төлөв:</span>
					<Badge
						variant={isCompleted ? "default" : "secondary"}
						className="text-xs"
					>
						{isCompleted ? "✓ Гүйцэтгэсэн" : "○ Хүлээгдэж буй"}
					</Badge>
				</div>

				{/* Үйлдлийн товч */}
				<Button
					className="w-full group-hover:scale-105 transition-transform duration-300 h-11"
					variant={isCompleted ? "secondary" : "default"}
					onClick={onClick}
				>
					<Play className="w-4 h-4 mr-2" />
					{exam.flag_name}
				</Button>

				{/* Нэмэлт мэдээлэл */}
				{exam.test_resid > 0 && (
					<div className="pt-3 border-t border-border">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Тест дүн ID:</span>
							<Badge variant="outline" className="font-mono">
								#{exam.test_resid}
							</Badge>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
