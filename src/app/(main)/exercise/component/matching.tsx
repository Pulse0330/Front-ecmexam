"use client";

import parse from "html-react-parser";
import { CheckCircle2, XCircle } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { cn } from "@/lib/utils";

interface QuestionItem {
	refid: number;
	answer_id: number;
	question_id: number | null;
	answer_name_html: string;
	answer_descr: string;
	answer_img: string | null;
	ref_child_id: number | null;
	is_true?: boolean;
}

interface MatchingByLineProps {
	answers: QuestionItem[];
	onMatchChange?: (matches: Record<number, number>) => void;
	readonly?: boolean;
	mode?: "exam" | "review";
	userAnswers?: Record<number, number>;
	initialMatches?: Record<number, number>;
}

interface Connection {
	start: string;
	end: string;
	color: string;
	isCorrect?: boolean;
}

export default function MatchingByLine({
	answers = [],
	onMatchChange,
	mode = "exam",
	userAnswers = {},
}: MatchingByLineProps) {
	const [connections, setConnections] = useState<Connection[]>([]);
	const [activeStart, setActiveStart] = useState<string>("");
	const [isMobile, setIsMobile] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const updateXarrow = useXarrow();
	const lastNotifiedRef = useRef<string>("");
	const onMatchChangeRef = useRef(onMatchChange);

	// 🎯 Correct answer mapping (ref_child_id ашиглан)
	const correctAnswers = useMemo(() => {
		const mapping: Record<number, number> = {};
		answers.forEach((item) => {
			if (item.ref_child_id !== null && item.ref_child_id !== -1) {
				// ref_child_id нь зөв хариултын refid
				const correctAnswer = answers.find(
					(a) => a.refid === item.ref_child_id,
				);
				if (correctAnswer) {
					mapping[item.answer_id] = correctAnswer.answer_id;
				}
			}
		});
		return mapping;
	}, [answers]);

	// 🎯 UserAnswers-аас connections үүсгэх
	useEffect(() => {
		if (Object.keys(userAnswers).length > 0) {
			const restored: Connection[] = [];
			Object.entries(userAnswers).forEach(([qId, aId]) => {
				const qIdNum = Number(qId);
				const aIdNum = Number(aId);
				const isCorrect = correctAnswers[qIdNum] === aIdNum;

				// Review mode дээр зөв/буруу өнгөөр харуулах
				const color =
					mode === "review"
						? isCorrect
							? "#22c55e"
							: "#ef4444" // green : red
						: "#3b82f6"; // blue for exam mode

				restored.push({
					start: `q-${qId}`,
					end: `a-${aId}`,
					color,
					isCorrect,
				});
			});
			setConnections(restored);
		}
	}, [userAnswers, mode, correctAnswers]);

	const colorPalette = useRef<string[]>([
		"#ef4444",
		"#3b82f6",
		"#22c55e",
		"#f59e0b",
		"#8b5cf6",
		"#ec4899",
		"#06b6d4",
	]);
	const usedColors = useRef<Set<string>>(new Set());

	const getUniqueColor = (): string => {
		const available = colorPalette.current.filter(
			(c) => !usedColors.current.has(c),
		);
		if (!available.length) {
			usedColors.current.clear();
			return getUniqueColor();
		}
		const color = available[Math.floor(Math.random() * available.length)];
		usedColors.current.add(color);
		return color;
	};

	useEffect(() => {
		onMatchChangeRef.current = onMatchChange;
	}, [onMatchChange]);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		const container = containerRef.current?.parentElement;
		if (container) {
			const handleScroll = () => updateXarrow();
			container.addEventListener("scroll", handleScroll);
			return () => container.removeEventListener("scroll", handleScroll);
		}
		window.addEventListener("resize", updateXarrow);
		return () => window.removeEventListener("resize", updateXarrow);
	}, [updateXarrow]);

	// 🎯 Connections update callback
	useEffect(() => {
		if (!onMatchChangeRef.current) return;
		const matches: Record<number, number> = {};
		connections.forEach((conn) => {
			const startId = parseInt(conn.start.replace("q-", ""), 10);
			const endId = parseInt(conn.end.replace("a-", ""), 10);
			if (!Number.isNaN(startId) && !Number.isNaN(endId))
				matches[startId] = endId;
		});
		const str = JSON.stringify(matches);
		if (lastNotifiedRef.current !== str) {
			lastNotifiedRef.current = str;
			onMatchChangeRef.current(matches);
		}
		setTimeout(updateXarrow, 0);
	}, [connections, updateXarrow]);

	const isSelected = (id: string) => id === activeStart;
	const isConnected = (id: string) =>
		connections.some((c) => c.start === id || c.end === id);
	const getConnectionColor = (id: string) =>
		connections.find((c) => c.start === id || c.end === id)?.color;

	const getConnectionStatus = (id: string) =>
		connections.find((c) => c.start === id || c.end === id);

	const handleItemClick = (id: string, isQuestion: boolean) => {
		if (mode === "review") return;

		const existing = connections.find((c) => c.start === id || c.end === id);
		if (existing) {
			usedColors.current.delete(existing.color);
			setConnections(connections.filter((c) => c !== existing));
			setActiveStart("");
			return;
		}
		if (isQuestion) setActiveStart(id);
		else if (activeStart) {
			const color = getUniqueColor();
			setConnections((prev) => [
				...prev.filter((c) => c.start !== activeStart),
				{ start: activeStart, end: id, color },
			]);
			setActiveStart("");
		}
	};

	const renderContent = (item: QuestionItem) => (
		<div className="text-sm font-medium w-full text-center">
			{parse(item.answer_name_html)}
		</div>
	);

	const questionsOnly = answers.filter(
		(a) => a.ref_child_id !== -1 && a.ref_child_id !== null,
	);
	const answersOnly = answers.filter((a) => a.ref_child_id === -1);

	const interactiveProps = (id: string, isQuestion: boolean) => ({
		role: "button",
		tabIndex: mode === "review" ? -1 : 0,
		onClick: () => handleItemClick(id, isQuestion),
		onKeyDown: (e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") handleItemClick(id, isQuestion);
		},
	});

	// Review mode үр дүн тооцоолох
	const reviewStats = useMemo(() => {
		if (mode !== "review") return null;

		let correct = 0;
		let wrong = 0;

		connections.forEach((conn) => {
			if (conn.isCorrect) correct++;
			else wrong++;
		});

		return { correct, wrong, total: connections.length };
	}, [connections, mode]);

	return (
		<div ref={containerRef} className="w-full relative space-y-4">
			{/* Review Stats */}
			{mode === "review" && reviewStats && (
				<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm sm:text-base">
							Хослуулалтын үр дүн
						</h4>
						<div className="flex items-center gap-3 text-sm">
							<span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
								<CheckCircle2 className="w-4 h-4" />
								{reviewStats.correct}
							</span>
							<span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
								<XCircle className="w-4 h-4" />
								{reviewStats.wrong}
							</span>
						</div>
					</div>
					<p className="text-xs text-blue-800 dark:text-blue-300">
						{reviewStats.total > 0
							? `Нийт ${reviewStats.total} холболтоос ${reviewStats.correct} зөв`
							: "Холболт хийгдээгүй"}
					</p>
				</div>
			)}

			<Xwrapper>
				<p className="font-semibold mb-4 text-center text-sm sm:text-base">
					{mode === "review"
						? "Таны хариултууд (Ногоон = зөв, Улаан = буруу)"
						: isMobile
							? "Асуулт дээр дарж дараа нь хариулт сонгоно уу"
							: "Зөв хариултыг холбоно уу"}
				</p>

				<div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3">
					<h3 className="border-b pb-2 font-semibold text-center text-sm sm:text-base">
						Асуулт
					</h3>
					<h3 className="border-b pb-2 font-semibold text-center text-sm sm:text-base">
						Хариулт
					</h3>

					{questionsOnly.map((q, index) => {
						const qid = `q-${q.answer_id}`;
						const a = answersOnly[index];
						const aid = a ? `a-${a.answer_id}` : null;
						const connStatus = getConnectionStatus(qid);

						return (
							<React.Fragment key={q.refid}>
								<div
									id={qid}
									{...interactiveProps(qid, true)}
									className={cn(
										"w-full p-3 sm:p-4 border-2 rounded-lg flex items-center justify-center text-center transition-all relative",
										mode === "exam"
											? "cursor-pointer hover:shadow-md"
											: "cursor-default",
										mode === "exam" && isSelected(qid)
											? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
											: mode === "exam" && isConnected(qid)
												? "border-green-500 bg-green-50 dark:bg-green-950/20"
												: mode === "review" && connStatus
													? connStatus.isCorrect
														? "border-green-500 bg-green-50 dark:bg-green-950/20"
														: "border-red-500 bg-red-50 dark:bg-red-950/20"
													: "border-gray-300 dark:border-gray-700",
									)}
									style={{
										borderColor:
											mode === "exam" ? getConnectionColor(qid) : undefined,
										backgroundColor:
											mode === "exam" && getConnectionColor(qid)
												? `${getConnectionColor(qid)}20`
												: undefined,
									}}
								>
									{mode === "review" && connStatus && (
										<div className="absolute top-2 right-2">
											{connStatus.isCorrect ? (
												<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
											) : (
												<XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
											)}
										</div>
									)}
									{renderContent(q)}
								</div>

								{aid && a && (
									<div
										id={aid}
										{...interactiveProps(aid, false)}
										className={cn(
											"w-full p-3 sm:p-4 border-2 rounded-lg flex items-center justify-center text-center transition-all",
											mode === "exam"
												? "cursor-pointer hover:shadow-md"
												: "cursor-default",
											mode === "exam" && isSelected(aid)
												? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
												: mode === "exam" && isConnected(aid)
													? "border-green-500 bg-green-50 dark:bg-green-950/20"
													: "border-gray-300 dark:border-gray-700",
										)}
										style={{
											borderColor:
												mode === "exam" ? getConnectionColor(aid) : undefined,
											backgroundColor:
												mode === "exam" && getConnectionColor(aid)
													? `${getConnectionColor(aid)}20`
													: undefined,
										}}
									>
										{renderContent(a)}
									</div>
								)}
							</React.Fragment>
						);
					})}
				</div>

				{/* Xarrow */}
				{!isMobile &&
					connections.map((c) => (
						<Xarrow
							key={`${c.start}-${c.end}`}
							start={c.start}
							end={c.end}
							color={c.color}
							strokeWidth={mode === "review" ? 4 : 3}
							curveness={0.3}
							showHead={false}
						/>
					))}
			</Xwrapper>

			{/* Legend for review mode */}
			{mode === "review" && (
				<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2 text-sm">
					<div className="flex items-center gap-2 text-green-700 dark:text-green-400">
						<div className="w-4 h-0.5 bg-green-500" />
						<span>Зөв холболт</span>
					</div>
					<div className="flex items-center gap-2 text-red-700 dark:text-red-400">
						<div className="w-4 h-0.5 bg-red-500" />
						<span>Буруу холболт</span>
					</div>
				</div>
			)}
		</div>
	);
}
