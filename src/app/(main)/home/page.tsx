"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	ChevronRight,
	ClipboardCheck,
	Clock,
	HelpCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getHomeScreen, getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import {
	formatSorilDate,
	type HomeResponseType,
	isSorilCompleted,
	type PastExam,
} from "@/types/home";
import type { UserProfileResponseType } from "@/types/user";
import ExamLists from "./homeExamCard";

const PARTICLE_COUNT = 15;
const MOUSE_THROTTLE = 100;
const ANIMATION_STAGGER = 0.04;

// ============================================================================
// HERO SECTION COMPONENT
// ============================================================================

interface HeroSectionProps {
	username: string;
}

const HeroSection = memo(({ username }: HeroSectionProps) => {
	return (
		<div className="w-full">
			<div className="max-w-10xl sm:px-6">
				<div className="relative group overflow-hidden bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-500">
					{/* Subtle Background Pattern */}
					<div className="absolute inset-0 opacity-[0.02] pointer-events-none " />

					<div className="relative px-5 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 flex flex-col md:flex-row items-center justify-between gap-5 lg:gap-6">
						{/* Left Side - Welcome Section */}
						<div className="flex-1 space-y-2 sm:space-y-3 text-center md:text-left max-w-xl">
							<div className="space-y-1">
								<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-light tracking-tight leading-tight">
									Сайн уу, <span className="font-medium">{username}</span>
								</h1>
								<p className="text-xs sm:text-sm lg:text-base  font-light leading-relaxed max-w-md mx-auto md:mx-0">
									Өнөөдөр шинэ зүйл сурч, ур чадвараа хөгжүүлэхэд бэлэн үү?
								</p>
							</div>

							{/* Decorative Line */}
							<div className="flex items-center gap-2 justify-center md:justify-start pt-0">
								<div className="h-px w-6 bg-linear-to-r from-transparent to-zinc-300 dark:to-zinc-700" />
								<span className="text-[10px] sm:text-[11px] ">
									24/7 суралцах хөгжих боломж
								</span>
								<div className="h-px w-6 bg-linear-to-l from-transparent to-zinc-300 dark:to-zinc-700" />
							</div>
						</div>

						{/* Right Side - Action Area */}
						<div className="flex flex-col items-center md:items-end gap-2.5 sm:gap-3 w-full md:w-auto">
							<Link href="/Lists/paymentCoureList" className="w-full sm:w-auto">
								<Button className="w-full sm:min-w-[180px] h-10 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group shadow-md shadow-zinc-900/10 dark:shadow-zinc-50/5 border-0">
									<span className="flex items-center gap-2 font-medium text-sm tracking-wide">
										Сургалт үзэх
										<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
									</span>
								</Button>
							</Link>
						</div>
					</div>

					{/* Bottom Accent Line */}
					<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-60" />

					{/* Corner Decoration */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-zinc-100/30 dark:from-zinc-900/30 to-transparent rounded-bl-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
				</div>
			</div>
		</div>
	);
});

HeroSection.displayName = "HeroSection";

interface ExamCardProps {
	exam: PastExam;
	index: number;
}

const ExamCard = memo(({ exam, index }: ExamCardProps) => {
	const router = useRouter();
	const isCompleted = isSorilCompleted(exam.isguitset);

	const handleClick = useCallback(() => {
		router.push(`/soril/${exam.exam_id}`);
	}, [router, exam.exam_id]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * ANIMATION_STAGGER }}
			className="h-full"
		>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={handleClick}
						aria-label={`${exam.soril_name} сорил нээх`}
						className="group h-full w-full relative flex flex-col border border-border/40 bg-card/50 backdrop-blur-md cursor-pointer transition-all duration-500 ease-out hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 rounded-lg sm:rounded-xl overflow-hidden text-left"
					>
						{/* Image Header */}
						<div className="relative w-full aspect-2/1 shrink-0">
							{exam.filename ? (
								<Image
									src={exam.filename}
									alt={exam.soril_name}
									fill
									quality={75}
									priority={index < 4}
									sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
									className="object-cover"
								/>
							) : (
								<div className="absolute inset-0 " />
							)}

							{/* Status Badge */}
							<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10">
								{isCompleted ? (
									<Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
										Гүйцэтгэсэн
									</Badge>
								) : (
									<Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
										Гүйцэтгээгүй
									</Badge>
								)}
							</div>

							{/* Date */}
							<div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 z-10">
								<div className="flex items-center gap-1 sm:gap-1.5">
									<Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 shrink-0" />
									<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
										{formatSorilDate(exam.sorildate)}
									</span>
								</div>
							</div>
						</div>

						{/* Content Section */}
						<div className="p-1.5 sm:p-2 md:p-3 pb-9 sm:pb-10 md:pb-12 flex flex-col flex-1 space-y-1.5 sm:space-y-2 md:space-y-3">
							{/* Title */}
							<div className="space-y-0.5 flex-1 min-h-0">
								<Tooltip>
									<TooltipTrigger asChild>
										<h3 className="text-[10px] sm:text-xs md:text-sm font-semibold  line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
											{exam.soril_name}
										</h3>
									</TooltipTrigger>
									<TooltipContent className="max-w-xs">
										<p>{exam.soril_name}</p>
									</TooltipContent>
								</Tooltip>
							</div>

							{/* Stats */}
							<div className="space-y-1 sm:space-y-1.5">
								<div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 pt-1 sm:pt-1.5 md:pt-2 border-t border-border/50">
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
												<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 shrink-0" />
												<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
													{exam.minut > 0 ? `${exam.minut} минут` : "∞"}
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												{exam.minut > 0
													? "Сорилын нийт хугацаа"
													: "Хугацаа хязгааргүй"}
											</p>
										</TooltipContent>
									</Tooltip>

									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex items-center gap-0.5 sm:gap-1  min-w-0">
												<ClipboardCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 shrink-0" />
												<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
													{exam.que_cnt} асуулт
												</span>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<p>Нийт асуултын тоо</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</div>

							{/* Action Button */}
							<div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 md:bottom-3 md:right-3 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-foreground group-hover:scale-110 transition-all duration-300">
								<ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
							</div>
						</div>
					</button>
				</TooltipTrigger>
			</Tooltip>
		</motion.div>
	);
});

ExamCard.displayName = "ExamCard";

// ============================================================================
// SORIL LISTS COMPONENT
// ============================================================================

interface SorilListsProps {
	pastExams: PastExam[];
}

const SorilLists = memo(({ pastExams }: SorilListsProps) => {
	if (!pastExams?.length) {
		return (
			<div className="flex flex-col items-center py-24 opacity-40">
				<HelpCircle className="w-12 h-12 mb-4 stroke-[1.5px]" />
				<p className="font-bold tracking-tight">Сорил олдсонгүй</p>
			</div>
		);
	}

	return (
		<div className="px-2">
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
				{pastExams.map((exam, index) => (
					<ExamCard key={exam.exam_id} exam={exam} index={index} />
				))}
			</div>
		</div>
	);
});

SorilLists.displayName = "SorilLists";

// ============================================================================
// SECTION DIVIDER COMPONENT
// ============================================================================

interface SectionDividerProps {
	title: string;
	href: string;
}

const SectionDivider = memo(({ title, href }: SectionDividerProps) => {
	return (
		<div className="py-4">
			<div className="w-full border-t border-border" />

			<div className="flex flex-col mt-4">
				<div className="flex justify-center">
					<span className="px-4 py-1.5 text-xs font-bold">{title}</span>
				</div>

				<div className="flex justify-end mt-2">
					<Link
						href={href}
						className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 hover:gap-2"
					>
						<span className="group-hover:underline">Бүгдийг харах</span>
						<ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
					</Link>
				</div>
			</div>
		</div>
	);
});

SectionDivider.displayName = "SectionDivider";

// ============================================================================
// ANIMATED BACKGROUND COMPONENT
// ============================================================================

interface AnimatedBackgroundProps {
	mousePosition: { x: number; y: number };
}

const AnimatedBackground = memo(
	({ mousePosition }: AnimatedBackgroundProps) => {
		// Memoize particles to prevent recreation
		const particles = useMemo(
			() =>
				Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
					id: i,
					x: Math.random() * 100,
					y: Math.random() * 100,
					size: Math.random() * 3 + 1,
					duration: Math.random() * 20 + 15,
					delay: Math.random() * 5,
				})),
			[],
		);

		return (
			<div className="fixed inset-0 pointer-events-none">
				<div
					className="absolute inset-0"
					style={
						{
							"--mouse-x": `${mousePosition.x}px`,
							"--mouse-y": `${mousePosition.y}px`,
						} as React.CSSProperties
					}
				>
					{/* Gradient Orbs */}
					<div className="absolute top-0 left-1/4 w-[min(400px,40vw)] h-[min(400px,40vw)] bg-linear-to-r from-violet-500/20 to-purple-500/20 dark:from-violet-600/30 dark:to-purple-600/30 rounded-full blur-3xl animate-pulse orb-move" />
					<div className="absolute bottom-0 right-1/4 w-[min(350px,35vw)] h-[min(350px,35vw)] bg-linear-to-r from-pink-500/20 to-rose-500/20 dark:from-pink-600/30 dark:to-rose-600/30 rounded-full blur-3xl animate-pulse orb-move-reverse" />
					<div className="absolute top-1/2 left-1/2 w-[min(300px,30vw)] h-[min(300px,30vw)] bg-linear-to-r from-blue-500/15 to-cyan-500/15 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl animate-pulse orb-move-slow" />
				</div>

				{/* Particles - Hidden on mobile for better performance */}
				<div className="hidden sm:block">
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
				</div>

				{/* Grid Pattern */}
				<div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size:100px_100px mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)] grid-move" />
			</div>
		);
	},
);

AnimatedBackground.displayName = "AnimatedBackground";

// ============================================================================
// MAIN HOME PAGE COMPONENT
// ============================================================================

export default function HomePage() {
	const { userId } = useAuthStore();
	const { setProfile } = useUserStore();
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

	// Optimized mouse move handler with throttling
	const handleMouseMove = useCallback((e: MouseEvent) => {
		requestAnimationFrame(() => {
			setMousePosition({
				x: (e.clientX / window.innerWidth - 0.5) * 20,
				y: (e.clientY / window.innerHeight - 0.5) * 20,
			});
		});
	}, []);

	useEffect(() => {
		// Only enable mouse tracking on desktop
		const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
		if (!isDesktop) return;

		let lastTime = 0;

		const throttledMove = (e: MouseEvent) => {
			const now = Date.now();
			if (now - lastTime >= MOUSE_THROTTLE) {
				lastTime = now;
				handleMouseMove(e);
			}
		};

		window.addEventListener("mousemove", throttledMove, { passive: true });
		return () => window.removeEventListener("mousemove", throttledMove);
	}, [handleMouseMove]);

	// Fetch home screen data - errors are silently logged to console
	const { data: homeData, isLoading: isHomeLoading } =
		useQuery<HomeResponseType>({
			queryKey: ["homeScreen", userId],
			queryFn: async () => {
				try {
					return await getHomeScreen(userId || 0);
				} catch (error) {
					console.error("Home data fetch error:", error);
					// Return empty data structure instead of throwing
					return {
						RetDataThirt: [],
						RetDataFourth: [],
					} as unknown as HomeResponseType;
				}
			},
			enabled: !!userId,
			retry: 2,
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
		});

	const { data: profileData, isLoading: isProfileLoading } =
		useQuery<UserProfileResponseType>({
			queryKey: ["userProfile", userId],
			queryFn: async () => {
				try {
					return await getUserProfile(userId || 0);
				} catch (error) {
					console.error("Profile data fetch error:", error);
					// Return empty data structure instead of throwing
					return { RetData: [] } as unknown as UserProfileResponseType;
				}
			},
			enabled: !!userId,
			retry: 2,
			staleTime: 10 * 60 * 1000,
			refetchOnWindowFocus: false,
		});

	useEffect(() => {
		if (profileData?.RetData?.length) {
			setProfile(profileData.RetData[0]);
		}
	}, [profileData, setProfile]);

	const username = useMemo(
		() => profileData?.RetData?.[0]?.username || "Хэрэглэгч",
		[profileData],
	);

	const hasExams = useMemo(
		() => Boolean(homeData?.RetDataThirt?.length),
		[homeData?.RetDataThirt],
	);

	const hasSorils = useMemo(
		() => Boolean(homeData?.RetDataFourth?.length),
		[homeData?.RetDataFourth],
	);

	// Early returns - no error messages shown to user
	if (!userId) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]"></div>
		);
	}

	// Show loading state
	if (isHomeLoading || isProfileLoading) {
		return (
			<div className="flex items-center justify-center min-h-[70vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
			</div>
		);
	}

	// Even if there's an error, show the page with whatever data we have
	// Errors are logged to console but not shown to user
	return (
		<TooltipProvider>
			<div className="min-h-screen bg-linear-to-br from-background via-muted/30 to-background relative overflow-hidden">
				{/* Animated Background */}
				<AnimatedBackground mousePosition={mousePosition} />

				{/* Main Content */}
				<div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 relative z-10">
					{/* Hero Section */}
					<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
						<HeroSection username={username} />
					</div>

					{/* Exam Lists Section */}
					{hasExams && homeData?.RetDataThirt && (
						<>
							<SectionDivider
								title="Идэвхтэй шалгалтууд"
								href="/Lists/examList"
							/>
							<div className="animate-in fade-in-0 duration-700 delay-300">
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 px-2">
									<ExamLists exams={homeData.RetDataThirt} />
								</div>
							</div>
						</>
					)}

					{/* Soril Lists Section */}
					{hasSorils && homeData?.RetDataFourth && (
						<>
							<SectionDivider title="Сорилууд" href="/Lists/sorilList" />
							<div className="animate-in fade-in-0 duration-700 delay-500">
								<SorilLists pastExams={homeData.RetDataFourth} />
							</div>
						</>
					)}
				</div>

				{/* Global Styles */}
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

					/* Reduce animations on low-end devices */
					@media (prefers-reduced-motion: reduce) {
						.orb-move,
						.orb-move-reverse,
						.orb-move-slow,
						.grid-move {
							transform: none !important;
							transition: none !important;
						}
						
						.animate-pulse {
							animation: none !important;
						}
					}
				`}</style>
			</div>
		</TooltipProvider>
	);
}
