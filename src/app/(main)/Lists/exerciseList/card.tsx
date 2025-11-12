import type { TestGroupItem } from "@/types/exercise/testGroup";

interface TestGroupCardProps {
	item: TestGroupItem;
}

export default function TestGroupCard({ item }: TestGroupCardProps) {
	const getPercentColor = (percent: number) => {
		if (percent >= 80)
			return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
		if (percent >= 60)
			return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
		if (percent >= 40)
			return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
		return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
	};

	const getPercentBorder = (percent: number) => {
		if (percent >= 80) return "border-green-200 dark:border-green-800";
		if (percent >= 60) return "border-blue-200 dark:border-blue-800";
		if (percent >= 40) return "border-yellow-200 dark:border-yellow-800";
		return "border-red-200 dark:border-red-800";
	};

	return (
		<div
			className={`group  rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${getPercentBorder(item.tpercent)} hover:scale-105`}
		>
			{/* Card Header */}
			<div className=" p-5">
				<h3 className="text-lg font-bold text-white line-clamp-2 mb-1">
					{item.name}
				</h3>
				<div className="flex items-center gap-2">
					<span
						className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${getPercentColor(item.tpercent)}`}
					>
						{item.tpercent}%
					</span>
				</div>
			</div>

			{/* Card Body */}
			<div className="p-5 space-y-4">
				{/* Course Info */}
				<div className="space-y-2">
					<div className="flex items-start gap-3">
						<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
							<svg
								className="w-5 h-5 text-blue-600 dark:text-blue-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Хичээлийн дүрс</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
								/>
							</svg>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
								Хичээл
							</p>
							<p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
								{item.coursename}
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
							<svg
								className="w-5 h-5 text-purple-600 dark:text-purple-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Файл дүрс</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
								Хичээлийн нэр
							</p>
							<p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
								{item.ulesson_name}
							</p>
						</div>
					</div>
				</div>

				{/* Stats */}
				<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<svg
								className="w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Тестийн тоо</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							<span className="text-sm text-gray-600 dark:text-gray-400">
								Тестийн тоо:
							</span>
						</div>
						<span className="text-lg font-bold text-gray-900 dark:text-white">
							{item.cnt}
						</span>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
						<span>Прогресс</span>
						<span className="font-semibold">{item.tpercent}%</span>
					</div>
					<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
						<div
							className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
							style={{ width: `${item.tpercent}%` }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
