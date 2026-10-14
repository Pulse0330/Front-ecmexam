"use client";

import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LetterListItem } from "@/types/letter/type";
import { isUrgentLetter, letterTimeAgo, letterTypeClass } from "./letterUi";
import { SenderAvatar } from "./senderAvatar";

// Navbar болон /letter хуудасны жагсаалтын нэг мөр
export function LetterRowContent({ item }: { item: LetterListItem }) {
	const read = item.is_read === 1;
	const needsAck = item.require_ack && !item.ack_date;

	return (
		<div className="flex w-full items-start gap-3">
			<SenderAvatar
				name={item.sender_name}
				photo={item.sender_photo}
				size={36}
				className="mt-0.5"
			/>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p
						className={cn(
							"truncate text-sm",
							read ? "font-medium text-muted-foreground" : "font-semibold",
						)}
					>
						{item.subject}
					</p>
					{!read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
					<span className="ml-auto shrink-0 text-[11px] text-muted-foreground/80">
						{letterTimeAgo(item.send_date)}
					</span>
				</div>
				<p className="truncate text-xs text-muted-foreground">
					{item.sender_name}
					{item.sender_title ? ` · ${item.sender_title}` : ""}
				</p>
				<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
					{item.type_name && (
						<span
							className={cn(
								"rounded-full border px-2 py-0.5 text-[10px] font-medium",
								letterTypeClass(item.type_color),
							)}
						>
							{item.type_name}
						</span>
					)}
					{isUrgentLetter(item.priority) && (
						<span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
							Яаралтай
						</span>
					)}
					{needsAck && (
						<span className="rounded-full border border-primary/40 px-2 py-0.5 text-[10px] font-medium text-primary">
							Танилцах
						</span>
					)}
					{item.file_count > 0 && (
						<span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
							<Paperclip className="h-3 w-3" />
							{item.file_count}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}