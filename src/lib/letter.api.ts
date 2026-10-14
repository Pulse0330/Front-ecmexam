// src/lib/letter.api.ts
import api from "@/lib/axios";
import type {
	LetterApiResponse,
	LetterDetailData,
	LetterInboxData,
	LetterUnreadData,
} from "@/types/letter/type";

// Backend-ийн platform утга. Web = "1" гэж үзсэн — backend-тэй тулгаарай
const PLATFORM = "1";

// Уншаагүй тоо (navbar-ын улаан тоо)
export const getLetterUnread = async (userId: number) => {
	const { data } = await api.post<LetterApiResponse<LetterUnreadData>>(
		"/letter/unread",
		{ user_id: userId, platform: PLATFORM },
		{ silent: true }, // 1 минут тутам шалгадаг тул сүлжээний алдааны toast гаргахгүй
	);
	return data;
};

// Ирсэн захидлын жагсаалт
export const getLetterInbox = async (
	userId: number,
	page: number,
	pageSize: number,
) => {
	const { data } = await api.post<LetterApiResponse<LetterInboxData>>(
		"/letter/inbox",
		{ page, pagesize: pageSize, user_id: userId, platform: PLATFORM },
	);
	return data;
};

// Захидал нээх — backend уншсан гэж тэмдэглэнэ
export const getLetterDetail = async (userId: number, letterId: number) => {
	const { data } = await api.post<LetterApiResponse<LetterDetailData>>(
		"/letter/detail",
		{ user_id: userId, letter_id: letterId, kind: 1 },
	);
	return data;
};

// "Танилцсан" гэж тэмдэглэх
export const ackLetter = async (userId: number, letterId: number) => {
	const { data } = await api.post<LetterApiResponse<null>>("/letter/ack", {
		user_id: userId,
		letter_id: letterId,
	});
	return data;
};