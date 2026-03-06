"use client";

import { memo, useEffect, useRef } from "react";

interface MathContentProps {
	html: string;
}

function cleanHtml(raw: string): string {
	return raw
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

function MathContent({ html }: MathContentProps) {
	const mathRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const renderMath = async () => {
			if (mathRef.current && window.MathJax) {
				try {
					if (window.MathJax.typesetClear) {
						window.MathJax.typesetClear([mathRef.current]);
					}
					if (window.MathJax.typesetPromise) {
						await window.MathJax.typesetPromise([mathRef.current]);
					}
					const containers = mathRef.current.querySelectorAll("mjx-container");
					containers.forEach((container: Element) => {
						const el = container as HTMLElement;
						const hasTable = container.querySelector("mjx-mtable, mtable");
						if (hasTable) {
							el.style.display = "block";
							el.style.maxWidth = "100%";
							el.style.overflowX = "auto";
							el.style.overflowY = "hidden";
						} else {
							el.style.display = "block";
							el.style.maxWidth = "100%";
							el.style.overflow = "visible";
							el.style.whiteSpace = "normal";
						}
					});
				} catch (err) {
					console.error("MathJax rendering error:", err);
				}
			}
		};

		if (window.MathJax?.startup?.promise) {
			window.MathJax.startup.promise.then(renderMath);
		} else {
			renderMath();
		}
	}, []); // ✅ html шууд dependency болгох

	const cleanedHtml = cleanHtml(html); // render дотор тооцно

	return (
		<div
			ref={mathRef}
			dangerouslySetInnerHTML={{ __html: cleanedHtml }}
			className="math-content text-gray-900 dark:text-gray-100"
			style={{
				maxWidth: "100%",
				overflow: "visible",
				wordWrap: "break-word",
				overflowWrap: "break-word",
				display: "block",
			}}
		/>
	);
}

export default memo(MathContent);
