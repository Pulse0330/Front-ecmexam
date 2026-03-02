"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Зам шалгах hook
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: LucideIcon;
	}[];
}) {
	const pathname = usePathname(); // Одоогийн URL-ийг авах

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					{items.map((item) => {
						// Одоогийн зам item.url-тэй тохирч байгааг шалгах
						const isActive = pathname === item.url;

						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									tooltip={item.title}
									asChild
									isActive={isActive} // Shadcn-ий SidebarMenuButton-д isActive prop байдаг
								>
									<Link
										href={item.url}
										// Хэрэв isActive prop ажиллахгүй бол className-ээр гараар өнгө өгч болно
										className={
											isActive
												? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
												: ""
										}
									>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
