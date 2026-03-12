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

// ---- Types ----
interface Answer {
	answer_id: number;
	answer_name_html: string;
	refid: number;
	answer_type: number;
	ref_child_id: number | null;
	answer_descr?: string;
}

interface QuestionRowProps {
	questionNumber: number;
	questionHtml: string;
	answers: Answer[];
	// Pass correct answer refid if known (optional)
	correctRefId?: number | null;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function QuestionRow({
	questionNumber,
	questionHtml,
	answers,
	correctRefId,
}: QuestionRowProps) {
	// Filter only selectable answers (answer_type === 1, ref_child_id === null)
	const choices = answers.filter(
		(a) => a.answer_type === 1 && a.ref_child_id === null,
	);

	// Matching-type answers (answer_type === 6)
	const matchQuestions = answers.filter(
		(a) => a.answer_type === 6 && a.answer_descr === "Асуулт ",
	);
	const matchAnswers = answers.filter(
		(a) => a.answer_type === 6 && a.answer_descr === "Хариулт",
	);

	const isMatchType = matchQuestions.length > 0;

	return (
		<div className="w-full py-4 border-b border-border last:border-0">
			{/* Question header */}
			<div className="flex flex-row items-start gap-3 mb-3">
				<span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
					{questionNumber}
				</span>
				<div className="flex-1 text-sm leading-relaxed">
					<MathContent html={questionHtml} />
				</div>
			</div>

			{/* Multiple choice answers */}
			{!isMatchType && choices.length > 0 && (
				<div className="ml-10 flex flex-col gap-1.5">
					{choices.map((choice, idx) => {
						const label = OPTION_LABELS[idx] ?? String(idx + 1);
						const isCorrect =
							correctRefId != null && choice.refid === correctRefId;
						return (
							<div
								key={choice.answer_id}
								className={`flex items-start gap-2 px-3 py-1.5 rounded-md text-sm transition-colors
                  ${
										isCorrect
											? "bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-800 dark:text-green-300 font-medium"
											: "bg-muted/50 hover:bg-muted"
									}`}
							>
								<span
									className={`shrink-0 font-semibold w-5 text-center
                    ${isCorrect ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
								>
									{label}
								</span>
								<MathContent html={choice.answer_name_html} />
							</div>
						);
					})}
				</div>
			)}

			{/* Matching type */}
			{isMatchType && (
				<div className="ml-10 mt-2">
					<div className="grid grid-cols-2 gap-3">
						<div>
							<p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
								Үгс
							</p>
							{matchQuestions.map((q) => (
								<div
									key={q.answer_id}
									className="flex items-center gap-2 px-3 py-1.5 mb-1 bg-muted/50 rounded-md text-sm"
								>
									<span className="text-muted-foreground font-semibold w-4 shrink-0">
										{q.refid}.
									</span>
									<MathContent html={q.answer_name_html} />
								</div>
							))}
						</div>
						<div>
							<p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
								Тайлбар
							</p>
							{matchAnswers.map((a) => (
								<div
									key={a.answer_id}
									className="flex items-center gap-2 px-3 py-1.5 mb-1 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm"
								>
									<span className="text-blue-500 font-semibold w-4 shrink-0">
										{a.refid}.
									</span>
									<MathContent html={a.answer_name_html} />
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export { MathContent, QuestionRow };
export default memo(MathContent);
