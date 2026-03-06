export interface mnExamUserCheckType {
  exam_id: number;
  exam_date_id: number;
  open_date: string;
  exam_number: string;
  duration: number;
  name: string;
  start_date: string;
  end_date: string;
  burtguulsen: number;
  seat_number: number;
  room_number: string;
  roomname: string;
  branchname: string;
  description: string;
}

export interface mnExamUserCheckResponseType {
  RetData: mnExamUserCheckType[];
  RetResponse: {
    StatusCode: number;
    ResponseType: boolean;
  };
}