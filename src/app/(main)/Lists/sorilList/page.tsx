"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	ClipboardList,
	CreditCard,
	Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import LessonFilter from "@/components/LessonFilter";
import { PageHeader } from "@/components/page/pageHeader";
import { EmptyState } from "@/components/page/pageStates";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
		() => data.filter((e) => e.isopensoril === 1 || e.paid === 1),
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
			console.log("Clicked soril:", JSON.stringify(soril, null, 2)); // ← нэм
			const isLocked =
				soril.isguitset !== 1 &&
				soril.isopensoril !== 1 &&
				soril.ispay === 1 &&
				soril.paid === 0;

			if (isLocked) {
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
			<div className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 sm:px-6 lg:px-8">
				<PageHeader
					title="Сорилын жагсаалт"
					description="Өөрийгөө шалгах сорилууд. Төлбөртэй сорилыг төлбөр төлсний дараа өгөх боломжтой."
					icon={ClipboardList}
				/>

				{/* Tab switch */}
				<div
					role="tablist"
					aria-label="Сорилын төрөл"
					className="mb-4 flex w-full gap-1 rounded-xl bg-muted p-1 sm:w-fit"
				>
					<button
						type="button"
						role="tab"
						aria-selected={activeTab === "all"}
						onClick={() => setActiveTab("all")}
						className={cn(
							"h-10 flex-1 px-5 rounded-lg text-sm font-semibold transition-all duration-200 sm:flex-none",
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
						role="tab"
						aria-selected={activeTab === "open"}
						onClick={() => setActiveTab("open")}
						className={cn(
							"h-10 flex-1 px-5 rounded-lg text-sm font-semibold transition-all duration-200 sm:flex-none",
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
									? "bg-green-500/10 text-green-700 dark:text-green-400"
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
					<div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
						<Info className="size-4 shrink-0" aria-hidden />
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
				<div className="grid grid-cols-2 content-start gap-3 pb-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
					<nav
						aria-label="Хуудаслалт"
						className="mt-8 mb-10 flex items-center justify-center gap-2"
					>
						<Button
							variant="outline"
							size="icon"
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="size-10 shrink-0 rounded-full"
							aria-label="Өмнөх хуудас"
						>
							<ChevronLeft size={18} />
						</Button>

						<div className="flex min-w-0 flex-wrap items-center justify-center gap-1">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => (
									<Button
										key={page}
										variant={currentPage === page ? "default" : "ghost"}
										size="sm"
										onClick={() => setCurrentPage(page)}
										className="size-10 rounded-full"
										aria-current={currentPage === page ? "page" : undefined}
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
							className="size-10 shrink-0 rounded-full"
							aria-label="Дараах хуудас"
						>
							<ChevronRight size={18} />
						</Button>
					</nav>
				)}

				{/* Empty State */}
				{!isPending && filteredData.length === 0 && (
					<EmptyState
						icon={ClipboardList}
						title="Сорил олдсонгүй"
						description={
							activeTab === "open"
								? "Нээлттэй сорил алга. «Бүгд» табыг сонгож бүх сорилыг харна уу."
								: "Одоогоор сорил алга. Өөр хичээл сонгож үзнэ үү."
						}
					/>
				)}
			</div>

			{/* Payment Dialog */}
			<Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Төлбөртэй сорил</DialogTitle>
						<DialogDescription asChild>
							<div className="pt-4 space-y-2">
								<span className="block font-medium">
									{selectedSoril?.soril_name}
								</span>
								<span className="block">
									Энэхүү сорил төлбөртэй юм. Үргэлжлүүлэхийн тулд төлбөр төлөх
									шаардлагатай.
								</span>
							</div>
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
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
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

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
