import type React from "react";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";

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
	onAnswerChange?: (
		questionId: number,
		answerId: number,
		value: string,
	) => void;
}

const NumberInputQuestion: React.FC<NumberInputQuestionProps> = ({
	questionId,
	questionText,
	answers,
	onAnswerChange,
}) => {
	// Хариултуудын утгыг хадгалах state
	const [values, setValues] = useState<Record<number, string>>(() =>
		answers.reduce(
			(acc, ans) => {
				acc[ans.answer_id] = "";
				return acc;
			},
			{} as Record<number, string>,
		),
	);

	const handleChange = useCallback(
		(answerId: number, val: string) => {
			if (!/^\d*$/.test(val)) return; // зөвхөн тоо зөвшөөрнө
			const newValues = { ...values, [answerId]: val };
			setValues(newValues);
			onAnswerChange?.(questionId, answerId, val);
		},
		[questionId, values, onAnswerChange],
	);

	return (
		<div className="space-y-3">
			{questionText && <p className="text-sm font-medium">{questionText}</p>}
			<div className="flex flex-col gap-2">
				{answers.map((ans, idx) => (
					<div key={ans.answer_id}>
						<label
							htmlFor={`number-input-${ans.answer_id}`}
							className="text-sm text-gray-600"
						>
							{String.fromCharCode(97 + idx)}=
						</label>
						<Input
							id={`number-input-${ans.answer_id}`} // label-тэй холбоо
							type="text"
							value={values[ans.answer_id]}
							onChange={(e) => handleChange(ans.answer_id, e.target.value)}
							className="max-w-xs"
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default NumberInputQuestion;
