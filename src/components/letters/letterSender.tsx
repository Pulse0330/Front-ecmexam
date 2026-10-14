"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { initialOf } from "./letterUi";

export function SenderAvatar({
	name,
	photo,
	size = 36,
	className,
}: {
	name: string;
	photo?: string | null;
	size?: number;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-rose-100 to-amber-100 font-semibold text-[#2b2620]/70 ring-2 ring-background",
				className,
			)}
			style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
		>
			{photo ? (
				<Image src={photo} alt={name} fill sizes={`${size}px`} className="object-cover" />
			) : (
				initialOf(name)
			)}
		</span>
	);
}