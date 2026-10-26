"use client";

import {
	AnimatePresence,
	motion,
	type PanInfo,
	useMotionValue,
	useReducedMotion,
} from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdLikeButton } from "./adLike";
import { AdLink, AdMedia } from "./adShared";
import type { FloatingAd } from "./floatingAds";
import { trackReklamClick, trackReklamView } from "./reklamtracker";

const DEFAULT_SEC = 6; // duration_sec байхгүй үед нэг зар харагдах хугацаа
const SWIPE_OFFSET = 60;
const SWIPE_VELOCITY = 500;

// Нүүр хуудасны дотор байрлах зарын carousel — бүх зар ээлжлэн харагдана
export function ReklamCarousel({
	ads,
	paused: externalPaused = false,
	onActiveChange,
}: {
	ads: FloatingAd[];
	paused?: boolean; // splash зэрэг өөр зар дэлгэцийг хааж байх үед true
	onActiveChange?: (id: FloatingAd["id"]) => void; // одоо харагдаж буй зар
}) {
	const count = ads.length;
	const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
	const [hovered, setHovered] = useState(false);
	const [inView, setInView] = useState(false);
	const reduce = useReducedMotion();
	const progress = useMotionValue(0);
	const elapsed = useRef(0);
	const rootRef = useRef<HTMLElement>(null);

	const active = count ? index % count : 0;
	const ad = ads[active];
	const duration = ((ad?.durationSec ?? 0) > 0 ? (ad?.durationSec ?? DEFAULT_SEC) : DEFAULT_SEC) * 1000;
	const paused = hovered || !inView || externalPaused;

	const resetTimer = useCallback(() => {
		elapsed.current = 0;
		progress.set(0);
	}, [progress]);

	const paginate = useCallback(
		(dir: number) => {
			if (count <= 1) return;
			resetTimer();
			setSlide(([i]) => [(i + dir + count) % count, dir]);
		},
		[count, resetTimer],
	);

	const goTo = useCallback(
		(target: number) => {
			resetTimer();
			setSlide(([i]) => (i === target ? [i, 0] : [target, target > i ? 1 : -1]));
		},
		[resetTimer],
	);

	// Одоо харагдаж буй зарыг мэдэгдэнэ — булангийн зар түүнийг давхардуулахгүй
	const activeId = ad?.id;
	useEffect(() => {
		if (activeId !== undefined) onActiveChange?.(activeId);
	}, [activeId, onActiveChange]);

	// Дэлгэцэнд 50%-аас дээш харагдаж байгаа эсэх (зарын хэмжилтийн стандарт)
	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;
		const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
			threshold: 0.5,
		});
		io.observe(el);
		return () => io.disconnect();
	}, []);

	// Үзсэн гэж тоолох: зураг 1с, видео 2с харагдсаны дараа
	useEffect(() => {
		if (!ad || !inView || externalPaused) return;
		const t = setTimeout(
			() => trackReklamView(ad.reklamId),
			ad.mediaType === "video" ? 2000 : 1000,
		);
		return () => clearTimeout(t);
	}, [ad, inView, externalPaused]);

	// Автоматаар солих — hover, focus, дэлгэцээс гарсан үед зогсоно
	useEffect(() => {
		if (paused || count <= 1) return;
		let raf = 0;
		let last = performance.now();
		const tick = (now: number) => {
			elapsed.current += now - last;
			last = now;
			if (elapsed.current >= duration) paginate(1);
			else progress.set(elapsed.current / duration);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [paused, count, duration, paginate, progress]);

	if (!count || !ad) return null;

	const shift = reduce ? "0%" : "6%";
	const variants = {
		enter: (dir: number) => ({ x: dir >= 0 ? shift : `-${shift}`, opacity: 0 }),
		center: { x: "0%", opacity: 1 },
		exit: (dir: number) => ({ x: dir >= 0 ? `-${shift}` : shift, opacity: 0 }),
	};

	const handleDragEnd = (_: unknown, info: PanInfo) => {
		if (info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY) paginate(1);
		else if (info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY) paginate(-1);
	};

	return (
		<section
			ref={rootRef}
			aria-roledescription="carousel"
			aria-label="Сурталчилгаа"
			// biome-ignore lint/a11y/noNoninteractiveTabindex: сумаар удирдахын тулд focus авна
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "ArrowLeft") paginate(-1);
				if (e.key === "ArrowRight") paginate(1);
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onFocus={() => setHovered(true)}
			onBlur={() => setHovered(false)}
			className="group relative aspect-video max-h-80 w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:aspect-[21/8] dark:border-zinc-800/80"
		>
			<AnimatePresence initial={false} custom={direction}>
				<motion.div
					key={ad.id}
					custom={direction}
					variants={variants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					drag={count > 1 ? "x" : false}
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={0.18}
					onDragEnd={handleDragEnd}
					aria-roledescription="slide"
					aria-label={`${active + 1} / ${count}`}
					className={`absolute inset-0 ${count > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
				>
					{ad.image &&
						(ad.mediaType === "video" ? (
							<AdMedia src={ad.image} type="video" sizes="100vw" fit="contain" />
						) : (
							<>
								{/* Бүдгэрүүлсэн дэвсгэр + бүтэн зураг: зарын бичвэр тайрагдахгүй */}
								<AdMedia src={ad.image} sizes="100vw" className="scale-110 opacity-50 blur-2xl" />
								<AdMedia src={ad.image} sizes="100vw" fit="contain" priority={active === 0} />
							</>
						))}

					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/75 via-black/25 to-transparent" />

					<div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 pb-7 sm:p-5 sm:pb-8">
						<div className="min-w-0 text-white">
							<span className="mb-1.5 inline-block rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider backdrop-blur-sm">
								Сурталчилгаа
							</span>
							<p className="truncate text-sm font-semibold sm:text-base">{ad.title}</p>
							{ad.description && (
								<p className="hidden truncate text-xs text-white/75 sm:block">{ad.description}</p>
							)}
						</div>
						{ad.href && (
							<AdLink
								href={ad.href}
								draggable={false}
								onClick={() => trackReklamClick(ad.reklamId)}
								className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-100 sm:text-sm"
							>
								{ad.ctaLabel ?? "Дэлгэрэнгүй"}
								<ArrowRight className="h-4 w-4" />
							</AdLink>
						)}
					</div>
				</motion.div>
			</AnimatePresence>

			<AdLikeButton
				key={ad.id}
				reklamId={ad.reklamId}
				variant="icon"
				className="absolute top-3 right-3 z-10 h-8 w-8"
			/>

			{count > 1 && (
				<>
					<button
						type="button"
						aria-label="Өмнөх зар"
						onClick={() => paginate(-1)}
						className="absolute top-1/2 left-3 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 group-hover:opacity-100 focus-visible:opacity-100 sm:flex"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<button
						type="button"
						aria-label="Дараагийн зар"
						onClick={() => paginate(1)}
						className="absolute top-1/2 right-3 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 group-hover:opacity-100 focus-visible:opacity-100 sm:flex"
					>
						<ChevronRight className="h-5 w-5" />
					</button>

					{/* Цэгүүд — идэвхтэй нь дараагийн зар хүртэлх хугацааг харуулна */}
					<div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
						{ads.map((item, i) => (
							<button
								key={item.id}
								type="button"
								aria-label={`${i + 1}-р зар руу очих`}
								aria-current={i === active}
								onClick={() => goTo(i)}
								className={`relative h-1.5 overflow-hidden rounded-full bg-white/35 transition-all duration-300 ${
									i === active ? "w-8" : "w-1.5 hover:bg-white/60"
								}`}
							>
								{i === active && (
									<motion.span
										className="absolute inset-0 origin-left rounded-full bg-white"
										style={{ scaleX: progress }}
									/>
								)}
							</button>
						))}
					</div>
				</>
			)}
		</section>
	);
}