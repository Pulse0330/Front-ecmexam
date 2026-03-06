"use client";

import { memo } from "react";

interface HtmlContentProps {
	html: string;
	className?: string;
}

function HtmlContent({ html, className }: HtmlContentProps) {
	return (
<div
    dangerouslySetInnerHTML={{ __html: html }}
    className={className}
    style={{
        maxWidth: "100%",
        width: "100%",         // ✅ нэмэх
        wordWrap: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "normal",
    }}
/>
	);
}

export default memo(HtmlContent);