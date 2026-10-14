"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { isReklamLiked, trackReklamLike } from "./reklamtracker";

interface AdLikeButtonProps {
	reklamId?: number; // байхгүй бол (API-гүй зар) товч харагдахгүй
	variant?: "pill" | "icon"; // pill = тексттэй том товч, icon = жижиг дугуй
	className?: string;
}

// Popup dialog болон булангийн зарууд дээрх "Таалагдлаа" товч
export function AdLikeButton({
	reklamId,
	variant = "pill",
	className,
}: AdLikeButtonProps) {
	const [liked, setLiked] = useState(false);
	const [pop, setPop] = useState(0);

	// Өмнө нь таалагдсан гэж дарсан эсэхийг сэргээнэ
	useEffect(() => {
		setLiked(isReklamLiked(reklamId));
	}, [reklamId]);

	if (!reklamId) return null;

	const label = liked ? "Таалагдсан" : "Таалагдлаа";

	const handleClick = (e: React.MouseEvent) => {
		// Зарын холбоос руу шилжихээс сэргийлнэ
		e.preventDefault();
		e.stopPropagation();
		setPop((p) => p + 1);
		if (liked) return;
		setLiked(true);
		trackReklamLike(reklamId);
	};

	return (
		<motion.button
			type="button"
			onClick={handleClick}
			whileTap={{ scale: 0.85 }}
			aria-pressed={liked}
			aria-label={label}
			title={label}
			className={cn(
				"relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400",
				variant === "pill" ? "h-11 px-4 text-sm" : "h-7 w-7",
				liked
					? "bg-rose-500 text-white hover:bg-rose-600"
					: variant === "pill"
						? "border border-border bg-background hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
						: "bg-zinc-900/60 text-white backdrop-blur-sm hover:bg-zinc-900/80",
				className,
			)}
		>
			{/* Дарах бүрт тарах цагираг */}
			{pop > 0 && (
				<motion.span
					key={pop}
					aria-hidden
					className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-rose-400"
					initial={{ scale: 1, opacity: 0.8 }}
					animate={{ scale: 1.8, opacity: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				/>
			)}
			<motion.span
				key={liked ? "on" : "off"}
				initial={{ scale: liked ? 0.3 : 1 }}
				animate={{ scale: 1 }}
				transition={{ type: "spring", stiffness: 500, damping: 14 }}
				className="inline-flex"
			>
				<Heart
					className={cn(
						variant === "pill" ? "h-4 w-4" : "h-3.5 w-3.5",
						liked && "fill-current",
					)}
				/>
			</motion.span>
			{variant === "pill" && label}
		</motion.button>
	);
}