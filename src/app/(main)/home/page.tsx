// HomePage.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { getHomeScreen, getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { HomeResponseType } from "@/types/home";
import type { UserProfileResponseType } from "@/types/user";
import { BannerCarousel } from "./banner";
import PaymentExam from "./courseexam";
import ExamLists from "./examlists";
import HomeSorilLists from "./sorillists";

export default function HomePage() {
	const { userId } = useAuthStore();

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

	// Not logged in state
	if (!userId) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 p-8 rounded-lg bg-muted border border-border shadow-sm">
					<AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
					<p className="text-foreground font-medium">
						Хэрэглэгч нэвтрээгүй байна.
					</p>
					<p className="text-sm text-muted-foreground">
						Та эхлээд системд нэвтэрнэ үү
					</p>
				</div>
			</div>
		);
	}

	// Loading state
	if (isHomeLoading || isProfileLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
				<div className="relative">
					<div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
					<UseAnimations
						animation={loading2}
						size={64}
						strokeColor="hsl(var(--primary))"
						loop
					/>
				</div>
				<div className="space-y-2 text-center">
					<p className="text-lg font-medium text-foreground animate-pulse">
						Уншиж байна...
					</p>
					<p className="text-sm text-muted-foreground">Түр хүлээнэ үү</p>
				</div>
			</div>
		);
	}

	// Error state
	if (isHomeError || isProfileError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-4">
				<div className="max-w-md w-full bg-destructive/10 border border-destructive/50 rounded-lg p-6 shadow-sm">
					<div className="flex items-start space-x-3">
						<AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
						<div className="flex-1 space-y-2">
							<h3 className="font-semibold text-destructive">Алдаа гарлаа</h3>
							<p className="text-sm text-destructive/80">
								{(homeError as Error)?.message ||
									(profileError as Error)?.message}
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const username = profileData?.RetData?.[0]?.username || "Хэрэглэгч";

	return (
		<div className="min-h-screen  bg-gradient-page">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Welcome Header */}
				<div className="animate-in fade-in-0 slide-in-from-top-4 duration-700">
					<div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 md:p-8 shadow-lg">
						<h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
							Сайн байна уу, {username}
						</h1>
						<p className="text-primary-foreground/90 mt-2">
							Танд өнөөдөр ямар шалгалт бэлтгэх вэ?
						</p>
					</div>
				</div>

				{/* Banner Section */}
				<div className="animate-in fade-in-0 duration-700 delay-100">
					<BannerCarousel banners={homeData?.RetDataFirst || []} />
				</div>

				{/* Payment Exam Section */}
				<div className="animate-in fade-in-0 duration-700 delay-200">
					<div className="bg-card rounded-xl shadow-sm border border-border p-6">
						<div className="flex items-center justify-between mb-4"></div>
						<PaymentExam courses={homeData?.RetDataSecond || []} />
					</div>
				</div>

				{/* Exam Lists Section */}
				<div className="animate-in fade-in-0 duration-700 delay-300">
					<div className="bg-card rounded-xl shadow-sm border border-border p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl md:text-2xl font-bold text-card-foreground">
								Шалгалтууд
							</h2>
							<span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
								{homeData?.RetDataThirt?.length || 0} шалгалт
							</span>
						</div>
						{homeData?.RetDataThirt?.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								<p className="text-lg">Одоогоор шалгалт байхгүй байна</p>
							</div>
						) : (
							<ExamLists exams={homeData?.RetDataThirt || []} />
						)}
					</div>
				</div>

				{/* Soril Lists Section */}
				<div className="animate-in fade-in-0 duration-700 delay-400">
					<div className="bg-card rounded-xl shadow-sm border border-border p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl md:text-2xl font-bold text-card-foreground">
								Сорилууд
							</h2>
							<span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
								{homeData?.RetDataFourth?.length || 0} сорил
							</span>
						</div>
						{homeData?.RetDataFourth?.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								<p className="text-lg">Одоогоор сорил байхгүй байна</p>
							</div>
						) : (
							<HomeSorilLists pastExams={homeData?.RetDataFourth || []} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
