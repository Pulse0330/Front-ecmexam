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
					pool: {
						max: 20,
						min: 0,
						idleTimeoutMillis: 30000, // 30 секунд idle бол release
						acquireTimeoutMillis: 30000,
						evictionRunIntervalMillis: 10000, // 10 секунд тутамд шалгах
						softIdleTimeoutMillis: 20000, // 20 секунд idle бол evict
						createTimeoutMillis: 30000,
						destroyTimeoutMillis: 5000,
						reapIntervalMillis: 1000,
						createRetryIntervalMillis: 200,
					},
					options: {
						encrypt: false,
						trustServerCertificate: true,
						enableArithAbort: true,
						// ✅ Connection timeout
						connectionTimeout: 15000, // 15 секунд
						requestTimeout: 30000, // 30 секунд
						// ✅ Cancel timeout
						cancelTimeout: 5000,
					},
					connectionRetries: 3,
					connectionRetryDelay: 3000,
				},
			};
		}
		console.log();
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
		if (!error.response) {
			toast.warning("Таны интернэт холболт салсан байна.", {
				description: "Та системээс гараад дахин нэвтэрнэ үү ",
			});
		}
		return Promise.reject(error);
	},
);

export default api;

const api1 = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000,
});

api1.interceptors.request.use(
	(config) => {
		// Login эсвэл бусад request-д conn object нэмэх
		if (config.data && typeof config.data === "object") {
			config.data = {
				...config.data,
				conn: "skuul",
			};
		}
		console.log();
		return config;
	},

	(error) => Promise.reject(error),
);
