"use client";

import {
	Clock,
	CreditCard,
	Sparkles,
	Star,
	Tag,
	TrendingUp,
} from "lucide-react";
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
			<Alert className="text-center py-16 border-dashed border-2">
				<div className="flex flex-col items-center space-y-4">
					<div className="relative">
						<div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
						<div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/5 border-2 border-primary/20">
							<Sparkles className="w-10 h-10 text-primary animate-pulse" />
						</div>
					</div>
					<AlertDescription className="space-y-2">
						<p className="text-xl font-bold text-foreground">
							Одоогоор курс байхгүй байна
						</p>
						<p className="text-sm text-muted-foreground max-w-sm">
							Тун удахгүй шинэ курсууд нэмэгдэх тул манай сайтад байнга зочилж
							байгаарай
						</p>
					</AlertDescription>
				</div>
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
						className={`group relative overflow-hidden transition-all duration-500 border-2 ${
							isAvailable
								? "hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 cursor-pointer border-border hover:border-primary/50"
								: "bg-linear-to-br from-muted/30 to-muted/10 border-border/50"
						}`}
						style={{
							animationDelay: `${index * 100}ms`,
						}}
					>
						{/* Gradient Background Effects */}
						<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

						{/* Animated Orbs */}
						<div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
						<div className="absolute -bottom-20 -left-20 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse delay-75" />

						{/* Coming Soon Badge - Top Right */}
						{!isAvailable && (
							<div className="absolute top-4 right-4 z-20">
								<Badge
									variant="default"
									className="shadow-lg backdrop-blur-sm bg-primary/90 border border-primary-foreground/10 px-3 py-1"
								>
									<Clock className="w-3 h-3 mr-1.5 animate-pulse" />
									<span className="font-semibold">Тун удахгүй</span>
								</Badge>
							</div>
						)}

						{/* Popular/Featured Badge - Top Left */}
						{isAvailable && course.rate && Number(course.rate) >= 4.5 && (
							<div className="absolute top-4 left-4 z-20">
								<Badge
									variant="secondary"
									className="shadow-lg backdrop-blur-sm bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1"
								>
									<TrendingUp className="w-3 h-3 mr-1.5" />
									<span className="font-semibold">Алдартай</span>
								</Badge>
							</div>
						)}

						<CardHeader className="relative z-10 space-y-4 pb-4">
							<div className="flex items-start justify-between gap-3">
								<CardTitle
									className={`text-lg font-bold leading-tight line-clamp-2 flex-1 transition-all duration-300 ${
										isAvailable
											? "group-hover:text-primary group-hover:translate-x-1"
											: "text-muted-foreground"
									}`}
								>
									{course.title}
								</CardTitle>
								{course.rate && (
									<Badge
										variant="secondary"
										className="shrink-0 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
									>
										<Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" />
										<span className="font-bold">{course.rate}</span>
									</Badge>
								)}
							</div>
						</CardHeader>

						<CardContent className="relative z-10 space-y-3 pb-4">
							{/* Price Card with Gradient */}
							<div className="group/price relative overflow-hidden rounded-xl border-2 border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
								<div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl z-0" />

								<div className="relative flex items-center gap-3">
									<div className="p-3 bg-linear-to-br from-primary to-primary/80 rounded-xl shadow-lg group-hover/price:scale-110 transition-transform duration-300">
										<Tag className="w-5 h-5 text-primary-foreground" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
											Үнэ
										</p>
										<p className="font-black text-2xl bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
											{course.amount?.toLocaleString() || 0}₮
										</p>
									</div>
								</div>
							</div>

							{/* Payment Type Card */}
							{course.paydescr && (
								<div className="group/payment relative overflow-hidden rounded-xl border-2 bg-secondary/50 backdrop-blur-sm p-4 transition-all duration-300 hover:bg-secondary/70 hover:shadow-md">
									<div className="flex items-center gap-3">
										<div className="p-3 bg-linear-to-br from-primary to-primary/80 rounded-xl shadow-md group-hover/payment:scale-110 transition-transform duration-300">
											<CreditCard className="w-5 h-5 text-primary-foreground" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
												Төлбөрийн хэлбэр
											</p>
											<p className="font-bold text-sm text-foreground truncate">
												{course.paydescr}
											</p>
										</div>
									</div>
								</div>
							)}
						</CardContent>

						<CardFooter className="relative z-10 pt-2">
							{isAvailable ? (
								<Button className="w-full h-12 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-bold text-base bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
									<span className="flex items-center justify-center gap-2">
										<span>Дэлгэрэнгүй үзэх</span>
										<Sparkles className="w-5 h-5" />
									</span>
								</Button>
							) : (
								<Button
									disabled
									variant="secondary"
									className="w-full h-12 cursor-not-allowed bg-muted/50 hover:bg-muted/50 font-semibold"
								>
									<span className="flex items-center justify-center gap-2">
										<Clock className="w-4 h-4 animate-pulse" />
										<span>Тун удахгүй нээгдэнэ</span>
									</span>
								</Button>
							)}
						</CardFooter>

						{/* Bottom Gradient Accent Line */}
						{isAvailable && (
							<div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent transition-all duration-500 scale-x-0 group-hover:scale-x-100" />
						)}

						{/* Hover Shine Effect */}
						{isAvailable && (
							<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
								<div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
							</div>
						)}
					</Card>
				);
			})}
		</div>
	);
};
