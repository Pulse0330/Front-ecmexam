// @/types/soril/sorilLists.ts

export interface SorillistsResponseTye {
	ResponseMessage: string;
	StatusCode: string;
	ResponseCode: string;
	ResponseType: boolean;
}

export interface SorillistsData {
	exam_id: number;
	soril_name: string; // Сорилын нэр
	sorildate: string; // Сорилын огноо
	minut: number; // Хугацаа (минутаар)
	que_cnt: number; // Асуултын тоо
	isguitset: number; // 0 = эхлээгүй, 1 = дууссан
	test_resid: number; // 0 = хийгээгүй, > 0 = хийсэн ID
	filename: string; // Зургийн URL
	flag_name: string; // Товчны текст ("Эхлүүлэх", "Үргэлжлүүлэх", гэх мэт)
	plan_id: number; // Төлөвлөгөөний ID
	plan_name: string; // Төлөвлөгөөний нэр
	ispay: number;
}

export interface ApiSorillistsResponse {
	RetResponse: SorillistsResponseTye;
	RetData: SorillistsData[];
}
