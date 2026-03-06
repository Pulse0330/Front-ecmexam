"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Clock, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { getExamVariantslist } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { mnExamData, mnExamResponse } from "@/types/mnExam/mnExamList";
import { IconClick, IconClockPlay } from "@tabler/icons-react";

const ANIMATION_STAGGER = 0.04;

// ============================================================================
// HELPERS
// ============================================================================

function formatMNTime(dateString: string) {
  const date = new Date(dateString);

  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(date).replace("T", " ");
}

// ============================================================================
// EXAM CARD
// ============================================================================

interface ExamCardProps {
	item: mnExamData;
	index: number;
}

const ExamCard = memo(({ item, index }: ExamCardProps) => {
	const router = useRouter();

	const handleClick = useCallback(() => {
		router.push(`/exam/${item.exam_number}?exam_type=${item.exam_type}`);
	}, [router, item.exam_number, item.exam_type]);

	const startTime = formatMNTime(item.start_date);
	const endTime = formatMNTime(item.end_date);


	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * ANIMATION_STAGGER }}
			className="h-full"
		>
			<button
				type="button"
				onClick={handleClick}
				aria-label={`${item.name} шалгалт нээх`}
				className="group h-full w-full relative flex flex-col backdrop-blur-md cursor-pointer transition-all duration-500 ease-out rounded-lg sm:rounded-xl overflow-hidden text-left border border-border/40 bg-card/50 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20"
			>
				{/* Header */}
				<div className="relative w-full aspect-5/2 bg-muted shrink-0">
					<div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-background" />
					<div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/50 to-transparent" />

					{/* Duration */}
					<div className="absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 z-10">
						<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate block">
							{item.name}
						</span>
					</div>
				</div>

				{/* Content */}
<div className="p-1.5 sm:p-2 pb-6 sm:pb-7 flex flex-col flex-1 space-y-1">
  <h3 className="text-[9px] sm:text-[10px] font-semibold line-clamp-1 leading-tight transition-colors text-foreground group-hover:text-primary">
     Эхлэх: {startTime}
  </h3>
  <h3 className="text-[9px] sm:text-[10px] line-clamp-1 leading-tight transition-colors text-foreground group-hover:text-primary">
    Дуусах: {endTime}
  </h3>

  <div className="flex items-center gap-0.5 text-muted-foreground pt-0.5 border-t border-border/50">
    <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 shrink-0" />
    <span className="text-[7px] sm:text-[8px] font-medium">
      {item.duration} мин
    </span>
  </div>

  <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all duration-300 bg-muted/50 group-hover:bg-foreground group-hover:scale-110">
    <ArrowRight className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
  </div>
</div>
			</button>
		</motion.div>
	);
});

ExamCard.displayName = "ExamCard";

// ============================================================================
// SKELETON
// ============================================================================

function SkeletonCard() {
	return (
		<div className="rounded-lg sm:rounded-xl border border-border/40 bg-card/50 overflow-hidden animate-pulse">
			<div className="w-full aspect-5/2 bg-muted" />
			<div className="p-1.5 sm:p-2 md:p-2.5 space-y-2">
				<div className="h-3 bg-muted rounded w-3/4" />
				<div className="h-2 bg-muted rounded w-1/2" />
			</div>
		</div>
	);
}

// ============================================================================
// MAIN LIST
// ============================================================================

export default function MnExamList() {
	const { userId } = useAuthStore();

	const { data, isLoading, isError } = useQuery<mnExamResponse>({
		queryKey: ["getExamVariantslist", userId],
		queryFn: () => getExamVariantslist(userId || 0),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	if (isError) {
		return (
			<div className="flex flex-col items-center py-12 opacity-40">
				<HelpCircle className="w-10 h-10 mb-3 stroke-[1.5px]" />
				<p className="text-sm font-medium">Мэдээлэл татахад алдаа гарлаа</p>
			</div>
		);
	}

	if (!isLoading && !data?.RetData?.length) {
		return (
			<div className="flex flex-col items-center py-12 opacity-40">
				<HelpCircle className="w-10 h-10 mb-3 stroke-[1.5px]" />
				<p className="text-sm font-medium">
					Туршилтын шалгалт бүртгэгдээгүй байна
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 px-2">
			{isLoading
				? ["sk-0", "sk-1", "sk-2", "sk-3"].map((id) => (
						<SkeletonCard key={id} />
					))
				: data?.RetData.map((item, idx) => (
						<ExamCard
							key={`${item.exam_number}-${item.start_date}`}
							item={item}
							index={idx}
						/>
					))}
		</div>
	);
}
