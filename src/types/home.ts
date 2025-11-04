// src/types/home.ts

// Үндсэн Response Type
export interface HomeResponseType {
  RetResponse: RetResponse;
  RetDataFirst: Banner[];
  RetDataSecond: Course[];
  RetDataThirt: Exam[];
  RetDataFourth: PastExam[];
  RetDataFifth: Purchased[];
  RetDataSixth: null;
}

// Response мэдээлэл
export interface RetResponse {
  ResponseMessage: string;
  StatusCode: string;
  ResponseCode: string;
  ResponseType: boolean;
}

// Зар сурталчилгаа (Banner)
export interface Banner {
  title: string;
  descr: string;
  filename: string;
  url: string;
  id: string;
}

// Сургалтын төлөвлөгөө (Course/Plan)
export interface Course {
  planid: number;
  title: string;
  expired: string;
  amount: number;
  ispay: number;
  paydescr: string;
  rate: string;
  filename: string | null;
  ispurchased: number;
  catname: string | null;
  catid: number | null;
  bill_type: number;
}

// Шалгалт (Exam)
export interface Exam {
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
}

// Өмнөх жилийн сорилууд (Past Exam)
export interface PastExam {
  exam_id: number;
  soril_name: string;
  sorildate: string;
  minut: number;
  que_cnt: number;
  isguitset: number;
  test_resid: number;
  filename: string;
}

// Худалдан авалтын мэдээлэл
export interface Purchased {
  purchased: number;
}