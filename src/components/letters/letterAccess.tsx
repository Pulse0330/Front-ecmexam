"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { UserProfileResponseType } from "@/types/user";
import { ENABLE_AGE_GATE, MIN_LETTER_AGE } from "./letterConfig";

// ============================================================================
// ТЕСТИЙН ӨГӨГДӨЛ — зөвхөн development горимд ажиллана.
//   "УБ99061512" → 27 настай  → захидал харагдана
//   "УБ10250101" → 16 настай  → захидал харагдахгүй
//   null         → dev горимд ч жинхэнэ профайлын регистрийг ашиглана
// ============================================================================
const MOCK_REGNUMBER: string | null =
	process.env.NODE_ENV === "development" ? "УБ99061512" : null;

/**
 * Монгол регистрийн дугаараас нас тооцно.
 * Бүтэц: 2 үсэг + ОО СС ӨӨ + 2 орон. 2000 оноос хойш төрсөн бол сар дээр 20 нэмэгддэг.
 */
export function getAgeFromRegnumber(
	regnumber: string | null | undefined,
	now: Date = new Date(),
): number | null {
	if (!regnumber) return null;
	const m = regnumber
		.trim()
		.toUpperCase()
		.match(/^[А-ЯЁӨҮ]{2}(\d{2})(\d{2})(\d{2})\d{2}$/);
	if (!m) return null;

	const yy = Number(m[1]);
	let month = Number(m[2]);
	const day = Number(m[3]);
	let year = 1900 + yy;
	if (month > 20) {
		month -= 20;
		year = 2000 + yy;
	}
	if (month < 1 || month > 12 || day < 1 || day > 31) return null;

	const nowMonth = now.getMonth() + 1;
	const hadBirthday =
		nowMonth > month || (nowMonth === month && now.getDate() >= day);
	const age = now.getFullYear() - year - (hadBirthday ? 0 : 1);
	return age >= 0 && age < 130 ? age : null;
}

export type LetterAccess = "loading" | "allowed" | "denied";

export function useLetterAccess(): LetterAccess {
	const { userId } = useAuthStore();
	const needsProfile = ENABLE_AGE_GATE && !MOCK_REGNUMBER;

	const { data, isLoading } = useQuery<UserProfileResponseType>({
		queryKey: ["userProfile", userId],
		queryFn: () => getUserProfile(userId ?? 0),
		enabled: !!userId && needsProfile,
		retry: 2,
		staleTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	if (!userId) return "loading";
	if (!ENABLE_AGE_GATE) return "allowed";

	const regnumber = MOCK_REGNUMBER
		? MOCK_REGNUMBER
		: (
				data?.RetData?.[0] as unknown as
					| { regnumber?: string | null }
					| undefined
			)?.regnumber;

	if (!MOCK_REGNUMBER && isLoading) return "loading";

	const age = getAgeFromRegnumber(regnumber);
	return age !== null && age >= MIN_LETTER_AGE ? "allowed" : "denied";
}