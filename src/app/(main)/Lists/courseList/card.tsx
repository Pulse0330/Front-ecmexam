"use client";

import { BookOpen, Eye, Loader2, Star, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CourseContent } from "@/types/course/courseList";

interface CourseCardProps {
	course: CourseContent;
	userId: number;
}

export const CourseCard = ({ course }: CourseCardProps) => {
	const router = useRouter();
	const [isNavigating, setIsNavigating] = useState(false);

	const handleViewCourse = async () => {
		setIsNavigating(true);
		try {
			await router.push(`/course/${course.content_id}`);
		} catch (error) {
			console.error("Navigation error:", error);
			setIsNavigating(false);
		}
	};

	return (
		<Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-border h-full flex flex-col">
			{/* Зураг хэсэг */}
			<div className="relative h-48 overflow-hidden bg-muted -shrink-0">
				{course.filename ? (
					<>
						<Image
							src={course.filename}
							alt={course.course_name}
							fill
							className="object-cover group-hover:scale-105 transition-transform duration-300"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							priority={false}
						/>
						{/* Gradient overlay */}
						<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
						<div className="text-center">
							<BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-2" />
							<p className="text-xs text-muted-foreground">Зураг байхгүй</p>
						</div>
					</div>
				)}

				{/* Төлбөрийн badge */}
				<div className="absolute top-3 right-3">
					{course.ispay === 1 ? (
						<Badge className="bg-green-600 hover:bg-green-700 border-0 shadow-lg">
							✓ Төлбөр төлсөн
						</Badge>
					) : (
						<Badge
							variant="secondary"
							className="bg-white/90 backdrop-blur-sm shadow-lg font-semibold"
						>
							{course.amount.toLocaleString()}₮
						</Badge>
					)}
				</div>
			</div>

			<CardContent className="p-5 space-y-4 -row flex flex-col justify-between">
				<div>
					{/* Хичээлийн нэр */}
					<h3 className="text-lg font-bold text-card-foreground line-clamp-2 min-h-14 group-hover:text-primary transition-colors">
						{course.course_name}
					</h3>

					{/* Контент нэр */}
					{course.content_name && (
						<p className="text-sm text-muted-foreground line-clamp-1 mt-1">
							{course.content_name}
						</p>
					)}

					{/* Мэдээллийн хэсэг */}
					<div className="space-y-3 mt-4">
						{/* Багш */}
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<User className="w-4 h-4 text-primary" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs text-muted-foreground">Багш</p>
								<p className="text-sm font-medium text-card-foreground truncate">
									{course.teach_name}
								</p>
							</div>
						</div>

						{/* Үнэлгээ болон Stats */}
						<div className="grid grid-cols-3 gap-3">
							{/* Үнэлгээ */}
							<div className="flex items-center gap-2">
								<div className="p-2 bg-yellow-500/10 rounded-lg">
									<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground">Үнэлгээ</p>
									<p className="text-sm font-medium text-card-foreground">
										{course.rate}
									</p>
								</div>
							</div>

							{/* Үзсэн */}
							<div className="flex items-center gap-2">
								<div className="p-2 bg-blue-500/10 rounded-lg">
									<Eye className="w-4 h-4 text-blue-600" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground">Үзсэн</p>
									<p className="text-sm font-medium text-card-foreground">
										{course.views}
									</p>
								</div>
							</div>

							{/* Контент */}
							<div className="flex items-center gap-2">
								<div className="p-2 bg-green-500/10 rounded-lg">
									<BookOpen className="w-4 h-4 text-green-600" />
								</div>
								<div>
									<p className="text-xs text-muted-foreground">Контент</p>
									<p className="text-sm font-medium text-card-foreground">
										{course.contentcnt}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-4 pt-4 space-y-3 border-t border-border">
					{/* Төлбөрийн тайлбар */}
					{course.ispay !== 1 && course.paydescr && (
						<div className="rounded-md border-l-4 border-primary bg-primary/5 p-3">
							<p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
								{course.paydescr}
							</p>
						</div>
					)}

					{/* Үйлдлийн товч */}
					<Button
						className="w-full group-hover:scale-105 transition-transform duration-300 h-11"
						onClick={handleViewCourse}
						disabled={isNavigating}
					>
						{isNavigating ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Ачааллаж байна...
							</>
						) : (
							<>
								<BookOpen className="w-4 h-4 mr-2" />
								Хичээл үзэх
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
