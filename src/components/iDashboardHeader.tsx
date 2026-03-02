"use client";

import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { LogOut, Menu, User, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import ServerDate from "@/components/serverDate";
import { Accordion } from "@/components/ui/accordion";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

const menuItems = [
	{ title: "Өрөө", href: "/room" },
	{ title: "Хувиар", href: "/exam-schedule" },
	{ title: "Шалгалт бүртгэх", href: "/exam-create" },
];

export function IDashboardHeader() {
	const [open, setOpen] = React.useState(false);
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const router = useRouter();
	const { user, firstname, imgUrl, clearAuth } = useAuthStore();

	const userInfo = React.useMemo(
		() => ({
			userName: user?.fname || firstname || "Хэрэглэгч",
			userImage: imgUrl || user?.img_url || "",
			schoolName: user?.sch_name || "",
			studentGroup: user?.studentgroupname || "",
		}),
		[user, firstname, imgUrl],
	);

	const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

	const handleLogout = async () => {
		try {
			const cookiesToRemove = ["auth-token", "user-id", "firstname", "img-url"];

			cookiesToRemove.forEach((cookie) => {
				Cookies.remove(cookie, { path: "/" });
			});

			clearAuth();

			sessionStorage.clear();

			queryClient.clear();

			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);

			window.location.href = "/login";
		}
	};

	const isActive = (path: string) => pathname === path;

	return (
		<header className="w-full border bg-background/95 backdrop-blur rounded-2xl shadow-lg relative z-50 max-w-7xl mx-auto">
			<div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
				{/* 1. Logo */}
				<Link href="/" className="flex items-center gap-2 shrink-0">
					<Image
						src="/image/logoLogin.png"
						alt="ECM Logo"
						width={40}
						height={40}
						className="object-contain"
						priority
					/>
				</Link>

				{/* 2. Desktop Navigation (Hidden on Mobile) */}
				<div className="hidden lg:block">
					<NavigationMenu delayDuration={0}>
						<NavigationMenuList>
							{menuItems.map((item) => (
								<NavigationMenuItem key={item.title}>
									{
										<Link
											href={item.href || "#"}
											className={navigationMenuTriggerStyle()}
										>
											{item.title}
										</Link>
									}
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				<div className="flex items-center gap-2">
					{/* 3. User Dropdown & Theme Toggle */}
					<div className="flex items-center gap-2">
						<div className="hidden sm:block">
							<ServerDate />
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="gap-2 px-2 md:px-3 h-10">
									<UserAvatar
										userImage={userInfo.userImage}
										userName={userInfo.userName}
										size="sm"
										showOnlineStatus
									/>
									<span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
										{userInfo.userName}
									</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-64">
								<DropdownMenuLabel>
									<div className="flex items-center gap-3">
										<UserAvatar
											userImage={userInfo.userImage}
											userName={userInfo.userName}
											size="md"
										/>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold truncate">
												{userInfo.userName}
											</p>
											<p className="text-xs text-muted-foreground truncate">
												{userInfo.schoolName}
											</p>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<div className="px-2 py-1.5">
									<AnimatedThemeToggler />
								</div>
								<DropdownMenuItem onClick={() => router.push("/userProfile")}>
									<UserCircle className="w-4 h-4 mr-2" /> Профайл
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => setShowLogoutDialog(true)}
									className="text-red-600"
								>
									<LogOut className="w-4 h-4 mr-2" /> Гарах
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* 4. Mobile Hamburger (Visible only on Mobile/Tablet) */}
						<div className="lg:hidden">
							<Sheet open={open} onOpenChange={setOpen}>
								<SheetTrigger asChild>
									<Button variant="outline" size="icon" className="h-10 w-10">
										<Menu className="h-5 w-5" />
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="w-[300px] sm:w-[350px]">
									<SheetHeader className="text-left">
										<SheetTitle className="flex items-center gap-2">
											<Image
												src="/image/logoLogin.png"
												alt="Logo"
												width={32}
												height={32}
											/>
											ECM System
										</SheetTitle>
									</SheetHeader>
									<div className="flex flex-col gap-4 py-6 px-4">
										<Accordion type="single" collapsible className="w-full">
											{menuItems.map((item) => (
												<Link
													key={item.title}
													href={item.href || "#"}
													onClick={() => setOpen(false)}
													className={cn(
														"flex py-3 text-sm font-medium border-b hover:text-primary transition-colors",
														isActive(item.href || "") &&
															"text-primary font-bold",
													)}
												>
													{item.title}
												</Link>
											))}
										</Accordion>
										<div className="mt-auto pt-6 border-t flex flex-col gap-2">
											<div className="sm:hidden pb-4">
												<ServerDate />
											</div>
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</div>

			{/* Logout Dialog */}
			<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<LogOut className="w-5 h-5 text-red-600" />
							Гарахдаа итгэлтэй байна уу?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Та системээс гарахдаа итгэлтэй байна уу?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Цуцлах</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleLogout}
							className="bg-red-600 hover:bg-red-700"
						>
							Тийм, Гарах
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</header>
	);
}

const UserAvatar: React.FC<{
	userImage: string;
	userName: string;
	size?: "sm" | "md" | "lg";
	showOnlineStatus?: boolean;
}> = ({ userImage, userName, size = "md", showOnlineStatus = false }) => {
	const sizeMap = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12" };
	const avatarSize = size === "lg" ? 48 : size === "md" ? 40 : 32;

	return (
		<div className="relative shrink-0">
			{userImage ? (
				<Image
					src={userImage}
					alt={userName}
					width={avatarSize}
					height={avatarSize}
					className={cn(
						"rounded-full object-cover ring-2 ring-primary/20",
						sizeMap[size],
					)}
				/>
			) : (
				<div
					className={cn(
						"rounded-full bg-primary/10 flex items-center justify-center",
						sizeMap[size],
					)}
				>
					<User className="w-5 h-5 text-primary" />
				</div>
			)}
			{showOnlineStatus && (
				<span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
			)}
		</div>
	);
};
