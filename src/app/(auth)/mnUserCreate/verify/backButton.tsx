import { ArrowLeft } from "lucide-react";

// "← Буцах" — алхмуудын хооронд буцах товч (бичигтэй, дарахад хялбар)
export function BackButton({
	onClick,
	label,
}: {
	onClick: () => void;
	label: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border bg-card px-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<ArrowLeft className="size-4" />
			{label}
		</button>
	);
}
