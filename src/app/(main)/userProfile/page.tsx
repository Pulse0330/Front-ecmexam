"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { UserProfileResponseType } from "@/types/user";

export default function UserProfilePage() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError, error } = useQuery<UserProfileResponseType>(
		{
			queryKey: ["userProfilePage", userId],
			queryFn: () => getUserProfile(userId!),
			enabled: !!userId,
		},
	);

	if (!userId)
		return (
			<p className="text-center mt-10 text-red-500">
				⚠️ Хэрэглэгч нэвтрээгүй байна.
			</p>
		);

	if (isLoading)
		return (
			<p className="text-center mt-10 text-blue-500 animate-pulse">
				⏳ Уншиж байна...
			</p>
		);

	if (isError)
		return (
			<p className="text-center mt-10 text-red-500">
				❌ Алдаа гарлаа: {(error as Error).message}
			</p>
		);

	const user = data?.RetData?.[0];
	const isSuccess = data?.RetResponse?.ResponseType === true;

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">Хэрэглэгчийн мэдээлэл</h1>

			{isSuccess ? (
				<div className="p-4 border rounded-xl shadow bg-white dark:bg-gray-800">
					<p className="text-green-600 font-semibold">
						✅ Профайл амжилттай татагдлаа!
					</p>
					<div className="mt-3 space-y-2">
						<p>
							<span className="font-medium">Нэр:</span> {user?.username || "—"}
						</p>
						<p>
							<span className="font-medium">Имэйл:</span> {user?.email || "—"}
						</p>

						<p>
							<span className="font-medium">Гишүүн ID:</span> {user?.id || "—"}
						</p>
					</div>
				</div>
			) : (
				<p className="text-red-600 font-semibold">
					❌ Профайл татахад алдаа гарлаа.
				</p>
			)}
		</div>
	);
}
