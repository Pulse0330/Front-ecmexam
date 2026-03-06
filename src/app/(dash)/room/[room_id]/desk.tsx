"use client";

import type { Table } from "@/types/dashboard/room.types";

interface DeskProps {
	table: Table;
	isActive: boolean;
	gridX: number;
	gridY: number;
	tableUnits: number;
	isNew?: boolean; // ← нэмэх
	isMoved?: boolean;
	onMouseDown: (e: React.MouseEvent, table: Table) => void;
}

export function Desk({
	table,
	isActive,
	gridX,
	gridY,
	tableUnits,
	isNew,

	onMouseDown,
}: DeskProps) {
	return (
		<button
			type="button"
			onMouseDown={(e) => onMouseDown(e, table)}
			style={{
				left: `${(table.xPos / gridX) * 100}%`,
				top: `${(table.yPos / gridY) * 100}%`,
				width: `${(tableUnits / gridX) * 100}%`,
				height: `${(tableUnits / gridY) * 100}%`,
				padding: `2px`,
				transition: isActive
					? "none"
					: "all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
			}}
			className={`absolute cursor-grab active:cursor-grabbing outline-none focus:ring-0 ${
				isActive ? "z-50" : "z-10"
			}`}
		>
			<div
				className={`w-full h-full rounded-md flex items-center justify-center border-2 transition-all shadow-md p-0.5 ${
					isActive
						? "bg-indigo-600 border-indigo-400 shadow-indigo-500/50 scale-110 text-white"
						: isNew
							? " bg-orange-100 dark:bg-orange-900/40 dark:border-orange-500 text-orange-500 border-orange-500"
							: "bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/40"
				}`}
			>
				{/* <Monitor /> */}
				{table.seat_number}
			</div>
		</button>
	);
}
