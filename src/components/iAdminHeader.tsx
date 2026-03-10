"use client";

import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import {
  ChevronRight,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  User,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import ServerDate from "@/components/serverDate";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

const menuItems = [
  { title: "Шалгалтын ерөнхий мэдээлэл татах", href: "/admin-import" },
  { title: "Шалгуулагчдын мэдээлэл засах", href: "/admin-students" },
];

export function IAdminHeader() {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const { user, firstname, imgUrl, clearAuth } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  const userInfo = React.useMemo(
    () => ({
      userName: user?.fname || firstname || "Хэрэглэгч",
      userImage: imgUrl || user?.img_url || "",
      schoolName: user?.sch_name || "",
    }),
    [user, firstname, imgUrl],
  );

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
    <header className="relative z-50 mx-auto w-full max-w-7xl">
      <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-background/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-white/15 dark:bg-background/55 dark:shadow-[0_8px_40px_rgba(0,0,0,0.18)] supports-backdrop-filter:bg-background/75 dark:supports-backdrop-filter:bg-background/45">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0.35),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-black/10 to-transparent dark:via-white/60" />

        <div className="relative flex min-h-18 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin-import"
              className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-all duration-300 hover:scale-[1.02] hover:bg-white dark:border-white/20 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:backdrop-blur-xl dark:hover:bg-white/15"
            >
              <div className="pointer-events-none absolute inset-0 p-1 bg-linear-to-br from-white/80 via-white/20 to-transparent dark:from-white/30 dark:via-transparent dark:to-transparent" />
              <Image
                src="/image/logoLogin.png"
                alt="ECM Logo"
                width={40}
                height={40}
                className="relative object-contain w-8 h-8 dark:brightness-0 dark:invert"
                priority
              />
            </Link>
          </div>

          <div className="hidden flex-1 justify-center lg:flex">
            <NavigationMenu delayDuration={0}>
              <NavigationMenuList className="gap-2 rounded-full border border-black/5 bg-white/70 p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.title}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative inline-flex h-8 items-center rounded-full px-4 text-sm/4 text-center font-medium text-foreground/80 transition-all duration-300",
                        "hover:bg-black/4 hover:text-foreground dark:hover:bg-white/15",
                        isActive(item.href) &&
                          "bg-background text-foreground shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:bg-white/20 dark:shadow-[0_4px_20px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25)]",
                      )}
                    >
                      <span className="relative z-10">{item.title}</span>
                      {isActive(item.href) && (
                        <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/15">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <div className="rounded-full border border-black/5 bg-white/75 px-3 py-2 text-sm shadow-[0_4px_16px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <ServerDate />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-12 gap-2 rounded-full border border-black/5 bg-white/75 px-2 md:px-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:hover:bg-white/15"
                >
                  <UserAvatar
                    userImage={userInfo.userImage}
                    userName={userInfo.userName}
                    size="sm"
                    showOnlineStatus
                  />
                  <div className="hidden min-w-0 text-left md:block">
                    <p className="max-w-28 truncate text-sm font-semibold">
                      {userInfo.userName}
                    </p>
                    <p className="max-w-28 truncate text-[11px] text-muted-foreground">
                      {userInfo.schoolName || "Хэрэглэгч"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-72 rounded-3xl border border-black/5 bg-background/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.10)] backdrop-blur-2xl dark:border-white/15 dark:bg-background/70 dark:shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
              >
                <DropdownMenuLabel className="rounded-2xl border border-black/5 bg-black/2 p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      userImage={userInfo.userImage}
                      userName={userInfo.userName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {userInfo.userName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {userInfo.schoolName || "Сургууль бүртгэгдээгүй"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-2 bg-black/5 dark:bg-white/10" />

                <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-black/2 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <p className="text-sm font-medium">Харагдац</p>
                    <p className="text-xs text-muted-foreground">
                      Appearance тохируулах
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white/80 dark:border-white/10 dark:bg-white/10">
                    <AnimatedThemeToggler />
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <DropdownMenuItem
                    onClick={() => router.push("/userProfile")}
                    className="h-11 rounded-2xl px-3 text-sm transition-colors hover:bg-black/4 dark:hover:bg-white/10"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span className="flex-1">Профайл</span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowLogoutDialog(true)}
                    className="h-11 rounded-2xl px-3 text-sm text-red-600 transition-colors hover:bg-red-500/10 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="flex-1">Гарах</span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-2xl border border-black/5 bg-white/75 shadow-[0_4px_16px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:hover:bg-white/15"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-75 border-black/5 bg-background/95 p-0 backdrop-blur-2xl dark:border-white/15 dark:bg-background/75 sm:w-87.5"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.8),rgba(255,255,255,0.3),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_40%)]" />

                  <div className="relative flex h-full flex-col">
                    <SheetHeader className="border-b border-black/5 px-5 py-5 text-left dark:border-white/10">
                      <SheetTitle className="flex items-center gap-3 text-base">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white/80 shadow-[0_4px_14px_rgba(0,0,0,0.04)] dark:border-white/20 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                          <Image
                            src="/image/logoLogin.png"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain dark:brightness-0 dark:invert"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span>Admin Panel</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            Навигац
                          </span>
                        </div>
                      </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-1 flex-col gap-3 px-4 py-6">
                      {menuItems.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "group flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-300",
                            "border-black/5 bg-black/2 hover:border-black/10 hover:bg-black/4",
                            "dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10",
                            isActive(item.href) &&
                              "border-primary/20 bg-primary/8 text-primary shadow-[0_4px_14px_rgba(0,0,0,0.04)] dark:bg-primary/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
                          )}
                        >
                          <span>{item.title}</span>
                          <ChevronRight className="h-4 w-4 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                      ))}

                      <div className="mt-auto rounded-2xl border border-black/5 bg-black/2 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="sm:hidden">
                          <ServerDate />
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="border-black/5 bg-background/95 backdrop-blur-2xl dark:border-white/15 dark:bg-background/80">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <LogOut className="h-5 w-5 text-red-600" />
              </span>
              Гарахдаа итгэлтэй байна уу?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Та системээс гарахдаа итгэлтэй байна уу?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-xl bg-red-600 hover:bg-red-700"
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
            "rounded-full object-cover ring-2 ring-black/5 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:ring-white/30 dark:shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
            sizeMap[size],
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border border-black/5 bg-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:border-white/20 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
            sizeMap[size],
          )}
        >
          <User className="h-5 w-5 text-primary" />
        </div>
      )}
      {showOnlineStatus && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500 shadow-sm" />
      )}
    </div>
  );
};
