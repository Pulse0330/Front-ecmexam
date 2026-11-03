"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
	className?: string;
	variant?: "ghost" | "outline" | "default" | "secondary";
	label?: string;
}

// Зөвхөн сум биш "← Буцах" гэж бичигтэй — юу хийдэг нь шууд ойлгогдоно
export function IBackButton({
	className,
	variant = "outline",
	label = "Буцах",
}: BackButtonProps) {
	const router = useRouter();

	return (
		<Button
			variant={variant}
			onClick={() => router.back()}
			className={cn("h-10 gap-1.5 px-3 font-semibold", className)}
		>
			<ArrowLeft className="size-4" strokeWidth={2.5} />
			{label}
		</Button>
	);
}
