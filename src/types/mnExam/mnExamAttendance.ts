export interface ExamAttendanceRetResponse {
	ResponseMessage: string;
	StatusCode: number;
	ResponseCode: number;
	ResponseType: boolean;
}

export interface ExamAttendanceRetData {
	error_code: string | null;
	details: unknown | null;
}

export interface ExamAttendanceResponse {
	RetResponse: ExamAttendanceRetResponse;
	RetData: ExamAttendanceRetData;
}