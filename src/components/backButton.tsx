"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
}

export default function StyledBackButton({
	className = "",
	onClick,
	confirmTitle = "",
	confirmMessage = "Хадгалаагүй өөрчлөлтүүд алга болно.",
	showConfirm = false,
}: StyledBackButtonProps) {
	const router = useRouter();
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleClick = () => {
		if (showConfirm) {
			setIsDialogOpen(true);
		} else {
			handleConfirm();
		}
	};

	const handleConfirm = () => {
		setIsDialogOpen(false);
		if (onClick) {
			onClick();
		} else {
			router.back();
		}
	};

	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				className={cn(
					"group inline-flex items-center gap-2 p-0 duration-300 cursor-pointer bg-transparent border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-full",
					className,
				)}
				aria-label="Буцах"
			>
				<div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-active:scale-95 transition-all duration-300">
					<ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:-translate-x-0.5 transition-all duration-300" />
				</div>
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
