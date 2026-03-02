// "use client";
// import { useRef, useState } from "react";
// import { DraggableTable } from "@/app/(dash)/room/dragDropTable";
// import { Item } from "@/components/ui/item";

// export default function RoomPage() {
// 	// Байршлыг 0-1000 хооронд бүхэл тоогоор үүсгэх
// 	const initialTables = Array.from({ length: 20 }, (_, i) => {
// 		const cols = 9;
// 		const row = Math.floor(i / cols);
// 		const col = i % cols;

// 		return {
// 			id: i + 1,
// 			xPos: Math.round((0.05 + col * 0.1) * 1000), // Жишээ: 150
// 			yPos: Math.round((0.1 + row * 0.15) * 1000), // Жишээ: 250
// 			name: "Ширээ",
// 		};
// 	});

// 	const [tables, setTables] = useState(initialTables);
// 	const [activeTable, setActiveTable] = useState<number | null>(null);
// 	const containerRef = useRef<HTMLDivElement>(null);
// 	const dragOffset = useRef({ x: 0, y: 0 });

// 	const tableScale = 0.05;

// 	const handleMouseMove = (e: React.MouseEvent) => {
// 		if (activeTable === null || !containerRef.current) return;

// 		const rect = containerRef.current.getBoundingClientRect();
// 		const tableSize = rect.width * tableScale;

// 		let currentX = e.clientX - rect.left - dragOffset.current.x;
// 		let currentY = e.clientY - rect.top - dragOffset.current.y;

// 		currentX = Math.max(0, Math.min(currentX, rect.width - tableSize));
// 		currentY = Math.max(0, Math.min(currentY, rect.height - tableSize));

// 		// 0-1000 хооронд бүхэл тоо руу шилжүүлэх
// 		const xPos = Math.round((currentX / rect.width) * 1000);
// 		const yPos = Math.round((currentY / rect.height) * 1000);

// 		setTables((prev) =>
// 			prev.map((t) => (t.id === activeTable ? { ...t, xPos, yPos } : t)),
// 		);
// 	};

// 	return (
// 		<div className="p-4 md:p-8  text-foreground ">
// 			<h1 className="text-xl md:text-xl font-semibold tracking-tight mb-4 uppercase text-center">
// 				Өрөөний зохион байгуулалт
// 			</h1>

// 			<Item
// 				ref={containerRef}
// 				className="relative w-full aspect-16/10 max-w-[1000px] bg-muted/20 border-2 border-muted-foreground/20 rounded-xl overflow-hidden touch-none shadow-inner mx-auto z-10 "
// 				onMouseMove={handleMouseMove}
// 				onMouseUp={() => setActiveTable(null)}
// 				onMouseLeave={() => setActiveTable(null)}
// 			>
// 				<div className="absolute inset-0 size-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[20px_20px]" />

// 				{tables.map((table) => {
// 					const cWidth = containerRef.current?.clientWidth || 1000;
// 					const cHeight = containerRef.current?.clientHeight || 600;
// 					const currentSize = cWidth * tableScale;

// 					return (
// 						<DraggableTable
// 							key={table.id}
// 							table={{
// 								...table,
// 								// Рендер хийхдээ 1000-д хувааж байршлыг нь гаргана
// 								x: (table.xPos / 1000) * cWidth,
// 								y: (table.yPos / 1000) * cHeight,
// 							}}
// 							width={currentSize}
// 							height={currentSize}
// 							isActive={activeTable === table.id}
// 							onMouseDown={(e) => {
// 								if (!containerRef.current) return;
// 								setActiveTable(table.id);
// 								const rect = containerRef.current.getBoundingClientRect();

// 								// Хөдөлгөөний зөрүүг тооцохдоо 1000-д хуваасан утгыг ашиглана
// 								const currentXPx = (table.xPos / 1000) * rect.width;
// 								const currentYPx = (table.yPos / 1000) * rect.height;

// 								dragOffset.current = {
// 									x: e.clientX - rect.left - currentXPx,
// 									y: e.clientY - rect.top - currentYPx,
// 								};
// 							}}
// 						/>
// 					);
// 				})}
// 			</Item>

// 			{/* Хянах хэсэг: Бүхэл тоонуудыг харах */}
// 			<div className="mt-8 grid grid-cols-4 md:grid-cols-10 gap-2 text-[10px] font-mono p-4 bg-muted/30 rounded-lg">
// 				{tables.map((t) => (
// 					<div
// 						key={t.id}
// 						className={
// 							activeTable === t.id ? "text-primary font-bold" : "opacity-60"
// 						}
// 					>
// 						#{t.id}: {t.xPos}, {t.yPos}
// 					</div>
// 				))}
// 			</div>
// 		</div>
// 	);
// }
