import { type NextRequest, NextResponse } from "next/server";

interface DistrictResponse {
	RetResponse?: {
		ResponseType: boolean;
		ResponseMessage?: string;
	};
	RetData?: unknown;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const requestBody = {
			aimag_id: body.aimag_id,
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

		const response = await fetch("https://ottapp.ecm.mn/api/district", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		});

		const data = (await response.json()) as DistrictResponse;
		return NextResponse.json(data);
	} catch (error) {
		console.error("District API Error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch district list",
				RetResponse: {
					ResponseType: false,
					ResponseMessage: "Дүүрэг/сумын жагсаалт татахад алдаа гарлаа",
				},
			},
			{ status: 500 },
		);
	}
}
