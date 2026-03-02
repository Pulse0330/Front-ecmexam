import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const res = await fetch("https://backend.skuul.mn/api/examinee_list", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				personid: body.personid,
				conn: "skuul",
			}),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (err) {
		return NextResponse.json(
			{
				RetResponse: {
					ResponseType: false,
					ResponseMessage: err instanceof Error ? err.message : "Server error",
				},
			},
			{ status: 500 },
		);
	}
}
