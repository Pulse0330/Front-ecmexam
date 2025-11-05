export interface ExamlistsResponseTye {
  ResponseMessage: string;
  StatusCode: string;
  ResponseCode: string;
  ResponseType: boolean;
}

export interface ExamData {
  exam_id: number;
  title: string;
  ognoo: string;
  exam_minute: number;
  help: string;
  teach_name: string;
  exam_type: number;
  flag_name: string;
  flag: number;
  que_cnt: number;
  ispaydescr: string;
  amount: number;
  ispay: number;
  ispurchased: number;
  ispurchaseddescr: string;
  bill_type: number;
  plan_id: number | null;
  plan_name: string | null;
}
// /types.ts


export interface ApiExamlistsResponse {
  RetResponse: ExamlistsResponseTye;
  RetData: ExamData[];
}
