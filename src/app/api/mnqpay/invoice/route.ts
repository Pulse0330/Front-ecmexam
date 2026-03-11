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
const _DB_CONN = {
	user: "edusr",
	password: "sql$erver43",
	database: "ikh_skuul",
	server: "172.16.1.79",

	options: { encrypt: false, trustServerCertificate: false },
};

const _BACKEND_URL = "https://ottapp.ecm.mn/api/get_qpayinvoice";

// ── POST — Invoice үүсгэх ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const res = await fetch("https://ottapp.ecm.mn/api/get_qpayinvoice", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const text = await res.text();
			return NextResponse.json(
				{ error: `Upstream error: ${res.status}`, detail: text },
				{ status: res.status },
			);
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "QPay алдаа гарлаа" },
			{ status: 500 },
		);
	}
}
