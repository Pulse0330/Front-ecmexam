// ===== types/examFinish.ts =====
export interface ExamFinishConnOptions {
	encrypt: boolean;
	trustServerCertificate: boolean;
}

export interface ExamFinishConnPool {
	max: number;
	min: number;
	idleTimeoutMillis: number;
}

export interface ExamFinishConn {
	user: string;
	password: string;
	database: string;
	server: string;
	pool: ExamFinishConnPool;
	options: ExamFinishConnOptions;
}

export interface FinishExamRequest {
	exam_id: number;
	exam_type: number;
	start_eid: number;
	exam_time: string;
	user_id: number;
	conn?: ExamFinishConn;
}

export interface FinishExamResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: number;
}
