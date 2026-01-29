"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
	return (
		<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
			<QueryClientProvider client={queryClient}>
				{children}
				{/* <SessionCheckerProvider>{children}</SessionCheckerProvider> */}
				<Toaster position="top-right" richColors />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
