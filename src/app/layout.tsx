import type { ReactNode } from "react";
import "./globals.css";
import Script from "next/script";
import Providers from "@/app/Providers";

interface RootLayoutProps {
	children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="mn" suppressHydrationWarning>
			<head>
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
									typeset: false  // Changed: false илүү сайн performance
								},
								options: {
									skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
									ignoreHtmlClass: 'tex2jax_ignore',
									processHtmlClass: 'math-content'  // Changed: MathContent component-тэй тохирох
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
			</head>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
