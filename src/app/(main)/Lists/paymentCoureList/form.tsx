import { motion } from "framer-motion";
import {
	AlertTriangle,
	CalendarClock,
	Check,
	Clock,
	Plus,
	X,
} from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Course {
	palnid: number;
	title: string;
	expired: string;
	amount: number;
	ispay: number;
	filename: string;
	ispurchased: number;
	bill_type: number;
}

interface CourseCardProps {
	course: Course;
	isSelected?: boolean;
	/** Called with the course's palnid when toggled */
	onSelect?: (planid: number) => void;
	/** Only relevant for purchased courses */
	onView?: () => void;
	onExtend?: () => void;
	disabled?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BLUR_PLACEHOLDER =
	"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

const EXPIRY_WARN_DAYS = 7;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONGOLIAN_MONTHS = [
	"1-р сар",
	"2-р сар",
	"3-р сар",
	"4-р сар",
	"5-р сар",
	"6-р сар",
	"7-р сар",
	"8-р сар",
	"9-р сар",
	"10-р сар",
	"11-р сар",
	"12-р сар",
];

function formatMongolianDate(date: Date): string {
	return `${date.getFullYear()} оны ${MONGOLIAN_MONTHS[date.getMonth()]}-ын ${date.getDate()}`;
}

type ExpiryInfo = {
	diffDays: number;
	isExpired: boolean;
	isExpiringSoon: boolean;
	expiryDate: string;
};

function computeExpiryInfo(expired: string): ExpiryInfo {
	const expiryDate = new Date(expired);
	const diffTime = expiryDate.getTime() - Date.now();
	const diffDays = Math.ceil(diffTime / 86_400_000); // ms per day

	return {
		diffDays: Math.abs(diffDays),
		isExpired: diffDays < 0,
		isExpiringSoon: diffDays >= 0 && diffDays <= EXPIRY_WARN_DAYS,
		expiryDate: formatMongolianDate(expiryDate),
	};
}

// ─── Component ────────────────────────────────────────────────────────────────

function CourseCard({
	course,
	isSelected = false,
	onSelect,
	onExtend,
	disabled = false,
}: CourseCardProps) {
	const isPurchased = course.ispurchased === 1;
	const isSelectable = !isPurchased && !disabled;

	// Stable handler — identity changes only when palnid or disabled changes
	const handleClick = useCallback(() => {
		if (isSelectable) onSelect?.(course.palnid);
	}, [isSelectable, onSelect, course.palnid]);

	const handleExtend = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onExtend?.();
		},
		[onExtend],
	);

	const handleDeselect = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onSelect?.(course.palnid);
		},
		[onSelect, course.palnid],
	);

	// Only compute expiry for purchased courses
	const expiryInfo = useMemo<ExpiryInfo | null>(
		() => (isPurchased ? computeExpiryInfo(course.expired) : null),
		[isPurchased, course.expired],
	);

	const showExtendButton =
		isPurchased && (expiryInfo?.isExpired || expiryInfo?.isExpiringSoon);

	return (
		<motion.div
			onClick={handleClick}
			className={cn(
				"relative h-full",
				isSelectable ? "cursor-pointer" : "cursor-default",
			)}
		>
			<article
				className={cn(
					"flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow",
					isSelected && "border-primary ring-1 ring-primary",
					isSelectable &&
						!isSelected &&
						"hover:border-primary/40 hover:shadow-md",
					disabled && "opacity-60",
				)}
			>
				{/* ── Зураг ── */}
				<div className="relative aspect-[2/1] w-full overflow-hidden bg-muted">
					<Image
						src={course.filename}
						alt={course.title}
						fill
						loading="lazy"
						placeholder="blur"
						blurDataURL={BLUR_PLACEHOLDER}
						className={cn("object-cover", expiryInfo?.isExpired && "grayscale")}
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
					/>

					{isSelected && !isPurchased && (
						<span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground shadow-sm">
							<Check className="size-3.5" aria-hidden />
							Сонгосон
						</span>
					)}
				</div>

				{/* ── Мэдээлэл ── */}
				<div className="flex flex-1 flex-col gap-3 p-4">
					{isPurchased && expiryInfo && <ExpiryBadge info={expiryInfo} />}

					<h3
						className="line-clamp-2 text-base font-semibold leading-snug text-foreground"
						title={course.title}
					>
						{course.title}
					</h3>

					{isPurchased && expiryInfo && (
						<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<CalendarClock className="size-3.5 shrink-0" aria-hidden />
							{expiryInfo.isExpired ? "Дууссан" : "Дуусах"}:{" "}
							<span className="font-medium text-foreground">
								{expiryInfo.expiryDate}
							</span>
						</p>
					)}

					<div className="mt-auto space-y-1.5 pt-1">
						{/* onExtend дамжуулаагүй бол ажилладаггүй товч харуулахгүй */}
						{showExtendButton && onExtend ? (
							<Button
								type="button"
								onClick={handleExtend}
								className="h-10 w-full"
							>
								<CalendarClock className="size-4" aria-hidden />
								Хугацаа сунгах
							</Button>
						) : isSelected ? (
							<Button
								type="button"
								variant="outline"
								onClick={handleDeselect}
								className="h-10 w-full"
							>
								<X className="size-4" aria-hidden />
								Сонголтоос хасах
							</Button>
						) : !isPurchased ? (
							<Button
								type="button"
								variant="outline"
								onClick={(e) => {
									// Картын onClick давхар ажиллахаас сэргийлнэ
									e.stopPropagation();
									handleClick();
								}}
								className="h-10 w-full"
								disabled={disabled}
							>
								<Plus className="size-4" aria-hidden />
								Сонгох
							</Button>
						) : null}
						{disabled && (
							<p className="text-center text-xs text-muted-foreground">
								Нэг удаад дээд тал нь 4 хичээл сонгоно
							</p>
						)}
					</div>
				</div>
			</article>
		</motion.div>
	);
}

// ─── Small internal primitives ────────────────────────────────────────────────

function ExpiryBadge({ info }: { info: ExpiryInfo }) {
	if (info.isExpired) {
		return (
			<span className="inline-flex w-fit items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
				<Clock className="size-3.5" aria-hidden />
				Хугацаа дууссан
			</span>
		);
	}
	if (info.isExpiringSoon) {
		return (
			<span className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
				<AlertTriangle className="size-3.5" aria-hidden />
				{info.diffDays} хоног үлдсэн
			</span>
		);
	}
	return (
		<span className="inline-flex w-fit items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
			<Check className="size-3.5" aria-hidden />
			Идэвхтэй · {info.diffDays} хоног үлдсэн
		</span>
	);
}

// Wrap in React.memo so parent re-renders don't cascade unless props change
export default memo(CourseCard);
