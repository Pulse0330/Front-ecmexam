export interface CourseListResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: CourseContent[];
}

export interface CourseContent {
	content_id: number;
	content_name: string;
	rate: string;
	views: number;
	filename: string;
	paydescr: string;
	amount: number;
	ispay: number;
	contentcnt: number;
	course_id: number;
	course_name: string;
	teach_name: string;
	bill_type: number;
}
