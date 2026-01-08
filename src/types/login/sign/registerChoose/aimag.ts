// ============================================
// types/province.types.ts
// ============================================

// Аймаг/Хот
export interface Province {
	mAcode: string;
	mName: string;
	mid: number;
	sort: number;
	miid: string;
	mid1: number;
}

// API Response
export interface ProvinceResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: Province[];
}

// Select option
export interface ProvinceOption {
	value: string;
	label: string;
}

// Component props
export interface ProvinceSelectProps {
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	error?: string;
}
