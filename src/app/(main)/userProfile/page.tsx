"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { UserProfileResponseType } from "@/types/user";
import { ProfileContent } from "./form";

export default function UserProfilePage() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError, error } = useQuery<UserProfileResponseType>(
		{
			queryKey: ["userProfilePage", userId],
			queryFn: () => getUserProfile(userId || 0),
			enabled: !!userId,
		},
	);

	// Not logged in
	if (!userId) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-3 p-6">
					<AlertCircle className="w-10 h-10 mx-auto text-muted-foreground" />
					<p className="text-sm text-muted-foreground">
						Системд нэвтрээгүй байна
					</p>
				</div>
			</div>
		);
	}

	// Loading
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
				<UseAnimations
					animation={loading2}
					size={48}
					strokeColor="hsl(var(--primary))"
					loop
				/>
				<p className="text-sm text-muted-foreground">Уншиж байна...</p>
			</div>
		);
	}

	// Error
	if (isError) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-4">
				<div className="max-w-md w-full border border-destructive/20 rounded-lg p-6">
					<div className="flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-medium text-destructive">
								Алдаа гарлаа
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								{(error as Error).message}
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const user = data?.RetData?.[0];
	const isSuccess = data?.RetResponse?.ResponseType === true;

	if (!isSuccess || !user) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] p-4">
				<div className="max-w-md w-full border border-destructive/20 rounded-lg p-6">
					<div className="flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
						<p className="text-sm font-medium text-destructive">
							Профайл татахад алдаа гарлаа
						</p>
					</div>
				</div>
			</div>
		);
	}

	return <ProfileContent user={user} userId={userId} />;
}
