"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

// Хариулт автоматаар хадгалагдаж байгааг харуулах 3 хөдөлгөөнт цэг
// (гар "Хадгалах" товчийн оронд)
const DOT_DELAYS = [0, 150, 300];

const SavingDots = memo(function SavingDots({
	className = "",
}: {
	className?: string;
}) {
	return (
		<output
			aria-live="polite"
			aria-label="Хариулт хадгалж байна"
			title="Хариулт хадгалж байна"
			className={cn(
				"inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-800",
				className,
			)}
		>
			{DOT_DELAYS.map((delay) => (
				<span
					key={delay}
					className="h-2 w-2 rounded-full bg-primary animate-bounce"
					style={{ animationDelay: `${delay}ms` }}
				/>
			))}
		</output>
	);
});

export default SavingDots;
