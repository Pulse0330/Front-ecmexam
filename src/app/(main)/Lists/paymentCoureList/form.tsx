import { motion } from "framer-motion";
import { Check, Clock, RefreshCw, Trash2 } from "lucide-react";
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

		const isExpired = diffDays < 0;
		const isExpiringSoon = diffDays >= 0 && diffDays <= 7;

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
			onClick={handleClick}
			className={cn(
				"relative",
				(disabled || course.ispurchased === 1) && "cursor-default",
				course.ispurchased === 0 && !disabled && "cursor-pointer",
			)}
		>
			{/* Main Card */}
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-200",
					isSelected &&
						"border-blue-500 dark:border-blue-500 shadow-lg shadow-blue-500/20",
					course.ispurchased === 0 &&
						!disabled &&
						"hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600",
				)}
			>
				{/* Image Section */}
				<div className="relative w-full aspect-4/2 overflow-hidden bg-slate-100 dark:bg-slate-900">
					<Image
						src={course.filename}
						alt={course.title}
						fill
						loading="lazy"
						placeholder="blur"
						blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
					/>

					{/* Status Badge - Top Right */}
					{course.ispurchased === 1 && (
						<div className="absolute top-1.5 right-1.5 z-20">
							<div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
								<Check className="w-4 h-4 text-white" />
							</div>
						</div>
					)}

					{isSelected && course.ispurchased === 0 && (
						<div className="absolute top-1.5 right-1.5 z-20">
							<div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500">
								<Check className="w-4 h-4 text-white" />
							</div>
						</div>
					)}

					{/* Disabled Overlay */}
					{disabled && (
						<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
							<Badge className="bg-slate-700 text-white text-[10px]">
								Дээд тал нь 4
							</Badge>
						</div>
					)}

					{/* Expired Overlay */}
					{expiryInfo?.isExpired && (
						<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
							<Clock className="w-5 h-5 text-white mb-1" />
							<Badge className="bg-red-600 text-white text-[10px]">
								Дууссан
							</Badge>
						</div>
					)}
				</div>

				{/* Info Section */}
				<div className="p-2.5">
					<h3 className="text-xs font-semibold mb-2 line-clamp-2 leading-snug min-h-8 text-slate-800 dark:text-slate-100">
						{course.title}
					</h3>

					{/* Expiry Info */}
					{course.ispurchased === 1 && expiryInfo && !expiryInfo.isExpired && (
						<div className="mb-2">
							<div className="flex items-center gap-1 text-[10px]">
								<Clock className="w-3 h-3 text-slate-500" />
								<span className="font-medium text-slate-600 dark:text-slate-400">
									{expiryInfo.diffDays} хоног үлдлээ
								</span>
							</div>
						</div>
					)}

					{/* Price & Action */}
					<div className="flex items-center justify-between gap-2">
						{/* Action Buttons */}
						<div className="flex items-center gap-1.5">
							{course.ispurchased === 1 ? (
								(expiryInfo?.isExpired || expiryInfo?.isExpiringSoon) && (
									<Button
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											onExtend?.();
										}}
										className="h-6 px-2 text-[10px] gap-1 bg-orange-500 hover:bg-orange-600"
									>
										<RefreshCw className="w-3 h-3" />
										Сунгах
									</Button>
								)
							) : isSelected ? (
								<Button
									size="sm"
									variant="destructive"
									onClick={(e) => {
										e.stopPropagation();
										handleClick();
									}}
									className="h-6 px-2 text-[10px] gap-1"
								>
									<Trash2 className="w-3 h-3" />
									Хасах
								</Button>
							) : (
								<Button
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										handleClick();
									}}
									className="h-6 px-2 text-[10px]"
									disabled={disabled}
								>
									Сонгох
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
