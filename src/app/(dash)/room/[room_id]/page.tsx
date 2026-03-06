"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Minus, Plus, Save } from "lucide-react";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Desk } from "@/app/(dash)/room/[room_id]/desk";
import { LayoutPicker } from "@/app/(dash)/room/[room_id]/mini-room";
import { IBackButton } from "@/components/iBackButton";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRoomManager } from "@/hooks/use-room-manager";
import {
	getComputerPositions,
	getRoomById,
	saveRoomLayout,
} from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { LayoutType, Table } from "@/types/dashboard/room.types";

interface RoomPageProps {
	params: Promise<{ room_id: string }>; // params-ийн төрлийг Promise гэж тодорхойлно
}

export default function RoomPage({ params }: RoomPageProps) {
	const { userId } = useAuthStore();
	const unwrappedParams = use(params);
	const roomId = unwrappedParams.room_id;

	const TABLE_UNITS = 30;
	const SNAP_STEP = 10;

	const {
		tables,
		setTables,
		tableCount,
		setTableCount,
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
		sizeMultiplier,
		addExtraTables,
	} = useRoomManager(TABLE_UNITS);

	const containerRef = useRef<HTMLDivElement>(null);
	const [currentLayout, setCurrentLayout] = useState<LayoutType>("rows_3");
	const [newlyAddedTables, setNewlyAddedTables] = useState<Table[]>([]);

	const { data: remoteData, isLoading: isDataLoading } = useQuery({
		queryKey: ["room-positions", roomId],
		queryFn: () =>
			getComputerPositions({ userId: Number(userId), roomid: Number(roomId) }),
		enabled: !!userId,
	});

	const { data: roomDetail, isLoading: isRoomDetailLoading } = useQuery({
		queryKey: ["room-detail", roomId],
		queryFn: () =>
			getRoomById({ userId: Number(userId), roomid: Number(roomId) }),
		select: (res) => res.RetData[0],
	});

	// useEffect(() => {
	// 	if (roomDetail?.roomsize) {
	// 		setSizeMultiplier(roomDetail.roomsize);
	// 	}
	// }, [roomDetail, setSizeMultiplier]);

	// Өмнөх олон useEffect-үүдээ устгаад зөвхөн үүнийг үлдээ:
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (isDataLoading || isRoomDetailLoading || !roomDetail) return;
		if (roomDetail.roomsize) {
			setSizeMultiplier(roomDetail.roomsize);
		}

		const totalPcCount = roomDetail.num_of_pc || 0;

		if (remoteData?.RetData && remoteData.RetData.length > 0) {
			const mappedTables: Table[] = remoteData.RetData.map((pc) => ({
				id: pc.seatid,
				xPos: pc.colnum,
				yPos: pc.rownum,
				name: pc.seat_number,
				seat_number: pc.seat_number,
				exam_seat_id: pc.exam_seat_id,
			}));

			// ✅ num_of_pc > RetData.length бол хоосон байршлаас шинэ PC нэмнэ
			const { allTables, newTables } = addExtraTables(
				mappedTables,
				totalPcCount,
			);
			setNewlyAddedTables(newTables);
			setTables(allTables);
			setTableCount(allTables.length);
		} else {
			setTableCount(totalPcCount);
			if (tables.length === 0 && totalPcCount > 0) {
				applyLayout(currentLayout, totalPcCount);
			}
		}
		// biome-ignore lint/correctness/useExhaustiveDependencies: tables intentionally excluded
	}, [isDataLoading, isRoomDetailLoading, remoteData, roomDetail]);

	// Mouse handlers (MouseDown, MouseMove, MouseUp хэвээрээ...)
	const handleMouseDown = (e: React.MouseEvent, table: Table) => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;
		const unitSize = rect.width / GRID_X;
		setActiveTable(table.id);
		startPos.current = { x: table.xPos, y: table.yPos };
		dragOffset.current = {
			x: e.clientX - rect.left - table.xPos * unitSize,
			y: e.clientY - rect.top - table.yPos * unitSize,
		};
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (activeTable === null || !containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const unitSize = rect.width / GRID_X;
		const mouseX = (e.clientX - rect.left - dragOffset.current.x) / unitSize;
		const mouseY = (e.clientY - rect.top - dragOffset.current.y) / unitSize;

		let snappedX = Math.round(mouseX / SNAP_STEP) * SNAP_STEP;
		let snappedY = Math.round(mouseY / SNAP_STEP) * SNAP_STEP;
		snappedX = Math.max(0, Math.min(snappedX, GRID_X - TABLE_UNITS));
		snappedY = Math.max(0, Math.min(snappedY, GRID_Y - TABLE_UNITS));

		setTables((prev) =>
			prev.map((t) =>
				t.id === activeTable ? { ...t, xPos: snappedX, yPos: snappedY } : t,
			),
		);
	};

	const handleMouseUp = () => {
		if (activeTable === null) return;
		const currentTable = tables.find((t) => t.id === activeTable);
		if (
			currentTable &&
			isOverlapping(activeTable, currentTable.xPos, currentTable.yPos, tables)
		) {
			setTables((prev) =>
				prev.map((t) =>
					t.id === activeTable
						? { ...t, xPos: startPos.current.x, yPos: startPos.current.y }
						: t,
				),
			);
		}
		setActiveTable(null);
	};

	const handleLayoutChange = (type: LayoutType) => {
		setCurrentLayout(type);
		applyLayout(type); // Таны hook-ээс ирж байгаа функц
	};

	const { mutate: saveLayout, isPending } = useMutation({
		mutationFn: saveRoomLayout,
		onSuccess: (res) => {
			if (res.RetResponse.ResponseCode === 11) {
				toast.error(res.RetResponse.ResponseMessage);
			} else {
				toast.success(res.RetResponse.ResponseMessage);
			}
		},
	});

	const handleSave = () => {
		// Шинэ ширээ байгаа эсэхээс хамааран явуулах дата өөрчлөгдөнө
		const tablesToSave =
			newlyAddedTables.length > 0 ? newlyAddedTables : tables;

		saveLayout({
			roomId: Number(roomId),
			userId: userId || 0,
			tables: tablesToSave, // ✅ Зөвхөн шинэ ширээнүүд
			sizes: sizeMultiplier,
		});
	};

	// remoteData-гийн анхны байршлуудыг map хийж авах
	const originalPositions = useMemo(() => {
		const map = new Map<number, { xPos: number; yPos: number }>();
		remoteData?.RetData?.forEach((pc) => {
			map.set(pc.seatid, { xPos: pc.colnum, yPos: pc.rownum });
		});
		return map;
	}, [remoteData]);

	// Байршил өөрчлөгдсөн ширээнүүдийг тодорхойлох
	const movedTables = useMemo(() => {
		return new Set(
			tables
				.filter((t) => {
					if (!t.exam_seat_id || t.exam_seat_id === 0) return false;
					const original = originalPositions.get(t.id);
					if (!original) return false;
					return t.xPos !== original.xPos || t.yPos !== original.yPos;
				})
				.map((t) => t.id),
		);
	}, [tables, originalPositions]);

	const isAlreadyRegistered = remoteData !== null;

	if (isDataLoading || isRoomDetailLoading) {
		return (
			<div className="h-screen w-full flex items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="py-6 max-w-7xl mx-auto space-y-6 select-none text-foreground">
			{/* TOOLBAR */}

			<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b pb-6 text-foreground">
				<div className="flex items-center gap-3">
					<IBackButton />
					<div>
						<h1 className="text-2xl font-bold tracking-tight items-center flex gap-2">
							Ширээний зохион байгуулалт{" "}
							<span className="text-muted-foreground">
								| {roomDetail?.room_number || "—"}-р өрөө
							</span>
						</h1>
						<p className="text-xs text-muted-foreground mt-1">
							{tableCount} Ширээ | {roomDetail?.branchname}
						</p>
					</div>
				</div>
				<AlertDialog>
					{/* Хэрэв бүртгэгдсэн бол товчийг идэвхгүй болгоно */}
					<AlertDialogTrigger asChild>
						<Button className={`w-full md:w-auto `}>
							{isPending ? (
								<div className="flex items-center gap-2">
									<Spinner /> Хадгалж байна...
								</div>
							) : (
								<div className="flex items-center gap-2">
									<Save size={16} />
									{"Хадгалах"}
								</div>
							)}
						</Button>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								{isAlreadyRegistered
									? "Бүртгэлтэй байна"
									: "Та итгэлтэй байна уу?"}
							</AlertDialogTitle>
							<AlertDialogDescription>
								{isAlreadyRegistered
									? "Энэ өрөөний байршил аль хэдийн бүртгэгдсэн байна. Та дахин бүртгэх боломжгүй."
									: "Та ширээний байршлыг хадгалах гэж байна. Энэ үйлдлийг хийхэд бэлэн үү?"}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>
								{isAlreadyRegistered ? "Хаах" : "Болих"}
							</AlertDialogCancel>
							{
								<AlertDialogAction onClick={handleSave}>
									Тийм, хадгалах
								</AlertDialogAction>
							}
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</header>

			<div className="flex flex-col lg:flex-row gap-6 items-start">
				{/* ROOM CONTAINER */}
				<main
					ref={containerRef}
					className="relative w-full bg-muted/20 border-2 border-border rounded-4xl overflow-hidden shadow-inner ring-8 ring-muted/10"
					style={{ aspectRatio: `${RATIO_X} / ${RATIO_Y}` }}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onMouseLeave={handleMouseUp}
				>
					{/* GRID */}
					<div
						className="absolute inset-0 pointer-events-none opacity-[0.2] dark:opacity-[0.15]"
						style={{
							backgroundImage: `linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)`,
							backgroundSize: `${(SNAP_STEP / GRID_X) * 100}% ${(SNAP_STEP / GRID_Y) * 100}%`,
						}}
					/>

					{/* <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 scale-90 md:scale-100 origin-bottom-right">
						<ButtonGroup orientation="vertical">
							<Button
								variant="outline"
								onClick={addTable}
								className=" shadow-lg "
								size={"xs"}
							>
								<Plus />
								Ширээ нэмэх
							</Button>
							<Button
								variant="outline"
								onClick={removeTable}
								className=" shadow-lg "
								size={"xs"}
							>
								<Minus />
								Ширээ хасах
							</Button>
						</ButtonGroup>
					</div> */}

					{/* CONTROL BUTTONS (BOTTOM RIGHT) */}
					<div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 scale-90 md:scale-100 origin-bottom-right">
						{/* <div className="flex items-center gap-2 px-3 py-1 bg-card rounded-lg border border-border shadow-lg">
							<span className="text-[10px] font-bold text-muted-foreground uppercase">
								Too
							</span>
							<Input
								type="number"
								value={tableCount}
								onChange={(e) => setTableCount(Number(e.target.value))}
								className="w-10 h-7 border-none bg-transparent p-0 text-center font-bold focus-visible:ring-0"
							/>
						</div> */}

						<div className="flex bg-card rounded-lg p-0.5 border border-border shadow-lg">
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => setSizeMultiplier((m) => Math.max(m - 5, 20))}
							>
								<Minus size={16} />
							</Button>
							<div className="px-2 flex items-center text-[10px] font-bold text-muted-foreground">
								Хэмжээ
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => setSizeMultiplier((m) => Math.min(m + 5, 100))}
							>
								<Plus size={16} />
							</Button>
						</div>
					</div>

					{tables.map((table) => (
						<Desk
							key={table.id}
							table={table}
							isActive={activeTable === table.id}
							isMoved={movedTables.has(table.id)} // ← нэмэх
							gridX={GRID_X}
							gridY={GRID_Y}
							isNew={newlyAddedTables.some((t) => t.id === table.id)}
							tableUnits={TABLE_UNITS}
							onMouseDown={handleMouseDown}
						/>
					))}
				</main>

				<aside className="w-full lg:w-48  flex flex-col gap-4">
					<div className="flex flex-col gap-2 px-1">
						<span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
							Бэлэн загварууд
						</span>
						<div className="h-px bg-border w-10" />
					</div>
					<div className="overflow-x-auto w-full">
						<LayoutPicker
							currentLayout={currentLayout}
							onSelect={handleLayoutChange}
						/>
					</div>
				</aside>
			</div>
			<div className="flex gap-6">
				<div className="flex items-center gap-3">
					<div className="bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/40  size-10 rounded-md flex items-center justify-center border-2 transition-all shadow-md p-0.5"></div>{" "}
					Бүртгэдсэн ширээ
				</div>
				<div className="flex items-center gap-3">
					{" "}
					<div className="bg-orange-100 dark:bg-orange-900/40 dark:border-orange-500 text-orange-500 border-orange-500  size-10 rounded-md flex items-center justify-center border-2 transition-all shadow-md p-0.5"></div>
					Нэмж бүртгэсэн ширээ
				</div>
			</div>
			{/* Header хэсгийн товчлуур */}
		</div>
	);
}
