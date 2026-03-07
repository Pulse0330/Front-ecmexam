import api1 from "@/lib/axios1";
import type {
	batchRegisterExamResponseType,
	getExamInfoResponseType,
	getExamMateralResponseType,
	getExamMateralVariantDownloadResponseType,
	getExamPrintResponseType,
	getExamResponseType,
	getExamSaveResponseType,
	getExamTimedResponseType,
	getExamTimeResponseType,
	getExamVariantResponseType,
	getStudentsResponseType,
} from "@/types/dashboard/exam.types";
import type {
	CreateEditRoomResponseType,
	getRoomComputersResponseType,
	getRoomsResponseType,
	Table,
} from "@/types/dashboard/room.types";

export const roomCreateEdit = async ({
	id,
	name,
	branchname,
	room_number,
	descr,
	userid,
	optype,
	num_of_pc,
	school_esis_id,
	esisroomid,
}: {
	id: number;
	name: string;
	branchname: string;
	room_number: string;
	descr: string;
	userid: number;
	optype: number;
	num_of_pc: number;
	school_esis_id: string;
	esisroomid: string;
}): Promise<CreateEditRoomResponseType> => {
	const { data } = await api1.post<CreateEditRoomResponseType>("/roomsend", {
		id,
		name,
		branchname,
		room_number,
		descr,
		userid,
		optype,
		num_of_pc,
		school_esis_id,
		esisroomid,
		conn: "skuul",
	});
	return data;
};
export const getRooms = async ({
	userId,
	procname,
}: {
	userId: number;
	procname: string;
}): Promise<getRoomsResponseType> => {
	const { data } = await api1.post<getRoomsResponseType>("/list", {
		userid: userId,
		procname,
		conn: "skuul",
	});
	return data;
};

export const saveRoomLayout = async (payload: {
	roomId: number;
	userId: number;
	tables: Table[];
	sizes: number;
}): Promise<{
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
}> => {
	// Таны Table[] бүтцийг серверийн хүлээж авах subjson бүтэц рүү хөрвүүлнэ
	const subjson = payload.tables.map((table) => ({
		rownum: table.yPos, // yPos-ийг мөр (row) гэж үзвэл
		colnum: table.xPos, // xPos-ийг багана (column) гэж үзвэл
		seat_number: table.seat_number,
	}));

	const { data } = await api1.post("/roompcinsert", {
		roomid: payload.roomId,
		userid: payload.userId,
		subjson: subjson,
		sizes: payload.sizes,
		conn: "skuul",
	});

	return data;
};

export const getComputerPositions = async ({
	userId,
	roomid,
}: {
	userId: number;
	roomid: number;
}): Promise<getRoomComputersResponseType> => {
	const { data } = await api1.post<getRoomComputersResponseType>("/list", {
		procname: "api_get_examination_pc",
		user_id: userId,
		roomid,
		conn: "skuul",
	});
	return data;
};

export const getRoomById = async ({
	userId,
	roomid,
}: {
	userId: number;
	roomid: number;
}): Promise<getRoomsResponseType> => {
	const { data } = await api1.post<getRoomsResponseType>("/list", {
		procname: "api_get_exam_room",
		userid: userId,
		roomid,
		conn: "skuul",
	});
	return data;
};

export const getExam = async ({
	userId,
}: {
	userId: number;
}): Promise<getExamResponseType> => {
	const { data } = await api1.post<getExamResponseType>("/getExamList", {
		user_id: userId,
		conn: "skuul",
	});
	return data;
};

export const getExamSave = async (): Promise<getExamSaveResponseType> => {
	const { data } = await api1.post<getExamSaveResponseType>("/getExamSave", {
		conn: "skuul",
	});
	return data;
};

export const getStudents = async ({
	userId,
}: {
	userId: number;
}): Promise<getStudentsResponseType> => {
	const { data } = await api1.post<getStudentsResponseType>("/list", {
		userid: userId,
		procname: "api_get_examinees",
		conn: "skuul",
	});
	return data;
};

export interface RegistrationItem {
	stu_id: number;
	examinee_number: string;
	exam_id: number;
	exam_date_id: number;
	exam_room_id: number;
}

export interface BatchRegistrationRequest {
	userId: number;
	registrations: RegistrationItem[];
}

export const batchRegisterExams = async ({
	userId,
	registrations,
}: BatchRegistrationRequest): Promise<batchRegisterExamResponseType> => {
	const { data } = await api1.post<batchRegisterExamResponseType>(
		"/examregistration",
		{
			procname: "api_exam_registration_batch",
			userid: userId,
			conn: "skuul",
			registrations, // Сурагчдын массив энд орно
		},
	);
	return data;
};

export const userRegisterExams = async ({
	userId,
	examinee_number,
	exam_id,
	exam_date_id,
	exam_room_id,
}: {
	userId: number;
	examinee_number: string;
	exam_id: number;
	exam_room_id: number;
	exam_date_id: number;
}): Promise<batchRegisterExamResponseType> => {
	const { data } = await api1.post<batchRegisterExamResponseType>(
		"/examregistrationsingle",
		{
			userid: userId,
			conn: "skuul",
			examinee_number,
			exam_id,
			exam_date_id,
			exam_room_id,
		},
	);
	return data;
};

export const getExamRegistrationList = async ({
	userId,
	examDateId,
}: {
	userId: number;
	examDateId: number;
}): Promise<getExamTimeResponseType> => {
	const { data } = await api1.post<getExamTimeResponseType>(
		"/examregistrationlist",
		{
			userid: userId,
			exam_date_id: examDateId,
			conn: "skuul",
		},
	);
	return data;
};

export const getSelectedStudents = async ({
	roomId,
	dateId,
}: {
	dateId: number;
	roomId: number;
}): Promise<getStudentsResponseType> => {
	const { data } = await api1.post<getStudentsResponseType>(
		"/examstudentlist",
		{
			exam_date_id: dateId,
			exam_room_id: roomId,
			conn: "skuul",
		},
	);
	return data;
};

export const getExamRegistrationSend = async ({
	userId,
	examDateId,
	examId,
	examRoomId,
}: {
	userId: number;
	examDateId: number;
	examId: number;
	examRoomId: number;
}): Promise<getExamTimeResponseType> => {
	const { data } = await api1.post<getExamTimeResponseType>(
		"/examregistrationsend",
		{
			userid: userId,
			exam_date_id: examDateId,
			exam_id: examId,
			exam_room_id: examRoomId,
			conn: "skuul",
		},
	);
	return data;
};

export const getExamInfo = async ({
	userId,
	examDateId,
}: {
	userId: number;
	examDateId: number;
}): Promise<getExamInfoResponseType> => {
	const { data } = await api1.post<getExamInfoResponseType>("/list", {
		procname: "api_exam_info_by_examdateid",
		userid: userId,
		exam_date_id: examDateId,
		conn: "skuul",
	});
	return data;
};
export const getExamMetaralList = async ({
	userId,
	examDateId,
	examId,
}: {
	userId: number;
	examDateId: number;
	examId: number;
}): Promise<getExamMateralResponseType> => {
	const { data } = await api1.post<getExamMateralResponseType>("/list", {
		procname: "api_examination_variants",
		exam_id: examId,
		exam_date_id: examDateId,
		userid: userId,
		conn: "skuul",
	});
	return data;
};

export const getExamMateralVariantDownload = async ({
	userId,
	examDateId,
	examId,
}: {
	userId: number;
	examDateId: number;
	examId: number;
}): Promise<getExamMateralVariantDownloadResponseType> => {
	const { data } = await api1.post<getExamMateralVariantDownloadResponseType>(
		"/syncvariantsbyexam",
		{
			userid: userId,
			exam_date_id: examDateId,
			exam_id: examId,
			conn: "skuul",
		},
	);
	return data;
};

export const getExamTime = async ({
	userId,
	examinee_number,
}: {
	userId: number;
	examinee_number: string;
}): Promise<getExamTimedResponseType> => {
	const { data } = await api1.post<getExamTimedResponseType>("/list", {
		procname: "api_exam_mhl_choose_list",
		examinee_number: examinee_number,
		userid: userId,
		conn: "skuul",
	});
	return data;
};

export const getExamPrintList = async ({
	userId,
	examDateId,
	examId,
	esisroomid,
}: {
	userId: number;
	examDateId: number;
	examId: number;
	esisroomid: number;
}): Promise<getExamPrintResponseType> => {
	const { data } = await api1.post<getExamPrintResponseType>("/list", {
		procname: "api_exam_esse_print",
		userid: userId,
		exam_date_id: examDateId,
		exam_id: examId,
		esisroomid: esisroomid,
		conn: "skuul",
	});
	return data;
};

export const getExamEsseUpload = async ({
	exam_register_id,
	question_id,
	file_url,
	file_type,
}: {
	exam_register_id: number;
	question_id: number;
	file_url: string;
	file_type: string;
}): Promise<getExamMateralVariantDownloadResponseType> => {
	const { data } = await api1.post<getExamMateralVariantDownloadResponseType>(
		"/examregistrationsfiles",
		{
			exam_register_id,
			question_id,
			file_url,
			file_type,
			conn: "skuul",
		},
	);
	return data;
};

export const getVariantDistribute = async ({
	examDateId,
	examId,
	examRoomId,
}: {
	examDateId: number;
	examId: number;
	examRoomId: number;
}): Promise<getExamVariantResponseType> => {
	const { data } = await api1.post<getExamVariantResponseType>(
		"/examvariantdistribute",
		{
			exam_date_id: examDateId,
			exam_id: examId,
			exam_room_id: examRoomId,
			conn: "skuul",
		},
	);
	return data;
};
