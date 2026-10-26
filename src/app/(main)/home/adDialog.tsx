"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Megaphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { AdLikeButton } from "./adLike";
import { AdLink, AdMedia, type AdMediaType } from "./adShared";
import { trackReklamClick, trackReklamView } from "./reklamtracker";

export interface DialogAd {
	id: string | number; // id өөрчлөгдвөл (шинэ зар) хэрэглэгчид дахин харагдана
	reklamId?: number; // backend-ийн реклам id (статистикт)
	title: string;
	description?: string;
	image?: string; // зураг эсвэл видеоны URL
	mediaType?: AdMediaType;
	href?: string;
	ctaLabel?: string;
	badge?: string;
}

interface AdDialogProps {
	/**
	 * undefined → өгөгдөл ачаалж байна, хүлээнэ
	 * null      → харуулах зар алга, шууд onFinished дуудна
	 */
	ad: DialogAd | null | undefined;
	delay?: number; // ms — хуудас ачаалснаас хойш нээгдэх хугацаа
	onFinished?: () => void; // Dialog хаагдсан эсвэл харуулах шаардлагагүй болсон үед
}

const keyFor = (id: DialogAd["id"]) => `ad-dialog:${id}`;

function endOfToday() {
	const d = new Date();
	d.setHours(23, 59, 59, 999);
	return d.getTime();
}

// Нэг session-д нэг удаа. "Өнөөдөр дахиж харуулахгүй" сонгосон бол өдрийн эцэс хүртэл
function isSuppressed(id: DialogAd["id"]) {
	try {
		const key = keyFor(id);
		const until = Number(localStorage.getItem(key));
		if (until && Date.now() < until) return true;
		return sessionStorage.getItem(key) === "1";
	} catch {
		return false;
	}
}

export function AdDialog({ ad, delay = 600, onFinished }: AdDialogProps) {
	const [open, setOpen] = useState(false);
	const [hideToday, setHideToday] = useState(false);
	const reduceMotion = useReducedMotion();

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

	const adId = ad?.id;
	const isLoading = ad === undefined;

	useEffect(() => {
		if (isLoading) return;
		if (adId === undefined || isSuppressed(adId)) {
			finish();
			return;
		}
		const t = setTimeout(() => setOpen(true), delay);
		return () => clearTimeout(t);
	}, [adId, isLoading, delay, finish]);

	// Нээгдсэн үед үзсэн гэж backend руу илгээнэ
	const reklamId = ad?.reklamId;
	useEffect(() => {
		if (open) trackReklamView(reklamId);
	}, [open, reklamId]);

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (next || adId === undefined) return;
		try {
			const key = keyFor(adId);
			sessionStorage.setItem(key, "1");
			if (hideToday) localStorage.setItem(key, String(endOfToday()));
		} catch {
			/* storage хаалттай бол алгасна */
		}
		finish();
	};

	if (!ad) return null;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className="w-[calc(100vw-2rem)] min-w-[min(100%,320px)] max-w-[calc(100vw-2rem)]
					sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto
					p-0 gap-0 border-0 md:grid-cols-2
					[&>button]:z-10 [&>button]:rounded-full [&>button]:p-1.5 [&>button]:opacity-100
					[&>button]:bg-black/40 [&>button]:text-white [&>button]:backdrop-blur-sm
					[&>button:hover]:bg-black/60"
			>
				{/* Утсан дээр зураг дээрээ, md+ дэлгэцэнд зүүн талдаа */}
				<div
					className={`relative overflow-hidden bg-zinc-900 ${
						ad.image
							? "aspect-4/3 md:aspect-auto md:h-full md:min-h-[480px]"
							: "h-32 md:h-full md:min-h-[400px]"
					}`}
				>
					{ad.image ? (
						<motion.div
							className="absolute inset-0"
							initial={{ scale: reduceMotion ? 1 : 1.08 }}
							animate={{ scale: 1 }}
							transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
						>
							{ad.mediaType === "video" ? (
								<AdMedia
									src={ad.image}
									type="video"
									sizes="(max-width: 768px) 100vw, 448px"
									fit="contain"
								/>
							) : (
								<>
									{/* Бүдгэрүүлсэн дэвсгэр + бүтэн зураг: зар тайрагдахгүй */}
									<AdMedia
										src={ad.image}
										sizes="(max-width: 768px) 100vw, 448px"
										className="scale-110 opacity-50 blur-2xl"
									/>
									<AdMedia
										src={ad.image}
										sizes="(max-width: 768px) 100vw, 448px"
										priority
										fit="contain"
									/>
								</>
							)}
						</motion.div>
					) : (
						<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-zinc-700 via-zinc-900 to-zinc-950">
							<Megaphone className="w-10 h-10 md:w-16 md:h-16 text-white/30" />
						</div>
					)}

					{ad.badge && (
						<span className="absolute left-4 top-4 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-medium text-white shadow-md">
							{ad.badge}
						</span>
					)}
				</div>

				<div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 space-y-6">
					<div className="space-y-3">
						<DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight tracking-tight">
							{ad.title}
						</DialogTitle>
						<DialogDescription
							className={
								ad.description
									? "text-sm sm:text-base leading-relaxed"
									: "sr-only"
							}
						>
							{ad.description ?? ad.title}
						</DialogDescription>
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex gap-2">
							{ad.href && (
								<Button asChild className="h-11 flex-1 rounded-xl text-sm sm:text-base">
								<AdLink
									href={ad.href}
									onClick={() => {
										trackReklamClick(reklamId);
										handleOpenChange(false);
									}}
								>
									{ad.ctaLabel ?? "Дэлгэрэнгүй"}
									<ArrowRight className="w-4 h-4" />
								</AdLink>
							</Button>
							)}
							<AdLikeButton
								reklamId={reklamId}
								className={ad.href ? undefined : "flex-1"}
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							className="w-full h-11 rounded-xl text-muted-foreground"
							onClick={() => handleOpenChange(false)}
						>
							Хаах
						</Button>
					</div>

					<label className="flex items-center justify-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
						<input
							type="checkbox"
							checked={hideToday}
							onChange={(e) => setHideToday(e.target.checked)}
							className="h-3.5 w-3.5 accent-zinc-900 dark:accent-zinc-100"
						/>
						Өнөөдөр дахиж харуулахгүй
					</label>
				</div>
			</DialogContent>
		</Dialog>
	);
}