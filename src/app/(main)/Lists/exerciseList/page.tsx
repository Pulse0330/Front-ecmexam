"use client";

import { useQuery } from "@tanstack/react-query";
import { getTestGroup } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { GetTestGroupResponse } from "@/types/exercise/testGroup";
import TestGroupCard from "./card";

export default function TestGroupPage() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError, error } = useQuery<GetTestGroupResponse>({
		queryKey: ["testGroup", userId],
		queryFn: () => getTestGroup(userId || 0),
	});

	if (!userId) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-red-600 dark:text-red-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Нэвтрэх шаардлагатай дүрс</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						Нэвтрэх шаардлагатай
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Энэ хуудсыг үзэхийн тулд эхлээд нэвтэрнэ үү.
					</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
					<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
						Өгөгдөл уншиж байна...
					</p>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
					<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-red-600 dark:text-red-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Алдааны дүрс</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						Алдаа гарлаа
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						{(error as Error).message}
					</p>
				</div>
			</div>
		);
	}

	const isSuccess = data?.RetResponse?.ResponseType === true;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
						Тестийн бүлгүүд
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Таны хамрагдсан бүх тестийн бүлгүүдийн жагсаалт
					</p>
				</div>

				{/* Status Badge */}
				<div className="mb-6">
					{isSuccess ? (
						<div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full font-medium">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<title>Амжилттай холболт</title>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							Амжилттай холбогдлоо
						</div>
					) : (
						<div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-4 py-2 rounded-full font-medium">
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<title>Холболт амжилтгүй</title>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
							Холболт амжилтгүй
						</div>
					)}
				</div>

				{/* Content */}
				{data?.RetData?.length ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{data.RetData.map((item) => (
							<TestGroupCard key={item.id} item={item} />
						))}
					</div>
				) : (
					<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
						<div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-10 h-10 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Өгөгдөл олдсонгүй дүрс</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
							Өгөгдөл олдсонгүй
						</h3>
						<p className="text-gray-600 dark:text-gray-400">
							Одоогоор тестийн бүлэг байхгүй байна.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
