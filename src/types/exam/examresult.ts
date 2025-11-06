// src/types/exam/examresults.ts
export interface ExamResultItem {
  test_id: number;
  title: string;
  test_date: string;
  test_time: string;
  fname: string;
  test_ttl: number;
  correct_ttl: number;
  wrong_ttl: number;
  ttl_point: number;
  point: number;
  point_perc: number;
  unelgee: string;
}

export interface ExamResultsResponse {
  RetResponse: {
    ResponseMessage: string;
    StatusCode: string;
    ResponseCode: string;
    ResponseType: boolean;
  };
  RetData: ExamResultItem[];
}
