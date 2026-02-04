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
					sizes="400px"
					quality={95}
					priority
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
				<DialogContent className="w-[95vw] max-w-7xl h-[90vh] p-4 flex flex-col items-center justify-center">
					<DialogHeader>
						<DialogTitle>{alt}</DialogTitle>
					</DialogHeader>

					<div className="relative w-full h-full flex items-center justify-center overflow-hidden">
						<div
							className="relative w-full h-full"
							style={{
								transform: `scale(${zoom})`,
								transition: "transform 0.2s",
								transformOrigin: "center center",
							}}
						>
							<Image
								src={src}
								alt={alt}
								fill
								sizes="(max-width: 768px) 95vw, (max-width: 1200px) 90vw, 1400px"
								quality={100}
								priority
								unoptimized={false}
								style={{ objectFit: "contain" }}
								className="rounded-lg shadow-lg"
							/>
						</div>

						<div className="absolute bottom-4 right-4 flex gap-2">
							<Button
								type="button"
								onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
								className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
							>
								<ZoomIn size={20} />
							</Button>
							<Button
								type="button"
								onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.5))}
								className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
							>
								<ZoomOut size={20} />
							</Button>
							<Button
								type="button"
								onClick={() => setZoom(1)}
								className="bg-white rounded px-3 py-2 shadow hover:bg-gray-100 text-sm"
							>
								Reset
							</Button>
						</div>

						<Button
							className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
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
