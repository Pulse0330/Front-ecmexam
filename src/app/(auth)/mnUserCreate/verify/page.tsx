"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/page/pageStates";
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
			<div className="flex min-h-screen items-center justify-center bg-background">
				<LoadingState label="Мэдээлэл ачааллаж байна..." />
			</div>
		);

	return <VerifyForm data={data} />;
}
