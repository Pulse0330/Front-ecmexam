// src/lib/axios.ts
import axios from "axios";
import { toast } from "sonner";

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

		// ResponseCode шалгах
		if (data.RetResponse && data.RetResponse.StatusCode !== "200") {
			// CheckSession endpoint-д алдаа шидэхгүй, response буцаа
			if (response.config.url?.includes("/CheckSession")) {
				console.warn(
					"⚠️ CheckSession: ResponseCode !== 10, гэхдээ response буцаана",
				);
				return response;
			}

			// Бусад endpoint-д алдаа шидэх
			toast.error(data.RetResponse.ResponseMessage || "Алдаа гарлаа", {
				description: `Status code: ${data.RetResponse.StatusCode}`,
			});
			return Promise.reject(new Error(data.RetResponse.ResponseMessage));
		}

		return response;
	},
	(error) => {
		// Network error эсвэл бусад алдаа
		if (!error.response) {
			toast.error("Сүлжээний алдаа", {
				description: "Серверт хандах боломжгүй байна",
			});
		}
		return Promise.reject(error);
	},
);

export default api;
