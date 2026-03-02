import type { ReactNode } from "react";
import { IDashboardHeader } from "@/components/iDashboardHeader";

interface MainLayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: MainLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col">
			{/* Navbar */}
			<div className="sticky top-0 z-50 container pt-4 mx-auto">
				<IDashboardHeader />
			</div>

			{/* Main Content */}
			<main className="flex-1  container mx-auto px-4">{children}</main>
		</div>
	);
}
