// src/types/exam/examVariants.ts

export interface ExamVariantItem {
	variantId: number;
	variant_number: number;
	lesson_name: string;
	exam_id: number;
	exam_date_id: number;
	userId: number;
	institutionid: number;
	sections_cnt: number;
	questions_cnt: number;
}

export interface ExamVariantsResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
	RetData: ExamVariantItem[];
}
