import { type NextRequest, NextResponse } from "next/server";

// ── Types ─────────────────────────────────────────────────────────────────────
interface QPayURL {
	name: string;
	description: string;
	logo: string;
	link: string;
}

export interface QPayInvoiceResponse {
	invoice_id: string;
	qr_text: string;
	qr_image: string;
	qPay_shortUrl: string;
	urls: QPayURL[];
}

// ── Server-side config ────────────────────────────────────────────────────────
const BACKEND_URL =
	process.env.QPAY_BACKEND_URL ?? "https://ottapp.ecm.mn/api/get_qpayinvoice";

// ── POST — Invoice үүсгэх ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const res = await fetch(BACKEND_URL, {
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

		const data: QPayInvoiceResponse = await res.json();
		return NextResponse.json(data);
	} catch (err) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : "QPay алдаа гарлаа" },
			{ status: 500 },
		);
	}
}
