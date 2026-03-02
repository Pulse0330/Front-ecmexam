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

	// Variant-ээс хамааран default style
	const defaultStyles =
		variant === "ghost"
			? "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
			: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700";

	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				className={cn(
					"group inline-flex items-center gap-2 p-0 duration-300 cursor-pointer border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-full transition-all",
					variant === "default" && defaultStyles,
					className,
				)}
				aria-label={ariaLabel}
			>
				{variant === "default" ? (
					<div
						className={cn(
							"flex items-center justify-center w-8 h-8 rounded-full group-active:scale-95 transition-all duration-300",
							defaultStyles,
						)}
					>
						{showIcon && (
							<ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:-translate-x-0.5 transition-all duration-300" />
						)}
					</div>
				) : (
					showIcon && (
						<ArrowLeft
							className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5"
							aria-hidden="true"
						/>
					)
				)}
			</button>

			<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
						<AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Болих</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirm}>Тийм</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
