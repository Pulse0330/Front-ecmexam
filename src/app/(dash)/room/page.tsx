"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Building,
	DoorOpen,
	Edit,
	Loader2,
	MapPin,
	Monitor,
	MoreVertical,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { number } from "zod";
import { RoomCreateEditDialog } from "@/app/(dash)/room/RoomCreateEditDialog";
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
				room_number: "",
				num_of_pc: 0,
				school_esis_id: "",
			};
			return roomCreateEdit(payload);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["api_get_exam_rooms"] });
			setIsDeleteOpen(false);
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
		<div className="py-6 max-w-7xl mx-auto">
			{/* 1. Header - Үргэлж харагдана */}
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b pb-6">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
						<div className="bg-primary/10 p-2 rounded-lg text-primary">
							<DoorOpen size={24} />
						</div>
						Шалгалтын өрөөнүүд
					</h1>
					<p className="text-sm text-muted-foreground mt-1 font-medium">
						{isLoading
							? "Өрөөний мэдээллийг шалгаж байна..."
							: `Нийт ${data?.length || 0} өрөө бүртгэгдсэн байна.`}
					</p>
				</div>
				<Button
					onClick={() => {
						setSelectedRoomId(null);
						setIsOpen(true);
					}}
					className="gap-2 shadow-sm"
				>
					<Plus size={18} />
					Шинэ өрөө нэмэх
				</Button>
			</header>
			{/* 2. Content Area */}
			{isLoading ? (
				// Ачаалж байх үед Skeleton харуулна
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i} className="flex flex-col h-[280px]">
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
							className="relative flex flex-col justify-between border shadow-sm hover:ring-2 hover:ring-primary/10 hover:border-primary/30 transition-all duration-300 gap-3 h-86"
						>
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start">
									<div>
										<p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
											Өрөөний дугаар
										</p>
										<h2 className="text-3xl font-black tabular-nums text-foreground">
											{room.room_number || "—"}
										</h2>
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 hover:bg-muted"
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
												className="text-destructive focus:text-destructive font-medium cursor-pointer"
												onClick={() => confirmDelete(room)}
											>
												<Trash2 className="mr-2 h-4 w-4 text-destructive" />{" "}
												Устгах
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>

							<CardContent className="flex flex-col gap-4 pb-2 justify-between  h-full">
								<div className="space-y-2">
									<div className="flex items-start gap-2.5">
										<Building className="text-primary mt-0.5" size={15} />
										<div className="min-w-0">
											<p className="text-[9px] leading-none text-muted-foreground uppercase font-bold tracking-tighter">
												Сургууль
											</p>
											<p className="text-sm font-semibold mt-0.5 truncate text-foreground/90">
												{room.name ? room.name : "-"}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-2.5">
										<MapPin className="text-primary mt-0.5" size={15} />
										<div className="min-w-0">
											<p className="text-[9px] leading-none text-muted-foreground uppercase font-bold tracking-tighter">
												Салбар
											</p>
											<p className="text-sm font-medium mt-0.5 truncate text-foreground/80">
												{room.branchname ? room.branchname : "-"}
											</p>
										</div>
									</div>
								</div>

								<div className="bg-muted/30 p-2 rounded-lg border border-border/50">
									<p className="text-[9px] leading-none text-muted-foreground uppercase font-bold mb-1.5">
										Тайлбар
									</p>
									<p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 italic">
										{room.description || "Нэмэлт тайлбар бүртгэгдээгүй байна."}
									</p>
								</div>
							</CardContent>

							<CardFooter className="pt-0">
								<Button
									variant="secondary"
									size="sm"
									className="h-8 text-[11px] font-bold w-full hover:bg-primary hover:text-primary-foreground transition-colors group"
									asChild
								>
									<Link href={`/room/${room.id}`}>
										<Monitor size={14} className="mr-2" />
										Ширээ зохион байгуулах
									</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-muted/5 animate-in fade-in zoom-in duration-300">
					<div className="rounded-full bg-primary/5 p-6 mb-4 ring-8 ring-primary/2">
						<DoorOpen className="h-12 w-12 text-primary/40" />
					</div>
					<h3 className="text-xl font-bold tracking-tight">
						Өрөө бүртгэгдээгүй байна
					</h3>
					<p className="text-muted-foreground text-sm max-w-[280px] text-center mt-2 font-medium">
						Шалгалт зохион байгуулахын тулд эхлээд өрөөний мэдээллээ оруулна уу.
					</p>
					<Button
						onClick={() => setIsOpen(true)}
						variant="outline"
						className="mt-6 gap-2 rounded-full px-6 shadow-sm"
					>
						<Plus size={16} /> Анхны өрөөг нэмэх
					</Button>
				</div>
			)}
			<RoomCreateEditDialog
				open={isOpen}
				setOpen={setIsOpen}
				roomID={selectedRoomId}
			/>
			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent className="w-sm">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 justify-center flex-col">
							<div className="bg-primary/10 p-2 rounded-lg text-primary">
								<Trash2 className=" text-destructive" />
							</div>
							<p>Өрөө устгах</p>
						</AlertDialogTitle>
						<AlertDialogDescription className="text-center">
							Та <span className="font-bold">{roomToDelete?.room_number}</span>{" "}
							дугаар өрөөг устгахдаа итгэлтэй байна уу?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex flex-col justify-end gap-2 pt-2">
						<Button
							onClick={(e) => {
								e.preventDefault();
								if (roomToDelete) deleteRoom(roomToDelete.id);
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full"
							disabled={isDeletePending}
						>
							{isDeletePending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Устгаж байна...
								</>
							) : (
								"Устгах"
							)}
						</Button>
						<Button
							disabled={isDeletePending}
							onClick={() => {
								setIsDeleteOpen(false);
							}}
							variant={"outline"}
							className="w-full"
						>
							Цуцлах
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
