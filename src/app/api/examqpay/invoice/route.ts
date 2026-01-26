import { type NextRequest, NextResponse } from "next/server";

// Type definitions for QPay invoice
interface QPayInvoiceRequest {
	amount: string;
	userid: string;
	device_token?: string;
	orderid: string;
	bilid: string;
	classroom_id?: string;
	conn: {
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
	};
}

interface QPayURL {
	name: string;
	description: string;
	logo: string;
	link: string;
}

interface QPayInvoiceResponse {
	invoice_id: string;
	qr_text: string;
	qr_image: string;
	qPay_shortUrl: string;
	urls: QPayURL[];
}

export async function POST(request: NextRequest) {
	try {
		const body: QPayInvoiceRequest = await request.json();

		// Validate required fields
		if (!body.amount || !body.userid || !body.orderid || !body.bilid) {
			return NextResponse.json(
				{ error: "Missing required fields: amount, userid, orderid, bilid" },
				{ status: 400 },
			);
		}

		// Call the external QPay API
		const response = await fetch(
			"https://ottapp.ecm.mn/api/get_qpayinvoiceweb",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					amount: body.amount,
					userid: body.userid,
					device_token: body.device_token || "",
					orderid: body.orderid,
					bilid: body.bilid,
					classroom_id: body.classroom_id || "0",
					conn: body.conn || {
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
				}),
			},
		);

		if (!response.ok) {
			throw new Error(
				`QPay API error: ${response.status} ${response.statusText}`,
			);
		}

		const data: QPayInvoiceResponse = await response.json();

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error("Error creating QPay invoice:", error);
		return NextResponse.json(
			{
				error: "Failed to create QPay invoice",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// Optional: GET method to check invoice status
export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const invoiceId = searchParams.get("invoice_id");

	if (!invoiceId) {
		return NextResponse.json(
			{ error: "Missing invoice_id parameter" },
			{ status: 400 },
		);
	}

	try {
		// Implement invoice status check logic here
		// This is a placeholder - adjust based on actual API
		return NextResponse.json({
			invoice_id: invoiceId,
			status: "pending", // or 'paid', 'expired', etc.
		});
	} catch (error) {
		console.error("Error checking invoice status:", error);
		return NextResponse.json(
			{ error: "Failed to check invoice status" },
			{ status: 500 },
		);
	}
}
