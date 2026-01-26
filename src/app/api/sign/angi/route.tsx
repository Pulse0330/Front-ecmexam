import { type NextRequest, NextResponse } from "next/server";

interface ClassResponse {
	RetResponse?: {
		ResponseType: boolean;
		ResponseMessage?: string;
		StatusCode?: string;
		ResponseCode?: string;
	};
	RetData?: Array<{
		id: number;
		class_name: string;
		studentgroupid: string;
		sort: number;
	}>;
}

interface ConnectionConfig {
	user: string;
	password: string;
	database: string;
	server: string;
	pool: {
		max: number;
		min: number;
		idleTimeoutMillis: number;
	};
	options: {
		encrypt: boolean;
		trustServerCertificate: boolean;
	};
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log("=== CLASS API: Received body ===", body);

		const { database, serverip } = body;

		if (!database || !serverip) {
			return NextResponse.json(
				{
					RetResponse: {
						ResponseType: false,
						ResponseMessage: "Database болон serverip шаардлагатай",
						StatusCode: "400",
						ResponseCode: "00",
					},
					RetData: [],
				},
				{ status: 400 },
			);
		}

		// Build connection config using selected school's info
		const conn: ConnectionConfig = {
			user: "edusr",
			password: "sql$erver43",
			database: database,
			server: serverip,
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

		console.log("=== CLASS API: Connection config ===", {
			database: conn.database,
			server: conn.server,
		});

		// Prepare payload for backend
		const payload = {
			conn,
		};

		console.log("=== CLASS API: Sending to backend ===", payload);

		const classResponse = await fetch("https://ottapp.ecm.mn/api/class", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		console.log("=== CLASS API: Backend status ===", classResponse.status);

		if (!classResponse.ok) {
			const errorText = await classResponse.text();
			console.error("=== CLASS API: Backend error ===", errorText);
			throw new Error(`Backend API error: ${classResponse.status}`);
		}

		const classData = (await classResponse.json()) as ClassResponse;
		console.log("=== CLASS API: Success ===", classData);

		return NextResponse.json(classData);
	} catch (error) {
		console.error("=== CLASS API: Error ===", error);
		return NextResponse.json(
			{
				RetResponse: {
					ResponseType: false,
					ResponseMessage: "Ангийн жагсаалт татахад алдаа гарлаа",
					StatusCode: "500",
					ResponseCode: "00",
				},
				RetData: [],
			},
			{ status: 500 },
		);
	}
}
