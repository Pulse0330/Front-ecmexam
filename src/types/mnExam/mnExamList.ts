// @/types/mnExam/mnExamList.ts
export interface mnExamVariantData {
	variantId: number; // ← array-аас number болгов
	variant_number: number;
	name: string[]; // ← name array хэвээр
	exam_id: number;
	exam_date_id: number;
	userid: number;
	exam_registration_id: number; // ← array-аас number болгов
	exam_number: string;
	duration: number;
	sdate: string;
	exam_type: number;
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
