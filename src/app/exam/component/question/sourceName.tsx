"use client";

import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { memo, useMemo, useState } from "react";
import MathContent from "@/app/exam/component/examUtils/MathContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ExamSourceRaw {
	questionIndex: number;
	questionLabel: string;
	sourceName: string | null | undefined;
	sourceImg: string | null | undefined;
	rowNum: string;
	assigSourceId?: number | null;
	sectionId?: number | null;
	sectionNumber?: number | null;
}

interface DeduplicatedSource {
	assigSourceId: number | null;
	sourceName: string | null | undefined;
	sourceImg: string | null | undefined;
	/** 1-based row numbers that reference this source */
	rowNums: number[];
	/** First question index (0-based) for scroll/highlight logic */
	firstQuestionIndex: number;
	sectionId: number | null;
	sectionNumber: number | null;
}

interface ExamSourceCardProps {
	sources: ExamSourceRaw[];
	currentIndex: number;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Deduplicate sources by assig_source_id.
 * Sources without an id (assigSourceId === null/0) are kept as-is (one entry per question).
 */
function deduplicateSources(sources: ExamSourceRaw[]): DeduplicatedSource[] {
	const map = new Map<string, DeduplicatedSource>();

	for (const src of sources) {
		const key =
			src.assigSourceId != null && src.assigSourceId !== 0
				? `id:${src.assigSourceId}`
				: `idx:${src.questionIndex}`;

		if (map.has(key)) {
			const existing = map.get(key)!;
			const rowNum = Number(src.rowNum);
			if (!existing.rowNums.includes(rowNum)) {
				existing.rowNums.push(rowNum);
				existing.rowNums.sort((a, b) => a - b);
			}
		} else {
			map.set(key, {
				assigSourceId: src.assigSourceId ?? null,
				sourceName: src.sourceName,
				sourceImg: src.sourceImg,
				rowNums: [Number(src.rowNum)],
				firstQuestionIndex: src.questionIndex,
				sectionId: src.sectionId ?? null,
				sectionNumber: src.sectionNumber ?? null,
			});
		}
	}

	// Sort by firstQuestionIndex
	return Array.from(map.values()).sort(
		(a, b) => a.firstQuestionIndex - b.firstQuestionIndex,
	);
}

/** Format rowNums array into a human-readable range string, e.g. "1-5" or "1, 3, 7" */
function formatRowRange(rowNums: number[]): string {
	if (rowNums.length === 0) return "";
	if (rowNums.length === 1) return `${rowNums[0]}-р асуулт`;

	// Check if it's a contiguous range
	const isContiguous = rowNums.every(
		(v, i) => i === 0 || v === rowNums[i - 1] + 1,
	);

	if (isContiguous) {
		return `${rowNums[0]}–${rowNums[rowNums.length - 1]}-р асуултууд`;
	}

	return `${rowNums.map((n) => `${n}`).join(", ")}-р асуултууд`;
}

// ─────────────────────────────────────────────
// Sub-component: single collapsible source block
// ─────────────────────────────────────────────

interface SourceBlockProps {
	source: DeduplicatedSource;
	isActive: boolean;
	defaultExpanded?: boolean;
}

const SourceBlock = memo(function SourceBlock({
	source,
	isActive,
	defaultExpanded = true,
}: SourceBlockProps) {
	const [expanded, setExpanded] = useState(defaultExpanded);

	const rangeLabel = formatRowRange(source.rowNums);
	const sectionLabel =
		source.sectionNumber != null ? `Хэсэг ${source.sectionNumber}` : null;

	return (
		<div
			className={`rounded-lg border transition-all duration-200 ${
				isActive
					? "border-blue-400 bg-blue-50/60 dark:bg-blue-950/30 shadow-sm"
					: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
			}`}
		>
			{/* Header */}
			<button
				type="button"
				onClick={() => setExpanded((v) => !v)}
				className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
			>
				<div className="flex items-center gap-2 min-w-0">
					<FileText
						className={`w-4 h-4 shrink-0 ${
							isActive ? "text-blue-500" : "text-slate-400 dark:text-slate-500"
						}`}
					/>
					<div className="flex flex-col min-w-0">
						{sectionLabel && (
							<span
								className={`text-[10px] font-bold uppercase tracking-wide ${
									isActive
										? "text-blue-500 dark:text-blue-400"
										: "text-slate-400 dark:text-slate-500"
								}`}
							>
								{sectionLabel}
							</span>
						)}
						<span
							className={`text-xs font-semibold truncate ${
								isActive
									? "text-blue-700 dark:text-blue-300"
									: "text-slate-600 dark:text-slate-400"
							}`}
						>
							{rangeLabel}
						</span>
					</div>
				</div>
				{expanded ? (
					<ChevronUp className="w-4 h-4 shrink-0 text-slate-400" />
				) : (
					<ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
				)}
			</button>

			{/* Body */}
			{expanded && (
				<div className="px-4 pb-4 space-y-3">
					{source.sourceImg && (
						<img
							src={source.sourceImg}
							alt="Эхийн зураг"
							className="w-full rounded-md object-cover max-h-64"
						/>
					)}
					{source.sourceName && (
						<div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert overflow-y-auto max-h-[60vh] pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
							<MathContent html={source.sourceName} />
						</div>
					)}
				</div>
			)}
		</div>
	);
});

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

const ExamSourceCard = memo(function ExamSourceCard({
	sources,
	currentIndex,
}: ExamSourceCardProps) {
	const deduped = useMemo(() => deduplicateSources(sources), [sources]);

	if (deduped.length === 0) return null;

	return (
		<Card className="border-slate-200 dark:border-slate-700 shadow-sm">
			<CardHeader className="pb-2 pt-4 px-4">
				<CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
					<FileText className="w-4 h-4" />
					Эх материал
				</CardTitle>
			</CardHeader>
			<CardContent className="px-4 pb-4 space-y-3">
				{deduped.map((src, i) => {
					// A source is "active" if the currentIndex falls within its questions
					const isActive = src.rowNums.some(
						(rowNum) =>
							// map rowNum (1-based) back to approximate question index
							// We use firstQuestionIndex as anchor; active if within the range
							Math.abs(rowNum - 1 - currentIndex) < src.rowNums.length + 2,
					);

					return (
						<SourceBlock
							key={src.assigSourceId ?? `src-${i}`}
							source={src}
							isActive={isActive}
							defaultExpanded={i === 0}
						/>
					);
				})}
			</CardContent>
		</Card>
	);
});

export default ExamSourceCard;
