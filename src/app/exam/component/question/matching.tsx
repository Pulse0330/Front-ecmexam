"use client";

import parse from "html-react-parser";
import { HelpCircle, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import QuestionImage from "@/app/exam/component/question/questionImage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// VisuallyHidden component for accessibility
const _VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
	<span
		style={{
			position: "absolute",
			border: 0,
			width: 1,
			height: 1,
			padding: 0,
			margin: -1,
			overflow: "hidden",
			clip: "rect(0, 0, 0, 0)",
			whiteSpace: "nowrap",
			wordWrap: "normal",
		}}
	>
		{children}
	</span>
);

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
	userAnswers?: Record<number, number[]>;
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
	const [showHelp, setShowHelp] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const updateXarrow = useXarrow();
	const lastNotifiedRef = useRef<string>("");
	const onMatchChangeRef = useRef(onMatchChange);

	const colorPalette = useRef<string[]>([
		"#3b82f6",
		"#8b5cf6",
		"#ec4899",
		"#f59e0b",
		"#eab308",
		"#6366f1",
		"#a855f7",
		"#f97316",
		"#fbbf24",
		"#fb923c",
		"#c026d3",
		"#e11d48",
		"#7c3aed",
		"#4f46e5",
		"#2563eb",
		"#0284c7",
		"#facc15",
		"#fde047",
		"#fb7185",
		"#f472b6",
		"#d946ef",
		"#a78bfa",
		"#818cf8",
		"#60a5fa",
		"#fcd34d",
		"#fdba74",
		"#fed7aa",
		"#fde68a",
		"#93c5fd",
		"#c4b5fd",
		"#ddd6fe",
		"#fbcfe8",
		"#fecaca",
		"#fed7e2",
		"#fef3c7",
		"#1d4ed8",
		"#7e22ce",
		"#be185d",
		"#ca8a04",
		"#ea580c",
		"#9333ea",
		"#db2777",
		"#0369a1",
		"#4338ca",
		"#f59e42",
		"#fbbf80",
		"#a21caf",
		"#854d0e",
		"#b45309",
		"#92400e",
	]);

	const getUniqueColor = useCallback(
		(currentConnections: Connection[]): string => {
			const usedColors = new Set(currentConnections.map((c) => c.color));
			const available = colorPalette.current.filter((c) => !usedColors.has(c));

			if (available.length === 0) {
				return colorPalette.current[
					currentConnections.length % colorPalette.current.length
				];
			}

			return available[0];
		},
		[],
	);

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
		if (Object.keys(userAnswers).length === 0) return;

		const restored: Connection[] = [];

		Object.entries(userAnswers).forEach(([qRefIdStr, answerIds]) => {
			const qRefId = Number(qRefIdStr);

			const question = answers.find(
				(a) => a.refid === qRefId && a.ref_child_id === -1,
			);

			if (!question) return;

			answerIds.forEach((answerId) => {
				const answer = answers.find((a) => a.answer_id === answerId);

				if (answer) {
					restored.push({
						start: `q-${question.answer_id}`,
						end: `a-${answer.answer_id}`,
						color: getUniqueColor(restored),
					});
				}
			});
		});

		setConnections(restored);
	}, [userAnswers, answers, getUniqueColor]);

	const isSelected = (id: string) => id === activeStart;

	const isConnected = (id: string) =>
		connections.some((c) => c.start === id || c.end === id);

	const getConnectionColors = (id: string) =>
		connections
			.filter((c) => c.start === id || c.end === id)
			.map((c) => c.color);

	const handleItemClick = useCallback(
		(id: string, isQuestion: boolean) => {
			if (!isQuestion && !activeStart) {
				const existingConnections = connections.filter((c) => c.end === id);

				if (existingConnections.length > 0) {
					setConnections((prev) =>
						prev.filter((c) => !existingConnections.includes(c)),
					);
				}
				return;
			}

			if (activeStart && activeStart !== id) {
				const firstIsQuestion = activeStart.startsWith("q-");

				if (firstIsQuestion && isQuestion) {
					setActiveStart(id);
					return;
				}

				if (firstIsQuestion && !isQuestion) {
					const start = activeStart;
					const end = id;

					const existingConnection = connections.find(
						(c) => c.start === start && c.end === end,
					);

					if (existingConnection) {
						setConnections((prev) =>
							prev.filter((c) => c !== existingConnection),
						);
					} else {
						setConnections((prevConnections) => {
							const color = getUniqueColor(prevConnections);
							return [...prevConnections, { start, end, color }];
						});
					}

					setActiveStart("");
					return;
				}

				return;
			}

			if (isQuestion) {
				setActiveStart(id);
			}
		},
		[activeStart, connections, getUniqueColor],
	);

	const interactiveProps = (id: string) => ({
		role: "button",
		tabIndex: 0,
		onClick: () => handleItemClick(id, id.startsWith("q-")),
		onKeyDown: (e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleItemClick(id, id.startsWith("q-"));
			}
		},
	});

	const renderContent = (item: QuestionItem) => {
		return (
			<div className="w-full">
				{item.answer_img && (
					<div className="mb-2">
						<QuestionImage
							src={item.answer_img}
							alt={item.answer_name_html || "Answer image"}
						/>
					</div>
				)}
				{item.answer_name_html && (
					<div className="text-sm font-medium text-center">
						{parse(item.answer_name_html.trim())}
					</div>
				)}
				{!item.answer_name_html && !item.answer_img && (
					<div className="text-sm text-gray-400 text-center">
						Контент байхгүй
					</div>
				)}
			</div>
		);
	};

	const questionsOnly = answers.filter((a) => a.ref_child_id === -1);
	const answersOnly = answers.filter(
		(a) => a.ref_child_id && a.ref_child_id >= 1,
	);

	useEffect(() => {
		if (!onMatchChangeRef.current) return;

		const matches: Record<number, number[]> = {};

		connections.forEach((c) => {
			const startId = parseInt(c.start.replace("q-", ""), 10);
			const endId = parseInt(c.end.replace("a-", ""), 10);

			const question = answers.find((a) => a.answer_id === startId);
			const answer = answers.find((a) => a.answer_id === endId);

			if (question && answer) {
				if (!matches[question.refid]) {
					matches[question.refid] = [];
				}
				matches[question.refid].push(answer.answer_id);
			}
		});

		const str = JSON.stringify(matches);
		if (lastNotifiedRef.current !== str) {
			lastNotifiedRef.current = str;
			onMatchChangeRef.current(matches);
		}
		setTimeout(updateXarrow, 0);
	}, [connections, updateXarrow, answers]);

	return (
		<>
			<div ref={containerRef} className="w-full relative">
				<Xwrapper>
					<div className="flex items-center justify-center gap-2 mb-4">
						<p className="font-semibold text-center text-sm">
							{isMobile
								? "Асуулт → Хариулт → Асуулт дахин → Дараагийн хариулт"
								: "Асуулт сонгоод хариултаа дарна уу. Дараагийн хариулт холбохын тулд асуултаа дахин дарна уу."}
						</p>
						<button
							type="button"
							onClick={() => setShowHelp(true)}
							className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
							title="Заавар харах"
						>
							<HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</button>
					</div>

					{isMobile ? (
						<div className="space-y-4 max-h-[80vh] overflow-y-auto">
							{questionsOnly.map((q) => {
								const qid = `q-${q.answer_id}`;
								const connectedAnswers = connections.filter(
									(c) => c.start === qid,
								);
								const answerItems = connectedAnswers
									.map((c) =>
										answersOnly.find((a) => `a-${a.answer_id}` === c.end),
									)
									.filter(Boolean);

								return (
									<div key={qid} className="space-y-2">
										<div
											id={qid}
											{...interactiveProps(qid)}
											className={cn(
												"w-full p-3 rounded-lg flex flex-col items-center transition-colors cursor-pointer",
												isSelected(qid)
													? "border-2 border-blue-500"
													: isConnected(qid)
														? "border-2 border-green-500 bg-green-50"
														: "border border-gray-300",
											)}
										>
											{renderContent(q)}
											{connectedAnswers.length > 0 && (
												<div className="mt-2 text-xs text-gray-500">
													{connectedAnswers.length} хариулт холбогдсон
												</div>
											)}
										</div>

										{answerItems.length > 0 && (
											<div className="pl-4 space-y-2 border-l-2 border-green-500">
												<div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
													<span>Сонгосон хариултууд:</span>
													<span className="text-xs text-red-400">
														дарж устгана
													</span>
												</div>
												{answerItems.map(
													(answerItem) =>
														answerItem && (
															<div
																key={`mobile-answer-${answerItem.answer_id}`}
																{...interactiveProps(
																	`a-${answerItem.answer_id}`,
																)}
																className="p-2 rounded border border-green-500 bg-green-50 dark:bg-green-900/20 cursor-pointer hover:border-red-400 hover:bg-red-50 active:scale-95 transition-all"
															>
																<div className="flex items-center gap-2">
																	<div className="flex-1">
																		{renderContent(answerItem)}
																	</div>
																	<X className="w-4 h-4 text-red-500 shrink-0" />
																</div>
															</div>
														),
												)}
											</div>
										)}

										{isSelected(qid) && (
											<div className="pl-4 mt-2 space-y-2">
												<div className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
													<span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
													Холбох хариултаа сонгоно уу:
												</div>
												{answersOnly.map((a) => {
													const aid = `a-${a.answer_id}`;
													const alreadyConnected = connections.some(
														(c) => c.start === qid && c.end === aid,
													);
													return (
														<div
															key={aid}
															{...interactiveProps(aid)}
															className={cn(
																"w-full p-2 border rounded cursor-pointer transition-colors",
																alreadyConnected
																	? "border-green-500 bg-green-50 dark:bg-green-900/20"
																	: "border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
															)}
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
						<div className="grid grid-cols-2 gap-x-8 gap-y-3">
							<div className="border-b pb-2">
								<h3 className="font-semibold text-center">Асуулт</h3>
							</div>
							<div className="border-b pb-2">
								<h3 className="font-semibold text-center">Хариулт</h3>
							</div>

							<div className="space-y-3">
								{questionsOnly.map((q) => {
									const qid = `q-${q.answer_id}`;
									const colors = getConnectionColors(qid);
									const connectionCount = colors.length;

									return (
										<div
											key={qid}
											id={qid}
											{...interactiveProps(qid)}
											className={cn(
												"w-full p-4 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer relative",
												isSelected(qid)
													? "border-2 border-blue-500 shadow-lg"
													: isConnected(qid)
														? "border-2 border-green-500 hover:border-red-400"
														: "border border-gray-300 hover:border-blue-400",
											)}
											style={
												!isSelected(qid) && colors.length > 0
													? {
															borderWidth: "2px",
															background: `linear-gradient(135deg, ${colors
																.map(
																	(c, i) =>
																		`${c}20 ${(i / colors.length) * 100}%, ${c}20 ${((i + 1) / colors.length) * 100}%`,
																)
																.join(", ")})`,
														}
													: undefined
											}
										>
											{renderContent(q)}
											{connectionCount > 0 && (
												<div className="absolute top-2 right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
													{connectionCount}
												</div>
											)}
										</div>
									);
								})}
							</div>

							<div className="space-y-3">
								{answersOnly.map((a) => {
									const aid = `a-${a.answer_id}`;
									const colors = getConnectionColors(aid);
									const isConnectedAnswer = isConnected(aid);
									const isClickable = !!activeStart || isConnectedAnswer;

									return (
										<div
											key={aid}
											id={aid}
											{...interactiveProps(aid)}
											className={cn(
												"w-full p-4 rounded-lg flex flex-col items-center justify-center transition-all relative",
												isClickable
													? "cursor-pointer"
													: "cursor-not-allowed opacity-60",
												isSelected(aid)
													? "border-2 border-blue-500 shadow-md"
													: isConnectedAnswer
														? "border-2 border-green-500 bg-green-50 hover:border-red-400 hover:bg-red-50"
														: activeStart
															? "border border-gray-300 hover:border-blue-400"
															: "border border-gray-300",
											)}
											style={
												!isSelected(aid) && colors.length > 0
													? {
															borderWidth: "2px",
															background: `linear-gradient(135deg, ${colors
																.map(
																	(c, i) =>
																		`${c}20 ${(i / colors.length) * 100}%, ${c}20 ${((i + 1) / colors.length) * 100}%`,
																)
																.join(", ")})`,
														}
													: undefined
											}
											title={isConnectedAnswer ? "Дарж устгана уу" : ""}
										>
											{renderContent(a)}
											{isConnectedAnswer && (
												<div className="absolute top-1 right-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
													×
												</div>
											)}
										</div>
									);
								})}
							</div>

							{connections.map((c, idx) => (
								<Xarrow
									key={`${c.start}-${c.end}-${idx}`}
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

			{/* Help Dialog */}
			<Dialog open={showHelp} onOpenChange={setShowHelp}>
				<DialogContent className="max-w-md">
					<DialogTitle className="flex items-center gap-2">
						<HelpCircle className="w-6 h-6 text-blue-600" />
						<span className="text-xl font-bold">Хэрхэн ашиглах вэ?</span>
					</DialogTitle>

					<div className="space-y-4">
						<div className="space-y-3 text-sm">
							<div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
								<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
									✅ Холбох
								</h3>
								<ol className="space-y-1 text-gray-700 dark:text-gray-300 list-decimal list-inside">
									<li>
										<strong>Асуулт</strong> баганаас асуултаа сонгоно (цэнхэр
										хүрээтэй болно)
									</li>
									<li>
										<strong>Хариулт</strong> баганаас хариултаа дарна
									</li>
									<li>Холболт үүсэх ба сонголт цуцлагдана</li>
									<li>
										Дараагийн хариулт холбохын тулд{" "}
										<strong>асуултаа дахин</strong> дарна
									</li>
								</ol>
							</div>

							<div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
								<h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
									❌ Устгах
								</h3>
								<ul className="space-y-1 text-gray-700 dark:text-gray-300 list-disc list-inside">
									<li>
										Холбогдсон <strong>хариулт</strong> дээр дарах → холболт
										устана
									</li>
									<li>
										Асуулт сонгоод ижил хариултаа дахин дарах → холболт устана
									</li>
								</ul>
							</div>

							<div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
								<h3 className="font-semibold mb-2">💡 Дохио өнгөнүүд</h3>
								<ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
									<li>🔵 Цэнхэр = Идэвхтэй сонголт</li>
									<li>🟢 Ногоон = Холбогдсон</li>
									<li>🔴 Улаан = Устгах боломжтой</li>
								</ul>
							</div>
						</div>

						<Button
							onClick={() => setShowHelp(false)}
							className="w-full"
							variant="default"
						>
							Ойлголоо
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
