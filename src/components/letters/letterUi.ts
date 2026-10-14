import { LETTER_URGENT_PRIORITY } from "./letterConfig";

const pad = (n: number) => String(n).padStart(2, "0");

export function formatLetterDate(iso: string, withTime = false) {
	const d = new Date(iso);
	const date = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
	return withTime ? `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
}

export function formatLongLetterDate(iso: string) {
	const d = new Date(iso);
	return `${d.getFullYear()} оны ${d.getMonth() + 1} сарын ${d.getDate()}`;
}

export function letterTimeAgo(iso: string) {
	const min = Math.floor(Math.max(0, Date.now() - Date.parse(iso)) / 60_000);
	if (min < 1) return "Дөнгөж сая";
	if (min < 60) return `${min} минутын өмнө`;
	const hr = Math.floor(min / 60);
	if (hr < 24) return `${hr} цагийн өмнө`;
	const day = Math.floor(hr / 24);
	if (day === 1) return "Өчигдөр";
	if (day < 7) return `${day} өдрийн өмнө`;
	return formatLetterDate(iso);
}

// "Л.Энх-Амгалан" → "Э"
export function initialOf(name: string) {
	const parts = name.trim().split(/[\s.]+/).filter(Boolean);
	return (parts[parts.length - 1]?.[0] ?? "?").toUpperCase();
}

// Backend-ийн type_color → өнгө
const TYPE_COLORS: Record<string, string> = {
	primary: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
	info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
	success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	warning: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	danger: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
	secondary: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
};

export const letterTypeClass = (color?: string | null) =>
	TYPE_COLORS[color ?? ""] ?? TYPE_COLORS.secondary;

export const isUrgentLetter = (priority?: number | null) =>
	(priority ?? 0) >= LETTER_URGENT_PRIORITY;

export const isImageFile = (ext?: string | null) =>
	/^\.?(jpe?g|png|gif|webp|avif|bmp)$/i.test(ext ?? "");

export function formatFileSize(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}