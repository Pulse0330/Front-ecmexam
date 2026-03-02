import api1 from "@/lib/axios1";
import type {
	batchRegisterExamResponseType,
	getExamResponseType,
	getExamSaveResponseType,
	getExamTimeResponseType,
	getStudentsResponseType,
} from "@/types/dashboard/exam.types";
import type {
	CreateEditRoomResponseType,
	getRoomComputersResponseType,
	getRoomsResponseType,
	Table,
} from "@/types/dashboard/room.types";

export const roomCreateEdit = async ({
	procname,
	id,
	name,
	branchname,
	room_number,
	descr,
	userid,
	optype,
}: {
	procname: string;
	id: number;
	name: string;
	branchname: string;
	room_number: string;
	descr: string;
	userid: number;
	optype: number;
}): Promise<CreateEditRoomResponseType> => {
	const { data } = await api1.post<CreateEditRoomResponseType>("/crud", {
		procname,
		id,
		name,
		branchname,
		room_number,
		descr,
		userid,
		optype,
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
		user_id: userId,
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
	ResponseMessage: string;
	StatusCode: string;
	ResponseCode: string;
	ResponseType: boolean;
}> => {
	// Таны Table[] бүтцийг серверийн хүлээж авах subjson бүтэц рүү хөрвүүлнэ
	const subjson = payload.tables.map((table) => ({
		rownum: table.yPos, // yPos-ийг мөр (row) гэж үзвэл
		colnum: table.xPos, // xPos-ийг багана (column) гэж үзвэл
	}));

	const { data } = await api1.post("/crud", {
		procname: "api_exam_room_pc_insert",
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
		user_id: userId,
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
