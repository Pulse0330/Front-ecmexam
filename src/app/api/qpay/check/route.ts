// app/api/qpay/check/route.ts
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userid, invoice_id } = body;

		if (!userid || !invoice_id) {
			return NextResponse.json(
				{
					RetResponse: {
						ResponseMessage: "User ID болон Invoice ID шаардлагатай",
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
			userid: userid.toString(),
			invoice_id: invoice_id,
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
		};

		console.log("=== QPay Check Request ===");
		console.log("User ID:", userid);
		console.log("Invoice ID:", invoice_id);
		console.log("===========================");

		const response = await fetch("https://ottapp.ecm.mn/api/get_qpaycheckweb", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		console.log("=== QPay Check Response ===");
		console.log("Response:", data);
		console.log("Payment Status:", data.RetResponse.ResponseType);
		console.log("============================");

		return NextResponse.json(data);
	} catch (error) {
		console.error("QPay Check Error:", error);

		return NextResponse.json(
			{
				RetResponse: {
					ResponseMessage:
						error instanceof Error
							? error.message
							: "Төлбөрийн статус шалгахад алдаа гарлаа",
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
