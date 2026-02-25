import { motion } from "framer-motion";
import { Check, Clock, Trash2 } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
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
				"relative",
				isSelectable ? "cursor-pointer" : "cursor-default",
			)}
		>
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-200",
					isSelected &&
						"border-blue-500 dark:border-blue-500 shadow-lg shadow-blue-500/20",
					isSelectable &&
						"hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600",
				)}
			>
				{/* ── Image ── */}
				<div className="relative w-full aspect-4/2 overflow-hidden bg-slate-100 dark:bg-slate-900">
					<Image
						src={course.filename}
						alt={course.title}
						fill
						loading="lazy"
						placeholder="blur"
						blurDataURL={BLUR_PLACEHOLDER}
					/>

					{/* Purchased check */}
					{isPurchased && (
						<StatusBadge color="green">
							<Check className="w-4 h-4 text-white" />
						</StatusBadge>
					)}

					{/* Selected check */}
					{isSelected && !isPurchased && (
						<StatusBadge color="blue">
							<Check className="w-4 h-4 text-white" />
						</StatusBadge>
					)}

					{/* Max-selection overlay */}
					{disabled && (
						<Overlay>
							<Badge className="bg-slate-700 text-white text-[10px]">
								Дээд тал нь 4
							</Badge>
						</Overlay>
					)}

					{/* Expired overlay */}
					{expiryInfo?.isExpired && (
						<Overlay>
							<Clock className="w-5 h-5 text-white mb-1" />
							<Badge className="bg-red-600 text-white text-[10px]">
								Дууссан
							</Badge>
						</Overlay>
					)}
				</div>

				{/* ── Info ── */}
				<div className="p-2.5">
					<h3 className="text-xs font-semibold mb-2 line-clamp-2 leading-snug min-h-8 text-slate-800 dark:text-slate-100">
						{course.title}
					</h3>

					{isPurchased && expiryInfo && !expiryInfo.isExpired && (
						<div className="flex items-center gap-1 text-[10px] mb-2">
							<Clock className="w-3 h-3 text-slate-500" />
							<span className="font-medium text-slate-600 dark:text-slate-400">
								{expiryInfo.diffDays} хоног үлдлээ
							</span>
						</div>
					)}

					<div className="flex items-center justify-between gap-2">
						{showExtendButton ? (
							<Button
								size="sm"
								onClick={handleExtend}
								className="h-6 px-2 text-[10px] gap-1 bg-orange-500 hover:bg-orange-600"
							>
								Сунгах
							</Button>
						) : isSelected ? (
							<Button
								size="sm"
								variant="destructive"
								onClick={handleDeselect}
								className="h-6 px-2 text-[10px] gap-1"
							>
								<Trash2 className="w-3 h-3" />
								Хасах
							</Button>
						) : !isPurchased ? (
							<Button
								size="sm"
								onClick={handleClick}
								className="h-6 px-2 text-[10px]"
								disabled={disabled}
							>
								Сонгох
							</Button>
						) : null}
					</div>
				</div>
			</div>
		</motion.div>
	);
}

// ─── Small internal primitives ────────────────────────────────────────────────

function StatusBadge({
	color,
	children,
}: {
	color: "green" | "blue";
	children: React.ReactNode;
}) {
	return (
		<div className="absolute top-1.5 right-1.5 z-20">
			<div
				className={cn(
					"flex items-center justify-center w-6 h-6 rounded-full",
					color === "green" ? "bg-green-500" : "bg-blue-500",
				)}
			>
				{children}
			</div>
		</div>
	);
}

function Overlay({ children }: { children: React.ReactNode }) {
	return (
		<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
			{children}
		</div>
	);
}

// Wrap in React.memo so parent re-renders don't cascade unless props change
export default memo(CourseCard);
