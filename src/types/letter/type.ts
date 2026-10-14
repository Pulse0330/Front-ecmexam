// src/types/letter.ts — backend /letter/* API-ийн төрлүүд

export interface LetterApiResponse<T> {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: T;
}

// primary | secondary | success | warning | danger | info
export type LetterTypeColor = string;

interface LetterBase {
	id: number;
	type_id: number;
	type_name: string; // "Талархал"
	type_color: LetterTypeColor; // "warning"
	subject: string;
	sender_name: string;
	sender_title: string | null;
	sender_org: string | null;
	sender_photo: string | null;
	priority: number;
	require_ack: boolean; // "Танилцсан" товч дарах шаардлагатай эсэх
	send_date: string;
	read_date: string | null;
	ack_date: string | null;
}

export interface LetterListItem extends LetterBase {
	is_read: number; // 0 | 1
	file_count: number;
	total_count: number;
}

export interface LetterDetail extends LetterBase {
	body: string; // HTML
}

export interface LetterFile {
	filename: string;
	uploaded: string;
	file_ext: string;
	file_size: number;
	file_url: string;
}

export interface LetterUnreadData {
	unread: number;
	urgent: number;
}

export interface LetterInboxData {
	total: number;
	page: number;
	items: LetterListItem[];
}

export interface LetterDetailData {
	letter: LetterDetail;
	files: LetterFile[];
}