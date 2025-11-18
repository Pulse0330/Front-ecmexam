// src/lib/axios.ts
import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 1000000,
});

// Request interceptor
api.interceptors.request.use(
	(config) => {
		// const token = useAuthStore.getState().token; // token-ийг request хийх үед авна
		// Token байгаа тохиолдолд л Authorization нэмнэ
		// if (token && config.headers) {
		//   config.headers.Authorization = `Bearer ${token}`;
		// }

		// Login эсвэл бусад request-д conn object нэмэх
		if (config.data && typeof config.data === "object") {
			config.data = {
				...config.data,
				conn: {
					user: "edusr",
					password: "sql$erver43",
					database: "ikh_skuul",
					server: "172.16.1.79",
					pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
					options: { encrypt: false, trustServerCertificate: false },
				},
			};
		}

		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
	(response) => {
		const data = response.data;

		// RetResponse шалгах
		if (data.RetResponse) {
			const { ResponseCode, ResponseMessage, StatusCode } = data.RetResponse;

			// ResponseCode шалгах
			if (ResponseCode === "10") {
				// Success - Бүгд зөв
				return response;
			}

			if (ResponseCode === "11") {
				// No data - Өгөгдөл байхгүй (Алдаа биш, зүгээр data хоосон)
				// Toast харуулахгүй, зүгээр response буцаана
				console.info("No data available:", ResponseMessage);
				return response;
			}

			// Бусад ResponseCode (12, 13, гэх мэт) - Алдаа
			toast.error(ResponseMessage || "Алдаа гарлаа", {
				description: `Status code: ${StatusCode}`,
			});
			return Promise.reject(new Error(ResponseMessage || "Алдаа гарлаа"));
		}

		// RetResponse байхгүй бол response-ийг буцаана
		return response;
	},
	(error) => {
		// Network error эсвэл бусад алдаа
		if (error.response) {
			// Server responded with error status
			toast.error("Серверийн алдаа", {
				description: `Status: ${error.response.status}`,
			});
		} else if (error.request) {
			// Request sent but no response
			toast.error("Сүлжээний алдаа", {
				description: "Серверт хүрч чадсангүй",
			});
		} else {
			// Something else happened
			toast.error("Алдаа гарлаа", {
				description: error.message,
			});
		}

		return Promise.reject(error);
	},
);

export default api;
