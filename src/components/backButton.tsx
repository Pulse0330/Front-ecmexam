"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface StyledBackButtonProps {
	className?: string;
	onClick?: () => void; // Custom onClick handler (optional)
}

export default function StyledBackButton({
	className = "",
	onClick,
}: StyledBackButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		if (onClick) {
			onClick();
		} else {
			router.back();
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn(
				"group inline-flex items-center gap-2 p-0 duration-300 cursor-pointer bg-transparent border-none",
				className,
			)}
		>
			<div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors duration-300">
				<ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:-translate-x-0.5 transition-all duration-300" />
			</div>
		</button>
	);
}

// Хэрэглээ:
/*
import StyledBackButton from '@/components/StyledBackButton';

// Энгийн хэрэглээ (router.back())
<StyledBackButton />

// Custom onClick handler
<StyledBackButton onClick={() => router.push('/home')} />

// Custom className
<StyledBackButton className="mb-4" />
*/
