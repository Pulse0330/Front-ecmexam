import { type NextRequest, NextResponse } from "next/server";

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Server-side config (клиентэд хэзээ ч бүү илгээ) ──────────────────────────
const DB_CONN = {
	user: "edusr",
	password: "sql$erver43",
	database: "ikh_skuul",
	server: "172.16.1.79",
	pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
	options: { encrypt: false, trustServerCertificate: false },
};

const BACKEND_URL = "https://ottapp.ecm.mn/api/api_get_qpayinvoice";

// ── POST — Invoice үүсгэх ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		if (!body.amount || !body.userid || !body.orderid || !body.bilid) {
			return NextResponse.json(
				{ error: "amount, userid, orderid, bilid шаардлагатай" },
				{ status: 400 },
			);
		}

		const payload = {
			amount: String(body.amount),
			userid: String(body.userid),
			device_token: body.device_token ?? "",
			orderid: String(body.orderid),
			bilid: String(body.bilid),
			classroom_id: body.classroom_id ?? "0",
			urls: [],
			conn: DB_CONN,
		};

		const res = await fetch(BACKEND_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		const text = await res.text();

		let data: QPayInvoiceResponse;
		try {
			data = JSON.parse(text);
		} catch {
			return NextResponse.json(
				{ error: "Backend буруу хариу буцаалаа", details: text },
				{ status: 502 },
			);
		}

		if (!res.ok) {
			return NextResponse.json(
				{ error: "QPay API алдаа", details: data },
				{ status: res.status },
			);
		}

		if (!data?.qr_image) {
			return NextResponse.json(
				{ error: "QR image олдсонгүй", details: data },
				{ status: 502 },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Server error" },
			{ status: 500 },
		);
	}
}
