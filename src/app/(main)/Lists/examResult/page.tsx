"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Award,
	CheckCircle,
	Crown,
	Eye,
	EyeOff,
	FileQuestion,
	Medal,
	School,
	TrendingUp,
	Trophy,
	User,
	X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getExamRank, getexamresultlists, getExamResults } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { LeaderboardResponse } from "@/types/exam/examRank";
import type { ExamresultListResponseType } from "@/types/exam/examResultList";

import { ExamListItem } from "./card";

export default function ExamResultList() {
	const { userId } = useAuthStore();
	const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
	const [showStats, setShowStats] = useState(true);
const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
	const { data, isLoading, isError, error } =
		useQuery<ExamresultListResponseType>({
			queryKey: ["examResults", userId],
			queryFn: () => getexamresultlists(userId || 0),
			enabled: !!userId,
		});

	const { data: rankData, isLoading: isRankLoading } =
		useQuery<LeaderboardResponse>({
			queryKey: ["examRank", selectedExamId, userId],
			queryFn: () => {
				if (!selectedExamId) throw new Error("Exam ID required");
				return getExamRank(selectedExamId, userId || 0);
			},
			enabled: !!selectedExamId && !!userId,
		});
		
	


	if (!userId) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Alert className="max-w-md">
					<div className="flex flex-col items-center text-center space-y-4 py-4">
						<div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
							<AlertCircle className="w-10 h-10 text-destructive" />
						</div>
						<AlertDescription className="space-y-2">
							<h3 className="text-2xl font-bold text-foreground">
								Хэрэглэгч нэвтрээгүй байна
							</h3>
							<p className="text-muted-foreground">
								Та эхлээд системд нэвтэрнэ үү
							</p>
						</AlertDescription>
					</div>
				</Alert>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center space-y-6">
					<div className="relative">
						<div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
						<UseAnimations
							animation={loading2}
							size={80}
							strokeColor="hsl(var(--primary))"
							loop
						/>
					</div>
					<div className="space-y-2 text-center">
						<p className="text-xl font-bold text-foreground animate-pulse">
							Ачааллаж байна...
						</p>
						<p className="text-sm text-muted-foreground">
							Шалгалтын үр дүнг уншиж байна
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Alert variant="destructive" className="max-w-md">
					<div className="flex flex-col items-center text-center space-y-4 py-4">
						<AlertCircle className="w-10 h-10" />
						<AlertDescription>
							<h3 className="text-2xl font-bold mb-2">Алдаа гарлаа</h3>
							<p className="text-sm">{(error as Error).message}</p>
						</AlertDescription>
					</div>
				</Alert>
			</div>
		);
	}

	const isResponseFailed =
		!data?.RetResponse?.ResponseType || data?.RetData === null;
	const exams = data?.RetData || [];

	if (isResponseFailed || exams.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Alert className="max-w-md">
					<div className="flex flex-col items-center text-center space-y-4 py-4">
						<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
							<FileQuestion className="w-10 h-10 text-primary" />
						</div>
						<AlertDescription className="space-y-4">
							<div>
								<h3 className="text-2xl font-bold text-foreground mb-3">
									Шалгалтын үр дүн олдсонгүй
								</h3>
								<p className="text-muted-foreground">
									Одоогоор дууссан шалгалт байхгүй байна.
								</p>
								{data?.RetResponse?.ResponseMessage && (
									<p className="text-sm text-muted-foreground italic mt-2">
										{data.RetResponse.ResponseMessage}
									</p>
								)}
							</div>
							<p className="text-sm text-muted-foreground">
								Та эхлээд шалгалт өгснөөр энд үр дүн харагдах болно.
							</p>
						</AlertDescription>
					</div>
				</Alert>
			</div>
		);
	}

	const finishedExams = exams.filter((e) => e.isfinished === 0);
	const avgScore =
		finishedExams.length > 0
			? Math.round(
					finishedExams.reduce((sum, e) => sum + e.test_perc, 0) /
						finishedExams.length,
				)
			: 0;
	const highScore =
		finishedExams.length > 0
			? Math.max(...finishedExams.map((e) => e.test_perc))
			: 0;

	const leaderboard = rankData?.RetData || [];
	const currentUserRank = leaderboard.find((item) => item.userid === userId);
	const topThree = leaderboard.slice(0, 3);

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Crown className="w-5 h-5 text-primary" />;
			case 2:
				return <Medal className="w-5 h-5 text-muted-foreground" />;
			case 3:
				return <Award className="w-5 h-5 text-muted-foreground" />;
			default:
				return null;
		}
	};

	const getRankBadgeVariant = (rank: number) => {
		if (rank === 1) return "default";
		if (rank <= 3) return "secondary";
		return "outline";
	};

	return (
		<>
			<div className="min-h-screen bg-page-gradient py-8 px-4">
				<div className="max-w-7xl mx-auto space-y-8">
					{/* Header Section */}
					<div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
						<Badge variant="secondary" className="gap-2">
							<Trophy className="w-4 h-4" />
							Шалгалтын үр дүн
						</Badge>
						<h1 className="text-4xl md:text-5xl font-black text-foreground">
							Миний үр дүнгүүд
						</h1>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Таны өгсөн бүх шалгалтын дэлгэрэнгүй үр дүн болон статистик
						</p>
					</div>

					{/* Stats Grid with Toggle */}
					{finishedExams.length > 0 && (
						<div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
							<div className="flex justify-end">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowStats(!showStats)}
									className="gap-2"
								>
									{showStats ? (
										<>
											<EyeOff className="w-4 h-4" />
											Оноо нуух
										</>
									) : (
										<>
											<Eye className="w-4 h-4" />
											Оноо харуулах
										</>
									)}
								</Button>
							</div>

							{showStats && (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<Card>
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="p-3 bg-primary/10 rounded-xl">
													<CheckCircle className="w-6 h-6 text-primary" />
												</div>
												<div className="text-4xl font-black text-foreground">
													{finishedExams.length}
												</div>
											</div>
											<div className="text-muted-foreground text-sm font-semibold">
												Дууссан шалгалт
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="p-3 bg-primary/10 rounded-xl">
													<TrendingUp className="w-6 h-6 text-primary" />
												</div>
												<div className="text-4xl font-black text-foreground">
													{avgScore}%
												</div>
											</div>
											<div className="text-muted-foreground text-sm font-semibold">
												Дундаж үр дүн
											</div>
										</CardContent>
									</Card>

									<Card>
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="p-3 bg-primary/10 rounded-xl">
													<Award className="w-6 h-6 text-primary" />
												</div>
												<div className="text-4xl font-black text-foreground">
													{highScore}%
												</div>
											</div>
											<div className="text-muted-foreground text-sm font-semibold">
												Хамгийн өндөр оноо
											</div>
										</CardContent>
									</Card>
								</div>
							)}
						</div>
					)}

					{/* Exams List */}
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-2xl font-black text-foreground">
								Бүх шалгалтууд
							</h2>
							<Badge variant="secondary">{exams.length} шалгалт</Badge>
						</div>

						<CardContent className="space-y-4">
							{exams.map((exam, index) => (
								<div
									key={exam.exam_id}
									className="animate-in fade-in-0 slide-in-from-bottom-2"
									style={{ animationDelay: `${index * 50}ms` }}
								>
									<ExamListItem exam={exam} onViewRank={setSelectedExamId} />
								</div>
							))}
						</CardContent>
					</div>
				</div>
			</div>

			{/* Rank Modal */}
			{selectedExamId && (
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
					onClick={() => setSelectedExamId(null)}
					onKeyDown={(e) => e.key === "Escape" && setSelectedExamId(null)}
					role="dialog"
					aria-modal="true"
				>
					<Card
						className="max-w-7xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<CardHeader className="sticky top-0 bg-primary p-6 z-10">
							<div className="flex items-center justify-between text-primary-foreground">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary-foreground/20 rounded-xl">
										<Trophy className="w-6 h-6" />
									</div>
									<div>
										<h2 className="text-2xl font-black">Leaderboard</h2>
										<p className="text-sm text-primary-foreground/80">
											{leaderboard.length} оролцогч
										</p>
									</div>
								</div>
								<Button
									onClick={() => setSelectedExamId(null)}
									variant="ghost"
									size="icon"
									className="text-primary-foreground hover:bg-primary-foreground/20"
								>
									<X className="w-6 h-6" />
								</Button>
							</div>
						</CardHeader>

						{isRankLoading ? (
							<CardContent className="p-12 text-center">
								<UseAnimations
									animation={loading2}
									size={60}
									strokeColor="hsl(var(--primary))"
									loop
									className="mx-auto mb-4"
								/>
								<p className="font-semibold text-muted-foreground">
									Rank-г ачааллаж байна...
								</p>
							</CardContent>
						) : leaderboard.length === 0 ? (
							<CardContent className="p-12 text-center">
								<FileQuestion className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
								<p className="text-muted-foreground">
									Leaderboard-д мэдээлэл байхгүй байна.
								</p>
							</CardContent>
						) : (
							<CardContent className="p-6 overflow-auto max-h-[calc(90vh-112px)]">
								<div className="space-y-6">
									{/* Top 3 Podium - Compact Modal Version */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										{topThree.map((item, index) => (
											<Card
												key={item.userid}
												className={`relative overflow-hidden ${
													index === 0
														? "md:order-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
														: index === 1
															? "md:order-1 bg-gradient-to-br from-muted/30 to-muted/50 border-muted-foreground/20"
															: "md:order-3 bg-gradient-to-br from-accent/30 to-accent/50 border-accent-foreground/20"
												}`}
											>
												<div className="absolute top-0 right-0 w-24 h-24 opacity-10">
													{getRankIcon(index + 1)}
												</div>
												<CardContent className="p-4 text-center relative">
													<div className="mb-3">{getRankIcon(index + 1)}</div>
													<div className="mb-3">
														{item.img_av ? (
															<Image
																src={item.img_av}
																alt={item.fname}
																width={64}
																height={64}
																className="rounded-full mx-auto border-4 border-background shadow-lg"
															/>
														) : (
															<div className="w-16 h-16 rounded-full mx-auto bg-muted flex items-center justify-center border-4 border-background shadow-lg">
																<User className="w-8 h-8 text-muted-foreground" />
															</div>
														)}
													</div>
													<h3 className="text-lg font-bold text-foreground mb-1 truncate">
														{item.fname}
													</h3>
													{item.sch_name && (
														<p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1 truncate">
															<School className="w-3 h-3 flex-shrink-0" />
															<span className="truncate">{item.sch_name}</span>
														</p>
													)}
													<div className="text-2xl font-black text-primary">
														{item.point}
													</div>
													<p className="text-xs text-muted-foreground">оноо</p>
													{item.userid === userId && (
														<Badge className="mt-2 text-xs">Та</Badge>
													)}
												</CardContent>
											</Card>
										))}
									</div>

									<Separator />

									{/* Grid Layout */}
									<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
										{/* Current User Sidebar */}
										{currentUserRank && (
											<div className="lg:col-span-1">
												<Card className="sticky top-0 bg-primary/5 border-primary/30">
													<CardHeader className="pb-3">
														<CardTitle className="text-base flex items-center gap-2">
															<TrendingUp className="w-4 h-4" />
															Таны мэдээлэл
														</CardTitle>
													</CardHeader>
													<CardContent className="space-y-3">
														<div className="text-center mb-4">
															{currentUserRank.img_av ? (
																<Image
																	src={currentUserRank.img_av}
																	alt="Avatar"
																	width={80}
																	height={80}
																	className="rounded-full mx-auto mb-3 border-4 border-primary/30"
																/>
															) : (
																<div className="w-20 h-20 rounded-full mx-auto mb-3 bg-muted flex items-center justify-center border-4 border-primary/30">
																	<User className="w-10 h-10 text-muted-foreground" />
																</div>
															)}
															<h3 className="text-base font-bold text-foreground">
																{currentUserRank.fname}
															</h3>
														</div>

														<Separator />

														<div className="space-y-2">
															<div className="bg-muted/50 rounded-xl p-3">
																<span className="text-xs text-muted-foreground block mb-1">
																	Байр:
																</span>
																<p className="text-2xl font-black text-primary">
																	#{currentUserRank.ranks}
																</p>
																<span className="text-xs text-muted-foreground">
																	/ {leaderboard.length} хүн
																</span>
															</div>

															<div className="bg-muted/50 rounded-xl p-3">
																<span className="text-xs text-muted-foreground block mb-1">
																	Оноо:
																</span>
																<p className="text-xl font-bold text-foreground">
																	{currentUserRank.point}
																</p>
															</div>

															{currentUserRank.sch_name && (
																<div className="bg-muted/50 rounded-xl p-3">
																	<span className="text-xs text-muted-foreground block mb-1 flex items-center gap-1">
																		<School className="w-3 h-3" />
																		Сургууль:
																	</span>
																	<p className="font-medium text-foreground text-xs">
																		{currentUserRank.sch_name}
																	</p>
																</div>
															)}
														</div>
													</CardContent>
												</Card>
											</div>
										)}

										{/* Full Leaderboard List */}
										<div className="lg:col-span-3 space-y-2">
											{leaderboard.map((item, index) => {
												const isCurrentUser = item.userid === userId;
												const isTop3 = index < 3;

												return (
													<Card
														key={item.userid}
														className={`transition-all hover:scale-[1.01] ${
															isCurrentUser
																? "bg-primary/10 border-primary shadow-sm"
																: isTop3
																	? "bg-accent/50 border-accent-foreground/20"
																	: ""
														}`}
													>
														<CardContent className="p-4">
															<div className="flex items-center gap-3">
																{/* Rank */}
																<div className="flex-shrink-0">
																	{item.medal ? (
																		<Image
																			src={item.medal}
																			alt={`Rank ${index + 1}`}
																			width={40}
																			height={40}
																		/>
																	) : (
																		<Badge
																			variant={getRankBadgeVariant(index + 1)}
																			className="w-10 h-10 flex items-center justify-center text-base font-black rounded-lg"
																		>
																			{index + 1}
																		</Badge>
																	)}
																</div>

																{/* Avatar */}
																{item.img_av ? (
																	<Image
																		src={item.img_av}
																		alt={item.fname}
																		width={48}
																		height={48}
																		className="rounded-full border-2 border-border flex-shrink-0"
																	/>
																) : (
																	<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
																		<User className="w-6 h-6 text-muted-foreground" />
																	</div>
																)}

																{/* Info */}
																<div className="flex-1 min-w-0">
																	<p className="font-bold text-base text-foreground truncate flex items-center gap-2">
																		{item.fname}
																		{isCurrentUser && (
																			<Badge
																				variant="default"
																				className="text-xs"
																			>
																				Та
																			</Badge>
																		)}
																	</p>
																	{item.sch_name && (
																		<p className="text-xs text-muted-foreground truncate flex items-center gap-1">
																			<School className="w-3 h-3" />
																			{item.sch_name}
																		</p>
																	)}
																</div>

																{/* Score */}
																<div className="text-right flex-shrink-0">
																	<div className="font-black text-xl text-primary">
																		{item.point}
																	</div>
																	<div className="text-xs text-muted-foreground">
																		оноо
																	</div>
																</div>
															</div>
														</CardContent>
													</Card>
												);
											})}
										</div>
									</div>
								</div>
							</CardContent>
						)}
					</Card>
				</div>
			)}
		</>
	);
}