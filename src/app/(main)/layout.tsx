import FixedScrollButton from "@/components/FixedScrollButton";
import { Navbar01 } from "@/components/iHeader";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="">
      <div>
        <Navbar01 />
      </div>
      <main>
        <FixedScrollButton />
        {children}
      </main>
    </div>
  );
}
