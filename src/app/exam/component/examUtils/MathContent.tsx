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
						el.style.display = "block";
						el.style.maxWidth = "100%";
						el.style.overflow = hasTable ? "auto" : "visible";
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
			dangerouslySetInnerHTML={{ __html: cleanHtml(html) }}
			className="math-content text-gray-900 dark:text-gray-100"
			style={{
				maxWidth: "100%",
				overflow: "visible",
				overflowWrap: "break-word",
			}}
		/>
	);
}

// ✅ Асуулт + Хариулт хажуу тал layout
interface QuestionRowProps {
	questionNumber: number;
	questionHtml: string;
	solutionHtml?: string;
}

function QuestionRow({
	questionNumber,
	questionHtml,
	solutionHtml,
}: QuestionRowProps) {
	return (
		<div className="flex flex-row items-start gap-6 w-full py-3">
			{/* Зүүн тал: дугаар + асуулт */}
			<div className="flex flex-row items-start gap-2 flex-1 min-w-0">
				<span className="bg-blue-500 text-white rounded-md px-2 py-0.5 text-sm font-semibold shrink-0 mt-0.5">
					{questionNumber}
				</span>
				<MathContent html={questionHtml} />
			</div>

			{/* Баруун тал: хариулт */}
			{solutionHtml && (
				<div className="flex-1 min-w-0 border-l border-gray-200 dark:border-gray-700 pl-4">
					<MathContent html={solutionHtml} />
				</div>
			)}
		</div>
	);
}

export { MathContent, QuestionRow };
export default memo(MathContent);
