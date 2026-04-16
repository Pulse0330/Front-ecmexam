"use client";

import { memo, useEffect, useRef } from "react";

interface MathContentProps {
	html: string;
}

function cleanHtml(raw: string): string {
	if (!raw) return "";
	return raw
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/(<m[a-z]+[^>]*>)\s*О\s*(<\/m[a-z]+>)/g, "$1O$2");
}

const MathContentComponent = ({ html }: MathContentProps) => {
	const mathRef = useRef<HTMLDivElement>(null);

	// ✅ MathJax script-ийг нэг удаа динамикаар оруулна
	useEffect(() => {
		if (document.getElementById("MathJax-script")) return;

		const script = document.createElement("script");
		script.id = "MathJax-script";
		script.type = "text/javascript";
		script.async = true;
		script.src =
			"https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.js";
		document.head.appendChild(script);
	}, []);

	useEffect(() => {
		let isMounted = true;

		const renderMath = async () => {
			setTimeout(async () => {
				if (!mathRef.current || !window.MathJax || !isMounted) return;

				try {
					const cleaned = cleanHtml(html);
					mathRef.current.innerHTML = cleaned;

					if (window.MathJax.typesetClear) {
						await window.MathJax.typesetClear([mathRef.current]);
					}

					if (window.MathJax.typesetPromise) {
						await window.MathJax.typesetPromise([mathRef.current]);
					}

					if (!isMounted) return;
					const containers = mathRef.current.querySelectorAll("mjx-container");
					containers.forEach((container: Element) => {
						const el = container as HTMLElement;
						const hasMatrix = !!container.querySelector("mjx-mtable, mtable");
						if (hasMatrix) {
							el.style.display = "block";
							el.style.overflowX = "auto";
							el.style.margin = "8px 0";
						} else {
							el.style.display = "inline-block";
							el.style.verticalAlign = "middle";
						}
					});
				} catch (err) {
					console.error("MathJax rendering error:", err);
				}
			}, 100);
		};

		renderMath();

		return () => {
			isMounted = false;
		};
	}, [html]);

	return (
		<div
			ref={mathRef}
			dangerouslySetInnerHTML={{ __html: cleanHtml(html) }}
			className="math-content block w-full"
			style={{ minHeight: "1.2em", lineHeight: "1.6" }}
		/>
	);
};

export const MathContent = memo(MathContentComponent);
export default MathContent;
