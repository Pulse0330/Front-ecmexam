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
import { HelpCircle } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
											"w-full mb-2 justify-start transition-colors duration-200 select-none relative",
											disabled
												? "cursor-default"
												: "cursor-grab active:cursor-grabbing",
											snapshot.isDragging &&
												"bg-accent ring-2 ring-ring/50 cursor-grabbing shadow-lg scale-105",
										)}
										style={{ ...providedDraggable.draggableProps.style }}
									>
										{/* Дугаар */}
										<div className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
											{index + 1}
										</div>

										<div className="flex-1 text-sm text-gray-900 dark:text-gray-100 pl-8">
											{item.answer_name_html
												? parse(item.answer_name_html)
												: ""}
										</div>

										{/* Drag indicator */}
										{!disabled && (
											<div className="flex flex-col gap-0.5 opacity-40">
												<div className="w-1 h-1 rounded-full bg-current" />
												<div className="w-1 h-1 rounded-full bg-current" />
												<div className="w-1 h-1 rounded-full bg-current" />
											</div>
										)}
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
	const [showHelp, setShowHelp] = useState(false);
	const prevUserAnswersRef = useRef<number[]>([]);
	const initialShuffledRef = useRef<Answer[]>([]);

	const shuffleArray = useCallback((array: Answer[]): Answer[] => {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}, []);

	useEffect(() => {
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

		if (initialShuffledRef.current.length === 0) {
			const shuffled = shuffleArray(answers);
			initialShuffledRef.current = shuffled;
			setItems(shuffled);
		} else {
			setItems(initialShuffledRef.current);
		}
	}, [answers, shuffleArray, userAnswers]);

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
		<>
			<div className="space-y-4">
				<div className="p-4 border rounded-lg shadow-sm space-y-3">
					<div className="flex items-center justify-between gap-2">
						<h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
							Зөв дараалалд оруулна уу:
						</h3>
						<button
							type="button"
							onClick={() => setShowHelp(true)}
							className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors shrink-0"
							title="Заавар харах"
						>
							<HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</button>
					</div>

					<DragAndDrop
						answers={items}
						onOrderChange={handleOrderChange}
						disabled={false}
					/>
				</div>
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
									🖱️ Компьютер дээр
								</h3>
								<ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal list-inside">
									<li>
										Хариултын хэсгийг{" "}
										<strong className="text-blue-600 dark:text-blue-400">
											чирж
										</strong>{" "}
										зөв байрлалд нь тавина
									</li>
									<li>Чирч байх үед элемент томорч, сүүдэртэй болно</li>
									<li>Байрлалд нь таарч суухад гэрэлтэнэ</li>
									<li>Дарааллыг өөрчлөхийн тулд дахин чирж байршуулна</li>
								</ol>
							</div>

							<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
								<h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
									📱 Гар утсан дээр
								</h3>
								<ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal list-inside">
									<li>
										Хариултыг{" "}
										<strong className="text-green-600 dark:text-green-400">
											удаан дарж
										</strong>
										{} барьж, чирч хөдөлгөнө
									</li>
									<li>Зөв байрлалд нь хүргэж, гараа суллана</li>
									<li>Дугаар нь автоматаар шинэчлэгдэнэ</li>
								</ol>
							</div>

							<div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
								<h3 className="font-semibold mb-2">💡 Тэмдэглэл</h3>
								<ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
									<li>🔢 Дугаарууд автоматаар шинэчлэгдэнэ</li>
									<li>🎯 Зөв дараалал нь дээрээс доош чиглэлтэй</li>
									<li>🔄 Хэдэн ч удаа өөрчлөх боломжтой</li>
									<li>✅ Өөрчлөлт бүр хадгалагдана</li>
								</ul>
							</div>

							<div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
								<h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
									⌨️ Гарын товчлуур
								</h3>
								<ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
									<li>
										<kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border rounded text-xs">
											Tab
										</kbd>{" "}
										- Элементүүдийг сонгох
									</li>
									<li>
										<kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border rounded text-xs">
											Space
										</kbd>{" "}
										- Элементийг барих/суллах
									</li>
									<li>
										<kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border rounded text-xs">
											↑↓
										</kbd>{" "}
										- Дээш/доош хөдөлгөх
									</li>
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
};

export default DragAndDropWrapper;
