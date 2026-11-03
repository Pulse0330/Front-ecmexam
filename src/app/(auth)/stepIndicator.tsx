import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Олон алхамтай урсгалын "Алхам N / M" заагч
export function StepIndicator({
	steps,
	current,
	className,
}: {
	steps: string[];
	/** 0-ээс эхэлсэн одоогийн алхам */
	current: number;
	className?: string;
}) {
	return (
		<ol
			className={cn("flex w-full items-start gap-2", className)}
			aria-label={`Алхам ${current + 1} / ${steps.length}`}
		>
			{steps.map((label, i) => {
				const done = i < current;
				const active = i === current;
				return (
					<li
						key={label}
						className="flex min-w-0 flex-1 flex-col gap-1.5"
						aria-current={active ? "step" : undefined}
					>
						<span
							className={cn(
								"h-1.5 w-full rounded-full",
								done || active ? "bg-primary" : "bg-muted",
							)}
						/>
						<span
							className={cn(
								"flex items-center gap-1 text-xs font-medium",
								active
									? "text-primary"
									: done
										? "text-foreground"
										: "text-muted-foreground",
							)}
						>
							{done && <Check className="size-3.5 shrink-0" />}
							<span className="truncate">
								{i + 1}. {label}
							</span>
						</span>
					</li>
				);
			})}
		</ol>
	);
}

export default StepIndicator;
