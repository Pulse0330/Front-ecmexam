// Database Connection Type
export interface DatabaseConnection {
	user: string;
	password: string;
	database: string;
	server: string;
	pool?: {
		max: number;
		min: number;
		idleTimeoutMillis: number;
	};
	options?: {
		encrypt: boolean;
		trustServerCertificate: boolean;
	};
}

// Base Response Type
export interface BaseResponse {
	ResponseType: boolean;
	ResponseMessage: string;
	StatusCode: string;
}

// OTP Request Payload
export interface OTPRequestPayload {
	phone: number;
	conftype: string;
	bundleid: string;
	devicemodel: string;
	ismob: number;
	conn?: DatabaseConnection;
}

// OTP Response
export interface OTPResponse {
	RetResponse?: {
		ResponseType: boolean;
		ResponseMessage: string;
		StatusCode?: string;
		RtrGenCode?: string;
		RtrGenCodeSeconds?: number;
	};
}

// OTP Verification Payload
export interface OTPVerificationPayload {
	phone: number;
	code: number;
	conn?: DatabaseConnection;
}

// OTP Verification Response
export interface OTPVerificationResponse {
	RetResponse?: BaseResponse;
}

export interface ForgotPasswordRequest {
	phone: string; // number -> string
	password: string;
	conn?: DatabaseConnection;
}

// Forgot Password Response
export interface ForgotPasswordResponse {
	phone?: string; // number -> string
	password?: string;
	conn?: DatabaseConnection;
	RetResponse?: BaseResponse;
}

// Form Schema Type (from Zod)
export interface ForgotPasswordFormValues {
	phone: string;
	password: string;
	confirmPassword: string;
}
