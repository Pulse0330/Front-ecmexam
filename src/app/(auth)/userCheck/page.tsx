"use client";

import Link from "next/link";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { UserCheckForm } from "./form";

export default function UserCheckPage() {
	return (
		<main className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500 overflow-hidden px-4 py-12">
			{/* Background blobs */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/50 dark:bg-emerald-900/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-100/50 dark:bg-teal-900/10 rounded-full blur-3xl" />
			</div>

			{/* Theme toggle */}
			<div className="absolute top-4 right-4 z-50">
				<AnimatedThemeToggler className="p-3 rounded-full backdrop-blur-sm border transition-all duration-300 bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-yellow-400 hover:bg-white dark:hover:bg-gray-700/50 hover:scale-110 shadow-sm" />
			</div>

			{/* Back */}
			<Link
				href="/login"
				className="absolute top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-105 shadow-sm"
			>
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<title>Буцах</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Буцах
			</Link>

			{/* Card */}
			<div className="relative w-full max-w-md">
				<div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8">
					{/* Header */}
					<div className="text-center space-y-2 mb-6">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 mb-1">
							<span className="text-3xl">🇲🇳</span>
						</div>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
							Бүртгүүлэх
						</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Монгол хэл бичгийн шалгалт
						</p>
					</div>

					<UserCheckForm />
				</div>
			</div>
		</main>
	);
}
