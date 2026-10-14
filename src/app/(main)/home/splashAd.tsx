"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Heart, Volume2, VolumeX, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AdLink, type AdMediaType } from "./adShared";
import {
	isReklamLiked,
	trackReklamClick,
	trackReklamLike,
	trackReklamView,
} from "./reklamtracker";

export interface SplashAdData {
	id: string | number;
	reklamId?: number; // backend-ийн реклам id (статистикт)
	src: string;
	mediaType: AdMediaType;
	href?: string;
	title?: string;
	durationSec: number;
	canSkip: boolean;
}

interface SplashAdProps {
	/**
	 * undefined → өгөгдөл ачаалж байна, хүлээнэ
	 * null      → зар алга, шууд onFinished дуудна
	 */
	ad: SplashAdData | null | undefined;
	onFinished?: () => void;
}

const keyFor = (id: SplashAdData["id"]) => `splash-ad:${id}`;
const DEFAULT_DURATION = 5;
// can_skip = false үед ч энэ хугацааны дараа алгасах боломжтой болно (YouTube шиг)
const SKIP_AFTER_SEC = 5;

export function SplashAd({ ad, onFinished }: SplashAdProps) {
	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(false);
	const [elapsed, setElapsed] = useState(0);
	const [total, setTotal] = useState(DEFAULT_DURATION);
	const [muted, setMuted] = useState(true);
	const [liked, setLiked] = useState(false);
	const [burst, setBurst] = useState(0); // том зүрх тоглуулах тоолуур
	const lastTap = useRef(0);
	const videoRef = useRef<HTMLVideoElement>(null);

	const onFinishedRef = useRef(onFinished);
	useEffect(() => {
		onFinishedRef.current = onFinished;
	}, [onFinished]);

	const doneRef = useRef(false);
	const finish = useCallback(() => {
		if (doneRef.current) return;
		doneRef.current = true;
		onFinishedRef.current?.();
	}, []);

	useEffect(() => setMounted(true), []);

	// Нэг session-д нэг удаа харуулна
	useEffect(() => {
		if (ad === undefined) return;
		if (ad === null) {
			finish();
			return;
		}
		let seen = false;
		try {
			seen = sessionStorage.getItem(keyFor(ad.id)) === "1";
		} catch {
			/* storage хаалттай */
		}
		if (seen) {
			finish();
			return;
		}
		setTotal(ad.durationSec > 0 ? ad.durationSec : DEFAULT_DURATION);
		setElapsed(0);
		setLiked(isReklamLiked(ad.reklamId));
		setVisible(true);
	}, [ad, finish]);

	const adId = ad?.id;
	const reklamId = ad?.reklamId;
	const isVideo = ad?.mediaType === "video";

	const close = useCallback(() => {
		setVisible(false);
		if (adId !== undefined) {
			try {
				sessionStorage.setItem(keyFor(adId), "1");
			} catch {
				/* noop */
			}
		}
		finish();
	}, [adId, finish]);

	// Үзсэн гэж тоолох: зураг 1 сек, видео 2 сек үзсэний дараа (MRC стандарт)
	const viewed = visible && elapsed >= (isVideo ? 2 : 1);
	useEffect(() => {
		if (viewed) trackReklamView(reklamId);
	}, [viewed, reklamId]);

	// Таалагдлаа — товч эсвэл зураг дээр хоёр товшино
	const like = useCallback(() => {
		setBurst((b) => b + 1);
		if (liked) return;
		setLiked(true);
		trackReklamLike(reklamId);
	}, [liked, reklamId]);

	const handleMediaTap = (e: React.PointerEvent) => {
		if (e.timeStamp - lastTap.current < 300) {
			lastTap.current = 0;
			like();
		} else {
			lastTap.current = e.timeStamp;
		}
	};

	// Зураг: хугацааг өөрөө тоолно. Видео: onTimeUpdate-ээр (buffering үед тоолуур зогсоно)
	useEffect(() => {
		if (!visible || isVideo) return;
		const started = performance.now();
		const id = setInterval(
			() => setElapsed((performance.now() - started) / 1000),
			200,
		);
		return () => clearInterval(id);
	}, [visible, isVideo]);

	// Хугацаа дуусахад хаагдана
	useEffect(() => {
		if (visible && elapsed >= total) close();
	}, [visible, elapsed, total, close]);

	// Видео гацсан ч хэрэглэгч түгжигдэхгүйн тулд хамгаалалт
	useEffect(() => {
		if (!visible || !isVideo) return;
		const t = setTimeout(close, (total + 15) * 1000);
		return () => clearTimeout(t);
	}, [visible, isVideo, total, close]);

	// React-ийн muted prop шинэчлэгддэггүй тул ref-ээр тохируулна
	useEffect(() => {
		if (videoRef.current) videoRef.current.muted = muted;
	}, [muted]);

	const skipAfter = ad?.canSkip ? 0 : Math.min(SKIP_AFTER_SEC, total);
	const skipIn = Math.max(0, Math.ceil(skipAfter - elapsed));
	const skippable = skipIn === 0;
	const remaining = Math.max(0, Math.ceil(total - elapsed));

	// Ард талын scroll түгжих, Escape-ээр алгасах
	useEffect(() => {
		if (!visible) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" && skippable) close();
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [visible, skippable, close]);

	if (!mounted || !ad) return null;

	return createPortal(
		<AnimatePresence>
			{visible && (
				// ===== Бүдэг дэвсгэр — алгасах боломжтой үед дарж хаана =====
				<motion.div
					key="splash"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.25 }}
					onClick={(e) => {
						if (e.target === e.currentTarget && skippable) close();
					}}
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
				>
					{/* ===== Dialog карт ===== */}
					<motion.div
						role="dialog"
						aria-modal="true"
						aria-label={ad.title || "Сурталчилгаа"}
						initial={{ opacity: 0, scale: 0.92, y: 24 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 12 }}
						transition={{ type: "spring", stiffness: 300, damping: 28 }}
						className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl ring-1 ring-white/10"
					>
						{/* ===== Медиа ===== */}
						<div
							className="relative aspect-video max-h-[70dvh] w-full touch-manipulation select-none overflow-hidden bg-black"
							onPointerUp={handleMediaTap}
						>
							{isVideo ? (
								<video
									ref={videoRef}
									src={ad.src}
									autoPlay
									muted
									playsInline
									preload="auto"
									onLoadedMetadata={(e) => {
										const d = e.currentTarget.duration;
										if (Number.isFinite(d) && d > 0) {
											setTotal((t) => Math.min(t, d));
										}
									}}
									onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
									onEnded={close}
									onError={close}
									className="h-full w-full object-contain"
								/>
							) : (
								<>
									{/* Бүдгэрүүлсэн дэвсгэр — зургийн харьцаа ямар ч байсан хоосон зай үлдэхгүй */}
									<Image
										src={ad.src}
										alt=""
										aria-hidden
										fill
										sizes="768px"
										className="scale-110 object-cover opacity-40 blur-2xl"
									/>
									<Image
										src={ad.src}
										alt={ad.title ?? ""}
										fill
										priority
										sizes="768px"
										onError={close}
										className="object-contain"
									/>
								</>
							)}

							{/* Таалагдсан үед гарах том зүрх */}
							{burst > 0 && (
								<motion.div
									key={burst}
									aria-hidden
									className="pointer-events-none absolute inset-0 flex items-center justify-center"
									initial={{ opacity: 1 }}
									animate={{ opacity: 0 }}
									transition={{ delay: 0.6, duration: 0.4 }}
								>
									<motion.div
										initial={{ scale: 0, rotate: -15 }}
										animate={{ scale: [0, 1.25, 1], rotate: 0 }}
										transition={{ duration: 0.5, ease: "easeOut" }}
									>
										<Heart className="h-24 w-24 fill-rose-500 text-rose-500 drop-shadow-2xl" />
									</motion.div>
								</motion.div>
							)}

							{/* Дээд мөр: шошго + алгасах */}
							<div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-linear-to-b from-black/60 to-transparent p-3 sm:p-4">
								<span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm">
									Сурталчилгаа · {remaining}
								</span>
								{skippable ? (
									<motion.button
										type="button"
										onClick={close}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-medium text-zinc-900 shadow-lg transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
									>
										Алгасах
										<X className="h-4 w-4" />
									</motion.button>
								) : (
									<span
										aria-live="polite"
										className="rounded-full bg-black/50 px-3.5 py-1.5 text-xs font-medium tabular-nums text-white/90 backdrop-blur-sm"
									>
										{skipIn} секундын дараа алгасах
									</span>
								)}
							</div>

							{/* Хугацааны шугам */}
							<div
								aria-hidden
								className="absolute bottom-0 left-0 h-1 w-full origin-left bg-white/80 transition-transform duration-200 ease-linear"
								style={{ transform: `scaleX(${Math.min(1, elapsed / total)})` }}
							/>
						</div>

						{/* ===== Доод хэсэг: гарчиг + үйлдлүүд ===== */}
						<div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
							<div className="min-w-0">
								{ad.title && (
									<p className="truncate text-base font-semibold text-white">{ad.title}</p>
								)}
								<p className="text-xs text-white/50">Хоёр товшиж таалагдсанаа илэрхийлээрэй</p>
							</div>
							<div className="flex shrink-0 items-center gap-2">
								<motion.button
									type="button"
									onClick={like}
									whileTap={{ scale: 0.85 }}
									aria-pressed={liked}
									className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors ${
										liked
											? "bg-rose-500 text-white"
											: "bg-white/10 text-white hover:bg-white/20"
									}`}
								>
									<motion.span
										key={liked ? "on" : "off"}
										initial={{ scale: liked ? 0.3 : 1 }}
										animate={{ scale: 1 }}
										transition={{ type: "spring", stiffness: 500, damping: 14 }}
										className="inline-flex"
									>
										<Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
									</motion.span>
									{liked ? "Таалагдсан" : "Таалагдлаа"}
								</motion.button>
								{isVideo && (
									<button
										type="button"
										onClick={() => setMuted((m) => !m)}
										aria-label={muted ? "Дуу нээх" : "Дуу хаах"}
										className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
									>
										{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
									</button>
								)}
								{ad.href && (
									<AdLink
										href={ad.href}
										onClick={() => trackReklamClick(reklamId)}
										className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
									>
										Дэлгэрэнгүй
										<ExternalLink className="h-3.5 w-3.5" />
									</AdLink>
								)}
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}