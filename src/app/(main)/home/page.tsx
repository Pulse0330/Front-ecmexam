"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, ClipboardList, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getHomeScreen, getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { HomeResponseType } from "@/types/home";
import type { UserProfileResponseType } from "@/types/user";
import { BannerCarousel } from "./banner";
import { PaymentExam } from "./courseexam";
import ExamLists from "./examlists";
import HomeSorilLists from "./sorillists";

// ✅ Component-н гаднаас SNOWFLAKES үүсгэх (render бүр дээр дахин бүү үүсгэ)
const SNOWFLAKES = Array.from({ length: 25 }, (_, i) => ({
	id: `snow-${i}`,
	left: Math.random() * 100,
	top: Math.random() * -10,
	duration: 3 + Math.random() * 2,
	delay: Math.random() * 5,
}));

export default function HomePage() {
	const { userId } = useAuthStore();
	const [isDay, setIsDay] = useState(true);

	useEffect(() => {
		const hour = new Date().getHours();
		setIsDay(hour >= 6 && hour < 18);
	}, []);

	const gradientClass = isDay
		? "from-primary/80 via-primary/60 to-primary/40"
		: "from-secondary via-muted to-background";

	const {
		data: homeData,
		isLoading: isHomeLoading,
		isError: isHomeError,
		error: homeError,
	} = useQuery<HomeResponseType>({
		queryKey: ["homeScreen", userId],
		queryFn: () => getHomeScreen(userId || 0),
		enabled: !!userId,
	});

	const {
		data: profileData,
		isLoading: isProfileLoading,
		isError: isProfileError,
		error: profileError,
	} = useQuery<UserProfileResponseType>({
		queryKey: ["userProfile", userId],
		queryFn: () => getUserProfile(userId || 0),
		enabled: !!userId,
	});

	if (!userId) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Alert className="max-w-md border-destructive/50 bg-destructive/10">
					<div className="flex flex-col items-center text-center space-y-4 py-6">
						<div className="relative">
							<div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full animate-pulse" />
							<AlertCircle className="w-16 h-16 text-destructive relative" />
						</div>
						<AlertDescription className="space-y-2">
							<p className="text-xl font-bold text-foreground">
								Хэрэглэгч нэвтрээгүй байна
							</p>
							<p className="text-sm text-muted-foreground">
								Та эхлээд системд нэвтэрч орно уу
							</p>
						</AlertDescription>
					</div>
				</Alert>
			</div>
		);
	}

	if (isHomeLoading || isProfileLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
				<div className="relative">
					<div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
					<UseAnimations
						animation={loading2}
						size={80}
						strokeColor="hsl(var(--primary))"
						loop
					/>
				</div>
				<div className="space-y-3 text-center">
					<p className="text-xl font-bold text-foreground animate-pulse">
						Уншиж байна...
					</p>
					<p className="text-sm text-muted-foreground">
						Таны мэдээллийг ачааллаж байна
					</p>
				</div>
			</div>
		);
	}

	if (isHomeError || isProfileError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-4">
				<Alert variant="destructive" className="max-w-md">
					<div className="flex items-start space-x-4">
						<AlertCircle className="w-8 h-8 flex-shrink-0" />
						<AlertDescription className="flex-1 space-y-2">
							<h3 className="font-bold text-lg">Алдаа гарлаа</h3>
							<p className="text-sm">
								{(homeError as Error)?.message ||
									(profileError as Error)?.message}
							</p>
						</AlertDescription>
					</div>
				</Alert>
			</div>
		);
	}

	const username = profileData?.RetData?.[0]?.username || "Хэрэглэгч";

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Welcome Header */}
				<div className="animate-in fade-in-0 slide-in-from-top-4 duration-700">
					<div
						className={`relative bg-gradient-to-r ${gradientClass} rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden`}
					>
						{/* Animated background elements */}
						<div className="absolute inset-0 opacity-20">
							<div className="absolute top-10 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse" />
							<div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse delay-75" />
						</div>

						{/* Snowfall effect */}
						<div className="absolute inset-0 pointer-events-none overflow-hidden">
							{SNOWFLAKES.map((flake) => (
								<div
									key={flake.id}
									className="absolute w-2 h-2 bg-primary-foreground rounded-full opacity-70"
									style={{
										left: `${flake.left}%`,
										top: `${flake.top}%`,
										animation: `fall ${flake.duration}s linear infinite`,
										animationDelay: `${flake.delay}s`,
									}}
								/>
							))}
						</div>

						{/* Content */}
						<div className="relative z-10 space-y-3">
							<div className="flex items-center gap-3">
								<h1 className="text-3xl md:text-4xl font-bold text-primary-foreground drop-shadow-lg">
									Сайн уу, {username}
								</h1>
							</div>
							<p className="text-primary-foreground/90 text-lg md:text-xl drop-shadow-md">
								Танд өнөөдөр ямар шалгалт бэлтгэх вэ?
							</p>
						</div>

						<style jsx>{`
							@keyframes fall {
								0% { transform: translateY(0) rotate(0deg); opacity: 1; }
								100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
							}
						`}</style>
					</div>
				</div>

				{/* Banner Section */}
				<div className="animate-in fade-in-0 duration-700 delay-100">
					<BannerCarousel banners={homeData?.RetDataFirst || []} />
				</div>

				{/* Payment Exam Section */}
				<div className="animate-in fade-in-0 duration-700 delay-200">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-primary rounded-xl shadow-lg">
										<BookOpen className="w-6 h-6 text-primary-foreground" />
									</div>
									<h2 className="text-2xl md:text-3xl font-bold text-foreground">
										Төлбөртэй курсууд
									</h2>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<PaymentExam courses={homeData?.RetDataSecond || []} />
						</CardContent>
					</Card>
				</div>

				{/* Exam Lists Section */}
				<div className="animate-in fade-in-0 duration-700 delay-300">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-primary rounded-xl shadow-lg">
										<ClipboardList className="w-6 h-6 text-primary-foreground" />
									</div>
									<h2 className="text-2xl md:text-3xl font-bold text-foreground">
										Шалгалтууд
									</h2>
								</div>
								<Badge variant="secondary">
									{homeData?.RetDataThirt?.length || 0} шалгалт
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							{homeData?.RetDataThirt?.length === 0 ? (
								<div className="text-center py-16">
									<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
										<ClipboardList className="w-10 h-10 text-muted-foreground" />
									</div>
									<p className="text-lg font-medium text-muted-foreground">
										Одоогоор шалгалт байхгүй байна
									</p>
								</div>
							) : (
								<ExamLists exams={homeData?.RetDataThirt || []} />
							)}
						</CardContent>
					</Card>
				</div>

				{/* Soril Lists Section */}
				<div className="animate-in fade-in-0 duration-700 delay-400">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-primary rounded-xl shadow-lg">
										<Sparkles className="w-6 h-6 text-primary-foreground" />
									</div>
									<h2 className="text-2xl md:text-3xl font-bold text-foreground">
										Сорилууд
									</h2>
								</div>
								<Badge variant="secondary">
									{homeData?.RetDataFourth?.length || 0} сорил
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							{homeData?.RetDataFourth?.length === 0 ? (
								<div className="text-center py-16">
									<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
										<Sparkles className="w-10 h-10 text-muted-foreground" />
									</div>
									<p className="text-lg font-medium text-muted-foreground">
										Одоогоор сорил байхгүй байна
									</p>
								</div>
							) : (
								<HomeSorilLists pastExams={homeData?.RetDataFourth || []} />
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
