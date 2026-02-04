"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw, User } from "lucide-react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { UserProfileResponseType } from "@/types/user";
import { ProfileContent } from "./form";

export default function UserProfilePage() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError, error, refetch } =
		useQuery<UserProfileResponseType>({
			queryKey: ["userProfilePage", userId],
			queryFn: () => getUserProfile(userId || 0),
			enabled: !!userId,
			retry: 2,
		});

	// Not logged in - Сайжруулсан дизайн
	if (!userId) {
		return (
			<div className="flex items-center justify-center min-h-[70vh] px-4">
				<div className="text-center space-y-6 max-w-md">
					<div className="relative">
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-24 h-24 bg-primary/10 rounded-full blur-xl" />
						</div>
						<div className="relative bg-card border rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-sm">
							<User className="w-10 h-10 text-muted-foreground" />
						</div>
					</div>
					<div className="space-y-2">
						<h3 className="text-lg font-semibold">Нэвтрээгүй байна</h3>
						<p className="text-sm text-muted-foreground">
							Профайл үзэхийн тулд системд нэвтэрнэ үү
						</p>
					</div>
					<Button className="mt-4">Нэвтрэх</Button>
				</div>
			</div>
		);
	}

	// Loading - Сайжруулсан дизайн
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 px-4">
				<div className="relative">
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" />
					</div>
					<div className="relative">
						<UseAnimations
							animation={loading2}
							size={56}
							strokeColor="hsl(var(--primary))"
							loop
						/>
					</div>
				</div>
				<div className="text-center space-y-2">
					<p className="text-base font-medium">Профайл уншиж байна</p>
					<p className="text-sm text-muted-foreground">Түр хүлээнэ үү...</p>
				</div>
			</div>
		);
	}

	// Error - Сайжруулсан дизайн
	if (isError) {
		return (
			<div className="flex items-center justify-center min-h-[70vh] px-4">
				<div className="max-w-lg w-full">
					<div className="bg-destructive/5 border border-destructive/20 rounded-xl p-8 space-y-6">
						<div className="flex flex-col items-center text-center space-y-4">
							<div className="relative">
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-20 h-20 bg-destructive/10 rounded-full blur-xl" />
								</div>
								<div className="relative bg-destructive/10 rounded-full p-4">
									<AlertCircle className="w-8 h-8 text-destructive" />
								</div>
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-destructive">
									Алдаа гарлаа
								</h3>
								<p className="text-sm text-muted-foreground max-w-md">
									{error instanceof Error
										? error.message
										: "Тодорхойгүй алдаа гарлаа. Дахин оролдоно уу."}
								</p>
							</div>
						</div>
						<div className="flex justify-center">
							<Button
								onClick={() => refetch()}
								variant="outline"
								className="gap-2"
							>
								<RefreshCw className="w-4 h-4" />
								Дахин оролдох
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const user = data?.RetData?.[0];
	const isSuccess = data?.RetResponse?.ResponseType === true;

	// Data error - Сайжруулсан дизайн
	if (!isSuccess || !user) {
		return (
			<div className="flex items-center justify-center min-h-[70vh] px-4">
				<div className="max-w-lg w-full">
					<div className="bg-destructive/5 border border-destructive/20 rounded-xl p-8 space-y-6">
						<div className="flex flex-col items-center text-center space-y-4">
							<div className="relative">
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-20 h-20 bg-destructive/10 rounded-full blur-xl" />
								</div>
								<div className="relative bg-destructive/10 rounded-full p-4">
									<AlertCircle className="w-8 h-8 text-destructive" />
								</div>
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-semibold text-destructive">
									Профайл татахад алдаа гарлаа
								</h3>
								<p className="text-sm text-muted-foreground">
									Таны профайл мэдээлэл олдсонгүй
								</p>
							</div>
						</div>
						<div className="flex justify-center">
							<Button
								onClick={() => refetch()}
								variant="outline"
								className="gap-2"
							>
								<RefreshCw className="w-4 h-4" />
								Дахин оролдох
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return <ProfileContent user={user} userId={userId} />;
}
