"use client";

// URL-аар орж ирсэн (integration) шалгалт дууссан эсвэл гарсны дараах хуудас.
// Буцах хаяг байхгүй — хэрэглэгч өөрийн системээсээ гарна.

import { CheckCircle2 } from "lucide-react";

export default function IntegrationExamFinishedPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="text-center p-8 rounded-xl border bg-card max-w-md shadow-sm">
				<CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-green-500" />
				<p className="text-xl font-semibold mb-2">Шалгалтын цонхноос гарлаа</p>
				<p className="text-sm text-muted-foreground">
					Та энэ цонхыг хааж, өөрийн систем рүүгээ буцна уу.
				</p>
			</div>
		</div>
	);
}
