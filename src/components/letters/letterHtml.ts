"use client";

import DOMPurify from "dompurify";

// ============================================================================
// Backend-ээс ирсэн HTML-ийг аюулгүй болгох (XSS-ээс хамгаална)
// ============================================================================

const ALLOWED_TAGS = [
	"p", "br", "strong", "b", "em", "i", "u", "s", "a", "span",
	"ul", "ol", "li", "blockquote", "h2", "h3", "h4", "img",
];
const ALLOWED_ATTR = ["href", "src", "alt", "width", "height", "target", "rel"];

// Facebook-ийн дамжуулах холбоосыг (l.facebook.com/l.php?u=...) жинхэнэ хаяг руу задлана
function unwrapLink(href: string) {
	try {
		const url = new URL(href);
		if (/(^|\.)facebook\.com$/.test(url.hostname) && url.pathname === "/l.php") {
			const real = url.searchParams.get("u");
			if (real) {
				const target = new URL(real);
				target.searchParams.delete("fbclid");
				return target.toString();
			}
		}
	} catch {
		/* харьцангуй холбоос бол хэвээр */
	}
	return href;
}

let hooksReady = false;
function ensureHooks() {
	if (hooksReady) return;
	hooksReady = true;
	DOMPurify.addHook("afterSanitizeAttributes", (node) => {
		const el = node as Element;
		if (el.tagName === "A") {
			const href = el.getAttribute("href");
			if (href) el.setAttribute("href", unwrapLink(href));
			el.setAttribute("target", "_blank");
			el.setAttribute("rel", "noopener noreferrer");
		}
	});
}

export function sanitizeLetterHtml(html: string): string {
	if (typeof window === "undefined" || !html) return "";
	ensureHooks();
	const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });

	// Идэвхгүй баримт дээр боловсруулна (зураг ачаалагдахгүй, код ажиллахгүй)
	const doc = new DOMParser().parseFromString(`<body>${clean}</body>`, "text/html");
	for (const img of Array.from(doc.body.querySelectorAll("img"))) {
		const src = img.getAttribute("src") ?? "";
		const alt = img.getAttribute("alt") ?? "";
		const small = Number(img.getAttribute("width") ?? 999) <= 32;
		// Facebook-ийн emoji зургийг жинхэнэ emoji тэмдэгтээр солино
		if (alt && (src.includes("emoji.php") || small)) {
			img.replaceWith(doc.createTextNode(`${alt} `));
		} else {
			// Агуулга доторх том зургийг хасна — хавсралт хэсэгт тусад нь харагдана
			img.remove();
		}
	}
	return doc.body.innerHTML;
}

// ============================================================================
// HTML-ийг догол мөр бүрээр блок болгох
// ============================================================================
export interface HtmlBlock {
	tag: string;
	html: string;
}

const BLOCK_TAGS = new Set(["p", "ul", "ol", "blockquote", "h2", "h3", "h4"]);

const escapeHtml = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function htmlToBlocks(clean: string): HtmlBlock[] {
	if (!clean || typeof DOMParser === "undefined") return [];
	const doc = new DOMParser().parseFromString(`<body>${clean}</body>`, "text/html");
	const out: HtmlBlock[] = [];
	let loose = "";
	const flush = () => {
		if (loose.trim()) out.push({ tag: "p", html: loose.trim() });
		loose = "";
	};

	for (const node of Array.from(doc.body.childNodes)) {
		if (node.nodeType === Node.ELEMENT_NODE) {
			const el = node as HTMLElement;
			const tag = el.tagName.toLowerCase();
			if (BLOCK_TAGS.has(tag)) {
				flush();
				if (el.textContent?.trim()) out.push({ tag, html: el.innerHTML.trim() });
			} else {
				loose += el.outerHTML;
			}
		} else if (node.nodeType === Node.TEXT_NODE) {
			loose += escapeHtml(node.textContent ?? "");
		}
	}
	flush();
	return out;
}

// ============================================================================
// Урт догол мөрийг HTML tag-уудыг эвдэлгүйгээр үгээр хуваах
// ============================================================================
const VOID_TAGS = new Set(["br", "img", "hr", "wbr"]);
const tagName = (t: string) => t.match(/^<\/?([a-z0-9]+)/i)?.[1]?.toLowerCase() ?? "";

export function tokenizeHtml(html: string): string[] {
	return html
		.split(/(<[^>]+>)/)
		.flatMap((part) => (part.startsWith("<") ? [part] : part.split(/(\s+)/)))
		.filter((t) => t !== "");
}

export function countWords(tokens: string[]) {
	return tokens.filter((t) => !t.startsWith("<") && !/^\s+$/.test(t)).length;
}

// Эхний `words` үгийг (нээлттэй tag-уудыг хааж) head, үлдсэнийг (дахин нээж) tail болгоно
export function cutHtml(tokens: string[], words: number): [string, string] {
	const stack: string[] = [];
	let count = 0;
	let i = 0;
	for (; i < tokens.length; i++) {
		const t = tokens[i];
		if (t.startsWith("<")) {
			if (t.startsWith("</")) stack.pop();
			else if (!VOID_TAGS.has(tagName(t)) && !t.endsWith("/>")) stack.push(t);
			continue;
		}
		if (/^\s+$/.test(t)) continue;
		if (count === words) break;
		count++;
	}
	const close = [...stack].reverse().map((open) => `</${tagName(open)}>`).join("");
	const head = tokens.slice(0, i).join("").trimEnd() + close;
	const tail = stack.join("") + tokens.slice(i).join("").trimStart();
	return [head, tail];
}