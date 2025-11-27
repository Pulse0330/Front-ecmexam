import type React from "react";
import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import type { AnswerValue } from "@/types/exam/exam"; // ✅ Add this import

interface AnswerData {
	answer_id: number;
	answer_name?: string;
	answer_name_html?: string;
	source_img?: string;
}

interface NumberInputQuestionProps {
	questionId: number;
	questionText?: string;
	answers: AnswerData[];
	selectedValues?: Record<number, string>;
	onAnswerChange?: (questionId: number, values: AnswerValue) => void; // ✅ Now it will work
}

const NumberInputQuestion: React.FC<NumberInputQuestionProps> = ({
	questionId,
	questionText,
	answers,
	selectedValues = {},
	onAnswerChange,
}) => {
	const values = useMemo(() => {
		const result: Record<number, string> = {};
		answers.forEach((ans) => {
			result[ans.answer_id] = selectedValues[ans.answer_id] || "";
		});
		return result;
	}, [selectedValues, answers]);

	const handleChange = useCallback(
		(answerId: number, val: string) => {
			if (!/^\d*$/.test(val)) return;

			const newValues = { ...values, [answerId]: val };
			onAnswerChange?.(questionId, newValues);
		},
		[questionId, values, onAnswerChange],
	);

	return (
		<div className="space-y-3">
			{questionText && <p className="text-sm font-medium">{questionText}</p>}
			<div className="flex flex-col gap-2">
				{answers.map((ans, idx) => (
					<div key={ans.answer_id} className="flex items-center gap-2">
						<label
							htmlFor={`number-input-${ans.answer_id}`}
							className="text-sm text-gray-600 min-w-[2rem]"
						>
							{String.fromCharCode(97 + idx)}=
						</label>
						<Input
							id={`number-input-${ans.answer_id}`}
							type="text"
							inputMode="numeric"
							value={values[ans.answer_id]}
							onChange={(e) => handleChange(ans.answer_id, e.target.value)}
							placeholder="0"
							className="max-w-xs"
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default NumberInputQuestion;
