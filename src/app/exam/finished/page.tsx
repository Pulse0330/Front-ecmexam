"use client";

// URL-аар орж ирсэн (integration) шалгалт дууссан эсвэл гарсны дараах хуудас.
// Буцах хаяг байхгүй — хэрэглэгч өөрийн системээсээ гарна.

import { CheckCircle2 } from "lucide-react";

export default function IntegrationExamFinishedPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
				<span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
					<CheckCircle2 className="size-9" />
				</span>
				<h1 className="mb-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
					Шалгалтын цонхноос гарлаа
				</h1>
				<p className="text-base text-muted-foreground">
					Та энэ цонхыг хааж, өөрийн систем рүүгээ буцна уу.
				</p>
			</div>
		</main>
	);
}
