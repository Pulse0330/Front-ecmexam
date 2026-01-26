// app/api/forgetpass/route.ts
import { type NextRequest, NextResponse } from "next/server";

const DB_CONN = {
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
};

export async function POST(request: NextRequest) {
	try {
		console.log("📥 API Route: Request received");

		const body = await request.json();
		const { phone, password } = body;

		if (!phone || !password) {
			return NextResponse.json(
				{
					RetResponse: {
						ResponseType: false,
						ResponseMessage: "Утасны дугаар болон нууц үг шаардлагатай",
						StatusCode: "400",
					},
				},
				{ status: 400 },
			);
		}

		const payload = {
			phone: String(phone), // STRING болгох
			password,
			conn: DB_CONN,
		};

		console.log("🌐 Calling external API...");

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30000);

		try {
			const externalResponse = await fetch(
				"https://ottapp.ecm.mn/api/forgetpass",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
					body: JSON.stringify(payload),
					signal: controller.signal,
				},
			);

			clearTimeout(timeoutId);

			console.log("📊 External API Status:", externalResponse.status);

			const contentType = externalResponse.headers.get("content-type");
			console.log("📊 Content-Type:", contentType);

			// Check if response is JSON
			if (contentType?.includes("application/json")) {
				const data = await externalResponse.json();
				console.log("✅ JSON Response:", data);
				return NextResponse.json(data);
			} else {
				// HTML эсвэл бусад format ирвэл
				const text = await externalResponse.text();
				console.error("❌ Non-JSON response (HTML):", text.substring(0, 500));

				return NextResponse.json(
					{
						RetResponse: {
							ResponseType: false,
							ResponseMessage: "Серверээс буруу хариу ирлээ (HTML response)",
							StatusCode: "500",
						},
					},
					{ status: 500 },
				);
			}
		} catch (fetchError) {
			clearTimeout(timeoutId);

			const errorMessage =
				fetchError instanceof Error ? fetchError.message : "Unknown error";
			console.error("❌ Fetch error:", errorMessage);

			if (fetchError instanceof Error && fetchError.name === "AbortError") {
				throw new Error("External API timeout (30s)");
			}

			throw fetchError;
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		console.error("❌ Route error:", errorMessage);

		return NextResponse.json(
			{
				RetResponse: {
					ResponseType: false,
					ResponseMessage: `Серверт алдаа гарлаа: ${errorMessage}`,
					StatusCode: "500",
				},
			},
			{ status: 500 },
		);
	}
}
