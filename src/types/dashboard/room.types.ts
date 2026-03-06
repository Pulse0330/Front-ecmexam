export interface CreateEditRoomResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: number;
		ResponseCode: number;
		ResponseType: boolean;
	};
}

export interface Room {
	id: number;
	name: string;
	branchname: string;
	room_number: string;
	description: string;
	schooldb: string | null;
	userid: number;
	flag: number;
	regdate: string; // ISO date string
	roomsize: number;
	pccnt: number | null;
	esisroomid: number;
	num_of_pc: number;
	school_esis_id: string;
}

export interface getRoomsResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: Room[];
}

export interface Table {
	id: number;
	xPos: number;
	yPos: number;
	name: string;
	seat_number: string;
}

export interface GridPos {
	x: number;
	y: number;
}

export type LayoutType = "rows_3" | "rows_2" | "u_shape";

export interface Computers {
	seatid: number;
	seat_number: string;
	roomid: number;
	rownum: number;
	colnum: number; // ISO date string
}

export interface getRoomComputersResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: Computers[] | null;
}
