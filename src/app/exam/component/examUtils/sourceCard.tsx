import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import MathContent from "./MathContent";

interface SourceBlockProps {
	sourceName?: string | null;
	sourceTitle?: string | null;
	sourceImg?: string | null;
	srcAudio?: string | null;
	lineLimit?: number;
}

const SOURCE_CHAR_LIMIT = 400;

export function SourceBlock({
	sourceName,
	sourceTitle,
	sourceImg,
	srcAudio,
}: SourceBlockProps) {
	const [expanded, setExpanded] = useState(false);

	if (!sourceName && !sourceImg && !srcAudio) return null;

	const plainText =
		sourceName
			?.replace(/<[^>]+>/g, "")
			.replace(/&[^;]+;/g, " ")
			.trim() ?? "";
	const needsTruncate = plainText.length > SOURCE_CHAR_LIMIT;

	// HTML биш plainText-ийг slice хийж preview үүсгэх
	const previewText = needsTruncate
		? `${plainText.slice(0, SOURCE_CHAR_LIMIT)}`
		: plainText;

	return (
		<div className="mt-3 p-3 border rounded-lg">
			{sourceImg && (
				<Image
					src={sourceImg}
					alt="source"
					width={56}
					height={56}
					className="w-14 h-14 object-cover rounded-md mb-2"
					unoptimized
				/>
			)}
			{srcAudio && (
				<audio
					controls
					controlsList="nodownload"
					className="w-full h-10"
					src={srcAudio}
				>
					<track kind="captions" />
				</audio>
			)}
			{sourceName && (
				<div className="text-sm text-gray-700 leading-relaxed">
					{sourceTitle && (
						<span className="font-semibold block mb-1">{sourceTitle}</span>
					)}
					{expanded || !needsTruncate ? (
						<>
							<MathContent html={sourceName} />
							{needsTruncate && (
								<Button
									type="button"
									variant="link"
									size="sm"
									onClick={() => setExpanded(false)}
									className="h-auto p-0 ml-1 text-blue-600 font-semibold"
								>
									Хураах
								</Button>
							)}
						</>
					) : (
						<span>
							{previewText}
							<Button
								type="button"
								variant="link"
								size="sm"
								onClick={() => setExpanded(true)}
								className="h-auto p-0 ml-1 text-blue-600 font-semibold"
							>
								...дэлгэрэнгүй
							</Button>
						</span>
					)}
				</div>
			)}
		</div>
	);
}
