"use client";

import {
	AnimatePresence,
	motion,
	useMotionValue,
	useReducedMotion,
} from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AdLikeButton } from "./adLike";
import { AdLink, AdMedia, type AdMediaType } from "./adShared";
import { trackReklamClick, trackReklamView } from "./reklamtracker";

export interface FloatingAd {
	id: string | number;
	reklamId?: number; // backend-ийн реклам id (статистикт)
	title: string;
	href?: string;
	description?: string;
	image?: string; // зураг эсвэл видеоны URL
	mediaType?: AdMediaType;
	ctaLabel?: string;
	badge?: string;
	durationSec?: number; // өгвөл interval-ийн оронд энэ хугацаагаар солигдоно
	canSkip?: boolean; // false бол хаах товч гарахгүй
}

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type EnterFrom = "left" | "right" | "bottom";
type Variant = "card" | "compact";

const CORNERS: Corner[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

// Desktop (md+): дээд булангууд header-ийн доор (5rem) гарна — header өндрөөсөө хамаарч тохируулаарай
const DESKTOP_POSITION: Record<Corner, string> = {
	"top-left": "fixed z-40 w-64 left-6 top-[calc(5rem+env(safe-area-inset-top))]",
	"top-right": "fixed z-40 w-64 right-6 top-[calc(5rem+env(safe-area-inset-top))]",
	"bottom-left":
		"fixed z-40 w-64 left-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
	"bottom-right":
		"fixed z-40 w-64 right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
};

// Утсан дээр ганц slot, доод талд нимгэн хэвтээ карт (~88px) — дэлгэцийн 30%-иас бага эзэлнэ
const MOBILE_POSITION =
	"fixed z-40 left-4 right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))]";

const STORAGE_PREFIX = "floating-ad-closed:";

function shuffle<T>(list: T[]): T[] {
	const a = [...list];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function useIsDesktop() {
	const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
	useEffect(() => {
		const mq = window.matchMedia("(min-width: 768px)");
		const update = () => setIsDesktop(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);
	return isDesktop;
}

interface AdSlotProps {
	ads: FloatingAd[];
	position: string;
	enterFrom: EnterFrom;
	variant: Variant;
	delay: number;
	interval: number;
}

function AdSlot({
	ads,
	position,
	enterFrom,
	variant,
	delay,
	interval,
}: AdSlotProps) {
	const [visible, setVisible] = useState(false);
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const reduceMotion = useReducedMotion();
	const progress = useMotionValue(0);
	const elapsed = useRef(0);

	const count = ads.length;
	const ad = count ? ads[index % count] : undefined;
	const reklamId = ad?.reklamId;
	const duration =
		ad?.durationSec && ad.durationSec > 0 ? ad.durationSec * 1000 : interval;
	const storageKey = `${STORAGE_PREFIX}${ads.map((a) => a.id).join("|")}`;

	// Хойшлуулж гаргана. Хаасан бол энэ session-д дахин гаргахгүй
	useEffect(() => {
		if (!count) return;
		try {
			if (sessionStorage.getItem(storageKey) === "1") return;
		} catch {
			/* storage хаалттай бол үргэлж харуулна */
		}
		const t = setTimeout(() => setVisible(true), delay);
		return () => clearTimeout(t);
	}, [count, delay, storageKey]);

	// Харагдсан зар бүрийг backend руу илгээнэ (session-д нэг удаа)
	useEffect(() => {
		if (visible) trackReklamView(reklamId);
	}, [visible, reklamId]);

	// Зар солих — hover/focus үед зогсоно. reduce motion үед ч солигдоно (зөвхөн хөдөлгөөн багасна)
	useEffect(() => {
		if (!visible || paused || count <= 1) return;
		let raf = 0;
		let last = performance.now();
		const tick = (now: number) => {
			elapsed.current += now - last;
			last = now;
			if (elapsed.current >= duration) {
				elapsed.current = 0;
				progress.set(0);
				setIndex((i) => (i + 1) % count);
			} else {
				progress.set(elapsed.current / duration);
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [visible, paused, count, duration, progress]);

	const close = () => {
		setVisible(false);
		try {
			sessionStorage.setItem(storageKey, "1");
		} catch {
			/* noop */
		}
	};

	const canClose = ad?.canSkip !== false;
	const offscreen = reduceMotion
		? {}
		: enterFrom === "left"
			? { x: "-120%" }
			: enterFrom === "right"
				? { x: "120%" }
				: { y: "120%" };

	return (
		<AnimatePresence>
			{visible && ad && (
				<motion.aside
					key="slot"
					aria-label="Сурталчилгаа"
					initial={{ ...offscreen, opacity: 0 }}
					animate={{ x: 0, y: 0, opacity: 1 }}
					exit={{ ...offscreen, opacity: 0 }}
					transition={
						reduceMotion
							? { duration: 0.2 }
							: { type: "spring", stiffness: 260, damping: 26 }
					}
					onMouseEnter={() => setPaused(true)}
					onMouseLeave={() => setPaused(false)}
					onFocus={() => setPaused(true)}
					onBlur={() => setPaused(false)}
					onKeyDown={(e) => canClose && e.key === "Escape" && close()}
					className={position}
				>
					<div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-xl shadow-zinc-900/10 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/95">
						{canClose && (
							<button
								type="button"
								aria-label="Хаах"
								onClick={close}
								className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900/60 text-white backdrop-blur-sm transition-colors hover:bg-zinc-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
							>
								<X className="h-3 w-3" />
							</button>
						)}

						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={ad.id}
								initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
								transition={{ duration: 0.25 }}
							>
								<CardAd ad={ad} variant={variant} />
							</motion.div>
						</AnimatePresence>

						{/* Холбоосны гадна байрлуулсан тул дарахад зар руу шилжихгүй */}
						<AdLikeButton
							key={ad.id}
							reklamId={ad.reklamId}
							variant="icon"
							className="absolute right-1.5 bottom-2 z-10"
						/>

						{count > 1 && (
							<motion.div
								aria-hidden
								className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-zinc-900/60 dark:bg-white/60"
								style={{ scaleX: progress }}
							/>
						)}
					</div>
				</motion.aside>
			)}
		</AnimatePresence>
	);
}

function CardAd({ ad, variant }: { ad: FloatingAd; variant: Variant }) {
	const onClick = ad.href ? () => trackReklamClick(ad.reklamId) : undefined;

	if (variant === "compact") {
		return (
			<AdLink
				href={ad.href}
				onClick={onClick}
				className="group/ad flex items-center gap-3 p-2.5 pr-9 focus-visible:outline-none"
			>
				{ad.image && (
					<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
						<AdMedia src={ad.image} type={ad.mediaType} sizes="64px" />
					</div>
				)}
				<div className="min-w-0 space-y-0.5">
					<p className="line-clamp-1 text-[13px] font-semibold leading-snug">
						{ad.title}
					</p>
					{ad.description && (
						<p className="line-clamp-1 text-[11px] text-muted-foreground">
							{ad.description}
						</p>
					)}
					{ad.href && (
						<span className="inline-flex items-center gap-1 text-[11px] font-medium transition-all group-hover/ad:gap-1.5">
							{ad.ctaLabel ?? "Дэлгэрэнгүй"}
							<ArrowRight className="h-3 w-3" />
						</span>
					)}
				</div>
			</AdLink>
		);
	}

	return (
		<AdLink
			href={ad.href}
			onClick={onClick}
			className="group/ad block focus-visible:outline-none"
		>
			{ad.image && (
				<div className="relative aspect-video overflow-hidden bg-zinc-900">
					{ad.mediaType === "video" ? (
						<AdMedia src={ad.image} type="video" sizes="256px" fit="contain" />
					) : (
						<>
							{/* Бүдгэрүүлсэн дэвсгэр + бүтэн зураг: зар тайрагдахгүй */}
							<AdMedia
								src={ad.image}
								sizes="256px"
								className="scale-110 opacity-50 blur-xl"
							/>
							<AdMedia
								src={ad.image}
								sizes="256px"
								fit="contain"
								className="transition-transform duration-500 group-hover/ad:scale-[1.03]"
							/>
						</>
					)}
				</div>
			)}
			<div className="space-y-1 p-3 pr-10">
				{ad.badge && (
					<span className="inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
						{ad.badge}
					</span>
				)}
				<p className="line-clamp-2 pr-5 text-[13px] font-semibold leading-snug">
					{ad.title}
				</p>
				{ad.description && (
					<p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
						{ad.description}
					</p>
				)}
				{ad.href && (
					<span className="inline-flex items-center gap-1 pt-0.5 text-[11px] font-medium transition-all group-hover/ad:gap-1.5">
						{ad.ctaLabel ?? "Дэлгэрэнгүй"}
						<ArrowRight className="h-3 w-3" />
					</span>
				)}
			</div>
		</AdLink>
	);
}

interface FloatingAdsProps {
	ads: FloatingAd[];
	delay?: number; // ms — эхний зар гарч ирэх хүртэлх хугацаа
	stagger?: number; // ms — дараагийн булангийн зар гарах хүртэлх зай
	maxVisible?: number; // desktop дээр зэрэг харагдах дээд тоо (үлдсэн нь ээлжилнэ)
	interval?: number; // ms — durationSec байхгүй үед нэг зар харагдах хугацаа
}

export function FloatingAds({
	ads,
	delay = 2500,
	stagger = 4000,
	maxVisible = 2,
	interval = 8000,
}: FloatingAdsProps) {
	const isDesktop = useIsDesktop();

	// Desktop: санамсаргүй сонгосон maxVisible булангуудад тарна. Үлдсэн зарууд тэдгээр дотроо ээлжилнэ
	const slots = useMemo(() => {
		if (isDesktop === null || ads.length === 0) return [];
		if (!isDesktop) {
			return [
				{
					key: "mobile",
					ads,
					position: MOBILE_POSITION,
					enterFrom: "bottom" as EnterFrom,
					variant: "compact" as Variant,
				},
			];
		}
		const corners = shuffle(CORNERS);
		const n = Math.max(1, Math.min(maxVisible, CORNERS.length, ads.length));
		const groups: FloatingAd[][] = Array.from({ length: n }, () => []);
		ads.forEach((ad, i) => {
			groups[i % n].push(ad);
		});
		return groups.map((group, i) => ({
			key: corners[i],
			ads: group,
			position: DESKTOP_POSITION[corners[i]],
			enterFrom: (corners[i].endsWith("left") ? "left" : "right") as EnterFrom,
			variant: "card" as Variant,
		}));
	}, [ads, isDesktop, maxVisible]);

	if (isDesktop === null) return null;

	// Portal: эцэг элементийн transform (animate-in гэх мэт) fixed байрлалыг эвдэхгүй
	return createPortal(
		<>
			{slots.map((slot, i) => (
				<AdSlot
					key={slot.key}
					ads={slot.ads}
					position={slot.position}
					enterFrom={slot.enterFrom}
					variant={slot.variant}
					delay={delay + i * stagger}
					interval={interval}
				/>
			))}
		</>,
		document.body,
	);
}