"use client";

import { useQuery } from "@tanstack/react-query";
import { gettestgroup } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { GetTestGroupResponse } from "@/types/exercise/testgroup";

export default function TestGroupPage() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError, error } = useQuery<GetTestGroupResponse>({
		queryKey: ["testGroup", userId],
		queryFn: () => gettestgroup(userId || 0),
	});

	if (!userId)
		return (
			<p className="text-center mt-10 text-red-500">
				Хэрэглэгч нэвтрээгүй байна.
			</p>
		);

	if (isLoading)
		return <p className="text-center mt-10 text-blue-500">Уншиж байна...</p>;

	if (isError)
		return (
			<p className="text-center mt-10 text-red-500">
				Алдаа гарлаа: {(error as Error).message}
			</p>
		);

	// Амжилттай холбогдсон эсэхийг шалгах
	const isSuccess = data?.RetResponse?.ResponseType === true;

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-bold mb-4">Test Group API Холболт</h1>

			{isSuccess ? (
				<div className="text-green-600 font-semibold">
					✅ Амжилттай холбогдлоо!
				</div>
			) : (
				<div className="text-red-600 font-semibold">❌ Холболт амжилтгүй!</div>
			)}

			<div className="mt-4">
				{data?.RetData?.length ? (
					<ul className="space-y-2">
						{data.RetData.map((item) => (
							<li
								key={item.id}
								className="border rounded-lg p-3 bg-white dark:bg-gray-800 shadow"
							>
								<p className="font-medium">{item.name}</p>
								<p className="text-sm text-gray-500">
									{item.coursename} — {item.ulesson_name}
								</p>
								<p className="text-sm text-gray-500">
									Тестийн тоо: {item.cnt} | Хувь: {item.tpercent}%
								</p>
							</li>
						))}
					</ul>
				) : (
					<p>Өгөгдөл олдсонгүй.</p>
				)}
			</div>
		</div>
	);
}
