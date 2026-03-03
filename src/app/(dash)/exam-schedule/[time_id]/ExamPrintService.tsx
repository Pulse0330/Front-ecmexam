"use client";

import jsPDF from "jspdf";
import { Eye, EyeOff, FileDown } from "lucide-react";
import { domToCanvas } from "modern-screenshot";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExamRoom } from "@/types/dashboard/exam.types";

export default function ExamPrintService({
	exam_rooms,
}: {
	exam_rooms: ExamRoom[];
}) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [isPreview, setIsPreview] = useState(false); // Preview mode
	const [progress, setProgress] = useState(0);

	const handleDownloadPDF = async () => {
		if (isGenerating) return;
		setIsGenerating(true);
		const pdf = new jsPDF("p", "mm", "a4", true);
		let firstPage = true;

		const totalStudents = exam_rooms.reduce(
			(acc, room) => acc + (room.students?.length || 0),
			0,
		);
		let processedCount = 0;

		try {
			for (const room of exam_rooms) {
				if (!room.students) continue;
				for (const student of room.students) {
					const frontEl = document.getElementById(`front-${student.id}`);
					const backEl = document.getElementById(`back-${student.id}`);

					if (frontEl) {
						if (!firstPage) pdf.addPage();
						const canvas = await domToCanvas(frontEl, {
							scale: 2,
							backgroundColor: "#ffffff",
						});
						pdf.addImage(
							canvas.toDataURL("image/jpeg", 0.9),
							"JPEG",
							0,
							0,
							210,
							297,
							undefined,
							"FAST",
						);
						firstPage = false;
					}
					if (backEl) {
						pdf.addPage();
						const canvas = await domToCanvas(backEl, {
							scale: 2,
							backgroundColor: "#ffffff",
						});
						pdf.addImage(
							canvas.toDataURL("image/jpeg", 0.9),
							"JPEG",
							0,
							0,
							210,
							297,
							undefined,
							"FAST",
						);
					}
					processedCount++;
					setProgress(Math.round((processedCount / totalStudents) * 100));
				}
			}
			pdf.save(`exams_${Date.now()}.pdf`);
		} catch (error) {
			console.error(error);
		} finally {
			setIsGenerating(false);
			setProgress(0);
		}
	};

	return (
		<div className="p-4 flex flex-col gap-6">
			{/* Control Panel */}
			<div className="flex items-center gap-3  p-4 rounded-xl border shadow-sm sticky top-0 z-50">
				<Button
					disabled={isGenerating}
					onClick={handleDownloadPDF}
					className="bg-blue-600 hover:bg-blue-700"
				>
					<FileDown className="mr-2 h-4 w-4" />
					{isGenerating ? `Боловсруулж байна... ${progress}%` : "PDF Татах"}
				</Button>

				<Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
					{isPreview ? (
						<EyeOff className="mr-2 h-4 w-4" />
					) : (
						<Eye className="mr-2 h-4 w-4" />
					)}
					{isPreview ? "Preview Хаах" : "Layout Харах"}
				</Button>
			</div>

			{/* Rendering & Preview Area */}
			<div
				className={`
                ${
									isPreview
										? "relative w-full flex flex-col items-center gap-8 bg-gray-200 p-8 rounded-lg overflow-auto max-h-[80vh]"
										: "absolute -left-[9999px] top-0 -z-10"
								}
            `}
			>
				{isPreview && (
					<div className="bg-amber-100 border border-amber-200 p-3 rounded-md text-amber-800 text-sm mb-4 w-[210mm]">
						⚠️ <b>Preview Mode:</b> Энд харагдаж буй байдал нь А4 цаасны бодит
						харьцаа (1:1) юм.
					</div>
				)}

				{exam_rooms.map((room) =>
					room.students?.map((student) => (
						<div key={student.id} className="flex flex-col gap-10">
							{/* FRONT SIDE */}
							<div className="shadow-2xl border border-gray-300">
								<div
									id={`front-${student.id}`}
									className="bg-white text-black p-[15mm] flex flex-col overflow-hidden"
									style={{
										width: "210mm",
										height: "297mm",
										fontFamily: "sans-serif",
									}}
								>
									<div
										className="flex justify-between border-b-4 border-black pb-4 shrink-0 gap-4
									"
									>
										<div className="flex flex-col gap-1 w-full ">
											<span className="text-xs">Хуудас (1/2)</span>
											<h1 className="text-2xl font-black uppercase m-0 leading-none">
												Шалгалтын хуудас
											</h1>
											<p className="text-base mt-2">
												Анги: <b>{student.studentgroupname}</b>
											</p>
											<p className="text-xl font-bold my-1">
												{student.last_name} {student.first_name}
											</p>
											<div className="text-xs text-gray-700">
												Бүртгэл: <b>{student.examinee_number}</b> | РД:{" "}
												{student.register_number}
											</div>
										</div>
										<div className="text-center">
											<QRCodeSVG
												value={JSON.stringify({
													id: student.id,
													num: student.examinee_number,
												})}
												size={100}
												level="H"
											/>
											<p className="text-[10px] font-bold mt-1 tracking-widest">
												{student.examinee_number}
											</p>
										</div>
									</div>
									<div className="mt-6 border-2 border-black p-6 flex-1 bg-white">
										<div className="grid grid-cols-2 gap-x-12 gap-y-3">
											{Array.from({ length: 28 }).map((_, i) => (
												<div
													key={i}
													className="flex items-center gap-3 border-b border-gray-200 pb-1"
												>
													<span className="font-bold w-6 text-sm text-right">
														{i + 1}.
													</span>
													<div className="flex gap-2">
														{["A", "B", "C", "D", "E"].map((choice) => (
															<div
																key={choice}
																className="w-5 h-5 border border-black rounded-full flex items-center justify-center text-[10px] font-medium"
															>
																{choice}
															</div>
														))}
													</div>
												</div>
											))}
										</div>
									</div>
									<div className="mt-4 text-[10px] text-gray-400 border-t border-dashed pt-2 flex justify-between uppercase font-bold tracking-tighter">
										<span>Exam System: BOTGO</span>
										<span>Page: 1 / 2 (Front)</span>
									</div>
								</div>
							</div>

							{/* BACK SIDE */}
							<div className="shadow-2xl border border-gray-300">
								<div
									id={`back-${student.id}`}
									className="bg-white text-black p-[15mm] flex flex-col overflow-hidden"
									style={{
										width: "210mm",
										height: "297mm",
										fontFamily: "sans-serif",
									}}
								>
									<div className="flex justify-between border-b border-black pb-2 shrink-0 items-center">
										<div>
											<p className="text-sm font-bold uppercase">
												Нэмэлт ажил, тайлбар бичих хэсэг
											</p>
											<p className="text-[11px] text-gray-600 italic">
												{student.last_name} {student.first_name} (
												{student.examinee_number})
											</p>
										</div>
										<div className="opacity-40 grayscale">
											<QRCodeSVG
												value={JSON.stringify({
													id: student.id,
													num: student.examinee_number,
												})}
												size={70}
												level="M"
											/>
										</div>
									</div>

									<div className="mt-4 border-x border-t border-black/10 flex-1 relative bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[100%_8mm]">
										<div className="absolute inset-0 p-4">
											<span className="text-[10px] text-gray-300 font-mono italic">
												Бодолт, тайлбараа энд бичнэ үү...
											</span>
										</div>
									</div>

									<div className="mt-4 flex justify-between text-[10px] text-gray-400 border-t border-dashed pt-2 uppercase font-bold tracking-tighter">
										<span>Санамж: QR кодыг бохирдуулахгүй байна уу.</span>
										<span>Page: 2 / 2 (Back)</span>
									</div>
								</div>
							</div>
						</div>
					)),
				)}
			</div>
		</div>
	);
}
