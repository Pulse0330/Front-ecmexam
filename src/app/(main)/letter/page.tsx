"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, MailOpen, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useLetterAccess } from "@/components/letters/letterAccess";
import { LetterReader } from "@/components/letters/letterPaper";
import { LetterRowContent } from "@/components/letters/letterRow";
import { useLetterInbox, useLetterUnread } from "@/components/letters/useLetters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ReadFilter = "all" | "unread";

export default function LetterPage() {
	return (
		<Suspense fallback={<PageLoader />}>
			<LetterGate />
		</Suspense>
	);
}

function LetterGate() {
	const access = useLetterAccess();
	const router = useRouter();

	useEffect(() => {
		if (access === "denied") router.replace("/home");
	}, [access, router]);

	if (access !== "allowed") return <PageLoader />;
	return <LetterPageContent />;
}

function PageLoader() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	);
}

function LetterPageContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const { data: counts } = useLetterUnread();
	const inbox = useLetterInbox();
	const { items, total } = inbox;

	const [readFilter, setReadFilter] = useState<ReadFilter>("all");
	const [query, setQuery] = useState("");

	// Сонгосон захидал URL-д хадгалагдана (/letter?id=2)
	const selectedId = Number(searchParams.get("id")) || null;

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return items.filter((l) => {
			if (readFilter === "unread" && l.is_read === 1 && l.id !== selectedId) return false;
			if (!q) return true;
			return [l.subject, l.sender_name, l.sender_title, l.sender_org, l.type_name]
				.filter(Boolean)
				.some((s) => String(s).toLowerCase().includes(q));
		});
	}, [items, readFilter, query, selectedId]);

	const openLetter = (id: number) => router.push(`${pathname}?id=${id}`, { scroll: false });
	const closeLetter = () => router.push(pathname, { scroll: false });

	const unread = counts?.unread ?? 0;
	const urgent = counts?.urgent ?? 0;

	return (
		<div className="w-full space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
			<header
				className={cn(
					"items-end justify-between gap-4",
					// Утсан дээр захидал нээгдэхэд цаасанд илүү зай гаргана
					selectedId ? "hidden lg:flex" : "flex",
				)}
			>
				<div className="space-y-1">
					<h1 className="text-2xl font-light tracking-tight">Захидал</h1>
					<p className="text-sm text-muted-foreground">
						Нийт {total}
						{unread > 0 && ` · ${unread} уншаагүй`}
						{urgent > 0 && <span className="font-medium text-red-500"> · {urgent} яаралтай</span>}
					</p>
				</div>
			</header>

			<div className="grid gap-4 lg:grid-cols-[minmax(300px,380px)_1fr]">
				{/* ===== Жагсаалт ===== */}
				<section
					className={cn(
						"flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/50 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/50",
						"lg:h-[calc(100vh-15rem)]",
						selectedId && "hidden lg:flex",
					)}
				>
					<div className="space-y-3 border-b p-3">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Гарчиг, илгээгчээр хайх..."
								aria-label="Захидал хайх"
								className="rounded-xl pl-9"
							/>
						</div>
						<div className="flex items-center gap-1 rounded-xl bg-muted p-1">
							{(["all", "unread"] as ReadFilter[]).map((f) => (
								<button
									key={f}
									type="button"
									onClick={() => setReadFilter(f)}
									aria-pressed={readFilter === f}
									className={cn(
										"flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
										readFilter === f
											? "bg-background text-foreground shadow-sm"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{f === "all" ? "Бүгд" : `Уншаагүй${unread ? ` (${unread})` : ""}`}
								</button>
							))}
						</div>
					</div>

					<div className="flex-1 overflow-y-auto p-1.5">
						{inbox.isLoading ? (
							<ListSkeleton />
						) : inbox.isError ? (
							<div className="flex flex-col items-center gap-3 px-4 py-16 text-center text-sm text-muted-foreground">
								<p>Захидлыг ачаалж чадсангүй</p>
								<Button variant="outline" size="sm" onClick={() => inbox.refetch()}>
									Дахин оролдох
								</Button>
							</div>
						) : filtered.length === 0 ? (
							<div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-muted-foreground">
								<MailOpen className="h-8 w-8 opacity-40" />
								<p className="text-sm">
									{items.length === 0 ? "Захидал алга байна" : "Тохирох захидал олдсонгүй"}
								</p>
							</div>
						) : (
							<ul className="space-y-0.5">
								{filtered.map((item, i) => {
									const active = item.id === selectedId;
									return (
										<li key={item.id}>
											<motion.button
												type="button"
												onClick={() => openLetter(item.id)}
												aria-current={active}
												initial={{ opacity: 0, y: 6 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.03 }}
												className={cn(
													"w-full rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent",
													active && "bg-accent",
													!active && item.is_read !== 1 && "bg-primary/5",
												)}
											>
												<LetterRowContent item={item} />
											</motion.button>
										</li>
									);
								})}
							</ul>
						)}

						{inbox.hasNextPage && (
							<div className="p-2">
								<Button
									variant="ghost"
									className="w-full rounded-xl text-muted-foreground"
									disabled={inbox.isFetchingNextPage}
									onClick={() => inbox.fetchNextPage()}
								>
									{inbox.isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" />}
									Цааш үзэх
								</Button>
							</div>
						)}
					</div>
				</section>

				{/* ===== Унших хэсэг — scroll-гүй ===== */}
				<section
					className={cn(
						"overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100/70 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/60",
						"h-[calc(100dvh-9rem)] min-h-[480px] lg:h-[calc(100vh-15rem)]",
						!selectedId && "hidden lg:block",
					)}
				>
					{selectedId ? (
						<div className="flex h-full flex-col gap-3 p-3 sm:p-6">
							<button
								type="button"
								onClick={closeLetter}
								className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
							>
								<ArrowLeft className="h-4 w-4" />
								Буцах
							</button>
							<LetterReader key={selectedId} letterId={selectedId} className="min-h-0 flex-1" />
						</div>
					) : (
						<div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
							<MailOpen className="h-10 w-10 opacity-30" />
							<p className="text-sm">Унших захидлаа сонгоно уу</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

function ListSkeleton() {
	return (
		<div className="space-y-1 p-1.5">
			{[0, 1, 2].map((i) => (
				<div key={i} className="flex animate-pulse gap-3 rounded-xl px-3 py-3">
					<div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
					<div className="flex-1 space-y-2">
						<div className="h-3.5 w-3/4 rounded bg-muted" />
						<div className="h-3 w-1/2 rounded bg-muted" />
						<div className="h-4 w-20 rounded-full bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}