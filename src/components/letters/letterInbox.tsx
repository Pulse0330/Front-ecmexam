"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Loader2, Mail, MailOpen } from "lucide-react";
import Link from "next/link";
import { type RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { LetterListItem } from "@/types/letter/type";
import { ClosedEnvelope } from "./envelope";
import { useLetterAccess } from "./letterAccess";
import { LetterReader } from "./letterPaper";
import { LetterRowContent } from "./letterRow";
import { useLetterInbox, useLetterUnread } from "./useLetters";

const DROPDOWN_LIMIT = 8;

export function LetterInbox() {
	const access = useLetterAccess();
	if (access !== "allowed") return null;
	return <LetterInboxInner />;
}

function LetterInboxInner() {
	const { data: counts } = useLetterUnread();
	const unread = counts?.unread ?? 0;
	const urgent = counts?.urgent ?? 0;

	const [open, setOpen] = useState(false);
	const reduce = useReducedMotion();
	const iconRef = useRef<HTMLButtonElement>(null);

	// Шинэ захидал ирсэн мэдэгдэл (дугтуй нисч icon руу орно)
	const [arrival, setArrival] = useState(0);

	// Жагсаалтыг dropdown нээгдэх, эсвэл мэдэгдэл гарах үед л татна
	const inbox = useLetterInbox(open || arrival > 0);
	const items = inbox.items.slice(0, DROPDOWN_LIMIT);
	const newest = inbox.items.find((i) => i.is_read !== 1);

	// Хаах хөдөлгөөний үеэр DialogTitle алга болохгүйн тулд тусад нь хадгална
	const [selected, setSelected] = useState<LetterListItem | null>(null);
	const [letterOpen, setLetterOpen] = useState(false);
	const closeLetter = () => setLetterOpen(false);

	const [shakeKey, setShakeKey] = useState(0);

	// Уншаагүй тоо өсөхөд мэдэгдэл гаргана. Нэг тоонд session-д нэг л удаа
	useEffect(() => {
		const KEY = "letter-notified";
		let notified = 0;
		try {
			notified = Number(sessionStorage.getItem(KEY) ?? 0);
			if (unread < notified) sessionStorage.setItem(KEY, String(unread));
		} catch {
			/* storage хаалттай */
		}
		if (unread > notified) {
			try {
				sessionStorage.setItem(KEY, String(unread));
			} catch {
				/* noop */
			}
						setArrival((a) => a + 1);
		}
	}, [unread]);

	const openLetter = (item: LetterListItem) => {
		setSelected(item);
		setLetterOpen(true);
	};

	return (
		<>
			<DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						ref={iconRef}
						variant="ghost"
						size="icon"
						className="relative h-10 w-10 rounded-lg"
						aria-label={unread ? `Захидал, ${unread} уншаагүй` : "Захидал"}
					>
						<motion.span
							key={shakeKey}
							className="inline-flex origin-top"
							animate={shakeKey ? { rotate: [0, -14, 12, -10, 8, -4, 0] } : {}}
							transition={{ duration: 0.9, ease: "easeInOut" }}
						>
							<Mail className="h-5 w-5" />
						</motion.span>

						{unread > 0 && (
							<span className="absolute top-0.5 right-0.5 flex">
								<span
									className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60"
									// Яаралтай захидал байвал байнга, үгүй бол 3 удаа анивчина
									style={{
										animationIterationCount: urgent > 0 ? "infinite" : 3,
									}}
								/>
								<motion.span
									key={unread}
									initial={{ scale: 0.4 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 500, damping: 18 }}
									className="relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background"
								>
									{unread > 9 ? "9+" : unread}
								</motion.span>
							</span>
						)}
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					align="end"
					sideOffset={8}
					className="w-[calc(100vw-2rem)] max-w-sm rounded-xl p-0 shadow-lg sm:w-96"
				>
					<div className="flex items-center justify-between gap-2 border-b px-4 py-3">
						<div>
							<p className="text-sm font-semibold">Захидал</p>
							<p className="text-xs text-muted-foreground">
								{unread > 0 ? `${unread} уншаагүй` : "Бүгдийг уншсан"}
								{urgent > 0 && (
									<span className="font-medium text-red-500">
										{" "}
										· {urgent} яаралтай
									</span>
								)}
							</p>
						</div>
					</div>

					{inbox.isLoading ? (
						<div className="flex justify-center py-10">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : items.length === 0 ? (
						<div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-muted-foreground">
							<MailOpen className="h-8 w-8 opacity-40" />
							<p className="text-sm">Захидал алга байна</p>
						</div>
					) : (
						<div className="max-h-[min(26rem,60vh)] overflow-y-auto p-1.5">
							{items.map((item) => (
								<DropdownMenuItem
									key={item.id}
									onSelect={() => openLetter(item)}
									className={cn(
										"cursor-pointer rounded-lg px-3 py-3",
										item.is_read !== 1 && "bg-primary/5",
									)}
								>
									<LetterRowContent item={item} />
								</DropdownMenuItem>
							))}
						</div>
					)}

					<div className="border-t p-1.5">
						<Link
							href="/letter"
							onClick={() => setOpen(false)}
							className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						>
							Бүх захидлыг харах
							<ArrowRight className="h-3.5 w-3.5" />
						</Link>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>

				{arrival > 0 && (
				<LetterArrival
					key={arrival}
					targetRef={iconRef}
					reduce={Boolean(reduce)}
					onLanded={() => {
						setArrival(0);
						setShakeKey((k) => k + 1);
					}}
					onOpen={() => {
						setArrival(0);
						if (newest) openLetter(newest);
						else setOpen(true);
					}}
				/>
			)}

			<Dialog open={letterOpen} onOpenChange={setLetterOpen}>
				<DialogContent
					aria-describedby={undefined}
					className="gap-2 overflow-hidden border-0 bg-transparent p-3 shadow-none sm:max-w-2xl [&>button]:hidden"
				>
					<DialogTitle className="sr-only">
						{selected?.subject ?? "Захидал"}
					</DialogTitle>
					{selected && (
						<>
							<LetterReader
								key={selected.id}
								letterId={selected.id}
								className="h-[min(80dvh,920px)]"
							/>
							<div className="flex items-center justify-center gap-4 text-sm">
								<button
									type="button"
									onClick={closeLetter}
									className="rounded-full bg-white/15 px-4 py-1.5 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
								>
									Хаах
								</button>
								<Link
									href={`/letter?id=${selected.id}`}
									onClick={closeLetter}
									className="font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
								>
									Захидлын хуудсанд нээх
								</Link>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

// ============================================================================
// Шинэ захидал ирсэн мэдэгдэл: дугтуй дэлгэцийн дээд хэсэгт гарч ирээд
// navbar-ын захидлын icon руу нисч орно. Дугтуй дээр дарвал шууд нээнэ.
// ============================================================================
const ARRIVAL_SEC = 2.8;

function LetterArrival({
	targetRef,
	reduce,
	onLanded,
	onOpen,
}: {
	targetRef: RefObject<HTMLButtonElement | null>;
	reduce: boolean; // Windows "Animation effects" унтраалттай үед зөөлөн хувилбар
	onLanded: () => void;
	onOpen: () => void;
}) {
	const [path, setPath] = useState<{
		sx: number;
		sy: number;
		tx: number;
		ty: number;
	} | null>(null);

	// Бүтэн дэлгэцийн зар (splash) харагдаж байвал түүнийг хаагдтал хүлээнэ
	useEffect(() => {
		let timer = 0;
		const start = () => {
			if (document.querySelector("[data-splash-ad]")) {
				timer = window.setTimeout(start, 500);
				return;
			}
			const rect = targetRef.current?.getBoundingClientRect();
			const sx = window.innerWidth / 2;
			const sy = Math.min(window.innerHeight * 0.3, 240);
			setPath({
				sx,
				sy,
				tx: rect ? rect.left + rect.width / 2 : window.innerWidth - 40,
				ty: rect ? rect.top + rect.height / 2 : 32,
			});
		};
		timer = window.setTimeout(start, 600);
		return () => clearTimeout(timer);
	}, [targetRef]);

	if (!path) return null;

	const W = 88;
	const H = Math.round(W * 0.66);
	const { sx, sy, tx, ty } = path;
	const times = [0, 0.12, 0.6, 0.78, 1];

	// Хөдөлгөөн багасгасан горим: icon-ы доороос шууд дотор нь орно
	const envelopeAnimate = reduce
		? {
				x: [tx, tx, tx],
				y: [ty + 70, ty + 70, ty],
				scale: [1, 1, 0.25],
				opacity: [0, 1, 0],
				rotate: [0, 0, 0],
			}
		: {
				x: [sx, sx, sx, sx + (tx - sx) * 0.45, tx],
				y: [sy + 30, sy, sy, Math.min(sy, ty) - 50, ty],
				scale: [0.4, 1, 1, 0.75, 0.18],
				opacity: [0, 1, 1, 1, 0.6],
				rotate: [-10, 0, 0, 12, 0],
			};
	const envelopeTransition = reduce
		? { duration: 1.6, times: [0, 0.6, 1], ease: "easeInOut" as const }
		: { duration: ARRIVAL_SEC, times, ease: "easeInOut" as const };

	return createPortal(
		<div className="pointer-events-none fixed inset-0 z-[90]">
			{/* Дугтуй */}
			<motion.button
				type="button"
				aria-label="Шинэ захидлыг нээх"
				onClick={onOpen}
				className="pointer-events-auto absolute top-0 left-0 cursor-pointer"
				style={{ width: W, height: H, marginLeft: -W / 2, marginTop: -H / 2 }}
				initial={
					reduce
						? { x: tx, y: ty + 70, scale: 1, opacity: 0, rotate: 0 }
						: { x: sx, y: sy + 30, scale: 0.4, opacity: 0, rotate: -10 }
				}
				animate={envelopeAnimate}
				transition={envelopeTransition}
				onAnimationComplete={onLanded}
			>
				{/* Хүлээх үеэр бага зэрэг ганхана */}
				<motion.span
					className="block"
					animate={{ rotate: [0, -5, 5, -3, 0] }}
					transition={{ delay: 0.5, duration: 0.8 }}
				>
					<ClosedEnvelope width={W} />
				</motion.span>
			</motion.button>
		</div>,
		document.body,
	);
}