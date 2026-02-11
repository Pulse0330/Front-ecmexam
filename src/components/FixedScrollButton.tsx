"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
	scrollThreshold?: number;
};

export default function FixedScrollButton({
	scrollThreshold: scrollThresholdProp,
}: Props) {
	const scrollThreshold = scrollThresholdProp ?? 300;

	const [showButton, setShowButton] = useState(false);
	const [isAtTop, setIsAtTop] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const checkScrollable = () => {
			const scrollHeight = document.documentElement.scrollHeight;
			const clientHeight = window.innerHeight;
			// Хэрэв хуудас scroll хийгдэх боломжгүй бол
			return scrollHeight > clientHeight + 50;
		};

		const handleScroll = () => {
			const scrollable = checkScrollable();

			// Хэрэв scroll хийгдэхгүй бол товчийг нуух
			if (!scrollable) {
				setShowButton(false);
				return;
			}

			const scrollY = window.scrollY;
			const scrollHeight = document.documentElement.scrollHeight;
			const clientHeight = window.innerHeight;

			// Доод хэсэгт хүрсэн эсэхийг шалгах (сүүлийн 100px-д байвал)
			const isNearBottom = scrollY + clientHeight >= scrollHeight - 100;

			// Дээд хэсэгт байгаа эсэхийг шалгах
			const atTop = scrollY < scrollThreshold;

			// Хэрэв хамгийн доод хэсэгт байвал товчийг нуух
			if (isNearBottom) {
				setShowButton(false);
				return;
			}

			// Товчийг харуулах
			setShowButton(true);

			// Icon солих - дээд хэсэгт байвал доошоо, бусад үед дээшээ
			setIsAtTop(atTop);
		};

		const handleResize = () => {
			handleScroll();
		};

		// Анхны шалгалт
		handleScroll();

		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleResize);
		};
	}, [scrollThreshold]);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const scrollToBottom = () => {
		window.scrollTo({
			top: document.documentElement.scrollHeight,
			behavior: "smooth",
		});
	};

	if (!showButton) return null;

	return (
		<Button
			variant="default"
			size="icon"
			onClick={isAtTop ? scrollToBottom : scrollToTop}
			className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
			aria-label={isAtTop ? "Доошоо гүйлгэх" : "Дээшээ гүйлгэх"}
		>
			{isAtTop ? (
				<ArrowDown className="h-5 w-5" />
			) : (
				<ArrowUp className="h-5 w-5" />
			)}
		</Button>
	);
}
