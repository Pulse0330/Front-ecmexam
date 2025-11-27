"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	Award,
	CheckCircle,
	FileQuestion,
	TrendingUp,
	Trophy,
	X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { getExamRank, getexamresultlists } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { LeaderboardResponse } from "@/types/exam/examRank";
import type { ExamresultListResponseType } from "@/types/exam/examResultList";
import { ExamCard } from "./card";

export default function ExamResultList() {
	const { userId } = useAuthStore();
	const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

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

	// Not logged in
	if (!userId) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
				<div className="text-center space-y-4 p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-2xl max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
					<div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
						<AlertCircle className="w-10 h-10 text-orange-500" />
					</div>
					<div>
						<h3 className="text-2xl font-bold text-card-foreground mb-2">
							Хэрэглэгч нэвтрээгүй байна
						</h3>
						<p className="text-muted-foreground">
							Та эхлээд системд нэвтэрнэ үү
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
				<div className="flex flex-col items-center space-y-6">
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 blur-3xl rounded-full animate-pulse" />
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

	// Error state
	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
				<div className="max-w-md w-full bg-gradient-to-br from-destructive/10 to-red-500/5 border-2 border-destructive/50 rounded-2xl p-8 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500">
					<div className="flex flex-col items-center text-center space-y-4">
						<div className="w-20 h-20 bg-gradient-to-br from-destructive/20 to-red-500/20 rounded-full flex items-center justify-center">
							<AlertCircle className="w-10 h-10 text-destructive" />
						</div>
						<div>
							<h3 className="text-2xl font-bold text-destructive mb-2">
								Алдаа гарлаа
							</h3>
							<p className="text-sm text-destructive/80">
								{(error as Error).message}
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Check if response is unsuccessful or data is null
	const isResponseFailed =
		!data?.RetResponse?.ResponseType || data?.RetData === null;
	const exams = data?.RetData || [];

	// Empty state - No exams found
	if (isResponseFailed || exams.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
				<div className="text-center space-y-6 p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-2xl max-w-md animate-in fade-in-0 zoom-in-95 duration-500">
					<div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center">
						<FileQuestion className="w-10 h-10 text-blue-500" />
					</div>
					<div>
						<h3 className="text-2xl font-bold text-card-foreground mb-3">
							Шалгалтын үр дүн олдсонгүй
						</h3>
						<p className="text-muted-foreground">
							Одоогоор дууссан шалгалт байхгүй байна.
						</p>
						{data?.RetResponse?.ResponseMessage && (
							<p className="text-sm text-muted-foreground/80 italic mt-2">
								{data.RetResponse.ResponseMessage}
							</p>
						)}
					</div>
					<div className="pt-4">
						<p className="text-sm text-muted-foreground">
							Та эхлээд шалгалт өгснөөр энд үр дүн харагдах болно.
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Calculate stats
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

	// Success - Show exams
	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
				<div className="max-w-7xl mx-auto space-y-8">
					{/* Header Section */}
					<div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
						<div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
							<Trophy className="w-5 h-5 text-primary" />
							<span className="text-sm font-bold text-primary">
								Шалгалтын үр дүн
							</span>
						</div>
						<h1 className="text-4xl md:text-5xl font-black text-foreground">
							Миний үр дүнгүүд
						</h1>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Таны өгсөн бүх шалгалтын дэлгэрэнгүй үр дүн болон статистик
						</p>
					</div>

					{/* Stats Grid */}
					{finishedExams.length > 0 && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
							<div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl shadow-blue-500/20 text-white">
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
										<CheckCircle className="w-6 h-6" />
									</div>
									<div className="text-4xl font-black">
										{finishedExams.length}
									</div>
								</div>
								<div className="text-blue-100 text-sm font-semibold">
									Дууссан шалгалт
								</div>
							</div>

							<div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 shadow-xl shadow-emerald-500/20 text-white">
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
										<TrendingUp className="w-6 h-6" />
									</div>
									<div className="text-4xl font-black">{avgScore}%</div>
								</div>
								<div className="text-emerald-100 text-sm font-semibold">
									Дундаж үр дүн
								</div>
							</div>

							<div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-xl shadow-amber-500/20 text-white">
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
										<Award className="w-6 h-6" />
									</div>
									<div className="text-4xl font-black">{highScore}%</div>
								</div>
								<div className="text-amber-100 text-sm font-semibold">
									Хамгийн өндөр оноо
								</div>
							</div>
						</div>
					)}

					{/* Exams Grid */}
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-2xl font-black text-foreground">
								Бүх шалгалтууд
							</h2>
							<div className="px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-xl">
								<span className="text-sm font-bold text-muted-foreground">
									{exams.length} шалгалт
								</span>
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
							{exams.map((exam, index) => (
								<div
									key={exam.exam_id}
									className="animate-in fade-in-0 slide-in-from-bottom-4"
									style={{ animationDelay: `${index * 100}ms` }}
								>
									<ExamCard exam={exam} onViewRank={setSelectedExamId} />
								</div>
							))}
						</div>
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
					<div
						className="bg-card rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						role="document"
					>
						{/* Modal Header */}
						<div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex items-center justify-between text-white">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
									<Trophy className="w-6 h-6" />
								</div>
								<h2 className="text-2xl font-black">Leaderboard</h2>
							</div>
							<button
								type="button"
								onClick={() => setSelectedExamId(null)}
								className="p-2 hover:bg-white/20 rounded-xl transition-colors"
								aria-label="Close modal"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Modal Content */}
						{isRankLoading ? (
							<div className="p-12 text-center">
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
							</div>
						) : leaderboard.length === 0 ? (
							<div className="p-12 text-center">
								<FileQuestion className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
								<p className="text-muted-foreground">
									Leaderboard-д мэдээлэл байхгүй байна.
								</p>
							</div>
						) : (
							<div className="p-6 overflow-auto max-h-[calc(90vh-88px)]">
								<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
									{/* User Info Card */}
									{currentUserRank && (
										<div className="lg:col-span-1">
											<div className="sticky top-0 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-6 shadow-lg">
												<div className="text-center mb-6">
													<Image
														src={currentUserRank.img_av}
														alt="Avatar"
														width={96}
														height={96}
														className="rounded-full mx-auto mb-4 border-4 border-primary/30"
													/>
													<h3 className="text-xl font-bold text-foreground mb-1">
														Таны мэдээлэл
													</h3>
												</div>
												<div className="space-y-4">
													<div className="bg-card/50 rounded-xl p-4">
														<span className="text-sm text-muted-foreground block mb-1">
															Байр:
														</span>
														<p className="text-3xl font-black text-primary">
															#{currentUserRank.ranks}
														</p>
														<span className="text-xs text-muted-foreground">
															/ {leaderboard.length} хүн
														</span>
													</div>
													<div className="bg-card/50 rounded-xl p-4">
														<span className="text-sm text-muted-foreground block mb-1">
															Оноо:
														</span>
														<p className="text-2xl font-bold text-foreground">
															{currentUserRank.point}
														</p>
													</div>
													{currentUserRank.sch_name && (
														<div className="bg-card/50 rounded-xl p-4">
															<span className="text-sm text-muted-foreground block mb-1">
																Сургууль:
															</span>
															<p className="font-medium text-foreground text-sm">
																{currentUserRank.sch_name}
															</p>
														</div>
													)}
												</div>
											</div>
										</div>
									)}

									{/* Leaderboard List */}
									<div className="lg:col-span-3 space-y-3">
										{leaderboard.map((item, index) => {
											const isCurrentUser = item.userid === userId;
											const isTop3 = index < 3;

											return (
												<div
													key={item.userid}
													className={`relative p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
														isCurrentUser
															? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-lg dark:from-green-950/30 dark:to-emerald-950/30"
															: isTop3
																? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 dark:from-amber-950/20 dark:to-yellow-950/20"
																: "bg-card/50 border-border hover:bg-card"
													}`}
												>
													<div className="flex items-center gap-4">
														{/* Rank Number / Medal */}
														<div className="relative flex-shrink-0">
															{item.medal ? (
																<div className="relative">
																	<Image
																		src={item.medal}
																		alt={`Rank ${index + 1}`}
																		width={48}
																		height={48}
																	/>
																</div>
															) : (
																<div className="w-12 h-12 flex items-center justify-center bg-muted rounded-xl border-2 border-border font-black text-lg">
																	{index + 1}
																</div>
															)}
														</div>

														{/* Avatar */}
														<Image
															src={item.img_av}
															alt={item.fname}
															width={56}
															height={56}
															className="rounded-full border-2 border-border flex-shrink-0"
														/>

														{/* User Info */}
														<div className="flex-1 min-w-0">
															<p className="font-bold text-lg text-foreground truncate flex items-center gap-2">
																{item.fname}
																{isCurrentUser && (
																	<span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-semibold">
																		Та
																	</span>
																)}
															</p>
															{item.sch_name && (
																<p className="text-sm text-muted-foreground truncate">
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
												</div>
											);
										})}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
