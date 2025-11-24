"use client";

import { ArrowRight, Calendar, Clock, Lock, Timer, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ExamRulesDialog from "./dialog";

interface ExamlistsData {
	exam_id: number;
	title: string;
	ognoo: string;
	exam_minute: number;
	help: string;
	teach_name: string;
	exam_type: number;
	flag_name: string;
	flag: number;
	que_cnt: number;
	ispaydescr: string;
	amount: number;
	ispay: number;
	ispurchased: number;
	ispurchaseddescr: string;
	bill_type: number;
	plan_id: number | null;
	plan_name: string | null;
}

interface ExamCardProps {
	exam: ExamlistsData;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam }) => {
	const router = useRouter();
	const [showRulesDialog, setShowRulesDialog] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const updateWidth = () => setIsMobile(window.innerWidth < 640);
		updateWidth();
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, []);

	const handleStartExam = () => {
		router.push(`/exam/${exam.exam_id}`);
	};

	// flag field-ээс статус тодорхойлох
	const getStatusConfig = () => {
		if (exam.flag === 1) {
			return {
				label: exam.flag_name, // "Эхлүүлэх"
				bgColor: "bg-gradient-to-br from-emerald-500 to-teal-600",
				borderColor: "border-emerald-400/50",
				glowColor: "shadow-emerald-500/20",
				badgeBg: "bg-emerald-100 dark:bg-emerald-900/30",
				badgeText: "text-emerald-700 dark:text-emerald-300",
				iconColor: "text-emerald-600 dark:text-emerald-400",
				canStart: true,
			};
		}
		if (exam.flag === 2) {
			return {
				label: exam.flag_name, // "Хугацаа дууссан"
				bgColor: "bg-gradient-to-br from-gray-500 to-slate-600",
				borderColor: "border-gray-400/50",
				glowColor: "shadow-gray-500/10",
				badgeBg: "bg-gray-100 dark:bg-gray-900/30",
				badgeText: "text-gray-700 dark:text-gray-400",
				iconColor: "text-gray-600 dark:text-gray-400",
				canStart: false,
			};
		}
		// Бусад flag утгууд
		return {
			label: exam.flag_name,
			bgColor:
				"bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
			borderColor: "border-blue-300/50 dark:border-blue-700/50",
			glowColor: "shadow-blue-500/10",
			badgeBg: "bg-blue-100 dark:bg-blue-900/30",
			badgeText: "text-blue-700 dark:text-blue-300",
			iconColor: "text-blue-600 dark:text-blue-400",
			canStart: false,
		};
	};

	const status = getStatusConfig();

	const handleCardClick = () => {
		// Зөвхөн flag === 1 үед dialog нээх
		if (status.canStart) {
			setShowRulesDialog(true);
		}
	};

	return (
		<>
			<Card
				className={cn(
					"group relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
					status.borderColor,
					status.glowColor,
					status.canStart
						? "hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
						: "opacity-75 cursor-not-allowed",
					"bg-white dark:bg-gray-900",
				)}
				onClick={handleCardClick}
			>
				<div
					className={cn(
						"absolute inset-0 opacity-5 dark:opacity-10",
						status.bgColor,
					)}
				/>

				{exam.flag === 1 && (
					<div className="absolute inset-0 rounded-2xl">
						<div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-0" />
					</div>
				)}

				{/* Хугацаа дууссан overlay */}
				{!status.canStart && (
					<div className="absolute inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[0.5px] z-10 rounded-2xl" />
				)}

				<div className="relative p-6 space-y-4">
					<div className="flex items-start justify-between gap-3">
						<div className="flex-1 min-w-0">
							<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 h-14">
								{exam.title}
							</h2>
						</div>
						<span
							className={cn(
								"shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full",
								"backdrop-blur-sm border",
								status.badgeBg,
								status.badgeText,
								"border-white/20 dark:border-gray-800/20",
							)}
						>
							{status.label}
						</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="flex items-center gap-2.5 text-sm">
							<div className={cn("p-2 rounded-lg", status.badgeBg)}>
								<User size={16} className={status.iconColor} />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
									Багш
								</p>
								<p className="font-medium text-gray-900 dark:text-gray-100 truncate">
									{exam.teach_name}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2.5 text-sm">
							<div className={cn("p-2 rounded-lg", status.badgeBg)}>
								<Timer size={16} className={status.iconColor} />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
									Хугацаа
								</p>
								<p className="font-medium text-gray-900 dark:text-gray-100">
									{exam.exam_minute} минут
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2.5 text-sm">
							<div className={cn("p-2 rounded-lg", status.badgeBg)}>
								<Calendar size={16} className={status.iconColor} />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
									Огноо, цаг
								</p>
								<p className="font-medium text-gray-900 dark:text-gray-100">
									{exam.ognoo}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2.5 text-sm">
							<div className={cn("p-2 rounded-lg", status.badgeBg)}>
								<Clock size={16} className={status.iconColor} />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
									Төлөв
								</p>
								<p className="font-medium text-gray-900 dark:text-gray-100">
									{exam.ispaydescr}
								</p>
							</div>
						</div>
					</div>

					<Button
						type="button"
						disabled={!status.canStart}
						className={cn(
							"w-full h-12 rounded-xl font-semibold text-base",
							"transition-all duration-300",
							"group/btn relative overflow-hidden",
							status.canStart
								? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30"
								: "bg-gray-400 dark:bg-gray-700 text-gray-200 dark:text-gray-500 cursor-not-allowed",
						)}
					>
						<span className="relative z-10 flex items-center justify-center gap-2">
							{status.canStart ? (
								<>
									Шалгалт эхлүүлэх
									<ArrowRight
										size={20}
										className="transition-transform duration-300 group-hover/btn:translate-x-1"
									/>
								</>
							) : (
								<>
									<Lock size={20} />
									{status.label}
								</>
							)}
						</span>
						{status.canStart && (
							<div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
						)}
					</Button>
				</div>
			</Card>

			{status.canStart && (
				<ExamRulesDialog
					open={showRulesDialog}
					onOpenChange={setShowRulesDialog}
					onConfirm={handleStartExam}
					isMobile={isMobile}
				/>
			)}
		</>
	);
};

export default ExamCard;
