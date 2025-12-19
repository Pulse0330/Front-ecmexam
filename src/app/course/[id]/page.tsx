"use client";

import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import {
	ArrowLeft,
	BookOpen,
	CheckCircle2,
	Clock,
	FileText,
	Loader2,
	PlayCircle,
	Sparkles,
	Trophy,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContentView } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ContentViewResponse } from "@/types/course/contentView";
import { Homework } from "./homework";

export default function CoursePage() {
	const router = useRouter();
	const params = useParams();
	const [activeSection, setActiveSection] = useState<number>(0);

	const content_id = Number(params.id);
	const { userId } = useAuthStore();

	const { data, isPending, isError, error } = useQuery<ContentViewResponse>({
		queryKey: ["contentView", content_id, userId],
		queryFn: () => getContentView(content_id, userId || 0),
		enabled: !!content_id && !!userId,
	});

	// Scroll spy for timeline
	useEffect(() => {
		const handleScroll = () => {
			const sections = document.querySelectorAll("[data-lesson-index]");
			let currentSection = 0;

			sections.forEach((section, index) => {
				const rect = section.getBoundingClientRect();
				if (
					rect.top <= window.innerHeight / 2 &&
					rect.bottom >= window.innerHeight / 2
				) {
					currentSection = index;
				}
			});

			setActiveSection(currentSection);
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // Initial check
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	if (isPending) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-linear-to-br from-primary/5 via-background to-primary/5">
				<div className="text-center space-y-4">
					<div className="relative">
						<Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
						<div className="absolute inset-0 blur-xl opacity-50">
							<Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
						</div>
					</div>
					<p className="text-muted-foreground font-medium">Ачааллаж байна...</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
				<Card className="border-destructive/50 max-w-md w-full shadow-lg">
					<CardContent className="pt-6 space-y-4">
						<div className="text-center">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
								<ArrowLeft className="h-8 w-8 text-destructive" />
							</div>
							<p className="text-destructive text-lg font-semibold mb-2">
								Алдаа гарлаа
							</p>
							<p className="text-muted-foreground text-sm">{error.message}</p>
						</div>
						<Button
							variant="outline"
							onClick={() => router.back()}
							className="w-full"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Буцах
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!data?.RetResponse?.ResponseType) {
		return (
			<div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
				<Card className="border-destructive/50 max-w-md w-full shadow-lg">
					<CardContent className="pt-6 space-y-4">
						<div className="text-center">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
								<ArrowLeft className="h-8 w-8 text-destructive" />
							</div>
							<p className="text-destructive text-lg font-semibold mb-2">
								Алдаа гарлаа
							</p>
							<p className="text-muted-foreground text-sm">
								{data?.RetResponse?.ResponseMessage || "Тодорхойгүй алдаа"}
							</p>
						</div>
						<Button
							variant="outline"
							onClick={() => router.back()}
							className="w-full"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Буцах
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const contents = data.RetData || [];
	const completedCount = contents.filter((c) => c.stu_worked === 1).length;
	const progressPercent = (completedCount / contents.length) * 100;

	const getContentIcon = (type: number) => {
		if (type === 3) return <PlayCircle className="h-5 w-5" />;
		return <FileText className="h-5 w-5" />;
	};

	const handleStartExam = (examId: number) => {
		router.push(`/exam/${examId}`);
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-background relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
				<div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
			</div>

			{/* Hero Section */}
			<div className="relative border-b bg-linear-to-r from-primary/10 via-primary/5 to-background backdrop-blur-sm">
				<div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-linear(0deg,transparent,black)]" />
				<div className="container mx-auto px-4 py-8 md:py-12 relative max-w-7xl">
					<Button
						variant="ghost"
						onClick={() => router.back()}
						className="mb-6 hover:bg-primary/10 group"
					>
						<ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
						Буцах
					</Button>

					<div className="max-w-4xl mx-auto">
						<div className="flex items-center gap-2 mb-4">
							<Sparkles className="h-6 w-6 text-primary animate-pulse" />
							<span className="text-sm font-semibold text-primary uppercase tracking-wider">
								Цахим хичээл
							</span>
						</div>

						<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent leading-tight">
							{contents[0]?.content_name || "Хичээлийн агуулга"}
						</h1>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
							<div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-blue-500/10 rounded-lg">
										<BookOpen className="h-5 w-5 text-blue-600" />
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Нийт хичээл</p>
										<p className="text-xl font-bold">{contents.length}</p>
									</div>
								</div>
							</div>

							<div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-green-500/10 rounded-lg">
										<CheckCircle2 className="h-5 w-5 text-green-600" />
									</div>
									<div>
										<p className="text-xs text-muted-foreground">Дууссан</p>
										<p className="text-xl font-bold">{completedCount}</p>
									</div>
								</div>
							</div>

							<div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-orange-500/10 rounded-lg">
										<Clock className="h-5 w-5 text-orange-600" />
									</div>
									<div>
										<p className="text-xs text-muted-foreground">
											Нийт хугацаа
										</p>
										<p className="text-xl font-bold">
											{contents.length * 15} мин
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Progress Bar */}
						<div className="space-y-3 bg-background/60 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-sm">
							<div className="flex justify-between items-center">
								<span className="font-semibold text-sm">Явцын хувь</span>
								<span className="text-2xl font-bold text-primary">
									{Math.round(progressPercent)}%
								</span>
							</div>
							<div className="relative h-4 bg-muted rounded-full overflow-hidden">
								<div
									className="absolute inset-0 bg-linear-to-r from-green-500 via-green-600 to-emerald-600 transition-all duration-700 ease-out"
									style={{ width: `${progressPercent}%` }}
								/>
								<div
									className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"
									style={{
										width: `${progressPercent}%`,
										backgroundSize: "200% 100%",
									}}
								/>
							</div>
							<p className="text-xs text-muted-foreground text-center">
								{completedCount === contents.length
									? "Бүх хичээлийг дууссан байна! 🎉"
									: `Үлдсэн: ${contents.length - completedCount} хичээл`}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Timeline Content */}
			<div className="container mx-auto px-4 py-12 relative">
				<div className="max-w-5xl mx-auto relative">
					{/* Vertical Timeline Line */}
					<div className="absolute left-8 top-0 bottom-0 w-1 bg-linear-to-b from-border via-border to-transparent hidden md:block rounded-full" />
					<div
						className="absolute left-8 top-0 w-1 bg-linear-to-b from-primary via-emerald-500 to-green-500 hidden md:block transition-all duration-500 ease-out rounded-full"
						style={{
							height: `${(activeSection / Math.max(contents.length - 1, 1)) * 100}%`,
							boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)",
						}}
					/>

					{/* Lessons */}
					<div className="space-y-16">
						{contents.map((item, index) => {
							const isCompleted = item.stu_worked === 1;
							const isActive = index === activeSection;
							const isHomework = item.exam_id && item.examname;

							return (
								<div
									key={item.content_id}
									data-lesson-index={index}
									className="relative animate-fadeIn"
									style={{ animationDelay: `${index * 100}ms` }}
								>
									{/* Timeline Dot */}
									<div className="absolute left-0 top-8 hidden md:flex items-center justify-center">
										<div
											className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500 ${
												isCompleted
													? "bg-linear-to-br from-green-500 to-emerald-600 border-green-400 shadow-xl shadow-green-500/50 scale-110"
													: isActive
														? "bg-linear-to-br from-primary to-primary/80 border-primary/60 shadow-xl shadow-primary/50 scale-110"
														: "bg-background border-border shadow-md"
											}`}
										>
											{isCompleted ? (
												<CheckCircle2 className="h-9 w-9 text-white animate-bounce" />
											) : (
												<span
													className={`text-lg font-bold transition-all ${
														isActive
															? "text-white scale-110"
															: "text-foreground"
													}`}
												>
													{index + 1}
												</span>
											)}
										</div>

										{/* Pulse effect for active */}
										{isActive && !isCompleted && (
											<div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-30" />
										)}
									</div>

									{/* Content Card */}
									<div className="md:ml-32">
										{isHomework ? (
											<Homework content={item} onStartExam={handleStartExam} />
										) : (
											<Card
												className={`transition-all duration-500 hover:shadow-2xl border-2 group ${
													isCompleted
														? "border-green-500/50 bg-linear-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 shadow-lg shadow-green-500/10"
														: isActive
															? "border-primary/50 shadow-xl shadow-primary/10 bg-linear-to-br from-primary/5 to-background"
															: "border-border hover:border-primary/30 bg-background/50 backdrop-blur-sm"
												}`}
											>
												<CardHeader className="pb-4">
													<div className="flex items-start justify-between gap-4">
														<div className="flex-1 space-y-3">
															<div className="flex items-center gap-3 flex-wrap">
																<Badge
																	variant={
																		isCompleted ? "default" : "secondary"
																	}
																	className={`${
																		isCompleted
																			? "bg-linear-0-to-r from-green-600 to-emerald-600 shadow-md"
																			: "bg-muted"
																	} transition-all`}
																>
																	{item.elesson_type}
																</Badge>
																<div
																	className={`p-2 rounded-lg transition-all ${
																		isCompleted
																			? "bg-green-500/10"
																			: isActive
																				? "bg-primary/10"
																				: "bg-muted"
																	}`}
																>
																	{getContentIcon(item.l_content_type)}
																</div>
															</div>
															<CardTitle className="text-xl md:text-2xl group-hover:text-primary transition-colors">
																Хичээл {index + 1}
															</CardTitle>
															<CardTitle className="text-xl md:text-2xl group-hover:text-primary transition-colors leading-tight">
																{item.content_name}
															</CardTitle>
														</div>
														{isCompleted && (
															<Badge className="bg-linear-to-r from-green-600 to-emerald-600 shrink-0 shadow-lg animate-pulse">
																<CheckCircle2 className="h-4 w-4 mr-1" />
																Дууссан
															</Badge>
														)}
													</div>
												</CardHeader>
												<CardContent className="space-y-6">
													<SafeHtmlContent
														html={item.url}
														contentType={item.l_content_type}
													/>

													{!isCompleted ? (
														<Button
															className="w-full md:w-auto group/btn bg-linear-to-r from-primary to-primary/80 hover:shadow-lg hover:scale-105 transition-all"
															onClick={() => {
																// Mark as complete logic here
																// You can call an API to mark the lesson as complete
															}}
														>
															<CheckCircle2 className="mr-2 h-4 w-4 group-hover/btn:scale-125 transition-transform" />
															Дууссан гэж тэмдэглэх
														</Button>
													) : (
														<div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
															<div className="p-2 bg-green-500 rounded-full">
																<CheckCircle2 className="h-5 w-5 text-white" />
															</div>
															<div>
																<p className="font-semibold text-green-700 dark:text-green-400">
																	Амжилттай дүүргэлээ!
																</p>
																<p className="text-sm text-green-600 dark:text-green-500">
																	Та энэ хичээлийг бүрэн судаллаа
																</p>
															</div>
														</div>
													)}
												</CardContent>
											</Card>
										)}
									</div>
								</div>
							);
						})}
					</div>

					{/* Completion Celebration */}
					{completedCount === contents.length && (
						<div className="mt-20 animate-fadeIn">
							<Card className="border-2 border-green-500 bg-linear-to-br from-green-50 via-emerald-50 to-green-100/50 dark:from-green-950/30 dark:to-emerald-900/20 shadow-2xl shadow-green-500/20 overflow-hidden relative">
								{/* Background decoration */}
								<div className="absolute inset-0 bg-grid-white/5" />
								<div className="absolute top-0 right-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl" />
								<div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />

								<CardContent className="py-16 relative">
									<div className="space-y-6 text-center">
										<div className="relative inline-block">
											<div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-green-500 to-emerald-600 text-white mb-4 shadow-xl shadow-green-500/50 animate-bounce">
												<Trophy className="h-14 w-14" />
											</div>
											<Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
											<Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-yellow-500 animate-pulse delay-75" />
										</div>

										<div className="space-y-2">
											<h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">
												Баяр хүргэе! 🎉
											</h2>
											<p className="text-lg text-muted-foreground max-w-md mx-auto">
												Та бүх хичээлүүдийг амжилттай дүүргэлээ! Таны хичээл
												зүтгэл үр дүнгээ өгч байна.
											</p>
										</div>

										<div className="flex flex-wrap items-center justify-center gap-4 pt-4">
											<Button
												size="lg"
												onClick={() => router.push("/Lists/courseList")}
												className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
											>
												<BookOpen className="mr-2 h-5 w-5" />
												Бусад хичээл үзэх
											</Button>
											<Button
												size="lg"
												variant="outline"
												onClick={() => router.back()}
												className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
											>
												<ArrowLeft className="mr-2 h-5 w-5" />
												Буцах
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</div>

			{/* Footer Navigation */}
			<div className="container mx-auto px-4 py-8 relative">
				<div className="max-w-5xl mx-auto">
					<Card className="bg-linear-to-r from-primary/5 via-background to-primary/5 border-border/50 shadow-lg">
						<CardContent className="p-6">
							<div className="flex flex-col md:flex-row items-center justify-between gap-4">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-primary/10 rounded-full">
										<BookOpen className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="font-semibold text-sm">Хичээл дууслаа уу?</p>
										<p className="text-xs text-muted-foreground">
											Бусад хичээлүүдээ үргэлжлүүлэн үзээрэй
										</p>
									</div>
								</div>

								<div className="flex flex-wrap gap-3">
									<Button
										variant="outline"
										onClick={() => router.back()}
										className="group"
									>
										<ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
										Буцах
									</Button>
									<Button
										onClick={() => router.push("/Lists/courseList")}
										className="bg-gralineardient-to-r from-primary to-primary/80 hover:shadow-lg group"
									>
										Бүх хичээл үзэх
										<BookOpen className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
									</Button>
								</div>
							</div>

							{/* Progress Summary */}
							<div className="mt-6 pt-6 border-t border-border/50">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
									<div>
										<p className="text-2xl font-bold text-primary">
											{contents.length}
										</p>
										<p className="text-xs text-muted-foreground">Нийт хичээл</p>
									</div>
									<div>
										<p className="text-2xl font-bold text-green-600">
											{completedCount}
										</p>
										<p className="text-xs text-muted-foreground">Дууссан</p>
									</div>
									<div>
										<p className="text-2xl font-bold text-orange-600">
											{contents.length - completedCount}
										</p>
										<p className="text-xs text-muted-foreground">Үлдсэн</p>
									</div>
									<div>
										<p className="text-2xl font-bold text-blue-600">
											{Math.round(progressPercent)}%
										</p>
										<p className="text-xs text-muted-foreground">Гүйцэтгэл</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<style jsx>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				
				@keyframes shimmer {
					0% {
						background-position: -200% 0;
					}
					100% {
						background-position: 200% 0;
					}
				}
				
				.animate-fadeIn {
					animation: fadeIn 0.6s ease-out forwards;
					opacity: 0;
				}
				
				.animate-shimmer {
					animation: shimmer 2s linear infinite;
				}
				
				.delay-75 {
					animation-delay: 75ms;
				}
			`}</style>
		</div>
	);
}

// Аюулгүй HTML render component
function SafeHtmlContent({ html }: { html: string; contentType: number }) {
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (contentRef.current && typeof window !== "undefined") {
			const clean = DOMPurify.sanitize(html, {
				ADD_TAGS: ["iframe"],
				ADD_ATTR: ["allowfullscreen", "frameborder", "src", "class"],
			});
			contentRef.current.innerHTML = clean;
		}
	}, [html]);

	// l_content_type === 2 means it's a file URL (image, audio, document, etc.)
	// Check if it's an HTML string or a direct URL
	const isDirectUrl = !html.includes("<") && !html.includes(">");

	if (isDirectUrl) {
		const fileExtension = html.split(".").pop()?.toLowerCase();

		// Image files
		if (
			["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(fileExtension || "")
		) {
			return (
				<div className="space-y-4">
					<img
						src={html}
						alt="Хичээлийн зураг"
						className="w-full h-auto rounded-xl shadow-lg border border-border object-contain max-h-[600px]"
						onError={(e) => {
							e.currentTarget.src = "/placeholder-image.png"; // fallback image
						}}
					/>
				</div>
			);
		}

		// Audio files
		// Audio files
		// Audio files
		if (["mp3", "wav", "ogg", "aac"].includes(fileExtension || "")) {
			return (
				<div className="space-y-4">
					<div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 bg-linear-to-br from-purple-500 to-pink-500 rounded-full shadow-lg">
								<PlayCircle className="h-6 w-6 text-white" />
							</div>
							<div>
								<p className="font-semibold text-purple-700 dark:text-purple-400">
									Аудио хичээл
								</p>
								<p className="text-sm text-purple-600 dark:text-purple-500">
									Сонсож суралцаарай
								</p>
							</div>
						</div>
						{/* biome-ignore lint/a11y/useMediaCaption: Educational audio content without captions */}
						<audio
							controls
							className="w-full h-12 rounded-lg shadow-md"
							src={html}
						>
							Таны browser audio дэмжихгүй байна.
						</audio>
					</div>
				</div>
			);
		}
		// PDF files
		if (fileExtension === "pdf") {
			return (
				<div className="space-y-4">
					<iframe
						src={html}
						className="w-full h-[600px] rounded-xl shadow-lg border border-border"
						title="PDF Document"
					/>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => window.open(html, "_blank")}
					>
						<FileText className="mr-2 h-4 w-4" />
						PDF-ийг шинэ цонхонд нээх
					</Button>
				</div>
			);
		}

		if (["ppt", "pptx"].includes(fileExtension || "")) {
			return (
				<div className="space-y-4">
					<div className="bg-linear-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800">
						<div className="flex items-center gap-3 p-4 bg-orange-100 dark:bg-orange-900/30 border-b border-orange-200 dark:border-orange-800">
							<div className="p-2 bg-linear-to-br from-orange-500 to-red-500 rounded-lg shadow-md">
								<FileText className="h-5 w-5 text-white" />
							</div>
							<div>
								<p className="font-semibold text-orange-700 dark:text-orange-400">
									PowerPoint танилцуулга
								</p>
								<p className="text-xs text-orange-600 dark:text-orange-500">
									Slides харах боломжтой
								</p>
							</div>
						</div>
						<iframe
							src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(html)}`}
							className="w-full h-[600px]"
							title="PowerPoint Presentation"
						/>
					</div>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => window.open(html, "_blank")}
					>
						<FileText className="mr-2 h-4 w-4" />
						Татаж авах
					</Button>
				</div>
			);
		}
		// Excel files
		if (["xls", "xlsx"].includes(fileExtension || "")) {
			return (
				<div className="space-y-4">
					<div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl overflow-hidden border border-green-200 dark:border-green-800">
						<div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
							<div className="p-2 bg-linear-to-br from-green-500 to-emerald-500 rounded-lg shadow-md">
								<FileText className="h-5 w-5 text-white" />
							</div>
							<div>
								<p className="font-semibold text-green-700 dark:text-green-400">
									Excel хүснэгт
								</p>
								<p className="text-xs text-green-600 dark:text-green-500">
									Spreadsheet харах боломжтой
								</p>
							</div>
						</div>
						<iframe
							src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(html)}`}
							className="w-full h-[600px]"
							title="Excel Spreadsheet"
						/>
					</div>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => window.open(html, "_blank")}
					>
						<FileText className="mr-2 h-4 w-4" />
						Татаж авах
					</Button>
				</div>
			);
		}

		// Word files
		if (["doc", "docx"].includes(fileExtension || "")) {
			return (
				<div className="space-y-4">
					<div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800">
						<div className="flex items-center gap-3 p-4 bg-blue-100 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
							<div className="p-2 bg-linear-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
								<FileText className="h-5 w-5 text-white" />
							</div>
							<div>
								<p className="font-semibold text-blue-700 dark:text-blue-400">
									Word документ
								</p>
								<p className="text-xs text-blue-600 dark:text-blue-500">
									Документ унших боломжтой
								</p>
							</div>
						</div>
						<iframe
							src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(html)}`}
							className="w-full h-[600px]"
							title="Word Document"
						/>
					</div>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => window.open(html, "_blank")}
					>
						<FileText className="mr-2 h-4 w-4" />
						Татаж авах
					</Button>
				</div>
			);
		}

		// Other files - generic download button
		return (
			<div className="space-y-4">
				<div className="p-6 bg-muted rounded-xl border">
					<div className="flex items-center gap-3">
						<div className="p-3 bg-primary rounded-full">
							<FileText className="h-6 w-6 text-white" />
						</div>
						<div>
							<p className="font-semibold">Файл</p>
							<p className="text-sm text-muted-foreground">
								Файлыг татаж харна уу
							</p>
						</div>
					</div>
				</div>
				<Button
					variant="outline"
					className="w-full"
					onClick={() => window.open(html, "_blank")}
				>
					<FileText className="mr-2 h-4 w-4" />
					Татаж авах / Үзэх
				</Button>
			</div>
		);
	}

	// If it's HTML content (iframe, etc.)
	return (
		<div
			ref={contentRef}
			className="prose prose-sm max-w-none dark:prose-invert 
				[&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:shadow-lg [&_iframe]:border [&_iframe]:border-border
				[&_img]:rounded-lg [&_img]:shadow-md
				[&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline
				[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
				[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-auto"
		/>
	);
}
