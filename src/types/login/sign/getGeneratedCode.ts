export interface VerificationCodeRequest {
	phone: number;
	conftype: string;
	bundleid: string;
	devicemodel?: string;
	ismob: number;
}

export interface VerificationCodeResponse {
	RetResponse: {
		ResponseMessage: string;
		RtrGenCode: string;
		RtrGenCodeSeconds: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: null;
}
