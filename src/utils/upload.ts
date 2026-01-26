import axios, { type AxiosProgressEvent } from "axios";

const UPLOAD_URL = "https://upload.nuudelms.mn/cloudflareR2Push";

// Зураг upload
export async function uploadImage(formData: FormData) {
	try {
		const res = await axios.post(UPLOAD_URL, formData, {
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
export async function uploadVideo(formData: FormData) {
	try {
		const res = await axios.post(UPLOAD_URL, formData, {
			headers: { "Content-Type": "multipart/form-data" },
			timeout: Infinity,
		});

		if (res.data.success) {
			return { result: res.data.result, success: true, errMessage: "" };
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
) {
	const res = await axios.post(UPLOAD_URL, formData, {
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

// Зураг устгах
export async function deleteImage(id: string) {
	try {
		const res = await axios.post(UPLOAD_URL, { imageId: id });
		return res.data.success || false;
	} catch (error) {
		console.error("Зураг устгах алдаа:", error);
		return false;
	}
}
