"use client";

import { useQuery } from "@tanstack/react-query";
import { User, UserCircle } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/page/pageHeader";
import {
	EmptyState,
	ErrorState,
	LoadingState,
} from "@/components/page/pageStates";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { UserProfileResponseType } from "@/types/user";
import { ProfileContent } from "./form";

// Төлөвүүдийн үед ч гарчиг харагдана
function StateShell({ children }: { children: ReactNode }) {
	return (
		<div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
			<PageHeader
				title="Миний профайл"
				description="Хувийн болон сургуулийн мэдээлэл"
				icon={UserCircle}
			/>
			{children}
		</div>
	);
}

export default function UserProfilePage() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError, error, refetch } =
		useQuery<UserProfileResponseType>({
			queryKey: ["userProfilePage", userId],
			queryFn: () => getUserProfile(userId || 0),
			enabled: !!userId,
			retry: 2,
		});

	if (!userId) {
		return (
			<StateShell>
				<EmptyState
					icon={User}
					title="Нэвтрээгүй байна"
					description="Профайл үзэхийн тулд системд нэвтэрнэ үү"
					action={
						<Button className="h-11" size="lg">
							Нэвтрэх
						</Button>
					}
				/>
			</StateShell>
		);
	}

	if (isLoading) {
		return (
			<StateShell>
				<LoadingState label="Профайл ачааллаж байна..." />
			</StateShell>
		);
	}

	if (isError) {
		return (
			<StateShell>
				<ErrorState
					description={
						error instanceof Error
							? error.message
							: "Тодорхойгүй алдаа гарлаа. Дахин оролдоно уу."
					}
					onRetry={() => refetch()}
				/>
			</StateShell>
		);
	}

	const user = data?.RetData?.[0];
	const isSuccess = data?.RetResponse?.ResponseType === true;

	if (!isSuccess || !user) {
		return (
			<StateShell>
				<ErrorState
					title="Профайл татахад алдаа гарлаа"
					description="Таны профайл мэдээлэл олдсонгүй"
					onRetry={() => refetch()}
				/>
			</StateShell>
		);
	}

	return <ProfileContent user={user} userId={userId} />;
}
