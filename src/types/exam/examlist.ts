// src/types/exam/examList.ts

export interface ExamlistsResponseType {
	ResponseMessage: string;
	StatusCode: string;
	ResponseCode: string;
	ResponseType: boolean;
}

export interface ExamlistsData {
	exam_id: number;
	title: string;
	ognoo: string; // ISO date string format
	exam_minute: number;
	help: string;
	teach_name: string;
	exam_type: number;
	flag_name: string;
	flag: number;
	que_cnt: number;
	ispaydescr: string;
	amount: number;
	ispay: number;
	ispurchased: number;
	ispurchaseddescr: string;
	bill_type: number;
	plan_id: number | null;
	plan_name: string | null;
	// Optional fields
	exam_type_name?: string;
	lesson_icon?: string;
	execute_limit?: number;
	show_que_analys?: number;
	show_que_descr?: number;
	show_true_ans?: number;
	guits?: number;
	guitsgui?: number;
	catid?: number;
}

export interface ApiExamlistsResponse {
	RetResponse: ExamlistsResponseType;
	RetData: ExamlistsData[];
}
