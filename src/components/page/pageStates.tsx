"use client";

// Хоосон / ачаалж буй / алдааны нэгдсэн төлөвүүд.
// Хэрэглэгч юу болж байгаа, дараа нь юу хийхээ ойлгоно.

import { AlertTriangle, Inbox, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	icon?: LucideIcon;
	title: ReactNode;
	description?: ReactNode;
	/** Дараагийн алхам — жишээ нь "Дахин ачаалах", "Нүүр хуудас руу" */
	action?: ReactNode;
	className?: string;
}

export function EmptyState({
	icon: Icon = Inbox,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center",
				className,
			)}
		>
			<span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
				<Icon className="size-7" />
			</span>
			<p className="text-base font-semibold text-foreground sm:text-lg">
				{title}
			</p>
			{description && (
				<p className="mt-1 max-w-sm text-sm text-muted-foreground">
					{description}
				</p>
			)}
			{action && <div className="mt-5">{action}</div>}
		</div>
	);
}

export function LoadingState({
	label = "Ачааллаж байна...",
	className,
}: {
	label?: ReactNode;
	className?: string;
}) {
	return (
		<output
			className={cn(
				"flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground",
				className,
			)}
		>
			<Loader2 className="size-8 animate-spin text-primary" />
			<p className="text-sm font-medium">{label}</p>
		</output>
	);
}

export function ErrorState({
	title = "Алдаа гарлаа",
	description = "Түр хүлээгээд дахин оролдоно уу.",
	onRetry,
	className,
}: {
	title?: ReactNode;
	description?: ReactNode;
	onRetry?: () => void;
	className?: string;
}) {
	return (
		<EmptyState
			icon={AlertTriangle}
			title={title}
			description={description}
			className={cn("border-destructive/30", className)}
			action={
				onRetry && (
					<Button onClick={onRetry} variant="outline" className="h-10">
						Дахин оролдох
					</Button>
				)
			}
		/>
	);
}
