import type { ReklamData, ReklamItem } from "@/types/reklam/type";
import type { AdMediaType } from "./adShared";
import type { FloatingAd } from "./floatingAds";
import { getReklamSeenMap } from "./reklamtracker";
import type { SplashAdData } from "./splashAd";

const DAY_MS = 86_400_000;

const getMediaType = (r: ReklamItem): AdMediaType =>
	r.file_type === 2 || /^\.?(mp4|webm|mov|m4v)$/i.test(r.file_ext ?? "")
		? "video"
		: "image";

const parseDate = (value: string | null | undefined) => {
	if (!value) return null;
	const t = Date.parse(value);
	return Number.isNaN(t) ? null : t;
};

// start_date / end_date хоосон бол хязгааргүй. end_date-ийн өдрийг бүтнээр нь тооцно
const isActive = (r: ReklamItem, now: number) => {
	const start = parseDate(r.start_date);
	const end = parseDate(r.end_date);
	if (start !== null && now < start) return false;
	if (end !== null && now >= end + DAY_MS) return false;
	return true;
};

const weightOf = (r: ReklamItem) => (r.weight > 0 ? r.weight : 1);

// Жинтэй санамсаргүй дараалал: weight их зар урд гарах магадлал өндөр
const weightedShuffle = (list: ReklamItem[]) =>
	list
		.map((r) => ({ r, key: Math.random() ** (1 / weightOf(r)) }))
		.sort((a, b) => b.key - a.key)
		.map(({ r }) => r);

// Хараагүй зарууд эхэнд (жинтэй санамсаргүй), дараа нь хамгийн эрт үзсэн нь
function freshnessOrder(list: ReklamItem[]) {
	const seen = typeof window === "undefined" ? {} : getReklamSeenMap();
	const unseen = weightedShuffle(list.filter((r) => !seen[r.id]));
	const viewed = list
		.filter((r) => seen[r.id])
		.sort((a, b) => seen[a.id] - seen[b.id]);
	return [...unseen, ...viewed];
}

const prepare = (list: ReklamItem[] | null | undefined, now: number) =>
	freshnessOrder(
		(list ?? []).filter((r) => Boolean(r?.file_url) && isActive(r, now)),
	);

const toFloating = (r: ReklamItem): FloatingAd => ({
	id: `reklam-${r.id}`,
	reklamId: r.id,
	title: r.title,
	description: r.descr || undefined,
	image: r.file_url,
	mediaType: getMediaType(r),
	href: r.url || undefined,
	ctaLabel: "Дэлгэрэнгүй",
	durationSec: r.duration_sec,
	canSkip: r.can_skip,
});

export interface MappedAds {
	splash: SplashAdData | null; // бүтэн дэлгэцийн зар
	floating: FloatingAd[]; // popup → булангийн зар, нэг удаад нэг (хараагүй нь эхэнд)
	carousel: FloatingAd[]; // home → нүүр хуудсан дахь carousel (home хоосон бол popup)
}

export function mapReklam(
	data: ReklamData | null | undefined,
	now: number = Date.now(),
): MappedAds {
	const [splash] = prepare(data?.splash, now);
	const homes = prepare(data?.home, now);
	const popups = prepare(data?.popup, now);

	return {
		splash: splash
			? {
					id: `reklam-${splash.id}`,
					reklamId: splash.id,
					src: splash.file_url,
					mediaType: getMediaType(splash),
					href: splash.url || undefined,
					title: splash.title || undefined,
					durationSec: splash.duration_sec,
					canSkip: splash.can_skip,
				}
			: null,

		// popup зарууд үргэлж буланд нэг нэгээрээ ээлжилнэ
		floating: popups.map(toFloating),

		// Carousel байнга харагдана: home зар, байхгүй бол popup зар.
		// Тэр үед булангийн зар carousel-д яг одоо харагдаж буй зарыг алгасна
		carousel: (homes.length > 0 ? homes : popups).map(toFloating),
	};
}