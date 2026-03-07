"use client";

import jsPDF from "jspdf";
import { FileDown, Loader2 } from "lucide-react";
import { domToCanvas } from "modern-screenshot";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StudentSeat } from "@/types/dashboard/exam.types";

interface ExamPrintServiceProps {
	students: StudentSeat[];
	examInfo?: { name: string };
}

export default function StudentsInfo({
	students,
	examInfo,
}: ExamPrintServiceProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState(0);

	// Нэг хуудсанд багтах мөрийн тоо
	const ROWS_PER_PAGE = 20;
	// Нийт байх ёстой мөрийн тоо (Жишээ нь 40 мөр)
	const TOTAL_ROWS = 40;

	const chunkArray = (array: any[], size: number) => {
		return Array.from({ length: Math.ceil(array.length / size) }, (v, i) =>
			array.slice(i * size, i * size + size),
		);
	};

	const handleDownloadPDF = async () => {
		if (isGenerating || !students || students.length === 0) return;

		setIsGenerating(true);
		const pdf = new jsPDF("p", "mm", "a4", true);
		let pageCount = 0;

		for (let i = 0; i < students.length; i++) {
			const student = students[i];
			const rows = Array.from({ length: TOTAL_ROWS });
			const pages = chunkArray(rows, ROWS_PER_PAGE);

			for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
				if (pageCount > 0) pdf.addPage();

				const elementId = `page-${student.id}-${pageIndex}`;
				const el = document.getElementById(elementId);

				if (el) {
					const canvas = await domToCanvas(el, { scale: 2 });
					pdf.addImage(
						canvas.toDataURL("image/jpeg", 0.9),
						"JPEG",
						0,
						0,
						210,
						297,
					);
				}
				pageCount++;
			}
			setProgress(Math.round(((i + 1) / students.length) * 100));
		}
		pdf.save("Exam_Students_List.pdf");
		setIsGenerating(false);
		setProgress(0);
	};

	return (
		<>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownloadPDF}
							disabled={isGenerating || !students.length}
							className="gap-2"
						>
							{isGenerating ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<FileDown className="h-4 w-4 text-blue-600" />
							)}
							{isGenerating
								? `Боловсруулж байна... ${progress}%`
								: "Эсээний хуудас (PDF)"}
						</Button>
					</TooltipTrigger>
					{!students.length && (
						<TooltipContent>
							<p>Суудал хуваарилаагүй байна.</p>
						</TooltipContent>
					)}
				</Tooltip>
			</TooltipProvider>

			{/* Hidden Printing Area */}
			<div className="fixed -left-2499.75 top-0 overflow-hidden">
				{students?.map((student) => {
					const pages = chunkArray(
						Array.from({ length: TOTAL_ROWS }),
						ROWS_PER_PAGE,
					);
					return pages.map((pageRows, pageIndex) => (
						<div
							key={`${student.id}-${pageIndex}`}
							id={`page-${student.id}-${pageIndex}`}
							className="bg-white p-[15mm] flex flex-col"
							style={{ width: "210mm", height: "297mm" }}
						>
							<div className="flex justify-between border-b-2 border-black pb-4 mb-4">
								<div>
									<h1 className="text-xl font-bold">{examInfo?.name}</h1>
									<p className="text-sm">
										Сурагч: {student.firstname} | Суудал: {student.seat_number}
									</p>
								</div>
								<QRCodeSVG value={student.qrcode || "N/A"} size={60} />
							</div>

							<div className="flex-1">
								{pageRows.map((_, idx) => (
									<div
										key={idx}
										className="border-b border-gray-300 h-[28px] w-full"
									/>
								))}
							</div>
							<div className="text-xs text-center mt-4">
								Хуудас {pageIndex + 1}
							</div>
						</div>
					));
				})}
			</div>
		</>
	);
}
