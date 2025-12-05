// API Response Type
export interface ExamResponseMoreApiResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetDataFirst: ExamSummary[];
	RetDataSecond: Question[];
	RetDataThirt: Answer[];
	RetDataFourth: UserAnswer[];
	RetDataFifth: [];
	RetDataSixth: null;
}

// Exam Summary (RetDataFirst)
// ШИНЭ КОД:
export interface ExamSummary {
	test_id: number;
	lesson_name: string;
	test_title: string;
	test_type_name: string;
	test_date: string;
	test_time: string;
	test_ttl: number;
	correct_ttl: number;
	not_answer: number;
	wrong_ttl: number;
	zadgai: number;
	ttl_point: number;
	point: number;
	point_perc: number;
	fname: string;
	show_true_ans: number; // ✅ Энэ мөрийг нэмнэ
	show_que_analys: number; // ✅ Бас эдгээр 2-ыг нэмэх хэрэгтэй байж магадгүй
	show_que_descr: number; // ✅
}

// Question (RetDataSecond)
export interface Question {
	exam_id: number;
	row_num: string;
	exam_que_id: number;
	question_img: string;
	que_zaawar: string;
	que_type_id: number; // 1: Single, 2: Multiple, 3: Number, 4: Essay, 5: Order, 6: Match
	que_onoo: number;
	question_name: string;
	is_src: number;
	source_html: string;
	shinjilgee: number;
	bodolt: number;
	source_name: string | null;
	source_img: string | null;
	unelsen: number;
	zad_onoo: number;
	zad_descr: string;
	urltype: string;
}

// Answer (RetDataThirt)
export interface Answer {
	answer_id: number;
	answer_name: string;
	answer_name_html: string;
	answer_descr: string; // For type 6: "а" or "б"
	answer_img: string;
	is_true: number; // 1: correct, 0: wrong, -1: N/A
	exam_que_id: number;
	answer_type: number; // Same as que_type_id
	refid: number; // For type 6: matching reference
	ref_child_id: number | null; // For type 6: matching child reference
	test_id: number;
}

// User Answer (RetDataFourth)
export interface UserAnswer {
	exam_que_id: number;
	answer_id: number;
	answer: string; // For type 3: user's input value, For type 6: position
	quetype: number;
}
