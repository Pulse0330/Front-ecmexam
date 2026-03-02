import { useCallback, useRef, useState } from "react";
import type { GridPos, LayoutType, Table } from "@/types/dashboard/room.types";

export const useRoomManager = (
	TABLE_UNITS: number,
	_SNAP_STEP: number,
	customCount?: number,
) => {
	const [tableCount, setTableCount] = useState(36);
	const [sizeMultiplier, setSizeMultiplier] = useState(48);
	const [activeTable, setActiveTable] = useState<number | null>(null);

	const _finalCount = customCount ?? tableCount;

	const RATIO_X = 16;
	const RATIO_Y = 10;
	const GRID_X = RATIO_X * sizeMultiplier;
	const GRID_Y = RATIO_Y * sizeMultiplier;

	const generateLayout = useCallback(
		(type: LayoutType, count: number, gX: number, gY: number) => {
			const tables: Table[] = [];
			const colGap = 10;
			const rowGap = 10;

			if (type === "u_shape") {
				// 1. Gapiig tohiruulah
				const dynamicGap = 10;

				// 2. Y tenhleg (Bosooo) hesegte heden shiree bagtahiig tootsooloh
				// Uruunii undriin 80%-d bagtah shireenii too
				const maxHeight = gY * 0.8;
				const maxBackCount = Math.floor(maxHeight / (TABLE_UNITS + dynamicGap));

				// 3. Shireenүүdiig uhaalgaar huvaah
				// BackCount ni uruunii undurt bagtah hemjeenees hetrehgui
				const backCount = Math.min(count, maxBackCount);

				// Uldsen shireenүүdiig deeshee bolon dooshoo huvaah
				const remainingCount = count - backCount;
				const topCount = Math.ceil(remainingCount / 2);
				const bottomCount = remainingCount - topCount;

				// 4. Niit hemjeeg tootsooloh
				const totalWidth =
					Math.max(topCount, bottomCount) * (TABLE_UNITS + dynamicGap);
				const totalHeight = (backCount - 1) * (TABLE_UNITS + dynamicGap);

				// Uruunii gold bairluulah
				const offsetX = (gX - totalWidth) / 2;
				const offsetY = (gY - totalHeight - TABLE_UNITS) / 2;

				for (let i = 0; i < count; i++) {
					let x = 0;
					let y = 0;

					if (i < topCount) {
						// 1. DEED TAL (Horizontal)
						x = offsetX + i * (TABLE_UNITS + dynamicGap);
						y = offsetY;
					} else if (i < topCount + backCount) {
						// 2. BARUUN TAL (Vertical - Baruun tald bosoogoor)
						const idxInBack = i - topCount;
						x = offsetX + totalWidth;
						y = offsetY + idxInBack * (TABLE_UNITS + dynamicGap);
					} else {
						// 3. DOOD TAL (Horizontal)
						const idxInBottom = i - (topCount + backCount);
						x =
							offsetX +
							(bottomCount - idxInBottom - 1) * (TABLE_UNITS + dynamicGap);
						y = offsetY + totalHeight;
					}

					tables.push({
						id: i + 1,
						xPos: Math.round(x / 10) * 10,
						yPos: Math.round(y / 10) * 10,
						name: "Suragch",
					});
				}
			} else {
				// Салаагаар өрөх (2 эсвэл 3 салаа)
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

					tables.push({
						id: i + 1,
						xPos:
							Math.round((offsetX + colIdx * (TABLE_UNITS + colGap)) / 10) * 10,
						yPos:
							Math.round(
								(offsetY +
									sectionIdx * (TABLE_UNITS * rowsPerSection + sectionGap) +
									rowInSec * (TABLE_UNITS + rowGap)) /
									10,
							) * 10,
						name: `Сурагч`,
					});
				}
			}
			return tables;
		},
		[TABLE_UNITS],
	);

	const [tables, setTables] = useState<Table[]>([]);
	const startPos = useRef<GridPos>({ x: 0, y: 0 });
	const dragOffset = useRef<GridPos>({ x: 0, y: 0 });

	// applyLayout функцийг ингэж өөрчилнө
	const applyLayout = useCallback(
		(type: LayoutType, customCount?: number) => {
			// Хэрэв customCount ирсэн бол түүнийг, үгүй бол state-д байгаа tableCount-ыг ашиглана
			const finalCount = customCount ?? tableCount;

			// Мөн GRID хэмжээг энд тооцож дамжуулах нь илүү найдвартай
			const currentGridX = RATIO_X * sizeMultiplier;
			const currentGridY = RATIO_Y * sizeMultiplier;

			const newTables = generateLayout(
				type,
				finalCount,
				currentGridX,
				currentGridY,
			);
			setTables(newTables);
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

			// Хамгийн эхний боломжит байрлал (0, 0)
			let newX = 0;
			let newY = 0;
			let foundSpot = false;

			// Сул зай хайх логик:
			// Өрөөний Y тэнхлэгийн дагуу, дараа нь X тэнхлэгийн дагуу сул зай хайна
			for (let x = 0; x < GRID_X - TABLE_UNITS; x += 10) {
				for (let y = 0; y < GRID_Y - TABLE_UNITS; y += 10) {
					// Одоо байгаа ширээнүүдтэй давхардаж байгаа эсэхийг шалгах
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

			const newTable: Table = {
				id: newId,
				xPos: newX,
				yPos: newY,
				name: `Сурагч ${newId}`,
			};

			return [...prev, newTable];
		});
		setTableCount((prev) => prev + 1);
	}, [GRID_X, GRID_Y, TABLE_UNITS]);

	const removeTable = useCallback(() => {
		setTables((prev) => {
			if (prev.length === 0) return prev; // Ширээ байхгүй бол юу ч хийхгүй

			// Хамгийн өндөр ID-тай ширээг олох
			const maxId = Math.max(...prev.map((t) => t.id));

			// Тухайн ID-тай ширээнээс бусдыг нь үлдээх
			return prev.filter((t) => t.id !== maxId);
		});

		// Нийт тоог нэгээр хасах (0-ээс доош оруулахгүй)
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
	};
};
