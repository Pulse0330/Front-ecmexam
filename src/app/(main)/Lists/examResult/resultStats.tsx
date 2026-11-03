"use client";

// Үр дүнгийн жагсаалтын (шалгалт, сорил) нийтлэг хэсгүүд: статистик, оноо харах товч.

import {
	Award,
	CheckCircle2,
	Eye,
	EyeOff,
	type LucideIcon,
	TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function scoreTone(perc: number) {
	if (perc >= 60) return "text-emerald-600 dark:text-emerald-400";
	if (perc >= 40) return "text-amber-600 dark:text-amber-400";
	return "text-red-600 dark:text-red-400";
}

export function ScoreToggleButton({
	shown,
	onToggle,
}: {
	shown: boolean;
	onToggle: () => void;
}) {
	return (
		<Button variant="outline" onClick={onToggle} className="h-10 gap-2">
			{shown ? (
				<EyeOff className="size-4" aria-hidden="true" />
			) : (
				<Eye className="size-4" aria-hidden="true" />
			)}
			{shown ? "Оноо нуух" : "Оноо харуулах"}
		</Button>
	);
}

export function ResultStats({
	finishedCount,
	finishedLabel,
	avgScore,
	highScore,
}: {
	finishedCount: number;
	finishedLabel: string;
	avgScore: number;
	highScore: number;
}) {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<StatCard
				icon={CheckCircle2}
				label={finishedLabel}
				value={finishedCount}
				iconClassName="bg-primary/10 text-primary"
			/>
			<StatCard
				icon={TrendingUp}
				label="Дундаж үр дүн"
				value={`${avgScore}%`}
				valueClassName={scoreTone(avgScore)}
				iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
			/>
			<StatCard
				icon={Award}
				label="Хамгийн өндөр"
				value={`${highScore}%`}
				valueClassName={scoreTone(highScore)}
				iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
			/>
		</div>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
	valueClassName,
	iconClassName,
}: {
	icon: LucideIcon;
	label: string;
	value: ReactNode;
	valueClassName?: string;
	iconClassName?: string;
}) {
	return (
		<div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
			<span
				className={cn(
					"flex size-11 shrink-0 items-center justify-center rounded-xl",
					iconClassName,
				)}
			>
				<Icon className="size-5" aria-hidden="true" />
			</span>
			<div className="min-w-0">
				<p
					className={cn(
						"text-2xl font-bold tabular-nums text-foreground",
						valueClassName,
					)}
				>
					{value}
				</p>
				<p className="text-sm text-muted-foreground">{label}</p>
			</div>
		</div>
	);
}
