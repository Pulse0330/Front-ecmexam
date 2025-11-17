export interface TestGroupItem {
	id: number; // Давтагдашгүй ID
	name: string; // Бүлгийн нэр
	cnt: number; // Тестийн тоо
	ulessonid: number; // Дэд хичээлийн ID
	ulesson_name: string; // Дэд хичээлийн нэр
	courseid: number; // Курсийн ID
	coursename: string; // Курсийн нэр
	tpercent: number; // Гүйцэтгэлийн хувь
	bulegcnt: number; // Бүлгийн тоо
}

export interface GetTestGroupResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: TestGroupItem[];
}
