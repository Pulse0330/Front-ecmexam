"use client";

import { memo, useCallback } from "react";
import MathContent from "@/app/exam/component/examUtils/MathContent";
import { SourceBlock } from "@/app/exam/component/examUtils/sourceCard";
import QuestionImage from "@/app/exam/component/question/questionImage";
import { Button } from "@/components/ui/button";
import FillInTheBlankQuestion from "./fillinblank";
import NumberInputQuestion from "./inutNumber";
import MatchingByLine from "./matching";
import MultiSelectQuestion from "./multiselect";
import DragAndDropWrapper from "./order";
import SingleSelectQuestion from "./singleselect";

type QuestionType = 1 | 2 | 3 | 4 | 5 | 6;

const QUESTION_TYPE_CONFIG: Record<
	QuestionType,
	{ name: string; color: string }
> = {
	1: {
		name: "Нэг сонголттой",
		color:
			"bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
	},
	2: {
		name: "Олон сонголттой",
		color:
			"bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
	},
	3: {
		name: "Тоо оруулах",
		color:
			"bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
	},
	4: {
		name: "Нөхөх",
		color:
			"bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
	},
	5: {
		name: "Дараалал",
		color:
			"bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
	},
	6: {
		name: "Хослуулах",
		color:
			"bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800",
	},
};

export interface ConvertedAnswer {
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

export interface SelectedAnswer {
	questionId: number;
	answerIds: number[];
	textAnswer?: string;
	matches?: Record<number, number | string | number[]>;
	order?: number[];
}

export interface BodoltAnswer {
	question_id: number;
	descr: string;
}

interface QuestionData {
	question_id: number;
	que_type_id: number;
	question_name: string;
	que_onoo: number;
	question_img: string | null;
	source_name?: string | null;
	source_title?: string | null;
	source_img?: string | null;
	src_audio?: string | null;
}

interface QuestionItemProps {
	question: QuestionData;
	index: number;
	questionAnswers: ConvertedAnswer[];
	selected: SelectedAnswer | undefined;
	bodolt: BodoltAnswer | undefined;
	isSubmitted: boolean;
	onSingleSelect: (questionId: number, answerId: number | null) => void;
	onMultiSelect: (questionId: number, answerIds: number[]) => void;
	onFillInBlank: (questionId: number, text: string) => void;
	onOrdering: (questionId: number, orderedIds: number[]) => void;
	onMatching: (
		questionId: number,
		matches: Record<number, number | string | number[]>,
	) => void;
	onSubmit: (questionId: number) => void;
	onRestart: (questionId: number) => void;
}

const QuestionItem = memo(function QuestionItem({
	question,
	index,
	questionAnswers,
	selected,
	bodolt,
	isSubmitted,
	onSingleSelect,
	onMultiSelect,
	onFillInBlank,
	onOrdering,
	onMatching,
	onSubmit,
	onRestart,
}: QuestionItemProps) {
	const questionType = Number(question.que_type_id) as QuestionType;

	const typeConfig = QUESTION_TYPE_CONFIG[questionType];
	const typeName = typeConfig?.name || `Тодорхойгүй (${questionType})`;
	const typeColor =
		typeConfig?.color ||
		"bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800";

	const showAnswerFeedback =
		((questionType === 1 || questionType === 2 || questionType === 4) &&
			!!selected) ||
		((questionType === 3 || questionType === 5 || questionType === 6) &&
			isSubmitted);

	// Stable callbacks — questionId is captured from props (stable per item)
	const handleNumberInputChange = useCallback(
		(answers: Record<number, number | string>) => {
			onMatching(question.question_id, answers);
		},
		[onMatching, question.question_id],
	);

	const handleRestartClick = useCallback(() => {
		onRestart(question.question_id);
	}, [onRestart, question.question_id]);

	const handleSubmitClick = useCallback(() => {
		onSubmit(question.question_id);
	}, [onSubmit, question.question_id]);

	const handleOrderChange = useCallback(
		(orderedIds: number[]) => {
			onOrdering(question.question_id, orderedIds);
		},
		[onOrdering, question.question_id],
	);

	const handleMatchChange = useCallback(
		(matches: Record<number, number | string | number[]>) => {
			onMatching(question.question_id, matches);
		},
		[onMatching, question.question_id],
	);

	const correctAnswers = questionAnswers
		.slice()
		.sort((a, b) => a.refid - b.refid)
		.map((a) => a.answer_id);

	const Bodolt =
		showAnswerFeedback && bodolt ? (
			<div className="mt-4">
				<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
					<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
						📝 Бодолт:
					</p>
					<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
						<MathContent html={bodolt.descr} />
					</div>
				</div>
			</div>
		) : null;

	const SubmittedBodolt =
		isSubmitted && bodolt ? (
			<div className="mt-4">
				<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg">
					<p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
						📝 Бодолт:
					</p>
					<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg">
						<MathContent html={bodolt.descr} />
					</div>
				</div>
			</div>
		) : null;

	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border-2 border-gray-100 dark:border-gray-700">
			{/* Question Header */}
			<div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
				<div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-sm sm:text-lg shadow-lg">
					{index + 1}
				</div>
				<div className="flex-1 min-w-0">
					<div className="text-base w-full min-w-0">
						<MathContent html={question.question_name} />
					</div>
					{question.question_img && (
						<div className="w-full max-w-3xl mx-auto h-40 sm:h-50">
							<QuestionImage src={question.question_img} alt="Асуултын зураг" />
						</div>
					)}
					<SourceBlock
						sourceName={question.source_name}
						sourceTitle={question.source_title}
						sourceImg={question.source_img}
						srcAudio={question.src_audio}
					/>
					<div className="flex flex-wrap items-center gap-2 sm:gap-3">
						<span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
							Оноо: {question.que_onoo}
						</span>
						<span
							className={`text-xs sm:text-sm px-3 py-1 rounded-full border ${typeColor}`}
						>
							{typeName}
						</span>
					</div>
				</div>
			</div>

			{/* Question Content */}
			<div className="col-span-4 space-y-5">
				{/* Type 1: Single Select */}
				{questionType === 1 && (
					<>
						<SingleSelectQuestion
							questionId={question.question_id}
							questionText={question.question_name}
							answers={questionAnswers}
							mode="exam"
							selectedAnswer={selected?.answerIds[0] || null}
							onAnswerChange={onSingleSelect}
						/>
						{showAnswerFeedback && selected && Bodolt}
					</>
				)}

				{/* Type 2: Multi Select */}
				{questionType === 2 && (
					<>
						<MultiSelectQuestion
							questionId={question.question_id}
							questionText={question.question_name}
							answers={questionAnswers}
							mode="exam"
							selectedAnswers={selected?.answerIds || []}
							onAnswerChange={onMultiSelect}
						/>
						{showAnswerFeedback && selected && Bodolt}
					</>
				)}

				{/* Type 3: Number Input */}
				{questionType === 3 && (
					<>
						<NumberInputQuestion
							questionId={question.question_id}
							answers={questionAnswers}
							userAnswers={
								(selected?.matches || {}) as Record<number, number | string>
							}
							onAnswerChange={handleNumberInputChange}
							showResults={isSubmitted}
							onRestart={handleRestartClick}
						/>
						{!isSubmitted &&
							selected?.matches &&
							Object.keys(selected.matches).length > 0 && (
								<div className="mt-4">
									<Button
										onClick={handleSubmitClick}
										className="w-full sm:w-auto font-semibold shadow-lg"
									>
										Хариултаа шалгах
									</Button>
								</div>
							)}
						{SubmittedBodolt}
					</>
				)}

				{/* Type 4: Fill in Blank */}
				{questionType === 4 && (
					<>
						<FillInTheBlankQuestion
							questionId={question.question_id}
							questionText={question.question_name}
							value={selected?.textAnswer || ""}
							mode="exam"
							onAnswerChange={onFillInBlank}
						/>
						{showAnswerFeedback && selected && Bodolt}
					</>
				)}

				{/* Type 5: Ordering */}
				{questionType === 5 && (
					<>
						<DragAndDropWrapper
							questionId={question.question_id}
							answers={questionAnswers.map((a) => ({
								answer_id: a.answer_id,
								answer_name_html: a.answer_name_html || a.answer_name,
							}))}
							mode={isSubmitted ? "review" : "exam"}
							userAnswers={selected?.order || []}
							correctAnswers={correctAnswers}
							onOrderChange={handleOrderChange}
						/>
						{!isSubmitted && selected?.order && selected.order.length > 0 && (
							<div className="mt-4">
								<Button
									onClick={handleSubmitClick}
									className="w-full sm:w-auto bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
								>
									Хариултаа илгээх
								</Button>
							</div>
						)}
						{SubmittedBodolt}
					</>
				)}

				{/* Type 6: Matching */}
				{questionType === 6 && (
					<>
						<MatchingByLine
							answers={questionAnswers.map((a) => ({
								refid: a.refid,
								answer_id: a.answer_id,
								question_id: a.question_id,
								answer_name_html: a.answer_name_html,
								answer_descr: a.answer_descr,
								answer_img: a.answer_img || null,
								ref_child_id: a.ref_child_id || null,
								is_true: a.is_true,
							}))}
							onMatchChange={handleMatchChange}
							userAnswers={
								(selected?.matches || {}) as Record<number, number | number[]>
							}
						/>
						{!isSubmitted &&
							selected?.matches &&
							Object.keys(selected.matches).length > 0 && (
								<div className="mt-4">
									<Button
										onClick={handleSubmitClick}
										className="w-full sm:w-auto bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
									>
										Хариултаа илгээх
									</Button>
								</div>
							)}
						{SubmittedBodolt}
					</>
				)}
			</div>
		</div>
	);
});

export default QuestionItem;
