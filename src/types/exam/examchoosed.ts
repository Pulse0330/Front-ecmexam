// src/types/examAnswer.ts

export interface ExamAnswerRequest {
  que_type_id: number;
  question_id: number;
  answer_id: number;
  answer: string;
  row_num: number;
  exam_id: number;
  user_id: number;
}

export interface ExamAnswerResponse {
  RetResponse: {
    ResponseCode: string;
    ResponseMessage: string;
    StatusCode: string;
  };
  RetData?: {
    success: boolean;
  };
}