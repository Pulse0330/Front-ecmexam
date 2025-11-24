"use client";

import { Maximize, Minimize, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
}

const QuestionImage = ({ src, alt }: QuestionImageProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [zoom, setZoom] = useState(1);

	return (
		<div className="mb-4 flex flex-col items-center">
			<div className="relative w-[400px] h-[300px] cursor-pointer">
				<Image
					src={src}
					alt={alt}
					fill
					style={{ objectFit: "contain" }}
					className="rounded-lg shadow-sm"
					onClick={() => setIsOpen(true)}
				/>
				<Button
					type="button"
					onClick={() => setIsOpen(true)}
					className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
				>
					<Maximize size={20} />
				</Button>
			</div>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="w-[90vw] max-w-3xl h-[80vh] p-4 flex flex-col items-center justify-center">
					<DialogHeader>
						<DialogTitle>{alt}</DialogTitle>
					</DialogHeader>

					<div className="relative w-full h-full flex items-center justify-center">
						<div
							className="relative w-full h-full"
							style={{
								transform: `scale(${zoom})`,
								transition: "transform 0.2s",
							}}
						>
							<Image
								src={src}
								alt={alt}
								fill
								style={{ objectFit: "contain" }}
								className="rounded-lg shadow-lg"
							/>
						</div>

						<div className="absolute bottom-4 right-4 flex gap-2">
							<Button
								type="button"
								onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
								className="bg-white rounded-full p-2 shadow"
							>
								<ZoomIn size={20} />
							</Button>
							<Button
								type="button"
								onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}
								className="bg-white rounded-full p-2 shadow"
							>
								<ZoomOut size={20} />
							</Button>
						</div>

						<Button
							className="absolute top-2 right-2 bg-white rounded-full p-2 shadow"
							onClick={() => setIsOpen(false)}
						>
							<Minimize size={24} />
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default QuestionImage;
