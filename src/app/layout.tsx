import { Inter } from "next/font/google"; // ✅ Roboto устгах
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

interface RootLayoutProps {
	children: ReactNode;
}

export const metadata: Metadata = {
	title: "Skuul",
	icons: {
		icon: "/image/logoLogin.png",
		apple: "/image/logoLogin.png",
	},
	description: "Онлайн сургалтын платформ | Онлайн сургалт | ...",
};

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="mn" suppressHydrationWarning>
			<body className={inter.variable} suppressHydrationWarning>
				{/* ✅ MathJax config — afterInteractive болгох */}
				<Script
					id="mathjax-config"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
              window.MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                  displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                  processEscapes: true
                },
                startup: { typeset: false },
                options: {
                  skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                  ignoreHtmlClass: 'tex2jax_ignore',
                  processHtmlClass: 'math-content'
                },
                chtml: {
                  scale: 1,
                  matchFontHeight: true,
                  mtextInheritFont: true,
                  displayAlign: 'left',
                  displayIndent: '0',
                },
              };
            `,
					}}
				/>
				{/* ✅ MathJax script — afterInteractive, config дараа ачаалагдана */}
				<Script
					src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
					strategy="afterInteractive"
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
