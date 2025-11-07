import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/app/Providers";

interface RootLayoutProps {
	children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="mn" suppressHydrationWarning>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
