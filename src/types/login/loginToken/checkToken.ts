export interface StatusItem {
	status: number;
}

export interface CheckTokenResponse<T> {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: T;
}
