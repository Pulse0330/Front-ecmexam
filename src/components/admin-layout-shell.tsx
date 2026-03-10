"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IAdminHeader } from "@/components/iAdminHeader";

interface AdminLayoutShellProps {
  children: ReactNode;
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith("/admin-exam/");

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && (
        <div className="sticky top-0 z-50 container pt-4 mx-auto">
          <IAdminHeader />
        </div>
      )}
      <main className="container mx-auto flex-1">{children}</main>
    </div>
  );
}
