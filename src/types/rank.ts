export interface ExamResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: ExamData[];
}

export interface ExamData {
	exam_id: number;
	test_id: number;
	title: string;
	test_date: string; // "YYYY-MM-DD HH:mm"
	test_time: string; // "HH:mm:ss"
	exam_type: number;
	test_dun: number;
	test_perc: number;
	isfinished: number; // 0 эсвэл 1
	Ognoo: string; // "YYYY-MM-DD HH:mm"
	exam_minute: number;
}
