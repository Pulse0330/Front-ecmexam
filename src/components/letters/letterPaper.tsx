"use client";

import {
	AnimatePresence,
	animate,
	motion,
	type PanInfo,
	useMotionValue,
	useReducedMotion,
	useTransform,
} from "framer-motion";
import {
	AlertCircle,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	FileText,
	Loader2,
	X,
} from "lucide-react";
import { Caveat, Noto_Serif } from "next/font/google";
import Image from "next/image";
import {
	Fragment,
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import type { LetterDetailData, LetterFile } from "@/types/letter/type";
import {
	countWords,
	cutHtml,
	htmlToBlocks,
	sanitizeLetterHtml,
	tokenizeHtml,
} from "./letterHtml";
import {
	formatFileSize,
	formatLetterDate,
	formatLongLetterDate,
	initialOf,
	isImageFile,
	isUrgentLetter,
	letterTypeClass,
} from "./letterUi";
import { useAckLetter, useLetterDetail } from "./useLetters";

// Кирилл (ө, ү) үсгийг бүрэн дэмждэг фонтууд
const serif = Noto_Serif({
	subsets: ["cyrillic", "cyrillic-ext", "latin"],
	weight: ["400", "600"],
	style: ["normal", "italic"],
	display: "swap",
});
const hand = Caveat({
	subsets: ["cyrillic", "cyrillic-ext", "latin"],
	weight: ["500"],
	display: "swap",
});

const useIsoLayoutEffect =
	typeof window !== "undefined" ? useLayoutEffect : useEffect;

const PAPER_RATIO = Math.SQRT2; // A4 цаасны харьцаа (1.414)
const MAX_PAPER_W = 640;
const CONTROLS_H = 56;
const FOLIO_H = 18;
const ATTACH_HEADING_H = 28;
const SWIPE_OFFSET = 70;
const SWIPE_VELOCITY = 450;
const MAX_DOTS = 7;

// Захидлын агуулгын HTML стиль (хэмжигч болон харагдах хэсэгт ижил)
const HTML_STYLE =
	"[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_blockquote]:border-l-2 [&_blockquote]:border-current/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_h4]:font-semibold [&_strong]:font-semibold [&_b]:font-semibold";

type PageItem =
	| { kind: "fixed"; key: "header" | "signature" }
	| { kind: "html"; key: string; tag: string; html: string }
	| { kind: "images"; key: string; files: LetterFile[] }
	| { kind: "docs"; key: string; files: LetterFile[] };

type SheetCustom = { dir: number; w: number; reduce: boolean };

// ============================================================================
// Хуудас эргүүлэх хөдөлгөөн
// ============================================================================
const sheetVariants = {
	enter: ({ dir, w, reduce }: SheetCustom) =>
		reduce || dir === 0
			? { x: 0, y: 0, scale: 1, opacity: 0, zIndex: 2 }
			: dir > 0
				? { x: 0, y: 10, scale: 0.95, opacity: 1, zIndex: 1 }
				: { x: -w * 1.15, y: 0, scale: 1, opacity: 1, zIndex: 3 },
	center: ({ reduce }: SheetCustom) => ({
		x: 0,
		y: 0,
		scale: 1,
		opacity: 1,
		zIndex: 2,
		transition: reduce
			? { duration: 0.2 }
			: { type: "spring" as const, stiffness: 260, damping: 30 },
	}),
	exit: ({ dir, w, reduce }: SheetCustom) =>
		reduce || dir === 0
			? { opacity: 0, zIndex: 1, transition: { duration: 0.15 } }
			: dir > 0
				? {
						x: -w * 1.15,
						zIndex: 3,
						transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
					}
				: {
						y: 10,
						scale: 0.95,
						opacity: 0,
						zIndex: 1,
						transition: { duration: 0.3 },
					},
};

function useElementSize(ref: React.RefObject<HTMLElement | null>) {
	const [size, setSize] = useState({ width: 0, height: 0 });
	useIsoLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => {
			const width = Math.round(entry.contentRect.width);
			const height = Math.round(entry.contentRect.height);
			setSize((s) =>
				s.width === width && s.height === height ? s : { width, height },
			);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, [ref]);
	return size;
}

// ============================================================================
// API-аас татаж харуулах
// ============================================================================
export function LetterReader({
	letterId,
	className,
}: {
	letterId: number;
	className?: string;
}) {
	const { data, isLoading, isError, refetch } = useLetterDetail(letterId);
	const ack = useAckLetter();

	if (isLoading) {
		return (
			<div className={cn("flex w-full items-center justify-center", className)}>
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (isError || !data?.letter) {
		return (
			<div
				className={cn(
					"flex w-full flex-col items-center justify-center gap-3 text-center text-muted-foreground",
					className,
				)}
			>
				<AlertCircle className="h-8 w-8 opacity-50" />
				<p className="text-sm">Захидлыг нээж чадсангүй</p>
				<button
					type="button"
					onClick={() => refetch()}
					className="rounded-full bg-background px-4 py-1.5 text-sm font-medium shadow-sm ring-1 ring-border hover:bg-accent"
				>
					Дахин оролдох
				</button>
			</div>
		);
	}

	return (
		<LetterPaper
			key={data.letter.id}
			data={data}
			className={className}
			ackPending={ack.isPending}
			onAck={() => ack.mutate(data.letter.id)}
		/>
	);
}

// ============================================================================
// Цаасан захидал — хуудаслагдсан, шудрах боломжтой, scroll-гүй
// ============================================================================
interface LetterPaperProps {
	data: LetterDetailData;
	className?: string;
	onAck?: () => void;
	ackPending?: boolean;
}

export function LetterPaper({
	data,
	className,
	onAck,
	ackPending,
}: LetterPaperProps) {
	const reduce = Boolean(useReducedMotion());
	const letter = data.letter;
	const files = data.files ?? [];
	const images = useMemo(
		() => files.filter((f) => isImageFile(f.file_ext)),
		[files],
	);
	const docs = useMemo(
		() => files.filter((f) => !isImageFile(f.file_ext)),
		[files],
	);

	// ===== Хэмжээ =====
	const wrapRef = useRef<HTMLDivElement>(null);
	const { width: availW, height: availH } = useElementSize(wrapRef);
	const paperW = Math.min(availW, MAX_PAPER_W);
	const paperH = Math.max(
		0,
		Math.min(availH - CONTROLS_H, Math.round(paperW * PAPER_RATIO)),
	);
	const compact = paperW < 520;
	const padX = compact ? 22 : 44;
	const padY = compact ? 26 : 40;
	const gap = compact ? 12 : 16;
	const contentW = paperW - padX * 2;
	const contentH = paperH - padY * 2 - FOLIO_H;
	const bodyClass = cn(
		HTML_STYLE,
		compact ? "text-[14px] leading-[1.75]" : "text-[15.5px] leading-[1.85]",
	);

	// ===== Агуулга =====
	const blocks = useMemo(
		() => htmlToBlocks(sanitizeLetterHtml(letter.body ?? "")),
		[letter.body],
	);

	const renderFixed = (
		key: "header" | "signature",
		intro: boolean,
	): ReactNode =>
		key === "header" ? (
			<div className="flex flex-col">
				<div className="flex items-start justify-between gap-5">
					<div className="min-w-0 space-y-1 pt-1">
						<p className="font-sans text-[10px] uppercase tracking-[0.25em] opacity-50">
							Илгээгч
						</p>
						<p
							className={cn("font-semibold", compact ? "text-sm" : "text-base")}
						>
							{letter.sender_name}
						</p>
						{letter.sender_title && (
							<p className="text-sm italic leading-snug opacity-70">
								{letter.sender_title}
							</p>
						)}
						{letter.sender_org && (
							<p className="text-xs opacity-60">{letter.sender_org}</p>
						)}
					</div>
					<Stamp
						name={letter.sender_name}
						photo={letter.sender_photo}
						date={letter.send_date}
						compact={compact}
						intro={intro}
					/>
				</div>
				<div className="mt-5 flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-wrap items-center gap-1.5 font-sans">
						{letter.type_name && (
							<span
								className={cn(
									"rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
									letterTypeClass(letter.type_color),
								)}
							>
								{letter.type_name}
							</span>
						)}
						{isUrgentLetter(letter.priority) && (
							<span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
								Яаралтай
							</span>
						)}
					</div>
					<p className="text-sm italic opacity-60">
						{formatLongLetterDate(letter.send_date)}
					</p>
				</div>
				<h2
					className={cn(
						"mt-4 font-semibold leading-snug tracking-tight",
						compact ? "text-xl" : "text-2xl",
					)}
				>
					{letter.subject}
				</h2>
				<div className="mt-3 h-px w-16 bg-current opacity-20" />
			</div>
		) : (
			<div className="flex flex-col items-end pt-2 text-right">
				<p className="text-sm italic opacity-60">Хүндэтгэсэн,</p>
				<motion.p
					className={cn(
						hand.className,
						"mt-1 leading-tight",
						compact ? "text-4xl" : "text-5xl",
					)}
					initial={intro ? { clipPath: "inset(0 100% 0 0)" } : false}
					animate={{ clipPath: "inset(0 0% 0 0)" }}
					transition={{ delay: 0.4, duration: 1.1, ease: "easeOut" }}
				>
					{letter.sender_name}
				</motion.p>
				<p className="mt-1 text-sm font-semibold">{letter.sender_name}</p>
				{letter.sender_title && (
					<p className="max-w-[80%] text-xs italic leading-snug opacity-60">
						{letter.sender_title}
					</p>
				)}
			</div>
		);

	// ===== Фонт ачаалсны дараа дахин хэмжинэ =====
	const [fontsReady, setFontsReady] = useState(false);
	useEffect(() => {
		let alive = true;
		if (!document.fonts) {
			setFontsReady(true);
			return;
		}
		document.fonts.ready.then(() => alive && setFontsReady(true));
		return () => {
			alive = false;
		};
	}, []);

	// ===== Хуудаслах =====
	const measureRef = useRef<HTMLDivElement>(null);
	const probeRef = useRef<HTMLDivElement>(null);
	const [pages, setPages] = useState<PageItem[][] | null>(null);

	useIsoLayoutEffect(() => {
		const root = measureRef.current;
		const probe = probeRef.current;
		if (!root || !probe || contentW <= 0 || contentH <= 0) return;

		const fixedHeight = (key: string) =>
			root.querySelector<HTMLElement>(`[data-mkey="${key}"]`)?.offsetHeight ??
			0;
		const htmlHeight = (tag: string, html: string) => {
			probe.innerHTML = `<${tag}>${html}</${tag}>`;
			return probe.offsetHeight;
		};
		const lineH = htmlHeight("p", "А");

		const result: PageItem[][] = [[]];
		let used = 0;
		const current = () => result[result.length - 1];
		const room = () => contentH - used - (current().length ? gap : 0);
		const push = (item: PageItem, h: number) => {
			used += (current().length ? gap : 0) + h;
			current().push(item);
		};
		const newPage = () => {
			result.push([]);
			used = 0;
		};
		const pushFixed = (key: "header" | "signature") => {
			const h = fixedHeight(key);
			if (h > room() && current().length) newPage();
			push({ kind: "fixed", key }, h);
		};

		pushFixed("header");

		blocks.forEach((block, bi) => {
			let rest = block.html;
			let part = 0;
			while (rest) {
				const h = htmlHeight(block.tag, rest);
				if (h <= room()) {
					push(
						{ kind: "html", key: `b${bi}-${part}`, tag: block.tag, html: rest },
						h,
					);
					break;
				}
				// Багтах үгийн тоог хайна (binary search)
				const tokens = tokenizeHtml(rest);
				const total = countWords(tokens);
				const available = room();
				let lo = 0;
				let hi = total;
				while (lo < hi) {
					const mid = Math.ceil((lo + hi) / 2);
					if (htmlHeight(block.tag, cutHtml(tokens, mid)[0]) <= available)
						lo = mid;
					else hi = mid - 1;
				}
				// Ганц мөр л багтах бол бүхэлд нь дараагийн хуудас руу (өнчин мөр үлдээхгүй)
				if (
					current().length &&
					(lo === 0 ||
						htmlHeight(block.tag, cutHtml(tokens, lo)[0]) < lineH * 2)
				) {
					newPage();
					continue;
				}
				const [head, tail] = cutHtml(tokens, Math.max(lo, 1));
				push(
					{ kind: "html", key: `b${bi}-${part}`, tag: block.tag, html: head },
					htmlHeight(block.tag, head),
				);
				rest = tail.trim() ? tail : "";
				part++;
				newPage();
			}
		});

		pushFixed("signature");

		// ===== Хавсралт — тусдаа хуудсууд =====
		const thumbW = (contentW - gap) / 2;
		const thumbH = Math.round(thumbW * 0.75);
		const rows = Math.max(
			1,
			Math.floor((contentH - ATTACH_HEADING_H + gap) / (thumbH + gap)),
		);
		const perPage = rows * 2;
		for (let i = 0; i < images.length; i += perPage) {
			result.push([
				{ kind: "images", key: `img${i}`, files: images.slice(i, i + perPage) },
			]);
		}
		const docsPerPage = Math.max(
			1,
			Math.floor((contentH - ATTACH_HEADING_H) / 56),
		);
		for (let i = 0; i < docs.length; i += docsPerPage) {
			result.push([
				{ kind: "docs", key: `doc${i}`, files: docs.slice(i, i + docsPerPage) },
			]);
		}

		probe.innerHTML = "";
		setPages(result.filter((p) => p.length > 0));
	}, [blocks, images, docs, contentW, contentH, gap, compact, fontsReady]);

	// ===== Дугтуй нээгдэх хөдөлгөөн → дараа нь цаас =====
	const [opened, setOpened] = useState(reduce);
	useEffect(() => {
		if (reduce) {
			setOpened(true);
			return;
		}
		const t = setTimeout(() => setOpened(true), 1450);
		return () => clearTimeout(t);
	}, [reduce]);

	// ===== Хуудас солих =====
	const total = pages?.length ?? 1;
	const [[rawIndex, dir], setNav] = useState<[number, number]>([0, 0]);
	const index = Math.min(rawIndex, total - 1);
	const [viewer, setViewer] = useState<number | null>(null); // зураг томоор үзэх

	const go = useCallback(
		(d: number) =>
			setNav(([i]) => {
				const next = Math.max(0, Math.min(total - 1, i + d));
				return next === i ? [i, 0] : [next, d];
			}),
		[total],
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement | null;
			if (
				t &&
				(t.tagName === "INPUT" ||
					t.tagName === "TEXTAREA" ||
					t.isContentEditable)
			)
				return;
			if (viewer !== null) {
				if (e.key === "ArrowRight")
					setViewer((v) =>
						v === null ? v : Math.min(images.length - 1, v + 1),
					);
				if (e.key === "ArrowLeft")
					setViewer((v) => (v === null ? v : Math.max(0, v - 1)));
				return;
			}
			if (e.key === "ArrowRight") go(1);
			if (e.key === "ArrowLeft") go(-1);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [go, viewer, images.length]);

	// Хөдөлгөөн (марк, гарын үсэг) хуудас бүрийг анх үзэхэд л нэг удаа
	const seen = useRef<Set<string>>(new Set());
	const seenKey = `${letter.id}:${index}`;
	const intro = !reduce && !seen.current.has(seenKey);
	useEffect(() => {
		seen.current.add(seenKey);
	}, [seenKey]);

	const remainingBelow = total - 1 - index;
	const custom: SheetCustom = { dir, w: paperW, reduce };
	const needsAck = letter.require_ack && !letter.ack_date;
	const showControls =
		opened && paperH > 0 && (total > 1 || letter.require_ack);

	const renderItem = (item: PageItem) => {
		switch (item.kind) {
			case "fixed":
				return (
					<Fragment key={item.key}>{renderFixed(item.key, intro)}</Fragment>
				);
			case "html":
				return (
					<div
						key={item.key}
						className={bodyClass}
						dangerouslySetInnerHTML={{
							__html: `<${item.tag}>${item.html}</${item.tag}>`,
						}}
					/>
				);
			case "images":
				return (
					<div key={item.key} className="flex flex-col" style={{ gap }}>
						<p
							className="font-sans text-xs font-medium uppercase tracking-[0.2em] opacity-50"
							style={{ height: ATTACH_HEADING_H - gap }}
						>
							Хавсралт · {images.length} зураг
						</p>
						<div className="grid grid-cols-2" style={{ gap }}>
							{item.files.map((file) => {
								const idx = images.indexOf(file);
								return (
									<button
										key={file.filename}
										type="button"
										onClick={() => setViewer(idx)}
										className="relative aspect-[4/3] overflow-hidden rounded-sm bg-black/5 shadow-sm ring-1 ring-black/10 transition-transform hover:scale-[1.02] dark:bg-white/5"
									>
										<Image
											src={file.file_url}
											alt={file.uploaded}
											fill
											sizes="300px"
											draggable={false}
											className="object-cover"
										/>
									</button>
								);
							})}
						</div>
					</div>
				);
			case "docs":
				return (
					<div key={item.key} className="flex flex-col gap-2">
						<p
							className="font-sans text-xs font-medium uppercase tracking-[0.2em] opacity-50"
							style={{ height: ATTACH_HEADING_H - 8 }}
						>
							Хавсралт файл
						</p>
						{item.files.map((file) => (
							<a
								key={file.filename}
								href={file.file_url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 rounded-md border border-current/15 px-3 py-2 font-sans text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
							>
								<FileText className="h-5 w-5 shrink-0 opacity-60" />
								<span className="min-w-0 flex-1 truncate">{file.uploaded}</span>
								<span className="shrink-0 text-xs opacity-50">
									{formatFileSize(file.file_size)}
								</span>
							</a>
						))}
					</div>
				);
		}
	};

	const folio =
		total > 1 && index === 0
			? "Зүүн тийш шударч үргэлжлүүлэн уншина уу →"
			: total > 1
				? `— ${index + 1} / ${total} —`
				: "";

	return (
		<div
			ref={wrapRef}
			className={cn("relative flex w-full flex-col items-center", className)}
		>
			<AnimatePresence mode="wait">
				{paperH > 0 && !opened && (
					<EnvelopeOpen
						key="envelope"
						width={paperW}
						height={paperH}
						sender={letter.sender_name}
						onSkip={() => setOpened(true)}
					/>
				)}

				{paperH > 0 && opened && (
					<motion.div
						key="paper"
						className="relative shrink-0"
						style={{ width: paperW, height: paperH }}
						initial={
							reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.92 }
						}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ type: "spring", stiffness: 200, damping: 24 }}
					>
						{/* Ард талын хуудсууд */}
						{[2, 1].map((n) =>
							n === 1 || remainingBelow >= n ? (
								<div
									key={n}
									aria-hidden
									className="absolute inset-0 rounded-sm bg-[#f1ece0] shadow-md transition-transform duration-300 dark:bg-[#1a1815]"
									style={{
										transform: `translateY(${n * 4}px) rotate(${n * 1.1}deg)`,
									}}
								/>
							) : null,
						)}

						{pages ? (
							<AnimatePresence initial={false} custom={custom}>
								<Sheet
									key={seenKey}
									custom={custom}
									canPrev={index > 0}
									canNext={index < total - 1}
									nudge={intro && index === 0 && total > 1}
									onSwipe={go}
								>
									<div
										className={cn(
											serif.className,
											"relative h-full overflow-hidden rounded-sm shadow-xl",
											"bg-[#fbf8f1] text-[#2b2620] dark:bg-[#23211d] dark:text-[#ebe5d9]",
										)}
										style={{ padding: `${padY}px ${padX}px` }}
									>
										{["top-1/3", "top-2/3"].map((pos) => (
											<div
												key={pos}
												aria-hidden
												className={cn(
													"pointer-events-none absolute inset-x-0 h-px bg-black/[0.05] shadow-[0_1px_0_rgba(255,255,255,0.7)] dark:bg-black/30 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]",
													pos,
												)}
											/>
										))}
										<div
											className="relative flex flex-col"
											style={{ gap, height: contentH }}
										>
											{pages[index].map(renderItem)}
										</div>
										<p
											className="absolute inset-x-0 text-center text-[11px] italic opacity-40"
											style={{ bottom: Math.round(padY * 0.55) }}
										>
											{folio}
										</p>
									</div>
								</Sheet>
							</AnimatePresence>
						) : (
							<div className="absolute inset-0 animate-pulse rounded-sm bg-[#fbf8f1] dark:bg-[#23211d]" />
						)}

						{/* Зураг томоор үзэх — цаасны талбай дотор */}
						<AnimatePresence>
							{viewer !== null && images[viewer] && (
								<motion.div
									key="viewer"
									className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-sm bg-black/90"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
								>
									<motion.div
										key={viewer}
										className="relative h-full w-full"
										drag="x"
										dragConstraints={{ left: 0, right: 0 }}
										dragElastic={0.6}
										onDragEnd={(_, info) => {
											if (info.offset.x < -SWIPE_OFFSET)
												setViewer((v) =>
													v === null ? v : Math.min(images.length - 1, v + 1),
												);
											else if (info.offset.x > SWIPE_OFFSET)
												setViewer((v) => (v === null ? v : Math.max(0, v - 1)));
										}}
										initial={{ opacity: 0, scale: 0.96 }}
										animate={{ opacity: 1, scale: 1 }}
									>
										<Image
											src={images[viewer].file_url}
											alt={images[viewer].uploaded}
											fill
											sizes="640px"
											draggable={false}
											className="object-contain"
										/>
									</motion.div>
									<button
										type="button"
										aria-label="Хаах"
										onClick={() => setViewer(null)}
										className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
									>
										<X className="h-5 w-5" />
									</button>
									<span className="absolute bottom-3 rounded-full bg-white/15 px-3 py-1 text-xs tabular-nums text-white">
										{viewer + 1} / {images.length}
									</span>
									{viewer > 0 && (
										<button
											type="button"
											aria-label="Өмнөх зураг"
											onClick={() => setViewer(viewer - 1)}
											className="absolute left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
										>
											<ChevronLeft className="h-5 w-5" />
										</button>
									)}
									{viewer < images.length - 1 && (
										<button
											type="button"
											aria-label="Дараагийн зураг"
											onClick={() => setViewer(viewer + 1)}
											className="absolute right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
										>
											<ChevronRight className="h-5 w-5" />
										</button>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>
				)}
			</AnimatePresence>

			{/* ===== Удирдлага ===== */}
			{showControls && (
				<div
					className="flex items-center justify-center gap-2"
					style={{ height: CONTROLS_H }}
				>
					{total > 1 && (
						<div className="flex items-center gap-2 rounded-full bg-background/85 px-2 py-1 shadow-sm ring-1 ring-border backdrop-blur-sm">
							<button
								type="button"
								aria-label="Өмнөх хуудас"
								disabled={index === 0}
								onClick={() => go(-1)}
								className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							{total <= MAX_DOTS && (
								<div className="flex items-center gap-1.5">
									{Array.from({ length: total }, (_, i) => (
										<button
											// biome-ignore lint/suspicious/noArrayIndexKey: хуудасны дугаар
											key={i}
											type="button"
											aria-label={`${i + 1}-р хуудас`}
											aria-current={i === index}
											onClick={() =>
												i !== index && setNav([i, i > index ? 1 : -1])
											}
											className={cn(
												"h-1.5 rounded-full transition-all",
												i === index
													? "w-6 bg-foreground/70"
													: "w-1.5 bg-foreground/25 hover:bg-foreground/40",
											)}
										/>
									))}
								</div>
							)}
							<span className="min-w-10 text-center text-xs tabular-nums text-muted-foreground">
								{index + 1}/{total}
							</span>
							<button
								type="button"
								aria-label="Дараагийн хуудас"
								disabled={index === total - 1}
								onClick={() => go(1)}
								className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					)}

					{letter.require_ack &&
						(needsAck ? (
							<button
								type="button"
								onClick={onAck}
								disabled={ackPending}
								className={cn(
									"inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 disabled:opacity-60",
									index === total - 1 && !reduce && "animate-pulse",
								)}
							>
								{ackPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<CheckCircle2 className="h-4 w-4" />
								)}
								Танилцсан
							</button>
						) : (
							<span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-background/85 px-4 text-sm text-emerald-600 shadow-sm ring-1 ring-border dark:text-emerald-400">
								<CheckCircle2 className="h-4 w-4" />
								Танилцсан
								{letter.ack_date && (
									<span className="text-xs text-muted-foreground">
										· {formatLetterDate(letter.ack_date)}
									</span>
								)}
							</span>
						))}
				</div>
			)}

			{/* ===== Нуугдмал хэмжигч ===== */}
			<div
				ref={measureRef}
				aria-hidden
				className={cn(
					serif.className,
					"pointer-events-none invisible absolute top-0 left-0 -z-10",
				)}
				style={{ width: Math.max(contentW, 0) }}
			>
				<div data-mkey="header">{renderFixed("header", false)}</div>
				<div data-mkey="signature">{renderFixed("signature", false)}</div>
				<div ref={probeRef} className={bodyClass} />
			</div>
		</div>
	);
}

// ===== Шудрах боломжтой хуудас =====
function Sheet({
	children,
	custom,
	canPrev,
	canNext,
	nudge,
	onSwipe,
}: {
	children: ReactNode;
	custom: SheetCustom;
	canPrev: boolean;
	canNext: boolean;
	nudge: boolean;
	onSwipe: (dir: number) => void;
}) {
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-300, 0, 300], [-8, 0, 8]);

	useEffect(() => {
		if (!nudge) return;
		const controls = animate(x, [0, -36, 0], {
			duration: 0.9,
			delay: 1.4,
			ease: "easeInOut",
		});
		return () => controls.stop();
	}, [nudge, x]);

	const handleDragEnd = (_: unknown, info: PanInfo) => {
		if (
			canNext &&
			(info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY)
		)
			onSwipe(1);
		else if (
			canPrev &&
			(info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY)
		)
			onSwipe(-1);
	};

	return (
		<motion.div
			custom={custom}
			variants={sheetVariants}
			initial="enter"
			animate="center"
			exit="exit"
			style={{ x, rotate }}
			drag="x"
			dragConstraints={{ left: 0, right: 0 }}
			dragElastic={{ left: canNext ? 0.9 : 0.12, right: canPrev ? 0.9 : 0.12 }}
			onDragEnd={handleDragEnd}
			className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
		>
			{children}
		</motion.div>
	);
}

// ===== Хөрөгтэй марк + шуудангийн тамга =====
function Stamp({
	name,
	photo,
	date,
	compact,
	intro,
}: {
	name: string;
	photo: string | null;
	date: string;
	compact: boolean;
	intro: boolean;
}) {
	return (
		<div className="relative shrink-0">
			<motion.svg
				viewBox="0 0 80 80"
				aria-hidden
				className="absolute top-7 -left-9 z-10 h-14 w-14 text-[#2b2620]/35 dark:text-[#ebe5d9]/30"
				initial={intro ? { opacity: 0, scale: 1.4 } : false}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.55, duration: 0.25 }}
			>
				<title>Шуудангийн тамга</title>
				<circle
					cx="40"
					cy="40"
					r="30"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				/>
				<circle
					cx="40"
					cy="40"
					r="23"
					fill="none"
					stroke="currentColor"
					strokeWidth="0.8"
				/>
				<text
					x="40"
					y="43"
					textAnchor="middle"
					fontSize="8.5"
					fontFamily="ui-sans-serif, system-ui, sans-serif"
					fill="currentColor"
				>
					{formatLetterDate(date)}
				</text>
			</motion.svg>
			<motion.div
				initial={
					intro ? { opacity: 0, scale: 1.5, rotate: -12 } : { rotate: 5 }
				}
				animate={{ opacity: 1, scale: 1, rotate: 5 }}
				transition={{ delay: 0.3, type: "spring", stiffness: 420, damping: 16 }}
				className="bg-white p-1.5 shadow-md dark:bg-[#ebe5d9]"
			>
				<div
					className={cn(
						"relative overflow-hidden border border-dashed border-[#2b2620]/30",
						compact ? "h-20 w-16" : "h-24 w-[4.75rem]",
					)}
				>
					{photo ? (
						<Image
							src={photo}
							alt={name}
							fill
							sizes="80px"
							className="object-cover"
							draggable={false}
						/>
					) : (
						<div className="flex h-full items-center justify-center bg-linear-to-br from-rose-100 to-amber-100 text-4xl font-semibold text-[#2b2620]/70">
							{initialOf(name)}
						</div>
					)}
				</div>
			</motion.div>
		</div>
	);
}

// ============================================================================
// Дугтуй нээгдэж, захидал гарч ирэх хөдөлгөөн (~1.4 сек). Дарвал алгасна
//   0.00с  дугтуй доороос гарч ирнэ
//   0.05с  лац хагарна
//   0.25с  хавтас 3D-ээр эргэж нээгдэнэ
//   0.60с  захидал дотроос дээш гулсана
//   1.45с  дугтуй алга болж, бүтэн цаас гарна
// ============================================================================
function EnvelopeOpen({
	width,
	height,
	sender,
	onSkip,
}: {
	width: number;
	height: number;
	sender: string;
	onSkip: () => void;
}) {
	const ew = Math.min(width * 0.86, 440);
	const eh = Math.round(ew * 0.64);
	const seal = Math.round(ew * 0.13);
	const flapH = Math.round(eh * 0.56);

	return (
		<motion.button
			type="button"
			aria-label="Захидлыг нээх"
			onClick={onSkip}
			className="relative flex shrink-0 cursor-pointer items-center justify-center"
			style={{ width, height }}
			exit={{ opacity: 0, scale: 0.94, y: 24, transition: { duration: 0.22 } }}
		>
			<motion.span
				className="relative block"
				style={{ width: ew, height: eh }}
				initial={{ y: 60, opacity: 0, scale: 0.85, rotate: -4 }}
				animate={{ y: eh * 0.2, opacity: 1, scale: 1, rotate: 0 }}
				transition={{ type: "spring", stiffness: 220, damping: 20 }}
			>
				{/* Дугтуйн ар тал */}
				<span className="absolute inset-0 block rounded-md bg-[#e9dcc0] shadow-2xl dark:bg-[#2f2b25]" />

				{/* Захидал — дотроос дээш гулсана */}
				<motion.span
					className="absolute right-[6%] left-[6%] block overflow-hidden rounded-sm bg-[#fbf8f1] px-[8%] pt-[6%] shadow-md dark:bg-[#23211d]"
					style={{ height: eh * 0.9, bottom: eh * 0.05, zIndex: 1 }}
					initial={{ y: 0 }}
					animate={{ y: -eh * 0.6 }}
					transition={{ delay: 0.6, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
				>
					<span
						className={cn(
							hand.className,
							"block truncate text-left text-[#2b2620]/70 dark:text-[#ebe5d9]/70",
						)}
						style={{ fontSize: Math.max(16, ew * 0.06) }}
					>
						{sender}
					</span>
					{[92, 100, 84, 96, 70].map((w) => (
						<span
							key={w}
							className="mt-[5%] block h-[3px] rounded-full bg-[#2b2620]/10 dark:bg-[#ebe5d9]/10"
							style={{ width: `${w}%` }}
						/>
					))}
				</motion.span>

				{/* Урд халаас — захидлын доод хэсгийг далдална */}
				<span
					className="absolute inset-0 block rounded-md bg-[#efe4cb] dark:bg-[#36322b]"
					style={{
						clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
						zIndex: 2,
					}}
				/>
				<span
					className="pointer-events-none absolute inset-0 block rounded-md"
					style={{
						clipPath: "polygon(0 100%, 50% 48%, 100% 100%)",
						background: "rgba(0,0,0,0.05)",
						zIndex: 2,
					}}
				/>

				{/* Хавтас 1: хаалттай (доош заасан) — захидлын ӨМНӨ. 0→90° эргээд алга болно */}
				<motion.span
					className="absolute inset-x-0 top-0 block bg-[#e3d4b4] dark:bg-[#2b2822]"
					style={{
						height: flapH,
						clipPath: "polygon(0 0, 100% 0, 50% 100%)",
						transformOrigin: "50% 0%",
						transformPerspective: 800,
						zIndex: 3,
					}}
					initial={{ rotateX: 0, opacity: 1 }}
					animate={{ rotateX: 90, transitionEnd: { opacity: 0 } }}
					transition={{ delay: 0.25, duration: 0.22, ease: "easeIn" }}
				/>

				{/* Хавтас 2: нээлттэй (дээш заасан) — захидлын АРД. 90→0° буулгаж нээгдэнэ */}
				<motion.span
					className="absolute inset-x-0 block bg-[#dccca9] dark:bg-[#26231e]"
					style={{
						bottom: "100%",
						height: flapH,
						clipPath: "polygon(0 100%, 100% 100%, 50% 0)",
						transformOrigin: "50% 100%",
						transformPerspective: 800,
						zIndex: 0,
					}}
					initial={{ rotateX: 90 }}
					animate={{ rotateX: 0 }}
					transition={{ delay: 0.47, duration: 0.22, ease: "easeOut" }}
				/>

				{/* Лац — хагарч алга болно */}
				<motion.span
					className="absolute left-1/2 block rounded-full bg-red-600 shadow-md ring-2 ring-red-700/40"
					style={{
						width: seal,
						height: seal,
						top: flapH - seal / 2,
						marginLeft: -seal / 2,
						zIndex: 4,
					}}
					initial={{ scale: 1, opacity: 1 }}
					animate={{ scale: [1, 1.25, 0], opacity: [1, 1, 0] }}
					transition={{ duration: 0.3, delay: 0.05, times: [0, 0.4, 1] }}
				/>
			</motion.span>
		</motion.button>
	);
}