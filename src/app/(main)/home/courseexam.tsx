"use client";

import { Clock, CreditCard, Sparkles, Star, Tag } from "lucide-react";
import type React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Course } from "@/types/home";

interface PaymentExamProps {
	courses: Course[];
}

export const PaymentExam: React.FC<PaymentExamProps> = ({ courses }) => {
	if (!courses || courses.length === 0) {
		return (
			<Alert className="text-center py-16 border-dashed">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
					<Sparkles className="w-10 h-10 text-muted-foreground" />
				</div>
				<AlertDescription className="space-y-2">
					<p className="text-lg font-medium text-muted-foreground">
						Одоогоор курс байхгүй байна
					</p>
					<p className="text-sm text-muted-foreground">
						Тун удахгүй шинэ курсууд нэмэгдэнэ
					</p>
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{courses.map((course, index) => {
				const isAvailable = false;

				return (
					<Card
						key={course.planid}
						className={`group relative overflow-hidden transition-all duration-500 ${
							isAvailable
								? "hover:shadow-2xl hover:-translate-y-2 cursor-pointer border-border"
								: "bg-muted/50 border-border/50"
						}`}
						style={{
							animationDelay: `${index * 100}ms`,
						}}
					>
						{/* Animated gradient orbs */}
						<div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-0 animate-pulse" />
						<div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-0 animate-pulse" />

						{/* Coming Soon Badge */}
						{!isAvailable && (
							<div className="absolute top-4 right-4 z-20">
								<Badge variant="default" className="shadow-lg">
									<Clock className="w-3 h-3 mr-1.5" />
									Тун удахгүй
								</Badge>
							</div>
						)}

						<CardHeader className="relative z-10 space-y-3">
							<div className="flex items-start justify-between gap-3">
								<CardTitle
									className={`text-lg leading-snug line-clamp-2 flex-1 transition-colors duration-300 ${
										isAvailable
											? "group-hover:text-primary"
											: "text-muted-foreground"
									}`}
								>
									{course.title}
								</CardTitle>
								{course.rate && (
									<Badge variant="secondary" className="shrink-0">
										<Star className="w-3.5 h-3.5 mr-1 fill-current" />
										{course.rate}
									</Badge>
								)}
							</div>

							{/* Decorative divider */}
							<div className="relative h-px bg-border" />
						</CardHeader>

						<CardContent className="relative z-10 space-y-3">
							{/* Price Card */}
							<div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border transition-all duration-300 hover:bg-primary/10">
								<div className="p-2.5 bg-primary rounded-lg">
									<Tag className="w-4 h-4 text-primary-foreground" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs font-medium text-muted-foreground mb-0.5">
										Үнэ
									</p>
									<p className="font-bold text-lg text-foreground truncate">
										{course.amount?.toLocaleString() || 0}₮
									</p>
								</div>
							</div>

							{/* Payment Type Card */}
							{course.paydescr && (
								<div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border transition-all duration-300 hover:bg-secondary/80">
									<div className="p-2.5 bg-primary rounded-lg">
										<CreditCard className="w-4 h-4 text-primary-foreground" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium text-muted-foreground mb-0.5">
											Төлбөрийн хэлбэр
										</p>
										<p className="font-semibold text-sm text-foreground truncate">
											{course.paydescr}
										</p>
									</div>
								</div>
							)}
						</CardContent>

						<CardFooter className="relative z-10">
							{isAvailable ? (
								<Button className="w-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
									<span className="flex items-center justify-center gap-2">
										Дэлгэрэнгүй үзэх
										<Sparkles className="w-4 h-4" />
									</span>
								</Button>
							) : (
								<Button
									disabled
									variant="secondary"
									className="w-full cursor-not-allowed"
								>
									<span className="flex items-center justify-center gap-2">
										<Clock className="w-4 h-4 animate-pulse" />
										Тун удахгүй нээгдэнэ
									</span>
								</Button>
							)}
						</CardFooter>

						{/* Bottom accent line */}
						{isAvailable && (
							<div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transition-all duration-500 scale-x-0 group-hover:scale-x-100" />
						)}
					</Card>
				);
			})}
		</div>
	);
};
