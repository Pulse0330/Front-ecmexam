// @/app/exam/component/sourceCard.tsx
"use client";

import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import MathContent from "../examUtils/MathContent";

interface SourceItem {
	questionIndex: number;
	questionLabel: string;
	sourceName?: string | null;
	sourceImg?: string | null;
	rowNum?: number | string;
}

interface ExamSourceCardProps {
	// Single mode (хуучин хэрэглээ)
	sourceName?: string | null;
	sourceImg?: string | null;
	// Multi mode — бүх асуултуудын source дамжуулна
	sources?: SourceItem[];
	currentIndex?: number;
}

export default function ExamSourceCard({
	sourceName,
	sourceImg,
	sources,
	currentIndex,
}: ExamSourceCardProps) {
	const [isOpen, setIsOpen] = useState(true);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);

	// Multi mode
	const isMultiMode = sources && sources.length > 0;

	// currentIndex өөрчлөгдөхөд автоматаар тухайн source руу switch хийнэ
	useEffect(() => {
		if (!isMultiMode || currentIndex === undefined) return;
		const idx = sources.findIndex((s) => s.questionIndex === currentIndex);
		if (idx !== -1) setSelectedIndex(idx);
	}, [currentIndex, sources, isMultiMode]);

	if (isMultiMode) {
		const active = sources[selectedIndex];
		if (!active) return null;

		return (
			<div className="border rounded-lg border-amber-200 overflow-hidden">
				{/* Header */}
				<button
					type="button"
					onClick={() => setIsOpen((p) => !p)}
					className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 hover:bg-amber-100 transition-colors"
				>
					<div className="flex items-center gap-2">
						<BookOpen className="w-3.5 h-3.5 text-amber-600" />
						<span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
							Эх сурвалж
							{sources.length > 0 && (
								<span className="ml-1.5 text-amber-500 normal-case">
									({sources.map((s) => s.rowNum).join(", ")}-р асуулт)
								</span>
							)}
						</span>
					</div>
					{isOpen ? (
						<ChevronUp className="w-4 h-4 text-amber-500" />
					) : (
						<ChevronDown className="w-4 h-4 text-amber-500" />
					)}
				</button>

				{isOpen && (
					<div className="bg-amber-50/50">
						{/* Tabs — source байгаа асуултуудын tab */}
						{sources.length > 1 && (
							<div className="flex flex-wrap gap-1 px-3 pt-2">
								{sources.map((s, i) => (
									<button
										key={s.questionIndex}
										type="button"
										onClick={() => setSelectedIndex(i)}
										className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${
											i === selectedIndex
												? "bg-amber-500 text-white border-amber-500"
												: "bg-white text-amber-700 border-amber-300 hover:bg-amber-100"
										}`}
									>
										{s.questionLabel}
									</button>
								))}
							</div>
						)}

						{/* Content */}
						<div className="p-4 space-y-2 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-300 [&::-webkit-scrollbar-track]:bg-amber-50">
							{active.sourceImg && (
								<img
									src={active.sourceImg}
									alt="source"
									className="w-full object-cover rounded-md"
								/>
							)}
							{active.sourceName && (
								<div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
									<MathContent html={active.sourceName} />
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);
	}

	// Single mode
	if (!sourceName && !sourceImg) return null;

	return (
		<div className="border rounded-lg border-amber-200 overflow-hidden">
			<button
				type="button"
				onClick={() => setIsOpen((p) => !p)}
				className="w-full flex items-center justify-between px-3 py-2 bg-amber-50 hover:bg-amber-100 transition-colors"
			>
				<div className="flex items-center gap-2">
					<BookOpen className="w-3.5 h-3.5 text-amber-600" />
					<span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
						Эх сурвалж
					</span>
				</div>
				{isOpen ? (
					<ChevronUp className="w-4 h-4 text-amber-500" />
				) : (
					<ChevronDown className="w-4 h-4 text-amber-500" />
				)}
			</button>

			{isOpen && (
				<div className="p-3 bg-amber-50/50 space-y-2">
					{sourceImg && (
						<img
							src={sourceImg}
							alt="source"
							className="w-full object-cover rounded-md"
						/>
					)}
					{sourceName && (
						<div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
							<MathContent html={sourceName} />
						</div>
					)}
				</div>
			)}
		</div>
	);
}
