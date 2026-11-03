"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	ArrowRight,
	BookOpen,
	ChevronRight,
	ClipboardCheck,
	Clock,
	FileText,
	Lock,
	type LucideIcon,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState, LoadingState } from "@/components/page/pageStates";
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
	getReklam,
	getUserProfile,
} from "@/lib/api";
import { getExamTime } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUserStore } from "@/stores/useUserStore";
import type { Exam1111 } from "@/types/dashboard/exam.types";
import {
	type HomeResponseType,
	isSorilCompleted,
	type PastExam,
} from "@/types/home";
import type { UserProfileResponseType } from "@/types/user";
import { FloatingAds } from "./floatingAds";
import ExamLists from "./homeExamCard";
import { ReklamCarousel } from "./reklamCarousel";
import { mapReklam } from "./reklamMapper";
import { SplashAd } from "./splashAd";

const ANIMATION_STAGGER = 0.04;

// ============================================================================
// HERO SECTION — мэндчилгээ + үндсэн чиглэл
// ============================================================================

interface HeroSectionProps {
	username: string;
}

const HeroSection = memo(({ username }: HeroSectionProps) => (
	<section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-start gap-3">
				<span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
					<Sparkles className="size-6" />
				</span>
				<div className="min-w-0">
					<h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
						Сайн уу, <span className="text-primary">{username}</span>!
					</h1>
					<p className="mt-1 text-sm text-muted-foreground sm:text-base">
						Идэвхтэй шалгалтаа өгөх, сорил болон сургалтаар бэлтгэлээ хангаарай.
					</p>
				</div>
			</div>
			<Button asChild variant="outline" className="h-11 w-full sm:w-auto">
				<Link href="/Lists/paymentCoureList">
					<BookOpen className="size-4" />
					Сургалт үзэх
				</Link>
			</Button>
		</div>
	</section>
));

HeroSection.displayName = "HeroSection";

// ============================================================================
// EXAM CARD — сорилын карт
// ============================================================================

interface ExamCardProps {
	exam: PastExam;
	index: number;
}

function getExamLockStatus(exam: PastExam) {
	return exam.ispay === 1 && exam.paid === 0 && exam.isopensoril === 0;
}

const ExamCard = memo(
	({ exam, index }: ExamCardProps) => {
		const router = useRouter();
		const _isCompleted = isSorilCompleted(exam.isguitset);
		const isLocked = getExamLockStatus(exam);
		const _isPaidAndUnlocked = exam.ispay === 1 && exam.paid === 1;

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
										priority={index < 6}
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
						{isLocked && (
							<p className="mt-1 text-amber-500">Төлбөр төлөх шаардлагатай</p>
						)}
						{exam.isopensoril === 1 && (
							<p className="mt-1 text-green-500">Нээлттэй сорил</p>
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
			<EmptyState
				icon={FileText}
				title="Сорил олдсонгүй"
				description="Одоогоор өгөх боломжтой сорил алга."
			/>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{pastExams.map((exam, index) => (
				<ExamCard key={exam.exam_id} exam={exam} index={index} />
			))}
		</div>
	);
});

SorilLists.displayName = "SorilLists";

// ============================================================================
// SECTION HEADING — бүх хэсгийн нэгдсэн гарчиг
// ============================================================================

interface SectionHeadingProps {
	title: string;
	description?: string;
	icon: LucideIcon;
	href: string;
	count?: number;
}

const SectionHeading = memo(
	({ title, description, icon: Icon, href, count }: SectionHeadingProps) => (
		<div className="mb-4 flex items-end justify-between gap-3">
			<div className="flex min-w-0 items-center gap-3">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<Icon className="size-5" />
				</span>
				<div className="min-w-0">
					<h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
						{title}
						{typeof count === "number" && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
								{count}
							</span>
						)}
					</h2>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			</div>
			<Link
				href={href}
				className="inline-flex h-10 shrink-0 items-center gap-1 rounded-md px-2 text-sm font-medium text-primary hover:bg-primary/10"
			>
				Бүгд
				<ChevronRight className="size-4" />
			</Link>
		</div>
	),
);

SectionHeading.displayName = "SectionHeading";

// ============================================================================
// HOME PAGE
// ============================================================================
export function isBurtguulsen(list: Exam1111[]) {
	return list.some((item) => item.burtguulsen === 1);
}

export default function HomePage() {
	const { userId, user } = useAuthStore();
	const { setProfile } = useUserStore();

	// Зарын дараалал: splash → popup dialog → булангийн зарууд
	const [splashDone, setSplashDone] = useState(false);
	// Carousel-д одоо харагдаж буй зар — булангийн зар түүнийг давхардуулахгүй
	const [carouselAdId, setCarouselAdId] = useState<string | number | null>(
		null,
	);
	const handleSplashFinished = useCallback(() => setSplashDone(true), []);

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

	// Зар сурталчилгаа (splash, home, popup)
	const { data: reklamData, isPending: isReklamPending } = useQuery({
		queryKey: ["reklam", userId],
		queryFn: () => getReklam(Number(userId)),
		enabled: !!userId,
		retry: 1,
		staleTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
		select: (res) => res.RetData,
	});
	const ads = useMemo(() => mapReklam(reklamData), [reklamData]);

	void useQuery({
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
	//biome-ignore lint/correctness/noUnusedVariables: ExamVerifyDialog, MnExamPrint-д ашиглана
	const { data: printData } = useQuery({
		queryKey: ["mn_print", userId, user?.examinee_number, examDateId],
		queryFn: () =>
			getMNPrint({
				userId: Number(userId),
				examineeNumber: String(user?.examinee_number ?? ""),
				examDateId: Number(examDateId),
			}),
		enabled: !!userId && !!user?.examinee_number, // ← examDateId нөхцөл хасав
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
			<SplashAd
				ad={isReklamPending ? undefined : ads.splash}
				onFinished={handleSplashFinished}
			/>
			{/* Нэг удаад нэг зар: эхлээд splash, хаагдсаны дараа булангийн зарууд ээлжилнэ */}
			{splashDone && ads.floating.length > 0 && (
				<FloatingAds ads={ads.floating} delay={1500} excludeId={carouselAdId} />
			)}

			{/* Print хэсэг */}
			{/* <MnExamPrint printList={printData ?? []} /> */}
			<div className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
				<div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
					<HeroSection username={username} />
				</div>

				{/* Хамгийн чухал: идэвхтэй шалгалтууд эхэнд */}
				{isHomeLoading || isProfileLoading ? (
					<LoadingState label="Шалгалт, сорилууд ачааллаж байна..." />
				) : (
					hasExams &&
					homeData?.RetDataThirt && (
						<section className="animate-in fade-in-0 duration-700">
							<SectionHeading
								title="Идэвхтэй шалгалтууд"
								description="Шалгалт дээр дарж дүрмийг уншаад эхлүүлнэ"
								icon={ClipboardCheck}
								href="/Lists/examList"
								count={homeData.RetDataThirt.length}
							/>
							<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-2">
								<ExamLists exams={homeData.RetDataThirt} />
							</div>
						</section>
					)
				)}

				{/* Carousel ачаалал хүлээлгүй үргэлж mount хэвээр */}
				{ads.carousel.length > 0 && (
					<ReklamCarousel
						ads={ads.carousel}
						paused={!splashDone}
						onActiveChange={setCarouselAdId}
					/>
				)}

				{!(isHomeLoading || isProfileLoading) && (
					<>
						{hasSorils && homeData?.RetDataFourth && (
							<section className="animate-in fade-in-0 duration-700">
								<SectionHeading
									title="Элсэлтийн шалгалтын сорилууд"
									description="Шалгалтдаа бэлдэх дадлага сорилууд"
									icon={FileText}
									href="/Lists/sorilList"
									count={homeData.RetDataFourth.length}
								/>
								<SorilLists pastExams={homeData.RetDataFourth} />
							</section>
						)}

						{!hasExams && !hasSorils && (
							<EmptyState
								icon={ClipboardCheck}
								title="Одоогоор идэвхтэй шалгалт, сорил алга"
								description="Шинэ шалгалт нээгдэхэд энд харагдана. Энэ хооронд сургалтаа үзээрэй."
								action={
									<Button asChild className="h-11">
										<Link href="/Lists/paymentCoureList">
											<BookOpen className="size-4" />
											Сургалт үзэх
										</Link>
									</Button>
								}
							/>
						)}
					</>
				)}
			</div>
		</TooltipProvider>
	);
}
