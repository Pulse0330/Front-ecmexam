"use client";

import parse from "html-react-parser";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getExamResultMore } from "@/lib/api";
import type { ExamDetail } from "@/types/exam/examresultmore";
import { mapApiResponseToExamDetail } from "@/types/exam/examresultmore";

const ExamDetailPage = () => {
	const _params = useParams();
	const examId = 8579;
	const testId = 16016; // жишээ
	const userId = 248064; // жишээ

	const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!examId) return;

		const fetchData = async () => {
			try {
				const data = await getExamResultMore(testId, examId, userId);
				const mapped = mapApiResponseToExamDetail(data);
				setExamDetail(mapped);
			} catch (error) {
				console.error("Error fetching exam detail:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return <div>Loading...</div>;
	if (!examDetail) return <div>No exam data found</div>;

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-2">
				{examDetail.examInfo.test_title}
			</h1>
			<p className="text-sm mb-4">
				Lesson: {examDetail.examInfo.lesson_name} | Student:{" "}
				{examDetail.examInfo.fname}
			</p>
			<p className="mb-6">
				Total Questions: {examDetail.examInfo.test_ttl} | Correct:{" "}
				{examDetail.examInfo.correct_ttl} | Wrong:{" "}
				{examDetail.examInfo.wrong_ttl}
			</p>

			{examDetail.questions.map((q) => (
				<div key={q.exam_que_id} className="mb-8 border-b pb-4">
					<h3 className="text-lg font-medium mb-2">{parse(q.question_name)}</h3>

					{q.question_img && (
						<Image
							src={q.question_img}
							alt={`Question ${q.exam_que_id}`}
							className="mb-2"
							width={600}
							height={400}
						/>
					)}

					<ul className="list-disc pl-5 mb-2">
						{q.answers.map((a) => (
							<li key={a.answer_id}>
								{parse(a.answer_name_html)}
								{q.userAnswer?.answer_id === a.answer_id && " ✅"}
							</li>
						))}
					</ul>

					{q.userAnswer && q.que_type_id !== 4 && (
						<p className="text-sm">
							Your Answer: {q.userAnswer.answer} ({q.userAnswer.quetype})
						</p>
					)}

					{q.explanation && (
						<div className="mt-2 p-2 bg-gray-100 rounded">
							<strong>Explanation:</strong>
							<div>{parse(q.explanation.descr)}</div>
							{q.explanation.img_file && (
								<Image
									src={q.explanation.img_file}
									alt={`Explanation for question ${q.exam_que_id}`}
									width={600}
									height={400}
								/>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default ExamDetailPage;
