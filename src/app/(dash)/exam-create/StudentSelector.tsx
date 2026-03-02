"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudents } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { StudentItem } from "@/types/dashboard/exam.types";

// Сонгогдсон оюутны бүтцийг тодорхойлно
export interface SelectedStudent {
	id: number;
	examinee_number: string;
}

interface StudentSelectorProps {
	roomPCCount: number;

	selectedStudents: SelectedStudent[]; // Зөвхөн id биш объект массив
	onSelectChange: (students: SelectedStudent[]) => void;
}

export function StudentSelector({
	roomPCCount,
	selectedStudents,
	onSelectChange,
}: StudentSelectorProps) {
	const { userId } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGroupId, setSelectedGroupId] = useState<string>("all");

	// 1. Оюутнуудын жагсаалт авах
	const { data: students = [], isLoading } = useQuery({
		queryKey: ["api_get_students", userId],
		queryFn: () => getStudents({ userId: Number(userId) }),
		enabled: !!userId,
		select: (res) => res.RetData,
	});

	// 2. Өмнө нь тухайн өрөө/цаг дээр сонгогдсон байсан оюутнуудыг авах

	// 1. ШҮҮЛТҮҮР БОЛОН БҮЛЭГЛЭЛТ
	const groupedData = useMemo(() => {
		let filtered = students.filter((s) =>
			`${s.last_name} ${s.first_name} ${s.register_number}`
				.toLowerCase()
				.includes(searchQuery.toLowerCase()),
		);

		const currentSelectedGroupId = String(selectedGroupId); // Баталгаажуулалт

		if (currentSelectedGroupId !== "all") {
			filtered = filtered.filter(
				(s) => String(s.student_group_id) === currentSelectedGroupId,
			);
		}

		const groups: Record<string, { name: string; students: StudentItem[] }> =
			{};
		filtered.forEach((s) => {
			const gId = String(s.student_group_id); // ID-г string болгох
			if (!groups[gId]) {
				groups[gId] = {
					name: s.studentgroupname || "Тодорхойгүй",
					students: [],
				};
			}
			groups[gId].students.push(s);
		});

		return groups;
	}, [students, searchQuery, selectedGroupId]);

	const groupsList = useMemo(() => {
		const uniqueGroups = Array.from(
			new Set(
				students
					.filter((s) => s.student_group_id) // Зөвхөн ID-тайг нь шүүх
					.map((s) =>
						JSON.stringify({
							id: String(s.student_group_id), // String болгох
							name: s.studentgroupname,
						}),
					),
			),
		);
		return uniqueGroups.map((g) => JSON.parse(g));
	}, [students]);

	// 2. СОНГОЛТЫН ТУСЛАХ ФУНКЦҮҮД
	const isStudentSelected = (id: number) =>
		selectedStudents.some((s) => s.id === id);

	const toggleStudent = (student: StudentItem) => {
		if (isStudentSelected(student.id)) {
			onSelectChange(selectedStudents.filter((s) => s.id !== student.id));
		} else {
			onSelectChange([
				...selectedStudents,
				{ id: student.id, examinee_number: student.examinee_number },
			]);
		}
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			// Одоо харагдаж байгаа бүх оюутнуудыг бэлдэх
			const currentFilteredStudents: SelectedStudent[] = Object.values(
				groupedData,
			).flatMap((g) =>
				g.students.map((s) => ({
					id: s.id,
					examinee_number: s.examinee_number,
				})),
			);

			// Өмнө нь сонгогдсон байсан дээр шинээр харагдаж байгааг нэмээд давхардлыг арилгах
			const combined = [...selectedStudents];
			currentFilteredStudents.forEach((cs) => {
				if (!combined.some((s) => s.id === cs.id)) combined.push(cs);
			});
			onSelectChange(combined);
		} else {
			const currentFilteredIds = Object.values(groupedData).flatMap((g) =>
				g.students.map((s) => s.id),
			);
			onSelectChange(
				selectedStudents.filter((s) => !currentFilteredIds.includes(s.id)),
			);
		}
	};

	const handleGroupSelect = (groupId: string, checked: boolean) => {
		const groupStudents: SelectedStudent[] = groupedData[groupId].students.map(
			(s) => ({
				id: s.id,
				examinee_number: s.examinee_number,
			}),
		);

		if (checked) {
			const combined = [...selectedStudents];
			groupStudents.forEach((gs) => {
				if (!combined.some((s) => s.id === gs.id)) combined.push(gs);
			});
			onSelectChange(combined);
		} else {
			const groupIds = groupStudents.map((gs) => gs.id);
			onSelectChange(selectedStudents.filter((s) => !groupIds.includes(s.id)));
		}
	};

	const isOverCapacity = selectedStudents.length > roomPCCount;

	return (
		<div className="flex flex-col h-full bg-background">
			<div className="px-4 py-3 border-b space-y-3 bg-muted/10">
				<div className="flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Хайх..."
							className="pl-9 h-9 text-xs"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<Select
						value={selectedGroupId ? String(selectedGroupId) : "all"}
						onValueChange={setSelectedGroupId}
					>
						<SelectTrigger className="w-[110px] h-9 text-xs">
							<SelectValue placeholder="Анги" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Бүх анги</SelectItem>
							{groupsList?.map((g) => {
								// g.id байхгүй эсвэл хоосон бол Item үүсгэхгүй (Алдаанаас сэргийлнэ)
								if (!g.id || String(g.id).trim() === "") return null;

								return (
									<SelectItem
										key={g.id}
										value={String(g.id)}
										className="text-xs"
									>
										{g.name}
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center justify-between px-1">
					<div className="flex items-center gap-2">
						<Checkbox
							id="all"
							checked={
								Object.values(groupedData).flatMap((g) => g.students).length >
									0 &&
								Object.values(groupedData)
									.flatMap((g) => g.students)
									.every((s) => isStudentSelected(s.id))
							}
							onCheckedChange={handleSelectAll}
						/>
						<label
							htmlFor="all"
							className="text-[10px] font-black uppercase tracking-wider cursor-pointer"
						>
							Жагсаалтаар сонгох
						</label>
					</div>
					<Badge
						variant="secondary"
						className={`text-[10px] h-5 font-bold border-none transition-colors ${
							isOverCapacity
								? "bg-destructive/10 text-destructive" // Суудал хэтэрсэн үед улаан
								: "bg-primary/10 text-primary" // Хэвийн үед цэнхэр/ногоон (primary)
						}`}
					>
						Сонгосон: {selectedStudents.length} / {roomPCCount}
					</Badge>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto overflow-x-hidden">
				<div className="p-4 space-y-6">
					{isLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-10 w-full rounded-lg" />
							<Skeleton className="h-24 w-full rounded-lg" />
						</div>
					) : (
						Object.entries(groupedData).map(([groupId, group]) => {
							const isGroupAllSelected = group.students.every((s) =>
								isStudentSelected(s.id),
							);

							return (
								<div key={groupId} className="space-y-2">
									<div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg sticky top-0 z-10 backdrop-blur-sm">
										<Checkbox
											checked={isGroupAllSelected}
											onCheckedChange={(val) =>
												handleGroupSelect(groupId, !!val)
											}
										/>
										<span className="text-[11px] font-black text-primary uppercase">
											{group.name}
										</span>
										<span className="text-[10px] font-bold text-muted-foreground ml-auto">
											{group.students.length} сурагч
										</span>
									</div>

									<div className="grid gap-1 pl-1">
										{group.students.map((student) => {
											const isSelected = isStudentSelected(student.id);
											return (
												<Item
													key={student.id}
													onClick={() => toggleStudent(student)}
													className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
														isSelected
															? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/10"
															: "border-transparent hover:bg-muted/50"
													}`}
												>
													<Checkbox
														checked={isSelected}
														onCheckedChange={() => toggleStudent(student)}
														className="pointer-events-none"
													/>
													<div className="flex-1 min-w-0">
														<p
															className={`text-[13px] font-bold truncate leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}
														>
															{student.last_name.charAt(0)}.{" "}
															{student.first_name}
														</p>
														<div className="flex items-center gap-2 mt-0.5">
															<span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-tighter">
																{student.register_number}
															</span>
															<span className="text-[10px] text-muted-foreground/40">
																•
															</span>
															<span className="text-[10px] font-medium text-muted-foreground">
																{student.examinee_number}
															</span>
														</div>
													</div>
													{isSelected && (
														<CheckCircle2
															size={14}
															className="text-primary shrink-0 animate-in zoom-in"
														/>
													)}
												</Item>
											);
										})}
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
