// src/types/exam/examList.ts

export interface ExamlistsData {
	exam_id: number;
	title: string;
	teach_name: string;
	exam_minute: number;
	ognoo: string; // ISO date string format
	que_cnt?: number;
	exam_type?: string;
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
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: ExamlistsData[];
}
