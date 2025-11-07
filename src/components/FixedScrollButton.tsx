"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	scrollThreshold?: number;
	bottomOffset?: number;
};

export default function FixedScrollButton({
	scrollThreshold: scrollThresholdProp,
	bottomOffset: bottomOffsetProp,
}: Props) {
	const scrollThreshold = scrollThresholdProp ?? 300;
	const bottomOffset = bottomOffsetProp ?? 100;

	const [showButton, setShowButton] = useState(false);
	const [isAtTop, setIsAtTop] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const checkScrollable = () =>
			document.documentElement.scrollHeight > window.innerHeight + 50;

		const handleScroll = () => {
			const scrollY = window.scrollY;

			const scrollable = checkScrollable();

			if (!scrollable) {
				setShowButton(false);
				return;
			}

			const atTop = scrollY < scrollThreshold;

			// дээд хэсэгт байвал доошоо icon, бусад үед дээшээ icon
			if (atTop) setIsAtTop(true);
			else setIsAtTop(false);

			setShowButton(true);
		};

		const handleResize = () => handleScroll();

		handleScroll();
		window.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleResize);
		};
	}, [scrollThreshold, bottomOffset]);

	const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
	const scrollToBottom = () =>
		window.scrollTo({
			top: document.documentElement.scrollHeight,
			behavior: "smooth",
		});

	if (!showButton) return null;

	return (
		<Button
			variant="default"
			size="icon"
			onClick={isAtTop ? scrollToBottom : scrollToTop}
			className={`fixed bottom-6 right-6 z-40 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
				isAtTop ? "bg-primary " : ""
			}`}
			aria-label={isAtTop ? "Scroll to bottom" : "Scroll to top"}
		>
			{isAtTop ? (
				<ArrowDown className="h-5 w-5 " />
			) : (
				<ArrowUp className="h-5 w-5" />
			)}
		</Button>
	);
}
