"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 0,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
		},
	},
});

export default function Providers({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const handler = (event: ErrorEvent) => {
			if (
				event.message.includes("ChunkLoadError") ||
				/Loading chunk [\d]+ failed/.test(event.message)
			) {
				window.location.reload(); // Хуудсыг автоматаар дахин ачаална
			}
		};

		window.addEventListener("error", handler, true);
		return () => window.removeEventListener("error", handler, true);
	}, []);
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem={false}>
			<QueryClientProvider client={queryClient}>
				{children}
				{/* <SessionCheckerProvider>{children}</SessionCheckerProvider> */}
				<Toaster position="top-right" richColors />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
