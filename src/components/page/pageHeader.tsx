"use client";

// Бүх хуудасны нэгдсэн толгой: [← Буцах] Гарчиг + тайлбар ......... [үйлдлүүд]
// Хэрэглэгч хаана байгаа, юу хийж болохыг нэг харцаар ойлгоно.

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import StyledBackButton from "@/components/backButton";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
	title: ReactNode;
	description?: ReactNode;
	icon?: LucideIcon;
	/** true — router.back(); функц — тухайн үйлдэл; байхгүй бол буцах товч гарахгүй */
	back?: boolean | (() => void);
	/** Буцахаас өмнө баталгаажуулах (жишээ нь шалгалт/сорил дунд) */
	backConfirmMessage?: string;
	/** Баруун талын үйлдлүүд (товч, шүүлтүүр гэх мэт) */
	actions?: ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	description,
	icon: Icon,
	back,
	backConfirmMessage,
	actions,
	className,
}: PageHeaderProps) {
	return (
		<header
			className={cn(
				"flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-6",
				className,
			)}
		>
			<div className="flex min-w-0 items-start gap-3">
				{back && (
					<StyledBackButton
						className="mt-0.5"
						onClick={typeof back === "function" ? back : undefined}
						showConfirm={!!backConfirmMessage}
						confirmMessage={backConfirmMessage}
					/>
				)}
				{Icon && (
					<span className="hidden size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
						<Icon className="size-5" />
					</span>
				)}
				<div className="min-w-0">
					<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						{title}
					</h1>
					{description && (
						<p className="mt-1 text-sm text-muted-foreground sm:text-base">
							{description}
						</p>
					)}
				</div>
			</div>
			{actions && (
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					{actions}
				</div>
			)}
		</header>
	);
}

export default PageHeader;
