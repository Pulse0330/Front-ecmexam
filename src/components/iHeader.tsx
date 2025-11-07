"use client";
import { LogOut, User, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import UseAnimations from "react-useanimations";
import menu3 from "react-useanimations/lib/menu3";
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
} from "@/components/ui/navigation-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// NavbarAction
// -----------------------------------------------------------------------------
const NavbarAction = ({
	icon,
	className,
	...props
}: {
	icon: React.ReactNode;
	className?: string;
}) => {
	return (
		<Button
			variant="ghost"
			className={cn(
				"p-2 md:p-3 rounded-full backdrop-blur-sm border transition-all duration-300",
				"bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
				"text-gray-900 dark:text-yellow-400 hover:bg-white dark:hover:bg-gray-700/50",
				"hover:scale-110 shadow-sm h-auto w-auto",
				className,
			)}
			{...props}
		>
			{icon}
		</Button>
	);
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface Navbar01NavLink {
	href: string;
	label: string;
}

export interface Navbar01Props extends React.HTMLAttributes<HTMLElement> {
	logo?: React.ReactNode;
	logoHref?: string;
	navigationLinks?: Navbar01NavLink[];
	userName?: string;
	userEmail?: string;
}

// -----------------------------------------------------------------------------
// Default Navigation Links
// -----------------------------------------------------------------------------
const defaultNavigationLinks: Navbar01NavLink[] = [
	{ href: "/home", label: "Үндсэн хуудас" },
	{ href: "/Lists/exam-list", label: "Шалгалт" },
	{ href: "/Lists/exam-result", label: "Шалгалтын үр дүн" },
	{ href: "/Lists/soril-list", label: "Сорил" },
	{ href: "/Lists/soril-result", label: "Сорилын үр дүн" },
	{ href: "/Lists/exercises", label: "Дасгал ажил" },
];

// -----------------------------------------------------------------------------
// Navbar01 Component
// -----------------------------------------------------------------------------
export const Navbar01 = React.forwardRef<HTMLElement, Navbar01Props>(
	(
		{
			className,
			navigationLinks = defaultNavigationLinks,
			userName,
			userEmail,
			...props
		},
		ref,
	) => {
		const [isMobile, setIsMobile] = useState(false);
		const [showLogoutDialog, setShowLogoutDialog] = useState(false);
		const [isMenuOpen, setIsMenuOpen] = useState(false);
		const containerRef = useRef<HTMLElement>(null);
		const pathname = usePathname();
		const router = useRouter();

		useEffect(() => {
			const checkWidth = () => {
				if (containerRef.current) {
					const width = containerRef.current.offsetWidth;
					setIsMobile(width < 768);
				}
			};
			checkWidth();
			const resizeObserver = new ResizeObserver(checkWidth);
			if (containerRef.current) resizeObserver.observe(containerRef.current);
			return () => resizeObserver.disconnect();
		}, []);

		const combinedRef = React.useCallback(
			(node: HTMLElement | null) => {
				containerRef.current = node;
				if (typeof ref === "function") ref(node);
				else if (ref) {
					(ref as React.MutableRefObject<HTMLElement | null>).current = node;
				}
			},
			[ref],
		);

		const handleLogoutClick = () => {
			setShowLogoutDialog(true);
		};

		const confirmLogout = () => {
			document.cookie = "auth-token=; Max-Age=0; path=/";
			router.push("/login");
		};

		const handleProfileClick = () => {
			router.push("/userProfile");
		};

		return (
			<>
				<header
					ref={combinedRef}
					className={cn(
						"rounded-2xl border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-lg",
						className,
					)}
					{...props}
				>
					<div className="flex h-16 items-center justify-between px-6 md:px-10">
						{/* Left side - Logo */}
						<div className="flex items-center">
							<Link
								href="/"
								className="flex items-center text-primary hover:text-primary/90 transition-colors"
							>
								<Image
									src="/image/IkhNuudel.png"
									alt="ECM Logo"
									width={88}
									height={88}
									className="object-contain"
									priority
									unoptimized
								/>
							</Link>
						</div>

						{/* Center - Navigation Menu (Desktop only) */}
						{!isMobile && (
							<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
								<NavigationMenu>
									<NavigationMenuList className="gap-1">
										{navigationLinks.map((link, index) => {
											const isActive = pathname === link.href;
											return (
												<NavigationMenuItem key={index}>
													<Link
														href={link.href}
														className={cn(
															"group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300",
															"hover:bg-accent hover:text-accent-foreground hover:scale-105",
															isActive
																? "bg-accent text-accent-foreground"
																: "text-foreground/80 hover:text-foreground",
														)}
													>
														{/* Hover animation effect */}
														{link.label}
													</Link>
												</NavigationMenuItem>
											);
										})}
									</NavigationMenuList>
								</NavigationMenu>
							</div>
						)}

						{/* Right side - Actions */}
						<div className="flex items-center gap-3">
							{/* Mobile menu with animated icon */}
							{isMobile && (
								<Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											className={cn(
												"p-2 rounded-full backdrop-blur-sm border transition-all duration-300",
												"bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
												"text-gray-900 dark:text-yellow-400 hover:bg-white dark:hover:bg-gray-700/50",
												"hover:scale-110 shadow-sm h-auto w-auto",
											)}
										>
											<UseAnimations
												animation={menu3}
												size={28}
												reverse={isMenuOpen}
												strokeColor="currentColor"
											/>
										</Button>
									</PopoverTrigger>
									<PopoverContent align="end" className="w-48 p-2">
										<NavigationMenu className="max-w-none">
											<NavigationMenuList className="flex-col items-start gap-1">
												{navigationLinks.map((link, index) => {
													const isActive = pathname === link.href;
													return (
														<NavigationMenuItem key={index} className="w-full">
															<Link
																href={link.href}
																onClick={() => setIsMenuOpen(false)}
																className={cn(
																	"flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
																	"hover:bg-accent hover:text-accent-foreground",
																	isActive
																		? "bg-accent text-accent-foreground"
																		: "text-foreground/80",
																)}
															>
																{link.label}
															</Link>
														</NavigationMenuItem>
													);
												})}
											</NavigationMenuList>
										</NavigationMenu>
									</PopoverContent>
								</Popover>
							)}

							{/* User dropdown */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<NavbarAction icon={<User className="h-5 w-5" />} />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>
										<div className="flex flex-col space-y-1">
											{userName && (
												<p className="text-sm font-medium leading-none">
													{userName}
												</p>
											)}
											{userEmail && (
												<p className="text-xs leading-none text-muted-foreground">
													{userEmail}
												</p>
											)}
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleProfileClick}
										className="cursor-pointer"
									>
										<UserCircle className="mr-2 h-4 w-4" />
										<span>Профайл</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogoutClick}
										className="cursor-pointer text-red-600 dark:text-red-400"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Гарах</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Theme toggler */}
							<AnimatedThemeToggler
								className={cn(
									"p-2 md:p-3 rounded-full backdrop-blur-sm border transition-all duration-300",
									"bg-white/80 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
									"text-gray-900 dark:text-yellow-400 hover:bg-white dark:hover:bg-gray-700/50",
									"hover:scale-110 shadow-sm h-auto w-auto",
								)}
							/>
						</div>
					</div>
				</header>

				{/* Logout Confirmation Dialog */}
				<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Гарахдаа итгэлтэй байна уу?</AlertDialogTitle>
							<AlertDialogDescription>
								Та системээс гарахдаа итгэлтэй байна уу? Дахин нэвтрэхийн тулд
								нэвтрэх нэр болон нууц үгээ оруулах шаардлагатай.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Цуцлах</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmLogout}
								className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
							>
								Гарах
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</>
		);
	},
);

Navbar01.displayName = "Navbar01";
