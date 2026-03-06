// Шинэ type нэмнэ
export interface mnExamFinishResponse {
    RetResponse: {
        ResponseMessage: string;
        StatusCode: number;
        ResponseCode: number;
        ResponseType: boolean;
    };
    RetData: unknown[]; // backend-ийн response structure-аас хамаарна
}