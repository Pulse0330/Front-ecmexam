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
			<div className="shrink-0 text-sm font-bold text-green-600 dark:text-green-400">
				✓
			</div>
		) : (
			<div className="shrink-0 text-sm font-bold text-red-600 dark:text-red-400">
				✗
			</div>
		);
	};

	return (
		<div className="space-y-3">
			<div className="grid gap-2">
				{answers.map((answer) => (
					<div
						key={answer.answer_id}
						className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/40 p-3"
					>
						{/* Variable Label */}
						<div className="shrink-0">
							<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
								<span className="text-base font-semibold text-primary">
									{answer.answer_name || "?"}
								</span>
							</div>
						</div>

						{/* Equals sign */}
						<div className="shrink-0 font-medium text-muted-foreground">=</div>

						{/* Input field */}
						<div className="min-w-0 flex-1">
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
								className={`h-11 w-full px-3 text-base border rounded-md
									focus:outline-none focus:ring-2 focus:ring-primary
									bg-background text-foreground
									placeholder:text-muted-foreground
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
								<div className="shrink-0 text-sm font-medium text-green-700 dark:text-green-400">
									→ {answer.answer_name_html}
								</div>
							)}
					</div>
				))}
			</div>

			{/* Show all correct answers when results are displayed */}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-xs text-muted-foreground">
					Бүх хувьсагчдын утгыг оруулна уу. Бутархай тоо бол цэг (.) ашиглана.
				</div>

				{showResults && onRestart ? (
					<Button
						onClick={handleRestart}
						variant="outline"
						className="h-10 font-medium"
					>
						Дахин оролдох
					</Button>
				) : (
					!showResults &&
					Object.keys(userAnswers).some(
						(key) => userAnswers[Number(key)] !== "",
					) && (
						<Button
							onClick={handleReset}
							variant="outline"
							className="h-10 font-medium"
						>
							Арилгах
						</Button>
					)
				)}
			</div>
		</div>
	);
};

export default NumberInputQuestion;
