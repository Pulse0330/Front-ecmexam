import type { Answer, Question } from "@/types/exam/exam";

export type ExamQuestion = Omit<Question, "question_img"> & {
	question_img: string;
	answers: Answer[];
};
