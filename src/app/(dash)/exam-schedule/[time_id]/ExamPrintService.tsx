"use client";

import jsPDF from "jspdf";
import { Eye, EyeOff, FileDown } from "lucide-react";
import { domToCanvas } from "modern-screenshot";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { ExamInfoItem, ExamRoom } from "@/types/dashboard/exam.types";

export default function ExamPrintService({
	exam_rooms,
	examInfo,
}: {
	exam_rooms: ExamRoom[];
	examInfo: ExamInfoItem | undefined;
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
		<>
			<DropdownMenuItem
				onSelect={(e) => {
					e.preventDefault(); // dropdown хаагдахаас сэргийлнэ
					handleDownloadPDF();
				}}
				disabled={isGenerating}
			>
				<FileDown className="h-4 w-4" />
				{isGenerating
					? `Боловсруулж байна... ${progress}%`
					: "Эсээний хуудас хэвлэх PDF"}
			</DropdownMenuItem>
			<div
				className={`
                ${
									isPreview
										? "relative w-full flex flex-col items-center gap-8 bg-gray-200 p-8 rounded-lg overflow-auto max-h-[80vh]"
										: "absolute -left-2499.75 top-0 -z-10"
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
												{examInfo?.name}
											</h1>
											<p className="text-sm">
												{/* {examInfo.} */}
												{/* Анги: <b>{student.studentgroupname}</b> */}
												examdate? {room.room_number}-р өрөө,{" "}
												{student.seat_number} суудал
											</p>
											{/* <p className="text-xl font-bold my-1">
												{student.last_name} {student.first_name}
											</p> */}
											<div className="text-sm">
												Шалгуулагч: <b>{student.examinee_number}</b> ( РД:{" "}
												<b>{student.register_number}</b> )
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
									<div className="mt-6  p-6 flex-1 bg-white">
										<table className="w-full border-collapse text-sm">
											<tbody>
												<tr>
													<td className="pb-4 pr-8 w-1/2">
														<div className="flex gap-2 items-center">
															<span className="whitespace-nowrap">Бүлэг:</span>
															<span className="border-b border-black w-full">
																{student.studentgroupname
																	? student.studentgroupname
																	: "-"}
															</span>
														</div>
													</td>
													<td className="pb-4 pl-8 w-1/2">
														<div className="flex gap-2 items-center">
															<span className="whitespace-nowrap">Хянагч:</span>
															<span className="border-b border-black w-full">
																&nbsp;
															</span>
														</div>
													</td>
												</tr>
												<tr>
													<td className="pb-4 pr-8 w-1/2">
														<div className="flex gap-2 items-center">
															<span className="whitespace-nowrap">Нэр:</span>
															<span className="border-b border-black w-full">
																{student.first_name} {student.last_name}
															</span>
														</div>
													</td>

													<td className="pb-2 pl-8 w-1/2">
														<div className="flex gap-2 items-center">
															<span className="whitespace-nowrap">
																Гарийн үсэг:
															</span>
															<span className="border-b border-black w-full">
																&nbsp;
															</span>
														</div>
													</td>
												</tr>
											</tbody>
										</table>
										<div className="text-sm mt-6">
											<p className="mb-6">
												Өөрийн сонгож авсан сэдвээр эх зохион бичиэ үү.
											</p>
											<p>
												Бичихдээ уншигчдад сонирхолтой, өөрийн амьдралд
												тохиолдсон бодит wйл явдал, эерэг дурсамжид
												тулгуурлахаас гадна бүтэц, өнгө яас, сэдэв агуулгын
												харьцааг оночтой гаргаж, дүр дүрслэл баримт мэдээллийг
												зохистой ашиглан хэл зуй, найруулга, зөв бичийн дурмийн
												алдаагуй бичээрэй. Бичгийн соёл оноонд нөлөөлөхийг
												анхаарна уу. /Үгийн тоо: 200-250/
											</p>
										</div>
										<div className="flex-1 flex flex-col justify-around mt-4">
											{Array.from({ length: 20 }, (_, i) => i).map(
												(lineNum) => (
													<div
														key={`line-${student.id}-${lineNum}`}
														className="border-b border-gray-200 w-full"
														style={{ minHeight: "28px" }}
													/>
												),
											)}
										</div>
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
											<span className="text-xs">Хуудас (2/2)</span>
											<div className="text-sm">
												Шалгуулагч: <b>{student.examinee_number}</b> ( РД:{" "}
												<b>{student.register_number}</b> )
											</div>
										</div>
										<div className=" grayscale">
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
									<div className="flex-1 flex flex-col justify-around mt-4">
										{Array.from({ length: 32 }, (_, i) => i).map((lineNum) => (
											<div
												key={`line-${student.id}-${lineNum}`}
												className="border-b border-gray-200 w-full"
												style={{ minHeight: "28px" }}
											/>
										))}
									</div>
								</div>
							</div>
						</div>
					)),
				)}
			</div>
		</>
	);
}
