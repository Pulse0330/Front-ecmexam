import { type NextRequest, NextResponse } from "next/server";

interface CheckUserResponse {
	RetResponse?: {
		ResponseType: boolean;
		ResponseMessage?: string;
	};
	RetData?: unknown;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log("=== CHECK-USER API: Received body ===", body);

		// dbname сургуулийн жагсаалтаас ирнэ, regnumber хэрэглэгч оруулна
		const requestBody = {
			dbname: body.dbname,
			regnumber: body.registration_number,
		};

		console.log("=== CHECK-USER API: Sending to backend ===", requestBody);

		const response = await fetch("https://ottapp.ecm.mn/api/checkuser", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(requestBody),
		});

		console.log(
			"=== CHECK-USER API: Backend response status ===",
			response.status,
		);

		const data = (await response.json()) as CheckUserResponse;
		console.log("=== CHECK-USER API: Backend response data ===", data);

		return NextResponse.json(data);
	} catch (error) {
		console.error("=== CHECK-USER API: Error ===", error);
		return NextResponse.json(
			{
				error: "Failed to check user",
				RetResponse: {
					ResponseType: false,
					ResponseMessage: "Хэрэглэгч шалгахад алдаа гарлаа",
				},
			},
			{ status: 500 },
		);
	}
}
