"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getServerDate } from "@/lib/api";

interface ServerDateProps {
	variant?: "navbar" | "fixed";
}

export default function ServerDate({ variant = "navbar" }: ServerDateProps) {
	const { data: serverDateString, isLoading } = useQuery({
		queryKey: ["serverTime"],
		queryFn: getServerDate,
		staleTime: 0,
	});

	const serverDate = useMemo(
		() => (serverDateString ? new Date(serverDateString) : null),
		[serverDateString],
	);

	const serverDateRef = useRef<number | null>(null);
	const [tickCount, setTickCount] = useState(0);

	useEffect(() => {
		if (serverDate) {
			if (serverDate.getTime() !== serverDateRef.current) {
				serverDateRef.current = serverDate.getTime();
				setTimeout(() => setTickCount(0), 0);
			}
		}
	}, [serverDate]);

	useEffect(() => {
		if (!serverDate) return;
		const interval = setInterval(() => {
			setTickCount((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, [serverDate]);

	const currentTime = useMemo(() => {
		if (!serverDate) return null;
		return new Date(serverDate.getTime() + tickCount * 1000);
	}, [serverDate, tickCount]);

	if (isLoading || !currentTime) {
		return (
			<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
				<Clock className="w-4 h-4 animate-spin" />
				<span className="font-mono text-xs sm:text-sm">--:--:--</span>
			</div>
		);
	}

	const year = currentTime.getUTCFullYear();
	const month = String(currentTime.getUTCMonth() + 1).padStart(2, "0");
	const day = String(currentTime.getUTCDate()).padStart(2, "0");
	const hours = String(currentTime.getUTCHours()).padStart(2, "0");
	const minutes = String(currentTime.getUTCMinutes()).padStart(2, "0");
	const seconds = String(currentTime.getUTCSeconds()).padStart(2, "0");

	// Fixed position variant (original behavior)
	if (variant === "fixed") {
		return (
			<div className="fixed bottom-6 left-6 z-40 p-2 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-lg rounded-2xl transition-all duration-300 hover:scale-110 inline-flex items-center gap-3 px-4 py-2">
				{/* Desktop / Tablet view */}
				<div className="hidden sm:flex items-center gap-3">
					<div className="flex items-center gap-2">
						<Calendar className="w-4 h-4" />
						<span className="text-sm font-semibold tabular-nums">
							{year}.{month}.{day}
						</span>
					</div>
					<div className="w-px h-5 bg-gray-400 dark:bg-gray-600" />
					<div className="flex items-center gap-2">
						<Clock className="w-4 h-4 animate-pulse" />
						<div className="font-mono text-sm font-semibold tabular-nums">
							{hours}:{minutes}:{seconds}
						</div>
					</div>
				</div>

				{/* Mobile view */}
				<div className="flex sm:hidden items-center gap-2">
					<Clock className="w-4 h-4 animate-pulse" />
					<div className="font-mono text-sm font-semibold tabular-nums">
						{hours}:{minutes}:{seconds}
					</div>
				</div>
			</div>
		);
	}

	// Navbar variant (inline)
	return (
		<div className="inline-flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 rounded-lg sm:rounded-xl border border-border/50 hover:bg-secondary/70 transition-colors">
			{/* Desktop / Tablet view */}
			<div className="hidden lg:flex items-center gap-3">
				<div className="flex items-center gap-1.5">
					<Calendar className="w-3.5 h-3.5 text-muted-foreground" />
					<span className="text-xs font-medium tabular-nums">
						{year}.{month}.{day}
					</span>
				</div>
				<div className="w-px h-4 bg-border" />
				<div className="flex items-center gap-1.5">
					<Clock className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />
					<div className="font-mono text-xs font-medium tabular-nums">
						{hours}:{minutes}:{seconds}
					</div>
				</div>
			</div>

			{/* Tablet view - date + time compact */}
			<div className="hidden sm:flex lg:hidden items-center gap-2">
				<div className="flex items-center gap-1.5">
					<Calendar className="w-3.5 h-3.5 text-muted-foreground" />
					<span className="text-xs font-medium tabular-nums">
						{month}.{day}
					</span>
				</div>
				<div className="w-px h-4 bg-border" />
				<div className="flex items-center gap-1.5">
					<Clock className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />
					<div className="font-mono text-xs font-medium tabular-nums">
						{hours}:{minutes}
					</div>
				</div>
			</div>

			{/* Mobile view - time only */}
			<div className="flex sm:hidden items-center gap-1.5">
				<Clock className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />
				<div className="font-mono text-xs font-medium tabular-nums">
					{hours}:{minutes}
				</div>
			</div>
		</div>
	);
}
