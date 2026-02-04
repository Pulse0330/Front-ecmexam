"use client";

import parse from "html-react-parser";
import { Maximize2, XCircle } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
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
	userAnswers = {},
}: MatchingByLineProps) {
	const [connections, setConnections] = useState<Connection[]>([]);
	const [activeStart, setActiveStart] = useState<string>("");
	const [isMobile, setIsMobile] = useState(false);
	const [zoomedImage, setZoomedImage] = useState<string | null>(null);
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
			// Одоо ашиглагдаж байгаа бүх өнгийг авна
			const usedColors = new Set(currentConnections.map((c) => c.color));

			// Ашиглагдаагүй өнгүүдийг олно (эхний дарааллаар)
			const available = colorPalette.current.filter((c) => !usedColors.has(c));

			if (available.length === 0) {
				// Бүх өнгө ашиглагдсан бол палитрын дарааллын дагуу давтана
				return colorPalette.current[
					currentConnections.length % colorPalette.current.length
				];
			}

			// Санамсаргүй биш, эхний ашиглагдаагүй өнгийг авна
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

		Object.entries(userAnswers).forEach(([qRefIdStr, answerId]) => {
			const qRefId = Number(qRefIdStr);

			const question = answers.find(
				(a) => a.refid === qRefId && a.ref_child_id === -1,
			);

			const answer = answers.find((a) => a.answer_id === answerId);

			if (question && answer) {
				restored.push({
					start: `q-${question.answer_id}`,
					end: `a-${answer.answer_id}`,
					color: getUniqueColor(restored),
				});
			}
		});

		setConnections(restored);
	}, [userAnswers, answers, getUniqueColor]);

	const isSelected = (id: string) => id === activeStart;
	const isConnected = (id: string) =>
		connections.some((c) => c.start === id || c.end === id);
	const getConnectionColor = (id: string) =>
		connections.find((c) => c.start === id || c.end === id)?.color;

	const handleItemClick = useCallback(
		(id: string, _isQuestion: boolean) => {
			setConnections((prevConnections) => {
				const existing = prevConnections.find(
					(c) => c.start === id || c.end === id,
				);
				if (existing) {
					// Холболт устгах
					setActiveStart("");
					return prevConnections.filter((c) => c !== existing);
				}
				return prevConnections;
			});

			setActiveStart((currentStart) => {
				if (currentStart) {
					// Хоёр дахь элемент дарагдлаа - холболт үүсгэх
					const firstIsQuestion = currentStart.startsWith("q-");
					const secondIsQuestion = id.startsWith("q-");

					// Хоёулаа асуулт эсвэл хоёулаа хариулт бол холбохгүй
					if (firstIsQuestion === secondIsQuestion) {
						// Өөр элемент сонгох
						return id;
					}

					// Холболт үүсгэх - асуулт нь үргэлж start байна
					const start = firstIsQuestion ? currentStart : id;
					const end = firstIsQuestion ? id : currentStart;

					setConnections((prevConnections) => {
						const color = getUniqueColor(prevConnections);
						return [
							...prevConnections.filter(
								(c) => c.start !== start && c.end !== end,
							),
							{ start, end, color },
						];
					});
					return "";
				}
				// Эхний элемент сонгогдлоо
				return id;
			});
		},
		[getUniqueColor],
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

		const matches: Record<number, number> = {};

		connections.forEach((c) => {
			const startId = parseInt(c.start.replace("q-", ""), 10);
			const endId = parseInt(c.end.replace("a-", ""), 10);

			const question = answers.find((a) => a.answer_id === startId);
			const answer = answers.find((a) => a.answer_id === endId);

			if (question && answer) {
				matches[question.refid] = answer.answer_id;
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
					<p className="font-semibold mb-4 text-center">
						{isMobile
							? "Асуулт дээр дарж дараа нь хариулт сонгоно уу"
							: "Асуулт дээр дарж холбох хариултаа сонгоно уу"}
					</p>

					{isMobile ? (
						<div className="space-y-4 max-h-[80vh] overflow-y-auto">
							{questionsOnly.map((q) => {
								const qid = `q-${q.answer_id}`;
								const connected = connections.find((c) => c.start === qid);
								const answerItem = connected
									? answersOnly.find(
											(a) => `a-${a.answer_id}` === connected.end,
										)
									: null;

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
											style={
												isSelected(qid)
													? undefined
													: getConnectionColor(qid)
														? {
																borderWidth: "2px",
																borderColor: getConnectionColor(qid),
																backgroundColor: `${getConnectionColor(qid)}20`,
															}
														: undefined
											}
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
												<div className="text-sm text-gray-600 mb-1">
													Хариултаа сонгоно уу:
												</div>
												{answersOnly
													.filter((a) => !isConnected(`a-${a.answer_id}`))
													.map((a) => {
														const aid = `a-${a.answer_id}`;
														return (
															<div
																key={aid}
																{...interactiveProps(aid)}
																className="w-full p-2 border border-dashed rounded cursor-pointer  transition-colors border-blue-300"
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
									return (
										<div
											key={qid}
											id={qid}
											{...interactiveProps(qid)}
											className={cn(
												"w-full p-4 rounded-lg flex flex-col items-center justify-center transition-all  cursor-pointer",
												isSelected(qid)
													? "border-2 border-blue-500"
													: isConnected(qid)
														? "border-2 border-green-500"
														: "border border-gray-300",
											)}
											style={
												isSelected(qid)
													? undefined
													: getConnectionColor(qid)
														? {
																borderWidth: "2px",
																borderColor: getConnectionColor(qid),
																backgroundColor: `${getConnectionColor(qid)}20`,
															}
														: undefined
											}
										>
											{renderContent(q)}
										</div>
									);
								})}
							</div>

							<div className="space-y-3">
								{answersOnly.map((a) => {
									const aid = `a-${a.answer_id}`;
									return (
										<div
											key={aid}
											id={aid}
											{...interactiveProps(aid)}
											className={cn(
												"w-full p-4 rounded-lg flex flex-col items-center justify-center transition-all  cursor-pointer hover:border-2 hover:border-blue-500",
												isSelected(aid)
													? "border-2 border-blue-500  shadow-md"
													: isConnected(aid)
														? "border-2 border-green-500 bg-green-50"
														: "border border-gray-300",
											)}
											style={
												isSelected(aid)
													? undefined
													: getConnectionColor(aid)
														? {
																borderWidth: "2px",
																borderColor: getConnectionColor(aid),
																backgroundColor: `${getConnectionColor(aid)}20`,
															}
														: undefined
											}
										>
											{renderContent(a)}
										</div>
									);
								})}
							</div>

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

			{/* Image Zoom Dialog */}
			<Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
				<DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0">
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
