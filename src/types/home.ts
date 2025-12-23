// src/types/home.ts

// Үндсэн Response Type
export interface HomeResponseType {
	RetResponse: RetResponse;
	RetDataFirst: Banner[] | null;
	RetDataSecond: Course[] | null;
	RetDataThirt: Exam[] | null;
	RetDataFourth: ContentCard[] | null;
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

// Шалгалт (Exam)
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

// Контент карт (RetDataFourth)
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

// Helper functions (optional)
export const isPaid = (item: { ispay: PaymentStatus }): boolean =>
	item.ispay === 1;
export const isPurchased = (item: { ispurchased: PurchaseStatus }): boolean =>
	item.ispurchased === 1;
export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString("mn-MN");
};
export const parseRating = (rate: string): number => parseFloat(rate) || 0;
