"use client";

import { memo, useCallback, useEffect, useRef } from "react";

interface MathContentProps {
	html: string;
	className?: string;
}

function MathContent({ html, className = "" }: MathContentProps) {
	const mathRef = useRef<HTMLDivElement>(null);
	const renderTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	// HTML preprocessing: Олон зайг цэвэрлэх
	const cleanHtml = useCallback((rawHtml: string) => {
		return (
			rawHtml
				// Олон дараалсан &nbsp; -г нэг зай болгох
				.replace(/(&nbsp;\s*)+/g, " ")
				// Олон дараалсан ердийн зайг нэг болгох
				.replace(/\s{2,}/g, " ")
				// Tag хооронд илүүдэл зай арилгах
				.replace(/>\s+</g, "><")
		);
	}, []);

	const renderMath = useCallback(async () => {
		if (!mathRef.current || !window.MathJax) return;

		try {
			// Clear previous timeout
			if (renderTimeoutRef.current) {
				clearTimeout(renderTimeoutRef.current);
			}

			// Debounce rendering for performance
			renderTimeoutRef.current = setTimeout(async () => {
				if (!mathRef.current || !window.MathJax) return;

				// Clear previous renders
				if (window.MathJax.typesetClear) {
					window.MathJax.typesetClear([mathRef.current]);
				}

				// Render MathJax
				if (window.MathJax.typesetPromise) {
					await window.MathJax.typesetPromise([mathRef.current]);
				}

				// Post-process containers
				const containers = mathRef.current.querySelectorAll("mjx-container");

				// Use requestAnimationFrame for better performance
				requestAnimationFrame(() => {
					containers.forEach((container: Element) => {
						const el = container as HTMLElement;
						const isDisplayMode = el.getAttribute("display") === "true";

						if (isDisplayMode) {
							// Display mode - блок хэлбэр (шинэ мөр)
							el.style.display = "block";
							el.style.maxWidth = "100%";
							el.style.overflow = "visible";
							el.style.margin = "1em auto";
						} else {
							// Inline mode - мөрөнд үргэлжилнэ
							el.style.display = "inline";
							el.style.maxWidth = "100%";
							el.style.verticalAlign = "middle";
							el.style.overflow = "visible";
							el.style.whiteSpace = "normal";
							el.style.margin = "0";
							el.style.padding = "0";
						}
					});
				});
			}, 100); // 100ms debounce
		} catch (err) {
			console.error("MathJax rendering error:", err);
		}
	}, []);

	useEffect(() => {
		if (window.MathJax?.startup?.promise) {
			window.MathJax.startup.promise.then(renderMath);
		} else {
			renderMath();
		}

		// Cleanup
		return () => {
			if (renderTimeoutRef.current) {
				clearTimeout(renderTimeoutRef.current);
			}
		};
	}, [renderMath]);

	const processedHtml = cleanHtml(html);

	return (
		<div
			ref={mathRef}
			dangerouslySetInnerHTML={{ __html: processedHtml }}
			className={`math-content text-gray-900 dark:text-gray-100 ${className}`}
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

// Custom comparison for better memoization
export default memo(MathContent, (prevProps, nextProps) => {
	return (
		prevProps.html === nextProps.html &&
		prevProps.className === nextProps.className
	);
});
