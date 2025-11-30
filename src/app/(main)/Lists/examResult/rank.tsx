"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Award,
	Trophy,
	Medal,
	Crown,
	User,
	School,
	TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getExamRank } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	LeaderboardItem,
	LeaderboardResponse,
} from "@/types/exam/examRank";

export default function ExamRankPage() {
	const { userId } = useAuthStore();
	const params = useParams();
	const examId = Number(params?.id);

	const { data, isLoading, isError, error } = useQuery<LeaderboardResponse>({
		queryKey: ["examRank", examId, userId],
		queryFn: () => getExamRank(examId, userId || 0),
		enabled: !!examId && !!userId,
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
							Leaderboard уншиж байна
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

	const leaderboard: LeaderboardItem[] = data?.RetData || [];
	const currentUser = leaderboard.find((item) => item.userid === userId);
	const topThree = leaderboard.slice(0, 3);

	if (leaderboard.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-4">
				<Alert className="max-w-md">
					<div className="flex flex-col items-center text-center space-y-4 py-4">
						<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
							<Trophy className="w-10 h-10 text-primary" />
						</div>
						<AlertDescription>
							<h3 className="text-2xl font-bold text-foreground mb-2">
								Мэдээлэл олдсонгүй
							</h3>
							<p className="text-muted-foreground">
								Leaderboard-д мэдээлэл байхгүй байна.
							</p>
						</AlertDescription>
					</div>
				</Alert>
			</div>
		);
	}

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Crown className="w-6 h-6 text-primary" />;
			case 2:
				return <Medal className="w-6 h-6 text-muted-foreground" />;
			case 3:
				return <Award className="w-6 h-6 text-muted-foreground" />;
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
		<div className="min-h-screen bg-page-gradient py-8 px-4">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header Section */}
				<div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
					<Badge variant="secondary" className="gap-2">
						<Trophy className="w-4 h-4" />
						Leaderboard
					</Badge>
					<h1 className="text-4xl md:text-5xl font-black text-foreground">
						Шалгалтын үр дүнгийн жагсаалт
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{leaderboard.length} хүний оролцсон үр дүн
					</p>
				</div>

				{/* Top 3 Podium */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
							<div className="absolute top-0 right-0 w-32 h-32 opacity-10">
								{getRankIcon(index + 1)}
							</div>
							<CardContent className="p-6 text-center relative">
								<div className="mb-4">
									{getRankIcon(index + 1)}
								</div>
								<div className="mb-4">
									{item.img_av ? (
										<Image
											src={item.img_av}
											alt={item.fname}
											width={80}
											height={80}
											className="rounded-full mx-auto border-4 border-background shadow-lg"
										/>
									) : (
										<div className="w-20 h-20 rounded-full mx-auto bg-muted flex items-center justify-center border-4 border-background shadow-lg">
											<User className="w-10 h-10 text-muted-foreground" />
										</div>
									)}
								</div>
								<h3 className="text-xl font-bold text-foreground mb-2">
									{item.fname}
								</h3>
								{item.sch_name && (
									<p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-1">
										<School className="w-3 h-3" />
										{item.sch_name}
									</p>
								)}
								<div className="text-3xl font-black text-primary">
									{item.point}
								</div>
								<p className="text-xs text-muted-foreground mt-1">оноо</p>
								{item.userid === userId && (
									<Badge className="mt-4">Та</Badge>
								)}
							</CardContent>
						</Card>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Current User Card */}
					{currentUser && (
						<div className="lg:col-span-1 animate-in fade-in slide-in-from-left-4 duration-700">
							<Card className="sticky top-4 bg-primary/5 border-primary/30">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<TrendingUp className="w-5 h-5" />
										Таны мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="text-center mb-6">
										{currentUser.img_av ? (
											<Image
												src={currentUser.img_av}
												alt="Avatar"
												width={96}
												height={96}
												className="rounded-full mx-auto mb-4 border-4 border-primary/30"
											/>
										) : (
											<div className="w-24 h-24 rounded-full mx-auto mb-4 bg-muted flex items-center justify-center border-4 border-primary/30">
												<User className="w-12 h-12 text-muted-foreground" />
											</div>
										)}
										<h3 className="text-lg font-bold text-foreground">
											{currentUser.fname}
										</h3>
									</div>

									<Separator />

									<div className="space-y-3">
										<div className="bg-muted/50 rounded-xl p-4">
											<span className="text-sm text-muted-foreground block mb-1">
												Байр:
											</span>
											<p className="text-3xl font-black text-primary">
												#{currentUser.ranks}
											</p>
											<span className="text-xs text-muted-foreground">
												/ {leaderboard.length} хүн
											</span>
										</div>

										<div className="bg-muted/50 rounded-xl p-4">
											<span className="text-sm text-muted-foreground block mb-1">
												Оноо:
											</span>
											<p className="text-2xl font-bold text-foreground">
												{currentUser.point}
											</p>
										</div>

										{currentUser.sch_name && (
											<div className="bg-muted/50 rounded-xl p-4">
												<span className="text-sm text-muted-foreground block mb-1 flex items-center gap-1">
													<School className="w-3 h-3" />
													Сургууль:
												</span>
												<p className="font-medium text-foreground text-sm">
													{currentUser.sch_name}
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Full Leaderboard */}
					<div className="lg:col-span-3 space-y-3 animate-in fade-in slide-in-from-right-4 duration-700">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Trophy className="w-5 h-5" />
									Бүх оролцогчид
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
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
												<div className="flex items-center gap-4">
													{/* Rank */}
													<div className="flex-shrink-0">
														{item.medal ? (
															<Image
																src={item.medal}
																alt={`Rank ${index + 1}`}
																width={48}
																height={48}
															/>
														) : (
															<Badge
																variant={getRankBadgeVariant(index + 1)}
																className="w-12 h-12 flex items-center justify-center text-lg font-black rounded-xl"
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
															width={56}
															height={56}
															className="rounded-full border-2 border-border flex-shrink-0"
														/>
													) : (
														<div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 border-border flex-shrink-0">
															<User className="w-7 h-7 text-muted-foreground" />
														</div>
													)}

													{/* Info */}
													<div className="flex-1 min-w-0">
														<p className="font-bold text-lg text-foreground truncate flex items-center gap-2">
															{item.fname}
															{isCurrentUser && (
																<Badge variant="default" className="text-xs">
																	Та
																</Badge>
															)}
														</p>
														{item.sch_name && (
															<p className="text-sm text-muted-foreground truncate flex items-center gap-1">
																<School className="w-3 h-3" />
																{item.sch_name}
															</p>
														)}
													</div>

													{/* Score */}
													<div className="text-right flex-shrink-0">
														<div className="font-black text-2xl text-primary">
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
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}