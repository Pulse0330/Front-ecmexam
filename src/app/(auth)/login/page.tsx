"use client";

import { Suspense } from "react";
import { AuthShell } from "../authShell";
import { LoginForm } from "./form";

export default function LoginPage() {
	return (
		<AuthShell>
			<Suspense>
				<div className="w-full max-w-md space-y-6">
					<LoginForm />
				</div>
			</Suspense>
		</AuthShell>
	);
}
