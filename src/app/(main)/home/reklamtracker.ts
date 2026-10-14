import { sendReklamHit } from "@/lib/api";

// Backend-ийн kind утгууд. CLICK, LIKE-ийн утгыг backend-тэй тулгаж баталгаажуулаарай
export const REKLAM_HIT = {
	VIEW: 1,
	CLICK: 2,
	LIKE: 3,
} as const;

const viewKey = (id: number) => `reklam-view:${id}`;
const SEEN_KEY = "reklam-seen"; // { [reklamId]: сүүлд үзсэн цаг }

// Хэрэглэгч аль зарыг хэзээ үзсэн — хараагүй зарыг түрүүлж харуулахад ашиглана
export function getReklamSeenMap(): Record<string, number> {
	try {
		return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}") as Record<string, number>;
	} catch {
		return {};
	}
}

function markReklamSeen(reklamId: number) {
	try {
		const map = getReklamSeenMap();
		map[reklamId] = Date.now();
		localStorage.setItem(SEEN_KEY, JSON.stringify(map));
	} catch {
		/* storage хаалттай */
	}
}

// Үзэлтийг нэг session-д зар бүрт нэг л удаа илгээнэ (зар солигдох бүрт давхардуулахгүй)
export function trackReklamView(reklamId?: number) {
	if (!reklamId) return;
	markReklamSeen(reklamId);
	try {
		if (sessionStorage.getItem(viewKey(reklamId))) return;
		sessionStorage.setItem(viewKey(reklamId), "1");
	} catch {
		/* storage хаалттай бол шууд илгээнэ */
	}
	sendReklamHit(reklamId, REKLAM_HIT.VIEW).catch(() => {});
}

// Дарсан бүрийг илгээнэ
export function trackReklamClick(reklamId?: number) {
	if (!reklamId) return;
	sendReklamHit(reklamId, REKLAM_HIT.CLICK).catch(() => {});
}

const likeKey = (id: number) => `reklam-like:${id}`;

// Энэ хөтөч дээр таалагдсан гэж дарсан эсэх
export function isReklamLiked(reklamId?: number) {
	if (!reklamId) return false;
	try {
		return localStorage.getItem(likeKey(reklamId)) === "1";
	} catch {
		return false;
	}
}

// Таалагдсаныг зар бүрт нэг л удаа илгээнэ (давхар тоологдохгүй)
export function trackReklamLike(reklamId?: number) {
	if (!reklamId || isReklamLiked(reklamId)) return;
	try {
		localStorage.setItem(likeKey(reklamId), "1");
	} catch {
		/* storage хаалттай */
	}
	sendReklamHit(reklamId, REKLAM_HIT.LIKE).catch(() => {});
}