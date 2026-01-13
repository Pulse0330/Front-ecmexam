"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
	className?: string;
	text?: string;
	showIcon?: boolean;
	variant?: "default" | "outline" | "ghost" | "secondary";
	fullWidth?: boolean;
}

export default function BackButton({
	className = "",
	text = "Буцах",
	showIcon = true,
	variant = "outline",
	fullWidth = false,
}: BackButtonProps) {
	const router = useRouter();

	return (
		<Button
			variant={variant}
			onClick={() => router.back()}
			className={cn(fullWidth && "w-full", className)}
		>
			{showIcon && <ArrowLeft className="mr-2 h-4 w-4" />}
			{text}
		</Button>
	);
}

// Хэрэглээ:
/*
import BackButton from '@/components/BackButton';

// Энгийн
<BackButton />

// Бүтэн өргөнтэй
<BackButton fullWidth />

// Өөр variant
<BackButton variant="ghost" />

// Өөр текст
<BackButton text="Нүүр хуудас руу" />

// Icon-гүй
<BackButton showIcon={false} />

// Custom className
<BackButton className="mb-4" />
*/
