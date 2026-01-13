"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Award,
	ChevronRight,
	ClipboardList,
	Sparkles,
	Target,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getHomeScreen, getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import type { HomeResponseType } from "@/types/home";
import type { UserProfileResponseType } from "@/types/user";
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

const FLOATING_ICONS = [
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
			<div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 px-4">
				<div className="relative">
					<div className="absolute inset-0 bg-linear-to-r from-violet-500 via-purple-500 to-pink-500 blur-3xl opacity-30 animate-pulse" />
					<div
						className="absolute inset-0 bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500 blur-3xl opacity-20 animate-pulse"
						style={{ animationDelay: "1s" }}
					/>
					<UseAnimations
						animation={loading2}
						size={80}
						strokeColor="hsl(var(--primary))"
						loop
					/>
				</div>
				<div className="space-y-3 text-center">
					<p className="text-2xl font-black bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
						Уншиж байна...
					</p>
					<p className="text-sm text-muted-foreground font-medium">
						Таны мэдээллийг ачааллаж байна
					</p>
				</div>
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
				<div className="animate-in fade-in-0 slide-in-from-top-4 duration-1000">
					<div className="relative group">
						{/* Glow Effect */}
						<div className="absolute -inset-1 bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

						<div className="relative bg-linear-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-2xl rounded-2xl border border-border shadow-2xl overflow-hidden">
							{/* Animated Border */}

							{/* Content Container */}
							<div className="relative p-6 sm:p-8 lg:p-10">
								{/* Floating Icons */}
								<div className="absolute top-4 right-4 flex gap-2">
									{FLOATING_ICONS.map(({ id, Icon, color, delay }) => (
										<div
											key={id}
											className={`${color} animate-float opacity-40 hover:opacity-100 transition-opacity cursor-pointer`}
											style={{ animationDelay: `${delay}s` }}
										>
											<Icon className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg" />
										</div>
									))}
								</div>

								{/* Main Content */}
								<div className="space-y-4 max-w-2xl">
									{/* Greeting */}
									<div className="space-y-2">
										<div className="flex items-center gap-3 flex-wrap">
											<h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-linear-to-r from-foreground via-purple-600 to-pink-600 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
												Сайн уу, {username}
											</h1>
											<span className="text-2xl sm:text-3xl lg:text-4xl animate-wave">
												👋
											</span>
										</div>

										<p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-medium">
											Таны амжилтын замд бид хамт байх болно
										</p>
									</div>

									{/* Feature Pills */}
									<div className="flex flex-wrap gap-2 pt-2">
										{[
											{
												id: "learn",
												icon: "🚀",
												text: "24/7 Суралцах",
												color: "from-violet-500 to-purple-500",
											},
											{
												id: "grow",
												icon: "💎",
												text: "Хөгжих",
												color: "from-purple-500 to-pink-500",
											},
											{
												id: "succeed",
												icon: "⚡",
												text: "Амжилт олох",
												color: "from-pink-500 to-rose-500",
											},
										].map((pill) => (
											<div
												key={pill.id}
												className={`group/pill relative overflow-hidden rounded-full px-4 py-2 bg-linear-to-r ${pill.color} shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer`}
											>
												<div className="absolute inset-0 bg-white/20 translate-y-full group-hover/pill:translate-y-0 transition-transform duration-300" />
												<div className="relative flex items-center gap-1.5 text-white font-bold">
													<span className="text-base">{pill.icon}</span>
													<span className="text-xs">{pill.text}</span>
												</div>
											</div>
										))}
									</div>

									{/* Motivational Quote */}
									<div className="relative mt-4 pt-4 border-t border-border">
										<div className="flex items-start gap-3">
											<Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5 animate-pulse" />
											<p className="text-muted-foreground italic text-xs sm:text-sm">
												"Өнөөдрийн бяцхан алхам маргаашийн томоохон өөрчлөлт"
											</p>
										</div>
									</div>
								</div>

								{/* Decorative Elements */}
								<div className="absolute bottom-0 right-0 w-40 h-40 bg-linear-to-tl from-purple-500/10 to-transparent rounded-tl-full" />
								<div className="absolute top-0 left-0 w-32 h-32 bg-linear-to-br from-pink-500/10 to-transparent rounded-br-full" />
							</div>
						</div>
					</div>
				</div>

				{/* Section Divider */}
				<div className="py-4">
					{/* 1. Дээд талын хөндлөн зураас */}
					<div className="w-full border-t border-border" />

					{/* 2. Зураасны доорх агуулга */}
					<div className="flex flex-col mt-4">
						{/* Badge - Төвд нь байрлуулсан */}
						<div className="flex justify-center">
							<span className="px-4 py-1.5 bg-linear-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
								Идэвхтэй шалгалтууд
							</span>
						</div>

						{/* "Бүгдийг харах" - Баруун талд нь */}
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

				{/* Exam Lists Section */}
				<div className="animate-in fade-in-0 duration-700 delay-300">
					<div className="relative">
						{homeData?.RetDataThirt?.length === 0 ? (
							<div className="text-center py-20 px-4">
								<div className="relative mb-6 inline-block">
									<div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full animate-pulse" />
									<div className="relative w-24 h-24 rounded-2xl bg-linear-to-br from-muted to-muted/50 flex items-center justify-center shadow-2xl border border-border">
										<ClipboardList
											className="w-12 h-12 text-purple-400"
											strokeWidth={1.5}
										/>
									</div>
								</div>
								<h3 className="text-xl font-bold text-foreground mb-2">
									Шалгалт олдсонгүй
								</h3>
								<p className="text-sm text-muted-foreground">
									Удахгүй шинэ шалгалтууд нэмэгдэх болно
								</p>
							</div>
						) : (
							<ExamLists exams={homeData?.RetDataThirt || []} />
						)}
					</div>
				</div>

				{/* Section Divider */}
				<div className="py-4">
					{/* 1. Дээд талын хөндлөн зураас */}
					<div className="w-full border-t border-border" />

					{/* 2. Зураасны доорх агуулга */}
					<div className="flex flex-col mt-4">
						{/* Badge - Төвд нь байрлуулсан */}
						<div className="flex justify-center">
							<span className="px-4 py-1.5 bg-linear-to-r from-violet-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
								Сорилууд
							</span>
						</div>

						{/* "Бүгдийг харах" - Баруун талд нь */}
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

				{/* Soril Lists Section */}
				<div className="animate-in fade-in-0 duration-700 delay-500">
					<div className="relative">
						{homeData?.RetDataFourth?.length === 0 ? (
							<div className="text-center py-20 px-4">
								<div className="relative mb-6 inline-block">
									<div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full animate-pulse" />
									<div className="relative w-24 h-24 rounded-2xl bg-linear-to-br from-muted to-muted/50 flex items-center justify-center shadow-2xl border border-border">
										<Sparkles
											className="w-12 h-12 text-pink-400"
											strokeWidth={1.5}
										/>
									</div>
								</div>
								<h3 className="text-xl font-bold text-foreground mb-2">
									Сорил олдсонгүй
								</h3>
								<p className="text-sm text-muted-foreground">
									Удахгүй шинэ сорилууд нэмэгдэх болно
								</p>
							</div>
						) : (
							<HomeSorilLists pastExams={homeData?.RetDataFourth || []} />
						)}
					</div>
				</div>
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
