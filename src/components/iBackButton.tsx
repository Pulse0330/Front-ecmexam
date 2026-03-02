"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
	className?: string;
	variant?: "ghost" | "outline" | "default" | "secondary";
	label?: string;
}

export function IBackButton({
	className,
	variant = "outline",
}: BackButtonProps) {
	const router = useRouter();

	return (
		<Button
			variant={variant}
			size="icon"
			onClick={() => router.back()}
			className={className}
		>
			<ChevronLeft size={18} strokeWidth={2.5} />
		</Button>
	);
}
