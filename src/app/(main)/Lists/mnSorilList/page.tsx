"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardList, CreditCard, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import LessonFilter from "@/components/LessonFilter";
import { PageHeader } from "@/components/page/pageHeader";
import { EmptyState } from "@/components/page/pageStates";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getSorilFilteredlists, getTestFilter } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type {
	ApiSorillistsResponse,
	SorillistsData,
} from "@/types/soril/sorilLists";
import { SorilCard } from "./card";

type SorilCategory = "all" | "completed" | "notstarted";

interface Lesson {
	lesson_id: number;
	lesson_name: string;
	sort: number;
}

interface TestFilterResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: Lesson[];
}

export default function MnSorilLits() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [searchTerm, _setSearchTerm] = useState("");
	const [selectedCategory, _setSelectedCategory] =
		useState<SorilCategory>("all");
	const [selectedLessonId, setSelectedLessonId] = useState<number>(0); // 0 = Бүгд
	const [showPaymentDialog, setShowPaymentDialog] = useState(false);
	const [selectedSoril, setSelectedSoril] = useState<SorillistsData | null>(
		null,
	);

	const SKELETON_KEYS = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

	// Lesson filter API - хичээлийн жагсаалт
	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	// Soril list API - сонгосон хичээлээр шүүсэн сорилууд
	const { data: queryData, isPending } = useQuery<ApiSorillistsResponse>({
		queryKey: ["sorillists", userId, selectedLessonId],
		queryFn: () => getSorilFilteredlists(userId || 0, selectedLessonId),
		enabled: !!userId,
	});

	const data = useMemo(() => queryData?.RetData || [], [queryData]);
	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);

	const categorizedData = useMemo(() => {
		return {
			completed: data.filter((e) => e.isguitset === 1),
			notstarted: data.filter((e) => e.isguitset === 0),
		};
	}, [data]);

	// Filter логик: Category + Search (Lesson нь API-аас шууд ирнэ)
	const filteredData = useMemo(() => {
		let sorils = data;

		// 1. Сонгосон категорийн дагуу шүүх
		switch (selectedCategory) {
			case "all":
				sorils = data;
				break;
			case "completed":
				sorils = categorizedData.completed;
				break;
			case "notstarted":
				sorils = categorizedData.notstarted;
				break;
			default:
				sorils = data;
		}

		// 2. Хайлтын шүүлтүүр
		if (searchTerm.trim()) {
			sorils = sorils.filter(
				(soril) =>
					soril.soril_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(soril.plan_name || "")
						.toLowerCase()
						.includes(searchTerm.toLowerCase()),
			);
		}

		return sorils;
	}, [data, categorizedData, selectedCategory, searchTerm]);

	const handleSorilClick = useCallback(
		(soril: SorillistsData) => {
			const isAccessible = soril.isopensoril === 1 || soril.ispay === 1;

			if (!isAccessible) {
				setSelectedSoril(soril);
				setShowPaymentDialog(true);
				return;
			}
			router.push(`/soril/${soril.exam_id}`);
		},
		[router],
	);

	// Handle payment confirmation
	const handlePaymentConfirm = useCallback(() => {
		setShowPaymentDialog(false);
		router.push("/Lists/paymentCoureList");
	}, [router]);

	// Handle payment dialog close
	const handlePaymentCancel = useCallback(() => {
		setShowPaymentDialog(false);
		setSelectedSoril(null);
	}, []);

	return (
		<div className="w-full">
			<div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 sm:px-6 lg:px-8">
				<PageHeader
					title="Сорилын жагсаалт"
					description="Өөрийгөө шалгах сорилууд. Төлбөртэй сорилыг төлбөр төлсний дараа өгөх боломжтой."
					icon={ClipboardList}
				/>

				{selectedLessonId !== null && (
					<LessonFilter
						lessons={lessons}
						selectedLessonId={selectedLessonId}
						onLessonSelect={setSelectedLessonId}
					/>
				)}

				{/* Results Info */}
				{(searchTerm || selectedLessonId !== 0) && (
					<div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
						<Info className="size-4 shrink-0" aria-hidden />
						<span>
							<strong>{filteredData.length}</strong> сорил олдлоо
							{searchTerm && (
								<>
									{" "}
									&ldquo;<strong>{searchTerm}</strong>&rdquo; гэсэн хайлтаар
								</>
							)}
							{selectedLessonId !== 0 && (
								<>
									{" "}
									<strong>
										{
											lessons.find((l) => l.lesson_id === selectedLessonId)
												?.lesson_name
										}
									</strong>{" "}
									хичээлд
								</>
							)}
						</span>
					</div>
				)}

				{/* Soril Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 pb-4">
					{isPending
						? SKELETON_KEYS.map((key) => <SkeletonCard key={key} />)
						: filteredData.map((soril) => (
								<SorilCard
									key={soril.exam_id}
									exam={soril}
									onClick={() => handleSorilClick(soril)}
								/>
							))}
				</div>

				{/* Empty State */}
				{!isPending && filteredData.length === 0 && (
					<EmptyState
						icon={ClipboardList}
						title="Сорил олдсонгүй"
						description={
							searchTerm
								? `"${searchTerm}" хайлтад тохирох сорил олдсонгүй.`
								: selectedLessonId === 0
									? "Танд одоогоор сорил байхгүй байна."
									: `${lessons.find((l) => l.lesson_id === selectedLessonId)?.lesson_name || "Энэ хичээл"}-д сорил байхгүй байна.`
						}
					/>
				)}
			</div>

			{/* Payment Dialog */}
			<Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Төлбөртэй сорил</DialogTitle>
						{/* asChild нэмснээр DialogDescription нь доорх <div>-ээр солигдоно */}
						<DialogDescription asChild className="pt-4 space-y-2">
							<div className="text-muted-foreground text-sm">
								<div className="font-semibold text-foreground">
									{selectedSoril?.soril_name}
								</div>
								Энэхүү сорил төлбөртэй юм. Үргэлжлүүлэхийн тулд төлбөр төлөх
								шаардлагатай.
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
						<Button
							type="button"
							variant="outline"
							onClick={handlePaymentCancel}
							className="h-10"
						>
							Болих
						</Button>
						<Button
							type="button"
							onClick={handlePaymentConfirm}
							className="h-10"
						>
							<CreditCard className="size-4" aria-hidden />
							Төлбөрийн хуудас руу очих
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

// Skeleton Card Component
const SkeletonCard = () => (
	<div className="flex h-full w-full animate-pulse flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
		<div className="aspect-[5/2] w-full bg-muted" />
		<div className="space-y-3 p-4">
			<div className="h-5 w-20 rounded-full bg-muted" />
			<div className="h-4 w-full rounded bg-muted" />
			<div className="h-4 w-2/3 rounded bg-muted" />
			<div className="h-10 w-full rounded-md bg-muted" />
		</div>
	</div>
);

// Category Badge Component
interface CategoryBadgeProps {
	active: boolean;
	onClick: () => void;
	count: number;
	label: string;
	variant: SorilCategory;
	icon?: React.ReactNode;
}

const _CategoryBadge: React.FC<CategoryBadgeProps> = React.memo(
	function CategoryBadge({ active, onClick, count, label, variant, icon }) {
		const getStyle = () => {
			if (!active)
				return "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700";

			switch (variant) {
				case "all":
					return "";
				case "notstarted":
					return "";
				case "completed":
					return "";
				default:
					return "";
			}
		};

		return (
			<Button
				type="button"
				onClick={onClick}
				className={cn(
					"inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200",
					getStyle(),
					active ? "scale-105" : "hover:scale-102",
				)}
				aria-label={`${label} категори сонгох`}
				aria-pressed={active}
			>
				{icon && <span className="shrink-0">{icon}</span>}
				<span>{label}</span>
				<span
					className={cn(
						"ml-1 px-2 py-0.5 rounded-full text-xs font-bold",
						active
							? "bg-white/30 text-white"
							: "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
					)}
				>
					{count}
				</span>
			</Button>
		);
	},
);
