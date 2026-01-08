import { type NextRequest, NextResponse } from "next/server";

interface SchoolResponse {
	RetResponse?: {
		ResponseType: boolean;
		ResponseMessage?: string;
	};
	RetData?: unknown;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log("=== SCHOOL API: Received body ===", body);

		const requestBody = {
			aimag_id: body.aimag_id,
			district_id: body.district_id,
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

		console.log("=== SCHOOL API: Sending to backend ===", {
			aimag_id: requestBody.aimag_id,
			district_id: requestBody.district_id,
		});

		const response = await fetch("https://ottapp.ecm.mn/api/school", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		});

		console.log("=== SCHOOL API: Backend response status ===", response.status);

		const data = (await response.json()) as SchoolResponse;
		console.log("=== SCHOOL API: Backend response data ===", data);

		return NextResponse.json(data);
	} catch (error) {
		console.error("=== SCHOOL API: Error ===", error);
		return NextResponse.json(
			{
				error: "Failed to fetch school list",
				RetResponse: {
					ResponseType: false,
					ResponseMessage: "Сургуулийн жагсаалт татахад алдаа гарлаа",
				},
			},
			{ status: 500 },
		);
	}
}
