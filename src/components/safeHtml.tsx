// src/components/SafeHtml.tsx
"use client";

import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { useMemo } from "react";

export default function SafeHtml({ html }: { html: string }) {
	const clean = useMemo(() => {
		if (!html) return "";

		// 1) sanitize ашиглана (DOMPurify default профайлыг html-д тохируулсан)
		// USE_PROFILES: { html: true } нь зөв тохиргоо бөгөөд TypeScript-д таарна
		try {
			return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
		} catch {
			// ямар нэгэн шалгуур тасалсан бол original-ийг буцаана (мэдэгдэл шаардлагатай)
			return html;
		}
	}, [html]);

	return (
		<div className="html-safe overflow-x-auto max-w-full">
			{parse(clean || "")}
			<style jsx>{`
        .html-safe {
          word-break: break-word;
        }
        .html-safe img {
          max-width: 100%;
          height: auto;
        }
        .html-safe table {
          width: 100%;
          max-width: 100%;
          border-collapse: collapse;
        }
        .html-safe th,
        .html-safe td {
          border: 1px solid #e5e7eb; /* gray-200 */
          padding: 6px;
        }
      `}</style>
		</div>
	);
}
