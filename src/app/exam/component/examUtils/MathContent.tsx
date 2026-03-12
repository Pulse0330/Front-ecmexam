"use client";

import { memo, useEffect, useRef } from "react";

// ---- Helpers ----
interface MathContentProps {
	html: string;
}

function cleanHtml(raw: string): string {
	return (
		raw
			.replace(/&nbsp;/g, " ")
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			// MathML дотор Cyrillic О → Latin O
			.replace(/(<m[a-z]+[^>]*>)\s*О\s*(<\/m[a-z]+>)/g, "$1O$2")
	);
}

// ---- MathContent ----
function MathContent({ html }: MathContentProps) {
	const mathRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: html өөрчлөгдөхөд MathJax дахин render хийх шаардлагатай
	useEffect(() => {
		const renderMath = async () => {
			if (!mathRef.current || !window.MathJax) return;
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
					const hasMatrix = !!container.querySelector("mjx-mtable, mtable");
					// MathJax 3 CHTML → "true", SVG → "block"
					const isDisplayMode =
						el.getAttribute("display") === "true" ||
						el.getAttribute("display") === "block";

					if (hasMatrix || isDisplayMode) {
						el.style.cssText = "";
						el.style.display = "block";
						el.style.overflowX = "auto"; // scroll зөвхөн матриц дээр
						el.style.maxWidth = "100%";
						el.style.margin = "8px 0";
					} else {
						el.style.cssText = "";
						el.style.display = "inline-flex";
						el.style.alignItems = "center";
						el.style.verticalAlign = "middle";
						el.style.overflow = "visible"; // inline scroll үүсгэхгүй
						el.style.maxWidth = "100%";
					}
				});
			} catch (err) {
				console.error("MathJax rendering error:", err);
			}
		};

		if (window.MathJax?.startup?.promise) {
			window.MathJax.startup.promise.then(renderMath);
		} else {
			renderMath();
		}
	}, [html]); // html өөрчлөгдөхөд дахин render

	return (
		<div
			ref={mathRef}
			dangerouslySetInnerHTML={{ __html: cleanHtml(html) }}
			className="math-content text-gray-900 dark:text-gray-100"
			style={{
				width: "100%",
				maxWidth: "100%",
				overflow: "visible", // wrapper дээр scroll үгүй
				overflowWrap: "break-word",
				wordBreak: "break-word",
				lineHeight: "1.8",
			}}
		/>
	);
}

// ---- Types ----
interface Answer {
	answer_id: number;
	answer_name: string;
	answer_name_html: string;
	refid: number;
	answer_type: number;
	ref_child_id: number | null;
	answer_descr?: string;
}

interface QuestionRowProps {
	questionNumber: number;
	questionHtml: string;
	questionImageUrl?: string;
	answers: Answer[];
	correctRefId?: number | null;
	points?: number;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ---- QuestionRow ----
function QuestionRow({
	questionNumber,
	questionHtml,
	questionImageUrl,
	answers,
	correctRefId,
	points,
}: QuestionRowProps) {
	const choices = answers.filter(
		(a) => a.answer_type === 1 && a.ref_child_id === null,
	);

	const matchQuestions = answers.filter(
		(a) => a.answer_type === 6 && a.answer_descr === "Асуулт ",
	);
	const matchAnswers = answers.filter(
		(a) => a.answer_type === 6 && a.answer_descr === "Хариулт",
	);

	const fillBlanks = answers.filter((a) => a.answer_type === 3);

	const isMatchType = matchQuestions.length > 0;
	const isFillType = fillBlanks.length > 0 && choices.length === 0;

	return (
		<div className="w-full py-5 border-b border-border last:border-0">
			{/* ── Question header ── */}
			<div className="flex flex-row gap-3 mb-3 items-start">
				<div className="flex flex-col items-center shrink-0 gap-1">
					<span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
						{questionNumber}
					</span>
					{points !== undefined && (
						<span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
							{points} оноо
						</span>
					)}
				</div>

				{/* overflow: visible — scroll mjx-container дээр л үүснэ */}
				<div className="flex-1 min-w-0 text-sm leading-relaxed overflow-visible">
					<MathContent html={questionHtml} />

					{questionImageUrl && (
						<img
							src={questionImageUrl}
							alt={`Бодлого ${questionNumber}`}
							className="mt-2 max-w-full h-auto rounded-md border border-border"
							style={{ maxHeight: 320 }}
						/>
					)}
				</div>
			</div>

			{/* ── Multiple choice ── */}
			{!isMatchType && !isFillType && choices.length > 0 && (
				<div className="ml-10 flex flex-col gap-1.5">
					{choices.map((choice, idx) => {
						const label = OPTION_LABELS[idx] ?? String(idx + 1);
						const isCorrect =
							correctRefId != null && choice.refid === correctRefId;
						return (
							<div
								key={choice.answer_id}
								className={`flex items-start gap-2 px-3 py-2 rounded-md text-sm transition-colors
                  ${
										isCorrect
											? "bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-800 dark:text-green-300 font-medium"
											: "bg-muted/50 hover:bg-muted"
									}`}
							>
								<span
									className={`shrink-0 font-semibold w-5 text-center pt-0.5
                    ${isCorrect ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
								>
									{label}
								</span>
								<div className="flex-1 min-w-0 overflow-visible">
									<MathContent html={choice.answer_name_html} />
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* ── Fill-in-the-blank ── */}
			{isFillType && (
				<div className="ml-10 mt-2">
					<p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
						Хариулт
					</p>
					<div className="flex flex-wrap gap-2">
						{fillBlanks.map((blank) => (
							<div
								key={blank.answer_id}
								className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md text-sm"
							>
								<span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
									{blank.answer_name}:
								</span>
								<MathContent html={blank.answer_name_html} />
							</div>
						))}
					</div>
				</div>
			)}

			{/* ── Matching ── */}
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
									className="flex items-start gap-2 px-3 py-1.5 mb-1 bg-muted/50 rounded-md text-sm"
								>
									<span className="text-muted-foreground font-semibold w-5 shrink-0 pt-0.5">
										{q.refid}.
									</span>
									<div className="flex-1 min-w-0 overflow-visible">
										<MathContent html={q.answer_name_html} />
									</div>
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
									className="flex items-start gap-2 px-3 py-1.5 mb-1 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm"
								>
									<span className="text-blue-500 font-semibold w-5 shrink-0 pt-0.5">
										{a.refid}.
									</span>
									<div className="flex-1 min-w-0 overflow-visible">
										<MathContent html={a.answer_name_html} />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// ---- Exports ----
export { MathContent, QuestionRow };
export default memo(MathContent);
