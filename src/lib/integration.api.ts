// src/lib/integration.api.ts
// Гадны системээс URL-аар (domname, userid, examid) орж ирсэн шалгалтад ашиглана.
// Хариуг одоогийн API-ийн хэлбэрт (RetResponse) хөрвүүлж буцаадаг тул
// шалгалтын хуудас өөрчлөлтгүй ажиллана.

import axios from "axios";
import type { ApiExamResponse } from "@/types/exam/exam";
import type { ExamAnswerResponse } from "@/types/exam/examChoosed";
import type { ExamChoosedAnswerDeleteResponse } from "@/types/exam/examChoosedAnswerDelete";
import type {
	FinishExamRequest,
	FinishExamResponse,
} from "@/types/exam/examFinish";

const integrationApi = axios.create({
	baseURL:
		process.env.NEXT_PUBLIC_INTEGRATION_API_URL ??
		"https://integration.ecm.mn/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000,
});

interface IntegrationBaseResponse {
	message: string;
	code: string;
	status: string;
	success: boolean;
}

type IntegrationExamFillResponse = IntegrationBaseResponse &
	Partial<Omit<ApiExamResponse, "RetResponse">>;

interface IntegrationFinishResponse extends IntegrationBaseResponse {
	RetData: number | null;
}

// Бүх хүсэлтэд явдаг DB сонголт
const withDb = (dbname: string) => ({
	cmdname: "integration_ConfigTake",
	dbnamelist: [{ dbname }],
});

const toRetResponse = (res: IntegrationBaseResponse) => ({
	ResponseMessage: res.message,
	StatusCode: res.code,
	ResponseCode: res.status,
	ResponseType: res.success,
});

// ===== Integration exam fill =====
export const getIntegrationExamFill = async (
	dbname: string,
	userId: number,
	examId: number,
): Promise<ApiExamResponse> => {
	const { data } = await integrationApi.post<IntegrationExamFillResponse>(
		"/IntegrationExamFill",
		{
			...withDb(dbname),
			exam_id: examId,
			user_id: userId,
		},
	);

	if (!data.success) {
		throw new Error(data.message || "Шалгалт ачаалж чадсангүй");
	}

	return {
		RetResponse: toRetResponse(data),
		ExamInfo: data.ExamInfo ?? [],
		Questions: data.Questions ?? [],
		Answers: data.Answers ?? [],
		ChoosedAnswer: data.ChoosedAnswer ?? [],
		ChoosedFiles: data.ChoosedFiles ?? [],
		RetData: data.RetData ?? [],
	};
};

// ===== Integration exam choosed =====
export const saveIntegrationExamAnswer = async (
	dbname: string,
	userId: number,
	examId: number,
	questionId: number,
	answerId: number,
	queTypeId: number,
	answer: string = "",
	rowNum: number,
): Promise<ExamAnswerResponse> => {
	const { data } = await integrationApi.post<IntegrationBaseResponse>(
		"/IntegrationExamChoosedAnswer",
		{
			...withDb(dbname),
			que_type_id: queTypeId,
			question_id: questionId,
			answer_id: answerId,
			answer: answer,
			row_num: rowNum,
			exam_id: examId,
			user_id: userId,
		},
	);

	if (!data.success) {
		throw new Error(data.message || "Хариулт хадгалж чадсангүй");
	}

	return {
		RetResponse: toRetResponse(data),
		RetData: { success: data.success },
	};
};

// ===== Integration exam choosedanswer delete =====
export const deleteIntegrationExamAnswer = async (
	dbname: string,
	userId: number,
	examId: number,
	questionId: number,
	answerId: number,
): Promise<ExamChoosedAnswerDeleteResponse> => {
	const { data } = await integrationApi.post<IntegrationBaseResponse>(
		"/IntegrationExamDeletedAnswer",
		{
			...withDb(dbname),
			question_id: questionId,
			answer_id: answerId,
			exam_id: examId,
			user_id: userId,
		},
	);

	if (!data.success) {
		throw new Error(data.message || "Хариулт устгаж чадсангүй");
	}

	return {
		RetResponse: toRetResponse(data),
		RetData: null,
	};
};

// ===== Integration exam finish =====
// Амжилтгүй (status !== "10") үед алдаа шидэхгүй — finish.tsx RetResponse-оор шалгана
export const finishIntegrationExam = async (
	dbname: string,
	payload: FinishExamRequest,
): Promise<FinishExamResponse> => {
	const { data } = await integrationApi.post<IntegrationFinishResponse>(
		"/IntegrationExamFinish",
		{
			...withDb(dbname),
			user_id: payload.user_id,
			exam_id: payload.exam_id,
			exam_type: payload.exam_type,
			start_eid: payload.start_eid,
			exam_time: payload.exam_time,
		},
	);

	return {
		RetResponse: toRetResponse(data),
		RetData: data.RetData ?? 0,
	};
};
