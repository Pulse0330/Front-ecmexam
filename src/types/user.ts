export interface UserProfileResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: UserProfileItem[];
}

export interface UserProfileItem {
	id: number;
	login_name: string;
	lastname: string;
	firstname: string;
	email: string;
	user_code: string;
	fname: string;
	password: string;
	created: string;
	updated_on: string;
	created_id: number;
	updated_by_id: number;
	is_enabled: number;
	activation: string;
	Phone: string;
	ugroup: number;
	img_url: string;
	username: string;
	school_id: number;
	sch_name: string;
	studentgroupname: string;
}
