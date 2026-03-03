"use client";

import { useEffect, useState } from "react";
import VerifyForm, { type VerifyData } from "./verifyForm";

export default function VerifyPage() {
	const [data, setData] = useState<VerifyData | null>(null);

	useEffect(() => {
		const raw = sessionStorage.getItem("verifyData");
		if (!raw) {
			window.location.href = "/mnUserCreate";
			return;
		}
		setData(JSON.parse(raw));
	}, []);

	if (!data)
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
			</div>
		);

	return <VerifyForm data={data} />;
}
