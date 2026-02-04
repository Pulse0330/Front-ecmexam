"use client";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import {
	BarChart3,
	ChevronDown,
	ClipboardList,
	CreditCard,
	FileText,
	LogOut,
	type LucideIcon,
	Menu,
	School,
	TrendingUp,
	User,
	UserCircle,
	Users,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
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
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

// Navigation links configuration
const NAV_LINKS = [
	{ href: "/home", label: "Үндсэн хуудас" },
	{ href: "/Lists/exerciseList", label: "Дасгал ажил" },
];

const EXAM_LINKS: Array<{ href: string; label: string; icon: LucideIcon }> = [
	{
		href: "/Lists/examList",
		label: "Шалгалтын жагсаалт",
		icon: FileText,
	},
	{
		href: "/Lists/examResult",
		label: "Шалгалтын үр дүн",
		icon: BarChart3,
	},
];

const SORIL_LINKS: Array<{ href: string; label: string; icon: LucideIcon }> = [
	{
		href: "/Lists/sorilList",
		label: "Сорилын жагсаалт",
		icon: ClipboardList,
	},
	{
		href: "/Lists/sorilResult",
		label: "Сорилын үр дүн",
		icon: TrendingUp,
	},
];

const COURSE_LINKS: Array<{ href: string; label: string; icon: LucideIcon }> = [
	{
		href: "/Lists/courseList",
		label: "Хичээл",
		icon: School,
	},
	{
		href: "/Lists/paymentCoureList",
		label: "Төлбөртэй хичээл",
		icon: CreditCard,
	},
];

// User Avatar Component
const UserAvatar: React.FC<{
	userImage: string;
	userName: string;
	size?: "sm" | "md" | "lg";
	showOnlineStatus?: boolean;
}> = ({ userImage, userName, size = "md", showOnlineStatus = false }) => {
	const sizeMap = {
		sm: "w-8 h-8",
		md: "w-10 h-10",
		lg: "w-12 h-12",
	};

	if (userImage) {
		return (
			<div className="relative">
				<Image
					src={userImage}
					alt={userName}
					width={size === "lg" ? 48 : size === "md" ? 40 : 32}
					height={size === "lg" ? 48 : size === "md" ? 40 : 32}
					className={cn(
						"rounded-full object-cover ring-2 ring-primary/20",
						sizeMap[size],
					)}
				/>
				{showOnlineStatus && (
					<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
				)}
			</div>
		);
	}

	return (
		<div
			className={cn(
				"rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center",
				sizeMap[size],
			)}
		>
			<User className="w-5 h-5 text-primary" />
		</div>
	);
};

// Desktop Dropdown Menu
const DesktopDropdown: React.FC<{
	label: string;
	items: Array<{ href: string; label: string; icon: LucideIcon }>;
	isActive: boolean;
}> = ({ label, items, isActive }) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const pathname = usePathname();
	const dropdownRef = React.useRef<HTMLDivElement>(null);
	const buttonRef = React.useRef<HTMLButtonElement>(null);

	// Handle keyboard navigation
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				setIsOpen(false);
				buttonRef.current?.focus();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	// Handle click outside
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const handleToggle = () => {
		setIsOpen((prev) => !prev);
	};

	return (
		<div ref={dropdownRef} className="relative">
			<button
				ref={buttonRef}
				type="button"
				className={cn(
					"flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all",
					"hover:bg-accent hover:text-accent-foreground",
					isActive && "bg-accent text-accent-foreground",
				)}
				aria-expanded={isOpen}
				aria-haspopup="true"
				onClick={handleToggle}
			>
				{label}
				<ChevronDown
					className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
				/>
			</button>

			{isOpen && (
				<div
					className="absolute top-full left-0 mt-2 w-56 rounded-xl border bg-popover shadow-lg z-50"
					role="menu"
					aria-orientation="vertical"
				>
					<div className="p-2 space-y-1">
						{items.map((item) => {
							const Icon = item.icon;
							const isItemActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
										"hover:bg-accent hover:text-accent-foreground",
										isItemActive && "bg-accent/50",
									)}
									onClick={() => setIsOpen(false)}
								>
									<Icon className="w-4 h-4" />
									<span className="text-sm font-medium">{item.label}</span>
								</Link>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};
// Mobile Menu - ACCORDION ONLY
const MobileMenu: React.FC<{
	isOpen: boolean;
	onClose: () => void;
}> = ({ isOpen, onClose }) => {
	const pathname = usePathname();
	const [expandedSection, setExpandedSection] = React.useState<string | null>(
		null,
	);

	// Handle escape key
	React.useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	// Prevent body scroll when menu is open
	React.useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	// Reset expanded section when menu closes
	React.useEffect(() => {
		if (!isOpen) {
			setExpandedSection(null);
		}
	}, [isOpen]);

	const toggleSection = (section: string) => {
		setExpandedSection((prev) => (prev === section ? null : section));
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 lg:hidden">
			{/* Backdrop */}
			<button
				type="button"
				className={cn(
					"absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default transition-opacity duration-300",
					isOpen ? "opacity-100" : "opacity-0",
				)}
				onClick={onClose}
				aria-label="Close menu"
			/>

			{/* Menu Panel - Slides from LEFT */}
			<div
				className={cn(
					"absolute left-0 top-0 h-full w-[85vw] max-w-sm bg-background shadow-2xl",
					"transform transition-transform duration-300 ease-out",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}
				role="dialog"
				aria-modal="true"
				aria-label="Navigation menu"
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b bg-background shrink-0">
						<div className="flex items-center gap-3">
							<Image
								src="/image/logoLogin.png"
								alt="ECM Logo"
								width={40}
								height={40}
								className="object-contain"
							/>
							<h2 className="text-lg font-bold">Цэс</h2>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="p-2 hover:bg-accent rounded-lg transition-colors"
							aria-label="Close menu"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Menu Items - Scrollable with Accordions */}
					<div className="flex-1 overflow-y-auto p-4 space-y-2">
						{/* Main Links */}
						{NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={onClose}
								className={cn(
									"block px-4 py-3 rounded-lg font-medium transition-all",
									"hover:bg-accent hover:text-accent-foreground",
									pathname === link.href && "bg-accent text-accent-foreground",
								)}
							>
								{link.label}
							</Link>
						))}

						{/* Exam Accordion */}
						<div className="space-y-1">
							<Button
								type="button"
								onClick={() => toggleSection("exam")}
								className={cn(
									"w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all",
									"hover:bg-accent hover:text-accent-foreground",
									expandedSection === "exam" && "bg-accent/50",
								)}
							>
								<span>Шалгалт</span>
								<ChevronDown
									className={cn(
										"w-4 h-4 transition-transform duration-200",
										expandedSection === "exam" && "rotate-180",
									)}
								/>
							</Button>

							{expandedSection === "exam" && (
								<div className="pl-4 space-y-1 animate-in slide-in-from-top-2">
									{EXAM_LINKS.map((item) => {
										const Icon = item.icon;
										return (
											<Link
												key={item.href}
												href={item.href}
												onClick={onClose}
												className={cn(
													"flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm",
													"hover:bg-accent hover:text-accent-foreground",
													pathname === item.href &&
														"bg-accent text-accent-foreground",
												)}
											>
												<Icon className="w-4 h-4" />
												<span>{item.label}</span>
											</Link>
										);
									})}
								</div>
							)}
						</div>

						{/* Soril Accordion */}
						<div className="space-y-1">
							<button
								type="button"
								onClick={() => toggleSection("soril")}
								className={cn(
									"w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all",
									"hover:bg-accent hover:text-accent-foreground",
									expandedSection === "soril" && "bg-accent/50",
								)}
							>
								<span>Сорил</span>
								<ChevronDown
									className={cn(
										"w-4 h-4 transition-transform duration-200",
										expandedSection === "soril" && "rotate-180",
									)}
								/>
							</button>

							{expandedSection === "soril" && (
								<div className="pl-4 space-y-1 animate-in slide-in-from-top-2">
									{SORIL_LINKS.map((item) => {
										const Icon = item.icon;
										return (
											<Link
												key={item.href}
												href={item.href}
												onClick={onClose}
												className={cn(
													"flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm",
													"hover:bg-accent hover:text-accent-foreground",
													pathname === item.href &&
														"bg-accent text-accent-foreground",
												)}
											>
												<Icon className="w-4 h-4" />
												<span>{item.label}</span>
											</Link>
										);
									})}
								</div>
							)}
						</div>

						{/* Course Accordion */}
						<div className="space-y-1">
							<button
								type="button"
								onClick={() => toggleSection("course")}
								className={cn(
									"w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all",
									"hover:bg-accent hover:text-accent-foreground",
									expandedSection === "course" && "bg-accent/50",
								)}
							>
								<span>Цахим сургалт</span>
								<ChevronDown
									className={cn(
										"w-4 h-4 transition-transform duration-200",
										expandedSection === "course" && "rotate-180",
									)}
								/>
							</button>

							{expandedSection === "course" && (
								<div className="pl-4 space-y-1 animate-in slide-in-from-top-2">
									{COURSE_LINKS.map((item) => {
										const Icon = item.icon;
										return (
											<Link
												key={item.href}
												href={item.href}
												onClick={onClose}
												className={cn(
													"flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm",
													"hover:bg-accent hover:text-accent-foreground",
													pathname === item.href &&
														"bg-accent text-accent-foreground",
												)}
											>
												<Icon className="w-4 h-4" />
												<span>{item.label}</span>
											</Link>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Main Navbar Component
export const Navbar01: React.FC = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
	const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const queryClient = useQueryClient(); // ← Hook-ийг энд дуудна
	const { user, firstname, imgUrl, clearAuth } = useAuthStore();

	const userInfo = React.useMemo(
		() => ({
			userName: user?.fname || firstname || "Хэрэглэгч",
			userEmail: user?.email || "",
			userImage: imgUrl || user?.img_url || "",
			schoolName: user?.sch_name || "",
			studentGroup: user?.studentgroupname || "",
		}),
		[user, firstname, imgUrl],
	);

	const isExamActive = pathname.includes("/Lists/exam");
	const isSorilActive = pathname.includes("/Lists/soril");
	const isCourseActive =
		pathname.includes("/Lists/courseList") ||
		pathname.includes("/Lists/paymentCoureList");

	const handleLogout = async () => {
		try {
			// 1. Call logout API if available
			// await logoutAPI();

			// 2. Clear cookies
			const cookiesToRemove = ["auth-token", "user-id", "firstname", "img-url"];
			cookiesToRemove.forEach((cookie) => {
				Cookies.remove(cookie, { path: "/" });
			});

			// 3. Clear Zustand (includes localStorage cleanup)
			clearAuth();

			// 4. Clear session storage
			sessionStorage.clear();

			// 5. Clear React Query cache
			queryClient.clear();

			// 6. Navigate to login
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
			// Force reload as fallback
			window.location.href = "/login";
		}
	};

	return (
		<>
			<header className="w-full border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 rounded-2xl shadow-lg ">
				<div className="flex h-16 items-center justify-between gap-4 px-6">
					{/* Logo - Pushed Left */}
					<Link href="/" className="flex items-center gap-2 shrink-0">
						<Image
							src="/image/logoLogin.png"
							alt="ECM Logo"
							width={48}
							height={48}
							className="object-contain"
							priority
						/>
					</Link>

					{/* Desktop Navigation - Centered */}
					<nav
						className="hidden lg:flex items-center gap-1 flex-1 justify-center"
						aria-label="Main navigation"
					>
						{NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={cn(
									"px-4 py-2 text-sm font-medium rounded-lg transition-all",
									"hover:bg-accent hover:text-accent-foreground",
									pathname === link.href && "bg-accent text-accent-foreground",
								)}
							>
								{link.label}
							</Link>
						))}

						<DesktopDropdown
							label="Шалгалт"
							items={EXAM_LINKS}
							isActive={isExamActive}
						/>
						<DesktopDropdown
							label="Сорил"
							items={SORIL_LINKS}
							isActive={isSorilActive}
						/>
						<DesktopDropdown
							label="Цахим сургалт"
							items={COURSE_LINKS}
							isActive={isCourseActive}
						/>
					</nav>

					{/* Right Actions - Pushed Right */}
					<div className="flex items-center gap-3 shrink-0">
						{/* Mobile Menu Button */}
						<button
							type="button"
							onClick={() => setMobileMenuOpen(true)}
							className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
							aria-label="Open navigation menu"
							aria-expanded={mobileMenuOpen}
						>
							<Menu className="w-5 h-5" />
						</button>

						{/* User Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="gap-2 px-3 py-2 h-auto hover:bg-accent"
								>
									<UserAvatar
										userImage={userInfo.userImage}
										userName={userInfo.userName}
										size="sm"
										showOnlineStatus
									/>
									<span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
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
											showOnlineStatus
										/>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold truncate">
												{userInfo.userName}
											</p>
											{userInfo.schoolName && (
												<div className="flex items-center gap-1 mt-1">
													<School className="w-3 h-3 text-blue-600" />
													<p className="text-xs text-muted-foreground truncate">
														{userInfo.schoolName}
													</p>
												</div>
											)}
											{userInfo.studentGroup && (
												<div className="flex items-center gap-1 mt-0.5">
													<Users className="w-3 h-3 text-green-600" />
													<p className="text-xs text-muted-foreground truncate">
														{userInfo.studentGroup}
													</p>
												</div>
											)}
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<div className="px-2 py-1.5">
									<AnimatedThemeToggler />
								</div>
								<DropdownMenuItem
									onClick={() => router.push("/userProfile")}
									className="cursor-pointer"
								>
									<UserCircle className="w-4 h-4 mr-2" />
									Профайл
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => setShowLogoutDialog(true)}
									className="cursor-pointer text-red-600"
								>
									<LogOut className="w-4 h-4 mr-2" />
									Гарах
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			{/* Mobile Menu */}
			<MobileMenu
				isOpen={mobileMenuOpen}
				onClose={() => setMobileMenuOpen(false)}
			/>

			{/* Logout Dialog */}
			<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<LogOut className="w-5 h-5 text-red-600" />
							Гарахдаа итгэлтэй байна уу?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Та системээс гарахдаа итгэлтэй байна уу? Дахин нэвтрэхийн тулд
							нэвтрэх нэр болон нууц үгээ оруулах шаардлагатай.
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
		</>
	);
};
