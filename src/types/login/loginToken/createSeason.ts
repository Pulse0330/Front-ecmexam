// types/login/loginToken/createSeason.ts
export type CreatedSeasonResponse<T> = {
	RetResponse: RetResponse;
	RetData: T;
};

export type RetResponse = {
	ResponseMessage: string;
	StatusCode: string;
	ResponseCode: string;
	ResponseType: boolean;
};

// SessionData type нэмэх
export type SessionData = {
	UserId: number;
	Token: string;
	Ip: string;
	Browser: string;
};
