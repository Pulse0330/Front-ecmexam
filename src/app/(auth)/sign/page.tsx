// (auth)/sign/page.tsx
"use client";

import { AuthShell } from "../authShell";
import { SignForm } from "./form";

export default function SignPage() {
	return (
		<AuthShell>
			<SignForm />
		</AuthShell>
	);
}
