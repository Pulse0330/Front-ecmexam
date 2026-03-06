export type mnExamResponse = {
	RetResponse: {
		ResponseMessage: string | null;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: mnExamData[];
};

export type mnExamData = {
	exam_number: string;
	duration: number;
	name: string;
	start_date: string;
	end_date: string;
	exam_type: number;
};
