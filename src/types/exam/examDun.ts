export interface ExamDunApiResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: {
		tuval: string;
		title: string;
		color: string;
		img: string;
		ueval: string;
	}[];
}
