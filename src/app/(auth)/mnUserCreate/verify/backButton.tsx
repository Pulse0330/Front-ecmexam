import { ChevronLeft } from "lucide-react";

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
			className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
		>
			<ChevronLeft size={14} />
			{label}
		</button>
	);
}
