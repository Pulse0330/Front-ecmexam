"use client";

import { Maximize, Minimize, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface QuestionImageProps {
	src: string;
	alt: string;
	insideButton?: boolean;
}

const QuestionImage = memo(
	({ src, alt, insideButton = false }: QuestionImageProps) => {
		const [isOpen, setIsOpen] = useState(false);
		const [zoom, setZoom] = useState(1);
		const [rotation, setRotation] = useState(0);
		const [position, setPosition] = useState({ x: 0, y: 0 });
		const [isDragging, setIsDragging] = useState(false);
		const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
		const imageContainerRef = useRef<HTMLDivElement>(null);

		const handleMouseDown = useCallback(
			(e: React.MouseEvent) => {
				if (zoom <= 1) return;
				setIsDragging(true);
				setDragStart({
					x: e.clientX - position.x,
					y: e.clientY - position.y,
				});
			},
			[zoom, position],
		);

		const handleMouseMove = useCallback(
			(e: React.MouseEvent) => {
				if (!isDragging) return;
				setPosition({
					x: e.clientX - dragStart.x,
					y: e.clientY - dragStart.y,
				});
			},
			[isDragging, dragStart],
		);

		const handleMouseUp = useCallback(() => {
			setIsDragging(false);
		}, []);

		const handleZoomIn = useCallback(() => {
			setZoom((prev) => Math.min(prev + 0.2, 3));
		}, []);

		const handleZoomOut = useCallback(() => {
			setZoom((prev) => {
				const newZoom = Math.max(prev - 0.2, 0.5);
				if (newZoom <= 1) {
					setPosition({ x: 0, y: 0 });
				}
				return newZoom;
			});
		}, []);

		const handleRotate = useCallback(() => {
			setRotation((prev) => (prev + 90) % 360);
		}, []);

		const handleReset = useCallback(() => {
			setZoom(1);
			setRotation(0);
			setPosition({ x: 0, y: 0 });
		}, []);

		const handleDialogClose = useCallback(() => {
			setIsOpen(false);
			setTimeout(() => {
				setZoom(1);
				setRotation(0);
				setPosition({ x: 0, y: 0 });
				setIsDragging(false);
			}, 200);
		}, []);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent) => {
				if (zoom <= 1) return;

				const moveStep = 50;
				switch (e.key) {
					case "ArrowUp":
						e.preventDefault();
						setPosition((prev) => ({ ...prev, y: prev.y + moveStep }));
						break;
					case "ArrowDown":
						e.preventDefault();
						setPosition((prev) => ({ ...prev, y: prev.y - moveStep }));
						break;
					case "ArrowLeft":
						e.preventDefault();
						setPosition((prev) => ({ ...prev, x: prev.x + moveStep }));
						break;
					case "ArrowRight":
						e.preventDefault();
						setPosition((prev) => ({ ...prev, x: prev.x - moveStep }));
						break;
				}
			},
			[zoom],
		);

		const handleImageClick = useCallback(
			(e: React.MouseEvent) => {
				if (insideButton) {
					e.stopPropagation();
				}
				setIsOpen(true);
			},
			[insideButton],
		);

		const handleImageKeyDown = useCallback(
			(e: React.KeyboardEvent) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					if (insideButton) {
						e.stopPropagation();
					}
					setIsOpen(true);
				}
			},
			[insideButton],
		);

		// Memoize image content to prevent re-renders
		const imageContent = (
			<>
				<Image
					src={src}
					alt={alt}
					fill
					sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 320px"
					quality={90}
					style={{ objectFit: "contain" }}
					className="rounded-lg pointer-events-none"
					loading="lazy"
				/>
				<div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
					<div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-700 rounded-full p-2 shadow-lg">
						<Maximize size={18} />
					</div>
				</div>
			</>
		);

		return (
			<div className="flex flex-col items-center">
				{insideButton ? (
					// biome-ignore lint/a11y/useSemanticElements: Cannot use <button> here as component is nested inside another button, which would create invalid HTML
					<div
						className="relative w-full h-48 cursor-pointer group"
						onClick={handleImageClick}
						onKeyDown={handleImageKeyDown}
						role="button"
						tabIndex={0}
						aria-label="Зургийг томруулах"
					>
						{imageContent}
					</div>
				) : (
					<button
						type="button"
						className="relative w-full h-48 cursor-pointer group border-0 bg-transparent p-0"
						onClick={handleImageClick}
						aria-label="Зургийг томруулах"
					>
						{imageContent}
					</button>
				)}

				{isOpen && (
					<Dialog open={isOpen} onOpenChange={handleDialogClose}>
						<DialogContent className="w-[95vw] max-w-7xl h-[90vh] p-4 flex flex-col items-center justify-center">
							<DialogHeader>
								<DialogTitle>{alt}</DialogTitle>
							</DialogHeader>

							<div
								ref={imageContainerRef}
								className="relative w-full h-full flex items-center justify-center overflow-hidden focus:outline-none"
								onMouseDown={handleMouseDown}
								onMouseMove={handleMouseMove}
								onMouseUp={handleMouseUp}
								onMouseLeave={handleMouseUp}
								onKeyDown={handleKeyDown}
								role="img"
								aria-label="Зургийг чирж харах. Сум товчоор зөөнө үү."
								style={{
									cursor:
										zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
								}}
							>
								<div
									className="relative w-full h-full"
									style={{
										transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
										transition: isDragging ? "none" : "transform 0.2s",
										transformOrigin: "center center",
										willChange: isDragging ? "transform" : "auto",
									}}
								>
									<Image
										src={src}
										alt={alt}
										fill
										sizes="(max-width: 768px) 95vw, (max-width: 1200px) 90vw, 1400px"
										quality={100}
										priority
										style={{ objectFit: "contain" }}
										className="rounded-lg shadow-lg pointer-events-none"
										draggable={false}
									/>
								</div>

								<div className="absolute bottom-4 right-4 flex gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
									<Button
										type="button"
										onClick={handleZoomIn}
										disabled={zoom >= 3}
										className="bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow disabled:opacity-50"
										size="icon"
										title="Томруулах"
									>
										<ZoomIn size={20} />
									</Button>
									<Button
										type="button"
										onClick={handleZoomOut}
										disabled={zoom <= 0.5}
										className="bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow disabled:opacity-50"
										size="icon"
										title="Жижигрүүлэх"
									>
										<ZoomOut size={20} />
									</Button>
									<Button
										type="button"
										onClick={handleRotate}
										className="bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow"
										size="icon"
										title="Эргүүлэх"
									>
										<RotateCw size={20} />
									</Button>
									<Button
										type="button"
										onClick={handleReset}
										className="bg-white hover:bg-gray-100 text-gray-700 rounded px-3 py-2 shadow text-sm"
										title="Анхны байдалд оруулах"
									>
										Reset
									</Button>
									<div className="flex items-center px-3 text-sm font-medium bg-gray-100 dark:bg-gray-700 rounded">
										{Math.round(zoom * 100)}%
									</div>
								</div>

								<Button
									className="absolute top-2 right-2 bg-white hover:bg-gray-100 text-gray-700 rounded-full p-2 shadow"
									onClick={handleDialogClose}
									size="icon"
									title="Хаах"
								>
									<Minimize size={24} />
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				)}
			</div>
		);
	},
);

QuestionImage.displayName = "QuestionImage";

export default QuestionImage;
