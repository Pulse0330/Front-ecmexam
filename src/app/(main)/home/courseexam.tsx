"use client";

import { Clock, CreditCard, Sparkles, Star, Tag } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types/home";

interface PaymentExamProps {
	courses: Course[];
}

const PaymentExam: React.FC<PaymentExamProps> = ({ courses }) => {
	if (!courses || courses.length === 0) {
		return (
			<div className="text-center py-16">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 mb-4">
					<Sparkles className="w-10 h-10 text-gray-400 dark:text-gray-500" />
				</div>
				<p className="text-lg font-medium text-gray-600 dark:text-gray-400">
					Одоогоор курс байхгүй байна
				</p>
				<p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
					Тун удахгүй шинэ курсууд нэмэгдэнэ
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{courses.map((course, index) => {
				const isAvailable = false;

				return (
					<div
						key={course.planid}
						className={`group relative border rounded-2xl shadow-lg p-6 transition-all duration-500 overflow-hidden ${
							isAvailable
								? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
								: "border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm"
						}`}
						style={{
							animationDelay: `${index * 100}ms`,
						}}
					>
						{/* Animated gradient orbs */}
						<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl -z-0 animate-pulse" />
						<div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 dark:from-indigo-500/10 dark:to-cyan-500/10 rounded-full blur-2xl -z-0 animate-pulse delay-75" />

						{/* Coming Soon Badge */}
						{!isAvailable && (
							<div className="absolute top-4 right-4 z-20">
								<div className="relative">
									<div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 blur-lg opacity-50 animate-pulse" />
									<div className="relative flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
										<Clock className="w-3 h-3" />
										<span>Тун удахгүй</span>
									</div>
								</div>
							</div>
						)}

						{/* Content */}
						<div className="relative z-10 space-y-5">
							{/* Title Section */}
							<div className="space-y-3">
								<div className="flex items-start justify-between gap-3">
									<h3
										className={`font-bold text-lg leading-snug line-clamp-2 flex-1 transition-colors duration-300 ${
											isAvailable
												? "text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
												: "text-gray-600 dark:text-gray-300"
										}`}
									>
										{course.title}
									</h3>
									{course.rate && (
										<div className="flex items-center gap-1 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 px-2.5 py-1.5 rounded-full shrink-0 shadow-sm">
											<Star className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500 dark:fill-emerald-400" />
											<span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
												{course.rate}
											</span>
										</div>
									)}
								</div>

								{/* Decorative divider */}
								<div className="relative h-px">
									<div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-50" />
									<div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/30 to-pink-500/0 blur-sm" />
								</div>
							</div>

							{/* Info Cards */}
							<div className="space-y-3">
								{/* Price Card */}
								<div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:shadow-md">
									<div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
										<Tag className="w-4 h-4 text-white" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">
											Үнэ
										</p>
										<p className="font-bold text-lg text-blue-700 dark:text-blue-300 truncate">
											{course.amount?.toLocaleString() || 0}₮
										</p>
									</div>
								</div>

								{/* Payment Type Card */}
								{course.paydescr && (
									<div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-100 dark:border-emerald-800/30 transition-all duration-300 hover:shadow-md">
										<div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md">
											<CreditCard className="w-4 h-4 text-white" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">
												Төлбөрийн хэлбэр
											</p>
											<p className="font-semibold text-sm text-emerald-700 dark:text-emerald-300 truncate">
												{course.paydescr}
											</p>
										</div>
									</div>
								)}
							</div>

							{/* Action Button */}
							<div className="pt-2">
								{isAvailable ? (
									<Button className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
										<span className="flex items-center justify-center gap-2">
											Дэлгэрэнгүй үзэх
											<Sparkles className="w-4 h-4" />
										</span>
									</Button>
								) : (
									<div className="relative group/btn">
										<div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-xl blur-sm opacity-50" />
										<Button
											disabled
											className="relative w-full py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-500 dark:text-gray-400 font-semibold rounded-xl shadow-inner cursor-not-allowed border border-gray-300 dark:border-gray-600"
										>
											<span className="flex items-center justify-center gap-2">
												<Clock className="w-4 h-4 animate-pulse" />
												Тун удахгүй нээгдэнэ
											</span>
										</Button>
									</div>
								)}
							</div>
						</div>

						{/* Bottom gradient accent line */}
						<div
							className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ${
								isAvailable
									? "scale-x-0 group-hover:scale-x-100"
									: "scale-x-100 opacity-30"
							}`}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default PaymentExam;
