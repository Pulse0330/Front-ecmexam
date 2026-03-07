"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	ClipboardCheck,
	Clock,
	Loader2,
	Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect } from "react";
import { ExamVerifyDialog } from "@/app/(main)/home/ExamVerify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	getHomeScreen,
	getMNPrint,
	getmnExamUserCheck,
	getUserProfile,
} from "@/lib/api";
import { getExamTime } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import type { Exam1111 } from "@/types/dashboard/exam.types";
import {
	formatSorilDate,
	type HomeResponseType,
	isSorilCompleted,
	type PastExam,
} from "@/types/home";
import type { UserProfileResponseType } from "@/types/user";
import { ExamInfoCard } from "./examBurtguulsen";
import ExamLists from "./homeExamCard";

const ANIMATION_STAGGER = 0.04;

// ============================================================================
// HERO SECTION
// ============================================================================

interface HeroSectionProps {
	username: string;
}

const HeroSection = memo(({ username }: HeroSectionProps) => (
	<div className="w-full">
		<div className="relative group overflow-hidden bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-500">
			<div className="relative px-5 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 flex flex-col md:flex-row items-center justify-between gap-5 lg:gap-6">
				<div className="flex-1 space-y-2 sm:space-y-3 text-center md:text-left max-w-xl">
					<div className="space-y-1">
						<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-light tracking-tight leading-tight">
							Сайн уу, <span className="font-medium">{username}</span>
						</h1>
						<p className="text-xs sm:text-sm lg:text-base font-light leading-relaxed max-w-md mx-auto md:mx-0">
							Өнөөдөр шинэ зүйл сурч, ур чадвараа хөгжүүлэхэд бэлэн үү?
						</p>
					</div>
					<div className="flex items-center gap-2 justify-center md:justify-start pt-0">
						<div className="h-px w-6 bg-linear-to-r from-transparent to-zinc-300 dark:to-zinc-700" />
						<span className="text-[10px] sm:text-[11px]">
							24/7 суралцах хөгжих боломж
						</span>
						<div className="h-px w-6 bg-linear-to-l from-transparent to-zinc-300 dark:to-zinc-700" />
					</div>
				</div>

				<div className="flex flex-col items-center md:items-end gap-2.5 sm:gap-3 w-full md:w-auto">
					<Link href="/Lists/paymentCoureList" className="w-full sm:w-auto">
						<Button className="w-full sm:min-w-[180px] h-10 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group shadow-md shadow-zinc-900/10 dark:shadow-zinc-50/5 border-0">
							<span className="flex items-center gap-2 font-medium text-sm tracking-wide">
								Сургалт үзэх
								<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
							</span>
						</Button>
					</Link>
				</div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-60" />
			<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-zinc-100/30 dark:from-zinc-900/30 to-transparent rounded-bl-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
		</div>
	</div>
));

HeroSection.displayName = "HeroSection";

// ============================================================================
// EXAM CARD — SorilCard стандарттай ижил
// ============================================================================

interface ExamCardProps {
	exam: PastExam;
	index: number;
}

function getExamLockStatus(exam: PastExam) {
	return exam.ispay === 1 && exam.isopensoril === 0;
}

const ExamCard = memo(
	({ exam, index }: ExamCardProps) => {
		const router = useRouter();
		const isCompleted = isSorilCompleted(exam.isguitset);
		const isLocked = getExamLockStatus(exam);

		const handleClick = useCallback(() => {
			router.push(
				isLocked ? "/Lists/paymentCoureList" : `/soril/${exam.exam_id}`,
			);
		}, [router, exam.exam_id, isLocked]);

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: index * ANIMATION_STAGGER }}
				className="h-full"
			>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={handleClick}
							aria-label={`${exam.soril_name} сорил ${isLocked ? "(Төлбөр шаардлагатай)" : "нээх"}`}
							className={`group h-full w-full relative flex flex-col backdrop-blur-md cursor-pointer transition-all duration-500 ease-out rounded-lg sm:rounded-xl overflow-hidden text-left ${
								isLocked
									? "border border-amber-500/40 bg-card/30 hover:shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/60"
									: "border border-border/40 bg-card/50 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20"
							}`}
						>
							{/* Image Header */}
							<div className="relative w-full aspect-5/2 bg-muted shrink-0">
								{exam.filename ? (
									<Image
										src={exam.filename}
										alt={exam.soril_name}
										fill
										className={`object-cover transition-all duration-700 ${isLocked ? "brightness-75 group-hover:brightness-90" : ""}`}
										sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
										quality={90}
									/>
								) : (
									<div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-background" />
								)}

								{isLocked && (
									<div className="absolute inset-0 flex items-center justify-center z-10">
										<div className="">
											<Lock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
										</div>
									</div>
								)}

								{/* Gradient Overlay */}
								<div className="absolute inset-0 bg-linear-to-t from-background/85 via-background/50 to-transparent" />

								{/* Status badge */}
								<div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20">
									{isLocked ? (
										<Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
											<Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
											Төлбөртэй
										</Badge>
									) : exam.isopensoril === 1 ? (
										<Badge className="bg-green-500/90 text-white hover:bg-green-600 border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
											Нээлттэй
										</Badge>
									) : isCompleted ? (
										<Badge className="bg-green-500/90 text-white border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
											<ClipboardCheck className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
											Гүйцэтгэсэн
										</Badge>
									) : (
										<Badge className="border-0 px-1 sm:px-1.5 md:px-2 py-0 text-[7px] sm:text-[8px] md:text-[9px] shadow-lg whitespace-nowrap">
											Гүйцэтгээгүй
										</Badge>
									)}
								</div>

								{/* Date */}
								<div className="absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 z-10">
									<div className="flex items-center gap-0.5 sm:gap-1">
										<Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
										<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
											{formatSorilDate(exam.sorildate)}
										</span>
									</div>
								</div>
							</div>

							{/* Content */}
							<div className="p-1.5 sm:p-2 md:p-2.5 pb-7 sm:pb-8 md:pb-9 flex flex-col flex-1 space-y-1 sm:space-y-1.5">
								<div className="space-y-0.5 flex-1 min-h-0">
									<h3
										className={`text-[10px] sm:text-xs md:text-sm font-semibold line-clamp-1 leading-tight transition-colors duration-300 ${
											isLocked
												? "text-foreground group-hover:text-amber-500"
												: "text-foreground group-hover:text-primary"
										}`}
									>
										{exam.soril_name}
									</h3>
								</div>

								{/* Stats */}
								<div className="flex items-center justify-between gap-1 sm:gap-1.5 pt-1 border-t border-border/50">
									<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
										<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
										<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
											{exam.minut > 0 ? `${exam.minut} мин` : "∞"}
										</span>
									</div>
									<div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground min-w-0">
										<ClipboardCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
										<span className="font-medium text-[8px] sm:text-[9px] md:text-xs truncate">
											{exam.que_cnt} асуулт
										</span>
									</div>
								</div>

								{/* Arrow — absolute, стандарттай ижил */}
								<div
									className={`absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 md:bottom-2.5 md:right-2.5 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
										isLocked
											? "bg-amber-500/20 group-hover:bg-amber-500 group-hover:scale-110"
											: "bg-muted/50 group-hover:bg-foreground group-hover:scale-110"
									}`}
								>
									{isLocked ? (
										<Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-amber-600 group-hover:text-white transition-all" />
									) : (
										<ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
									)}
								</div>
							</div>
						</button>
					</TooltipTrigger>
					<TooltipContent className="max-w-xs">
						<p>{exam.soril_name}</p>
						{isLocked && (
							<p className="text-amber-500 mt-1">Төлбөр төлөх шаардлагатай</p>
						)}
						{exam.isopensoril === 1 && (
							<p className="text-green-500 mt-1">Нээлттэй сорил</p>
						)}
					</TooltipContent>
				</Tooltip>
			</motion.div>
		);
	},
	(prev, next) => prev.exam === next.exam && prev.index === next.index,
);

ExamCard.displayName = "ExamCard";

// ============================================================================
// SORIL LIST
// ============================================================================

interface SorilListsProps {
	pastExams: PastExam[];
}

const SorilLists = memo(({ pastExams }: SorilListsProps) => {
	if (!pastExams?.length) {
		return (
			<div className="flex flex-col items-center py-24 opacity-40">
				<p className="font-bold tracking-tight">Сорил олдсонгүй</p>
			</div>
		);
	}

	return (
		<div className="px-2">
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 px-2">
				{pastExams.map((exam, index) => (
					<ExamCard key={exam.exam_id} exam={exam} index={index} />
				))}
			</div>
		</div>
	);
});

SorilLists.displayName = "SorilLists";

// ============================================================================
// SECTION DIVIDER
// ============================================================================

interface SectionDividerProps {
	title: string;
	href: string;
}

const SectionDivider = memo(({ title, href }: SectionDividerProps) => (
	<div className="py-4">
		<div className="w-full border-t border-border" />
		<div className="flex flex-col mt-4">
			<div className="flex justify-center">
				<span className="px-4 py-1.5 text-xs font-bold">{title}</span>
			</div>
			<div className="flex justify-end mt-2">
				<Link
					href={href}
					className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 hover:gap-2"
				>
					{/* <span className="group-hover:underline">Бүгдийг харах</span> */}
					{/* <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" /> */}
				</Link>
			</div>
		</div>
	</div>
));

SectionDivider.displayName = "SectionDivider";

// ============================================================================
// HOME PAGE
// ============================================================================
export function isBurtguulsen(list: Exam1111[]) {
	return list.some((item) => item.burtguulsen === 1);
}

export default function HomePage() {
	const { userId, user } = useAuthStore();
	const { setProfile } = useUserStore();

	const { data: profileData, isLoading: isProfileLoading } =
		useQuery<UserProfileResponseType>({
			queryKey: ["userProfile", userId],
			queryFn: () => getUserProfile(userId ?? 0),
			enabled: !!userId,
			retry: 2,
			staleTime: 10 * 60 * 1000,
			refetchOnWindowFocus: false,
		});

	const { data: homeData, isLoading: isHomeLoading } =
		useQuery<HomeResponseType>({
			queryKey: ["homeScreen", userId],
			queryFn: () => getHomeScreen(userId ?? 0),
			enabled: !!userId,
			retry: 2,
			staleTime: 5 * 60 * 1000,
			refetchOnWindowFocus: false,
		});

	const {
		data: examList = [],
		isLoading,
		isFetched,
	} = useQuery({
		queryKey: ["get_exam_v2", userId],
		queryFn: () =>
			getExamTime({
				userId: Number(userId),
				examinee_number: user?.examinee_number || "",
			}),
		enabled: !!userId && !!user?.examinee_number,
		select: (res) => res.RetData || [],
	});

	const { data: myExamInfo } = useQuery({
		queryKey: ["myExamInfo", userId, user?.examinee_number],
		queryFn: () =>
			getmnExamUserCheck(user?.examinee_number ?? "", Number(userId)),
		enabled: !!userId && !!user?.examinee_number,
		select: (res) => res.RetData ?? [],
	});

	// myExamInfo-с exam_date_id авах
	const examDateId = myExamInfo?.[0]?.exam_date_id;

	const { data: printData } = useQuery({
		queryKey: ["mn_print", userId, user?.examinee_number, examDateId],
		queryFn: () =>
			getMNPrint({
				userId: Number(userId),
				examineeNumber: String(user?.examinee_number ?? ""),
				examDateId: Number(examDateId), // ← нэмэх
			}),
		enabled: !!userId && !!user?.examinee_number && !!examDateId, // ← examDateId бэлэн болсон үед л fetch
		select: (res) => {
			console.log("✅ printData:", res);
			return res.RetData ?? [];
		},
	});

	useEffect(() => {
		if (profileData?.RetData?.length) {
			setProfile(profileData.RetData[0]);
		}
	}, [profileData, setProfile]);

	const username = profileData?.RetData?.[0]?.username ?? "Хэрэглэгч";
	const hasExams = Boolean(homeData?.RetDataThirt?.length);
	const hasSorils = Boolean(homeData?.RetDataFourth?.length);

	if (!userId) {
		return <div className="flex items-center justify-center min-h-[60vh]" />;
	}

	return (
		<TooltipProvider>
			<div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 relative z-10">
				<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
					<HeroSection username={username} />
					<div className="pt-2 flex flex-row gap-4 items-start">
						<div>
							{myExamInfo && myExamInfo.length > 0 ? (
								<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
									<div className="flex flex-row gap-3 overflow-x-auto pb-2">
										{myExamInfo.map((exam, index) => (
											<div
												key={`${exam.exam_number}-${index}`}
												className="shrink-0 w-72"
											>
												<ExamInfoCard exam={exam} printData={printData ?? []} />
											</div>
										))}
									</div>
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									Бүртгэлтэй шалгалт байхгүй байна.
								</p>
							)}
						</div>
					</div>

					<ExamVerifyDialog
						examList={examList}
						isLoading={isLoading}
						isFetched={isFetched}
					/>
				</div>

				<SectionDivider
					title="ӨНӨӨДӨР НЭЭЛТТЭЙ БАЙГАА МОНГОЛ ХЭЛ БИЧГИЙН ШАЛГАЛТ "
					href="/Lists/mnSorilList"
				/>
				{/* <div className="animate-in fade-in-0 duration-700">
					<MnExamList />
				</div> */}

				{isHomeLoading || isProfileLoading ? (
					<div className="flex items-center justify-center py-24">
						<Loader2 className="w-10 h-10 animate-spin text-primary" />
					</div>
				) : (
					<>
						{hasExams && homeData?.RetDataThirt && (
							<>
								<SectionDivider
									title="Идэвхтэй шалгалтууд"
									href="/Lists/examList"
								/>
								<div className="animate-in fade-in-0 duration-700 delay-300">
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 px-2">
										<ExamLists exams={homeData.RetDataThirt} />
									</div>
								</div>
							</>
						)}
						{hasSorils && homeData?.RetDataFourth && (
							<>
								<SectionDivider
									title="ЭЛСЭЛТИЙН ШАЛГАЛТЫН СОРИЛУУД"
									href="/Lists/sorilList"
								/>
								<div className="animate-in fade-in-0 duration-700 delay-500">
									<SorilLists pastExams={homeData.RetDataFourth} />
								</div>
							</>
						)}
					</>
				)}
			</div>
		</TooltipProvider>
	);
}
