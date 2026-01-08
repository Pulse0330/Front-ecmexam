import { type NextRequest, NextResponse } from "next/server";

// Response type
interface RegisterResponse {
	RetResponse: {
		ResponseType: boolean;
		ResponseMessage?: string;
	};
}

export async function POST(request: NextRequest) {
	try {
		console.log("=== PROXY: Starting registration ===");

		const body = await request.json();
		console.log("PROXY: Received data:", body);

		// Validation
		if (
			!body.email ||
			!body.firstname ||
			!body.lastname ||
			!body.phone ||
			!body.password
		) {
			console.log("PROXY: Validation failed");
			return NextResponse.json({
				RetResponse: {
					ResponseType: false,
					ResponseMessage: "Бүх талбарыг бөглөнө үү",
				},
			});
		}

		console.log("PROXY: Sending to backend...");

		// Request body-д conn нэмнэ
		const requestBody = {
			email: body.email,
			firstname: body.firstname,
			lastname: body.lastname,
			phone: body.phone,
			password: body.password,
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

		// Backend руу хүсэлт илгээнэ (server-side, CORS-гүй)
		const backendResponse = await fetch(
			"https://ottapp.ecm.mn/api/register_sysuser",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			},
		);

		console.log("PROXY: Backend status:", backendResponse.status);

		const responseText = await backendResponse.text();
		console.log("PROXY: Backend raw response:", responseText.substring(0, 500));

		// JSON parse хийх
		let data: RegisterResponse;
		try {
			data = JSON.parse(responseText) as RegisterResponse;
			console.log("PROXY: Parsed successfully:", data);
		} catch (_parseError) {
			console.error("PROXY: JSON parse failed");
			console.error("PROXY: Full response text:", responseText);

			return NextResponse.json(
				{
					RetResponse: {
						ResponseType: false,
						ResponseMessage: "Серверээс буруу хариу ирлээ",
					},
				},
				{ status: 500 },
			);
		}

		console.log("=== PROXY: Success, returning data ===");
		return NextResponse.json(data);
	} catch (error) {
		console.error("=== PROXY: Fatal error ===");
		console.error("PROXY: Error details:", error);

		return NextResponse.json(
			{
				RetResponse: {
					ResponseType: false,
					ResponseMessage: `Серверийн алдаа: ${error instanceof Error ? error.message : "Тодорхойгүй"}`,
				},
			},
			{ status: 500 },
		);
	}
}
