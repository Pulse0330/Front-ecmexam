import type { ReactNode } from "react";
import { Navbar01 } from "@/components/iHeader";

interface MainLayoutProps {
	children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col">
			<div className="sticky top-0 z-50 px-4 md:px-6 lg:px-8 pt-4">
				<Navbar01 />
			</div>

			<main className="flex-1">{children}</main>
		</div>
	);
}
