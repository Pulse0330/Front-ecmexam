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
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPaymentCourseList } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import type { getplaninfoCourseData } from "@/types/paymentCourse/getplaninfo";
import type { QPayInvoiceResponse } from "@/types/Qpay/qpayinvoice";
import QPayDialog from "./dialog";
import CourseCard from "./form";

export default function PaymentCoursesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	const [qpayData, setQpayData] = useState<QPayInvoiceResponse | null>(null);
	const [showQpayModal, setShowQpayModal] = useState(false);
	const [showCart, setShowCart] = useState(false);
	const { userId } = useAuthStore();

	const {
		data: coursesData,
		isLoading,
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

	const courses = coursesData?.RetDataFirst || [];
	const plans = coursesData?.RetDataSecond || [];

	const purchasedCourses = useMemo(() => {
		return courses.filter((course) => course.ispurchased === 1);
	}, [courses]);

	const availableCourses = useMemo(() => {
		return courses.filter((course) => course.ispurchased === 0);
	}, [courses]);

	const filteredAvailableCourses = useMemo(() => {
		return availableCourses.filter((course) =>
			course.title?.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [availableCourses, searchQuery]);

	const totalIndividualPrice = useMemo(() => {
		return selectedCourses.reduce((sum, id) => {
			const course = courses.find((c) => c.palnid === id);
			return sum + (course?.amount || 0);
		}, 0);
	}, [selectedCourses, courses]);

	const availablePlans = useMemo(() => {
		if (selectedCourses.length === 0) return [];
		if (selectedCourses.length === 1) {
			return plans.filter((plan) => plan.planid === 0);
		}
		return plans.filter((plan) => plan.planid === 1);
	}, [selectedCourses.length, plans]);

	const calculateSavings = (
		planAmount: number,
		planMonth: number,
		planId: number,
	) => {
		if (planId === 0 && selectedCourses.length === 1) {
			const course = courses.find((c) => c.palnid === selectedCourses[0]);
			if (!course) return 0;
			const basePrice = course.amount * planMonth;
			return basePrice - planAmount;
		}
		return totalIndividualPrice - planAmount;
	};

	const calculateSavingsPercent = (
		planAmount: number,
		planMonth: number,
		planId: number,
	) => {
		if (planId === 0 && selectedCourses.length === 1) {
			const course = courses.find((c) => c.palnid === selectedCourses[0]);
			if (!course) return 0;
			const basePrice = course.amount * planMonth;
			if (basePrice === 0) return 0;
			return Math.round(((basePrice - planAmount) / basePrice) * 100);
		}
		if (totalIndividualPrice === 0) return 0;
		return Math.round(
			((totalIndividualPrice - planAmount) / totalIndividualPrice) * 100,
		);
	};

	const handleCheckout = async () => {
		if (!selectedPlan || !userId) return;

		try {
			setIsProcessingPayment(true);

			const planKey = selectedPlan.split("-");
			const planId = Number.parseInt(planKey[0], 10);
			const month = Number.parseInt(planKey[1], 10);
			const plan = plans.find((p) => p.planid === planId && p.month === month);

			if (!plan) {
				throw new Error("Төлөвлөгөө олдсонгүй");
			}

			const urls = selectedCourses.map((courseId) => {
				const course = courses.find((c) => c.palnid === courseId);
				return {
					topic_id: course?.palnid.toString() || courseId.toString(),
				};
			});

			const firstCourse = courses.find((c) => c.palnid === selectedCourses[0]);
			const billId = firstCourse?.bill_type?.toString() || "1";

			const payload = {
				amount: "100",
				/* amount: plan.amount.toString(), */
				userid: userId.toString(),
				device_token: "",
				orderid: "8",
				bilid: billId,
				classroom_id: "0",
				urls: urls,
			};

			const response = await axios.post("/api/qpay/invoice", payload);

			let qpayResponse = response.data;
			if (typeof response.data === "string") {
				qpayResponse = JSON.parse(response.data);
			}

			if (!qpayResponse || !qpayResponse.qr_image) {
				throw new Error("QPay хариу буруу байна");
			}

			setQpayData(qpayResponse);
			setShowQpayModal(true);
			setShowCart(false);
		} catch (error: unknown) {
			console.error("Төлбөрийн алдаа:", error);
			const axiosError = error as {
				message?: string;
				response?: { data?: { message?: string }; status?: number };
			};
			const errorMessage =
				axiosError.response?.data?.message ||
				axiosError.message ||
				"Төлбөр төлөхөд алдаа гарлаа. Дахин оролдоно уу.";
			alert(errorMessage);
		} finally {
			setIsProcessingPayment(false);
		}
	};

	const handleSelectCourse = (planid: number) => {
		setSelectedCourses((prev) => {
			if (prev.includes(planid)) {
				return prev.filter((id) => id !== planid);
			}
			if (prev.length >= 4) {
				return prev;
			}
			return [...prev, planid];
		});
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:px-8">
				{/* Header with Cart Icon */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
							Хичээлийн дэлгүүр
						</h1>
						<p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
							{filteredAvailableCourses.length} хичээл байна
						</p>
					</div>
				</div>

				{/* Худалдаж авсан хичээлүүд */}
				{purchasedCourses.length > 0 && (
					<div className="mb-8 sm:mb-12">
						<div className="flex items-center justify-between mb-4 sm:mb-6">
							<div>
								<h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
									Миний хичээлүүд
								</h2>
								<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
									{purchasedCourses.length} хичээл худалдаж авсан
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
							{purchasedCourses.map((course, index) => (
								<motion.div
									key={course.palnid}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
								>
									<CourseCard
										course={course}
										onView={() => console.log("Үзэх:", course.title)}
										onExtend={() => console.log("Сунгах:", course.title)}
									/>
								</motion.div>
							))}
						</div>
					</div>
				)}

				{/* Худалдан авах боломжтой хичээлүүд */}
				<div className="flex flex-col lg:flex-row">
					<div
						className={cn(
							"flex-1 transition-all duration-300",
							selectedCourses.length > 0 && "lg:mr-80",
						)}
					>
						<div className="mb-8">
							<div className="flex items-center justify-between mb-6 sm:mb-8">
								<div>
									<h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
										{purchasedCourses.length > 0
											? "Бусад хичээлүүд"
											: "Бүх хичээлүүд"}
									</h2>
									<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
										{filteredAvailableCourses.length} хичээл байна
									</p>
								</div>
							</div>

							{isLoading && (
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
									{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
										<div key={n} className="space-y-2">
											<div className="h-32 sm:h-40 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 animate-pulse" />
											<div className="h-3 sm:h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
											<div className="h-2 sm:h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
										</div>
									))}
								</div>
							)}

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
										className="bg-linear-to-r from-primary to-blue-600"
									>
										Дахин оролдох
									</Button>
								</motion.div>
							)}

							<motion.div
								layout
								className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
							>
								<AnimatePresence mode="popLayout">
									{filteredAvailableCourses.map((course, index) => (
										<motion.div
											key={course.palnid}
											layout
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.9 }}
											transition={{ duration: 0.3, delay: index * 0.02 }}
										>
											<CourseCard
												course={course}
												isSelected={selectedCourses.includes(course.palnid)}
												onSelect={() => handleSelectCourse(course.palnid)}
												disabled={
													!selectedCourses.includes(course.palnid) &&
													selectedCourses.length >= 4
												}
											/>
										</motion.div>
									))}
								</AnimatePresence>
							</motion.div>

							{isSuccess && filteredAvailableCourses.length === 0 && (
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
									<p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
										Өөр түлхүүр үгээр хайж үзнэ үү
									</p>
									<Button
										onClick={() => setSearchQuery("")}
										variant="outline"
										className="border-2"
									>
										Хайлт цэвэрлэх
									</Button>
								</motion.div>
							)}
						</div>
					</div>

					{/* Desktop Sidebar - Original Code */}
					<AnimatePresence>
						{selectedCourses.length > 0 && (
							<motion.div
								initial={{ x: 100, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: 100, opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="hidden lg:block fixed right-0 top-0 bottom-0 z-50 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 shadow-2xl overflow-y-auto"
							>
								<div className="p-6 space-y-6">
									<div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
										<div>
											<h3 className="text-lg font-bold text-slate-900 dark:text-white">
												Төлбөр төлөх
											</h3>
											<p className="text-sm text-slate-600 dark:text-slate-400">
												{selectedCourses.length} хичээл сонгосон
											</p>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setSelectedCourses([])}
											className="h-9 w-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-600 hover:text-red-600 dark:text-slate-400"
										>
											<X className="w-5 h-5" />
										</Button>
									</div>

									<div className="space-y-2 max-h-64 overflow-y-auto pr-2">
										{selectedCourses.map((id) => {
											const course = courses.find((c) => c.palnid === id);
											return course ? (
												<div
													key={id}
													className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
												>
													<Image
														src={course.filename}
														alt={course.title}
														width={56}
														height={56}
														className="rounded-lg object-cover shadow-sm"
													/>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-semibold text-slate-900 dark:text-white truncate mb-1">
															{course.title}
														</p>
														<p className="text-base font-bold text-primary">
															₮{course.amount.toLocaleString()}
														</p>
													</div>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleSelectCourse(course.palnid)}
														className="h-8 w-8 shrink-0 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
													>
														<X className="w-4 h-4" />
													</Button>
												</div>
											) : null;
										})}
									</div>

									{selectedCourses.length > 1 && (
										<div className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
											<div className="flex items-center justify-between mb-3">
												<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
													Нийт үнэ ({selectedCourses.length} хичээл)
												</span>
												<span className="text-xl font-black text-slate-900 dark:text-white">
													₮{totalIndividualPrice.toLocaleString()}
												</span>
											</div>
											<p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
												Тус тусад нь худалдан авах үнэ
											</p>
										</div>
									)}

									{availablePlans.length > 0 && (
										<div className="space-y-4">
											<div className="flex items-center gap-2">
												<Tag className="w-4 h-4 text-primary" />
												<p className="text-sm font-bold text-slate-900 dark:text-white">
													Төлбөрийн сонголт
												</p>
											</div>

											<div className="space-y-3">
												{availablePlans.map((plan) => {
													const savings = calculateSavings(
														plan.amount,
														plan.month,
														plan.planid,
													);
													const savingsPercent = calculateSavingsPercent(
														plan.amount,
														plan.month,
														plan.planid,
													);
													const uniqueKey = `${plan.planid}-${plan.month}`;
													const isSelected = selectedPlan === uniqueKey;

													return (
														<button
															key={uniqueKey}
															type="button"
															onClick={() =>
																setSelectedPlan(isSelected ? null : uniqueKey)
															}
															className={cn(
																"relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden",
																isSelected
																	? "border-primary bg-primary/5 shadow-xl shadow-primary/20"
																	: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-primary/40",
															)}
														>
															{savings > 0 && (
																<Badge
																	className={cn(
																		"absolute top-3 right-3 text-xs font-bold shadow-lg",
																		isSelected
																			? "bg-primary text-white"
																			: "bg-green-500 text-white",
																	)}
																>
																	<TrendingDown className="w-3 h-3 mr-1" />-
																	{savingsPercent}%
																</Badge>
															)}

															<div className="mb-3 pr-20">
																<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
																	{plan.descr}
																</p>
																<div className="flex items-baseline gap-2 flex-wrap">
																	<p className="text-2xl font-black text-slate-900 dark:text-white">
																		₮{plan.amount.toLocaleString()}
																	</p>
																	{savings > 0 && (
																		<p className="text-sm line-through text-slate-400 dark:text-slate-500">
																			₮
																			{(plan.planid === 0
																				? (courses.find(
																						(c) =>
																							c.palnid === selectedCourses[0],
																					)?.amount || 0) * plan.month
																				: totalIndividualPrice
																			).toLocaleString()}
																		</p>
																	)}
																</div>
															</div>

															<div className="flex items-center gap-2 mb-2">
																<Calendar className="w-3.5 h-3.5 text-slate-400" />
																<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
																	{plan.month} сарын хугацаа
																</span>
															</div>

															{savings > 0 && (
																<div className="text-xs font-semibold text-green-600 dark:text-green-400">
																	₮{savings.toLocaleString()} хэмнэнэ
																</div>
															)}

															{isSelected && (
																<div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
																	<Check className="w-4 h-4 text-white" />
																</div>
															)}
														</button>
													);
												})}
											</div>

											{selectedPlan && (
												<Button
													onClick={handleCheckout}
													disabled={isProcessingPayment}
													className="w-full h-12 text-base font-bold bg-linear-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-500/30"
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

									<div className="pt-4 border-t border-slate-200 dark:border-white/10">
										<p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
											{selectedCourses.length === 1
												? "Нэг хичээлийн янз бүрийн хугацааны төлбөрөөс сонгоно уу"
												: "Багц төлбөр сонгоснаар илүү хямд үнээр олон хичээлд хамрагдах боломжтой"}
										</p>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Mobile Cart Sidebar */}
				<AnimatePresence>
					{showCart && selectedCourses.length > 0 && (
						<>
							{/* Mobile Backdrop */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => setShowCart(false)}
								className="lg:hidden fixed inset-0 bg-black/50 z-40"
							/>

							{/* Mobile Cart Panel */}
							<motion.div
								initial={{ x: "100%", opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								exit={{ x: "100%", opacity: 0 }}
								transition={{ type: "spring", damping: 30 }}
								className="lg:hidden fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto border-l border-slate-200 dark:border-white/10"
							>
								<div className="p-6 space-y-6">
									{/* Header */}
									<div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
										<div>
											<h3 className="text-lg font-bold text-slate-900 dark:text-white">
												Миний сагс
											</h3>
											<p className="text-sm text-slate-600 dark:text-slate-400">
												{selectedCourses.length} хичээл
											</p>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setShowCart(false)}
											className="h-9 w-9 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-600 hover:text-red-600 dark:text-slate-400"
										>
											<X className="w-5 h-5" />
										</Button>
									</div>

									{/* Selected Courses */}
									<div className="space-y-3">
										{selectedCourses.map((id) => {
											const course = courses.find((c) => c.palnid === id);
											return course ? (
												<div
													key={id}
													className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
												>
													<Image
														src={course.filename}
														alt={course.title}
														width={56}
														height={56}
														className="rounded-lg object-cover shadow-sm"
													/>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-semibold text-slate-900 dark:text-white truncate mb-1">
															{course.title}
														</p>
														<p className="text-base font-bold text-primary">
															₮{course.amount.toLocaleString()}
														</p>
													</div>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleSelectCourse(course.palnid)}
														className="h-8 w-8 shrink-0 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
													>
														<X className="w-4 h-4" />
													</Button>
												</div>
											) : null;
										})}
									</div>

									{/* Total Price */}
									{selectedCourses.length > 1 && (
										<div className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
											<div className="flex items-center justify-between mb-3">
												<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
													Нийт үнэ ({selectedCourses.length} хичээл)
												</span>
												<span className="text-xl font-black text-slate-900 dark:text-white">
													₮{totalIndividualPrice.toLocaleString()}
												</span>
											</div>
											<p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
												Тус тусад нь худалдан авах үнэ
											</p>
										</div>
									)}

									{/* Plans */}
									{availablePlans.length > 0 && (
										<div className="space-y-4">
											<div className="flex items-center gap-2">
												<Tag className="w-4 h-4 text-primary" />
												<p className="text-sm font-bold text-slate-900 dark:text-white">
													Төлбөрийн сонголт
												</p>
											</div>

											<div className="space-y-3">
												{availablePlans.map((plan) => {
													const savings = calculateSavings(
														plan.amount,
														plan.month,
														plan.planid,
													);
													const savingsPercent = calculateSavingsPercent(
														plan.amount,
														plan.month,
														plan.planid,
													);
													const uniqueKey = `${plan.planid}-${plan.month}`;
													const isSelected = selectedPlan === uniqueKey;

													return (
														<button
															key={uniqueKey}
															type="button"
															onClick={() =>
																setSelectedPlan(isSelected ? null : uniqueKey)
															}
															className={cn(
																"relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden",
																isSelected
																	? "border-primary bg-primary/5 shadow-xl shadow-primary/20"
																	: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-primary/40",
															)}
														>
															{savings > 0 && (
																<Badge
																	className={cn(
																		"absolute top-3 right-3 text-xs font-bold shadow-lg",
																		isSelected
																			? "bg-primary text-white"
																			: "bg-green-500 text-white",
																	)}
																>
																	<TrendingDown className="w-3 h-3 mr-1" />-
																	{savingsPercent}%
																</Badge>
															)}

															<div className="mb-3 pr-20">
																<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
																	{plan.descr}
																</p>
																<div className="flex items-baseline gap-2 flex-wrap">
																	<p className="text-2xl font-black text-slate-900 dark:text-white">
																		₮{plan.amount.toLocaleString()}
																	</p>
																	{savings > 0 && (
																		<p className="text-sm line-through text-slate-400 dark:text-slate-500">
																			₮
																			{(plan.planid === 0
																				? (courses.find(
																						(c) =>
																							c.palnid === selectedCourses[0],
																					)?.amount || 0) * plan.month
																				: totalIndividualPrice
																			).toLocaleString()}
																		</p>
																	)}
																</div>
															</div>

															<div className="flex items-center gap-2 mb-2">
																<Calendar className="w-3.5 h-3.5 text-slate-400" />
																<span className="text-sm font-medium text-slate-600 dark:text-slate-300">
																	{plan.month} сарын хугацаа
																</span>
															</div>

															{savings > 0 && (
																<div className="text-xs font-semibold text-green-600 dark:text-green-400">
																	₮{savings.toLocaleString()} хэмнэнэ
																</div>
															)}

															{isSelected && (
																<div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
																	<Check className="w-4 h-4 text-white" />
																</div>
															)}
														</button>
													);
												})}
											</div>

											{selectedPlan && (
												<Button
													onClick={handleCheckout}
													disabled={isProcessingPayment}
													className="w-full h-12 text-base font-bold bg-linear-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-500/30"
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

									<div className="pt-4 border-t border-slate-200 dark:border-white/10">
										<p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
											{selectedCourses.length === 1
												? "Нэг хичээлийн янз бүрийн хугацааны төлбөрөөс сонгоно уу"
												: "Багц төлбөр сонгоснаар илүү хямд үнээр олон хичээлд хамрагдах боломжтой"}
										</p>
									</div>
								</div>
							</motion.div>
						</>
					)}
				</AnimatePresence>

				{/* Mobile Cart Button */}
				{selectedCourses.length > 0 && !showCart && (
					<motion.button
						initial={{ y: 100 }}
						animate={{ y: 0 }}
						exit={{ y: 100 }}
						onClick={() => setShowCart(true)}
						className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-30 hover:bg-primary/90 transition-colors"
					>
						<ShoppingCart className="w-6 h-6" />
						<div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
							<span className="text-white text-xs font-bold">
								{selectedCourses.length}
							</span>
						</div>
					</motion.button>
				)}
			</div>

			<QPayDialog
				open={showQpayModal}
				onOpenChange={setShowQpayModal}
				qpayData={qpayData}
				userId={userId || ""}
				onPaymentSuccess={() => window.location.reload()}
			/>
		</div>
	);
}
