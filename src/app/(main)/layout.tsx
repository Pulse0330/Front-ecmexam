import type { ReactNode } from "react";
import AnimatedBackground from "@/components/animetedBackground";
import { Navbar01 } from "@/components/iHeader";

interface MainLayoutProps {
	children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col relative overflow-hidden bg-linear-to-br from-background via-muted/30 to-background">
			<AnimatedBackground />
			<div className="  container mx-auto sticky top-0 z-50 px-4 md:px-6 lg:px-8 pt-4">
				<Navbar01 />
			</div>
			<main className=" container mx-auto flex-1 relative z-10">
				{children}
			</main>
		</div>
	);
}
