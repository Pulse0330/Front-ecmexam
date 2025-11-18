"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, FileQuestion } from "lucide-react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { getexamresultlists } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamresultListResponseType } from "@/types/exam/examResultList";
import { ExamCard } from "./card";

export default function ExamResultList() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError, error } =
		useQuery<ExamresultListResponseType>({
			queryKey: ["examResults", userId],
			queryFn: () => getexamresultlists(userId || 0),
			enabled: !!userId,
		});

	// Not logged in
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

	// Loading state
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
				<div className="relative">
					<div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
					<UseAnimations
						animation={loading2}
						size={64}
						strokeColor="hsl(var(--primary))"
						loop
					/>
				</div>
				<div className="space-y-2 text-center">
					<p className="text-lg font-medium text-foreground animate-pulse">
						Уншиж байна...
					</p>
					<p className="text-sm text-muted-foreground">Түр хүлээнэ үү</p>
				</div>
			</div>
		);
	}

	// Error state
	if (isError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-4">
				<div className="max-w-md w-full bg-destructive/10 border border-destructive/50 rounded-lg p-6 shadow-sm">
					<div className="flex items-start space-x-3">
						<AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
						<div className="flex-1 space-y-2">
							<h3 className="font-semibold text-destructive">Алдаа гарлаа</h3>
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
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 p-8 rounded-lg bg-card border border-border shadow-sm max-w-md">
					<div className="flex justify-center">
						<div className="p-4 bg-muted rounded-full">
							<FileQuestion className="w-12 h-12 text-muted-foreground" />
						</div>
					</div>
					<div className="space-y-2">
						<h3 className="text-xl font-semibold text-card-foreground">
							Шалгалтын үр дүн олдсонгүй
						</h3>
						<p className="text-muted-foreground">
							Одоогоор дууссан шалгалт байхгүй байна.
						</p>
						{data?.RetResponse?.ResponseMessage && (
							<p className="text-sm text-muted-foreground/80 italic">
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

	// Success - Show exams
	return (
		<div className="space-y-6 p-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-card-foreground">
						Шалгалтын үр дүн
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Нийт {exams.length} шалгалтын үр дүн
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{exams.map((exam, index) => (
					<div
						key={exam.exam_id}
						className="animate-in fade-in-0 slide-in-from-bottom-4"
						style={{ animationDelay: `${index * 50}ms` }}
					>
						<ExamCard exam={exam} />
					</div>
				))}
			</div>
		</div>
	);
}
