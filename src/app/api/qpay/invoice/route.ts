import axios, { AxiosError } from "axios";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const payload = await request.json();

		console.log("API Route - QPay Request:", payload);

		const data = JSON.stringify({
			amount: payload.amount,
			userid: payload.userid,
			device_token: payload.device_token || "",
			orderid: "8",
			bilid: payload.bilid,
			classroom_id: payload.classroom_id || "0",
			urls: payload.urls,
			conn: {
				user: "edusr",
				password: "sql$erver43",
				database: "ikh_skuul",
				server: "172.16.1.79",
				pool: {
					max: 100000,
					min: 0,
					idleTimeoutMillis: 30000000,
				},
				options: {
					encrypt: false,
					trustServerCertificate: false,
				},
			},
		});

		const config = {
			method: "post",
			maxBodyLength: Infinity,
			url: "https://ottapp.ecm.mn/api/api_get_qpayinvoice",
			headers: {
				"Content-Type": "application/json",
			},
			data: data,
		};

		const response = await axios.request(config);

		console.log("API Route - QPay Response received");

		return NextResponse.json(response.data);
	} catch (error) {
		console.error("API Route - QPay Error:", error);

		if (error instanceof AxiosError) {
			return NextResponse.json(
				{
					error: error.message,
					details: error.response?.data,
				},
				{ status: error.response?.status || 500 },
			);
		}

		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "An unknown error occurred",
			},
			{ status: 500 },
		);
	}
}
