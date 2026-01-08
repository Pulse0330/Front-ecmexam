// ============================================
// types/school.types.ts
// ============================================

// Сургууль
export interface School {
	sName: string;
	conn: string;
	dbname: string;
	sort: number;
	district_id: number;
	serverip: string;
}

// API Response
export interface SchoolResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: School[];
}

// Select option
export interface SchoolOption {
	value: string;
	label: string;
}

// Component props
export interface SchoolSelectProps {
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	error?: string;
	districtId?: number;
}
