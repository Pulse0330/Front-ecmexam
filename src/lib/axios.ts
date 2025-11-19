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
		if (data.RetResponse && data.RetResponse.ResponseCode !== "10") {
			toast.error(data.RetResponse.ResponseMessage || "Алдаа гарлаа", {
				description: `Status code: ${data.RetResponse.StatusCode}`,
			});
			return Promise.reject(new Error(data.RetResponse.ResponseMessage));
		}
		return response;
	},
	(error) => Promise.reject(error),
);

export default api;
// // src/lib/axios.ts
// import axios from "axios";

// export const api = axios.create({
// baseURL: "https://ottapp.ecm.mn/api",
// headers: { "Content-Type": "application/json" },
// });

// // Connection config
// export const conn = {
//   user: "edusr",
//   password: "sql$erver43",
//   database: "ikh_skuul",
//   server: "172.16.1.79",
//   pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
//   options: { encrypt: false, trustServerCertificate: false },
// };
// export default api;
