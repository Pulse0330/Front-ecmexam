import { type NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "uploads.ecm.mn";

export async function GET(req: NextRequest) {
	const url = req.nextUrl.searchParams.get("url");
	if (!url) return new NextResponse("Missing url", { status: 400 });

	// Зөвхөн uploads.ecm.mn-с зураг татна (аюулгүй байдал)
	try {
		const parsed = new URL(url);
		if (parsed.hostname !== ALLOWED_HOST) {
			return new NextResponse("Forbidden", { status: 403 });
		}
	} catch {
		return new NextResponse("Invalid url", { status: 400 });
	}

	try {
		const res = await fetch(url);
		if (!res.ok) return new NextResponse("Image not found", { status: 404 });

		const buffer = await res.arrayBuffer();
		const contentType = res.headers.get("content-type") || "image/jpeg";

		return new NextResponse(buffer, {
			headers: {
				"Content-Type": contentType,
				"Access-Control-Allow-Origin": "*",
				"Cache-Control": "public, max-age=86400",
			},
		});
	} catch {
		return new NextResponse("Failed to fetch image", { status: 500 });
	}
}
