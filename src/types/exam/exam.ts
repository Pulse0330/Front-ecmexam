// types/exam.ts

export interface Question {
	row_num: string;
	question_id: number;
	question_img: string;
	que_type_id: number;
	que_onoo: number;
	question_name: string;
	ismaths: number;
	is_src: number;
	source_name: string | null;
	source_img: string | null;
	is_shinjilgee: number;
	is_bodolt: number;
}

export interface Answer {
	question_id: number;
	answer_id: number;
	answer_name: string;
	answer_name_html: string;
	ismaths: number;
	answer_descr: string;
	answer_img: string;
	answer_type: number;
	refid: number;
	ref_child_id: number | null;
}

export interface ExamInfo {
	id: number;
	title: string;
	descr: string;
	help: string;
	is_date: number;
	end_time: string; // ISO date string
	minut: number;
	que_cnt: number;
	exam_type_name: string;
	exam_type: number;
	start_eid: number;
	test_id?: number;
}

export interface ChoosedAnswer {
	QueType: number | null;
	QueID: number | null;
	AnsID: number | null;
	Answer: string | null;
	PageNum: number | null;
}

export interface ChoosedFile {
	fileName: string;
	fileUrl: string;
	fileType?: string;
}

export interface RetDataItem {
	exam_id: number;
	flag_name: string;
	flag: number;
}

export interface RetResponse {
	ResponseMessage: string;
	StatusCode: string;
	ResponseCode: string;
	ResponseType: boolean;
}

export interface ApiExamResponse {
	RetResponse: RetResponse;
	ExamInfo: ExamInfo[];
	Questions: Question[];
	Answers: Answer[];
	ChoosedAnswer: ChoosedAnswer[];
	ChoosedFiles: ChoosedFile[];
	RetData: RetDataItem[];
}

export interface SaveAnswerRequest {
	userId: number;
	examId: number;
	questionId: number;
	queTypeId: number;
	answerValue: number | number[] | string | Record<string, string> | null;
}

export interface SaveAnswerResponse {
	RetResponse: RetResponse;
	RetData?: {
		saved: boolean;
		questionId?: number;
		answerId?: number;
	};
}
