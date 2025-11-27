// sorilcard.tsx
"use client";

import { BookOpen, Clock, Play } from "lucide-react";
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
	// Огноог (XX/XX/XXXX) форматаар харуулах
	const formatDate = (date: Date) => {
		return date.toLocaleDateString("mn-MN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	// Цагийг (XX:XX) форматаар харуулах
	const _formatTime = (date: Date) => {
		return date.toLocaleTimeString("mn-MN", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const sorilDate = new Date(exam.sorildate);
	// Дуусах цагийг тооцоолох (Хэрэглэхгүй ч зөв логик)
	const _endTime = new Date(sorilDate.getTime() + exam.minut * 60000);

	// isguitset: 0 = эхлээгүй, 1 = дууссан
	// test_resid: 0 = хийгээгүй, > 0 = хийсэн

	return (
		<Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-border h-full flex flex-col">
			{/* Зураг хэсэг */}
			<div className="relative h-48 overflow-hidden bg-muted flex-shrink-0">
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
			</div>

			<CardContent className="p-5 space-y-4 flex-grow flex flex-col justify-between">
				<div>
					{/* Сорилын нэр */}
					<h3 className="text-lg font-bold text-card-foreground line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
						{exam.soril_name}
					</h3>

					{/* Мэдээллийн хэсэг */}
					<div className="space-y-3 mt-4">
						{/* Эхлэх огноо */}
						<div className="flex items-center gap-3">
							<div className="flex-1 min-w-0">
								<p className="text-xs text-muted-foreground">Эхлэх</p>
								<p className="text-sm font-medium text-card-foreground">
									{formatDate(sorilDate)}
								</p>
							</div>
						</div>

						{/* Хугацаа болон асуулт */}
						<div className="grid grid-cols-2 gap-3">
							{/* Хугацаа */}
							<div className="flex items-center gap-2">
								<div className="p-2 bg-red-500/10 rounded-lg">
									<Clock className="w-4 h-4 text-red-600" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground">Хугацаа</p>
									<p className="text-sm font-medium text-card-foreground">
										{/* Хугацааны минутыг харуулав */}
										{exam.minut > 0 ? `${exam.minut} мин` : "Хязгааргүй"}
									</p>
								</div>
							</div>

							{/* Асуулт */}
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
				</div>

				{/* Footer */}
				<div className="mt-4 pt-4 space-y-3 border-t border-border">
					{/* Төлөв */}
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Үндсэн төлөв:</span>
					</div>

					{/* Үйлдлийн товч */}
					<Button
						className="w-full group-hover:scale-105 transition-transform duration-300 h-11"
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
				</div>
			</CardContent>
		</Card>
	);
};
