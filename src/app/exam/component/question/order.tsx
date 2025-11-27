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
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
}

interface DragAndDropWrapperProps {
	questionId: number;
	examId?: number;
	userId?: number;
	answers: Answer[];
	userAnswers?: number[];
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
}) => {
	const [items, setItems] = useState<Answer[]>(answers || []);

	// ✅ answers өөрчлөгдөх бүрт items шинэчлэх
	useEffect(() => {
		setItems(answers || []);
	}, [answers]);

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
						{items.map((item, index) => (
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
						))}
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
	userAnswers = [],
	onOrderChange,
}) => {
	const [items, setItems] = useState<Answer[]>([]);
	const prevUserAnswersRef = useRef<number[]>([]);
	const initialShuffledRef = useRef<Answer[]>([]); // ✅ Анхны shuffled дараалал хадгалах

	// ✅ Fisher-Yates shuffle algorithm
	const shuffleArray = useCallback((array: Answer[]): Answer[] => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}, []);

	// ✅ Анхны үед shuffled дараалал үүсгэх
	useEffect(() => {
		// Хэрэв userAnswers байвал түүнийг ашиглах
		if (userAnswers.length > 0) {
			const sorted = userAnswers
				.map((id) => answers.find((a) => a.answer_id === id))
				.filter(Boolean) as Answer[];

			if (sorted.length > 0) {
				setItems(sorted);
				prevUserAnswersRef.current = userAnswers;
				return;
			}
		}

		// Хэрэв userAnswers байхгүй бөгөөд анхны shuffled дараалал үүсгээгүй бол
		if (initialShuffledRef.current.length === 0) {
			const shuffled = shuffleArray(answers);
			initialShuffledRef.current = shuffled;
			setItems(shuffled);
		} else {
			// Анхны shuffled дараалал ашиглах
			setItems(initialShuffledRef.current);
		}
	}, [answers, shuffleArray, userAnswers]);

	// ✅ userAnswers өөрчлөгдөх бүрт дараалал шинэчлэх
	useEffect(() => {
		const hasChanged =
			JSON.stringify(prevUserAnswersRef.current) !==
			JSON.stringify(userAnswers);

		if (!hasChanged) return;

		if (userAnswers.length > 0) {
			const sorted = userAnswers
				.map((id) => answers.find((a) => a.answer_id === id))
				.filter(Boolean) as Answer[];

			if (sorted.length > 0) {
				setItems(sorted);
				prevUserAnswersRef.current = userAnswers;
			}
		} else if (prevUserAnswersRef.current.length > 0) {
			// Хэрэв өмнө нь хариулт байсан, одоо устсан бол shuffled дараалал руу буцах
			if (initialShuffledRef.current.length > 0) {
				setItems(initialShuffledRef.current);
			} else {
				const shuffled = shuffleArray(answers);
				initialShuffledRef.current = shuffled;
				setItems(shuffled);
			}
			prevUserAnswersRef.current = [];
		}
	}, [userAnswers, answers, shuffleArray]);

	const handleOrderChange = useCallback(
		(orderedIds: number[]) => {
			onOrderChange?.(orderedIds);
		},
		[onOrderChange],
	);

	return (
		<div className="space-y-4">
			<div className="p-4 border rounded-lg shadow-sm space-y-3">
				<h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
					Зөв дараалалд оруулна уу:
				</h3>

				<DragAndDrop
					answers={items}
					onOrderChange={handleOrderChange}
					disabled={false}
				/>
			</div>
		</div>
	);
};

export default DragAndDropWrapper;
