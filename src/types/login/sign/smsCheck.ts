export interface OTPVerificationRequest {
	phone: number;
	code: number;
}

export interface OTPVerificationResponse {
	RetResponse: {
		ResponseToken: string;
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: null;
}
