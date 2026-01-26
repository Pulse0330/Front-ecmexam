import { motion } from "framer-motion";
import {
	Check,
	Clock,
	Lock,
	Play,
	RefreshCw,
	ShoppingCart,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Course {
	palnid: number;
	title: string;
	expired: string;
	amount: number;
	ispay: number;
	filename: string;
	ispurchased: number;
	bill_type: number;
}

interface CourseCardProps {
	course: Course;
	isSelected?: boolean;
	onSelect?: () => void;
	onView?: () => void;
	onExtend?: () => void;
	disabled?: boolean;
}

export default function CourseCard({
	course,
	isSelected = false,
	onSelect,
	onView,
	onExtend,
	disabled = false,
}: CourseCardProps) {
	const handleClick = () => {
		if (!disabled && onSelect && course.ispurchased === 0) {
			onSelect();
		}
	};

	// Хугацаа тооцоолох функц
	const getExpiryInfo = () => {
		if (course.ispurchased === 0) return null;

		const expiryDate = new Date(course.expired);
		const today = new Date();
		const diffTime = expiryDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		// Хугацаа дууссан эсэх
		const isExpired = diffDays < 0;
		const isExpiringSoon = diffDays >= 0 && diffDays <= 7;

		// Монгол огноо форматлах
		const formatMongolianDate = (date: Date) => {
			const months = [
				"1-р сар",
				"2-р сар",
				"3-р сар",
				"4-р сар",
				"5-р сар",
				"6-р сар",
				"7-р сар",
				"8-р сар",
				"9-р сар",
				"10-р сар",
				"11-р сар",
				"12-р сар",
			];

			const year = date.getFullYear();
			const month = months[date.getMonth()];
			const day = date.getDate();

			return `${year} оны ${month}-ын ${day}`;
		};

		return {
			diffDays: Math.abs(diffDays),
			isExpired,
			isExpiringSoon,
			expiryDate: formatMongolianDate(expiryDate),
		};
	};

	const expiryInfo = getExpiryInfo();

	return (
		<motion.div
			whileHover={
				!disabled && course.ispurchased === 0
					? { y: -4, scale: 1.02 }
					: undefined
			}
			whileTap={
				!disabled && course.ispurchased === 0 ? { scale: 0.98 } : undefined
			}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			onClick={handleClick}
			className={cn(
				"relative group cursor-pointer",
				(disabled || course.ispurchased === 1) && "cursor-default",
				course.ispurchased === 1 && "scale-90",
			)}
		>
			{/* Main Card */}
			<div
				className={cn(
					"relative overflow-hidden rounded-3xl transition-all duration-500",
					isSelected
						? "bg-linear-to-br from-primary/20 via-primary/10 to-transparent shadow-2xl shadow-primary/40"
						: disabled
							? "bg-slate-100 dark:bg-slate-800/50"
							: "bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl",
				)}
			>
				{/* Animated Border */}
				{isSelected && (
					<div className="absolute inset-0 rounded-3xl bg-linear-to-r from-primary via-blue-500 to-primary p-0.5 animate-pulse">
						<div className="h-full w-full rounded-3xl bg-white dark:bg-slate-900" />
					</div>
				)}

				{/* Content Wrapper */}
				<div className="relative z-10">
					{/* Image Section */}
					<div className="relative w-full h-32 overflow-hidden rounded-t-3xl bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
						<Image
							src={course.filename}
							alt={course.title}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
							style={{ objectFit: "cover", objectPosition: "center" }}
							quality={90}
							priority={course.ispurchased === 1}
							className={cn(
								"transition-all duration-500",
								isSelected && "scale-110 brightness-110",
								!disabled &&
									!isSelected &&
									course.ispurchased === 0 &&
									"group-hover:scale-105",
							)}
						/>

						{/* Cart Badge - Top Right */}
						{course.ispurchased === 1 ? (
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{ type: "spring", stiffness: 200 }}
								className="absolute top-3 right-3 z-20"
							>
								<div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 shadow-xl shadow-green-500/50">
									<Check className="w-6 h-6 text-white font-bold" />
								</div>
							</motion.div>
						) : isSelected ? (
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{ type: "spring", stiffness: 200 }}
								className="absolute top-3 right-3 z-20"
							>
								<div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 shadow-xl shadow-green-500/50">
									<Check className="w-6 h-6 text-white font-bold" />
								</div>
							</motion.div>
						) : (
							!disabled && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								>
									<div className="flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-lg border-2 border-slate-200 dark:border-slate-700">
										<ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300" />
									</div>
								</motion.div>
							)
						)}

						{/* Disabled Overlay */}
						{disabled && (
							<div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
								<Lock className="w-8 h-8 text-white mb-2" />
								<Badge
									variant="secondary"
									className="bg-slate-700 text-white text-xs"
								>
									Дээд тал нь 4
								</Badge>
							</div>
						)}

						{/* Expired Overlay */}
						{expiryInfo?.isExpired && (
							<div className="absolute inset-0 bg-red-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
								<Clock className="w-8 h-8 text-white mb-2" />
								<Badge
									variant="secondary"
									className="bg-red-700 text-white text-xs"
								>
									Хугацаа дууссан
								</Badge>
							</div>
						)}

						{/* Glow Effect */}
						{isSelected && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="absolute inset-0 bg-primary/20 mix-blend-overlay"
							/>
						)}
					</div>

					{/* Info Section */}
					<div className="p-4">
						<h3
							className={cn(
								"text-sm font-bold mb-3 line-clamp-2 leading-snug min-h-10 transition-colors duration-300",
								isSelected
									? "text-primary dark:text-primary"
									: "text-slate-800 dark:text-slate-100",
							)}
						>
							{course.title}
						</h3>

						{/* Expiry Info - Худалдаж авсан бол */}
						{course.ispurchased === 1 &&
							expiryInfo &&
							!expiryInfo.isExpired && (
								<div className="mb-3">
									<div className="flex items-center gap-2 text-xs">
										<Clock
											className={cn(
												"w-3.5 h-3.5",
												expiryInfo.isExpiringSoon
													? "text-orange-500"
													: "text-slate-500",
											)}
										/>
										<span
											className={cn(
												"font-medium",
												expiryInfo.isExpiringSoon
													? "text-orange-500"
													: "text-slate-600 dark:text-slate-400",
											)}
										>
											{expiryInfo.isExpiringSoon && "Удахгүй дуусна: "}
											{expiryInfo.diffDays} хоног үлдсэн
										</span>
									</div>
									<div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
										Дуусах: {expiryInfo.expiryDate}
									</div>
								</div>
							)}

						{/* Price & Action */}
						<div className="flex items-center justify-between gap-2">
							<div
								className={cn(
									"text-lg font-black transition-colors duration-300",
									isSelected
										? "text-primary"
										: "text-slate-700 dark:text-slate-200",
								)}
							>
								{course.amount > 0 && course.ispurchased === 0 && (
									<span>{course.amount.toLocaleString()}₮</span>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex items-center gap-2">
								{course.ispurchased === 1 ? (
									<>
										{!expiryInfo?.isExpired && (
											<Button
												size="sm"
												onClick={(e) => {
													e.stopPropagation();
													onView?.();
												}}
												className="h-8 px-3 text-xs gap-1 bg-blue-500 hover:bg-blue-600"
											>
												<Play className="w-3.5 h-3.5" />
												Үзэх
											</Button>
										)}

										{(expiryInfo?.isExpired || expiryInfo?.isExpiringSoon) && (
											<Button
												size="sm"
												variant={expiryInfo.isExpired ? "default" : "outline"}
												onClick={(e) => {
													e.stopPropagation();
													onExtend?.();
												}}
												className={cn(
													"h-8 px-3 text-xs gap-1",
													expiryInfo.isExpired &&
														"bg-orange-500 hover:bg-orange-600",
												)}
											>
												<RefreshCw className="w-3.5 h-3.5" />
												Сунгах
											</Button>
										)}
									</>
								) : isSelected ? (
									<Button
										size="sm"
										variant="destructive"
										onClick={(e) => {
											e.stopPropagation();
											handleClick();
										}}
										className="h-8 px-3 text-xs gap-1"
									>
										<Trash2 className="w-3.5 h-3.5" />
										Хасах
									</Button>
								) : (
									<Button
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											handleClick();
										}}
										className="h-8 px-3 text-xs gap-1"
										disabled={disabled}
									>
										<ShoppingCart className="w-3.5 h-3.5" />
										Сагслах
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Accent Line */}
				{(isSelected || course.ispurchased === 1) && (
					<motion.div
						initial={{ scaleX: 0 }}
						animate={{ scaleX: 1 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
						className={cn(
							"absolute bottom-0 left-0 right-0 h-1.5",
							course.ispurchased === 1
								? "bg-linear-to-r from-transparent via-green-500 to-transparent"
								: "bg-linear-to-r from-transparent via-primary to-transparent",
						)}
					/>
				)}
			</div>

			{/* Outer Glow Ring */}
			{(isSelected || course.ispurchased === 1) && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
					className={cn(
						"absolute -inset-1 rounded-3xl blur-xl -z-10",
						course.ispurchased === 1
							? "bg-linear-to-r from-green-500/30 via-emerald-500/30 to-green-500/30"
							: "bg-linear-to-r from-primary/30 via-blue-500/30 to-primary/30",
					)}
				/>
			)}
		</motion.div>
	);
}
