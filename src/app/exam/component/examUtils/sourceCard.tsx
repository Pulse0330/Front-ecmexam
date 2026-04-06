import { useState } from "react";
import MathContent from "./MathContent";

interface SourceBlockProps {
	sourceName?: string | null;
	sourceTitle?: string | null;
	sourceImg?: string | null;
	srcAudio?: string | null;
	lineLimit?: number;
}

const SOURCE_LINE_LIMIT = 6;

export function SourceBlock({
	sourceName,
	sourceTitle,
	sourceImg,
	srcAudio,
	lineLimit = SOURCE_LINE_LIMIT,
}: SourceBlockProps) {
	const [expanded, setExpanded] = useState(false);

	if (!sourceName && !sourceImg && !srcAudio) return null;

	const plainText = sourceName?.replace(/<[^>]+>/g, " ").trim() ?? "";
	const sentences = plainText.split(/(?<=[.!?…])\s+/);
	const needsTruncate = sentences.length > lineLimit;
	const previewHtml = needsTruncate
		? `${sentences.slice(0, lineLimit).join(" ")}…`
		: sourceName;

	return (
		<div className="mt-3 p-3 border rounded-lg">
			{sourceImg && (
				<img
					src={sourceImg}
					alt="source"
					className="w-14 h-14 object-cover rounded-md mb-2"
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
								<button
									type="button"
									onClick={() => setExpanded(false)}
									className="text-gray-500 font-semibold hover:underline"
								>
									Хураах
								</button>
							)}
						</>
					) : (
						<span>
							<span
								dangerouslySetInnerHTML={{ __html: previewHtml! }}
								className="inline"
							/>
							<button
								type="button"
								onClick={() => setExpanded(true)}
								className="text-gray-500 font-semibold hover:underline inline"
							>
								дэлгэрэнгүй
							</button>
						</span>
					)}
				</div>
			)}
		</div>
	);
}
