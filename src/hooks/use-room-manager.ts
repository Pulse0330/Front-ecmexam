import { useCallback, useRef, useState } from "react";
import type { GridPos, LayoutType, Table } from "@/types/dashboard/room.types";

export const useRoomManager = (TABLE_UNITS: number) => {
	const [tableCount, setTableCount] = useState(1);
	const [sizeMultiplier, setSizeMultiplier] = useState(48);
	const [activeTable, setActiveTable] = useState<number | null>(null);

	const RATIO_X = 16;
	const RATIO_Y = 10;
	const GRID_X = RATIO_X * sizeMultiplier;
	const GRID_Y = RATIO_Y * sizeMultiplier;

	const generateLayout = useCallback(
		(
			type: LayoutType,
			count: number,
			gX: number,
			gY: number,
			existingTables?: Table[],
		) => {
			const tables: Table[] = [];
			const colGap = 10;
			const rowGap = 10;

			// exam_seat_id > 0 байгаа бүртгэгдсэн ширээнүүдийг seat_number-аар индекс хийх
			const registeredMap = new Map<string, Table>();
			if (existingTables) {
				for (const t of existingTables) {
					if (t.exam_seat_id && t.exam_seat_id > 0) {
						registeredMap.set(t.seat_number, t);
					}
				}
			}

			const buildTable = (i: number, x: number, y: number): Table => {
				const seatNumber = (i + 1).toString();
				const registered = registeredMap.get(seatNumber);
				return {
					id: i + 1,
					seat_number: seatNumber,
					xPos: Math.round(x / 10) * 10,
					yPos: Math.round(y / 10) * 10,
					// Бүртгэлтэй ширээний нэр болон exam_seat_id-г хадгалах,
					// шинэ ширээнд 0 өгөх
					name: registered?.name ?? "Сурагч",
					exam_seat_id: registered?.exam_seat_id ?? 0,
				};
			};

			if (type === "u_shape") {
				const dynamicGap = 10;
				const maxHeight = gY * 0.8;
				const maxBackCount = Math.floor(maxHeight / (TABLE_UNITS + dynamicGap));
				const backCount = Math.min(count, maxBackCount);
				const remainingCount = count - backCount;
				const topCount = Math.ceil(remainingCount / 2);
				const bottomCount = remainingCount - topCount;

				const totalWidth =
					Math.max(topCount, bottomCount) * (TABLE_UNITS + dynamicGap);
				const totalHeight = (backCount - 1) * (TABLE_UNITS + dynamicGap);

				const offsetX = (gX - totalWidth) / 2;
				const offsetY = (gY - totalHeight - TABLE_UNITS) / 2;

				for (let i = 0; i < count; i++) {
					let x = 0,
						y = 0;
					if (i < topCount) {
						x = offsetX + i * (TABLE_UNITS + dynamicGap);
						y = offsetY;
					} else if (i < topCount + backCount) {
						const idxInBack = i - topCount;
						x = offsetX + totalWidth;
						y = offsetY + idxInBack * (TABLE_UNITS + dynamicGap);
					} else {
						const idxInBottom = i - (topCount + backCount);
						x =
							offsetX +
							(bottomCount - idxInBottom - 1) * (TABLE_UNITS + dynamicGap);
						y = offsetY + totalHeight;
					}

					tables.push(buildTable(i, x, y));
				}
			} else {
				const sections = type === "rows_3" ? 3 : 2;
				const rowsPerSection = 2;
				const cols = Math.ceil(count / (sections * rowsPerSection));
				const sectionGap = 60;

				const totalWidth = cols * TABLE_UNITS + (cols - 1) * colGap;
				const totalHeight =
					sections * rowsPerSection * TABLE_UNITS +
					(sections * rowsPerSection - sections) * rowGap +
					(sections - 1) * sectionGap;

				const offsetX = (gX - totalWidth) / 2;
				const offsetY = (gY - totalHeight) / 2;

				for (let i = 0; i < count; i++) {
					const sectionIdx = Math.floor(i / (rowsPerSection * cols));
					const itemInSec = i % (rowsPerSection * cols);
					const rowInSec = Math.floor(itemInSec / cols);
					const colIdx = itemInSec % cols;

					tables.push(
						buildTable(
							i,
							offsetX + colIdx * (TABLE_UNITS + colGap),
							offsetY +
								sectionIdx * (TABLE_UNITS * rowsPerSection + sectionGap) +
								rowInSec * (TABLE_UNITS + rowGap),
						),
					);
				}
			}
			return tables;
		},
		[TABLE_UNITS],
	);

	const addExtraTables = useCallback(
		(
			existingTables: Table[],
			totalCount: number,
		): {
			allTables: Table[];
			newTables: Table[];
		} => {
			if (totalCount <= existingTables.length) {
				return { allTables: existingTables, newTables: [] };
			}

			const extraCount = totalCount - existingTables.length;
			const maxId =
				existingTables.length > 0
					? Math.max(...existingTables.map((t) => t.id))
					: 0;
			const maxSeatNum =
				existingTables.length > 0
					? Math.max(...existingTables.map((t) => parseInt(t.seat_number) || 0))
					: 0;

			const addedTables: Table[] = [];

			for (let i = 0; i < extraCount; i++) {
				const newId = maxId + i + 1;
				const newSeatNum = (maxSeatNum + i + 1).toString();

				let newX = 0,
					newY = 0,
					foundSpot = false;

				for (let x = 0; x < GRID_X - TABLE_UNITS; x += 10) {
					for (let y = 0; y < GRID_Y - TABLE_UNITS; y += 10) {
						const isOccupied = [...existingTables, ...addedTables].some(
							(t) =>
								x < t.xPos + TABLE_UNITS &&
								x + TABLE_UNITS > t.xPos &&
								y < t.yPos + TABLE_UNITS &&
								y + TABLE_UNITS > t.yPos,
						);
						if (!isOccupied) {
							newX = x;
							newY = y;
							foundSpot = true;
							break;
						}
					}
					if (foundSpot) break;
				}

				// Шинээр нэмэгдсэн ширээ — exam_seat_id = 0
				addedTables.push({
					id: newId,
					seat_number: newSeatNum,
					xPos: newX,
					yPos: newY,
					name: `Сурагч ${newSeatNum}`,
					exam_seat_id: 0,
				});
			}

			return {
				allTables: [...existingTables, ...addedTables],
				newTables: addedTables,
			};
		},
		[GRID_X, GRID_Y, TABLE_UNITS],
	);

	const [tables, setTables] = useState<Table[]>([]);
	const startPos = useRef<GridPos>({ x: 0, y: 0 });
	const dragOffset = useRef<GridPos>({ x: 0, y: 0 });

	const applyLayout = useCallback(
		(type: LayoutType, customCountValue?: number) => {
			const finalCount = customCountValue ?? tableCount;
			const currentGridX = RATIO_X * sizeMultiplier;
			const currentGridY = RATIO_Y * sizeMultiplier;

			// Одоогийн tables-ийг дамжуулж бүртгэлтэй exam_seat_id-уудыг хадгалах
			setTables((prev) =>
				generateLayout(type, finalCount, currentGridX, currentGridY, prev),
			);
		},
		[generateLayout, tableCount, sizeMultiplier],
	);

	const isOverlapping = (
		id: number,
		x: number,
		y: number,
		allTables: Table[],
	) => {
		return allTables.some((t) => {
			if (t.id === id) return false;
			return (
				x < t.xPos + TABLE_UNITS &&
				x + TABLE_UNITS > t.xPos &&
				y < t.yPos + TABLE_UNITS &&
				y + TABLE_UNITS > t.yPos
			);
		});
	};

	const addTable = useCallback(() => {
		setTables((prev) => {
			const maxId = prev.length > 0 ? Math.max(...prev.map((t) => t.id)) : 0;
			const newId = maxId + 1;

			const maxSeatNum =
				prev.length > 0
					? Math.max(...prev.map((t) => parseInt(t.seat_number) || 0))
					: 0;
			const newSeatNumber = (maxSeatNum + 1).toString();

			let newX = 0,
				newY = 0,
				foundSpot = false;

			for (let x = 0; x < GRID_X - TABLE_UNITS; x += 10) {
				for (let y = 0; y < GRID_Y - TABLE_UNITS; y += 10) {
					const isOccupied = prev.some(
						(t) =>
							x < t.xPos + TABLE_UNITS &&
							x + TABLE_UNITS > t.xPos &&
							y < t.yPos + TABLE_UNITS &&
							y + TABLE_UNITS > t.yPos,
					);

					if (!isOccupied) {
						newX = x;
						newY = y;
						foundSpot = true;
						break;
					}
				}
				if (foundSpot) break;
			}

			// Шинээр нэмэгдсэн ширээ — exam_seat_id = 0
			const newTable: Table = {
				id: newId,
				seat_number: newSeatNumber,
				xPos: newX,
				yPos: newY,
				name: `Сурагч ${newSeatNumber}`,
				exam_seat_id: 0,
			};

			return [...prev, newTable];
		});
		setTableCount((prev) => prev + 1);
	}, [GRID_X, GRID_Y, TABLE_UNITS]);

	const removeTable = useCallback(() => {
		setTables((prev) => {
			if (prev.length === 0) return prev;
			const maxId = Math.max(...prev.map((t) => t.id));
			return prev.filter((t) => t.id !== maxId);
		});
		setTableCount((prev) => Math.max(0, prev - 1));
	}, []);

	return {
		tables,
		setTables,
		tableCount,
		setTableCount,
		sizeMultiplier,
		setSizeMultiplier,
		activeTable,
		setActiveTable,
		GRID_X,
		GRID_Y,
		startPos,
		dragOffset,
		applyLayout,
		isOverlapping,
		RATIO_X,
		RATIO_Y,
		addTable,
		removeTable,
		addExtraTables,
	};
};
