export interface getplaninfoCourseData {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetDataFirst: Array<{
		palnid: number;
		title: string;
		expired: string;
		amount: number;
		ispay: number;
		filename: string;
		ispurchased: number;
		bill_type: number;
	}>;
	RetDataSecond: Array<{
		planid: number;
		descr: string;
		month: number;
		amount: number;
	}>;
}
