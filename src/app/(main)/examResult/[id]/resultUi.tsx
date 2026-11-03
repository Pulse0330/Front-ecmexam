"use client";

// Үр дүнгийн дэлгэрэнгүй хуудсуудын (шалгалт, сорил) нийтлэг харагдах хэсгүүд.
// Зөвхөн дүрслэл — оноо тооцох логик хуудсан дотроо үлдэнэ.

import {
	AlertCircle,
	CheckCircle2,
	Clock,
	Hourglass,
	ListChecks,
	MinusCircle,
	XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AnswerStatus = "unanswered" | "correct" | "partial" | "incorrect";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/* ---------------- Дүнгийн хураангуй ---------------- */

interface ResultSummaryProps {
	title?: ReactNode;
	subtitle?: ReactNode;
	dunTitle?: ReactNode;
	tuval?: ReactNode;
	point: number;
	ttlPoint: number;
	perc: number;
	total: number;
	correct: number;
	wrong: number;
	notAnswer: number;
	testTime?: string | null;
}

function percTone(perc: number) {
	if (perc >= 60)
		return {
			text: "text-emerald-600 dark:text-emerald-400",
			bar: "bg-emerald-500",
		};
	if (perc >= 40)
		return { text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" };
	return { text: "text-red-600 dark:text-red-400", bar: "bg-red-500" };
}

export function ResultSummary({
	title,
	subtitle,
	dunTitle,
	tuval,
	point,
	ttlPoint,
	perc,
	total,
	correct,
	wrong,
	notAnswer,
	testTime,
}: ResultSummaryProps) {
	const tone = percTone(perc);
	const barWidth = ttlPoint > 0 ? Math.min((point / ttlPoint) * 100, 100) : 0;

	return (
		<section
			aria-label="Дүнгийн хураангуй"
			className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6"
		>
			{(title || subtitle) && (
				<div className="mb-4 border-b pb-4">
					{title && (
						<h2 className="text-lg font-semibold text-foreground sm:text-xl">
							{title}
						</h2>
					)}
					{subtitle && (
						<p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
					)}
				</div>
			)}

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-6">
				{/* Хувь + оноо */}
				<div className="rounded-xl bg-muted/50 p-4 sm:p-5">
					<p className="text-sm font-medium text-muted-foreground">Таны дүн</p>
					<div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
						<span
							className={cn(
								"text-4xl font-bold tabular-nums sm:text-5xl",
								tone.text,
							)}
						>
							{perc.toFixed(1)}%
						</span>
						{tuval && (
							<span className="rounded-full border bg-card px-2.5 py-0.5 text-sm font-semibold text-foreground">
								Үнэлгээ: {tuval}
							</span>
						)}
					</div>
					{dunTitle && (
						<p className="mt-1 text-sm font-medium text-foreground">
							{dunTitle}
						</p>
					)}

					<div className="mt-4">
						<div className="mb-1.5 flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Авсан оноо</span>
							<span className="font-semibold tabular-nums text-foreground">
								{point} / {ttlPoint}
							</span>
						</div>
						<div
							className="h-2.5 overflow-hidden rounded-full bg-background"
							role="progressbar"
							aria-valuemin={0}
							aria-valuemax={ttlPoint}
							aria-valuenow={point}
							aria-label="Авсан оноо"
						>
							<div
								className={cn("h-full rounded-full transition-all", tone.bar)}
								style={{ width: `${barWidth}%` }}
							/>
						</div>
					</div>

					{testTime && (
						<p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
							<Clock className="size-4" aria-hidden="true" />
							Зарцуулсан хугацаа:
							<span className="font-medium text-foreground">{testTime}</span>
						</p>
					)}
				</div>

				{/* Асуултын тоо */}
				<div className="grid grid-cols-2 gap-3">
					<StatTile
						icon={ListChecks}
						label="Нийт асуулт"
						value={total}
						className="text-foreground"
						iconClassName="bg-primary/10 text-primary"
					/>
					<StatTile
						icon={CheckCircle2}
						label="Зөв"
						value={correct}
						className="text-emerald-600 dark:text-emerald-400"
						iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
					/>
					<StatTile
						icon={XCircle}
						label="Буруу"
						value={wrong}
						className="text-red-600 dark:text-red-400"
						iconClassName="bg-red-500/10 text-red-600 dark:text-red-400"
					/>
					<StatTile
						icon={AlertCircle}
						label="Хариулаагүй"
						value={notAnswer}
						className="text-amber-600 dark:text-amber-400"
						iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
					/>
				</div>
			</div>
		</section>
	);
}

function StatTile({
	icon: Icon,
	label,
	value,
	className,
	iconClassName,
}: {
	icon: typeof CheckCircle2;
	label: string;
	value: ReactNode;
	className?: string;
	iconClassName?: string;
}) {
	return (
		<div className="flex items-center gap-3 rounded-xl border bg-card p-3 sm:p-4">
			<span
				className={cn(
					"flex size-10 shrink-0 items-center justify-center rounded-lg",
					iconClassName,
				)}
			>
				<Icon className="size-5" aria-hidden="true" />
			</span>
			<div className="min-w-0">
				<p className={cn("text-2xl font-bold tabular-nums", className)}>
					{value}
				</p>
				<p className="truncate text-sm text-muted-foreground">{label}</p>
			</div>
		</div>
	);
}

/* ---------------- Шүүлтүүр ---------------- */

export type AnswerFilter = "all" | "correct" | "wrong";

export function AnswerFilterTabs({
	value,
	onChange,
}: {
	value: AnswerFilter;
	onChange: (v: AnswerFilter) => void;
}) {
	const items: {
		key: AnswerFilter;
		label: string;
		icon?: typeof CheckCircle2;
		active: string;
	}[] = [
		{
			key: "all",
			label: "Бүх асуулт",
			icon: ListChecks,
			active: "border-primary bg-primary/10 text-primary ring-1 ring-primary",
		},
		{
			key: "correct",
			label: "Зөв хариулсан",
			icon: CheckCircle2,
			active:
				"border-emerald-500 bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500 dark:text-emerald-300",
		},
		{
			key: "wrong",
			label: "Буруу хариулсан",
			icon: XCircle,
			active:
				"border-red-500 bg-red-500/10 text-red-700 ring-1 ring-red-500 dark:text-red-300",
		},
	];

	return (
		<div className="flex flex-col gap-2 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:p-4">
			<span className="text-sm font-medium text-muted-foreground">
				Асуултуудыг шүүх:
			</span>
			<div className="flex flex-wrap gap-2">
				{items.map(({ key, label, icon: Icon, active }) => {
					const isActive = value === key;
					return (
						<button
							key={key}
							type="button"
							aria-pressed={isActive}
							onClick={() => onChange(key)}
							className={cn(
								"inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
								isActive
									? active
									: "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{Icon && <Icon className="size-4" aria-hidden="true" />}
							{label}
						</button>
					);
				})}
			</div>
		</div>
	);
}

/* ---------------- Асуултын карт ---------------- */

export function QuestionCardHeader({
	index,
	total,
	typeLabel,
	points,
	children,
}: {
	index: number;
	total: number;
	typeLabel: string;
	points: number;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2 border-b bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
					{index + 1}
				</span>
				<span className="text-sm text-muted-foreground">
					Асуулт {index + 1} / {total}
				</span>
				<span className="rounded-full border bg-card px-2.5 py-0.5 text-xs font-medium text-foreground">
					{typeLabel}
				</span>
				<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
					{points} оноо
				</span>
			</div>
			{children}
		</div>
	);
}

export function QuestionStatusBadge({
	status,
	pendingReview,
	earnedPoints,
	total,
}: {
	status: AnswerStatus;
	pendingReview: boolean;
	earnedPoints: number;
	total: number;
}) {
	let Icon = AlertCircle;
	let label = "Хариулаагүй";
	let score: ReactNode = 0;
	let cls =
		"border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";

	if (status === "unanswered" && pendingReview) {
		Icon = Hourglass;
		label = "Багшийн үнэлгээ хүлээгдэж байна";
		score = "-";
	} else if (status === "correct") {
		Icon = CheckCircle2;
		label = "Зөв";
		score = earnedPoints;
		cls =
			"border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";
	} else if (status === "partial") {
		Icon = MinusCircle;
		label = "Дутуу";
		score = earnedPoints;
	} else if (status === "incorrect") {
		Icon = XCircle;
		label = "Буруу";
		score = 0;
		cls =
			"border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300";
	}

	return (
		<span
			className={cn(
				"inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold",
				cls,
			)}
		>
			<Icon className="size-4" aria-hidden="true" />
			{label}
			<span className="ml-1 rounded-full bg-background/70 px-2 py-0.5 text-xs tabular-nums">
				{score}/{total} оноо
			</span>
		</span>
	);
}

/* ---------------- Хариултын мөр ---------------- */

export type RowTone = "correct" | "wrong" | "missing" | "key" | "neutral";

export function answerRowClass(tone: RowTone) {
	return cn(
		"relative flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4",
		tone === "correct" &&
			"border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/20",
		tone === "wrong" && "border-red-500/60 bg-red-50 dark:bg-red-950/20",
		tone === "missing" &&
			"border-amber-500/60 bg-amber-50 dark:bg-amber-950/20",
		tone === "key" &&
			"border-dashed border-emerald-500/70 bg-emerald-50/50 dark:bg-emerald-950/10",
		tone === "neutral" && "bg-card",
	);
}

export function OptionLetter({
	index,
	tone = "neutral",
}: {
	index: number;
	tone?: RowTone;
}) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
				tone === "correct" || tone === "key"
					? "border-emerald-600 bg-emerald-600 text-white"
					: tone === "wrong"
						? "border-red-600 bg-red-600 text-white"
						: "bg-background text-muted-foreground",
			)}
		>
			{OPTION_LABELS[index] ?? index + 1}
		</span>
	);
}

export type TagKind =
	| "your-correct"
	| "your-wrong"
	| "your-pick"
	| "correct"
	| "unanswered";

export function AnswerTag({ kind }: { kind: TagKind }) {
	const map: Record<
		TagKind,
		{ icon: typeof CheckCircle2; label: string; cls: string }
	> = {
		"your-correct": {
			icon: CheckCircle2,
			label: "Таны хариулт · Зөв",
			cls: "bg-emerald-600 text-white",
		},
		"your-wrong": {
			icon: XCircle,
			label: "Таны хариулт · Буруу",
			cls: "bg-red-600 text-white",
		},
		"your-pick": {
			icon: CheckCircle2,
			label: "Таны сонголт",
			cls: "bg-primary/10 text-primary",
		},
		correct: {
			icon: CheckCircle2,
			label: "Зөв хариулт",
			cls: "border border-emerald-600 text-emerald-700 dark:text-emerald-300",
		},
		unanswered: {
			icon: AlertCircle,
			label: "Хариулаагүй",
			cls: "border border-amber-500 text-amber-700 dark:text-amber-300",
		},
	};
	const { icon: Icon, label, cls } = map[kind];
	return (
		<span
			className={cn(
				"inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold sm:text-sm",
				cls,
			)}
		>
			<Icon className="size-4" aria-hidden="true" />
			{label}
		</span>
	);
}
