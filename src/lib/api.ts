// src/lib/api.ts

import type { ApiExamResponse } from "@/types/exam/exam";
import type { ExamAnswerResponse } from "@/types/exam/examchoosed";
import type {
	FinishExamRequest,
	FinishExamResponse,
} from "@/types/exam/examfinish";
import type { ApiExamlistsResponse } from "@/types/exam/examlist";
import type { ExamresultListResponseType } from "@/types/exam/examresiltlist";
import type { ExamResultsResponse } from "@/types/exam/examresult";
import type { GetTestGroupResponse } from "@/types/exercise/testgroup";
import type { HomeResponseType } from "@/types/home";
import type { LoginResponseType } from "@/types/login";
import type { ApiSorillistsResponse } from "@/types/soril/sorillists";
import type { SorilresultListResponseType } from "@/types/soril/sorilresultlists";
import type { UserProfileResponseType } from "@/types/user";
import api from "./axios";
export const loginRequest = async (
	username: string,
	password: string,
): Promise<LoginResponseType> => {
	const { data } = await api.post<LoginResponseType>("/login", {
		username,
		password,
		deviceid: "",
		devicemodel: "",
	});
	return data;
};

// ===== HomeScreen request =====
export const getHomeScreen = async (
	userId: number,
): Promise<HomeResponseType> => {
	const { data } = await api.post<HomeResponseType>("/gethomescreen", {
		user_id: userId,
	});
	return data;
};
// ===== Get UserProfile =====
export const getUserProfile = async (
	userId: number,
): Promise<UserProfileResponseType> => {
	const { data } = await api.post<UserProfileResponseType>("/getuserprofile", {
		user_id: userId,
	});
	return data;
};
// ===== Get Date =====
export const getServerDate = async (): Promise<string> => {
	const { data } = await api.post("/getdate", {});
	return data?.RetData?.[0]?.systemdate ?? "";
};

//-------------------------------Exam---------------------------------//
// ===== Get Examlists  =====
export const getExamlists = async (
	userId: number,
): Promise<ApiExamlistsResponse> => {
	const { data } = await api.post<ApiExamlistsResponse>("/getexamlists", {
		user_id: userId,
		optype: 0,
	});
	return data;
};

//===== Get Examresultlists =====
export const getexamresultlists = async (
	userId: number,
): Promise<ExamresultListResponseType> => {
	const { data } = await api.post<ExamresultListResponseType>(
		"/getexamresultlists",
		{
			exam_type: 2,
			user_id: userId,
		},
	);
	return data;
};
// ===== Exam request =====
export const getExamById = async (
	userId: number,
	examId: number,
): Promise<ApiExamResponse> => {
	const { data } = await api.post<ApiExamResponse>("/getexamfill", {
		user_id: userId,
		exam_id: examId,
	});
	return data;
};
// ===== Exam choosed  =====
export const saveExamAnswer = async (
	userId: number,
	examId: number,
	questionId: number,
	answerId: number,
	queTypeId: number,
	answer: string = "",
	rowNum: number,
): Promise<ExamAnswerResponse> => {
	const { data } = await api.post<ExamAnswerResponse>("/examchoosedanswer", {
		que_type_id: queTypeId,
		question_id: questionId,
		answer_id: answerId,
		answer: answer,
		row_num: rowNum,
		exam_id: examId,
		user_id: userId,
	});
	return data;
};
// ===== Exam finish   =====
export const finishExam = async (
	data: FinishExamRequest,
): Promise<FinishExamResponse> => {
	const { data: response } = await api.post<FinishExamResponse>(
		"/examfinish",
		data,
	);
	console.log("Exam finish response:", response);
	return response;
};
// =====
// ===== Get Exam Results =====
export const getExamResults = async (
	testId: number,
): Promise<ExamResultsResponse> => {
	const { data } = await api.post<ExamResultsResponse>("/getexamresults", {
		test_id: testId,
	});
	return data;
};
//-------------------------------Soril---------------------------------//
// ===== Get Sorillists  =====
export const getSorillists = async (
	userId: number,
): Promise<ApiSorillistsResponse> => {
	const { data } = await api.post<ApiSorillistsResponse>("/getexamlists", {
		user_id: userId,
		optype: 1,
	});
	return data;
};

//===== Get Sorilresultlists =====
export const getSorilresultlists = async (
	userId: number,
): Promise<SorilresultListResponseType> => {
	const { data } = await api.post<SorilresultListResponseType>(
		"/getexamresultlists",
		{
			exam_type: 3,
			user_id: userId,
		},
	);
	return data;
};

// ===== Get testgroup =====
export const gettestgroup = async (
	userId: number,
): Promise<GetTestGroupResponse> => {
	const { data } = await api.post<GetTestGroupResponse>("/gettestgroup", {
		user_id: userId,
	});
	return data;
};
