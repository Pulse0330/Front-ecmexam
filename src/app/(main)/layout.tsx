import type { ReactNode } from "react";
import FixedScrollButton from "@/components/FixedScrollButton";
import { Navbar01 } from "@/components/iHeader";

interface MainLayoutProps {
	children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col">
			{/* Navbar */}
			<div className="sticky top-0 z-50 px-4 md:px-6 lg:px-8 pt-4">
				<Navbar01 />
			</div>

			{/* Main Content */}
			<main className="flex-1">
				<FixedScrollButton />
				{children}
			</main>
		</div>
	);
}
