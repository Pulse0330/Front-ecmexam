"use client";

// Гадны системээс URL-аар орж ирсэн шалгалт:
//   /exam/40?dbname=ikh_test_ub33&userid=77439&classroom_id=3216&domname=https://big.nuudelms.mn/ExamEnd/40/77439
// dbname, userid байвал integration горим — integration.ecm.mn API-г ашиглана.
// classroom_id — шалгалт дуусгах үед IntegrationExamFinish-д явуулна.
// domname — шалгалт дууссан / гарсны дараа буцах хаяг.
// Байхгүй бол одоогийн системийн API-гаар ажиллана.

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
	deleteExamAnswer,
	finishExam,
	getExamById,
	saveExamAnswer,
} from "@/lib/api";
import {
	deleteIntegrationExamAnswer,
	finishIntegrationExam,
	getIntegrationExamFill,
	saveIntegrationExamAnswer,
} from "@/lib/integration.api";

export interface ExamIntegration {
	dbname: string;
	userId: number;
	classroomId: number | null;
	returnUrl: string | null;
}

// Буцах хаяг байхгүй үед харуулах хуудас
export const INTEGRATION_FINISHED_PATH = "/exam/finished";

// Зөвхөн http(s) хаяг руу буцаана
function parseReturnUrl(value: string | null): string | null {
	if (!value) return null;
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:"
			? url.toString()
			: null;
	} catch {
		return null;
	}
}

// Эерэг бүхэл тоо биш бол null
function parsePositiveInt(value: string | null): number | null {
	if (!value) return null;
	const n = Number(value);
	return Number.isInteger(n) && n > 0 ? n : null;
}

export function parseExamIntegration(
	dbname: string | null,
	userid: string | null,
	classroomId: string | null,
	domname: string | null,
): ExamIntegration | null {
	const db = dbname?.trim();
	const userId = parsePositiveInt(userid);
	if (!db || userId === null) return null;
	return {
		dbname: db,
		userId,
		classroomId: parsePositiveInt(classroomId),
		returnUrl: parseReturnUrl(domname),
	};
}

export function useExamIntegration(): ExamIntegration | null {
	const searchParams = useSearchParams();
	const dbname = searchParams.get("dbname");
	const userid = searchParams.get("userid");
	const classroomId = searchParams.get("classroom_id");
	const domname = searchParams.get("domname");
	return useMemo(
		() => parseExamIntegration(dbname, userid, classroomId, domname),
		[dbname, userid, classroomId, domname],
	);
}

// Integration-ий exam_time — сурагчийн зарцуулсан хугацаа "мм:сс" (жишээ нь "45:12").
// Шалгалтын хугацаанаас хэтрүүлэхгүй, хасах утга гаргахгүй.
export function formatElapsedExamTime(
	startedAt: Date,
	now: Date,
	examMinutes: number,
): string {
	const maxSec = Math.max(0, examMinutes * 60);
	const rawSec = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
	const sec = Number.isFinite(rawSec)
		? Math.min(Math.max(rawSec, 0), maxSec)
		: 0;
	const mm = String(Math.floor(sec / 60)).padStart(2, "0");
	const ss = String(sec % 60).padStart(2, "0");
	return `${mm}:${ss}`;
}

// Шалгалтаас гарах — гадны систем рүү буцна (хаяг байхгүй бол дууссан хуудас)
export function leaveIntegrationExam(integration: ExamIntegration) {
	window.location.replace(integration.returnUrl ?? INTEGRATION_FINISHED_PATH);
}

// Горимоос хамаарч шалгалтын API сонгоно — дуудах хэлбэр нь ижил
export function getExamApi(
	dbname?: string | null,
	classroomId?: number | null,
) {
	if (!dbname) {
		return { getExamById, saveExamAnswer, deleteExamAnswer, finishExam };
	}
	return {
		getExamById: (userId: number, examId: number) =>
			getIntegrationExamFill(dbname, userId, examId),
		saveExamAnswer: (...args: Parameters<typeof saveExamAnswer>) =>
			saveIntegrationExamAnswer(dbname, ...args),
		deleteExamAnswer: (...args: Parameters<typeof deleteExamAnswer>) =>
			deleteIntegrationExamAnswer(dbname, ...args),
		finishExam: (payload: Parameters<typeof finishExam>[0]) =>
			finishIntegrationExam(dbname, payload, classroomId ?? null),
	};
}
