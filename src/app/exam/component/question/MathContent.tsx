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
					if (window.MathJax.typesetClear) {
						window.MathJax.typesetClear([mathRef.current]);
					}
					await window.MathJax.typesetPromise?.([mathRef.current]);

					// mjx-mspace-ийг олж <br> нэмэх
					const mspaces = mathRef.current.querySelectorAll("mjx-mspace");
					mspaces.forEach((mspace) => {
						const br = document.createElement("br");
						mspace.parentNode?.insertBefore(br, mspace);
						mspace.remove();
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
	}, []);

	return (
		<div
			ref={mathRef}
			dangerouslySetInnerHTML={{ __html: html }}
			className="math-content text-gray-900 dark:text-gray-100"
			style={{
				display: "block",
				width: "100%",
				maxWidth: "100%",
			}}
		/>
	);
}

export default memo(MathContent);
