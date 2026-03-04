export interface VerifyData {
	firstname: string;
	lastname: string;
	reg_number: string;
	gender_code: "M" | "F";
	dateofbirth: string;
	phone: string | null;
	email: string;
	aimag_name: string;
	sym_name: string;
	schoolname: string;
	studentgroupname: string;
	class_id: number;
	academic_level: number;
	img_url: string | null;
	nationality: string;
	login_name: string;
	personId: string;
	school_esis_id: string;
	student_group_id: string;
	schooldb: string;
	password: string;
}

export interface ExamineeItem {
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
	academic_level: number | null;
	personid: string;
	schooldb: string | null;
	schoolname: string | null;
	studentgroupname: string;
	aimag_name: string | null;
	sym_name: string | null;
	flag: number | null;
	flagname: string;
	userid: number;
}

export interface ExamDate {
	id: number;
	exam_id: number;
	start_date: string;
	end_date: string;
	exam_skuul_id: number;
	exam_date_id: number | null;
	date?: string; // ← нэмэх
	exam_date?: string;
}

export interface ExamItem {
	id: number;
	exam_id: number;
	exam_number: string;
	name: string;
	duration: number;
	register_start_date: string;
	register_end_date: string;
	item_open_date: string;
	exam_dates: ExamDate[];
}
export interface ExamRoom {
	id: number;
	esisroomid: number; // ← энийг нэмнэ
	name: string;
	branchname: string;
	room_number: string;
	description: string;
	schoolesisid: string;
	num_of_pc: number;
	pccnt: number;
	seatcnt: number;
}

export type Step = "preview" | "select_exam" | "paid";
