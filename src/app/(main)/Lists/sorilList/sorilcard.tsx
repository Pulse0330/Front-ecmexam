"use client";

import { motion } from "framer-motion";
import {
	ArrowRight,
	ClipboardCheck,
	Clock,
	FileText,
	Lock,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SorillistsData } from "@/types/soril/sorilLists";

interface SorilCardProps {
	exam: SorillistsData;
	onClick?: () => void;
}

export const SorilCard: React.FC<SorilCardProps> = ({ exam, onClick }) => {
	const formatDate = (dateStr: string | Date) => {
		try {
			const date = new Date(dateStr);
			if (Number.isNaN(date.getTime())) return "Огноо тодорхойгүй";

			const mongoliaDate = new Date(
				date.toLocaleString("en-US", {
					timeZone: "Asia/Ulaanbaatar",
				}),
			);

			const year = mongoliaDate.getFullYear();
			const month = mongoliaDate.getMonth() + 1;
			const day = mongoliaDate.getDate();

			return `${year}/${month}/${day}`;
		} catch {
			return "Огноо тодорхойгүй";
		}
	};

	const isCompleted = exam.isguitset === 1;
	const isLocked =
		!isCompleted &&
		exam.ispay === 1 &&
		exam.paid === 0 &&
		exam.isopensoril === 0;
	const _isPaidAndUnlocked = exam.ispay === 1 && exam.paid === 1;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="h-full"
		>
			{/* Нүүр хуудасны сорилын карттай ижил загвар */}
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={onClick}
						aria-label={`${exam.soril_name} сорил ${isLocked ? "(Төлбөр шаардлагатай)" : "нээх"}`}
						className={`group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
							isLocked
								? "border-amber-500/40 hover:border-amber-500/70"
								: "hover:border-primary/40"
						}`}
					>
						{/* Зураг */}
						<div className="relative aspect-5/2 w-full shrink-0 bg-muted">
							{exam.filename ? (
								<Image
									src={exam.filename}
									alt={exam.soril_name}
									fill
									className={`object-cover ${isLocked ? "brightness-75" : ""}`}
									sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
									quality={90}
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary">
									<FileText className="size-7" />
								</div>
							)}

							{isLocked && (
								<span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
									<Lock className="size-3" />
									Төлбөртэй
								</span>
							)}
						</div>

						{/* Агуулга */}
						<div className="flex flex-1 flex-col gap-2 p-3">
							<h3 className="line-clamp-3 flex-1 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
								{exam.soril_name}
							</h3>

							<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
								<span className="inline-flex items-center gap-1">
									<Clock className="size-3.5 shrink-0" />
									{exam.minut > 0 ? `${exam.minut} мин` : "Хугацаагүй"}
								</span>
								<span className="inline-flex items-center gap-1">
									<ClipboardCheck className="size-3.5 shrink-0" />
									{exam.que_cnt} асуулт
								</span>
							</div>

							<span
								className={`mt-1 inline-flex items-center gap-1 text-sm font-medium ${
									isLocked
										? "text-amber-600 dark:text-amber-400"
										: "text-primary"
								}`}
							>
								{isLocked ? (
									<>
										<Lock className="size-3.5" />
										Эрх авах
									</>
								) : (
									<>
										Сорил өгөх
										<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
									</>
								)}
							</span>
						</div>
					</button>
				</TooltipTrigger>
				<TooltipContent className="max-w-xs">
					<p>{exam.soril_name}</p>
					<p className="mt-1 text-muted-foreground">
						Сорилын огноо: {formatDate(exam.sorildate)}
					</p>
					{isLocked && (
						<p className="mt-1 text-amber-500">Төлбөр төлөх шаардлагатай</p>
					)}
					{isCompleted && <p className="mt-1 text-green-500">Гүйцэтгэсэн</p>}
				</TooltipContent>
			</Tooltip>
		</motion.div>
	);
};
