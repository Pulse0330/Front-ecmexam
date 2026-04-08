"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import LessonFilter from "@/components/LessonFilter";
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
import { SorilCard } from "./sorilcard";

type Tab = "all" | "open";

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

// ✅ Нэг хуудсанд харуулах тоо
const ITEMS_PER_PAGE = 18;

export default function Sorillists() {
	const { userId } = useAuthStore();
	const router = useRouter();

	// States
	const [activeTab, setActiveTab] = useState<Tab>("all");
	const [selectedLessonId, setSelectedLessonId] = useState<number>(0);
	const [showPaymentDialog, setShowPaymentDialog] = useState(false);
	const [selectedSoril, setSelectedSoril] = useState<SorillistsData | null>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(1);

	const SKELETON_KEYS = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

	// Queries
	const { data: lessonData } = useQuery<TestFilterResponse>({
		queryKey: ["testFilter", userId],
		queryFn: () => getTestFilter(userId || 0),
		enabled: !!userId,
	});

	const { data: queryData, isPending } = useQuery<ApiSorillistsResponse>({
		queryKey: ["sorillists", userId, selectedLessonId],
		queryFn: () => getSorilFilteredlists(userId || 0, selectedLessonId),
		enabled: !!userId,
	});

	// Memos
	const data = useMemo(() => queryData?.RetData || [], [queryData]);
	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);

	const openSorils = useMemo(
		// Зөвхөн isopensoril биш, төлбөр нь төлөгдсөн (ispay) сорилуудыг нээлттэй гэж үзнэ
		() => data.filter((e) => e.isopensoril === 1 || e.ispay === 1),
		[data],
	);

	// ✅ Tab-аар шүүгдсэн өгөгдөл
	const filteredData = useMemo(() => {
		return activeTab === "open" ? openSorils : data;
	}, [activeTab, data, openSorils]);

	// ✅ Одоогийн хуудсанд харагдах өгөгдлийг таслаж авах (Pagination Logic)
	const paginatedData = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [filteredData, currentPage]);

	const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

	// ✅ Шүүлтүүр өөрчлөгдөхөд хуудсыг 1 рүү буцаах
	useEffect(() => {
		setCurrentPage(1);
	}, []);
	// Handlers
	const handleSorilClick = useCallback(
		(soril: SorillistsData) => {
			if (soril.isopensoril !== 1) {
				setSelectedSoril(soril);
				setShowPaymentDialog(true);
				return;
			}
			router.push(`/soril/${soril.exam_id}`);
		},
		[router],
	);

	const handlePaymentConfirm = useCallback(() => {
		setShowPaymentDialog(false);
		router.push("/Lists/paymentCoureList");
	}, [router]);

	const handlePaymentCancel = useCallback(() => {
		setShowPaymentDialog(false);
		setSelectedSoril(null);
	}, []);

	return (
		<div className="w-full">
			<div className="mx-auto flex flex-col px-3 sm:px-8 lg:px-8 py-4 sm:py-8 lg:py-8">
				{/* Header */}
				<header className="mb-4 sm:mb-6">
					<h3 className="text-lg sm:text-2xl font-extrabold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
						Сорилын жагсаалт
					</h3>
				</header>

				{/* Tab switch */}
				<div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-4">
					<button
						type="button"
						onClick={() => setActiveTab("all")}
						className={cn(
							"px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
							activeTab === "all"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Бүгд
						<span
							className={cn(
								"ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
								activeTab === "all"
									? "bg-primary/10 text-primary"
									: "bg-muted-foreground/20 text-muted-foreground",
							)}
						>
							{data.length}
						</span>
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("open")}
						className={cn(
							"px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
							activeTab === "open"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Нээлттэй
						<span
							className={cn(
								"ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
								activeTab === "open"
									? "bg-green-500/10 text-green-600"
									: "bg-muted-foreground/20 text-muted-foreground",
							)}
						>
							{openSorils.length}
						</span>
					</button>
				</div>

				<LessonFilter
					lessons={lessons}
					selectedLessonId={selectedLessonId}
					onLessonSelect={setSelectedLessonId}
				/>

				{/* Results Info */}
				{selectedLessonId !== 0 && (
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
						<AlertCircle size={16} />
						<span>
							<strong>{filteredData.length}</strong> сорил —{" "}
							<strong>
								{
									lessons.find((l) => l.lesson_id === selectedLessonId)
										?.lesson_name
								}
							</strong>{" "}
							хичээлд
						</span>
					</div>
				)}

				{/* Soril Grid - paginatedData ашиглав */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 pb-4 content-start">
					{isPending
						? SKELETON_KEYS.map((key) => <SkeletonCard key={key} />)
						: paginatedData.map((soril) => (
								<SorilCard
									key={soril.exam_id}
									exam={soril}
									onClick={() => handleSorilClick(soril)}
								/>
							))}
				</div>

				{/* ✅ Pagination UI */}
				{!isPending && totalPages > 1 && (
					<div className="flex items-center justify-center gap-2 mt-8 mb-10">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="rounded-full"
						>
							<ChevronLeft size={18} />
						</Button>

						<div className="flex items-center gap-1">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => (
									<Button
										key={page}
										variant={currentPage === page ? "default" : "ghost"}
										size="sm"
										onClick={() => setCurrentPage(page)}
										className={cn(
											"w-9 h-9 rounded-full",
											currentPage === page && "shadow-md",
										)}
									>
										{page}
									</Button>
								),
							)}
						</div>

						<Button
							variant="outline"
							size="icon"
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="rounded-full"
						>
							<ChevronRight size={18} />
						</Button>
					</div>
				)}

				{/* Empty State */}
				{!isPending && filteredData.length === 0 && (
					<div className="text-center py-12 space-y-3">
						<AlertCircle
							className="mx-auto text-gray-400 dark:text-gray-600"
							size={48}
						/>
						<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
							Сорил олдсонгүй
						</p>
					</div>
				)}
			</div>

			{/* Payment Dialog */}
			<Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Төлбөртэй сорил</DialogTitle>
						<DialogDescription className="pt-4 space-y-2">
							{selectedSoril?.soril_name}
							<p>
								Энэхүү сорил төлбөртэй юм. Үргэлжлүүлэхийн тулд төлбөр төлөх
								шаардлагатай.
							</p>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-row gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={handlePaymentCancel}
							className="flex-1 sm:flex-none"
						>
							Цуцлах
						</Button>
						<Button
							type="button"
							onClick={handlePaymentConfirm}
							className="flex-1 sm:flex-none"
						>
							Төлбөр төлөх
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

const SkeletonCard = () => (
	<div className="h-full w-full flex flex-col overflow-hidden rounded-lg sm:rounded-xl border border-border/40 bg-card/50 backdrop-blur-md animate-pulse">
		<div className="w-full aspect-5/2 bg-slate-200 dark:bg-slate-800" />
		<div className="p-2 space-y-2">
			<div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
			<div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
		</div>
	</div>
);
