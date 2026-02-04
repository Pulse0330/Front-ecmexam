"use client";

import { memo, useEffect, useRef } from "react";

interface MathContentProps {
	html: string;
}

function MathContent({ html }: MathContentProps) {
	const mathRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const renderMath = async () => {
			if (mathRef.current && window.MathJax) {
				try {
					// MathJax typesetClear хэрэглэх
					if (window.MathJax.typesetClear) {
						window.MathJax.typesetClear([mathRef.current]);
					}

					// MathJax typesetPromise хэрэглэх
					if (window.MathJax.typesetPromise) {
						await window.MathJax.typesetPromise([mathRef.current]);
					}

					// Container-уудыг wrap болгох
					const containers = mathRef.current.querySelectorAll("mjx-container");
					containers.forEach((container: Element) => {
						const el = container as HTMLElement;

						// Table шалгах
						const hasTable = container.querySelector("mjx-mtable, mtable");

						if (hasTable) {
							// Table бол horizontal scroll
							el.style.display = "block";
							el.style.maxWidth = "100%";
							el.style.overflowX = "auto";
							el.style.overflowY = "hidden";
						} else {
							// Энгийн томьёо бол wrap
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
	}, []); // html dependency нэмсэн

	return (
		<div
			ref={mathRef}
			dangerouslySetInnerHTML={{ __html: html }}
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
