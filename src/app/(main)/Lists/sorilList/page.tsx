"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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

export default function Sorillists() {
	const { userId } = useAuthStore();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<Tab>("all");
	const [selectedLessonId, setSelectedLessonId] = useState<number>(0);
	const [showPaymentDialog, setShowPaymentDialog] = useState(false);
	const [selectedSoril, setSelectedSoril] = useState<SorillistsData | null>(
		null,
	);

	const SKELETON_KEYS = Array.from({ length: 8 }, (_, i) => `skeleton-${i}`);

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

	const data = useMemo(() => queryData?.RetData || [], [queryData]);
	const lessons = useMemo(() => lessonData?.RetData || [], [lessonData]);

	const openSorils = useMemo(
		() => data.filter((e) => e.isopensoril === 1),
		[data],
	);

	// ✅ Tab-д тохируулж харуулах өгөгдөл
	const filteredData = useMemo(() => {
		return activeTab === "open" ? openSorils : data;
	}, [activeTab, data, openSorils]);

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

				{/* ✅ Tab switch */}
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
					<div className="text-center py-12 space-y-3">
						<AlertCircle
							className="mx-auto text-gray-400 dark:text-gray-600"
							size={48}
						/>
						<p className="text-lg font-medium text-gray-700 dark:text-gray-300">
							Сорил олдсонгүй
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{activeTab === "open"
								? selectedLessonId === 0
									? "Одоогоор нээлттэй сорил байхгүй байна."
									: `${lessons.find((l) => l.lesson_id === selectedLessonId)?.lesson_name || "Энэ хичээл"}-д нээлттэй сорил байхгүй байна.`
								: "Танд одоогоор сорил байхгүй байна."}
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
		<div className="w-full aspect-5/2 bg-slate-200 dark:bg-slate-800 relative">
			<div className="absolute top-2 left-2 flex flex-col gap-2">
				<div className="h-5 w-16 bg-slate-300 dark:bg-slate-700 rounded-full" />
			</div>
			<div className="absolute bottom-2 left-2">
				<div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
			</div>
		</div>
		<div className="flex flex-col grow p-2 gap-2">
			<div className="space-y-2">
				<div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
				<div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
			</div>
			<div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between">
				<div className="flex gap-2">
					<div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
					<div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
				</div>
				<div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800" />
			</div>
		</div>
	</div>
);
