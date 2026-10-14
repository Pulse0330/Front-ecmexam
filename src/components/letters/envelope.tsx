"use client";

import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

// Битүү дугтуй — шинэ захидлын мэдэгдэлд ашиглана
export function ClosedEnvelope({
	width = 88,
	className,
}: {
	width?: number;
	className?: string;
}) {
	const height = Math.round(width * 0.66);
	const seal = Math.round(width * 0.24);

	return (
		<span className={cn("relative block", className)} style={{ width, height }}>
			{/* Дугтуйн бие */}
			<span className="absolute inset-0 block rounded-md bg-[#f3ead6] shadow-xl ring-1 ring-black/5 dark:bg-[#3a352d] dark:ring-white/10" />
			{/* Доод нугалаа */}
			<span
				className="absolute inset-0 block rounded-md bg-[#ebdfc4] dark:bg-[#332f28]"
				style={{ clipPath: "polygon(0 100%, 50% 42%, 100% 100%)" }}
			/>
			{/* Дээд хавтас */}
			<span
				className="absolute inset-0 block rounded-md bg-[#e3d4b4] dark:bg-[#2d2a24]"
				style={{ clipPath: "polygon(0 0, 50% 58%, 100% 0)" }}
			/>
			{/* Лац */}
			<span
				className="absolute top-[58%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-600 text-white shadow-md ring-2 ring-red-700/40"
				style={{ width: seal, height: seal }}
			>
				<Mail style={{ width: seal * 0.5, height: seal * 0.5 }} />
			</span>
		</span>
	);
}