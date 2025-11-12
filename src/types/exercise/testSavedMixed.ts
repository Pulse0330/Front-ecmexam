// types.ts

export interface TestSavedMixedItem {
	testcnt: number;
	rlesson_id: number;
}

export interface ApiResponseWithNullData {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: null;
}

export type TestSavedMixedResponse = ApiResponseWithNullData;
