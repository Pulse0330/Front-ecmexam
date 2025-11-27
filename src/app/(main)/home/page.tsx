"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, ClipboardList, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
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
	const [isDay, setIsDay] = useState(true);

	useEffect(() => {
		const hour = new Date().getHours();
		setIsDay(hour >= 6 && hour < 18);
	}, []);

	const gradientClass = isDay
		? "from-blue-400 via-cyan-300 to-sky-200"
		: "from-gray-800 via-gray-900 to-black";

	const textColor = "text-white";

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
				<div className="text-center space-y-6 p-10 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md">
					<div className="relative">
						<div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
						<AlertCircle className="w-16 h-16 mx-auto text-red-500 dark:text-red-400 relative" />
					</div>
					<div className="space-y-2">
						<p className="text-xl font-bold text-gray-800 dark:text-gray-100">
							Хэрэглэгч нэвтрээгүй байна
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Та эхлээд системд нэвтэрч орно уу
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (isHomeLoading || isProfileLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-3xl rounded-full animate-pulse" />
					<UseAnimations
						animation={loading2}
						size={80}
						strokeColor="hsl(var(--primary))"
						loop
					/>
				</div>
				<div className="space-y-3 text-center">
					<p className="text-xl font-bold text-gray-800 dark:text-gray-100 animate-pulse">
						Уншиж байна...
					</p>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Таны мэдээллийг ачааллаж байна
					</p>
				</div>
			</div>
		);
	}

	if (isHomeError || isProfileError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-4">
				<div className="max-w-md w-full bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-2xl">
					<div className="flex items-start space-x-4">
						<div className="relative">
							<div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
							<AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 relative" />
						</div>
						<div className="flex-1 space-y-2">
							<h3 className="font-bold text-lg text-red-700 dark:text-red-300">
								Алдаа гарлаа
							</h3>
							<p className="text-sm text-red-600 dark:text-red-400">
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
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Welcome Header - Enhanced */}
				<div className="animate-in fade-in-0 slide-in-from-top-4 duration-700">
					<div
						className={`relative bg-gradient-to-r ${gradientClass} rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden`}
					>
						{/* Animated background elements */}
						<div className="absolute inset-0 opacity-20">
							<div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
							<div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-75" />
						</div>

						{/* Snowfall effect */}
						<div className="absolute inset-0 pointer-events-none overflow-hidden">
							{[...Array(25)].map(() => {
								const uniqueKey = `snow-${Math.random().toString(36).substr(2, 9)}`;
								return (
									<div
										key={uniqueKey}
										className="absolute w-2 h-2 bg-white rounded-full opacity-70"
										style={{
											left: `${Math.random() * 100}%`,
											top: `${Math.random() * -10}%`,
											animation: `fall ${3 + Math.random() * 2}s linear infinite`,
											animationDelay: `${Math.random() * 5}s`,
										}}
									/>
								);
							})}
						</div>

						{/* Content */}
						<div className="relative z-10 space-y-3">
							<div className="flex items-center gap-3">
								<h1
									className={`text-3xl md:text-4xl font-bold ${textColor} drop-shadow-lg`}
								>
									Сайн уу, {username}
								</h1>
							</div>
							<p className={`${textColor} text-lg md:text-xl drop-shadow-md`}>
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

				{/* Payment Exam Section - Enhanced */}
				<div className="animate-in fade-in-0 duration-700 delay-200">
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
									<BookOpen className="w-6 h-6 text-white" />
								</div>
								<h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
									Төлбөртэй курсууд
								</h2>
							</div>
						</div>
						<PaymentExam courses={homeData?.RetDataSecond || []} />
					</div>
				</div>

				{/* Exam Lists Section - Enhanced */}
				<div className="animate-in fade-in-0 duration-700 delay-300">
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
									<ClipboardList className="w-6 h-6 text-white" />
								</div>
								<h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
									Шалгалтууд
								</h2>
							</div>
							<div className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full border border-emerald-200 dark:border-emerald-800">
								<span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
									{homeData?.RetDataThirt?.length || 0} шалгалт
								</span>
							</div>
						</div>
						{homeData?.RetDataThirt?.length === 0 ? (
							<div className="text-center py-16">
								<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 mb-4">
									<ClipboardList className="w-10 h-10 text-gray-400" />
								</div>
								<p className="text-lg font-medium text-gray-600 dark:text-gray-400">
									Одоогоор шалгалт байхгүй байна
								</p>
							</div>
						) : (
							<ExamLists exams={homeData?.RetDataThirt || []} />
						)}
					</div>
				</div>

				{/* Soril Lists Section - Enhanced */}
				<div className="animate-in fade-in-0 duration-700 delay-400">
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
									<Sparkles className="w-6 h-6 text-white" />
								</div>
								<h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
									Сорилууд
								</h2>
							</div>
							<div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full border border-purple-200 dark:border-purple-800">
								<span className="text-sm font-bold text-purple-700 dark:text-purple-300">
									{homeData?.RetDataFourth?.length || 0} сорил
								</span>
							</div>
						</div>
						{homeData?.RetDataFourth?.length === 0 ? (
							<div className="text-center py-16">
								<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 mb-4">
									<Sparkles className="w-10 h-10 text-gray-400" />
								</div>
								<p className="text-lg font-medium text-gray-600 dark:text-gray-400">
									Одоогоор сорил байхгүй байна
								</p>
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
