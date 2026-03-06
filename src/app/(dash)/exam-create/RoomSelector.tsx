"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building, DoorOpen, Monitor } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { getRooms } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Room } from "@/types/dashboard/room.types";

// Сонгогдсон өрөөний төрөл
export interface SelectedRoom {
	id: string;
	esisroomid: number;
	pccnt: number;
}

interface RoomSelectorProps {
	selectedId: string | null;
	// Сонгох үед id болон esisroomid-г хамт буцаана
	onSelect: (id: SelectedRoom) => void;
	acctionHidden?: boolean;
}

export function RoomSelector({
	selectedId,
	onSelect,
	acctionHidden = false,
}: RoomSelectorProps) {
	const { userId } = useAuthStore();

	const { data: rooms = [], isLoading } = useQuery({
		queryKey: ["api_get_exam_rooms", userId],
		queryFn: () =>
			getRooms({
				userId: Number(userId),
				procname: "api_get_exam_rooms",
			}),
		enabled: !!userId,
		select: (res) => res.RetData,
	});

	const handleValueChange = (id: string) => {
		const foundRoom = rooms.find((r) => String(r.id) === id);
		if (foundRoom) {
			onSelect({
				id: String(foundRoom.id),
				esisroomid: foundRoom.esisroomid,
				pccnt: foundRoom.pccnt ?? 0,
			});
		}
	};

	return (
		<div className="h-full p-4 overflow-y-auto overflow-x-hidden">
			{isLoading ? (
				<div className="space-y-3 p-1">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="p-4 rounded-xl border border-border space-y-3"
						>
							<div className="flex items-center gap-3">
								<Skeleton className="h-4 w-4 rounded-full" />
								<Skeleton className="h-5 w-32" />
							</div>
							<div className="flex gap-2 pt-2 border-t">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-4 w-20" />
							</div>
						</div>
					))}
				</div>
			) : rooms === null || rooms.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
					<DoorOpen size={32} className="mb-2 opacity-20" />
					<p className="text-sm italic">Өрөө олдсонгүй</p>
				</div>
			) : (
				<RadioGroup
					value={selectedId || ""}
					onValueChange={handleValueChange}
					className="space-y-3 p-1"
				>
					{rooms.map((room: Room) => {
						const hasPC = room.pccnt !== null && room.pccnt > 0;
						const isDisabled = !hasPC || room.flag === 1; // 👈 ЭНЭ

						return (
							<div key={room.id} className="relative group">
								<Label
									htmlFor={`room-${room.id}`}
									className={`relative flex flex-col p-3 rounded-xl border transition-all cursor-pointer ${
										isDisabled
											? "bg-muted/20 border-dashed"
											: selectedId === String(room.id)
												? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
												: "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
									}`}
								>
									<div
										className={`flex items-start w-full ${isDisabled ? "opacity-60" : ""}`}
									>
										<div className="flex items-center gap-3 w-full">
											<RadioGroupItem
												value={String(room.id)}
												id={`room-${room.id}`}
												disabled={isDisabled} // 👈 ЭНЭ
											/>
											<div className="flex flex-col gap-0.5 overflow-hidden">
												<div className="flex items-center gap-2 font-medium text-sm">
													<DoorOpen
														size={14}
														className="text-muted-foreground"
													/>
													<span
														className={
															isDisabled ? "text-muted-foreground" : ""
														}
													>
														{room.room_number}-р өрөө
													</span>
													{room.branchname && (
														<span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate">
															{room.branchname}
														</span>
													)}
												</div>
												{room.name && (
													<div className="flex items-center gap-2 text-[11px] text-muted-foreground">
														<Building size={12} />
														<span className="truncate">{room.name}</span>
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 w-full">
										<div
											className={`flex items-center gap-1.5 text-[11px] text-muted-foreground ${isDisabled ? "opacity-60" : ""}`}
										>
											<Monitor size={14} className="text-muted-foreground" />
											<span>{room.pccnt ?? 0} суудал</span>
										</div>

										{room.flag === 1 ? (
											<Badge
												variant={"secondary"}
												className="text-[9px] h-4 bg-green-500/10 text-red-600 border-none px-1"
											>
												Түр хаагдсан
											</Badge>
										) : !hasPC ? (
											!acctionHidden && (
												<Button
													size="sm"
													variant="outline"
													className="h-7 text-[10px] gap-1 text-blue-600 border-blue-200 hover:text-blue-700 hover:bg-blue-50 relative z-10"
													asChild
												>
													<Link href={`room/${room.id}`}>
														Ширээний зохион байгуулалт
														<ArrowRight size={10} />
													</Link>
												</Button>
											)
										) : (
											<Badge
												variant="secondary"
												className="text-[9px] h-4 bg-green-500/10 text-green-600 border-none px-1"
											>
												Төхөөрөмжтэй
											</Badge>
										)}
									</div>
								</Label>
							</div>
						);
					})}
				</RadioGroup>
			)}
		</div>
	);
}
