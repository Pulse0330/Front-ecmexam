"use client";

import parse from "html-react-parser";
import {
	CheckCircle2,
	Lightbulb,
	Maximize2,
	RotateCcw,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
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
	onMatchChange?: (matches: Record<number, number[]>) => void;
	readonly?: boolean;
	userAnswers?: Record<number, number | number[]>;
}

interface Connection {
	start: string;
	end: string;
	color: string;
}

export default function MatchingByLine({
	answers = [],
	onMatchChange,
	userAnswers = {},
}: MatchingByLineProps) {
	const [connections, setConnections] = useState<Connection[]>([]);
	const [activeStart, setActiveStart] = useState<string>("");
	const [isMobile, setIsMobile] = useState(false);
	const [zoomedImage, setZoomedImage] = useState<string | null>(null);
	const [showResults, setShowResults] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const updateXarrow = useXarrow();
	const lastNotifiedRef = useRef<string>("");
	// Bug 2 fix: track when we're restoring to prevent notify → restore → notify loop
	const isRestoringRef = useRef(false);
	const onMatchChangeRef = useRef(onMatchChange);

	const colorPalette = useRef<string[]>([
		"#6366f1",
		"#8b5cf6",
		"#d946ef",
		"#ec4899",
		"#06b6d4",
		"#3b82f6",
		"#64748b",
		"#a855f7",
	]);

	const getUniqueColor = useCallback(
		(currentConnections: Connection[]): string => {
			const usedColors = new Set(currentConnections.map((c) => c.color));
			const available = colorPalette.current.filter((c) => !usedColors.has(c));
			if (available.length === 0) {
				return colorPalette.current[
					Math.floor(Math.random() * colorPalette.current.length)
				];
			}
			return available[Math.floor(Math.random() * available.length)];
		},
		[],
	);

	const handleImageClick = useCallback(
		(e: React.MouseEvent, imageUrl: string) => {
			e.stopPropagation();
			setZoomedImage(imageUrl);
		},
		[],
	);

	useEffect(() => {
		onMatchChangeRef.current = onMatchChange;
	}, [onMatchChange]);

	// Notify parent when connections change — skip during restore to prevent infinite loop
	useEffect(() => {
		if (isRestoringRef.current) return;
		if (!onMatchChangeRef.current) return;

		const matches: Record<number, number[]> = {};
		for (const c of connections) {
			const qId = parseInt(c.start.replace("q-", ""), 10);
			const aId = parseInt(c.end.replace("a-", ""), 10);
			if (!matches[qId]) matches[qId] = [];
			matches[qId].push(aId);
		}

		const key = JSON.stringify(matches);
		if (lastNotifiedRef.current === key) return;
		lastNotifiedRef.current = key;
		onMatchChangeRef.current(matches);
	}, [connections]);

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

	// Bug 1 fix: userAnswers keys are answer_id (not refid) — match accordingly
	useEffect(() => {
		if (Object.keys(userAnswers).length === 0) return;

		const restored: Connection[] = [];
		Object.entries(userAnswers).forEach(([qAnswerIdStr, answerIdOrIds]) => {
			const qAnswerId = Number(qAnswerIdStr);

			// FIX: was `a.refid === qRefId` — keys from parent are answer_id, not refid
			const question = answers.find(
				(a) =>
					a.answer_id === qAnswerId &&
					a.ref_child_id !== null &&
					a.ref_child_id >= 1,
			);
			if (!question) return;

			const answerIds = Array.isArray(answerIdOrIds)
				? answerIdOrIds
				: [answerIdOrIds];

			for (const answerId of answerIds) {
				const answer = answers.find((a) => a.answer_id === answerId);
				if (answer) {
					restored.push({
						start: `q-${question.answer_id}`,
						end: `a-${answer.answer_id}`,
						color: getUniqueColor(restored),
					});
				}
			}
		});

		// FIX: set flag before updating connections so the notify effect is skipped
		isRestoringRef.current = true;
		setConnections(restored);
		// Reset flag after the state update is flushed (next microtask)
		Promise.resolve().then(() => {
			isRestoringRef.current = false;
		});
	}, [userAnswers, answers, getUniqueColor]);

	const handleItemClick = useCallback(
		(id: string, isQuestion: boolean) => {
			if (showResults) return;

			if (isQuestion) {
				setActiveStart((prev) => (prev === id ? "" : id));
				return;
			}

			if (!activeStart) return;

			setConnections((prev) => {
				// Хэрэв яг энэ холболт аль хэдийн байвал устгана (Toggle)
				const alreadyConnected = prev.find(
					(c) => c.start === activeStart && c.end === id,
				);

				if (alreadyConnected) {
					return prev.filter((c) => !(c.start === activeStart && c.end === id));
				}

				// Өмнө нь id-аар шүүж (filter) байсныг болиулснаар
				// нэг хариулт олон асуулттай холбогдох боломжтой болно.
				const color = getUniqueColor(prev);
				return [...prev, { start: activeStart, end: id, color }];
			});
		},
		[getUniqueColor, showResults, activeStart],
	);

	const _getAnswerColor = (id: string): string | undefined =>
		connections.find((c) => c.end === id)?.color;

	const _isAnswerConnected = (id: string) =>
		connections.some((c) => c.end === id);

	const getConnectionCorrectness = (connection: Connection) => {
		const startId = parseInt(connection.start.replace("q-", ""), 10);
		const endId = parseInt(connection.end.replace("a-", ""), 10);
		const question = answers.find((a) => a.answer_id === startId);
		const answer = answers.find((a) => a.answer_id === endId);
		return question?.ref_child_id === answer?.refid;
	};

	const handleCheckAnswers = () => setShowResults(true);

	// Bug 3 fix: clear lastNotifiedRef on reset so re-connections trigger notify again
	const handleReset = () => {
		setShowResults(false);
		setConnections([]);
		setActiveStart("");
		lastNotifiedRef.current = "";
	};

	const renderContent = (item: QuestionItem) => (
		<div className="w-full flex flex-col gap-2">
			{item.answer_img && (
				<div className="relative group/img w-full aspect-video sm:aspect-square max-h-40 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-700">
					<Image
						src={item.answer_img}
						alt="Content"
						fill
						className="object-contain p-2 transition-transform group-hover/img:scale-105"
					/>
					<div
						onPointerDown={(e) => {
							e.stopPropagation();
							handleImageClick(
								e as unknown as React.MouseEvent,
								item.answer_img as string,
							);
						}}
						className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer hover:bg-white dark:hover:bg-slate-900 pointer-events-auto"
					>
						<Maximize2 className="w-4 h-4 text-slate-600" />
					</div>
				</div>
			)}
			{item.answer_name_html && (
				<div className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 wrap-break-words">
					{parse(item.answer_name_html.trim())}
				</div>
			)}
		</div>
	);

	const questionsOnly = answers.filter(
		(a) => a.ref_child_id !== null && a.ref_child_id >= 1,
	);
	const answersOnly = answers.filter((a) => a.ref_child_id === -1);

	return (
		<div
			className="w-full max-w-5xl mx-auto p-4 select-none"
			ref={containerRef}
		>
			<Xwrapper>
				{/* Header Section */}
				<div className="text-center mb-8 space-y-3">
					<h2 className="text-xl font-bold text-slate-900 dark:text-white">
						{isMobile
							? "Тохирохыг сонгоно уу"
							: "Асуулт ба хариултыг холбоно уу"}
					</h2>
					{!showResults && (
						<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
							<Lightbulb className="w-4 h-4" />
							Картууд дээр дарж холболт хийнэ
						</div>
					)}
				</div>

				{/* Status Bar */}
				<div className="flex justify-center gap-4 mb-10">
					{!showResults ? (
						<Button
							onClick={handleCheckAnswers}
							disabled={connections.length === 0}
							className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 shadow-md transition-all active:scale-95"
						>
							<CheckCircle2 className="w-5 h-5 mr-2" />
							Шалгах ({connections.length}/{questionsOnly.length})
						</Button>
					) : (
						<div className="flex items-center gap-4 animate-in fade-in zoom-in">
							<Button
								onClick={handleReset}
								variant="outline"
								className="rounded-full px-6 h-11 border-2"
							>
								<RotateCcw className="w-4 h-4 mr-2" />
								Дахин эхлэх
							</Button>
							<div className="flex gap-4 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full border">
								<span className="text-green-600 font-bold flex items-center gap-1.5">
									<div className="w-2 h-2 rounded-full bg-green-500" />
									{
										connections.filter((c) => getConnectionCorrectness(c))
											.length
									}{" "}
									зөв
								</span>
								<span className="text-red-500 font-bold flex items-center gap-1.5">
									<div className="w-2 h-2 rounded-full bg-red-500" />
									{
										connections.filter((c) => !getConnectionCorrectness(c))
											.length
									}{" "}
									буруу
								</span>
							</div>
						</div>
					)}
				</div>

				{/* Main Content */}
				<div
					className={cn(
						"grid gap-6 relative",
						isMobile ? "grid-cols-1" : "grid-cols-2 gap-x-32",
					)}
				>
					{/* Questions Column */}
					<div className="grid gap-4" style={{ gridAutoRows: "1fr" }}>
						{!isMobile && (
							<h3 className="text-center font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">
								Асуултууд
							</h3>
						)}
						{questionsOnly.map((q) => {
							const id = `q-${q.answer_id}`;
							const isActive = activeStart === id;
							const qConnections = connections.filter((c) => c.start === id);
							const count = qConnections.length;
							const dotColor = qConnections[0]?.color;

							return (
								<button
									key={id}
									id={id}
									type="button"
									onClick={() => handleItemClick(id, true)}
									className={cn(
										"w-full p-5 rounded-2xl border-2 text-left transition-all relative bg-white dark:bg-slate-900 shadow-sm hover:shadow-md",
										isActive
											? "border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/30"
											: "border-slate-100 dark:border-slate-800",
									)}
									style={
										!showResults && !isActive && dotColor
											? { borderColor: dotColor }
											: {}
									}
								>
									<div className="flex items-center gap-4">
										<div className="flex-1">{renderContent(q)}</div>
										{!isMobile && (
											<div
												className={cn(
													"min-w-[1rem] h-4 rounded-full border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-[10px] font-bold text-white transition-all",
													count > 0 ? "px-1" : "w-4 bg-slate-200",
												)}
												style={
													count > 0
														? {
																backgroundColor: dotColor,
																borderColor: dotColor,
															}
														: {}
												}
											>
												{count > 1 ? count : ""}
											</div>
										)}
									</div>
								</button>
							);
						})}
					</div>

					{/* Answers Column */}
					<div className="space-y-4">
						{!isMobile && (
							<h3 className="text-center font-bold text-slate-400 text-xs uppercase tracking-widest mb-2">
								Хариултууд
							</h3>
						)}
						{answersOnly.map((a) => {
							const id = `a-${a.answer_id}`;
							// Энэ хариултанд холбогдсон бүх холболтууд
							const aConnections = connections.filter((c) => c.end === id);
							const count = aConnections.length;
							const connected = count > 0;
							// Хамгийн сүүлд холбосон асуултын өнгийг хүрээний өнгө болгож ашиглах
							const lastColor = aConnections[count - 1]?.color;

							return (
								<button
									key={id}
									id={id}
									type="button"
									onClick={() => handleItemClick(id, false)}
									className={cn(
										"w-full p-5 rounded-2xl border-2 text-left transition-all bg-white dark:bg-slate-900 shadow-sm hover:shadow-md",
										activeStart && !connected
											? "border-dashed border-indigo-300 animate-pulse"
											: "border-slate-100 dark:border-slate-800",
									)}
									style={
										!showResults && lastColor ? { borderColor: lastColor } : {}
									}
								>
									<div className="flex items-center gap-4">
										{!isMobile && (
											<div
												className={cn(
													"min-w-[1rem] h-4 rounded-full border-2 border-white shadow-sm shrink-0 flex items-center justify-center text-[10px] font-bold text-white transition-all",
													count > 0 ? "px-1" : "w-4 bg-slate-200",
												)}
												style={
													count > 0
														? {
																backgroundColor: lastColor,
																borderColor: lastColor,
															}
														: {}
												}
											>
												{/* Хэрэв нэг хариулт олон асуулттай холбогдвол тоог нь харуулна */}
												{count > 1 ? count : ""}
											</div>
										)}
										<div className="flex-1">{renderContent(a)}</div>
									</div>
								</button>
							);
						})}
					</div>

					{/* Desktop Arrows */}
					{!isMobile &&
						connections.map((c) => (
							<Xarrow
								key={`${c.start}-${c.end}`}
								start={c.start}
								end={c.end}
								color={
									showResults
										? getConnectionCorrectness(c)
											? "#10b981"
											: "#ef4444"
										: c.color
								}
								strokeWidth={3}
								curveness={0.3}
								showHead={false}
								startAnchor="right"
								endAnchor="left"
							/>
						))}
				</div>
			</Xwrapper>

			{/* Zoom Dialog */}
			<Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
				<DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
					<DialogTitle className="sr-only">Зураг</DialogTitle>
					<DialogClose className="fixed top-4 right-4 z-50 bg-white rounded-full p-2">
						<XCircle className="w-6 h-6" />
					</DialogClose>
					{zoomedImage && (
						<div className="relative w-full aspect-video">
							<Image
								src={zoomedImage}
								alt="Zoomed"
								fill
								className="object-contain"
							/>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
