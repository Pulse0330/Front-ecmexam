"use client";

import {
	AnimatePresence,
	motion,
	useMotionValue,
	useReducedMotion,
} from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
	durationSec?: number; // өгвөл interval-ийн оронд энэ хугацаагаар харагдана
	canSkip?: boolean; // false бол хаах товч гарахгүй
}

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type Variant = "card" | "compact";

const CORNERS: Corner[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

// Desktop: 4 булангийн аль нэг. Дээд булангууд header-ийн доор (5rem)
const DESKTOP_POSITION: Record<Corner, string> = {
	"top-left": "fixed z-40 w-64 left-6 top-[calc(5rem+env(safe-area-inset-top))]",
	"top-right": "fixed z-40 w-64 right-6 top-[calc(5rem+env(safe-area-inset-top))]",
	"bottom-left": "fixed z-40 w-64 left-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
	"bottom-right": "fixed z-40 w-64 right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom))]",
};

// Утсан дээр доод талд нимгэн хэвтээ карт
const MOBILE_POSITION =
	"fixed z-40 left-4 right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))]";

const CLOSED_KEY = "floating-ad-closed";

// Өмнөхөөс өөр булан санамсаргүй сонгоно — зар бүр өөр газар гарна
function pickCorner(prev?: Corner): Corner {
	const options = CORNERS.filter((c) => c !== prev);
	return options[Math.floor(Math.random() * options.length)];
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

interface FloatingAdsProps {
	ads: FloatingAd[];
	delay?: number; // ms — эхний зар гарч ирэх хүртэлх хугацаа
	interval?: number; // ms — durationSec байхгүй үед нэг зар харагдах хугацаа
	gap?: number; // ms — нэг зар алга болоод дараагийнх гарах хүртэлх зай
	excludeId?: FloatingAd["id"] | null; // carousel-д яг одоо харагдаж буй зар — алгасна
}

/**
 * Булангийн зар — НЭГ УДААД НЭГ Л ЗАР.
 * Зар бүр хугацаагаараа харагдаад алга болж, түр завсарласны дараа
 * дараагийн зар өөр буланд гарч ирнэ. X дарвал энэ session-д бүрмөсөн зогсоно.
 */
export function FloatingAds({
	ads,
	delay = 2500,
	interval = 8000,
	gap = 1500,
	excludeId = null,
}: FloatingAdsProps) {
	const isDesktop = useIsDesktop();
	const reduceMotion = useReducedMotion();
	const count = ads.length;

	const [started, setStarted] = useState(false);
	const [visible, setVisible] = useState(false);
	const [stopped, setStopped] = useState(false);
	const [index, setIndex] = useState(0);
	const [corner, setCorner] = useState<Corner>("bottom-right");
	const [paused, setPaused] = useState(false);

	const progress = useMotionValue(0);
	const elapsed = useRef(0);

	// Carousel-д харагдаж буйгаас өөр дараагийн зарыг олно
	const excludeRef = useRef(excludeId);
	excludeRef.current = excludeId;
	const nextIndex = useCallback(
		(from: number) => {
			for (let step = 1; step <= count; step++) {
				const i = (from + step) % count;
				if (ads[i]?.id !== excludeRef.current) return i;
			}
			return (from + 1) % count;
		},
		[ads, count],
	);
	// Ганц зар байгаа бөгөөд тэр нь carousel-д харагдаж байвал буланд гаргахгүй
	const onlyDuplicate = count === 1 && ads[0]?.id === excludeId;

	const ad = count ? ads[index % count] : undefined;
	const duration =
		ad?.durationSec && ad.durationSec > 0 ? ad.durationSec * 1000 : interval;

	// Эхлэх — хаасан бол энэ session-д дахин гарахгүй
	const ready = isDesktop !== null;
	useEffect(() => {
		if (!count || !ready) return;
		try {
			if (sessionStorage.getItem(CLOSED_KEY) === "1") {
				setStopped(true);
				return;
			}
		} catch {
			/* storage хаалттай */
		}
		const t = setTimeout(() => {
			if (ads[0]?.id === excludeRef.current && count > 1) setIndex(nextIndex(0));
			setCorner(pickCorner());
			setStarted(true);
			setVisible(true);
		}, delay);
		return () => clearTimeout(t);
	}, [count, ready, delay, ads, nextIndex]);

	// Харагдах хугацаа — hover/focus үед зогсоно. Дуусахад алга болно
	useEffect(() => {
		if (!visible || paused || count <= 1) return;
		let raf = 0;
		let last = performance.now();
		const tick = (now: number) => {
			elapsed.current += now - last;
			last = now;
			if (elapsed.current >= duration) {
				setVisible(false);
				return;
			}
			progress.set(elapsed.current / duration);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [visible, paused, count, duration, progress]);

	// Завсарласны дараа дараагийн зар өөр буланд
	useEffect(() => {
		if (!started || visible || stopped || count <= 1) return;
		const t = setTimeout(() => {
			elapsed.current = 0;
			progress.set(0);
			setIndex((i) => nextIndex(i));
			setCorner((c) => pickCorner(c));
			setVisible(true);
		}, gap);
		return () => clearTimeout(t);
	}, [started, visible, stopped, count, gap, progress, nextIndex]);

	// Үзсэн гэж тоолох: зураг 1с, видео 2с харагдсаны дараа
	const reklamId = ad?.reklamId;
	const isVideo = ad?.mediaType === "video";
	useEffect(() => {
		if (!visible || !reklamId) return;
		const t = setTimeout(() => trackReklamView(reklamId), isVideo ? 2000 : 1000);
		return () => clearTimeout(t);
	}, [visible, reklamId, isVideo]);

	const close = useCallback(() => {
		setStopped(true);
		setVisible(false);
		try {
			sessionStorage.setItem(CLOSED_KEY, "1");
		} catch {
			/* noop */
		}
	}, []);

	if (!ready || !ad || onlyDuplicate) return null;

	const canClose = ad.canSkip !== false;
	const variant: Variant = isDesktop ? "card" : "compact";
	const position = isDesktop ? DESKTOP_POSITION[corner] : MOBILE_POSITION;
	const offscreen = reduceMotion
		? {}
		: !isDesktop
			? { y: "120%" }
			: corner.endsWith("left")
				? { x: "-120%" }
				: { x: "120%" };

	// Portal: эцэг элементийн transform (animate-in гэх мэт) fixed байрлалыг эвдэхгүй
	return createPortal(
		<AnimatePresence>
			{visible && (
				<motion.aside
					key={`${ad.id}-${index}`}
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

						<CardAd ad={ad} variant={variant} />

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
		</AnimatePresence>,
		document.body,
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