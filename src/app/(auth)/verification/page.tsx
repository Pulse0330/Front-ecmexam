// (auth)/verification/page.tsx
"use client";

import { AuthShell } from "../authShell";
import RegistrationForm from "./form";

export default function VerificationPage() {
	return (
		<AuthShell>
			<RegistrationForm />
		</AuthShell>
	);
}
