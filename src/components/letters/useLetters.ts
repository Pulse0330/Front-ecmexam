"use client";

import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
	ackLetter,
	getLetterDetail,
	getLetterInbox,
	getLetterUnread,
} from "@/lib/letter.api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { LetterListItem } from "@/types/letter/type";
import { LETTER_PAGE_SIZE, LETTER_UNREAD_POLL_MS } from "./letterConfig";

export const letterKeys = {
	all: ["letter"] as const,
	unread: (userId: number | null) => ["letter", "unread", userId] as const,
	inbox: (userId: number | null) => ["letter", "inbox", userId] as const,
	detail: (userId: number | null, id: number | null) =>
		["letter", "detail", userId, id] as const,
};

// Уншаагүй / яаралтай тоо — 1 минут тутам, цонх руу буцаж ороход шинэчлэгдэнэ
export function useLetterUnread(enabled = true) {
	const { userId } = useAuthStore();
	return useQuery({
		queryKey: letterKeys.unread(userId),
		queryFn: () => getLetterUnread(Number(userId)),
		enabled: !!userId && enabled,
		refetchInterval: LETTER_UNREAD_POLL_MS,
		refetchOnWindowFocus: true,
		select: (res) => res.RetData ?? { unread: 0, urgent: 0 },
	});
}

// Ирсэн захидал — хуудаслан татна ("Цааш үзэх")
export function useLetterInbox(enabled = true) {
	const { userId } = useAuthStore();
	const query = useInfiniteQuery({
		queryKey: letterKeys.inbox(userId),
		queryFn: ({ pageParam }) =>
			getLetterInbox(Number(userId), pageParam, LETTER_PAGE_SIZE),
		initialPageParam: 1,
		getNextPageParam: (last, all) => {
			const loaded = all.reduce((n, p) => n + (p.RetData?.items?.length ?? 0), 0);
			const total = last.RetData?.total ?? 0;
			return loaded < total ? (last.RetData?.page ?? all.length) + 1 : undefined;
		},
		enabled: !!userId && enabled,
		staleTime: 30_000,
	});

	const items = useMemo<LetterListItem[]>(
		() => query.data?.pages.flatMap((p) => p.RetData?.items ?? []) ?? [],
		[query.data],
	);
	const total = query.data?.pages[0]?.RetData?.total ?? 0;

	return { ...query, items, total };
}

// Захидлыг нээх — backend уншсан гэж тэмдэглэх тул тоо, жагсаалтыг шинэчилнэ
export function useLetterDetail(letterId: number | null) {
	const { userId } = useAuthStore();
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: letterKeys.detail(userId, letterId),
		queryFn: () => getLetterDetail(Number(userId), Number(letterId)),
		enabled: !!userId && !!letterId,
		staleTime: 5 * 60_000,
		select: (res) => res.RetData,
	});

	const loadedId = query.data?.letter?.id;
	useEffect(() => {
		if (!loadedId) return;
		queryClient.invalidateQueries({ queryKey: letterKeys.unread(userId) });
		queryClient.invalidateQueries({ queryKey: letterKeys.inbox(userId) });
	}, [loadedId, queryClient, userId]);

	return query;
}

// "Танилцсан" гэж тэмдэглэх
export function useAckLetter() {
	const { userId } = useAuthStore();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (letterId: number) => ackLetter(Number(userId), letterId),
		onSuccess: (res, letterId) => {
			toast.success(res?.RetResponse?.ResponseMessage || "Танилцсан гэж тэмдэглэлээ.");
			queryClient.invalidateQueries({ queryKey: letterKeys.detail(userId, letterId) });
			queryClient.invalidateQueries({ queryKey: letterKeys.inbox(userId) });
			queryClient.invalidateQueries({ queryKey: letterKeys.unread(userId) });
		},
		onError: () => toast.error("Тэмдэглэж чадсангүй. Дахин оролдоно уу."),
	});
}