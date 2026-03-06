export interface ExamPrintItem {
  exam_number: string;
  duration: number;
  name: string;
  ognoo: string;
  start_date: string;
  end_date: string;
  burtguulsen: number;
  seat_number: number;
  room_number: string;
  roomname: string;
  branchname: string;
  description: string;
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
  profile: string;
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
}

export interface ExamPrintListResponse {
  RetResponse: {
    ResponseMessage: string;
    StatusCode: number;
    ResponseCode: number;
    ResponseType: boolean;
  };
  RetData: ExamPrintItem[];
}