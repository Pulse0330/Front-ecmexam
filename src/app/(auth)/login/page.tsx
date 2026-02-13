"use client";

import Link from "next/link";
import { Suspense } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import LoginAnimation from "../animation";
import { LoginForm } from "./form";

export default function LoginPage() {
	return (
		<main
			className="relative min-h-screen grid lg:grid-cols-2 
      bg-linear-to-br from-slate-50 via-white to-slate-100
      dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 
      transition-colors duration-500 overflow-hidden"
		>
			<div className="absolute top-4 right-4 z-50">
				<AnimatedThemeToggler
					className="p-3 rounded-full backdrop-blur-sm border transition-all duration-300
            bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-yellow-400 hover:bg-white dark:hover:bg-gray-700/50
            hover:scale-110 shadow-sm"
				/>
			</div>

			<div
				className="hidden lg:flex items-center justify-center p-12 relative overflow-hidden 
       dark:from-gray-900 dark:via-gray-800 dark:to-gray-850 
      transition-colors duration-500"
			>
				<LoginAnimation />
			</div>

			<div className="flex items-center justify-center p-6 relative overflow-hidden">
				<Suspense
					fallback={
						<div className="flex items-center justify-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
						</div>
					}
				>
					<div className="w-full max-w-md space-y-8">
						<LoginForm />

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
									Шалгалтанд бүртгүүлэх
								</span>
							</div>
						</div>

						<Link
							href="/register/mongolian-exam"
							className="group relative w-full flex items-center justify-center gap-2 px-6 py-4 
								bg-gradient-to-r from-emerald-500 to-teal-600 
								dark:from-emerald-600 dark:to-teal-700
								text-white font-semibold rounded-xl
								hover:from-emerald-600 hover:to-teal-700
								dark:hover:from-emerald-700 dark:hover:to-teal-800
								transform hover:-translate-y-0.5 transition-all duration-300
								shadow-lg hover:shadow-xl
								overflow-hidden"
						>
							<span className="relative z-10">
								🇲🇳 Монгол хэл бичгийн шалгалт
							</span>
							<svg
								className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>asd</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 7l5 5m0 0l-5 5m5-5H6"
								/>
							</svg>
						</Link>
					</div>
				</Suspense>
			</div>
		</main>
	);
}
