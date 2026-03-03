// ── InfoRow ───────────────────────────────────────────────────────────────────
export function InfoRow({
	label,
	value,
	mono,
}: {
	label: string;
	value: string | null | undefined;
	mono?: boolean;
}) {
	return (
		<div className="flex justify-between items-start gap-3 py-1.5">
			<span className="text-xs text-muted-foreground shrink-0">{label}</span>
			<span
				className={`text-xs font-medium text-right ${mono ? "font-mono text-foreground/70" : "text-foreground"}`}
			>
				{value || "—"}
			</span>
		</div>
	);
}

// ── InfoSection ───────────────────────────────────────────────────────────────
export function InfoSection({
	icon,
	title,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<div className="flex items-center gap-1.5 mb-1.5">
				<span className="text-primary/60">{icon}</span>
				<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
					{title}
				</span>
			</div>
			<div className="bg-muted/20 rounded-xl px-3 divide-y divide-border/50">
				{children}
			</div>
		</div>
	);
}
