"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Award,
	ChevronRight,
	Target,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getHomeScreen, getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import type { HomeResponseType } from "@/types/home";
import type { UserProfileResponseType } from "@/types/user";
import UnifiedHeroSection from "./courseexam";
import ExamLists from "./examlists";
import HomeSorilLists from "./sorillists";

const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
	id: `particle-${i}`,
	x: Math.random() * 100,
	y: Math.random() * 100,
	size: Math.random() * 4 + 1,
	duration: Math.random() * 20 + 10,
	delay: Math.random() * 5,
}));

const _FLOATING_ICONS = [
	{ id: "award", Icon: Award, color: "text-amber-400", delay: 0 },
	{ id: "target", Icon: Target, color: "text-emerald-400", delay: 1 },
	{ id: "trending", Icon: TrendingUp, color: "text-blue-400", delay: 2 },
];

export default function HomePage() {
	const { userId } = useAuthStore();
	const [_isDay, setIsDay] = useState(true);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const hour = new Date().getHours();
		setIsDay(hour >= 6 && hour < 18);

		const handleMouseMove = (e: MouseEvent) => {
			setMousePosition({
				x: (e.clientX / window.innerWidth - 0.5) * 20,
				y: (e.clientY / window.innerHeight - 0.5) * 20,
			});
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

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

	const { setProfile } = useUserStore();

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

	useEffect(() => {
		if (profileData?.RetData?.length) {
			setProfile(profileData.RetData[0]);
		}
	}, [profileData, setProfile]);

	if (!userId) {
		return <div className="flex items-center justify-center min-h-[60vh]" />;
	}

	if (isHomeLoading || isProfileLoading) {
		return (
			<div className="flex items-center justify-center min-h-[70vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
			</div>
		);
	}

	if (isHomeError || isProfileError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-4">
				<Alert
					variant="destructive"
					className="max-w-md w-full shadow-2xl border-2"
				>
					<div className="flex items-start space-x-3">
						<AlertCircle className="w-8 h-8 shrink-0 mt-0.5" />
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
		<div className="min-h-screen bg-linear-to-br from-background via-muted/30 to-background relative overflow-hidden">
			{/* Animated Background */}
			<div className="fixed inset-0 pointer-events-none">
				{/* Gradient Orbs */}
				<div
					className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-linear-to-r from-violet-500/20 to-purple-500/20 dark:from-violet-600/30 dark:to-purple-600/30 rounded-full blur-3xl animate-pulse"
					style={{
						transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
						transition: "transform 0.5s ease-out",
					}}
				/>
				<div
					className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-linear-to-r from-pink-500/20 to-rose-500/20 dark:from-pink-600/30 dark:to-rose-600/30 rounded-full blur-3xl animate-pulse"
					style={{
						animationDelay: "1s",
						transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
						transition: "transform 0.5s ease-out",
					}}
				/>
				<div
					className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-linear-to-r from-blue-500/15 to-cyan-500/15 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl animate-pulse"
					style={{
						animationDelay: "2s",
						transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
						transition: "transform 0.5s ease-out",
					}}
				/>

				{/* Animated Particles */}
				{PARTICLES.map((particle) => (
					<div
						key={particle.id}
						className="absolute bg-foreground/10 dark:bg-white/20 rounded-full backdrop-blur-sm"
						style={{
							left: `${particle.x}%`,
							top: `${particle.y}%`,
							width: `${particle.size}px`,
							height: `${particle.size}px`,
							animation: `float ${particle.duration}s ease-in-out infinite`,
							animationDelay: `${particle.delay}s`,
						}}
					/>
				))}

				{/* Grid Pattern */}
				<div
					className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size[100px_100px] mask[radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)]"
					style={{
						transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
						transition: "transform 0.3s ease-out",
					}}
				/>
			</div>

			<div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 relative z-10">
				{/* Premium Hero Section */}
				<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
					<UnifiedHeroSection username={username} />
				</div>

				{/* Exam Lists Section - Only show if exams exist */}
				{homeData?.RetDataThirt && homeData.RetDataThirt.length > 0 && (
					<>
						{/* Section Divider */}
						<div className="py-4">
							<div className="w-full border-t border-border" />
							<div className="flex flex-col mt-4">
								<div className="flex justify-center">
									<span className="px-4 py-1.5 text-xs font-bold ">
										Идэвхтэй шалгалтууд
									</span>
								</div>
								<div className="flex justify-end mt-2">
									<a
										href="Lists\examList"
										className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 hover:gap-2"
									>
										<span className="group-hover:underline">Бүгдийг харах</span>
										<ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
									</a>
								</div>
							</div>
						</div>

						<div className="animate-in fade-in-0 duration-700 delay-300">
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-2">
								<ExamLists exams={homeData.RetDataThirt} />
							</div>
						</div>
					</>
				)}

				{/* Soril Lists Section - Only show if sorils exist */}
				{homeData?.RetDataFourth && homeData.RetDataFourth.length > 0 && (
					<>
						{/* Section Divider */}
						<div className="py-4">
							<div className="w-full border-t border-border" />
							<div className="flex flex-col mt-4">
								<div className="flex justify-center">
									<span className="px-4 py-1.5 text-xs font-bold ">
										Сорилууд
									</span>
								</div>
								<div className="flex justify-end mt-2">
									<a
										href="Lists\sorilList"
										className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 hover:gap-2"
									>
										<span className="group-hover:underline">Бүгдийг харах</span>
										<ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
									</a>
								</div>
							</div>
						</div>

						<div className="animate-in fade-in-0 duration-700 delay-500">
							<div className="relative">
								<HomeSorilLists pastExams={homeData.RetDataFourth} />
							</div>
						</div>
					</>
				)}
			</div>

			<style jsx>{`
				@keyframes float {
					0%, 100% { transform: translateY(0px) rotate(0deg); }
					50% { transform: translateY(-20px) rotate(5deg); }
				}
				
				@keyframes wave {
					0%, 100% { transform: rotate(0deg); }
					25% { transform: rotate(20deg); }
					75% { transform: rotate(-20deg); }
				}

				@keyframes borderRotate {
					0% { transform: rotate(0deg) scale(1.5); }
					100% { transform: rotate(360deg) scale(1.5); }
				}

				.animate-wave {
					animation: wave 2s ease-in-out infinite;
					display: inline-block;
					transform-origin: 70% 70%;
				}

				.animate-float {
					animation: float 3s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
}
