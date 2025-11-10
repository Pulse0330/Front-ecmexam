export interface ExamResponseMoreApiResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetDataFirst: {
		row_num: string;
		question_id: number;
		question_html: string;
		istrue: number;
		que_type_id: number;
		avsan_onoo: number;
		onoo: number;
		question_img: string;
		is_src: number;
		source_name: string;
		source_img: string;
		is_bodolt: number;
	}[];
	RetDataSecond: {
		question_id: number;
		answer_id: number;
		answer_name: string;
		answer_name_html: string;
		answer_descr: string;
		answer_img: string;
		answer_type: number;
		is_true: number;
	}[];
	RetDataThirth: {
		question_id: number;
		answer_id: number;
		answer_name: string;
		answer_name_html: string;
		answer_descr: string;
		answer_img: string;
		answer_type: number;
		is_true: number;
	}[];
	RetDataFourth: {
		question_id: number;
		answer_id: number;
		answer_name: string;
		answer_name_html: string;
		answer_descr: string;
		answer_img: string;
		answer_type: number;
		is_true: number;
	}[];
	RetDataFifth: null;
}
