"use client";

import parse from "html-react-parser";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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

	// 🎯 1. Answers-г асуултаар бүлэглэх (Map<question_id, answers[]>)
	const answersByQuestion = useMemo(() => {
		const map = new Map<number, QuestionItem[]>();
		answers.forEach((answer) => {
			const qid = answer.question_id;
			if (qid !== null) {
				if (!map.has(qid)) map.set(qid, []);
				map.get(qid)?.push(answer);
			}
		});
		return map;
	}, [answers]);

	// 🎯 2. ref_child_id ашиглан асуулт ба хариулт ялгах
	const matchingData = useMemo(() => {
		const questionsFiltered = answers.filter(
			(q): q is QuestionItem & { refid: number } =>
				q.ref_child_id !== -1 &&
				q.ref_child_id !== null &&
				typeof q.refid === "number",
		);
		const answersFiltered = answers.filter(
			(a): a is QuestionItem & { refid: number } =>
				a.ref_child_id === -1 && typeof a.refid === "number",
		);
		return { questions: questionsFiltered, answers: answersFiltered };
	}, [answers]);

	// 🎯 3. Нэг асуултанд харгалзах бүх хариултуудыг авах функц
	const getAnswersForQuestion = useCallback(
		(questionId: number) => answersByQuestion.get(questionId) || [],
		[answersByQuestion],
	);

	// 🎯 4. Build correct answer mapping from ref_child_id
	const correctAnswers = useMemo(() => {
		const mapping: Record<number, number> = {};
		answers.forEach((item) => {
			// Questions have ref_child_id pointing to their correct answer
			if (item.ref_child_id !== null && item.ref_child_id !== -1) {
				mapping[item.answer_id] = item.ref_child_id;
			}
		});
		return mapping;
	}, [answers]);

	// 🎯 5. Initialize connections from userAnswers in review mode
	useEffect(() => {
		if (mode === "review" && Object.keys(userAnswers).length > 0) {
			const reviewConnections: Connection[] = [];
			Object.entries(userAnswers).forEach(([qId, aId]) => {
				const isCorrect = correctAnswers[Number(qId)] === Number(aId);
				reviewConnections.push({
					start: `q-${qId}`,
					end: `a-${aId}`,
					color: isCorrect ? "#22c55e" : "#ef4444", // green if correct, red if wrong
				});
			});
			setConnections(reviewConnections);
		}
	}, [mode, userAnswers, correctAnswers]);

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

	const handleItemClick = (id: string, isQuestion: boolean) => {
		// Disable interaction in review mode
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

	const getItemStatus = (id: string, isQuestion: boolean) => {
		if (mode === "exam") return null;

		const connection = connections.find((c) =>
			isQuestion ? c.start === id : c.end === id,
		);
		if (!connection) return null;

		const questionId = parseInt(connection.start.replace("q-", ""), 10);
		const answerId = parseInt(connection.end.replace("a-", ""), 10);
		const isCorrect = correctAnswers[questionId] === answerId;

		return isCorrect ? "correct" : "incorrect";
	};

	const interactiveProps = (id: string, isQuestion: boolean) => ({
		role: "button",
		tabIndex: mode === "review" ? -1 : 0,
		onClick: () => handleItemClick(id, isQuestion),
		onKeyDown: (e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") handleItemClick(id, isQuestion);
		},
	});

	const questionsOnly = matchingData.questions;
	const answersOnly = matchingData.answers;

	return (
		<div ref={containerRef} className="w-full relative">
			<Xwrapper>
				<p className="font-semibold mb-4 text-center">
					{mode === "review"
						? "Таны хариултууд (Ногоон = зөв, Улаан = буруу)"
						: isMobile
							? "Асуулт дээр дарж дараа нь хариулт сонгоно уу"
							: "Зөв хариултыг холбоно уу"}
				</p>

				<div className="grid grid-cols-2 gap-x-8 gap-y-3">
					<h3 className="border-b pb-2 font-semibold text-center">Асуулт</h3>
					<h3 className="border-b pb-2 font-semibold text-center">Хариулт</h3>

					{questionsOnly.map((q, index) => {
						const qid = `q-${q.answer_id}`;
						const _answerOptions = getAnswersForQuestion(q.question_id ?? -1);
						const a = answersOnly[index];
						const aid = a ? `a-${a.answer_id}` : null;
						const qStatus = getItemStatus(qid, true);
						const aStatus = aid ? getItemStatus(aid, false) : null;

						return (
							<React.Fragment key={q.refid}>
								<div
									id={qid}
									{...interactiveProps(qid, true)}
									className={cn(
										"w-full p-4 border rounded-lg flex items-center justify-center text-center",
										mode === "exam" ? "cursor-pointer" : "cursor-default",
										mode === "exam" && isSelected(qid)
											? "border-blue-500"
											: mode === "exam" && isConnected(qid)
												? "border-green-500 bg-green-50"
												: qStatus === "correct"
													? "border-green-500 bg-green-50"
													: qStatus === "incorrect"
														? "border-red-500 bg-red-50"
														: "border-gray-300",
									)}
									style={
										mode === "exam"
											? {
													borderColor: getConnectionColor(qid),
													backgroundColor: getConnectionColor(qid)
														? `${getConnectionColor(qid)}20`
														: undefined,
												}
											: undefined
									}
								>
									{renderContent(q)}
								</div>

								{aid && a && (
									<div
										id={aid}
										{...interactiveProps(aid, false)}
										className={cn(
											"w-full p-4 border rounded-lg flex items-center justify-center text-center",
											mode === "exam" ? "cursor-pointer" : "cursor-default",
											mode === "exam" && isSelected(aid)
												? "border-blue-500 bg-blue-50"
												: mode === "exam" && isConnected(aid)
													? "border-green-500 bg-green-50"
													: aStatus === "correct"
														? "border-green-500 bg-green-50"
														: aStatus === "incorrect"
															? "border-red-500 bg-red-50"
															: "border-gray-300",
										)}
										style={
											mode === "exam"
												? {
														borderColor: getConnectionColor(aid),
														backgroundColor: getConnectionColor(aid)
															? `${getConnectionColor(aid)}20`
															: undefined,
													}
												: undefined
										}
									>
										{renderContent(a)}
									</div>
								)}
							</React.Fragment>
						);
					})}
				</div>

				{!isMobile &&
					connections.map((c) => (
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
			</Xwrapper>
		</div>
	);
}
