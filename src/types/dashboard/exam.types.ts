export interface ExamDate {
	id: number;
	start_date: string; // ISO format эсвэл "YYYY-MM-DD HH:mm:ss"
	end_date: string;
	exam_id: number;
	exam_skuul_id: number;
	exam_date_id: number;
}

export interface Exam {
	id: number;
	exam_number: string;
	exam_id: number;
	name: string;
	duration: number; // Минутаар
	register_start_date: string;
	register_end_date: string;
	item_open_date: string;
	exam_dates: ExamDate[];
}

export interface getExamResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: Exam[];
}

export interface getExamSaveResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: null;
}

export interface StudentItem {
	id: number;
	examinee_number: string;
	first_name: string;
	last_name: string;
	register_number: string;
	gender: string | null;
	age: number | null;
	mail: string | null;
	address: string | null;
	nationality: string | null;
	profile: string | null;
	school_esis_id: string;
	student_group_id: string;
	academic_level: string | null;
	personid: number | null;
	schooldb: string | null;
	schoolname: string | null;
	studentgroupname: string;
	aimag_name: string | null;
	sym_name: string | null;
	passwordauto: string;
}

export interface getStudentsResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: StudentItem[];
}

export interface batchRegisterExamResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: null;
}

export interface StudentSeat {
	id: number;
	stu_id: number;
	examinee_number: string;
	first_name: string;
	last_name: string;
	register_number: string;
	gender: string | null;
	school_esis_id: string;
	student_group_id: string;
	schooldb: string | null;
	schoolname: string | null;
	studentgroupname: string;
	seatid: number;
	seat_number: string;
	rownum: number;
	colnum: number;
	exam_registration_id: number | null;
	status_code: number;
	status_text: string;
	login_name: string;
	passwordauto: string;
	variant_number: string | null;
	qrcode: string | null;
	file_url: string | null;
	questionId: number | null;
}

export interface ExamRoom {
	exam_room_id: number;
	room_number: string;
	num_of_pc: number;
	assigned_seats: number;
	total_students: number;
	students: StudentSeat[];
}

export interface getExamTimeResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: ExamRoom[];
}

export interface ExamInfoItem {
	id: number;
	exam_id: number;
	exam_number: string;
	name: string;
	duration: number; // минут
	register_start_date: string; // ISO date string
	register_end_date: string; // ISO date string
	open_date: string; // ISO date string
	regdate: string; // ISO date string
}

export interface getExamInfoResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: ExamInfoItem[];
}

export interface ExamVariant {
	variantId: number;
	variant_number: number;
	lesson_name: string;
	exam_id: number;
	exam_date_id: number;
	userId: number;
	institutionid: number;
	sections_cnt: number;
	questions_cnt: number;
}

export interface getExamMateralResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: ExamVariant[];
}

export interface getExamMateralVariantDownloadResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: {
		error_code: string;
		details: string;
	};
}

export interface Exam1111 {
	exam_id: number;
	exam_date_id: number;
	open_date: string; // ISO date string
	exam_number: string;
	duration: number; // minutes
	name: string;
	start_date: string; // ISO date string
	end_date: string; // ISO date string
	burtguulsen: number;
}
export interface getExamTimedResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: Exam1111[];
}

export interface getExamTimeResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: ExamRoom[];
}

export interface ExamRegistration {
	name: string;
	exam_date: string;
	room_number: string;
	room_name: string;
	seat_number: number;
	register_number: string;
	studentgroupname: string;
	firstname: string;
	exam_registration_id: number;
	question: string;
	qrcode: string;
	examinee_number: string;
}

export interface getExamPrintResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: ExamRegistration[];
}

export interface getExamVariantResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: null;
}
