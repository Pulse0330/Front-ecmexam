"use client";

import parse from "html-react-parser";
import React, { useEffect, useRef, useState } from "react";
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
}

interface Connection {
	start: string;
	end: string;
	color: string;
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

	// Restore userAnswers
	useEffect(() => {
		if (Object.keys(userAnswers).length === 0) return;

		const restored: Connection[] = [];

		Object.entries(userAnswers).forEach(([qRefId, aRefId]) => {
			const question = answers.find(
				(a) => a.refid === Number(qRefId) && a.answer_descr === "Асуулт",
			);
			const answer = answers.find(
				(a) => a.refid === Number(aRefId) && a.answer_descr === "Хариулт",
			);
			if (question && answer) {
				const color =
					mode === "review"
						? answer.is_true
							? "#22c55e"
							: "#ef4444"
						: "#3b82f6";
				restored.push({
					start: `q-${question.answer_id}`,
					end: `a-${answer.answer_id}`,
					color,
				});
			}
		});

		setConnections(restored);
	}, [userAnswers, answers, mode]);

	const isSelected = (id: string) => id === activeStart;
	const isConnected = (id: string) =>
		connections.some((c) => c.start === id || c.end === id);
	const getConnectionColor = (id: string) =>
		connections.find((c) => c.start === id || c.end === id)?.color;

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

	const interactiveProps = (id: string, isQuestion: boolean) => ({
		role: "button",
		tabIndex: mode === "review" ? -1 : 0,
		onClick: () => handleItemClick(id, isQuestion),
		onKeyDown: (e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") handleItemClick(id, isQuestion);
		},
	});

	const renderContent = (item: QuestionItem) => (
		<div className="text-sm font-medium w-full text-center">
			{parse(item.answer_name_html)}
		</div>
	);

	const questionsOnly = answers.filter((a) => a.answer_descr === "Асуулт");
	const answersOnly = answers.filter((a) => a.answer_descr === "Хариулт");

	// notify matches
	useEffect(() => {
		if (!onMatchChangeRef.current || mode === "review") return;

		const matches: Record<number, number> = {};

		connections.forEach((c) => {
			const startId = parseInt(c.start.replace("q-", ""), 10);
			const endId = parseInt(c.end.replace("a-", ""), 10);
			const question = answers.find((a) => a.answer_id === startId);
			const answer = answers.find((a) => a.answer_id === endId);
			if (question && answer) {
				matches[question.refid] = answer.refid;
			}
		});

		const str = JSON.stringify(matches);
		if (lastNotifiedRef.current !== str) {
			lastNotifiedRef.current = str;
			onMatchChangeRef.current(matches);
		}
		setTimeout(updateXarrow, 0);
	}, [connections, updateXarrow, mode, answers]);

	return (
		<div ref={containerRef} className="w-full relative">
			<Xwrapper>
				<p className="font-semibold mb-4 text-center">
					{mode === "review"
						? "Таны хариултууд (Ногоон = зөв, Улаан = буруу)"
						: isMobile
							? "Асуулт дээр дарж дараа нь хариулт сонгоно уу"
							: "Асуулт дээр дарж холбох хариултаа сонгоно уу"}
				</p>

				{isMobile ? (
					<div className="space-y-4 max-h-[80vh] overflow-y-auto">
						{questionsOnly.map((q) => {
							const qid = `q-${q.answer_id}`;
							const connected = connections.find((c) => c.start === qid);
							const answerItem = connected
								? answersOnly.find((a) => `a-${a.answer_id}` === connected.end)
								: null;

							return (
								<div key={qid} className="space-y-2">
									<div
										id={qid}
										{...interactiveProps(qid, true)}
										className={cn(
											"w-full p-3 border rounded-lg flex justify-between items-center text-center transition-colors",
											isSelected(qid)
												? "border-blue-500 "
												: isConnected(qid)
													? "border-green-500 bg-green-50"
													: "border-gray-300 bg-white dark:bg-slate-800",
											mode === "exam"
												? "cursor-pointer hover:border-green-400"
												: "cursor-default",
										)}
										style={{
											borderColor: getConnectionColor(qid),
											backgroundColor: getConnectionColor(qid)
												? `${getConnectionColor(qid)}20`
												: undefined,
										}}
									>
										{renderContent(q)}
									</div>

									{answerItem && (
										<div className="pl-4 mt-1 border-l-2 border-green-500">
											<div className="text-sm text-gray-500 dark:text-gray-400">
												Сонгосон хариулт:
											</div>
											<div className="p-2 rounded border border-green-500 bg-green-50 dark:bg-green-900/20">
												{renderContent(answerItem)}
											</div>
										</div>
									)}

									{isSelected(qid) && !answerItem && (
										<div className="pl-4 mt-2 space-y-2">
											{answersOnly
												.filter((a) => !isConnected(`a-${a.answer_id}`))
												.map((a) => {
													const aid = `a-${a.answer_id}`;
													return (
														<div
															key={aid}
															{...interactiveProps(aid, false)}
															className="w-full p-2 border border-dashed rounded cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors"
														>
															{renderContent(a)}
														</div>
													);
												})}
										</div>
									)}
								</div>
							);
						})}
					</div>
				) : (
					// Desktop grid
					<div className="grid grid-cols-2 gap-x-8 gap-y-3">
						<h3 className="border-b pb-2 font-semibold text-center">Асуулт</h3>
						<h3 className="border-b pb-2 font-semibold text-center">Хариулт</h3>

						{questionsOnly.map((q, i) => {
							const qid = `q-${q.answer_id}`;
							const a = answersOnly[i];
							const aid = a ? `a-${a.answer_id}` : null;
							return (
								<React.Fragment key={qid}>
									<div
										id={qid}
										{...interactiveProps(qid, true)}
										className={cn(
											"w-full p-4 border rounded-lg flex items-center justify-center text-center transition-all",
											mode === "exam"
												? "cursor-pointer hover:border-green-400"
												: "cursor-default",
											isSelected(qid)
												? "border-blue-500  shadow-md"
												: isConnected(qid)
													? "border-green-500 bg-green-50"
													: "border-gray-300",
										)}
										style={{
											borderColor: getConnectionColor(qid),
											backgroundColor: getConnectionColor(qid)
												? `${getConnectionColor(qid)}20`
												: undefined,
										}}
									>
										{renderContent(q)}
									</div>

									{aid && a && (
										<div
											id={aid}
											{...interactiveProps(aid, false)}
											className={cn(
												"w-full p-4 border rounded-lg flex items-center justify-center text-center transition-all",
												mode === "exam"
													? "cursor-pointer hover:border-blue-400"
													: "cursor-default",
												isSelected(aid)
													? "border-blue-500 bg-blue-50 shadow-md"
													: isConnected(aid)
														? "border-green-500 bg-green-50"
														: "border-gray-300",
											)}
											style={{
												borderColor: getConnectionColor(aid),
												backgroundColor: getConnectionColor(aid)
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

						{/* Xarrow for desktop */}
						{connections.map((c) => (
							<Xarrow
								key={`${c.start}-${c.end}`}
								start={c.start}
								end={c.end}
								color={c.color}
								strokeWidth={3}
								curveness={0.3}
								showHead={false}
							/>
						))}
					</div>
				)}
			</Xwrapper>
		</div>
	);
}
