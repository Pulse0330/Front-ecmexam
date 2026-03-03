export function fmtDate(iso: string): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

export function fmtDateTime(iso: string): string {
	if (!iso) return "—";
	const d = new Date(iso);
	return d.toLocaleString("mn-MN", {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export const API_BASE = "https://backend.skuul.mn";

export const CARD_CLS =
	"bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50";
