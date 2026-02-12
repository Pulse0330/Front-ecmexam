// src/lib/axios.ts
import axios from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
	(config) => {
		// Database connection мэдээлэл нэмэх
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

api.interceptors.response.use(
	(response) => {
		const data = response.data;

		if (data.RetResponse && data.RetResponse.StatusCode !== "200") {
			if (response.config.url?.includes("/CheckSession")) {
				return response;
			}

			console.error("❌ API Error:", {
				url: response.config.url,
				statusCode: data.RetResponse.StatusCode,
				message: data.RetResponse.ResponseMessage,
				timestamp: new Date().toISOString(),
			});

			return Promise.reject(new Error(data.RetResponse.ResponseMessage));
		}

		return response;
	},
	(error) => {
		// Интернэт холболтын алдаа шалгах
		const isNetworkError =
			!navigator.onLine ||
			error.code === "ERR_NETWORK" ||
			error.code === "ECONNABORTED" ||
			error.message === "Network Error" ||
			!error.response;

		if (isNetworkError) {
			console.error("🌐 Интернэт холболтын алдаа:", {
				url: error.config?.url,
				method: error.config?.method,
				code: error.code,
				message: error.message,
				timestamp: new Date().toISOString(),
			});

			// Хэрэглэгчид мэдэгдэл харуулах
			if (typeof window !== "undefined") {
				alert(
					"⚠️ Интернэт холболт тасарсан байна.\n\nИнтернэт холболтоо шалгана уу.",
				);

				// Эсвэл toast notification ашиглаж болно:
				// toast.error("Интернэт холболтоо шалгана уу");
			}

			return Promise.reject(new Error("Интернэт холболт тасарсан байна"));
		}

		// Бусад алдаа
		console.error("❌ Network/Request Error:", {
			url: error.config?.url,
			method: error.config?.method,
			code: error.code,
			message: error.message,
			timestamp: new Date().toISOString(),
		});

		return Promise.reject(error);
	},
);

export default api;
