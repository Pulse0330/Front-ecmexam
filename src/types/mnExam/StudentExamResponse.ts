export interface RetResponse {
	ResponseMessage: string;
	StatusCode: string;
	ResponseCode: string;
	ResponseType: boolean;
}

export interface Student {
	login_name: string;
	firstname: string;
	lastname: string;
	reg_number: string;
	gender: number;
	phone: string | null;
	email: string;
	aimag_id: string;
	sym_id: string;
	class_id: number;
	group_id: number;
	img_url: string | null;
	descr: string;
	regdate: string;
	dateofbirth: string;
	personId: string;
	schooldb: string;
	schoolname: string;
	studentgroupid: string;
	studentgroupname: string;
	aimag_name: string;
	sym_name: string;
}

// Concrete response (generic-гүй)
export interface StudentExamResponse {
	RetResponse: RetResponse;
	RetData: Student[];
}
