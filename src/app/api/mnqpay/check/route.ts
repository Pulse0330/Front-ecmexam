import { type NextRequest, NextResponse } from "next/server";

const DB_CONN = {
	user: "edusr",
	password: "sql$erver43",
	database: "ikh_skuul",
	server: "172.16.1.79",

	options: { encrypt: false, trustServerCertificate: false },
};

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userid, invoice_id } = body;

		if (!userid || !invoice_id) {
			return NextResponse.json(
				{
					RetResponse: {
						ResponseMessage: "userid болон invoice_id шаардлагатай",
						StatusCode: "400",
						ResponseCode: "99",
						ResponseType: false,
					},
					RetData: null,
				},
				{ status: 400 },
			);
		}

		const payload = {
			userid: String(userid),
			invoice_id: String(invoice_id),
			conn: DB_CONN,
		};

		const res = await fetch("https://ottapp.ecm.mn/api/get_qpaycheckweb", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		const text = await res.text();

		let data: unknown;
		try {
			data = JSON.parse(text);
		} catch {
			return NextResponse.json(
				{
					RetResponse: {
						ResponseMessage: "Backend буруу хариу буцаалаа",
						StatusCode: "502",
						ResponseCode: "99",
						ResponseType: false,
					},
					RetData: text,
				},
				{ status: 502 },
			);
		}

		return NextResponse.json(data, { status: res.ok ? 200 : res.status });
	} catch (error) {
		return NextResponse.json(
			{
				RetResponse: {
					ResponseMessage:
						error instanceof Error ? error.message : "Server error",
					StatusCode: "500",
					ResponseCode: "99",
					ResponseType: false,
				},
				RetData: null,
			},
			{ status: 500 },
		);
	}
}
