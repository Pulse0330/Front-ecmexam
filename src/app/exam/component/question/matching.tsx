"use client";

import parse from "html-react-parser";
import { HelpCircle, Maximize2, X, XCircle } from "lucide-react";
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

// VisuallyHidden component for accessibility
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
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
	onMatchChange?: (matches: Record<number, number[]>) => void; // Өөрчлөгдсөн: number -> number[]
	readonly?: boolean;
	userAnswers?: Record<number, number[]>; // Өөрчлөгдсөн: number -> number[]
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
	const [showHelp, setShowHelp] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const updateXarrow = useXarrow();
	const lastNotifiedRef = useRef<string>("");
	const onMatchChangeRef = useRef(onMatchChange);

	const colorPalette = useRef<string[]>([
		"#3b82f6", // blue
		"#8b5cf6", // purple
		"#ec4899", // pink
		"#f59e0b", // orange
		"#eab308", // yellow
		"#6366f1", // indigo
		"#a855f7", // violet
		"#f97316", // deep orange
		"#fbbf24", // amber
		"#fb923c", // light orange
		"#c026d3", // fuchsia
		"#e11d48", // rose
		"#7c3aed", // deep purple
		"#4f46e5", // strong indigo
		"#2563eb", // medium blue
		"#0284c7", // sky
		"#facc15", // bright yellow
		"#fde047", // lime yellow
		"#fb7185", // light pink
		"#f472b6", // medium pink
		"#d946ef", // magenta
		"#a78bfa", // light purple
		"#818cf8", // light indigo
		"#60a5fa", // light blue
		"#fcd34d", // golden
		"#fdba74", // peach
		"#fed7aa", // light peach
		"#fde68a", // pale yellow
		"#93c5fd", // sky blue
		"#c4b5fd", // lavender
		"#ddd6fe", // pale lavender
		"#fbcfe8", // pale pink
		"#fecaca", // pale rose
		"#fed7e2", // blush
		"#fef3c7", // cream
		"#1d4ed8", // navy blue
		"#7e22ce", // deep violet
		"#be185d", // deep rose
		"#ca8a04", // dark yellow
		"#ea580c", // burnt orange
		"#9333ea", // royal purple
		"#db2777", // hot pink
		"#0369a1", // ocean blue
		"#4338ca", // deep indigo
		"#f59e42", // tangerine
		"#fbbf80", // apricot
		"#a21caf", // vivid fuchsia
		"#854d0e", // brown
		"#b45309", // copper
		"#92400e", // rust
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

			// Олон хариулттай холбогдох
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

	// Холболтын өнгүүдийг авах (олон байж болно)
	const getConnectionColors = (id: string) =>
		connections
			.filter((c) => c.start === id || c.end === id)
			.map((c) => c.color);

	const handleItemClick = useCallback(
		(id: string, isQuestion: boolean) => {
			// ========================================
			// ЗӨВХӨН АСУУЛТААС СОНГОЛТ ЭХЛЭНЭ
			// ========================================

			// Хэрэв хариулт дарсан бол юу ч хийхгүй (асуулт идэвхгүй үед)
			if (!isQuestion && !activeStart) {
				// ❌ ГЭХДЭЭ хариулт холбогдсон бол устгана
				const existingConnections = connections.filter((c) => c.end === id);

				if (existingConnections.length > 0) {
					// Холбогдсон хариулт дарвал устгах
					setConnections((prev) =>
						prev.filter((c) => !existingConnections.includes(c)),
					);
				}
				return;
			}

			// ========================================
			// АСУУЛТ → ХАРИУЛТ ХОЛБОЛТ
			// ========================================
			if (activeStart && activeStart !== id) {
				const firstIsQuestion = activeStart.startsWith("q-");

				// Хоёр асуулт дарсан бол өмнөхийг цуцлаад шинийг идэвхжүүлэх
				if (firstIsQuestion && isQuestion) {
					setActiveStart(id);
					return;
				}

				// Асуулт идэвхтэй байгаад хариулт дарсан бол холбох
				if (firstIsQuestion && !isQuestion) {
					const start = activeStart;
					const end = id;

					// Ижил холболт байгаа эсэхийг шалгах
					const existingConnection = connections.find(
						(c) => c.start === start && c.end === end,
					);

					if (existingConnection) {
						// УСТГАХ: Холболт байвал устгана
						setConnections((prev) =>
							prev.filter((c) => c !== existingConnection),
						);
					} else {
						// НЭМЭХ: Шинэ холболт үүсгэнэ
						setConnections((prevConnections) => {
							const color = getUniqueColor(prevConnections);
							return [...prevConnections, { start, end, color }];
						});
					}

					// ✅ ЧУХАЛ: Холболт үүсгэсний дараа сонголтыг цуцлах
					// Дараагийн хариултаа холбохын тулд асуултаа дахин дарах хэрэгтэй
					setActiveStart("");
					return;
				}

				return;
			}

			// ========================================
			// ШИНЭ СОНГОЛТ ЭХЛЭХ (зөвхөн асуулт)
			// ========================================
			if (isQuestion) {
				// Асуулт дарах
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
					<div className="mb-2 relative">
						<Button
							className="relative w-full h-32 group cursor-zoom-in block"
							onClick={(e) => handleImageClick(e, item.answer_img as string)}
						>
							<Image
								src={item.answer_img}
								alt={item.answer_name_html || "Answer image"}
								fill
								className="object-contain rounded-md"
							/>
							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
								<Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
							</div>
						</Button>
					</div>
				)}
				{item.answer_name_html && (
					<div className="text-sm font-medium text-center ">
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
													? "border-2 border-blue-500 "
													: isConnected(qid)
														? "border-2 border-green-500 bg-green-50"
														: "border border-gray-300 ",
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

			{/* Image Zoom Dialog */}
			<Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
				<DialogContent
					className="max-w-7xl w-[95vw] h-[95vh] p-0"
					showCloseButton={false}
				>
					<VisuallyHidden>
						<DialogTitle>Зургийг томруулж харах</DialogTitle>
					</VisuallyHidden>
					<DialogClose className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
						<XCircle className="h-6 w-6" />
						<span className="sr-only">Close</span>
					</DialogClose>
					{zoomedImage && (
						<div className="relative w-full h-full p-4">
							<Image
								src={zoomedImage}
								alt="Томруулсан зураг"
								fill
								className="object-contain"
							/>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
