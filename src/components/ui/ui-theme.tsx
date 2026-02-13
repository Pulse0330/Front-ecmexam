"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface ThemeSwitchProps extends React.ComponentPropsWithoutRef<"div"> {
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
	const containerRef = useRef<HTMLDivElement>(null);

	const isDark = resolvedTheme === "dark";

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = useCallback(async () => {
		if (!containerRef.current || !mounted) return;

		const newTheme = isDark ? "light" : "dark";

		if (typeof document.startViewTransition === "function") {
			await document.startViewTransition(() => {
				flushSync(() => {
					setTheme(newTheme);
				});
			}).ready;

			const { top, left, width, height } = containerRef.current!.getBoundingClientRect();
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

	if (!mounted) {
		return null;
	}

	return (
		<div
			ref={containerRef}
			className={cn("flex items-center justify-between w-full", className)}
			{...props}
		>
			<button
				type="button"
				onClick={toggleTheme}
				className="inline-flex items-center gap-2 text-sm cursor-pointer text-foreground hover:opacity-80 transition-opacity"
			>
				{!isDark ? (
					<>
						<Sun className="w-5 h-5 shrink-0 text-amber-500" />
						{showLabels && <span className="font-medium">Light</span>}
					</>
				) : (
					<>
						<Moon className="w-5 h-5 shrink-0 text-primary" />
						{showLabels && <span className="font-medium">Dark</span>}
					</>
				)}
			</button>
			<Switch
				checked={isDark}
				onCheckedChange={toggleTheme}
				aria-label={isDark ? "Dark mode идэвхтэй" : "Light mode идэвхтэй"}
			/>
		</div>
	);
};