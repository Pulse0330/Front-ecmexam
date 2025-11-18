"use client";

import { CreditCard, Star, Tag } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types/home";

interface PaymentExamProps {
	courses: Course[];
}

const PaymentExam: React.FC<PaymentExamProps> = ({ courses }) => {
	if (!courses || courses.length === 0) {
		return (
			<div className="text-center py-12 text-gray-500 dark:text-gray-400">
				<p className="text-lg">Одоогоор курс байхгүй байна</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{courses.map((course, index) => (
				<div
					key={course.planid}
					className="group relative border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-2xl dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70 p-6 bg-white dark:bg-gray-800 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4"
					style={{ animationDelay: `${index * 100}ms` }}
				>
					{/* Gradient Overlay */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-3xl -z-0 group-hover:scale-150 transition-transform duration-500" />

					{/* Header */}
					<div className="relative z-10 space-y-4">
						{/* Title */}
						<div className="flex items-start justify-between gap-2">
							<h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
								{course.title}
							</h3>
							{course.rate && (
								<div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full shrink-0">
									<Star className="w-4 h-4 text-green-500 fill-green-500" />
									<span className="text-sm font-semibold ">{course.rate}</span>
								</div>
							)}
						</div>

						{/* Divider */}
						<div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

						{/* Details */}
						<div className="space-y-3">
							{/* Price */}
							<div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
								<div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
									<Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="flex-1">
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Үнэ
									</p>
									<p className="font-bold text-lg text-blue-600 dark:text-blue-400">
										{course.amount?.toLocaleString()}₮
									</p>
								</div>
							</div>

							{/* Payment Type */}
							{course.paydescr && (
								<div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
									<div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
										<CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
									</div>
									<div className="flex-1">
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Төлбөр
										</p>
										<p className="font-medium text-sm">{course.paydescr}</p>
									</div>
								</div>
							)}
						</div>

						{/* Action Button */}
						<Button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
							Дэлгэрэнгүй үзэх
						</Button>
					</div>

					{/* Bottom gradient accent */}
					<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
				</div>
			))}
		</div>
	);
};

export default PaymentExam;
