import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ExamMinimapProps {
	totalCount: number;
	answeredCount: number;
	currentQuestionIndex?: number;
	selectedAnswers: Record<number, number | null>;
	questions: Array<{ question_id: number }>;
	onQuestionClick?: (index: number) => void;
	timerComponent?: ReactNode;
}

export default function ExamMinimap({
	totalCount,
	answeredCount,
	currentQuestionIndex,
	selectedAnswers,
	questions,
	onQuestionClick,
}: ExamMinimapProps) {
	const progressPercentage =
		totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

	return (
		<Card className="shadow-xl border-t-4 border-blue-500 sticky top-4 overflow-hidden">
			<CardHeader className="p-4 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
				<CardTitle className="text-lg font-bold flex items-center gap-2">
					<Clock className="w-5 h-5 text-blue-600" />
					Явц
				</CardTitle>
			</CardHeader>
			<CardContent className="p-4 space-y-4">
				{/* Progress хэсэг - Сайжруулсан */}
				<div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
					<div className="flex justify-between items-center mb-3">
						<span className="text-sm font-medium text-gray-700">Хариулсан</span>
						<span className="text-2xl font-bold text-blue-600">
							{answeredCount}
							<span className="text-sm text-gray-500">/{totalCount}</span>
						</span>
					</div>
					<Progress value={progressPercentage} className="h-3 bg-gray-200" />
					<div className="flex justify-between items-center mt-2">
						<span className="text-xs text-gray-500">
							Үлдсэн: {totalCount - answeredCount}
						</span>
						<span className="text-sm font-bold text-blue-600">
							{progressPercentage}%
						</span>
					</div>
				</div>

				{/* Minimap Grid - Сайжруулсан */}
				<div className="border-t pt-4">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-semibold text-gray-700">Асуултууд</h3>
						<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
							{questions.length} асуулт
						</span>
					</div>
					<div className="grid grid-cols-5 gap-2">
						{questions.map((q, index) => {
							const isAnswered =
								selectedAnswers[q.question_id] !== null &&
								selectedAnswers[q.question_id] !== undefined;
							const isCurrent = currentQuestionIndex === index;

							return (
								<Button
									key={q.question_id}
									onClick={() => onQuestionClick?.(index)}
									className={cn(
										"aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 relative group",
										"hover:scale-110 hover:shadow-md active:scale-95",
										isAnswered
											? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-sm hover:from-green-500 hover:to-green-700"
											: "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300",
										isCurrent &&
											"ring-3 ring-blue-500 ring-offset-2 shadow-lg scale-105",
									)}
									title={`Асуулт ${index + 1}${isAnswered ? " ✓ Хариулсан" : " • Хариулаагүй"}`}
								>
									<span className="relative z-10">{index + 1}</span>
									{isAnswered && (
										<CheckCircle2 className="w-3 h-3 absolute top-0 right-0 text-white opacity-80" />
									)}
									{isCurrent && (
										<div className="absolute inset-0 bg-blue-500 opacity-20 rounded-lg animate-pulse" />
									)}
								</Button>
							);
						})}
					</div>
				</div>

				{/* Статистик мэдээлэл */}
				<div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
					<div className="flex items-center justify-between text-xs">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-gradient-to-br from-green-400 to-green-600" />
							<span className="text-gray-600 font-medium">Хариулсан</span>
						</div>
						<span className="font-bold text-green-600">{answeredCount}</span>
					</div>
					<div className="flex items-center justify-between text-xs">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded bg-gradient-to-br from-gray-100 to-gray-200" />
							<span className="text-gray-600 font-medium">Хариулаагүй</span>
						</div>
						<span className="font-bold text-gray-600">
							{totalCount - answeredCount}
						</span>
					</div>
					{currentQuestionIndex !== undefined && (
						<div className="flex items-center justify-between text-xs pt-2 border-t">
							<div className="flex items-center gap-2">
								<Circle className="w-3 h-3 text-blue-500 fill-blue-500" />
								<span className="text-gray-600 font-medium">Одоогийн</span>
							</div>
							<span className="font-bold text-blue-600">
								№{currentQuestionIndex + 1}
							</span>
						</div>
					)}
				</div>

				{/* Мотиваци текст */}
				{answeredCount === 0 && (
					<div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
						<p className="text-xs text-blue-700 font-medium">
							🚀 Эхлүүлцгээе! Анхны асуултаа хариулаарай.
						</p>
					</div>
				)}
				{answeredCount > 0 && answeredCount < totalCount && (
					<div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
						<p className="text-xs text-yellow-700 font-medium">
							💪 Сайн байна! {totalCount - answeredCount} асуулт үлдлээ.
						</p>
					</div>
				)}
				{answeredCount === totalCount && (
					<div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
						<p className="text-xs text-green-700 font-medium">
							🎉 Бүх асуултыг хариулсан! Шалгалтаа дуусгаарай.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
