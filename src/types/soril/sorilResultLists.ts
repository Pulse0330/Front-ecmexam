export interface SorilresultListItem {
	exam_id: number;
	test_id: number;
	title: string;
	test_date: string;
	test_time: string;
	exam_type: number;
	test_dun: number;
	test_perc: number;
	isfinished: number;
	Ognoo: string;
	exam_minute: number;
}

export interface SorilresultListResponseType {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: SorilresultListItem[];
}

export interface SorilresultListCardProps {
	exam: SorilresultListItem;
}
