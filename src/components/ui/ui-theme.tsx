"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

interface ThemeSwitchProps extends React.ComponentPropsWithoutRef<"button"> {
	duration?: number;
	showLabels?: boolean;
}

export const ThemeSwitch = ({
	className,
	duration = 400,
	showLabels = false,
	...props
}: ThemeSwitchProps) => {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const isDark = resolvedTheme === "dark";

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = useCallback(async () => {
		if (!buttonRef.current || !mounted) return;

		const newTheme = isDark ? "light" : "dark";

		if (typeof document.startViewTransition === "function") {
			await document.startViewTransition(() => {
				flushSync(() => {
					setTheme(newTheme);
				});
			}).ready;

			const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
			const x = left + width / 2;
			const y = top + height / 2;
			const maxRadius = Math.hypot(
				Math.max(left, window.innerWidth - left),
				Math.max(top, window.innerHeight - top),
			);

			document.documentElement.animate(
				{
					clipPath: [
						`circle(0px at ${x}px ${y}px)`,
						`circle(${maxRadius}px at ${x}px ${y}px)`,
					],
				},
				{
					duration,
					easing: "ease-in-out",
					pseudoElement: "::view-transition-new(root)",
				},
			);
		} else {
			setTheme(newTheme);
		}
	}, [isDark, mounted, setTheme, duration]);

	return (
		<button
			ref={buttonRef}
			type="button"
			role="switch"
			aria-checked={isDark}
			aria-label={isDark ? "Dark mode идэвхтэй" : "Light mode идэвхтэй"}
			onClick={toggleTheme}
			className={cn(
				"relative inline-flex items-center gap-2 shrink-0",
				className,
			)}
			{...props}
		>
			{showLabels && (
				<>
					<span className="inline-flex items-center gap-1 text-xs shrink-0 whitespace-nowrap min-w-3.5rem text-foreground">
						{!isDark ? (
							<>
								<Sun className="w-3.5 h-3.5 shrink-0 text-amber-500" />
								<span className="font-semibold">Light</span>
							</>
						) : (
							<>
								<Moon className="w-3.5 h-3.5 shrink-0 text-primary" />
								<span className="font-semibold">Dark</span>
							</>
						)}
					</span>
					<div
						className={cn(
							"relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
							isDark ? "bg-primary" : "bg-muted",
						)}
					>
						<span
							className={cn(
								"absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
								isDark ? "left-6" : "left-1",
							)}
						/>
					</div>
				</>
			)}
			{!showLabels && (
				<div
					className={cn(
						"relative w-11 h-6 rounded-full transition-colors duration-200",
						isDark ? "bg-primary" : "bg-muted",
					)}
				>
					<span
						className={cn(
							"absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
							isDark ? "left-6" : "left-1",
						)}
					/>
				</div>
			)}
		</button>
	);
};
