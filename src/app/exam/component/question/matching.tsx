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
		"#ef4444",
		"#3b82f6",
		"#22c55e",
		"#f59e0b",
		"#8b5cf6",
		"#ec4899",
		"#06b6d4",
	]);
	const usedColors = useRef<Set<string>>(new Set());

	const getUniqueColor = useCallback((): string => {
		const available = colorPalette.current.filter(
			(c) => !usedColors.current.has(c),
		);
		if (!available.length) {
			usedColors.current.clear();
			const color = colorPalette.current[0];
			usedColors.current.add(color);
			return color;
		}
		const color = available[Math.floor(Math.random() * available.length)];
		usedColors.current.add(color);
		return color;
	}, []);

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

	// userAnswers сэргээх - ✅ ЗАСВАРЛАСАН ХЭСЭГ
	useEffect(() => {
		if (Object.keys(userAnswers).length === 0) return;

		const restored: Connection[] = [];

		Object.entries(userAnswers).forEach(([qRefIdStr, answerId]) => {
			const qRefId = Number(qRefIdStr);

			// question: ref_child_id === -1 БА refid === qRefId
			const question = answers.find(
				(a) => a.refid === qRefId && a.ref_child_id === -1,
			);

			// answer: answer_id === answerId (backend-ээс ирсэн ID)
			const answer = answers.find((a) => a.answer_id === answerId);

			if (question && answer) {
				restored.push({
					start: `q-${question.answer_id}`,
					end: `a-${answer.answer_id}`,
					color: getUniqueColor(),
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

	const handleItemClick = useCallback((id: string, isQuestion: boolean) => {
		setConnections((prev) => {
			const existing = prev.find((c) => c.start === id || c.end === id);
			if (existing) {
				usedColors.current.delete(existing.color);
				setActiveStart("");
				return prev.filter((c) => c !== existing);
			}
			return prev;
		});

		if (isQuestion) {
			setActiveStart(id);
		} else {
			setActiveStart((currentStart) => {
				if (currentStart) {
					const available = colorPalette.current.filter(
						(c) => !usedColors.current.has(c),
					);
					const color =
						available.length > 0
							? available[Math.floor(Math.random() * available.length)]
							: colorPalette.current[0];
					usedColors.current.add(color);

					setConnections((prev) => [
						...prev.filter((c) => c.start !== currentStart),
						{ start: currentStart, end: id, color },
					]);
					return "";
				}
				return currentStart;
			});
		}
	}, []);

	const interactiveProps = (id: string, isQuestion: boolean) => ({
		role: "button",
		tabIndex: 0,
		onClick: () => handleItemClick(id, isQuestion),
		onKeyDown: (e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				handleItemClick(id, isQuestion);
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
					<div className="text-sm font-medium text-center break-words">
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

	// ✅ ЗАСВАРЛАСАН ХЭСЭГ - answer_id дамжуулах
	useEffect(() => {
		if (!onMatchChangeRef.current) return;

		const matches: Record<number, number> = {};

		connections.forEach((c) => {
			const startId = parseInt(c.start.replace("q-", ""), 10);
			const endId = parseInt(c.end.replace("a-", ""), 10);

			const question = answers.find((a) => a.answer_id === startId);
			const answer = answers.find((a) => a.answer_id === endId);

			if (question && answer) {
				// ✅ question.refid: answer.answer_id (refid биш!)
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
											{...interactiveProps(qid, true)}
											className={cn(
												"w-full p-3 border rounded-lg flex flex-col items-center transition-colors cursor-pointer",
												isSelected(qid)
													? "border-blue-500 bg-blue-50"
													: isConnected(qid)
														? "border-green-500 bg-green-50"
														: "border-gray-300 bg-white hover:border-green-400",
											)}
											style={
												getConnectionColor(qid)
													? {
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
																{...interactiveProps(aid, false)}
																className="w-full p-2 border border-dashed rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-blue-300"
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
											{...interactiveProps(qid, true)}
											className={cn(
												"w-full p-4 border rounded-lg flex flex-col items-center justify-center transition-all min-h-[80px] cursor-pointer hover:border-green-400",
												isSelected(qid)
													? "border-blue-500 bg-blue-50 shadow-md"
													: isConnected(qid)
														? "border-green-500 bg-green-50"
														: "border-gray-300",
											)}
											style={
												getConnectionColor(qid)
													? {
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
											{...interactiveProps(aid, false)}
											className={cn(
												"w-full p-4 border rounded-lg flex flex-col items-center justify-center transition-all min-h-[80px] cursor-pointer hover:border-blue-400",
												isSelected(aid)
													? "border-blue-500 bg-blue-50 shadow-md"
													: isConnected(aid)
														? "border-green-500 bg-green-50"
														: "border-gray-300",
											)}
											style={
												getConnectionColor(aid)
													? {
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
