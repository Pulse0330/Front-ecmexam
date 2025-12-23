// src/types/home.ts

// Үндсэн Response Type
export interface HomeResponseType {
	RetResponse: RetResponse;
	RetDataFirst: Banner[] | null;
	RetDataSecond: Course[] | null;
	RetDataThirt: Exam[] | null;
	RetDataFourth: PastExam[] | null; // ✅ ContentCard -> PastExam
	RetDataFifth: Purchased[] | null;
	RetDataSixth: unknown | null;
}

// Response мэдээлэл
export interface RetResponse {
	ResponseMessage: string;
	StatusCode: string;
	ResponseCode: string;
	ResponseType: boolean;
}

// Зар сурталчилгаа (Banner/Advertisement)
export interface Banner {
	title: string;
	descr: string;
	filename: string; // Зургийн URL
	url: string; // Холбоос
}

// Сургалтын төлөвлөгөө (Course/Plan)
export interface Course {
	planid: number;
	title: string;
	expired: string; // ISO Date string
	amount: number;
	ispay: 0 | 1; // 0 = Үнэгүй, 1 = Төлбөртэй
	paydescr: string;
	rate: string; // "4.8" гэх мэт
	filename: string | null;
	ispurchased: 0 | 1; // 0 = Худалдаж аваагүй, 1 = Худалдаж авсан
	catname: string;
	catid: number;
	bill_type: number;
}

// Шалгалт/Сорил (Exam) - RetDataThirt
export interface Exam {
	exam_id: number;
	title: string;
	ognoo: string; // Огноо (ISO Date string)
	exam_minute: number; // Шалгалтын хугацаа (минутаар)
	help: string;
	teach_name: string;
	exam_type: number;
	flag_name: string;
	flag: number;
	que_cnt: number; // Асуултын тоо
	ispaydescr: string;
	amount: number;
	ispay: 0 | 1;
	ispurchased: 0 | 1;
	ispurchaseddescr: string;
	bill_type: number;
}

// Өмнөх жилийн сорил (RetDataFourth) - JSON response-тай таарч байгаа
export interface PastExam {
	exam_id: number;
	soril_name: string; // Сорилын нэр
	sorildate: string; // Сорилын огноо (ISO Date string)
	minut: number; // Хугацаа (минут)
	que_cnt: number; // Асуултын тоо
	isguitset: 0 | 1; // 0 = Гүйцэтгээгүй, 1 = Гүйцэтгэсэн
	test_resid: number; // Тестийн үр дүнгийн ID
	filename: string; // Зургийн URL
}

// Цахим сургалтын контент карт
export interface ContentCard {
	content_id: number;
	content_name: string;
	rate: string;
	views: number;
	filename: string; // Зургийн URL
	paydescr: string;
	amount: number;
	ispay: 0 | 1;
	contentcnt: number; // Контентын тоо
	course_id: number;
	course_name: string;
	teach_name: string;
	bill_type: number;
}

// Худалдан авалтын мэдээлэл
export interface Purchased {
	purchased: 0 | 1; // 0 = Худалдаж аваагүй, 1 = Худалдаж авсан
}

// Utility Types
export type PaymentStatus = 0 | 1;
export type PurchaseStatus = 0 | 1;

// Helper functions
export const isPaid = (item: { ispay: PaymentStatus }): boolean =>
	item.ispay === 1;
export const isPurchased = (item: { ispurchased: PurchaseStatus }): boolean =>
	item.ispurchased === 1;

export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString("mn-MN");
};

export const parseRating = (rate: string): number => parseFloat(rate) || 0;

// Сорилын огноо форматлах
export const formatSorilDate = (dateString: string): string => {
	if (dateString === "1900-01-01T00:00:00.000Z") {
		return "Хугацаагүй";
	}
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return `${year} оны ${month} сарын ${day}`;
};

// Сорилын статус шалгах
export const isSorilCompleted = (isguitset: 0 | 1): boolean => isguitset === 1;
