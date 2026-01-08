// types/district.types.ts

export interface District {
	id: number; // 19, 20, 35...
	name: string; // "Багануур", "Багахангай"...
	sort: number; // 0, 1, 1...
}

export interface DistrictResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: District[];
}
