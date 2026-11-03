"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactElement, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface StyledBackButtonProps {
	className?: string;
	onClick?: () => void;
	confirmTitle?: string;
	confirmMessage?: string;
	showConfirm?: boolean;
	/** Буцах товчны загвар - 'default' эсвэл 'ghost' */
	variant?: "default" | "ghost";
	/** Арилга харуулах эсэх */
	showIcon?: boolean;
	/** Aria label */
	ariaLabel?: string;
	/** Товчны бичиг — зөвхөн сум биш "Буцах" гэж харагдана */
	label?: string;
}

export default function StyledBackButton({
	className = "",
	onClick,
	confirmTitle = "Буцах уу?",
	confirmMessage = "Хадгалаагүй өөрчлөлтүүд алга болно.",
	showConfirm = false,
	variant = "default",
	showIcon = true,
	ariaLabel = "Буцах",
	label = "Буцах",
}: StyledBackButtonProps): ReactElement {
	const router = useRouter();
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

	const handleClick = (): void => {
		if (showConfirm) {
			setIsDialogOpen(true);
		} else {
			handleConfirm();
		}
	};

	const handleConfirm = (): void => {
		setIsDialogOpen(false);
		if (onClick) {
			onClick();
		} else {
			// Өмнөх хуудас руу шилжих
			router.back();
		}
	};

	// "← Буцах" — сум + бичигтэй, дарахад хялбар (36px) товч
	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				className={cn(
					"group inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
					variant === "ghost"
						? "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
						: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
					className,
				)}
				aria-label={ariaLabel}
			>
				{showIcon && (
					<ArrowLeft
						className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
						aria-hidden="true"
					/>
				)}
				<span>{label}</span>
			</button>

			<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
						<AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="gap-2">
						<AlertDialogCancel className="h-11 font-semibold">
							Үлдэх
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							className="h-11 gap-2 font-semibold"
						>
							<ArrowLeft className="h-4 w-4" />
							Тийм, буцах
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
