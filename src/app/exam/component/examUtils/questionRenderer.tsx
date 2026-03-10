"use client";

import { type JSX, memo, useMemo } from "react";
import FillInTheBlankQuestion from "@/app/exam/component/question/fillblank";
import MatchingByLine from "@/app/exam/component/question/matching";
import MultiSelectQuestion from "@/app/exam/component/question/multiselect";
import NumberInputQuestion from "@/app/exam/component/question/numberinput";
import DragAndDropQuestion from "@/app/exam/component/question/order";
import QuestionImage from "@/app/exam/component/question/questionImage";
import SingleSelectQuestion from "@/app/exam/component/question/singleSelect";
import type { AnswerValue } from "@/types/exam/exam";
import type { ExamQuestion } from "./examTypes";

interface QuestionRendererProps {
	question: ExamQuestion;
	selectedAnswer: AnswerValue | undefined;
	onAnswerChange: (questionId: number, answer: AnswerValue) => void;
	examId?: number;
	userId: number;
}

// ── Per-type renderer components ──────────────────────────────────────────────

interface TypeRendererProps {
	q: ExamQuestion;
	selectedAnswer: AnswerValue | undefined;
	onAnswerChange: (questionId: number, answer: AnswerValue) => void;
	examId?: number;
	userId: number;
}

function SingleSelectRenderer({
	q,
	selectedAnswer,
	onAnswerChange,
}: TypeRendererProps) {
	const answers = useMemo(
		() =>
			q.answers.map((a) => ({
				answer_id: a.answer_id,
				answer_name: a.answer_name,
				answer_name_html: a.answer_name_html,
				answer_img: a.answer_img ?? undefined,
				is_true: false,
			})),
		[q.answers],
	);

	return (
		<>
			{/* {(q.source_name || q.source_img) && (
				<div className="mt-3 p-3 border rounded-lg">
					{q.source_img && (
						<img
							src={q.source_img}
							alt="source"
							className="w-14 h-14 object-cover rounded-md mb-2"
						/>
					)}
					{q.source_name && (
						<div className="text-sm text-gray-700 leading-relaxed">
							<span className="font-semibold">Эх сурвалж:</span>
							<MathContent html={q.source_name} />
						</div>
					)}
				</div>
			)} */}
			<SingleSelectQuestion
				questionId={q.question_id}
				questionText={q.question_name}
				answers={answers}
				selectedAnswer={(selectedAnswer as number) ?? null}
				onAnswerChange={onAnswerChange}
			/>
		</>
	);
}

function MultiSelectRenderer({
	q,
	selectedAnswer,
	onAnswerChange,
}: TypeRendererProps) {
	const answers = useMemo(
		() =>
			q.answers.map((a) => ({
				answer_id: a.answer_id,
				answer_name_html: a.answer_name_html,
				answer_img: a.answer_img ?? undefined,
				answer_type: a.answer_type,
			})),
		[q.answers],
	);

	return (
		<MultiSelectQuestion
			questionId={q.question_id}
			questionText={q.question_name}
			answers={answers}
			mode="exam"
			selectedAnswers={(selectedAnswer as number[]) ?? []}
			onAnswerChange={onAnswerChange}
		/>
	);
}

function NumberInputRenderer({
	q,
	selectedAnswer,
	onAnswerChange,
}: TypeRendererProps) {
	return (
		<NumberInputQuestion
			questionId={q.question_id}
			questionText={q.question_name}
			answers={q.answers}
			selectedValues={(selectedAnswer as Record<number, string>) ?? {}}
			onAnswerChange={(qId, values) =>
				onAnswerChange(qId, values as AnswerValue)
			}
		/>
	);
}

function FillInTheBlankRenderer({
	q,
	selectedAnswer,
	onAnswerChange,
}: TypeRendererProps) {
	return (
		<FillInTheBlankQuestion
			questionId={q.question_id}
			questionText={q.question_name}
			value={(selectedAnswer as string) ?? ""}
			onAnswerChange={onAnswerChange}
		/>
	);
}

function DragAndDropRenderer({
	q,
	selectedAnswer,
	onAnswerChange,
	examId,
	userId,
}: TypeRendererProps) {
	const answers = useMemo(
		() =>
			q.answers.map((a) => ({
				answer_id: a.answer_id,
				answer_name_html: a.answer_name_html || a.answer_name || "",
			})),
		[q.answers],
	);

	return (
		<DragAndDropQuestion
			questionId={q.question_id}
			examId={examId}
			userId={userId}
			answers={answers}
			userAnswers={(selectedAnswer as number[]) ?? []}
			onOrderChange={(orderedIds) => onAnswerChange(q.question_id, orderedIds)}
		/>
	);
}

function MatchingRenderer({
	q,
	selectedAnswer,
	onAnswerChange,
}: TypeRendererProps) {
	const answers = useMemo(
		() =>
			q.answers.map((a) => ({
				refid: a.refid,
				answer_id: a.answer_id,
				question_id: a.ref_child_id,
				answer_name_html: a.answer_name_html,
				answer_descr: a.answer_descr,
				answer_img: a.answer_img,
				ref_child_id: a.ref_child_id,
				is_true: false,
			})),
		[q.answers],
	);

	return (
		<MatchingByLine
			answers={answers}
			onMatchChange={(matches) => onAnswerChange(q.question_id, matches)}
			userAnswers={(selectedAnswer as Record<number, number[]>) ?? {}}
		/>
	);
}

// ── Renderer lookup map ────────────────────────────────────────────────────────

type RendererFn = (props: TypeRendererProps) => JSX.Element;

const RENDERERS: Record<number, RendererFn> = {
	1: SingleSelectRenderer,
	2: MultiSelectRenderer,
	3: NumberInputRenderer,
	4: FillInTheBlankRenderer,
	5: DragAndDropRenderer,
	6: MatchingRenderer,
};

// ── Main component ─────────────────────────────────────────────────────────────

const QuestionRenderer = memo(function QuestionRenderer({
	question: q,
	selectedAnswer,
	onAnswerChange,
	examId,
	userId,
}: QuestionRendererProps) {
	const render = RENDERERS[q.que_type_id];

	if (!render) {
		if (process.env.NODE_ENV === "development") {
			console.warn(`[QuestionRenderer] Unknown que_type_id: ${q.que_type_id}`);
		}
		return null;
	}
	const questionNameWithoutImg = (q.question_name ?? "").replace(
		/<img[^>]*>/gi,
		"",
	);

	const rendererProps: TypeRendererProps = {
		q: {
			...q,
			question_name: questionNameWithoutImg,
		},
		selectedAnswer,
		onAnswerChange,
		examId,
		userId,
	};

	return (
		<>
			{q.question_img && (
				<QuestionImage src={q.question_img} alt="Асуултын зураг" />
			)}
			{render(rendererProps)}
		</>
	);
});

export default QuestionRenderer;
