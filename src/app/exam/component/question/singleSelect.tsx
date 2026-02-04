"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Maximize2, RotateCw, XCircle, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import MathContent from "./MathContent";

interface AnswerData {
	answer_id: number;
	answer_name?: string;
	answer_name_html?: string;
	answer_img?: string;
	source_img?: string;
	is_true?: boolean;
}

interface SingleSelectQuestionProps {
	questionId: number;
	questionText?: string;
	questionImage?: string;
	answers: AnswerData[];
	selectedAnswer?: number | null;
	onAnswerChange?: (questionId: number, answerId: number | null) => void;
}

function SingleSelectQuestion({
	questionId,
	questionImage,
	answers,
	selectedAnswer,
	onAnswerChange,
}: SingleSelectQuestionProps) {
	const [zoomedImage, setZoomedImage] = useState<string | null>(null);
	const [zoomLevel, setZoomLevel] = useState(100);
	const [rotation, setRotation] = useState(0);

	const handleSelect = useCallback(
		(answerId: number) => {
			if (!onAnswerChange) return;
			const newValue = selectedAnswer === answerId ? null : answerId;
			onAnswerChange(questionId, newValue);
		},
		[questionId, selectedAnswer, onAnswerChange],
	);

	const handleImageClick = useCallback(
		(e: React.MouseEvent, imageUrl: string) => {
			e.stopPropagation();
			e.preventDefault();
			setZoomedImage(imageUrl);
			setZoomLevel(100);
			setRotation(0);
		},
		[],
	);

	const handleZoomIn = useCallback(() => {
		setZoomLevel((prev) => Math.min(prev + 25, 200));
	}, []);

	const handleZoomOut = useCallback(() => {
		setZoomLevel((prev) => Math.max(prev - 25, 50));
	}, []);

	const handleRotate = useCallback(() => {
		setRotation((prev) => (prev + 90) % 360);
	}, []);

	const handleDialogClose = useCallback(() => {
		setZoomedImage(null);
		setZoomLevel(100);
		setRotation(0);
	}, []);

	return (
		<>
			<div className="space-y-3 sm:space-y-4 w-full">
				{questionImage && (
					<button
						type="button"
						className="relative w-full h-64 group cursor-zoom-in border-0 bg-transparent p-0 rounded-md mb-4"
						onClick={(e) => handleImageClick(e, questionImage)}
					>
						<Image
							src={questionImage}
							alt="Асуултын зураг"
							fill
							className="object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						/>
						<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
							<Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
						</div>
					</button>
				)}

				<div className="space-y-2 sm:space-y-3">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Нэг хариулт сонгох боломжтой
					</p>
					{answers.map((option) => {
						const isSelected = selectedAnswer === option.answer_id;
						const hasContent = option.answer_name_html || option.answer_name;
						const hasImage = option.answer_img || option.source_img;
						const imageUrl = option.answer_img || option.source_img;

						const colorClass = isSelected
							? "border-primary bg-primary/10"
							: "border-border bg-background hover:bg-gray-50 dark:hover:bg-gray-800/50";

						return (
							<div
								key={option.answer_id}
								className={`relative rounded-lg border-2 transition-all duration-200 ${colorClass} overflow-hidden`}
							>
								<button
									type="button"
									onClick={() => handleSelect(option.answer_id)}
									className="w-full p-3 sm:p-4 flex items-start gap-2 sm:gap-3 text-left"
								>
									<span
										className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all
					${
						isSelected
							? "border-primary bg-primary"
							: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
					}`}
									>
										{isSelected && (
											<span className="w-2.5 h-2.5 bg-white rounded-full" />
										)}
									</span>

									<div className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">
										{hasContent && (
											<div
												className="text-left text-sm sm:text-base w-full"
												style={{
													lineHeight: "1.8",
													maxWidth: "100%",
													overflow: "visible",
												}}
											>
												{option.answer_name_html ? (
													<MathContent html={option.answer_name_html} />
												) : (
													<span className="text-gray-900 dark:text-gray-100">
														{option.answer_name}
													</span>
												)}
											</div>
										)}
										{!hasImage && !hasContent && (
											<span className="text-sm text-gray-400 italic">
												Хариулт байхгүй
											</span>
										)}
									</div>
								</button>

								{hasImage && imageUrl && (
									<div className="px-3 sm:px-4 pb-3 sm:pb-4">
										<button
											type="button"
											className="relative w-full h-48 group cursor-zoom-in border-0 bg-transparent p-0 rounded-md"
											onClick={(e) => handleImageClick(e, imageUrl)}
										>
											<Image
												src={imageUrl}
												alt={`Хариулт ${option.answer_id}`}
												fill
												className="object-contain rounded-md border border-gray-200 dark:border-gray-700 shadow-sm"
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											/>
											<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
												<Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
											</div>
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<Dialog open={!!zoomedImage} onOpenChange={handleDialogClose}>
				<DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0">
					<VisuallyHidden>
						<DialogTitle>Зургийг томруулах</DialogTitle>
					</VisuallyHidden>

					<div className="absolute left-4 top-4 z-50 flex gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 border">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleZoomIn}
							disabled={zoomLevel >= 200}
							className="h-8 w-8"
						>
							<ZoomIn className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleZoomOut}
							disabled={zoomLevel <= 50}
							className="h-8 w-8"
						>
							<ZoomOut className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleRotate}
							className="h-8 w-8"
						>
							<RotateCw className="h-4 w-4" />
						</Button>
						<div className="flex items-center px-2 text-sm font-medium">
							{zoomLevel}%
						</div>
					</div>

					<DialogClose className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
						<XCircle className="h-6 w-6" />
						<span className="sr-only">Хаах</span>
					</DialogClose>

					{zoomedImage && (
						<div className="relative w-full h-full p-4 overflow-auto">
							<div
								className="relative w-full h-full flex items-center justify-center"
								style={{
									transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
									transition: "transform 0.2s ease-out",
								}}
							>
								<Image
									src={zoomedImage}
									alt="Томруулсан зураг"
									fill
									className="object-contain"
									priority
									sizes="95vw"
								/>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

export default memo(SingleSelectQuestion);
