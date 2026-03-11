interface RetResponse {
	ResponseMessage: string;
	StatusCode: number;
	ResponseCode: number;
	ResponseType: boolean;
}

export interface MNUserCheckData {
	id: number;
	examinee_number: string;
	first_name: string;
	last_name: string;
	register_number: string;
	gender: "M" | "F";
	age: number;
	mail: string;
	address: string;
	nationality: string;
	profile: string | null;
	school_esis_id: string;
	student_group_id: string;
	academic_level: string;
	personid: string;
	schooldb: string;
	schoolname: string;
	studentgroupname: string;
	aimag_name: string;
	sym_name: string;
	flag: number;
	passwordgit: string;
}

export interface MNUserCheckResponse {
	RetResponse: RetResponse;
	RetData: MNUserCheckData[];
}
