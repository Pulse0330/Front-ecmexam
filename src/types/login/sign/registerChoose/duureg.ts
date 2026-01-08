// ============================================
// types/district.types.ts
// ============================================

// Дүүрэг/Сум
export interface District {
	id: number;
	name: string;
	sort: number;
}

// API Response
export interface DistrictResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: District[];
}

// Select option
export interface DistrictOption {
	value: string;
	label: string;
}

// Component props
export interface DistrictSelectProps {
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	error?: string;
	provinceId?: string;
}
