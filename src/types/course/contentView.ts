export interface ContentViewResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: ContentView[];
}

export interface ContentView {
	elib_id: number;
	content_id: number;
	content_name: string;
	l_unit_type: number;
	l_content_type: number;
	elesson_type: string;
	url: string;
	stu_worked: number;
	exam_id: number | null;
	examname: string | null;
	minut: number | null;
	help: string | null;
	testcnt: number | null;
}
