"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
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
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 p-8 rounded-lg bg-muted border border-border shadow-sm">
					<AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
					<p className="text-foreground font-medium">
						Хэрэглэгч нэвтрээгүй байна.
					</p>
					<p className="text-sm text-muted-foreground">
						Та эхлээд системд нэвтэрнэ үү
					</p>
				</div>
			</div>
		);
	}

	if (isLoading) return <p className="text-center mt-8">Rank-г авч байна...</p>;
	if (isError)
		return (
			<p className="text-center mt-8 text-red-600">
				{(error as Error).message}
			</p>
		);

	const leaderboard: LeaderboardItem[] = data?.RetData || [];

	if (leaderboard.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<p className="text-muted-foreground">
					Leaderboard-д мэдээлэл байхгүй байна.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col md:flex-row max-w-5xl mx-auto mt-8 gap-6">
			{/* Sidebar */}
			<div className="md:w-1/3 p-4 bg-card border border-border rounded-xl shadow-md">
				<h2 className="text-xl font-bold mb-4">Таны мэдээлэл</h2>
				{leaderboard
					.filter((item) => item.userid === userId)
					.map((item) => (
						<div key={item.userid} className="space-y-2">
							<p>
								<b>Байр:</b> {item.ranks} / {leaderboard.length}
							</p>
							<p>
								<b>Оноо:</b> {item.point}
							</p>
							<p>
								<b>Сургууль:</b> {item.sch_name || "-"}
							</p>
						</div>
					))}
			</div>

			{/* Leaderboard */}
			<div className="md:w-2/3 p-4 bg-card border border-border rounded-xl shadow-md overflow-auto">
				<h2 className="text-xl font-bold mb-4">Leaderboard</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{leaderboard.map((item, index) => (
						<div
							key={item.userid}
							className={`p-4 rounded-lg border flex items-center gap-4 ${
								item.userid === userId
									? "bg-green-100 border-green-500"
									: "bg-muted border-border"
							}`}
						>
							<div className="w-8 text-center font-bold">{index + 1}</div>
							<div className="flex-1">
								<p className="font-semibold">{item.fname}</p>
								<p className="text-sm text-muted-foreground">{item.sch_name}</p>
							</div>
							<div className="font-bold">{item.point} оноо</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
