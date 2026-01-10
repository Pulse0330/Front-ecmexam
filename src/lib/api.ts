// src/lib/api.ts

import api from "@/lib/axios";
import type { ContentViewResponse } from "@/types/course/contentView";
import type { CourseListResponse } from "@/types/course/courseList";
import type { ApiExamResponse } from "@/types/exam/exam";
import type { ExamAnswerResponse } from "@/types/exam/examChoosed";
import type { ExamChoosedAnswerDeleteResponse } from "@/types/exam/examChoosedAnswerDelete";
import type { ExamDunApiResponse } from "@/types/exam/examDun";
import type {
	FinishExamRequest,
	FinishExamResponse,
} from "@/types/exam/examFinish";
import type { ApiExamlistsResponse } from "@/types/exam/examList";
import type { LeaderboardResponse } from "@/types/exam/examRank";
import type { ExamResultsResponse } from "@/types/exam/examResult";
import type { ExamresultListResponseType } from "@/types/exam/examResultList";
import type { ExamResponseMoreApiResponse } from "@/types/exam/examResultMore";
import type { TestFilterResponse } from "@/types/exercise/testFilter";
import type { ExamFinishResponse } from "@/types/exercise/testGetFill";
import type { GetTestGroupResponse } from "@/types/exercise/testGroup";
import type { ApiResponseWithNullData } from "@/types/exercise/testSaved";
import type {
	TestSavedMixedItem,
	TestSavedMixedResponse,
} from "@/types/exercise/testSavedMixed";
import type { HomeResponseType } from "@/types/home";
import type {
	CheckTokenResponse,
	StatusItem,
} from "@/types/login/loginToken/checkToken";
import type {
	CreatedSeasonResponse,
	SessionData,
} from "@/types/login/loginToken/createSeason";
import type {
	LoginTokenResponse,
	User,
} from "@/types/login/loginToken/loginToken";
import type { RegisterSysUserResponse } from "@/types/login/sign/register";
import type {} from "@/types/login/sign/registerChoose/aimag";
import type {} from "@/types/login/sign/registerChoose/duureg";
import type {} from "@/types/login/sign/registerChoose/sum";
import type {} from "@/types/login/sign/registerChoose/surguuli";
import type { ApiSorillistsResponse } from "@/types/soril/sorilLists";
import type { SorilresultListResponseType } from "@/types/soril/sorilResultLists";
import type { UserProfileResponseType } from "@/types/user";
//-------------------------------Auth---------------------------------//

// ===== LoginToken request =====
export const loginTokenRequest = async (
	username: string,
	password: string,
	deviceid: string,
	devicemodel: string,
): Promise<LoginTokenResponse<User>> => {
	const { data } = await api.post<LoginTokenResponse<User>>("/weblogin", {
		username,
		password,
		deviceid,
		devicemodel,
	});
	return data;
};
// ===== CreateSession request =====
export const createSessionRequest = async (
	userId: number,
	token: string,
	ip: string,
	browser: string,
): Promise<CreatedSeasonResponse<SessionData | null>> => {
	const { data } = await api.post<CreatedSeasonResponse<SessionData | null>>(
		"/CreateSession",
		{
			UserId: userId,
			Token: token,
			Ip: ip,
			Browser: browser,
		},
	);
	return data;
};
// ===== CheckSession request =====
export const checkSessionRequest = async (
	userId: number,
	token: string,
): Promise<CheckTokenResponse<StatusItem[]>> => {
	const { data } = await api.post<CheckTokenResponse<StatusItem[]>>(
		"/CheckSession",
		{
			UserId: userId,
			Token: token,
		},
	);
	return data;
};
// ===== Register request =====
export const registerSysUserRequest = async (
	email: string,
	firstname: string,
	lastname: string,
	phone: number,
	password: string,
): Promise<RegisterSysUserResponse> => {
	const { data } = await api.post<RegisterSysUserResponse>(
		"/register_sysuser",
		{
			email: email,
			firstname: firstname,
			lastname: lastname,
			phone: phone,
			password: password,
		},
	);

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
// ===== Exam choosedanswer delete   =====
export const deleteExamAnswer = async (
	userId: number,
	examId: number,
	questionId: number,
	answerId: number,
): Promise<ExamChoosedAnswerDeleteResponse> => {
	// POST method ашиглах
	const { data } = await api.post<ExamChoosedAnswerDeleteResponse>(
		"/examdeletedanswer",
		{
			user_id: userId,
			exam_id: examId,
			question_id: questionId,
			answer_id: answerId,
		},
	);
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

	return response;
};
// ===== Get Exam Results =====
export const getExamResults = async (
	testId: number,
): Promise<ExamResultsResponse> => {
	const { data } = await api.post<ExamResultsResponse>("/getexamresults", {
		test_id: testId,
	});
	return data;
};
// ===== Get Exam Result More =====
export const getExamResultMore = async (
	testId: number,
	examId: number,
	userId: number,
): Promise<ExamResponseMoreApiResponse> => {
	const { data } = await api.post<ExamResponseMoreApiResponse>("/resexammore", {
		test_id: testId,
		exam_id: examId,
		user_id: userId,
	});
	return data;
};

// ===== Get Exam Dun  =====
export const getExamDun = async (dun: number): Promise<ExamDunApiResponse> => {
	// Type өөрчлөх
	const { data } = await api.post<ExamDunApiResponse>(
		// Энд ч өөрчлөх
		"/examevaluation",
		{
			dun: dun,
		},
	);
	return data;
};
// ===== Get Exam Rank =====
export const getExamRank = async (
	examId: number,
	userId: number,
): Promise<LeaderboardResponse> => {
	const { data } = await api.post<LeaderboardResponse>("/getexamranks", {
		exam_id: examId,
		user_id: userId,
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
//-------------------------------Test---------------------------------//

// ===== Get testGroup =====
export const getTestGroup = async (
	userId: number,
): Promise<GetTestGroupResponse> => {
	const { data } = await api.post<GetTestGroupResponse>("/gettestgroup", {
		user_id: userId,
	});
	return data;
};
// ===== Get testSaved =====
export const getTestSaved = async (
	test_cnt: number,
	rlesson_id: number,
	userId: number,
): Promise<ApiResponseWithNullData> => {
	const { data } = await api.post<ApiResponseWithNullData>("/testsaved", {
		user_id: userId,
		test_cnt,
		rlesson_id,
	});
	return data;
};
// ===== Get testGetFill =====
export const gettTestFill = async (
	userId: number,
): Promise<ExamFinishResponse> => {
	const { data } = await api.post<ExamFinishResponse>("/gettestfill", {
		user_id: userId,
	});
	return data;
};
// ===== Get TestSavedMixed =====
export const getTestMixed = async (
	userId: number,
	tests: TestSavedMixedItem[],
): Promise<TestSavedMixedResponse> => {
	const { data } = await api.post<TestSavedMixedResponse>("/testsavedmixed", {
		user_id: userId,
		tests,
	});
	return data;
};
// ===== Get TestFilter =====
export const getTestFilter = async (
	userId: number,
): Promise<TestFilterResponse> => {
	const { data } = await api.post<TestFilterResponse>("/getlessons", {
		user_id: userId,
		optype: 0,
	});
	return data;
};

// ===== Get TestFiltered =====
export const getTestFiltered = async (
	userId: number,
	lesson_id: number,
): Promise<GetTestGroupResponse> => {
	// GetTestGroupResponse байх ёстой
	const { data } = await api.post<GetTestGroupResponse>(
		"/gettestgroupbylesson",
		{
			user_id: userId,
			lesson_id: lesson_id,
		},
	);
	return data;
};

//-------------------------------Course---------------------------------//
export const getCourseList = async (
	userId: number,
): Promise<CourseListResponse> => {
	const { data } = await api.post<CourseListResponse>("/getcourse", {
		user_id: userId,
	});
	return data;
};

// ===== Get ContentView =====
export const getContentView = async (
	content_id: number,
	user_id: number,
): Promise<ContentViewResponse> => {
	const { data } = await api.post<ContentViewResponse>("/getcontentview", {
		content_id,
		possible_index: 1,
		user_id,
	});
	return data;
};
