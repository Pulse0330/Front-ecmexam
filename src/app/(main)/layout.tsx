import type { ReactNode } from "react";
import FixedScrollButton from "@/components/FixedScrollButton";
import { Navbar01 } from "@/components/iHeader";
import ServerDate from "@/components/serverDate";

interface MainLayoutProps {
	children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<div className="bg-page-gradient ">
			<div className=" sticky top-0 z-50 px-4 md:px-6 lg:px-8 pt-4 ">
				<Navbar01 />
			</div>
			<main className="relative">
				<div>
					<FixedScrollButton />
				</div>
				{children}
				<div className="fixed bottom-4 ">
					<ServerDate />
				</div>
			</main>
		</div>
	);
}
