"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ChevronDown,
	ChevronRight,
	ClipboardCopy,
	Copy,
	Eye,
	EyeOff,
	Filter,
	GraduationCap,
	Hash,
	Loader2,
	MoreVertical,
	Search,
	UserCheck,
	Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getStudents } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { StudentItem } from "@/types/dashboard/exam.types";

export default function RegisteredStudentsPage() {
	const { userId } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
		{},
	);
	const [visiblePasswords, setVisiblePasswords] = useState<
		Record<string, boolean>
	>({});

	const { data: students = [], isLoading } = useQuery({
		queryKey: ["api_get_students", userId],
		queryFn: () => getStudents({ userId: Number(userId) }),
		enabled: !!userId,
		select: (res) => res.RetData ?? [],
	});

	const groupsList = useMemo(() => {
		const unique = new Map();
		students.forEach((s) => {
			if (s.student_group_id) {
				unique.set(String(s.student_group_id), s.studentgroupname);
			}
		});
		return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
	}, [students]);

	const groupedData = useMemo(() => {
		let filtered = students.filter((s) =>
			`${s.last_name} ${s.first_name} ${s.register_number} ${s.examinee_number}`
				.toLowerCase()
				.includes(searchQuery.toLowerCase()),
		);

		if (selectedGroupId !== "all") {
			filtered = filtered.filter(
				(s) => String(s.student_group_id) === selectedGroupId,
			);
		}

		const groups: Record<string, { name: string; students: StudentItem[] }> =
			{};
		filtered.forEach((s) => {
			const gId = String(s.student_group_id);
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

	// Дата ачаалагдахад бүх группыг нээлттэй болгох
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (Object.keys(groupedData).length > 0) {
			const allExpanded = Object.keys(groupedData).reduce(
				(acc, gId) => {
					acc[gId] = true;
					return acc;
				},
				{} as Record<string, boolean>,
			);
			setExpandedGroups(allExpanded);
		}
	}, [students.length === 0, groupedData]); // Зөвхөн эхний удаа ачаалахад

	const toggleGroup = (groupId: string) => {
		setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
	};

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} хуулагдлаа`);
	};

	return (
		<div className="py-6 max-w-7xl mx-auto px-4 flex flex-col gap-6">
			{/* --- Header Section --- */}
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
				<div className="flex items-center gap-3">
					<div>
						<h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
							<div className="bg-primary/10 p-2 rounded-lg text-primary">
								<Users />
							</div>
							Бүртгүүлсэн суралцагчид
						</h1>
						<p className="text-sm text-muted-foreground font-medium mt-0.5">
							Шалгалт өгөхөөр бүртгэгдсэн нийт суралцагчдын жагсаалт. |{" "}
							{students.length} сурагч байна.
						</p>
					</div>
				</div>
			</header>

			{/* --- Filters Section --- */}
			<div className="flex flex-col md:flex-row gap-3 justify-between">
				<div className="relative flex-1 group max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
					<Input
						placeholder="Нэр, регистр, шалгуулагчийн дугаараар хайх..."
						className="pl-9  bg-card border-border shadow-sm rounded-xl focus-visible:ring-primary/20"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
					<SelectTrigger className="w-40 h-11 bg-card border-border shadow-sm rounded-xl">
						<div className="flex items-center gap-2">
							<Filter size={15} className="text-muted-foreground" />
							<SelectValue placeholder="Анги сонгох" />
						</div>
					</SelectTrigger>
					<SelectContent className="rounded-xl">
						<SelectItem value="all">Бүх анги</SelectItem>
						{groupsList.map((g) => (
							<SelectItem key={g.id} value={g.id}>
								{g.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* --- Main Table Area --- */}
			<div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
				<ScrollArea className="h-full">
					<Table>
						<TableHeader className="bg-muted/50 sticky top-0 z-20 backdrop-blur-md border-b">
							<TableRow className="hover:bg-transparent">
								<TableHead className="w-12 text-center"></TableHead>
								<TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground h-11">
									Анги / Групп
								</TableHead>
								<TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground h-11 text-center">
									Сурагчдын тоо
								</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={4} className="h-64 text-center">
										<div className="flex flex-col items-center justify-center gap-3">
											<Loader2 className="h-8 w-8 animate-spin text-primary" />
											<p className="text-xs font-medium text-muted-foreground tracking-wide">
												Дата ачаалж байна...
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : Object.keys(groupedData).length === 0 ? (
								<TableRow>
									<TableCell colSpan={3} className="h-64 text-center">
										<div className="flex flex-col items-center justify-center gap-4 py-10">
											<div className="rounded-full bg-primary/5 p-6 ring-8 ring-primary/2">
												<Users className="h-10 w-10 text-muted-foreground/40" />
											</div>
											<h3 className="text-lg font-bold tracking-tight">
												Илэрц олдсонгүй
											</h3>
										</div>
									</TableCell>
								</TableRow>
							) : (
								Object.entries(groupedData).map(([groupId, group]) => (
									<React.Fragment key={groupId}>
										{/* Group Row */}
										<TableRow
											className={`group cursor-pointer transition-all border-b border-border/40 ${
												expandedGroups[groupId]
													? "bg-primary/3"
													: "hover:bg-muted/40"
											}`}
											onClick={() => toggleGroup(groupId)}
										>
											<TableCell className="py-4">
												<div className="flex justify-center">
													{expandedGroups[groupId] ? (
														<ChevronDown size={18} className="text-primary" />
													) : (
														<ChevronRight
															size={18}
															className="text-muted-foreground"
														/>
													)}
												</div>
											</TableCell>
											<TableCell className="py-4">
												<div className="flex items-center gap-3">
													<span className="font-black text-sm text-foreground uppercase tracking-tight">
														{group.name}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-center py-4">
												<Badge
													variant="secondary"
													className="font-bold bg-background border border-border/60 text-xs px-3"
												>
													{group.students.length} суралцагч
												</Badge>
											</TableCell>
										</TableRow>

										{/* Nested Students Table */}
										{expandedGroups[groupId] && (
											<TableRow className="bg-muted/5 hover:bg-transparent">
												<TableCell colSpan={3} className="p-0 border-none">
													<div className="px-6 py-4 border-l-4 border-primary/20 bg-background/40 ml-4 my-2 rounded-r-2xl animate-in fade-in slide-in-from-top-2 duration-300">
														<div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
															<Table>
																<TableHeader className="bg-muted/30">
																	<TableRow className="h-9 hover:bg-transparent border-b">
																		<TableHead className="text-[9px] font-black uppercase text-muted-foreground pl-4 w-12">
																			#
																		</TableHead>
																		<TableHead className="text-[9px] font-black uppercase text-muted-foreground px-4">
																			Овог нэр / Регистр
																		</TableHead>
																		<TableHead className="text-[9px] font-black uppercase text-muted-foreground px-4">
																			Шалгуулагч №
																		</TableHead>
																		<TableHead className="text-[9px] font-black uppercase text-muted-foreground px-4">
																			Нэвтрэх нууц үг
																		</TableHead>
																		<TableHead className="text-[9px] font-black uppercase text-muted-foreground text-right pr-4">
																			Үйлдэл
																		</TableHead>
																	</TableRow>
																</TableHeader>
																<TableBody>
																	{group.students.map((student, idx) => (
																		<TableRow
																			key={student.examinee_number}
																			className="h-12 hover:bg-primary/[0.02] border-b border-border/40 last:border-0"
																		>
																			<TableCell className="pl-4 font-mono text-[10px] text-muted-foreground">
																				{idx + 1}
																			</TableCell>
																			<TableCell>
																				<div className="flex flex-col">
																					<span className="text-[13px] font-bold text-foreground leading-none mb-1">
																						{student.last_name}{" "}
																						{student.first_name}
																					</span>
																					<span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
																						{student.register_number}
																					</span>
																				</div>
																			</TableCell>
																			<TableCell>
																				<div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 border border-border/40 group/num cursor-default">
																					<Hash
																						size={10}
																						className="text-primary/60"
																					/>
																					<span className="text-[11px] font-black font-mono">
																						{student.examinee_number}
																					</span>
																				</div>
																			</TableCell>
																			<TableCell>
																				<div className="flex items-center gap-2 group/pw">
																					<div className="min-w-[80px] font-mono text-[12px]">
																						{visiblePasswords[
																							student.examinee_number
																						] ? (
																							<span className="text-primary font-bold">
																								{student.passwordauto}
																							</span>
																						) : (
																							<span className="text-muted-foreground/30">
																								••••••••
																							</span>
																						)}
																					</div>
																					<Button
																						variant="ghost"
																						size="icon"
																						className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
																						onClick={(e) => {
																							e.stopPropagation();
																							setVisiblePasswords((prev) => ({
																								...prev,
																								[student.examinee_number]:
																									!prev[
																										student.examinee_number
																									],
																							}));
																						}}
																					>
																						{visiblePasswords[
																							student.examinee_number
																						] ? (
																							<EyeOff size={13} />
																						) : (
																							<Eye size={13} />
																						)}
																					</Button>
																				</div>
																			</TableCell>
																			<TableCell className="text-right pr-4">
																				<DropdownMenu>
																					<DropdownMenuTrigger asChild>
																						<Button
																							variant="ghost"
																							size="icon"
																							className="h-8 w-8 rounded-lg"
																						>
																							<MoreVertical
																								size={14}
																								className="text-muted-foreground"
																							/>
																						</Button>
																					</DropdownMenuTrigger>
																					<DropdownMenuContent
																						align="end"
																						className="rounded-xl w-48"
																					>
																						<DropdownMenuItem
																							onClick={() =>
																								copyToClipboard(
																									student.examinee_number,
																									"Шалгуулагчийн дугаар",
																								)
																							}
																							className="text-xs cursor-pointer"
																						>
																							<ClipboardCopy className="mr-2 h-3.5 w-3.5" />{" "}
																							Дугаар хуулах
																						</DropdownMenuItem>
																						<DropdownMenuItem
																							onClick={() =>
																								copyToClipboard(
																									student.passwordauto,
																									"Нууц үг",
																								)
																							}
																							className="text-xs cursor-pointer"
																						>
																							<Copy className="mr-2 h-3.5 w-3.5" />{" "}
																							Нууц үг хуулах
																						</DropdownMenuItem>
																					</DropdownMenuContent>
																				</DropdownMenu>
																			</TableCell>
																		</TableRow>
																	))}
																</TableBody>
															</Table>
														</div>
													</div>
												</TableCell>
											</TableRow>
										)}
									</React.Fragment>
								))
							)}
						</TableBody>
					</Table>
				</ScrollArea>
			</div>
		</div>
	);
}
