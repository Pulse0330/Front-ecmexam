"use client";

import parse from "html-react-parser";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
	const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const updateXarrow = useXarrow();
	const lastNotifiedRef = useRef<string>("");
	const onMatchChangeRef = useRef(onMatchChange);

	// 🎯 Correct answer mapping (ref_child_id ашиглан)
	const correctAnswers = useMemo(() => {
		const mapping: Record<number, number> = {};
		answers.forEach((item) => {
			if (item.ref_child_id !== null && item.ref_child_id !== -1) {
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

				// Review mode-д эхлээд бүх холболтыг ногоон өнгөөр харуулна
				// Зөв хариулт харуулах товч дарсны дараа л зөв/буруу өнгүүдийг харуулна
				const color =
					mode === "review"
						? showCorrectAnswers
							? isCorrect
								? "#22c55e"
								: "#ef4444"
							: "#3b82f6"
						: "#3b82f6";

				restored.push({
					start: `q-${qId}`,
					end: `a-${aId}`,
					color,
					isCorrect,
				});
			});
			setConnections(restored);
		}
	}, [userAnswers, mode, correctAnswers, showCorrectAnswers]);

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

	const correctAnswersDisplay = useMemo(() => {
		const display: Array<{
			questionText: string;
			answerText: string;
			questionId: number;
			answerId: number;
		}> = [];

		questionsOnly.forEach((q) => {
			const correctAnswerId = correctAnswers[q.answer_id];
			if (correctAnswerId) {
				const correctAnswer = answersOnly.find(
					(a) => a.answer_id === correctAnswerId,
				);
				if (correctAnswer) {
					display.push({
						questionText: q.answer_name_html,
						answerText: correctAnswer.answer_name_html,
						questionId: q.answer_id,
						answerId: correctAnswerId,
					});
				}
			}
		});

		return display;
	}, [questionsOnly, answersOnly, correctAnswers]);

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

			{/* 🆕 Зөв хариултууд харуулах товч */}
			{mode === "review" && correctAnswersDisplay.length > 0 && (
				<div className="flex justify-end">
					<button
						type="button"
						onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
						className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium border border-green-300 dark:border-green-700"
					>
						<Eye className="w-4 h-4" />
						{showCorrectAnswers
							? "Зөв хариултууд нуух"
							: "Зөв хариултууд харах"}
					</button>
				</div>
			)}

			{/* 🆕 Зөв хариултуудын жагсаалт */}
			{mode === "review" &&
				showCorrectAnswers &&
				correctAnswersDisplay.length > 0 && (
					<div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-500 dark:border-green-700 rounded-xl p-4 sm:p-6">
						<h4 className="font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2 text-base">
							<CheckCircle2 className="w-5 h-5" />
							Зөв хариултууд
						</h4>
						<div className="space-y-3">
							{correctAnswersDisplay.map((item, index) => (
								<div
									key={item.questionId}
									className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800"
								>
									<div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
										<div>
											<p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold uppercase">
												Асуулт {index + 1}
											</p>
											<div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded">
												{parse(item.questionText)}
											</div>
										</div>
										<div className="hidden sm:flex items-center justify-center text-green-600 dark:text-green-400">
											<svg
												className="w-6 h-6"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<title>a</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 7l5 5m0 0l-5 5m5-5H6"
												/>
											</svg>
										</div>
										<div>
											<p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-semibold uppercase flex items-center gap-1">
												<CheckCircle2 className="w-3 h-3 text-green-600" />
												Зөв хариулт
											</p>
											<div className="text-sm text-green-700 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-800">
												{parse(item.answerText)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

			<Xwrapper>
				<p className="font-semibold mb-4 text-center text-sm sm:text-base text-gray-700 dark:text-gray-300">
					{mode === "review"
						? "Таны хариултууд (Ногоон = зөв, Улаан = буруу)"
						: isMobile
							? "Асуулт дээр дарж дараа нь хариулт сонгоно уу"
							: "Зөв хариултыг холбоно уу"}
				</p>

				<div className="space-y-3">
					{/* Headers */}
					<div className="grid grid-cols-2 gap-x-4 sm:gap-x-8">
						<h3 className="border-b-2 border-gray-300 dark:border-gray-600 pb-2 font-bold text-center text-sm sm:text-base text-gray-800 dark:text-gray-200">
							Асуулт
						</h3>
						<h3 className="border-b-2 border-gray-300 dark:border-gray-600 pb-2 font-bold text-center text-sm sm:text-base text-gray-800 dark:text-gray-200">
							Хариулт
						</h3>
					</div>

					{/* Question-Answer pairs */}
					{questionsOnly.map((q, index) => {
						const qid = `q-${q.answer_id}`;
						const a = answersOnly[index];
						const aid = a ? `a-${a.answer_id}` : null;
						const connStatus = getConnectionStatus(qid);

						return (
							<div
								key={q.answer_id}
								className="grid grid-cols-2 gap-x-4 sm:gap-x-8"
							>
								{/* Question */}
								<div
									id={qid}
									{...interactiveProps(qid, true)}
									className={cn(
										"w-full p-3 sm:p-4 border-2 rounded-lg flex items-center justify-center text-center transition-all relative min-h-[60px]",
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

								{/* Answer */}
								{aid && a && (
									<div
										id={aid}
										{...interactiveProps(aid, false)}
										className={cn(
											"w-full p-3 sm:p-4 border-2 rounded-lg flex items-center justify-center text-center transition-all min-h-[60px]",
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
							</div>
						);
					})}
				</div>

				{/* Xarrow lines */}
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

			{/* Legend */}
			{mode === "review" && (
				<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 text-sm">
					<p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
						Тайлбар:
					</p>
					<div className="flex items-center gap-2 text-green-700 dark:text-green-400">
						<div className="w-4 h-1 bg-green-500 rounded" />
						<span>Зөв холболт</span>
					</div>
					<div className="flex items-center gap-2 text-red-700 dark:text-red-400">
						<div className="w-4 h-1 bg-red-500 rounded" />
						<span>Буруу холболт</span>
					</div>
				</div>
			)}
		</div>
	);
}
