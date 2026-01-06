export type Lesson = {
	lesson_id: number;
	lesson_name: string;
	sort: number;
};

export type TestFilterResponse = {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: Lesson[];
};
