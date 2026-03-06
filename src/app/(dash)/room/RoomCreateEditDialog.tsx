import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlignLeft,
	Building,
	DoorOpen,
	Loader2,
	MapPin,
	Monitor,
} from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getRoomById, roomCreateEdit } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";

const roomSchema = z.object({
	id: z.number().optional(),
	name: z.string().min(1, "Сургуулийн нэр заавал хэрэгтэй"),
	branchname: z.string().optional(),
	room_number: z.string().min(1, "Өрөөний дугаар заавал хэрэгтэй"),
	descr: z.string().optional(),
	pccount: z.string().min(1, "Компьютерын тоо заавал хэрэгтэй"),
	school_esis_id: z.string().optional(),
	esisroomid: z.number().optional(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

export function RoomCreateEditDialog({
	open,
	setOpen,
	roomID,
}: {
	open: boolean;
	setOpen: (val: boolean) => void;
	roomID: number | null;
}) {
	const { userId } = useAuthStore();
	const queryClient = useQueryClient();
	const isEdit = !!roomID && roomID > 0;

	const form = useForm<RoomFormValues>({
		resolver: zodResolver(roomSchema),
		defaultValues: {
			id: roomID ?? 0,
			name: "",
			branchname: "",
			room_number: "",
			descr: "",
			pccount: "",
			school_esis_id: "",
		},
	});

	const mutation = useMutation({
		mutationFn: async (values: RoomFormValues) => {
			const payload = {
				...values,
				id: roomID ?? 0,
				optype: roomID ? 1 : 0,
				userid: Number(userId),
				branchname: values.branchname ?? "",
				descr: values.descr ?? "",
				num_of_pc: Number(values.pccount),
				school_esis_id: values.school_esis_id ?? "",
				esisroomid: String(values.esisroomid) ?? "",
			};

			return roomCreateEdit(payload);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["api_get_exam_rooms"] });
			setOpen(false);
			form.reset();
		},
	});

	const { data: roomDetail } = useQuery({
		queryKey: ["room-detail", roomID],
		queryFn: () =>
			getRoomById({ userId: Number(userId), roomid: Number(roomID) }),
		select: (res) => res.RetData[0],
		enabled: !!roomID && !!userId,
	});

	useEffect(() => {
		if (roomDetail && isEdit) {
			form.reset({
				id: roomDetail.id,
				name: roomDetail.name,
				branchname: roomDetail.branchname,
				room_number: roomDetail.room_number,
				descr: roomDetail.description,
				pccount: String(roomDetail.num_of_pc),
				school_esis_id: roomDetail.school_esis_id,
				esisroomid: roomDetail.esisroomid,
			});
		}
	}, [roomDetail, isEdit, form.reset]);

	return (
		<Dialog
			open={open}
			onOpenChange={(val) => {
				setOpen(val);
				if (!val) form.reset();
			}}
		>
			<DialogContent className="sm:max-w-md">
				<form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
					<DialogHeader>
						<DialogTitle>{isEdit ? "Өрөө засах" : "Өрөө бүртгэх"}</DialogTitle>
						<DialogDescription>Мэдээллээ бүрэн оруулна уу.</DialogDescription>
					</DialogHeader>

					<FieldGroup className="mt-4 gap-3">
						<Controller
							name="branchname"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Хичээлийн байр </FieldLabel>
									<div className="relative ">
										<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											{...field}
											className="pl-9"
											placeholder="Хичээлийн байр "
										/>
									</div>
									{fieldState.invalid && (
										<FieldError>{fieldState.error?.message}</FieldError>
									)}
								</Field>
							)}
						/>
						{/* Name Field */}
						<Controller
							name="name"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Шалгалт авах өрөөний нэр</FieldLabel>
									<div className="relative ">
										<Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											{...field}
											className="pl-9"
											aria-invalid={fieldState.invalid}
											placeholder="Шалгалт авах өрөөний нэр"
										/>
									</div>
									{fieldState.invalid && (
										<FieldError>{fieldState.error?.message}</FieldError>
									)}
								</Field>
							)}
						/>

						{/* Room Number Field */}
						<Controller
							name="room_number"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Өрөөний дугаар </FieldLabel>
									<div className="relative ">
										<DoorOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											{...field}
											className="pl-9"
											type="num"
											aria-invalid={fieldState.invalid}
											placeholder="Өрөөний дугаар"
										/>
									</div>
									{fieldState.invalid && (
										<FieldError>{fieldState.error?.message}</FieldError>
									)}
								</Field>
							)}
						/>

						{/* Branch Name Field */}

						<Controller
							name="pccount"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Компьютер / Төхөөрөмжийн тоо</FieldLabel>
									<div className="relative ">
										<Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											{...field}
											className="pl-9"
											type="number"
											aria-invalid={fieldState.invalid}
											placeholder="Компьютер / Төхөөрөмжийн тоо"
											min={isEdit ? roomDetail?.num_of_pc : 1}
											onChange={(e) => {
												field.onChange(e.target.value); // чөлөөтэй бичнэ
											}}
											onBlur={(e) => {
												const val = Number(e.target.value);
												const minVal = isEdit
													? (roomDetail?.num_of_pc ?? 1)
													: 1;
												if (val < minVal) {
													field.onChange(String(minVal)); // blur дээр засна
													toast.warning(
														"Бүртгэсэн өрөө засах одоогоор боломжгүй байгаа тул та өрөөгөө түр хааж шинээр өрөө бүртгэнэ үү.",
													);
												}
												field.onBlur();
											}}
										/>
									</div>
									{fieldState.invalid && (
										<FieldError>{fieldState.error?.message}</FieldError>
									)}
								</Field>
							)}
						/>

						{/* Description Field */}
						<Controller
							name="descr"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Тайлбар</FieldLabel>
									<div className="relative ">
										<AlignLeft className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
										<Textarea
											{...field}
											className="pl-9 min-h-20 resize-none"
											placeholder="Өрөөний дэлгэрэнгүй..."
										/>
									</div>
									{fieldState.invalid && (
										<FieldError>{fieldState.error?.message}</FieldError>
									)}
								</Field>
							)}
						/>
					</FieldGroup>

					<DialogFooter className="mt-6">
						<DialogClose asChild>
							<Button type="button" variant="ghost">
								Цуцлах
							</Button>
						</DialogClose>
						<Button type="submit" disabled={mutation.isPending}>
							{mutation.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Хадгалах"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
