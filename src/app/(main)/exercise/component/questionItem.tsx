"use client";

import { CheckCircle2, Lightbulb } from "lucide-react";
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

// Асуултын төрөл — хэрэглэгчид хэрхэн хариулахыг товч зааж өгнө
const QUESTION_TYPE_CONFIG: Record<QuestionType, { name: string }> = {
	1: { name: "Нэг сонголттой" },
	2: { name: "Олон сонголттой" },
	3: { name: "Тоо оруулах" },
	4: { name: "Нөхөх" },
	5: { name: "Дараалал" },
	6: { name: "Хослуулах" },
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
	/** Нийт асуултын тоо — "Асуулт N / M" харуулахад */
	totalCount?: number;
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
	totalCount,
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
			<div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
				<p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
					<Lightbulb className="size-4" aria-hidden="true" />
					Бодолт
				</p>
				<div className="rounded-lg bg-card p-3 text-sm leading-7 text-foreground sm:text-base">
					<MathContent html={bodolt.descr} />
				</div>
			</div>
		) : null;

	const SubmittedBodolt =
		isSubmitted && bodolt ? (
			<div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
				<p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
					<Lightbulb className="size-4" aria-hidden="true" />
					Бодолт
				</p>
				<div className="rounded-lg bg-card p-3 text-sm leading-7 text-foreground sm:text-base">
					<MathContent html={bodolt.descr} />
				</div>
			</div>
		) : null;

	return (
		<article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
			{/* Толгой: дугаар, оноо, төрөл */}
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-muted/40 px-4 py-3 sm:px-6">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
					{index + 1}
				</span>
				<span className="text-sm text-muted-foreground">
					Асуулт {index + 1}
					{totalCount ? ` / ${totalCount}` : ""}
				</span>
				<div className="ml-auto flex flex-wrap items-center gap-2">
					{question.que_onoo > 0 && (
						<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
							{question.que_onoo} оноо
						</span>
					)}
					<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
						{typeName}
					</span>
				</div>
			</div>

			<div className="space-y-6 px-4 py-5 sm:px-6 sm:py-6">
				{/* Асуултын текст */}
				<div className="space-y-4">
					<div className="w-full min-w-0 text-base leading-7 text-foreground sm:text-[17px] sm:leading-8">
						<MathContent html={question.question_name} />
					</div>
					{question.question_img && (
						<div className="mx-auto h-40 w-full max-w-3xl sm:h-50">
							<QuestionImage src={question.question_img} alt="Асуултын зураг" />
						</div>
					)}
					<SourceBlock
						sourceName={question.source_name}
						sourceTitle={question.source_title}
						sourceImg={question.source_img}
						srcAudio={question.src_audio}
					/>
				</div>

				{/* Question Content */}
				<div className="space-y-5">
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
									<div>
										<Button
											onClick={handleSubmitClick}
											className="h-11 w-full gap-2 px-5 font-semibold sm:w-auto"
										>
											<CheckCircle2 className="size-4" aria-hidden="true" />
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
								<div>
									<Button
										onClick={handleSubmitClick}
										className="h-11 w-full gap-2 px-5 font-semibold sm:w-auto"
									>
										<CheckCircle2 className="size-4" aria-hidden="true" />
										Хариултаа шалгах
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
									<div>
										<Button
											onClick={handleSubmitClick}
											className="h-11 w-full gap-2 px-5 font-semibold sm:w-auto"
										>
											<CheckCircle2 className="size-4" aria-hidden="true" />
											Хариултаа шалгах
										</Button>
									</div>
								)}
							{SubmittedBodolt}
						</>
					)}
				</div>
			</div>
		</article>
	);
});

export default QuestionItem;
