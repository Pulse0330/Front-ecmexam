"use client";
import Cookies from "js-cookie";
import {
	BarChart3,
	ChevronDown,
	ClipboardList,
	CreditCard,
	FileText,
	LogOut,
	School,
	TrendingUp,
	User,
	UserCircle,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useAuthStore } from "@/stores/useAuthStore";

// ⭐ UNIFIED User Avatar Component
const UserAvatar = React.memo(
	({
		userImage,
		userName,
		size = "md",
		showOnlineStatus = false,
		className = "",
	}: {
		userImage: string;
		userName: string;
		size?: "sm" | "md" | "lg";
		showOnlineStatus?: boolean;
		className?: string;
	}) => {
		const sizeClasses = {
			sm: "w-9 h-9",
			md: "w-11 h-11",
			lg: "w-13 h-13",
		};

		const iconSizes = {
			sm: "h-4 w-4",
			md: "h-5 w-5",
			lg: "h-6 w-6",
		};

		const statusSizes = {
			sm: "w-2.5 h-2.5",
			md: "w-3.5 h-3.5",
			lg: "w-4 h-4",
		};

		if (userImage) {
			return (
				<div className={cn("relative shrink-0", className)}>
					<Image
						src={userImage}
						alt={userName}
						width={size === "sm" ? 36 : size === "md" ? 44 : 52}
						height={size === "sm" ? 36 : size === "md" ? 44 : 52}
						className={cn(
							"rounded-full object-cover ring-2 ring-primary/40 ring-offset-2 ring-offset-background shadow-sm",
							sizeClasses[size],
						)}
					/>
					{showOnlineStatus && (
						<div
							className={cn(
								"absolute -bottom-0.5 -right-0.5 bg-linear-to-br from-green-400 to-green-500 rounded-full border-2 border-background shadow-sm",
								statusSizes[size],
							)}
						>
							<div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
						</div>
					)}
				</div>
			);
		}

		return (
			<div
				className={cn(
					"rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 shadow-sm",
					sizeClasses[size],
					className,
				)}
			>
				<User className={`${iconSizes[size]} text-primary`} />
			</div>
		);
	},
);

UserAvatar.displayName = "UserAvatar";

// NavbarAction Component
const NavbarAction = React.memo(
	({
		icon,
		className,
		...props
	}: React.ComponentPropsWithoutRef<typeof Button> & {
		icon: React.ReactNode;
	}) => (
		<Button
			variant="ghost"
			className={cn(
				"relative p-2 md:p-3 rounded-full backdrop-blur-sm border transition-all duration-200",
				"bg-white/90 dark:bg-gray-800/60 border-gray-200/80 dark:border-gray-700/80",
				"text-gray-900 dark:text-yellow-400",
				"active:scale-95 will-change-transform",
				"shadow-sm h-auto w-auto",
				className,
			)}
			{...props}
		>
			{icon}
		</Button>
	),
);

NavbarAction.displayName = "NavbarAction";

// Types
export interface Navbar01NavLink {
	href: string;
	label: string;
}

export interface Navbar01Props extends React.HTMLAttributes<HTMLElement> {
	logo?: React.ReactNode;
	logoHref?: string;
	navigationLinks?: Navbar01NavLink[];
}

const defaultNavigationLinks: Navbar01NavLink[] = [
	{ href: "/home", label: "Үндсэн хуудас" },
	{ href: "/Lists/exerciseList", label: "Дасгал ажил" },
];

const examDropdownLinks = [
	{
		href: "/Lists/examList",
		label: "Шалгалтын жагсаалт",
		description: "",
		icon: <FileText className="h-5 w-5" />,
	},
	{
		href: "/Lists/examResult",
		label: "Шалгалтын үр дүн",
		description: "",
		icon: <BarChart3 className="h-5 w-5" />,
	},
];

const sorilDropdownLinks = [
	{
		href: "/Lists/sorilList",
		label: "Сорилын жагсаалт",
		description: "",
		icon: <ClipboardList className="h-5 w-5" />,
	},
	{
		href: "/Lists/sorilResult",
		label: "Сорилын үр дүн",
		description: "",
		icon: <TrendingUp className="h-5 w-5" />,
	},
];

// ⭐ НЭМСЭН: Цахим сургалтын dropdown links
const courseDropdownLinks = [
	{
		href: "/Lists/courseList",
		label: "Хичээл",
		description: "",
		icon: <School className="h-5 w-5" />,
	},
	{
		href: "/Lists/paymentCoureList",
		label: "Төлбөртэй хичээл",
		description: "",
		icon: <CreditCard className="h-5 w-5" />,
	},
];

// Mega Menu Component
const MegaMenuItem = React.memo(
	({
		label,
		items,
		isActive,
	}: {
		label: string;
		items: Array<{
			href: string;
			label: string;
			description: string;
			icon: React.ReactNode;
		}>;
		isActive: boolean;
	}) => {
		const [isOpen, setIsOpen] = useState(false);
		const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
		const pathname = usePathname();

		const handleMouseEnter = useCallback(() => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			setIsOpen(true);
		}, []);

		const handleMouseLeave = useCallback(() => {
			timeoutRef.current = setTimeout(() => {
				setIsOpen(false);
			}, 150);
		}, []);

		useEffect(() => {
			return () => {
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}, []);

		return (
			<NavigationMenuItem
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<button
					type="button"
					className={cn(
						"group inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
						"hover:bg-linear-to-r hover:from-accent/90 hover:to-accent hover:text-accent-foreground hover:shadow-md hover:scale-105",
						"active:scale-95",
						isActive
							? "bg-linear-to-r from-accent/90 to-accent text-accent-foreground shadow-md scale-[1.02]"
							: "text-foreground/80 hover:text-foreground",
					)}
				>
					{label}
					<ChevronDown
						className={cn(
							"h-4 w-4 transition-transform duration-300",
							isOpen && "rotate-180",
						)}
					/>
				</button>

				{/* Mega Menu Dropdown */}
				<div
					className={cn(
						"absolute left-0 top-full mt-3 w-80 rounded-2xl border bg-popover/98 backdrop-blur-xl shadow-2xl transition-all duration-300",
						"transform origin-top overflow-hidden",
						isOpen
							? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
							: "opacity-0 scale-95 -translate-y-2 pointer-events-none",
					)}
				>
					<div className="p-4 space-y-1.5">
						<div className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 border-b border-border/50 mb-3">
							{label}
						</div>
						{items.map((item) => {
							const isItemActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex flex-col items-start gap-2 p-3.5 rounded-xl transition-all duration-300",
										"hover:bg-accent/90 hover:shadow-lg hover:scale-[1.02] hover:translate-x-1",
										"active:scale-95",
										isItemActive &&
											"bg-linear-to-r from-accent to-accent/80 shadow-lg scale-[1.02] border border-primary/30",
									)}
								>
									<div className="flex items-center gap-3 w-full">
										<span className="text-2xl filter drop-shadow-sm">
											{item.icon}
										</span>
										<div className="text-sm font-bold leading-none">
											{item.label}
										</div>
									</div>
									<p className="text-xs leading-relaxed text-muted-foreground pl-9">
										{item.description}
									</p>
								</Link>
							);
						})}
					</div>
				</div>
			</NavigationMenuItem>
		);
	},
);

MegaMenuItem.displayName = "MegaMenuItem";

export const Navbar01 = React.forwardRef<HTMLElement, Navbar01Props>(
	({ className, navigationLinks = defaultNavigationLinks, ...props }, ref) => {
		const [isMobile, setIsMobile] = useState(false);
		const [showLogoutDialog, setShowLogoutDialog] = useState(false);
		const [isMenuOpen, setIsMenuOpen] = useState(false);
		const containerRef = useRef<HTMLElement>(null);
		const pathname = usePathname();
		const router = useRouter();

		const { user, firstname, imgUrl, clearAuth } = useAuthStore();

		const userInfo = useMemo(
			() => ({
				userName: user?.fname || firstname || "Хэрэглэгч",
				userEmail: user?.email || "",
				userImage: imgUrl || user?.img_url || "",
				schoolName: user?.sch_name || "",
				studentGroup: user?.studentgroupname || "",
			}),
			[user, firstname, imgUrl],
		);

		useEffect(() => {
			let timeoutId: NodeJS.Timeout;

			const checkWidth = () => {
				if (containerRef.current) {
					const width = containerRef.current.offsetWidth;
					setIsMobile(width < 768);
				}
			};

			const debouncedCheck = () => {
				clearTimeout(timeoutId);
				timeoutId = setTimeout(checkWidth, 100);
			};

			checkWidth();

			const resizeObserver = new ResizeObserver(debouncedCheck);
			if (containerRef.current) {
				resizeObserver.observe(containerRef.current);
			}

			return () => {
				clearTimeout(timeoutId);
				resizeObserver.disconnect();
			};
		}, []);

		const combinedRef = useCallback(
			(node: HTMLElement | null) => {
				containerRef.current = node;
				if (typeof ref === "function") {
					ref(node);
				} else if (ref) {
					(ref as React.MutableRefObject<HTMLElement | null>).current = node;
				}
			},
			[ref],
		);

		const handleLogoutClick = useCallback(() => {
			setShowLogoutDialog(true);
		}, []);

		const confirmLogout = useCallback(() => {
			Cookies.remove("auth-token", { path: "/" });
			Cookies.remove("user-id", { path: "/" });
			Cookies.remove("firstname", { path: "/" });
			Cookies.remove("img-url", { path: "/" });

			clearAuth();
			router.push("/login");
		}, [router, clearAuth]);

		const handleProfileClick = useCallback(() => {
			router.push("/userProfile");
		}, [router]);

		const handleMenuToggle = useCallback(() => {
			setIsMenuOpen(false);
		}, []);

		// ⭐ ӨӨРЧИЛСӨН: Цахим сургалтын хуудаснууд идэвхтэй эсэхийг шалгах
		const isExamActive = pathname.includes("/Lists/exam");
		const isSorilActive = pathname.includes("/Lists/soril");
		const isCourseActive =
			pathname.includes("/Lists/courseList") ||
			pathname.includes("/Lists/paymentCoureList");

		return (
			<>
				<header
					ref={combinedRef}
					className={cn(
						"rounded-3xl border-2 bg-linear-to-r from-background/98 via-background/95 to-background/98",
						"backdrop-blur-xl supports-backdrop-filter:bg-background/60",
						"shadow-xl shadow-black/5 dark:shadow-black/20",
						"sticky top-0 z-50 transition-all duration-300",
						"border-gray-200/60 dark:border-gray-800/60",
						className,
					)}
					{...props}
				>
					<div className="flex h-20 items-center justify-between px-6 md:px-12">
						{/* Left side - Logo */}
						<div className="flex items-center shrink-0">
							<Link
								href="/"
								className="flex items-center text-primary hover:text-primary/90 transition-all duration-300 hover:scale-105 active:scale-95"
							>
								<Image
									src="/image/logoLogin.png"
									alt="ECM Logo"
									width={96}
									height={96}
									className="object-contain drop-shadow-md"
									priority
									unoptimized
								/>
							</Link>
						</div>

						{/* Center - Desktop Navigation */}
						{!isMobile && (
							<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
								<NavigationMenu>
									<NavigationMenuList className="gap-2">
										{navigationLinks.map((link) => {
											const isActive = pathname === link.href;
											return (
												<NavigationMenuItem key={link.href}>
													<Link
														href={link.href}
														className={cn(
															"group inline-flex h-10 w-max items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
															"hover:bg-linear-to-r hover:from-accent/90 hover:to-accent hover:text-accent-foreground hover:shadow-md hover:scale-105",
															"active:scale-95",
															isActive
																? "bg-linear-to-r from-accent/90 to-accent text-accent-foreground shadow-md scale-[1.02]"
																: "text-foreground/80 hover:text-foreground",
														)}
													>
														{link.label}
													</Link>
												</NavigationMenuItem>
											);
										})}

										{/* Шалгалт Mega Menu */}
										<MegaMenuItem
											label="Шалгалт"
											items={examDropdownLinks}
											isActive={isExamActive}
										/>

										{/* Сорил Mega Menu */}
										<MegaMenuItem
											label="Сорил"
											items={sorilDropdownLinks}
											isActive={isSorilActive}
										/>

										{/* ⭐ ӨӨРЧИЛСӨН: Цахим сургалт - Mega Menu болгосон */}
										<MegaMenuItem
											label="Цахим сургалт"
											items={courseDropdownLinks}
											isActive={isCourseActive}
										/>
									</NavigationMenuList>
								</NavigationMenu>
							</div>
						)}

						{/* Right side - Actions */}
						<div className="flex items-center gap-3">
							{/* Mobile menu */}
							{isMobile && (
								<Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											className={cn(
												"p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300",
												"bg-linear-to-br from-white/95 to-white/90 dark:from-gray-800/80 dark:to-gray-800/60",
												"border-gray-200/60 dark:border-gray-700/60",
												"text-gray-700 dark:text-yellow-400",
												"hover:shadow-lg hover:scale-105 active:scale-95",
												"h-10 w-10",
											)}
										>
											<UseAnimations
												animation={menu3}
												size={24}
												reverse={isMenuOpen}
												strokeColor="currentColor"
											/>
										</Button>
									</PopoverTrigger>
									<PopoverContent
										align="end"
										className="w-72 p-3 animate-in fade-in-0 zoom-in-95 rounded-2xl shadow-2xl border-2"
									>
										<NavigationMenu className="max-w-none">
											<NavigationMenuList className="flex-col items-start gap-1.5">
												{navigationLinks.map((link) => {
													const isActive = pathname === link.href;
													return (
														<NavigationMenuItem
															key={link.href}
															className="w-full"
														>
															<Link
																href={link.href}
																onClick={handleMenuToggle}
																className={cn(
																	"flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
																	"hover:bg-accent hover:text-accent-foreground hover:translate-x-1 hover:shadow-md",
																	"active:scale-95",
																	isActive
																		? "bg-linear-to-r from-accent/90 to-accent text-accent-foreground shadow-md"
																		: "text-foreground/80",
																)}
															>
																{link.label}
															</Link>
														</NavigationMenuItem>
													);
												})}

												{/* Mobile Шалгалт Section */}
												<div className="w-full pt-4 pb-2">
													<div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
														📝 Шалгалт
													</div>
												</div>
												{examDropdownLinks.map((item) => {
													const isActive = pathname === item.href;
													return (
														<NavigationMenuItem
															key={item.href}
															className="w-full"
														>
															<Link
																href={item.href}
																onClick={handleMenuToggle}
																className={cn(
																	"flex w-full items-start gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300",
																	"hover:bg-accent hover:text-accent-foreground hover:translate-x-1 hover:shadow-md",
																	"active:scale-95",
																	isActive
																		? "bg-linear-to-r from-accent/90 to-accent text-accent-foreground shadow-md"
																		: "text-foreground/80",
																)}
															>
																<span className="text-lg mt-0.5 filter drop-shadow-sm">
																	{item.icon}
																</span>
																<div className="flex flex-col gap-1">
																	<span className="font-bold">
																		{item.label}
																	</span>
																	<span className="text-xs text-muted-foreground leading-tight">
																		{item.description}
																	</span>
																</div>
															</Link>
														</NavigationMenuItem>
													);
												})}

												{/* Mobile Сорил Section */}
												<div className="w-full pt-4 pb-2">
													<div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
														🎯 Сорил
													</div>
												</div>
												{sorilDropdownLinks.map((item) => {
													const isActive = pathname === item.href;
													return (
														<NavigationMenuItem
															key={item.href}
															className="w-full"
														>
															<Link
																href={item.href}
																onClick={handleMenuToggle}
																className={cn(
																	"flex w-full items-start gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300",
																	"hover:bg-accent hover:text-accent-foreground hover:translate-x-1 hover:shadow-md",
																	"active:scale-95",
																	isActive
																		? "bg-linear-to-r from-accent/90 to-accent text-accent-foreground shadow-md"
																		: "text-foreground/80",
																)}
															>
																<span className="text-lg mt-0.5 filter drop-shadow-sm">
																	{item.icon}
																</span>
																<div className="flex flex-col gap-1">
																	<span className="font-bold">
																		{item.label}
																	</span>
																	<span className="text-xs text-muted-foreground leading-tight">
																		{item.description}
																	</span>
																</div>
															</Link>
														</NavigationMenuItem>
													);
												})}

												{/* ⭐ НЭМСЭН: Mobile Цахим сургалт Section */}
												<div className="w-full pt-4 pb-2">
													<div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
														📚 Цахим сургалт
													</div>
												</div>
												{courseDropdownLinks.map((item) => {
													const isActive = pathname === item.href;
													return (
														<NavigationMenuItem
															key={item.href}
															className="w-full"
														>
															<Link
																href={item.href}
																onClick={handleMenuToggle}
																className={cn(
																	"flex w-full items-start gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300",
																	"hover:bg-accent hover:text-accent-foreground hover:translate-x-1 hover:shadow-md",
																	"active:scale-95",
																	isActive
																		? "bg-linear-to-r from-accent/90 to-accent text-accent-foreground shadow-md"
																		: "text-foreground/80",
																)}
															>
																<span className="text-lg mt-0.5 filter drop-shadow-sm">
																	{item.icon}
																</span>
																<div className="flex flex-col gap-1">
																	<span className="font-bold">
																		{item.label}
																	</span>
																	<span className="text-xs text-muted-foreground leading-tight">
																		{item.description}
																	</span>
																</div>
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
									<Button
										variant="ghost"
										className={cn(
											"rounded-xl backdrop-blur-md border-2 transition-all duration-300",
											"bg-linear-to-br from-white/95 to-white/90 dark:from-gray-800/80 dark:to-gray-800/60",
											"border-gray-200/60 dark:border-gray-700/60",
											"hover:shadow-lg hover:scale-105 hover:border-primary/40",
											"active:scale-95",
											!isMobile && "px-4 py-2 gap-3 h-auto",
											isMobile && "p-0 h-11 w-11 overflow-hidden",
										)}
									>
										{!isMobile ? (
											<>
												<UserAvatar
													userImage={userInfo.userImage}
													userName={userInfo.userName}
													size="sm"
													showOnlineStatus={true}
												/>
												<span className="text-sm font-semibold text-foreground leading-tight truncate max-w-[150px]">
													{userInfo.userName}
												</span>
											</>
										) : (
											<UserAvatar
												userImage={userInfo.userImage}
												userName={userInfo.userName}
												size="md"
											/>
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="end"
									className="w-72 animate-in fade-in-0 zoom-in-95 rounded-2xl shadow-2xl border-2"
								>
									<DropdownMenuLabel className="pb-3">
										<div className="flex items-center space-x-3.5">
											<UserAvatar
												userImage={userInfo.userImage}
												userName={userInfo.userName}
												size="lg"
												showOnlineStatus={true}
											/>

											<div className="flex flex-col space-y-2 flex-1 min-w-0">
												<p className="text-base font-bold leading-none truncate">
													{userInfo.userName}
												</p>

												{userInfo.schoolName && (
													<div
														className="flex items-center gap-2 min-w-0 cursor-help group"
														title={userInfo.schoolName}
													>
														<School className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" />
														<span className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
															{userInfo.schoolName}
														</span>
													</div>
												)}
												{userInfo.studentGroup && (
													<div
														className="flex items-center gap-2 min-w-0 cursor-help group"
														title={userInfo.studentGroup}
													>
														<Users className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400 transition-transform group-hover:scale-110" />
														<span className="text-xs font-medium text-green-600 dark:text-green-400 truncate">
															{userInfo.studentGroup}
														</span>
													</div>
												)}
											</div>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleProfileClick}
										className="cursor-pointer transition-all duration-300 rounded-xl py-2.5 my-1"
									>
										<UserCircle className="mr-2.5 h-4 w-4" />
										<span className="font-medium">Профайл</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogoutClick}
										className="cursor-pointer text-red-600 dark:text-red-400 transition-all duration-300 rounded-xl py-2.5 my-1"
									>
										<LogOut className="mr-2.5 h-4 w-4" />
										<span className="font-medium">Гарах</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Theme toggler */}
							<AnimatedThemeToggler
								className={cn(
									"p-2 md:p-3 rounded-full backdrop-blur-sm border transition-all duration-200",
									"bg-white/90 dark:bg-gray-800/60 border-gray-200/80 dark:border-gray-700/80",
									"text-gray-900 dark:text-yellow-400",
									"active:scale-95 shadow-sm h-auto w-auto",
								)}
							/>
						</div>
					</div>
				</header>

				{/* Logout Confirmation Dialog */}
				<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
					<AlertDialogContent className="sm:max-w-md rounded-2xl border-2">
						<AlertDialogHeader>
							<AlertDialogTitle className="flex items-center gap-2.5 text-lg">
								<LogOut className="h-5 w-5 text-red-600" />
								Гарахдаа итгэлтэй байна уу?
							</AlertDialogTitle>
							<AlertDialogDescription className="text-sm leading-relaxed pt-2">
								Та системээс гарахдаа итгэлтэй байна уу? Дахин нэвтрэхийн тулд
								нэвтрэх нэр болон нууц үгээ оруулах шаардлагатай.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter className="gap-2">
							<AlertDialogCancel className="transition-all duration-300 hover:scale-105 rounded-xl">
								Цуцлах
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmLogout}
								className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-600 dark:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 transition-all duration-300 hover:scale-105 rounded-xl"
							>
								Тийм, Гарах
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</>
		);
	},
);

Navbar01.displayName = "Navbar01";
