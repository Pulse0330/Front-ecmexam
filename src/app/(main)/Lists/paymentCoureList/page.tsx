"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
	BookOpen,
	Calendar,
	Check,
	CreditCard,
	Loader2,
	ShoppingCart,
	Tag,
	TrendingDown,
	X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { PageHeader } from "@/components/page/pageHeader";
import {
	EmptyState,
	ErrorState,
	LoadingState,
} from "@/components/page/pageStates";
import { Button } from "@/components/ui/button";
import { getPaymentCourseList } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { getplaninfoCourseData } from "@/types/paymentCourse/getplaninfo";
import type { QPayInvoiceResponse } from "@/types/Qpay/qpayinvoice";
import QPayDialog from "./dialog";
import CourseCard from "./form";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SELECTED = 4;

const SPRING_TRANSITION = {
	type: "spring",
	damping: 30,
	stiffness: 300,
} as const;

const SIDEBAR_VARIANTS = {
	hidden: { x: 384, opacity: 0 },
	visible: { x: 0, opacity: 1 },
} as const;

const MOBILE_SIDEBAR_VARIANTS = {
	hidden: { x: "100%", opacity: 0 },
	visible: { x: 0, opacity: 1 },
} as const;

const FAB_VARIANTS = {
	hidden: { y: 100 },
	visible: { y: 0 },
} as const;

const GRID_CLASS =
	"grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4";

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = {
	planid: number;
	month: number;
	amount: number;
	descr: string;
};

// ─── State ────────────────────────────────────────────────────────────────────

type UIState = {
	showCart: boolean;
	showQpayModal: boolean;
	isProcessingPayment: boolean;
};

type UIAction =
	| { type: "OPEN_CART" }
	| { type: "CLOSE_CART" }
	| { type: "OPEN_QPAY" }
	| { type: "CLOSE_QPAY" }
	| { type: "SET_PROCESSING"; payload: boolean };

function uiReducer(state: UIState, action: UIAction): UIState {
	switch (action.type) {
		case "OPEN_CART":
			return { ...state, showCart: true };
		case "CLOSE_CART":
			return { ...state, showCart: false };
		case "OPEN_QPAY":
			return { ...state, showQpayModal: true, showCart: false };
		case "CLOSE_QPAY":
			return { ...state, showQpayModal: false };
		case "SET_PROCESSING":
			return { ...state, isProcessingPayment: action.payload };
		default:
			return state;
	}
}

const INITIAL_UI_STATE: UIState = {
	showCart: false,
	showQpayModal: false,
	isProcessingPayment: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCourseMap<T extends { palnid: number }>(
	courses: T[],
): Map<number, T> {
	return new Map(courses.map((c) => [c.palnid, c]));
}

function computeDiscountedPlanIds(plans: Plan[]): Set<string> {
	const discounted = new Set<string>();
	const basePlan = plans.find((p) => p.planid === 0 && p.month === 1);

	for (const plan of plans) {
		const key = `${plan.planid}-${plan.month}`;
		if (plan.planid === 1) {
			discounted.add(key);
			continue;
		}
		if (plan.planid === 0 && plan.month > 1 && basePlan) {
			if (plan.amount < basePlan.amount * plan.month) {
				discounted.add(key);
			}
		}
	}

	return discounted;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

// ─── Plan Button ──────────────────────────────────────────────────────────────

type PlanButtonProps = {
	plan: Plan;
	isSelected: boolean;
	isDiscounted: boolean;
	onToggle: (key: string) => void;
};

function PlanButton({
	plan,
	isSelected,
	isDiscounted,
	onToggle,
}: PlanButtonProps) {
	const key = `${plan.planid}-${plan.month}`;

	return (
		<button
			type="button"
			onClick={() => onToggle(key)}
			aria-pressed={isSelected}
			className={cn(
				"relative w-full overflow-hidden rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors",
				isSelected
					? "border-primary bg-primary/5 ring-1 ring-primary"
					: "hover:border-primary/40",
			)}
		>
			{isDiscounted && (
				<span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
					<TrendingDown className="size-3.5" aria-hidden />
					Хөнгөлөлттэй
				</span>
			)}

			<div className="mb-2 pr-28">
				<p className="mb-1 text-xs text-muted-foreground">{plan.descr}</p>
				<p className="text-2xl font-bold text-foreground">
					₮{plan.amount.toLocaleString()}
				</p>
			</div>

			<div className="flex items-center gap-2">
				<Calendar className="size-4 text-muted-foreground" aria-hidden />
				<span className="text-sm font-medium text-muted-foreground">
					{plan.month} сарын хугацаа
				</span>
			</div>

			{isSelected && (
				<span className="absolute right-3 bottom-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
					<Check className="size-4" aria-hidden />
				</span>
			)}
		</button>
	);
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────

type SidebarContentProps = {
	selectedIds: number[];
	courseMap: Map<number, { palnid: number; title: string; filename: string }>;
	availablePlans: Plan[];
	discountedPlanIds: Set<string>;
	selectedPlan: string | null;
	isProcessingPayment: boolean;
	onRemoveCourse: (id: number) => void;
	onClearAll: () => void;
	onTogglePlan: (key: string) => void;
	onCheckout: () => void;
};

function SidebarContent({
	selectedIds,
	courseMap,
	availablePlans,
	discountedPlanIds,
	selectedPlan,
	isProcessingPayment,
	onRemoveCourse,
	onClearAll,
	onTogglePlan,
	onCheckout,
}: SidebarContentProps) {
	// Сонгосон багцын үнэ (товчны текстэд харуулах)
	const selectedPlanInfo = availablePlans.find(
		(p) => `${p.planid}-${p.month}` === selectedPlan,
	);

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between gap-3 border-b pb-4">
				<div>
					<h3 className="text-lg font-bold text-foreground">Төлбөр төлөх</h3>
					<p className="text-sm text-muted-foreground">
						1. Хичээлээ шалгах · 2. Хугацаа сонгох · 3. QPay-ээр төлөх
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={onClearAll}
					className="h-10 shrink-0"
				>
					Цэвэрлэх
				</Button>
			</div>

			<div className="space-y-2">
				<p className="text-sm font-semibold text-foreground">
					Сонгосон хичээл ({selectedIds.length}/{MAX_SELECTED})
				</p>
				<div className="max-h-64 space-y-2 overflow-y-auto pr-1">
					{selectedIds.map((id) => {
						const course = courseMap.get(id);
						if (!course) return null;
						return (
							<div
								key={id}
								className="flex items-center gap-3 rounded-xl border bg-muted/50 p-2.5"
							>
								<Image
									src={course.filename}
									alt={course.title}
									width={56}
									height={56}
									className="size-14 rounded-lg object-cover"
								/>
								<p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
									{course.title}
								</p>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onRemoveCourse(id)}
									className="size-10 shrink-0"
									aria-label={`${course.title} хичээлийг хасах`}
								>
									<X className="size-4" />
								</Button>
							</div>
						);
					})}
				</div>
			</div>

			{availablePlans.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Tag className="size-4 text-primary" aria-hidden />
						<p className="text-sm font-semibold text-foreground">
							Хугацаа ба төлбөр сонгох
						</p>
					</div>

					<div className="space-y-3">
						{availablePlans.map((plan) => {
							const key = `${plan.planid}-${plan.month}`;
							return (
								<PlanButton
									key={key}
									plan={plan}
									isSelected={selectedPlan === key}
									isDiscounted={discountedPlanIds.has(key)}
									onToggle={onTogglePlan}
								/>
							);
						})}
					</div>

					{selectedPlan && (
						<Button
							onClick={onCheckout}
							disabled={isProcessingPayment}
							className="h-12 w-full text-base font-semibold"
						>
							{isProcessingPayment ? (
								<>
									<Loader2 className="size-5 animate-spin" />
									QR код үүсгэж байна...
								</>
							) : (
								<>
									<CreditCard className="size-5" />
									QPay-ээр төлөх
									{selectedPlanInfo
										? ` · ₮${selectedPlanInfo.amount.toLocaleString()}`
										: ""}
								</>
							)}
						</Button>
					)}
				</div>
			)}

			<p className="border-t pt-4 text-center text-xs text-muted-foreground">
				{selectedIds.length === 1
					? "Хичээлийн хугацаа ба төлбөрөө сонгоно уу"
					: "Та өөрийн хүссэн хичээлүүдээ сонгон, суралцаж хугацаа болон төлбөрийн хамгийн ашигтай хувилбарыг сонгоорой"}
			</p>
		</div>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentCoursesPage() {
	const { userId } = useAuthStore();

	const [ui, dispatchUi] = useReducer(uiReducer, INITIAL_UI_STATE);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
	const [qpayData, setQpayData] = useState<QPayInvoiceResponse | null>(null);

	const selectedIdsRef = useRef(selectedIds);
	selectedIdsRef.current = selectedIds;

	// ── Data fetching ──────────────────────────────────────────────────────────

	const {
		data: coursesData,
		isSuccess,
		isError,
		error,
	} = useQuery<getplaninfoCourseData, Error>({
		queryKey: ["paymentCourses", userId],
		queryFn: () => {
			if (!userId) throw new Error("User ID тодорхойгүй байна");
			return getPaymentCourseList(userId);
		},
		enabled: !!userId,
	});

	const courses = coursesData?.RetDataFirst ?? [];
	const plans = coursesData?.RetDataSecond ?? [];

	// ── Derived data ───────────────────────────────────────────────────────────

	const courseMap = useMemo(() => buildCourseMap(courses), [courses]);

	const { purchasedCourses, availableCourses } = useMemo(() => {
		const purchased = [];
		const available = [];
		for (const course of courses) {
			if (course.ispurchased === 1) purchased.push(course);
			else available.push(course);
		}
		return { purchasedCourses: purchased, availableCourses: available };
	}, [courses]);

	const availablePlans = useMemo(() => {
		if (selectedIds.size === 0) return [];
		return plans.filter((p) => p.planid === (selectedIds.size === 1 ? 0 : 1));
	}, [selectedIds.size, plans]);

	const discountedPlanIds = useMemo(
		() => computeDiscountedPlanIds(plans),
		[plans],
	);

	const selectedIdsArray = useMemo(() => [...selectedIds], [selectedIds]);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleSelectCourse = useCallback((planid: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(planid)) {
				next.delete(planid);
			} else if (next.size < MAX_SELECTED) {
				next.add(planid);
			}
			return next;
		});
		setSelectedPlan(null);
	}, []);

	const handleRemoveCourse = useCallback((id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.delete(id);
			return next;
		});
		setSelectedPlan(null);
	}, []);

	const handleClearAll = useCallback(() => {
		setSelectedIds(new Set());
		setSelectedPlan(null);
	}, []);

	const handleTogglePlan = useCallback((key: string) => {
		setSelectedPlan((prev) => (prev === key ? null : key));
	}, []);

	const handleCheckout = useCallback(async () => {
		if (!selectedPlan || !userId) return;

		try {
			dispatchUi({ type: "SET_PROCESSING", payload: true });

			const [planIdStr, monthStr] = selectedPlan.split("-");
			const planId = Number(planIdStr);
			const month = Number(monthStr);
			const plan = plans.find((p) => p.planid === planId && p.month === month);

			if (!plan) throw new Error("Төлөвлөгөө олдсонгүй");

			const currentIds = [...selectedIdsRef.current];
			const firstCourse = courseMap.get(currentIds[0]);

			const payload = {
				amount: plan.amount.toString(),
				userid: userId.toString(),
				device_token: "",
				orderid: "8",
				bilid: firstCourse?.bill_type?.toString() ?? "1",
				classroom_id: "0",
				urls: currentIds.map((id) => ({ topic_id: id.toString() })),
			};

			const { data } = await axios.post<QPayInvoiceResponse | string>(
				"/api/qpay/invoice",
				payload,
			);
			const parsed: QPayInvoiceResponse =
				typeof data === "string" ? JSON.parse(data) : data;

			if (!parsed?.qr_image) throw new Error("QPay хариу буруу байна");

			setQpayData(parsed);
			dispatchUi({ type: "OPEN_QPAY" });
		} catch (err: unknown) {
			const e = err as {
				message?: string;
				response?: { data?: { message?: string } };
			};
			alert(
				e.response?.data?.message ??
					e.message ??
					"Төлбөр төлөхөд алдаа гарлаа. Дахин оролдоно уу.",
			);
		} finally {
			dispatchUi({ type: "SET_PROCESSING", payload: false });
		}
	}, [selectedPlan, userId, plans, courseMap]);

	const sidebarProps = {
		selectedIds: selectedIdsArray,
		courseMap,
		availablePlans,
		discountedPlanIds,
		selectedPlan,
		isProcessingPayment: ui.isProcessingPayment,
		onRemoveCourse: handleRemoveCourse,
		onClearAll: handleClearAll,
		onTogglePlan: handleTogglePlan,
		onCheckout: handleCheckout,
	} satisfies SidebarContentProps;

	const hasSelection = selectedIds.size > 0;

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		<div
			className={cn(
				"mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-24 sm:px-6 lg:px-8 lg:pb-8",
				// Desktop дээр баруун талын төлбөрийн самбар картуудыг халхлахгүй
				hasSelection && "lg:max-w-none lg:pr-[25rem]",
			)}
		>
			<PageHeader
				title="Хичээл худалдан авах"
				description={`Хичээлээ сонгоод (нэг удаад ${MAX_SELECTED} хүртэл), хугацаагаа сонгож QPay-ээр төлнө.`}
				icon={ShoppingCart}
				className="pb-0 sm:pb-0"
			/>

			{/* Ачаалж байна */}
			{!!userId && !isSuccess && !isError && (
				<LoadingState label="Хичээлүүд ачааллаж байна..." />
			)}

			{/* ── Purchased courses ── */}
			{purchasedCourses.length > 0 && (
				<section>
					<div className="mb-4">
						<h2 className="text-lg font-semibold text-foreground sm:text-xl">
							Миний хичээлүүд
						</h2>
						<p className="text-sm text-muted-foreground">
							{purchasedCourses.length} хичээл · үлдсэн хугацааг карт бүр дээр
							харна уу
						</p>
					</div>

					<div className={GRID_CLASS}>
						{purchasedCourses.map((course, index) => (
							<motion.div
								key={course.palnid}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.3,
									delay: Math.min(index * 0.05, 0.5),
								}}
							>
								<CourseCard course={course} />
							</motion.div>
						))}
					</div>
				</section>
			)}

			{/* ── Available courses ── */}
			<section>
				<div>
					{isSuccess && (
						<div className="mb-4">
							<h2 className="text-lg font-semibold text-foreground sm:text-xl">
								{purchasedCourses.length > 0
									? "Бусад хичээлүүд"
									: "Бүх хичээлүүд"}
							</h2>
							<p className="text-sm text-muted-foreground">
								{availableCourses.length} хичээл байна
								{hasSelection && (
									<span className="ml-2 font-medium text-primary">
										• {selectedIds.size}/{MAX_SELECTED} сонгосон
									</span>
								)}
							</p>
						</div>
					)}

					{/* Error */}
					{isError && (
						<ErrorState
							description={error.message}
							onRetry={() => window.location.reload()}
						/>
					)}

					{/* Course grid */}
					<div className={GRID_CLASS}>
						<AnimatePresence initial={false}>
							{availableCourses.map((course, index) => (
								<motion.div
									key={course.palnid}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{
										duration: 0.2,
										delay: Math.min(index * 0.02, 0.3),
									}}
								>
									<CourseCard
										course={course}
										isSelected={selectedIds.has(course.palnid)}
										onSelect={handleSelectCourse}
										disabled={
											!selectedIds.has(course.palnid) &&
											selectedIds.size >= MAX_SELECTED
										}
									/>
								</motion.div>
							))}
						</AnimatePresence>
					</div>

					{/* Empty state */}
					{isSuccess && availableCourses.length === 0 && (
						<EmptyState
							icon={BookOpen}
							title="Худалдан авах хичээл алга"
							description="Бүх хичээлийг аль хэдийн худалдаж авсан байна."
						/>
					)}
				</div>
			</section>

			{/* ── Desktop sidebar ── */}
			<AnimatePresence>
				{hasSelection && (
					<motion.aside
						variants={SIDEBAR_VARIANTS}
						initial="hidden"
						animate="visible"
						exit="hidden"
						transition={SPRING_TRANSITION}
						aria-label="Төлбөрийн мэдээлэл"
						className="fixed top-0 right-0 bottom-0 z-50 hidden w-96 overflow-y-auto border-l bg-background shadow-xl lg:block"
					>
						<SidebarContent {...sidebarProps} />
					</motion.aside>
				)}
			</AnimatePresence>

			{/* ── Mobile cart sidebar ── */}
			<AnimatePresence>
				{ui.showCart && hasSelection && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => dispatchUi({ type: "CLOSE_CART" })}
							className="lg:hidden fixed inset-0 bg-black/50 z-40"
							aria-hidden
						/>
						<motion.aside
							variants={MOBILE_SIDEBAR_VARIANTS}
							initial="hidden"
							animate="visible"
							exit="hidden"
							transition={SPRING_TRANSITION}
							aria-label="Миний сагс"
							className="fixed top-0 right-0 bottom-0 z-50 w-full overflow-y-auto border-l bg-background shadow-xl sm:w-96 lg:hidden"
						>
							<div className="flex items-center justify-between gap-3 p-6 pb-0">
								<div>
									<h3 className="text-lg font-bold text-foreground">
										Миний сагс
									</h3>
									<p className="text-sm text-muted-foreground">
										{selectedIds.size} хичээл
									</p>
								</div>
								<Button
									variant="outline"
									onClick={() => dispatchUi({ type: "CLOSE_CART" })}
									className="h-10"
								>
									<X className="size-4" />
									Хаах
								</Button>
							</div>
							<SidebarContent {...sidebarProps} />
						</motion.aside>
					</>
				)}
			</AnimatePresence>

			{/* ── Mobile доод самбар: сагс нээх ── */}
			<AnimatePresence>
				{hasSelection && !ui.showCart && (
					<motion.div
						variants={FAB_VARIANTS}
						initial="hidden"
						animate="visible"
						exit="hidden"
						className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:hidden"
					>
						<Button
							type="button"
							onClick={() => dispatchUi({ type: "OPEN_CART" })}
							className="h-11 w-full text-base"
						>
							<ShoppingCart className="size-5" />
							Төлбөр төлөх · {selectedIds.size} хичээл
						</Button>
					</motion.div>
				)}
			</AnimatePresence>

			{/* ── QPay dialog ── */}
			<QPayDialog
				open={ui.showQpayModal}
				onOpenChange={(open) =>
					dispatchUi({ type: open ? "OPEN_QPAY" : "CLOSE_QPAY" })
				}
				qpayData={qpayData}
				userId={userId ?? ""}
				onPaymentSuccess={() => window.location.reload()}
			/>
		</div>
	);
}
