"use client";

import { useEffect } from "react";

/**
 * Browser back товчийг бүрэн блоклох hook
 *
 * ЗААВАЛ: exam хуудас руу орохдоо router.replace ашиглах ёстой
 *   router.replace(`/exam/${selectedExamId}`)  ← push биш!
 *
 * router.replace → history-д өмнөх хуудас үлдэхгүй
 * useBlockNavigation → back дарах бүрт одоогийн URL-руу redirect
 */
export function useBlockNavigation(enabled = true) {
	useEffect(() => {
		if (!enabled) return;

		const currentUrl = window.location.href;

		// History stack-ийг одоогийн URL-аар дүүргэнэ (50 entry)
		// Ингэснээр back дарах бүрт энэ л хуудас руу "буцна"
		for (let i = 0; i < 50; i++) {
			history.pushState({ blocked: true }, "", currentUrl);
		}

		const handlePopState = (e: PopStateEvent) => {
			e.stopImmediatePropagation();
			// Дахин push хийж trap-т буцааж оруулна
			history.pushState({ blocked: true }, "", currentUrl);
			// Өөр хуудас руу яваад амжсан бол хүчээр буцаана
			if (window.location.href !== currentUrl) {
				window.location.replace(currentUrl);
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			// Alt + ← (back shortcut)
			if (e.altKey && e.key === "ArrowLeft") {
				e.preventDefault();
				e.stopImmediatePropagation();
				history.pushState({ blocked: true }, "", currentUrl);
			}
			// Backspace input-с гадуур (зарим browser-т back хийдэг)
			if (
				e.key === "Backspace" &&
				!(e.target instanceof HTMLInputElement) &&
				!(e.target instanceof HTMLTextAreaElement)
			) {
				e.preventDefault();
			}
		};

		// capture phase — Next.js router-с өмнө ажиллана
		window.addEventListener("popstate", handlePopState, true);
		window.addEventListener("keydown", handleKeyDown, true);

		return () => {
			window.removeEventListener("popstate", handlePopState, true);
			window.removeEventListener("keydown", handleKeyDown, true);
		};
	}, [enabled]);
}
