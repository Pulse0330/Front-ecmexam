"use client";

import { useQuery } from "@tanstack/react-query";
import { Trophy, User } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getExamRank } from "@/lib/api";
import type { LeaderboardResponse } from "@/types/exam/examRank";

interface RankModalProps {
	examId: number;
	userId: number;
	onClose: () => void;
	open: boolean;
}

export default function RankModal({
	examId,
	userId,
	onClose,
	open,
}: RankModalProps) {
	const { data: rankData, isLoading } = useQuery<LeaderboardResponse>({
		queryKey: ["examRank", examId, userId],
		queryFn: () => getExamRank(examId, userId),
		enabled: !!examId && !!userId && open,
	});

	const leaderboard = rankData?.RetData || [];

	const getMedalEmoji = (rank: number) => {
		if (rank === 1) return "🥇";
		if (rank === 2) return "🥈";
		if (rank === 3) return "🥉";
		return null;
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
				{/* Header */}
				<DialogHeader className="border-b px-6 py-4">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-xl font-bold flex items-center gap-2">
							<Trophy className="w-5 h-5" />
							Өндөр оноо асван хүүхдүүд
						</DialogTitle>
					</div>
					<p className="text-sm text-muted-foreground">
						{leaderboard.length} оролцогч
					</p>
				</DialogHeader>

				<ScrollArea className="h-[calc(90vh-80px)]">
					<div className="p-6">
						{isLoading ? (
							<div className="space-y-3">
								{[0, 1, 2, 3, 4, 5, 6, 7].map((id) => (
									<Skeleton key={`skeleton-${id}`} className="h-20 w-full" />
								))}
							</div>
						) : leaderboard.length === 0 ? (
							<div className="text-center py-12">
								<Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
								<p className="text-muted-foreground">Мэдээлэл байхгүй байна</p>
							</div>
						) : (
							<div className="space-y-2">
								{leaderboard.map((item) => {
									const isCurrentUser = item.userid === userId;
									const rank = item.ranks;
									const medal = getMedalEmoji(rank);

									return (
										<div
											key={item.userid}
											className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-accent/50 ${
												isCurrentUser
													? "bg-primary/5 border-primary/30"
													: "bg-card border-border"
											}`}
										>
											{/* Rank */}
											<div className="w-10 flex items-center justify-center shrink-0">
												{medal ? (
													<span className="text-2xl">{medal}</span>
												) : (
													<span className="text-base font-semibold text-muted-foreground">
														{rank}
													</span>
												)}
											</div>

											{/* Avatar */}
											{item.img_av ? (
												<Image
													src={item.img_av}
													alt={item.fname}
													width={48}
													height={48}
													className="rounded-full border-2 border-border shrink-0"
												/>
											) : (
												<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-border shrink-0">
													<User className="w-6 h-6 text-muted-foreground" />
												</div>
											)}

											{/* User Info */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-0.5">
													<p className="font-semibold truncate">{item.fname}</p>
													{isCurrentUser && (
														<Badge variant="default" className="text-xs">
															Та
														</Badge>
													)}
												</div>
												{item.sch_name && (
													<p className="text-sm text-muted-foreground truncate">
														{item.sch_name}
													</p>
												)}
											</div>

											{/* Score */}
											<div className="text-right shrink-0">
												<p className="text-lg font-bold">{item.point}</p>
												<p className="text-xs text-muted-foreground">оноо</p>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
