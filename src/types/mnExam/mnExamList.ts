// @/types/mnExam/mnExamList.ts
export interface mnExamVariantData {
  variantId: number | null;
  variant_number: string | null;
  name: string[];           // ← string[] болгов
  exam_id: number;
  exam_date_id: number;
  userid: number;           // ← userId → userid (JSON-тай тохируулав)
  exam_registration_id: number | null;
  exam_number: string;
  duration: number;
  sdate: string;
      exam_type: number; 
  // institutionid байхгүй тул хассан
}

export interface mnExamVariantResponse {
  RetResponse: {
    ResponseMessage: string;
    StatusCode: number;
    ResponseCode: number;
    ResponseType: boolean;
  };
  RetData: mnExamVariantData[];
}