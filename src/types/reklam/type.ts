// src/types/reklam.ts

export interface ReklamItem {
	id: number;
	type_id: number; // 1 = splash, 2 = home, 3 = popup
	title: string;
	descr: string;
	filename: string;
	file_ext: string;
	file_type: number; // 1 = зураг, 2 = видео
	url: string;
	duration_sec: number;
	can_skip: boolean;
	sort_order: number;
	weight: number; // их байх тусам гарах магадлал өндөр
	start_date: string | null;
	end_date: string | null;
	file_url: string;
}

export interface ReklamData {
	splash: ReklamItem[];
	home: ReklamItem[];
	popup: ReklamItem[];
}

export interface ReklamResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: ReklamData | null;
}