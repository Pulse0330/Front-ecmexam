export interface LessonTopicListResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: LessonTopicItem[];
}

export interface LessonTopicItem {
	id: number;
	name: string;
	cnt: number;

	ulessonid: number;
	ulesson_name: string;

	courseid: number;
	coursename: string;

	tpercent: number;
	bulegcnt: number;
}
