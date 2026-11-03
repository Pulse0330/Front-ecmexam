"use client";

// Нэвтрэх/бүртгүүлэх хуудсуудын нэгдсэн хүрээ:
// зүүн талд брэнд (зөвхөн том дэлгэцэнд), баруун талд нэг багана карт.

import type { ReactNode } from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import LoginAnimation from "./animation";

export const authCardClass =
	"w-full max-w-md rounded-2xl border bg-card shadow-sm";

export function AuthShell({ children }: { children: ReactNode }) {
	return (
		<main className="relative grid min-h-screen overflow-hidden bg-background lg:grid-cols-2">
			<div className="absolute top-4 right-4 z-50">
				<AnimatedThemeToggler
					aria-label="Өнгөний горим солих"
					className="flex size-10 items-center justify-center rounded-full border bg-card text-foreground shadow-sm transition-colors hover:bg-muted"
				/>
			</div>

			<div className="relative hidden items-center justify-center overflow-hidden border-r bg-muted/40 p-12 lg:flex">
				<LoginAnimation />
			</div>

			<div className="relative flex items-center justify-center px-4 py-16 sm:px-6">
				{children}
			</div>
		</main>
	);
}

export default AuthShell;
