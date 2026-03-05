import axios, { type AxiosProgressEvent } from "axios";

const UPLOAD_URL = "https://uploads.ecm.mn/upload/single";

export interface UploadFileResult {
	fileStatus: number;
	message: string;
	file: {
		name: string;
		savedName: string;
		url: string;
	};
}

export interface UploadResponse {
	result: UploadFileResult | object;
	success: boolean;
	errMessage: string;
}

// Зураг upload
export async function uploadImage(
	formData: FormData,
): Promise<UploadFileResult> {
	try {
		const res = await axios.post<UploadFileResult>(UPLOAD_URL, formData, {
			headers: { "Content-Type": "multipart/form-data" },
			timeout: Infinity,
		});
		return res.data;
	} catch (error) {
		console.error("Зураг upload алдаа:", error);
		throw error;
	}
}

// Видео upload
export async function uploadVideo(formData: FormData): Promise<UploadResponse> {
	try {
		const res = await axios.post<UploadFileResult>(UPLOAD_URL, formData, {
			headers: { "Content-Type": "multipart/form-data" },
			timeout: Infinity,
		});

		if (res.data.fileStatus === 0) {
			return { result: res.data, success: true, errMessage: "" };
		}
		return { result: {}, success: false, errMessage: res.data.message };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return { result: {}, success: false, errMessage: message };
	}
}

// Progress-тэй upload
export async function uploadWithProgress(
	formData: FormData,
	onProgress?: (percent: number) => void,
): Promise<UploadFileResult> {
	const res = await axios.post<UploadFileResult>(UPLOAD_URL, formData, {
		headers: { "Content-Type": "multipart/form-data" },
		timeout: Infinity,
		onUploadProgress: (e: AxiosProgressEvent) => {
			if (e.total && onProgress) {
				const percent = Math.round((e.loaded * 100) / e.total);
				onProgress(percent);
			}
		},
	});
	return res.data;
}

// Файл upload (folder заавал)
export async function uploadFile(
	file: File,
	folder: string,
	onProgress?: (percent: number) => void,
): Promise<UploadFileResult> {
	const formData = new FormData();
	formData.append("folder", folder);
	formData.append("file", file);

	return uploadWithProgress(formData, onProgress);
}

// Зураг устгах (ecm.mn API-д DELETE endpoint байвал ашиглана)
export async function deleteImage(id: string): Promise<boolean> {
	try {
		const res = await axios.delete(`${UPLOAD_URL}/${id}`);
		return res.data?.fileStatus === 0;
	} catch (error) {
		console.error("Зураг устгах алдаа:", error);
		return false;
	}
}
