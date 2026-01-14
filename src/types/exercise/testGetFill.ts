export interface ExamFinishResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	ExamInfo: {
		title: string;
		end_time: string; // ISO string
		minut: number;
		que_cnt: number;
		exam_type_name: string;
		lesson_icon: string;
		execute_limit: number;
		show_que_analys: number;
		show_que_descr: number;
		show_true_ans: number;
		guits: number;
		guitsgui: number;
		catid: number;
	}[];
	Questions: {
		row_num: string;
		question_id: number;
		question_img: string;
		que_type_id: number;
		que_onoo: number;
		question_name: string;
		is_src: number;
		source_name: string | null;
		source_img: string | null;
		is_shinjilgee: number;
		is_bodolt: number;
	}[];
	Answers: {
		question_id: number;
		answer_id: number;
		answer_name: string;
		answer_name_html: string;
		answer_descr: string;
		answer_img: string | null;
		is_true: number;
		answer_type: number;
		refid: number;
		ref_child_id: number | null;
	}[];
	ChoosedAnswer: {
		question_id: number;
		descr: string;
		img_file: string;
	}[];
	ChoosedFiles: null;
	RetData: null;
}
