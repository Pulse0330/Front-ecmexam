import { Google_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { AdminLayoutShell } from "@/components/admin-layout-shell";

const adminFont = Google_Sans({
	subsets: ["latin", "cyrillic"],
	display: "swap",
});

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<div className={adminFont.className}>
			<AdminLayoutShell>{children}</AdminLayoutShell>
		</div>
	);
}
