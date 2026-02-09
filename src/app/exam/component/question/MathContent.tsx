"use client";

import { memo, useCallback, useEffect, useRef } from "react";

interface MathContentProps {
	html: string;
	className?: string;
}

function MathContent({ html, className = "" }: MathContentProps) {
	const mathRef = useRef<HTMLDivElement>(null);
	const renderTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
						const hasTable = container.querySelector("mjx-mtable, mtable");

						if (hasTable) {
							// Table: horizontal scroll
							el.style.display = "block";
							el.style.maxWidth = "100%";
							el.style.overflowX = "auto";
							el.style.overflowY = "hidden";
						} else {
							// Regular: wrap
							el.style.display = "inline-block";
							el.style.maxWidth = "100%";
							el.style.overflow = "visible";
							el.style.whiteSpace = "normal";
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

	return (
		<div
			ref={mathRef}
			dangerouslySetInnerHTML={{ __html: html }}
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
