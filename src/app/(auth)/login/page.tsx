"use client";

import { Suspense, useState } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import LoginAnimation from "../animation";
import { LoginForm } from "./form";
import { UserCheckForm } from "./userCreatedialog";

export default function LoginPage() {
	const [open, setOpen] = useState(false);

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
					<div className="w-full max-w-md space-y-6">
						{/* Шалгалтын товч - хамгийн дээр */}
						<button
							type="button"
							onClick={() => setOpen(true)}
							className="w-full flex flex-col items-center justify-center gap-1 px-6 py-4
								bg-gradient-to-r from-emerald-500 to-teal-600
								dark:from-emerald-600 dark:to-teal-700
								text-white rounded-xl
								hover:opacity-90 hover:-translate-y-0.5
								transition-all duration-300 shadow-lg"
						>
							<span className="text-xs opacity-80">Шалгалтанд бүртгүүлэх</span>
							<span className="font-bold text-base">
								🇲🇳 Монгол хэл бичгийн шалгалт
							</span>
						</button>

						{/* Login card */}
						<LoginForm />
					</div>
				</Suspense>
			</div>

			{/* Dialog */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold flex items-center gap-2">
							🇲🇳 Монгол хэл бичгийн шалгалт
						</DialogTitle>
						<DialogDescription>
							Шалгалтанд бүртгүүлэхийн тулд мэдээллээ оруулна уу
						</DialogDescription>
					</DialogHeader>

					<UserCheckForm />
				</DialogContent>
			</Dialog>
		</main>
	);
}
