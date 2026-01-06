// ============================================
// src/app/api/otp/smscheck/route.ts
// ============================================
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const requestBody = {
			...body,
			conn: {
				user: process.env.DB_USER || "edusr",
				password: process.env.DB_PASSWORD || "sql$erver43",
				database: process.env.DB_NAME || "ikh_skuul",
				server: process.env.DB_SERVER || "172.16.1.79",
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
		};

		const response = await fetch("https://api-message.ecm.mn/smscheck", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		});

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("SMS Check API Error:", error);
		return NextResponse.json(
			{
				error: "Failed to verify code",
				RetResponse: {
					ResponseType: false,
					ResponseMessage: "Баталгаажуулахад алдаа гарлаа",
				},
			},
			{ status: 500 },
		);
	}
}
