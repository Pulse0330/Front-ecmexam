"use client";

import { useSessionChecker } from "@/hooks/use-SessionCheker";

export function SessionCheckerProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	// Session автоматаар шалгагдах болно
	useSessionChecker();

	return <>{children}</>;
}
