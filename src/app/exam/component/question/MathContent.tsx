"use client";

import { memo, useEffect, useRef } from "react";

interface MathContentProps {
	html: string;
}

function MathContent({ html }: MathContentProps) {
	const contentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const renderMath = async () => {
			if (!contentRef.current) return;

			try {
				// MathJax байгаа бол render хийх
				if (window.MathJax) {
					if (window.MathJax.typesetClear) {
						window.MathJax.typesetClear([contentRef.current]);
					}
					if (window.MathJax.typesetPromise) {
						await window.MathJax.typesetPromise([contentRef.current]);
					}

					// mjx-mspace элементүүдийг <br> болгох
					const mspaces = contentRef.current.querySelectorAll("mjx-mspace");
					mspaces.forEach((mspace) => {
						try {
							const br = document.createElement("br");
							if (mspace.parentNode) {
								mspace.parentNode.insertBefore(br, mspace);
								mspace.remove();
							}
						} catch (err) {
							console.warn("Error processing mjx-mspace:", err);
						}
					});
				}
			} catch (err) {
				console.error("MathJax rendering error:", err);
			}
		};

		// MathJax initialization
		if (window.MathJax?.startup?.promise) {
			window.MathJax.startup.promise.then(renderMath).catch(console.error);
		} else {
			renderMath();
		}
	}, []);

	// HTML-ийн урт хязгаарлах (DOS халдлагаас хамгаалах)
	const sanitizedHtml = html.length > 100000 ? html.substring(0, 100000) : html;

	return (
		<div
			ref={contentRef}
			dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
			className="math-content"
		/>
	);
}

export default memo(MathContent);
