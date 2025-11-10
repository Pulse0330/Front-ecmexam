// ========================
// API Response Types
// ========================

export interface ExamResponseMoreApiResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetDataFirst: ExamInfo[];
	RetDataSecond: Question[];
	RetDataThirt: Answer[];
	RetDataFourth: UserAnswer[];
	RetDataFifth: Explanation[];
	RetDataSixth: null;
}

// Exam Info
export interface ExamInfo {
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
	ttl_point: number;
	point: number;
	point_perc: number;
	fname: string;
}

// Question
export interface Question {
	exam_id: number;
	row_num: string;
	exam_que_id: number;
	question_img: string;
	que_zaawar: string;
	que_type_id: number;
	que_onoo: number;
	question_name: string;
	is_src: number;
	source_html: string;
	shinjilgee: number;
	bodolt: number;
	filename: string;
	unelsen: number;
	zad_onoo: number;
	zad_descr: string;
	urltype: string;
}

// Answer
export interface Answer {
	answer_id: number;
	answer_name: string;
	answer_name_html: string;
	answer_descr: string;
	answer_img: string;
	is_true: number;
	exam_que_id: number;
	answer_type: number;
	refid: number;
	ref_child_id: number | null;
	test_id: number;
}

// User Answer
export interface UserAnswer {
	exam_que_id: number;
	answer_id: number;
	answer: string;
	quetype: number;
}

// Explanation
export interface Explanation {
	exam_que_id: number;
	descr: string;
	img_file: string;
}

// ========================
// ExamDetail Structure
// ========================

export interface ExamDetail {
	examInfo: ExamInfo;
	questions: {
		exam_que_id: number;
		question_name: string;
		question_img?: string;
		que_type_id: number;
		que_onoo: number;
		que_zaawar: string;
		answers: {
			answer_id: number;
			answer_name: string;
			answer_name_html: string;
			is_true: number;
			answer_type: number;
		}[];
		userAnswer?: {
			answer_id: number;
			answer: string;
			quetype: number;
		};
		explanation?: {
			descr: string;
			img_file?: string;
		};
	}[];
}

// ========================
// Helper Function
// ========================

export const mapApiResponseToExamDetail = (
	apiData: ExamResponseMoreApiResponse,
): ExamDetail => {
	const examInfoRaw = apiData.RetDataFirst[0];

	const examInfo: ExamInfo = { ...examInfoRaw };

	const questions = apiData.RetDataSecond.map((q) => {
		const answers = apiData.RetDataThirt.filter(
			(a) => a.exam_que_id === q.exam_que_id,
		);
		const userAnswer = apiData.RetDataFourth.find(
			(ua) => ua.exam_que_id === q.exam_que_id,
		);
		const explanation = apiData.RetDataFifth.find(
			(ex) => ex.exam_que_id === q.exam_que_id,
		);

		return {
			exam_que_id: q.exam_que_id,
			question_name: q.question_name,
			question_img: q.question_img,
			que_type_id: q.que_type_id,
			que_onoo: q.que_onoo,
			que_zaawar: q.que_zaawar,
			answers: answers.map((a) => ({
				answer_id: a.answer_id,
				answer_name: a.answer_name,
				answer_name_html: a.answer_name_html,
				is_true: a.is_true,
				answer_type: a.answer_type,
			})),
			userAnswer: userAnswer
				? {
						answer_id: userAnswer.answer_id,
						answer: userAnswer.answer,
						quetype: userAnswer.quetype,
					}
				: undefined,
			explanation: explanation
				? {
						descr: explanation.descr,
						img_file: explanation.img_file,
					}
				: undefined,
		};
	});

	return { examInfo, questions };
};
