import type React from "react";
import { Button } from "@/components/ui/button";

interface Answer {
	answer_id: number;
	question_id: number;
	answer_name: string;
	answer_name_html: string;
	answer_descr: string;
	answer_img?: string;
	answer_type: number;
	refid: number;
	ref_child_id: number | null;
	is_true: boolean;
}

interface NumberInputQuestionProps {
	questionId: number;
	answers: Answer[];
	userAnswers: Record<number, number | string>;
	onAnswerChange: (answers: Record<number, number | string>) => void;
	showResults?: boolean;
	onRestart?: () => void;
}

const NumberInputQuestion: React.FC<NumberInputQuestionProps> = ({
	answers,
	userAnswers,
	onAnswerChange,
	showResults = false,
	onRestart,
}) => {
	const handleInputChange = (answerId: number, value: string) => {
		// Allow numbers, decimal point, and negative sign
		const numericValue = value.replace(/[^0-9.-]/g, "");
		const parsedValue = numericValue === "" ? "" : numericValue;

		const updatedAnswers = {
			...userAnswers,
			[answerId]: parsedValue,
		};

		onAnswerChange(updatedAnswers);
	};

	const handleReset = () => {
		// Clear all answers by creating empty object with only answer IDs
		const emptyAnswers: Record<number, number | string> = {};
		answers.forEach((answer) => {
			emptyAnswers[answer.answer_id] = "";
		});
		onAnswerChange(emptyAnswers);
	};

	const handleRestart = () => {
		// Reset everything and call onRestart callback
		handleReset();
		if (onRestart) {
			onRestart();
		}
	};

	const isCorrect = (answer: Answer): boolean => {
		const userValue = String(userAnswers[answer.answer_id] || "").trim();
		const correctValue = String(answer.answer_name_html || "").trim();

		if (!userValue) return false;

		// Compare as numbers to handle "2.0" vs "2"
		const userNum = parseFloat(userValue);
		const correctNum = parseFloat(correctValue);

		return (
			!Number.isNaN(userNum) &&
			!Number.isNaN(correctNum) &&
			Math.abs(userNum - correctNum) < 0.0001
		);
	};

	const getInputBorderClass = (answer: Answer): string => {
		if (!showResults) {
			return "border-gray-300 dark:border-gray-600";
		}

		const userValue = userAnswers[answer.answer_id];
		if (!userValue && userValue !== 0) {
			return "border-gray-300 dark:border-gray-600";
		}

		return isCorrect(answer)
			? "border-gray-400 dark:border-gray-500"
			: "border-gray-400 dark:border-gray-500";
	};

	const getResultIcon = (answer: Answer) => {
		if (!showResults) return null;

		const userValue = userAnswers[answer.answer_id];
		if (!userValue && userValue !== 0) return null;

		return isCorrect(answer) ? (
			<div className="shrink-0 text-xs text-gray-600 dark:text-gray-400">✓</div>
		) : (
			<div className="shrink-0 text-xs text-gray-600 dark:text-gray-400">✗</div>
		);
	};

	return (
		<div className="space-y-3">
			<div className="grid gap-2">
				{answers.map((answer) => (
					<div
						key={answer.answer_id}
						className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
					>
						{/* Variable Label */}
						<div className="shrink-0">
							<div className="w-10 h-10 rounded bg-gray-700 dark:bg-gray-600 flex items-center justify-center">
								<span className="text-white font-semibold text-base">
									{answer.answer_name || "?"}
								</span>
							</div>
						</div>

						{/* Equals sign */}
						<div className="shrink-0 text-gray-400 dark:text-gray-500 font-medium">
							=
						</div>

						{/* Input field */}
						<div className="flex-1">
							<input
								id={`input-${answer.answer_id}`}
								type="text"
								inputMode="decimal"
								value={userAnswers[answer.answer_id] ?? ""}
								onChange={(e) =>
									handleInputChange(answer.answer_id, e.target.value)
								}
								placeholder="..."
								disabled={showResults}
								className={`w-full px-3 py-2 text-sm border rounded
									focus:outline-none focus:ring-1 focus:ring-orange-500
									bg-white dark:bg-gray-900 text-gray-900 dark:text-white
									placeholder-gray-400
									disabled:opacity-60 disabled:cursor-not-allowed
									${getInputBorderClass(answer)}`}
							/>
						</div>

						{/* Result Icon */}
						{getResultIcon(answer)}

						{/* Show correct answer if results are shown and answer is wrong */}
						{showResults &&
							userAnswers[answer.answer_id] &&
							!isCorrect(answer) && (
								<div className="shrink-0 text-xs text-gray-600 dark:text-gray-400 font-medium">
									→ {answer.answer_name_html}
								</div>
							)}
					</div>
				))}
			</div>

			{/* Show all correct answers when results are displayed */}

			<div className="flex items-center justify-between gap-4">
				<div className="text-xs text-gray-500 dark:text-gray-400">
					Бүх хувьсагчдын утгыг оруулна уу. Бутархай тоо бол цэг (.) ашиглана.
				</div>

				{showResults && onRestart ? (
					<Button onClick={handleRestart} className="text-xs font-medium">
						Дахин оролдох
					</Button>
				) : (
					!showResults &&
					Object.keys(userAnswers).some(
						(key) => userAnswers[Number(key)] !== "",
					) && (
						<Button onClick={handleReset} className="text-xs  font-medium">
							Арилгах
						</Button>
					)
				)}
			</div>
		</div>
	);
};

export default NumberInputQuestion;
