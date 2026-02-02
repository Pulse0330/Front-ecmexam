"use client";

import DOMPurify from "dompurify";
import { FileText, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface SafeHtmlContentProps {
	html: string;
	contentType: number;
}

export function SafeHtmlContent({ html, contentType }: SafeHtmlContentProps) {
	const contentRef = useRef<HTMLDivElement>(null);
	const [_isFullscreen, _setIsFullscreenn] = useState(false);

	useEffect(() => {
		if (contentRef.current && typeof window !== "undefined") {
			const clean = DOMPurify.sanitize(html, {
				ADD_TAGS: ["iframe"],
				ADD_ATTR: ["allowfullscreen", "frameborder", "src", "class"],
			});
			contentRef.current.innerHTML = clean;
		}
	}, [html]);

	// Хоосон эсвэл тодорхойгүй агуулга
	if (!html || html.trim() === "") {
		return (
			<div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
				<p className="text-gray-500 text-center text-sm">
					Агуулга байхгүй байна
				</p>
			</div>
		);
	}

	const trimmedHtml = html.trim();
	const isDirectUrl = !trimmedHtml.includes("<") && !trimmedHtml.includes(">");

	// Шууд URL бол
	if (isDirectUrl) {
		// YouTube video ID шалгах (11 тэмдэгт)
		const isYouTubeId = /^[a-zA-Z0-9_-]{11}$/.test(trimmedHtml);

		if (isYouTubeId) {
			return (
				<div className="space-y-2">
					<div className="bg-black rounded-lg overflow-hidden shadow-lg">
						<div
							className="relative w-full bg-black"
							style={{ paddingBottom: "56.25%" }}
						>
							<iframe
								src={`https://www.youtube.com/embed/${trimmedHtml}?rel=0&modestbranding=1`}
								className="absolute top-0 left-0 w-full h-full"
								title="YouTube Video"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					</div>
				</div>
			);
		}

		// YouTube бүтэн URL шалгах
		const youtubeMatch = trimmedHtml.match(
			/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
		);
		if (youtubeMatch) {
			const videoId = youtubeMatch[1];
			return (
				<div className="space-y-2">
					<div className="bg-black rounded-lg overflow-hidden shadow-lg">
						<div
							className="relative w-full bg-black"
							style={{ paddingBottom: "56.25%" }}
						>
							<iframe
								src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
								className="absolute top-0 left-0 w-full h-full"
								title="YouTube Video"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					</div>
				</div>
			);
		}

		const fileExtension = trimmedHtml.split(".").pop()?.toLowerCase();

		// Зургийн файлууд
		if (
			["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"].includes(
				fileExtension || "",
			)
		) {
			return (
				<div className="space-y-2">
					<img
						src={trimmedHtml}
						alt="Хичээлийн зураг"
						className="w-full h-auto rounded-lg border max-h-[350px] object-contain"
						onError={(e) => {
							e.currentTarget.src = "/placeholder-image.png";
						}}
					/>
				</div>
			);
		}

		// Аудио файлууд
		if (
			["mp3", "wav", "ogg", "aac", "m4a", "flac"].includes(fileExtension || "")
		) {
			return (
				<div className="space-y-2">
					<div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
						<div className="flex items-center gap-2 mb-2">
							<PlayCircle className="h-4 w-4 text-purple-600" />
							<div>
								<p className="font-medium text-sm text-purple-900">
									Аудио хичээл
								</p>
							</div>
						</div>
						{/* biome-ignore lint/a11y/useMediaCaption: Educational content */}
						<audio controls className="w-full h-10" src={trimmedHtml}>
							Таны browser audio дэмжихгүй байна.
						</audio>
					</div>
				</div>
			);
		}

		// Видео файлууд
		if (["mp4", "webm", "ogv", "mov", "avi"].includes(fileExtension || "")) {
			return (
				<div className="space-y-2">
					<div className="bg-black rounded-lg overflow-hidden max-h-[400px]">
						{/* biome-ignore lint/a11y/useMediaCaption: Educational content */}
						<video controls className="w-full" src={trimmedHtml}>
							Таны browser видео дэмжихгүй байна.
						</video>
					</div>
				</div>
			);
		}

		// PDF файлууд
		if (fileExtension === "pdf") {
			return (
				<div className="space-y-2">
					<iframe
						src={trimmedHtml}
						className="w-full h-[400px] rounded-lg border"
						title="PDF Document"
					/>
					<Button
						variant="outline"
						size="sm"
						className="w-full"
						onClick={() => window.open(trimmedHtml, "_blank")}
					>
						<FileText className="mr-2 h-3 w-3" />
						PDF-ийг шинэ цонхонд нээх
					</Button>
				</div>
			);
		}

		// PowerPoint файлууд
		if (["ppt", "pptx"].includes(fileExtension || "")) {
			return (
				<div className="space-y-2">
					<div className="bg-orange-50 rounded-lg overflow-hidden border border-orange-200">
						<div className="flex items-center gap-2 p-2 bg-orange-100 border-b border-orange-200">
							<FileText className="h-4 w-4 text-orange-600" />
							<p className="font-medium text-sm text-orange-900">
								PowerPoint танилцуулга
							</p>
						</div>
						<iframe
							src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(trimmedHtml)}`}
							className="w-full h-[400px]"
							title="PowerPoint Presentation"
						/>
					</div>
				</div>
			);
		}

		// Excel файлууд
		if (["xls", "xlsx"].includes(fileExtension || "")) {
			return (
				<div className="space-y-2">
					<div className="bg-green-50 rounded-lg overflow-hidden border border-green-200">
						<div className="flex items-center gap-2 p-2 bg-green-100 border-b border-green-200">
							<FileText className="h-4 w-4 text-green-600" />
							<p className="font-medium text-sm text-green-900">
								Excel хүснэгт
							</p>
						</div>
						<iframe
							src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(trimmedHtml)}`}
							className="w-full h-[400px]"
							title="Excel Spreadsheet"
						/>
					</div>
				</div>
			);
		}

		// Word файлууд
		if (["doc", "docx"].includes(fileExtension || "")) {
			return (
				<div className="space-y-2">
					<div className="bg-blue-50 rounded-lg overflow-hidden border border-blue-200">
						<div className="flex items-center gap-2 p-2 bg-blue-100 border-b border-blue-200">
							<FileText className="h-4 w-4 text-blue-600" />
							<p className="font-medium text-sm text-blue-900">Word документ</p>
						</div>
						<iframe
							src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(trimmedHtml)}`}
							className="w-full h-[400px]"
							title="Word Document"
						/>
					</div>
				</div>
			);
		}

		// Бусад файлууд
		return (
			<div className="space-y-2">
				<div className="p-3 bg-gray-100 rounded-lg border">
					<div className="flex items-center gap-2">
						<FileText className="h-5 w-5 text-gray-600" />
						<div>
							<p className="font-medium text-sm">Файл</p>
							<p className="text-xs text-gray-600">Файлыг татаж харна уу</p>
						</div>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="w-full"
					onClick={() => window.open(trimmedHtml, "_blank")}
				>
					<FileText className="mr-2 h-3 w-3" />
					Татаж авах / Үзэх
				</Button>
			</div>
		);
	}

	// HTML агуулга (iframe, embed код гэх мэт)
	return (
		<div
			ref={contentRef}
			className="prose prose-sm max-w-none
				[&_iframe]:w-full [&_iframe]:max-h-[400px] [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border
				[&_img]:rounded-lg [&_img]:max-w-full [&_img]:max-h-[350px]
				[&_a]:text-blue-600 [&_a]:no-underline hover:[&_a]:underline
				[&_video]:w-full [&_video]:max-h-[400px] [&_video]:rounded-lg
				[&_audio]:w-full [&_audio]:h-10"
		/>
	);
}
