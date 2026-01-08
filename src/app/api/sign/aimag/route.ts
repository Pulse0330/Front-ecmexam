import { type NextRequest, NextResponse } from "next/server";

// Response type
interface AimagResponse {
	RetResponse?: {
		ResponseType: boolean;
		ResponseMessage?: string;
	};
	data?: unknown;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const requestBody = {
			...body,
			conn: {
				user: process.env.DB_CONFIG_USER || "edusr",
				password: process.env.DB_CONFIG_PASSWORD || "sql$erver43",
				database: process.env.DB_CONFIG_NAME || "EDU_CONFIG",
				server: process.env.DB_CONFIG_SERVER || "172.16.1.151",
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

		const response = await fetch("https://ottapp.ecm.mn/api/aimag", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		});

		const data = (await response.json()) as AimagResponse;
		return NextResponse.json(data);
	} catch (error) {
		console.error("Aimag API Error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch aimag list",
				RetResponse: {
					ResponseType: false,
					ResponseMessage: "Аймгийн жагсаалт татахад алдаа гарлаа",
				},
			},
			{ status: 500 },
		);
	}
}
