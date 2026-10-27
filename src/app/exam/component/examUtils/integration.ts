"use client";

// Гадны системээс URL-аар орж ирсэн шалгалт:
//   /exam/117?dbname=ikh_ub53&userid=82194&domname=https://ub53.nuudelms.mn/ExamEnd/117/82194
// dbname, userid байвал integration горим — integration.ecm.mn API-г ашиглана.
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

export function parseExamIntegration(
	dbname: string | null,
	userid: string | null,
	domname: string | null,
): ExamIntegration | null {
	const db = dbname?.trim();
	const userId = Number(userid);
	if (!db || !Number.isInteger(userId) || userId <= 0) return null;
	return { dbname: db, userId, returnUrl: parseReturnUrl(domname) };
}

export function useExamIntegration(): ExamIntegration | null {
	const searchParams = useSearchParams();
	const dbname = searchParams.get("dbname");
	const userid = searchParams.get("userid");
	const domname = searchParams.get("domname");
	return useMemo(
		() => parseExamIntegration(dbname, userid, domname),
		[dbname, userid, domname],
	);
}

// Шалгалтаас гарах — гадны систем рүү буцна (хаяг байхгүй бол дууссан хуудас)
export function leaveIntegrationExam(integration: ExamIntegration) {
	window.location.replace(integration.returnUrl ?? INTEGRATION_FINISHED_PATH);
}

// Горимоос хамаарч шалгалтын API сонгоно — дуудах хэлбэр нь ижил
export function getExamApi(dbname?: string | null) {
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
		finishExam: (...args: Parameters<typeof finishExam>) =>
			finishIntegrationExam(dbname, ...args),
	};
}
