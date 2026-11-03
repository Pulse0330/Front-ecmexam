"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Building,
	CircleOff,
	DoorOpen,
	Edit,
	Loader2,
	MapPin,
	Monitor,
	MoreVertical,
	Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { RoomCreateEditDialog } from "@/app/(dash)/room/RoomCreateEditDialog";
import { PageHeader } from "@/components/page/pageHeader";
import { EmptyState } from "@/components/page/pageStates";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getRooms, roomCreateEdit } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Room } from "@/types/dashboard/room.types";

export default function RoomPage() {
	const queryClient = useQueryClient();
	const { userId } = useAuthStore();
	const [isOpen, setIsOpen] = useState(false);
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ["api_get_exam_rooms", userId],
		queryFn: () =>
			getRooms({ userId: Number(userId), procname: "api_get_exam_rooms" }),
		enabled: !!userId,
		select: (res) => res.RetData || [],
	});

	const { mutate: deleteRoom, isPending: isDeletePending } = useMutation({
		mutationFn: async (id: number) => {
			const payload = {
				id: id ?? 0,
				optype: 2,
				userid: Number(userId),
				branchname: "",
				descr: "",
				name: "",
				room_number: "100",
				num_of_pc: 0,
				school_esis_id: "",
				esisroomid: "",
			};
			return roomCreateEdit(payload);
		},
		onSuccess: (res) => {
			if (res.RetResponse.ResponseCode === 11) {
				toast.error(res.RetResponse.ResponseMessage);
			}
			setIsDeleteOpen(false);
			queryClient.invalidateQueries({ queryKey: ["api_get_exam_rooms"] });
		},
	});

	const handleEdit = (id: number) => {
		setSelectedRoomId(id);
		setIsOpen(true);
	};

	const confirmDelete = (room: Room) => {
		setRoomToDelete(room);
		setIsDeleteOpen(true);
	};

	return (
		<div className="mx-auto max-w-7xl pb-10">
			<PageHeader
				title="Шалгалтын өрөөнүүд"
				description={
					isLoading
						? "Өрөөний мэдээллийг шалгаж байна..."
						: `Нийт ${data?.length || 0} өрөө бүртгэгдсэн байна.`
				}
				icon={DoorOpen}
				className="mb-4 border-b"
				actions={
					<Button
						onClick={() => {
							setSelectedRoomId(null);
							setIsOpen(true);
						}}
						className="h-10 w-full gap-2 sm:w-auto"
					>
						<Plus size={18} />
						Шалгалтын өрөө бүртгэх
					</Button>
				}
			/>
			{/* 2. Content Area */}
			{isLoading ? (
				// Ачаалж байх үед Skeleton харуулна
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i} className="flex flex-col h-70">
							<CardHeader className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-10 w-24" />
							</CardHeader>
							<CardContent className="space-y-4">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</CardContent>
							<CardFooter>
								<Skeleton className="h-8 w-full" />
							</CardFooter>
						</Card>
					))}
				</div>
			) : data && data.length > 0 ? (
				// Дата байгаа үед Grid харуулна
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{data.map((room) => (
						<Card
							key={room.id}
							className={`relative flex flex-col justify-between border shadow-sm transition-all duration-300 gap-1 h-90 ${
								room.flag === 1
									? "opacity-50 pointer-events-none bg-muted/40 border-dashed"
									: "hover:ring-2 hover:ring-primary/10 hover:border-primary/30"
							}`}
						>
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start">
									<div>
										<p className="text-xs font-medium text-muted-foreground">
											Өрөөний дугаар
										</p>
										<h2 className="text-3xl font-bold tabular-nums text-foreground">
											{room.room_number || "—"}
										</h2>
									</div>

									{/* Flag badge */}
									{room.flag === 1 && (
										<span className="absolute top-2 right-2 text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full">
											Түр хаагдсан
										</span>
									)}

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-9 w-9 hover:bg-muted"
												aria-label="Өрөөний үйлдлүүд"
												disabled={room.flag === 1}
											>
												<MoreVertical
													size={18}
													className="text-muted-foreground"
												/>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-40">
											<DropdownMenuItem
												onClick={() => handleEdit(room.id)}
												className="cursor-pointer"
											>
												<Edit className="mr-2 h-4 w-4" /> Засах
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="font-medium cursor-pointer"
												onClick={() => confirmDelete(room)}
											>
												<CircleOff className="mr-2 h-4 w-4" /> Түр хаах
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>

							<CardContent className="flex flex-col gap-4 pb-2 justify-between  h-full">
								<div className="space-y-2">
									<div className="flex items-start gap-2.5">
										<MapPin className="text-primary mt-0.5" size={15} />
										<div className="min-w-0">
											<p className="text-xs leading-none text-muted-foreground font-medium">
												Хичээлийн байр
											</p>
											<p className="text-sm font-medium mt-0.5 truncate text-foreground/80">
												{room.branchname ? room.branchname : "-"}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-2.5">
										<Building className="text-primary mt-0.5" size={15} />
										<div className="min-w-0">
											<p className="text-xs leading-none text-muted-foreground font-medium">
												Шалгалт авах өрөөний нэр
											</p>
											<p className="text-sm font-semibold mt-0.5 truncate text-foreground/90">
												{room.name ? room.name : "-"}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-2.5">
										<Monitor className="text-primary mt-0.5" size={15} />
										<div className="min-w-0">
											<p className="text-xs leading-none text-muted-foreground font-medium">
												Бүртгэгдсэн төхөөрөмжийн тоо
											</p>
											<p className="text-sm font-medium mt-0.5 truncate text-foreground/80">
												{room.num_of_pc ? `${room.num_of_pc}` : "-"}
											</p>
										</div>
										<div className="min-w-0">
											<p className="text-xs leading-none text-muted-foreground font-medium">
												Зохион байгуулсан төхөөрөмж
											</p>
											<p className="text-sm font-medium mt-0.5 truncate text-foreground/80">
												{room.pccnt ? `${room.pccnt}` : "-"}
											</p>
										</div>
									</div>
								</div>

								<div className="bg-muted/30 p-2 rounded-lg border border-border/50">
									<p className="text-xs leading-none text-muted-foreground font-medium mb-1">
										Тайлбар
									</p>
									<p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">
										{room.description ||
											"Нэмэлт тайлбар бүртгэгдээгүй байна."}{" "}
									</p>
								</div>
							</CardContent>

							<CardFooter className="pt-0">
								<Button
									variant="outline"
									size="sm"
									className="h-10 w-full font-semibold"
									disabled={room.flag === 1}
									asChild={room.flag !== 1}
								>
									{room.flag !== 1 ? (
										<Link href={`/room/${room.id}`}>
											<Monitor size={14} className="mr-2" />
											Ширээний зохион байгуулалт
										</Link>
									) : (
										<>
											<Monitor size={14} className="mr-2" />
											Ширээний зохион байгуулалт
										</>
									)}
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<EmptyState
					icon={DoorOpen}
					title="Өрөө бүртгэгдээгүй байна"
					description="Шалгалт зохион байгуулахын тулд эхлээд өрөөний мэдээллээ оруулна уу."
					action={
						<Button onClick={() => setIsOpen(true)} className="h-10 gap-2">
							<Plus size={16} /> Шалгалтын өрөө бүртгэх
						</Button>
					}
				/>
			)}
			<RoomCreateEditDialog
				open={isOpen}
				setOpen={setIsOpen}
				roomID={selectedRoomId}
			/>
			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent className="max-w-sm">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 justify-center flex-col">
							<div className="rounded-full bg-destructive/10 p-3 text-destructive">
								<CircleOff />
							</div>
							<p>Өрөө түр хаах</p>
						</AlertDialogTitle>
						<AlertDialogDescription className="text-center">
							Та <span className="font-bold">{roomToDelete?.room_number}</span>{" "}
							дугаар өрөөг түр хаахдаа итгэлтэй байна уу? Хаагдсан өрөөнд
							шалгалт хуваарилах боломжгүй.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex flex-col justify-end gap-2 pt-2">
						<Button
							disabled={isDeletePending}
							onClick={() => {
								setIsDeleteOpen(false);
							}}
							className="h-10 w-full"
						>
							Үгүй, болих
						</Button>
						<Button
							onClick={(e) => {
								e.preventDefault();
								if (roomToDelete) deleteRoom(roomToDelete.id);
							}}
							variant="outline"
							className="h-10 w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
							disabled={isDeletePending}
						>
							{isDeletePending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Хааж байна...
								</>
							) : (
								"Тийм, түр хаах"
							)}
						</Button>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

// Туслах компонент (Dropdown separator-ийн алдаанаас сэргийлж)
function DropdownMenuSeparator() {
	return <div className="h-px bg-muted my-1" />;
}
