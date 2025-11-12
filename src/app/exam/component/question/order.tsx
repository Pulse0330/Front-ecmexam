"use client";

import {
	DragDropContext,
	Draggable,
	type DraggableProvided,
	type DraggableStateSnapshot,
	Droppable,
	type DroppableProvided,
	type DropResult,
} from "@hello-pangea/dnd";
import parse from "html-react-parser";
import { CheckCircle2, XCircle } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// -----------------------------
// Types
// -----------------------------
interface Answer {
	answer_id: number;
	answer_name_html: string;
}

interface DragAndDropProps {
	answers: Answer[];
	droppableId?: string;
	onOrderChange?: (orderedIds: number[]) => void;
	disabled?: boolean;
	showCorrect?: boolean;
	correctIds?: number[];
}

interface DragAndDropWrapperProps {
	questionId: number;
	examId?: number;
	userId?: number;
	answers: Answer[];
	mode: "exam" | "review";
	userAnswers?: number[];
	correctAnswers?: number[];
	onOrderChange?: (orderedIds: number[]) => void;
}

// -----------------------------
// DragAndDrop Component
// -----------------------------
const DragAndDrop: React.FC<DragAndDropProps> = ({
	answers,
	droppableId = "droppable",
	onOrderChange,
	disabled = false,
	showCorrect = false,
	correctIds = [],
}) => {
	const [items, setItems] = useState<Answer[]>(answers || []);
	const isInitialMount = useRef(true);

	useEffect(() => {
		// Зөвхөн эхний удаа эсвэл disabled үед л шинэчилнэ
		if (isInitialMount.current || disabled) {
			setItems(answers || []);
			isInitialMount.current = false;
		}
	}, [answers, disabled]);

	const onDragEnd = (result: DropResult) => {
		if (disabled || !result.destination) return;

		const newItems = Array.from(items);
		const [removed] = newItems.splice(result.source.index, 1);
		newItems.splice(result.destination.index, 0, removed);

		setItems(newItems);
		onOrderChange?.(newItems.map((i) => i.answer_id));
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId={droppableId}>
				{(provided: DroppableProvided) => (
					<div {...provided.droppableProps} ref={provided.innerRef}>
						{items.map((item, index) => {
							const isCorrect =
								showCorrect &&
								correctIds &&
								correctIds[index] === item.answer_id;

							return (
								<Draggable
									key={item.answer_id}
									draggableId={String(item.answer_id)}
									index={index}
									isDragDisabled={disabled}
								>
									{(
										providedDraggable: DraggableProvided,
										snapshot: DraggableStateSnapshot,
									) => (
										<div
											ref={providedDraggable.innerRef}
											{...providedDraggable.draggableProps}
											{...providedDraggable.dragHandleProps}
											className={cn(
												buttonVariants({
													variant: "outline",
													size: "default",
												}),
												"w-full mb-2 justify-start transition-colors duration-200 select-none",
												disabled ? "cursor-default" : "cursor-move",
												snapshot.isDragging && "bg-accent ring-2 ring-ring/50",
												isCorrect &&
													"border-green-500 bg-green-50 text-green-800",
												showCorrect &&
													!isCorrect &&
													"border-red-400 bg-red-50 text-red-700",
											)}
											style={{ ...providedDraggable.draggableProps.style }}
										>
											<div className="flex-1 text-sm text-gray-900 dark:text-gray-100">
												{item.answer_name_html
													? parse(item.answer_name_html)
													: ""}
											</div>
										</div>
									)}
								</Draggable>
							);
						})}
						{provided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	);
};

// -----------------------------
// DragAndDropWrapper Component
// -----------------------------
const DragAndDropWrapper: React.FC<DragAndDropWrapperProps> = ({
	answers,
	mode,
	userAnswers = [],
	correctAnswers = [],
	onOrderChange,
}) => {
	const [items, setItems] = useState<Answer[]>(() => {
		// Initial state - хэрэв хадгалсан дараалал байвал түүгээр эхлүүлнэ
		if (userAnswers.length > 0) {
			const sorted = userAnswers
				.map((id) => answers.find((a) => a.answer_id === id))
				.filter(Boolean) as Answer[];
			return sorted.length > 0 ? sorted : answers;
		}
		return answers;
	});

	const prevUserAnswersRef = useRef<number[]>(userAnswers);

	useEffect(() => {
		// Зөвхөн userAnswers өөрчлөгдсөн үед л дахин set хийнэ
		const userAnswersChanged =
			JSON.stringify(prevUserAnswersRef.current) !==
			JSON.stringify(userAnswers);

		if (userAnswersChanged && userAnswers.length > 0) {
			const sorted = userAnswers
				.map((id) => answers.find((a) => a.answer_id === id))
				.filter(Boolean) as Answer[];

			if (sorted.length > 0) {
				setItems(sorted);
			}
			prevUserAnswersRef.current = userAnswers;
		}
	}, [userAnswers, answers]);

	const handleOrderChange = useCallback(
		(orderedIds: number[]) => {
			if (mode === "exam") {
				onOrderChange?.(orderedIds);
			}
		},
		[onOrderChange, mode],
	);

	const reviewStats = useMemo(() => {
		if (mode !== "review") return null;

		let correct = 0;
		let wrong = 0;

		items.forEach((item, index) => {
			if (correctAnswers[index] === item.answer_id) {
				correct++;
			} else {
				wrong++;
			}
		});

		return { correct, wrong, total: items.length };
	}, [items, correctAnswers, mode]);

	const correctOrderedAnswers = useMemo(() => {
		if (mode !== "review" || correctAnswers.length === 0) return [];

		return correctAnswers
			.map((id) => answers.find((a) => a.answer_id === id))
			.filter(Boolean) as Answer[];
	}, [correctAnswers, answers, mode]);

	return (
		<div className="space-y-4">
			{mode === "review" && reviewStats && (
				<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm sm:text-base">
							Дарааллын үр дүн
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
							? `Нийт ${reviewStats.total} элементээс ${reviewStats.correct} зөв байрлуулсан`
							: "Хариулаагүй"}
					</p>
				</div>
			)}

			<div className="p-4 border rounded-lg shadow-sm space-y-3">
				<h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
					{mode === "exam"
						? "Зөв дараалалд оруулна уу:"
						: "Таны өгсөн дараалал:"}
				</h3>

				<DragAndDrop
					answers={items}
					onOrderChange={handleOrderChange}
					disabled={mode === "review"}
					showCorrect={mode === "review"}
					correctIds={correctAnswers}
				/>

				{mode === "review" && (
					<div className="mt-4 space-y-2 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
						<div className="flex items-center gap-2 text-green-700 dark:text-green-400">
							<CheckCircle2 className="w-4 h-4 flex-shrink-0" />
							<span>Зөв байрлалд байгаа хариулт</span>
						</div>
						<div className="flex items-center gap-2 text-red-700 dark:text-red-400">
							<XCircle className="w-4 h-4 flex-shrink-0" />
							<span>Буруу байрлалд байгаа хариулт</span>
						</div>
					</div>
				)}
			</div>

			{mode === "review" && correctOrderedAnswers.length > 0 && (
				<div className="p-4 border-2 border-green-500 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-950/20 space-y-3">
					<h3 className="font-semibold text-base sm:text-lg text-green-900 dark:text-green-300 flex items-center gap-2">
						<CheckCircle2 className="w-5 h-5" />
						Зөв дараалал:
					</h3>

					<div className="space-y-2">
						{correctOrderedAnswers.map((answer, index) => (
							<div
								key={answer.answer_id}
								className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-300 dark:border-green-700 transition-all hover:shadow-md"
							>
								<span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 dark:bg-green-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
									{index + 1}
								</span>
								<div className="flex-1 text-sm text-gray-900 dark:text-gray-100">
									{answer.answer_name_html
										? parse(answer.answer_name_html)
										: ""}
								</div>
								<CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
							</div>
						))}
					</div>

					<div className="text-xs text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/30 p-2 rounded">
						💡 Энэ бол зөв дараалал юм. Таны хариултыг дээрх хэсэгтэй харьцуулна
						уу.
					</div>
				</div>
			)}
		</div>
	);
};

export default DragAndDropWrapper;
