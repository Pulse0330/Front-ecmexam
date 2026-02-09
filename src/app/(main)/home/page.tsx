"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getHomeScreen, getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import type { HomeResponseType } from "@/types/home";
import type { UserProfileResponseType } from "@/types/user";
import UnifiedHeroSection from "./courseexam";
import ExamLists from "./examlists";
import HomeSorilLists from "./sorillists";

// Reduced particle count for better performance
const PARTICLE_COUNT = 20;

export default function HomePage() {
	const { userId } = useAuthStore();
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	// Throttled mouse move handler
	const handleMouseMove = useCallback((e: MouseEvent) => {
		requestAnimationFrame(() => {
			setMousePosition({
				x: (e.clientX / window.innerWidth - 0.5) * 20,
				y: (e.clientY / window.innerHeight - 0.5) * 20,
			});
		});
	}, []);

	useEffect(() => {
		let lastTime = 0;
		const throttleDelay = 50; // 20fps instead of 60fps

		const throttledMove = (e: MouseEvent) => {
			const now = Date.now();
			if (now - lastTime >= throttleDelay) {
				lastTime = now;
				handleMouseMove(e);
			}
		};

		window.addEventListener("mousemove", throttledMove, { passive: true });
		return () => {
			window.removeEventListener("mousemove", throttledMove);
		};
	}, [handleMouseMove]);

	const { data: homeData, isLoading: isHomeLoading } =
		useQuery<HomeResponseType>({
			queryKey: ["homeScreen", userId],
			queryFn: () => getHomeScreen(userId || 0),
			enabled: !!userId,
			retry: 2,
			staleTime: 5 * 60 * 1000, // 5 minutes
		});

	const { setProfile } = useUserStore();

	const { data: profileData, isLoading: isProfileLoading } =
		useQuery<UserProfileResponseType>({
			queryKey: ["userProfile", userId],
			queryFn: () => getUserProfile(userId || 0),
			enabled: !!userId,
			retry: 2,
			staleTime: 10 * 60 * 1000, // 10 minutes
		});

	useEffect(() => {
		if (profileData?.RetData?.length) {
			setProfile(profileData.RetData[0]);
		}
	}, [profileData, setProfile]);

	// Memoize particles to prevent recreation
	const particles = useMemo(
		() =>
			Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				size: Math.random() * 4 + 1,
				duration: Math.random() * 20 + 10,
				delay: Math.random() * 5,
			})),
		[],
	);

	const username = useMemo(
		() => profileData?.RetData?.[0]?.username || "Хэрэглэгч",
		[profileData],
	);

	// Early returns
	if (!userId) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<p className="text-muted-foreground">Нэвтэрнэ үү</p>
			</div>
		);
	}

	if (isHomeLoading || isProfileLoading) {
		return (
			<div className="flex items-center justify-center min-h-[70vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
			</div>
		);
	}

	const hasExams = homeData?.RetDataThirt && homeData.RetDataThirt.length > 0;
	const hasSorils =
		homeData?.RetDataFourth && homeData.RetDataFourth.length > 0;

	return (
		<div className="min-h-screen bg-linear-to-br from-background via-muted/30 to-background relative overflow-hidden">
			{/* Optimized Animated Background */}
			<div className="fixed inset-0 pointer-events-none">
				{/* CSS Variables for performance */}
				<div
					className="absolute inset-0"
					style={
						{
							"--mouse-x": `${mousePosition.x}px`,
							"--mouse-y": `${mousePosition.y}px`,
						} as React.CSSProperties
					}
				>
					{/* Gradient Orbs - Using CSS custom properties */}
					<div className="absolute top-0 left-1/4 w-[min(400px,40vw)] h-[min(400px,40vw)] bg-linear-to-r from-violet-500/20 to-purple-500/20 dark:from-violet-600/30 dark:to-purple-600/30 rounded-full blur-3xl animate-pulse orb-move" />
					<div className="absolute bottom-0 right-1/4 w-[min(350px,35vw)] h-[min(350px,35vw)] bg-linear-to-r from-pink-500/20 to-rose-500/20 dark:from-pink-600/30 dark:to-rose-600/30 rounded-full blur-3xl animate-pulse orb-move-reverse" />
					<div className="absolute top-1/2 left-1/2 w-[min(300px,30vw)] h-[min(300px,30vw)] bg-linear-to-r from-blue-500/15 to-cyan-500/15 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl animate-pulse orb-move-slow" />
				</div>

				{/* Reduced Particles */}
				{particles.map((particle) => (
					<div
						key={particle.id}
						className="absolute bg-foreground/10 dark:bg-white/20 rounded-full backdrop-blur-sm will-change-transform"
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
				<div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size:[100px_100px] mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)] grid-move" />
			</div>

			<div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 relative z-10">
				{/* Hero Section */}
				<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
					<UnifiedHeroSection username={username} />
				</div>

				{/* Exam Lists Section */}
				{hasExams && homeData.RetDataThirt && (
					<>
						<SectionDivider title="Идэвхтэй шалгалтууд" href="Lists/examList" />
						<div className="animate-in fade-in-0 duration-700 delay-300">
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-2">
								<ExamLists exams={homeData.RetDataThirt} />
							</div>
						</div>
					</>
				)}

				{/* Soril Lists Section */}
				{hasSorils && homeData.RetDataFourth && (
					<>
						<SectionDivider title="Сорилууд" href="Lists/sorilList" />
						<div className="animate-in fade-in-0 duration-700 delay-500">
							<HomeSorilLists pastExams={homeData.RetDataFourth} />
						</div>
					</>
				)}
			</div>

			<style jsx>{`
				@keyframes float {
					0%, 100% { transform: translateY(0px) rotate(0deg); }
					50% { transform: translateY(-20px) rotate(5deg); }
				}

				.orb-move {
					transform: translate(var(--mouse-x), var(--mouse-y));
					transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
					animation-delay: 0s;
				}

				.orb-move-reverse {
					transform: translate(calc(var(--mouse-x) * -1), calc(var(--mouse-y) * -1));
					transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
					animation-delay: 1s;
				}

				.orb-move-slow {
					transform: translate(calc(var(--mouse-x) * 0.5), calc(var(--mouse-y) * 0.5));
					transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
					animation-delay: 2s;
				}

				.grid-move {
					transform: translate(calc(var(--mouse-x) * 0.2), calc(var(--mouse-y) * 0.2));
					transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				}

				.will-change-transform {
					will-change: transform;
				}
			`}</style>
		</div>
	);
}

// Extracted component for reusability
function SectionDivider({ title, href }: { title: string; href: string }) {
	return (
		<div className="py-4">
			<div className="w-full border-t border-border" />
			<div className="flex flex-col mt-4">
				<div className="flex justify-center">
					<span className="px-4 py-1.5 text-xs font-bold">{title}</span>
				</div>
				<div className="flex justify-end mt-2">
					<a
						href={href}
						className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 hover:gap-2"
					>
						<span className="group-hover:underline">Бүгдийг харах</span>
						<ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
					</a>
				</div>
			</div>
		</div>
	);
}
