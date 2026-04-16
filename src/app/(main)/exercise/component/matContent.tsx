"use client";

import { memo, useEffect, useRef } from "react";

interface MathContentProps {
	html: string;
}

/**
 * HTML доторх тусгай тэмдэгтүүдийг цэвэрлэх функц
 */
function cleanHtml(raw: string): string {
	if (!raw) return "";
	return (
		raw
			.replace(/&nbsp;/g, " ")
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			// Том "О" үсгийг математик "O" (Oxygen/Origin) болгож засах (шаардлагатай бол)
			.replace(/(<m[a-z]+[^>]*>)\s*О\s*(<\/m[a-z]+>)/g, "$1O$2")
	);
}

const MathContentComponent = ({ html }: MathContentProps) => {
	const mathRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let isMounted = true;

		const renderMath = async () => {
			// React-ийн DOM шинэчлэлт болон анимаци дуустал бага зэрэг хүлээх
			// Сонголт хийх үед үүсдэг "эвдрэл"-ээс сэргийлнэ
			setTimeout(async () => {
				if (!mathRef.current || !window.MathJax || !isMounted) return;

				try {
					// 1. React-ийн дарж бичсэн байж болзошгүй HTML-ийг өөрийнхөөрөө дахин оноох
					const cleaned = cleanHtml(html);
					mathRef.current.innerHTML = cleaned;

					// 2. MathJax-ийн өмнөх кэшийг тухайн элемент дээр цэвэрлэх
					if (window.MathJax.typesetClear) {
						await window.MathJax.typesetClear([mathRef.current]);
					}

					// 3. Шинээр хөрвүүлэлт хийх
					if (window.MathJax.typesetPromise) {
						await window.MathJax.typesetPromise([mathRef.current]);
					}

					// 4. Матриц болон томьёоны стилийг баталгаажуулах
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
			}, 100); // 100ms нь Fast Refresh болон Сонголт хийх үед хамгийн тогтвортой байдаг
		};

		renderMath();

		return () => {
			isMounted = false;
		};
	}, [html]); // Хамаарал нь тогтмол [html] байна

	return (
		<div
			ref={mathRef}
			// Анхны рендерт зориулж (SEO/Layout shift-ээс сэргийлж) innerHTML-ийг онооно
			dangerouslySetInnerHTML={{ __html: cleanHtml(html) }}
			className="math-content block w-full"
			style={{ minHeight: "1.2em", lineHeight: "1.6" }}
		/>
	);
};

// Memo ашиглан шаардлагагүй дахин рендерээс сэргийлнэ
// Default export болон Named export хоёуланг нь гаргаж байна (Import алдаанаас сэргийлнэ)
export const MathContent = memo(MathContentComponent);
export default MathContent;
