import { Inter, Roboto } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import Providers from "@/app/Providers";
import IdleTimerProvider from "@/components/timeLogOut";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin", "cyrillic"],
});
const _lobster = Roboto({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-roboto",
	display: "swap",
});
interface RootLayoutProps {
	children: ReactNode;
}

export const metadata: Metadata = {
	title: "Skuul",
	icons: {
		icon: "/image/logoLogin.png",
		apple: "/image/logoLogin.png",
	},
	description:
		"Онлайн сургалтын платформ | Онлайн сургалт | Сургалтын платформ | Сургалтын систем | Сургалтын портал | Сургалтын үйлчилгээ | Сургалтын шийдэл | Сургалтын програм | Сургалтын апп | Сургалтын платформ Монголд",
};

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="mn" suppressHydrationWarning>
			<body className={`${inter.variable} `} suppressHydrationWarning>
				<Script
					id="mathjax-config"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							window.MathJax = {
								tex: {
									inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
									displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
									processEscapes: true
								},
								mml: {
									parseNodes: true,
								},
								startup: {
									typeset: false
								},
								options: {
									skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
									ignoreHtmlClass: 'tex2jax_ignore',
									processHtmlClass: 'math-content'
								},
								chtml: {
									scale: 1,
									matchFontHeight: true,
									mtextInheritFont: true,
									merrorInheritFont: true,
									displayAlign: 'left',
									displayIndent: '0',
								},
								svg: {
									scale: 1,
									matchFontHeight: true,
									mtextInheritFont: true,
									merrorInheritFont: true,
									displayAlign: 'left',
									displayIndent: '0',
								}
							};
						`,
					}}
				/>
				<Script
					src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
					strategy="beforeInteractive"
					id="mathjax-script"
				/>
				<Providers>
					<IdleTimerProvider>
						<Suspense fallback={null}>{children}</Suspense>
					</IdleTimerProvider>
				</Providers>
			</body>
		</html>
	);
}
