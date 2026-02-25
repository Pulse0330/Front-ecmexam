"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
	BookOpen,
	Calendar,
	Check,
	Loader2,
	ShoppingCart,
	Tag,
	TrendingDown,
	X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
	"grid grid-cols-2 xs:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-7 gap-3 sm:gap-4 pb-4 auto-rows-fr";

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
			className={cn(
				"relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden",
				isSelected
					? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
					: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800",
			)}
		>
			{isDiscounted && (
				<Badge
					className={cn(
						"absolute top-3 right-3 text-xs font-bold",
						isSelected ? "bg-blue-600 text-white" : "bg-green-500 text-white",
					)}
				>
					<TrendingDown className="w-3 h-3 mr-1" />
					Хөнгөлөлттэй
				</Badge>
			)}

			<div className="mb-3 pr-20">
				<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
					{plan.descr}
				</p>
				<p className="text-2xl font-black text-slate-900 dark:text-white">
					₮{plan.amount.toLocaleString()}
				</p>
			</div>

			<div className="flex items-center gap-2 mb-2">
				<Calendar className="w-3.5 h-3.5 text-slate-400" />
				<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
					{plan.month} сарын хугацаа
				</span>
			</div>

			{isSelected && (
				<div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
					<Check className="w-4 h-4 text-white" />
				</div>
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
	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
				<div>
					<h3 className="text-lg font-bold text-slate-900 dark:text-white">
						Төлбөр төлөх
					</h3>
					<p className="text-sm text-slate-600 dark:text-slate-400">
						{selectedIds.length} хичээл сонгосон
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClearAll}
					className="h-9 w-9 rounded-lg"
				>
					<X className="w-5 h-5" />
				</Button>
			</div>

			<div className="space-y-2 max-h-64 overflow-y-auto pr-2">
				{selectedIds.map((id) => {
					const course = courseMap.get(id);
					if (!course) return null;
					return (
						<div
							key={id}
							className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
						>
							<Image
								src={course.filename}
								alt={course.title}
								width={56}
								height={56}
								className="rounded-lg object-cover"
							/>
							<p className="flex-1 text-sm font-semibold text-slate-900 dark:text-white truncate">
								{course.title}
							</p>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onRemoveCourse(id)}
								className="h-8 w-8 shrink-0"
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					);
				})}
			</div>

			{availablePlans.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<Tag className="w-4 h-4 text-blue-600" />
						<p className="text-sm font-bold text-slate-900 dark:text-white">
							Төлбөрийн сонголт
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
							className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700"
						>
							{isProcessingPayment ? (
								<>
									<Loader2 className="w-5 h-5 mr-2 animate-spin" />
									Уншиж байна...
								</>
							) : (
								<>
									<Check className="w-5 h-5 mr-2" />
									QPay төлбөр төлөх
								</>
							)}
						</Button>
					)}
				</div>
			)}

			<p className="pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 text-center">
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
		<div className="mx-auto w-full flex flex-col gap-4 sm:gap-7 px-3 sm:px-7 lg:px-8 py-4 sm:py-7 lg:py-8">
			{/* ── Purchased courses ── */}
			{purchasedCourses.length > 0 && (
				<section className="mb-8 sm:mb-12">
					<div className="mb-4 sm:mb-6">
						<h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
							Миний хичээлүүд
						</h3>
						<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
							{purchasedCourses.length} Хичээл
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
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6 sm:mb-8">
						<div>
							<h2 className="text-lg sm:text-2xl font-extrabold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
								{purchasedCourses.length > 0
									? "Бусад хичээлүүд"
									: "Бүх хичээлүүд"}
							</h2>
							<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
								{availableCourses.length} хичээл байна
								{hasSelection && (
									<span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
										• {selectedIds.size}/{MAX_SELECTED} сонгосон
									</span>
								)}
							</p>
						</div>
					</div>

					{/* Error */}
					{isError && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="max-w-md mx-auto text-center py-12 sm:py-20"
						>
							<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
								<X className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
							</div>
							<h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
								Алдаа гарлаа
							</h3>
							<p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
								{error.message}
							</p>
							<Button
								onClick={() => window.location.reload()}
								className="bg-blue-600 hover:bg-blue-700"
							>
								Дахин оролдох
							</Button>
						</motion.div>
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
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="max-w-md mx-auto text-center py-12 sm:py-20"
						>
							<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 sm:mb-6">
								<BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
							</div>
							<h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
								Хичээл олдсонгүй
							</h3>
							<p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
								Бүх хичээлийг аль хэдийн худалдаж авсан байна
							</p>
						</motion.div>
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
						className="hidden lg:block fixed right-0 top-0 bottom-0 z-50 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl overflow-y-auto"
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
							className="lg:hidden fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto border-l border-slate-200 dark:border-slate-700"
						>
							<div className="flex items-center justify-between p-6 pb-0">
								<div>
									<h3 className="text-lg font-bold text-slate-900 dark:text-white">
										Миний сагс
									</h3>
									<p className="text-sm text-slate-600 dark:text-slate-400">
										{selectedIds.size} хичээл
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => dispatchUi({ type: "CLOSE_CART" })}
								>
									<X className="w-5 h-5" />
								</Button>
							</div>
							<SidebarContent {...sidebarProps} />
						</motion.aside>
					</>
				)}
			</AnimatePresence>

			{/* ── Mobile FAB ── */}
			<AnimatePresence>
				{hasSelection && !ui.showCart && (
					<motion.button
						variants={FAB_VARIANTS}
						initial="hidden"
						animate="visible"
						exit="hidden"
						type="button"
						aria-label={`Сагс нээх — ${selectedIds.size} хичээл`}
						onClick={() => dispatchUi({ type: "OPEN_CART" })}
						className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-30"
					>
						<ShoppingCart className="w-6 h-6" />
						<span
							aria-hidden
							className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
						>
							{selectedIds.size}
						</span>
					</motion.button>
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
