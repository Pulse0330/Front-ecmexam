// src/lib/axios.ts
import axios from "axios";

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
export default api1;
