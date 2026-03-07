"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
} from "@/components/ui/tooltip"; // Shadcn tooltip импортлох
import { getExamPrintList } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ExamInfoItem, StudentSeat } from "@/types/dashboard/exam.types";

interface ExamPrintServiceProps {
	examInfo: ExamInfoItem | undefined;
	timeId: number;
	roomId: number; // activeRoom-ын оронд шууд id авна
	students?: StudentSeat[]; // ← нэмэх
}

export default function ExamPrintService({
	examInfo,
	timeId,
	roomId,
	students = [], // ← нэмэх
}: ExamPrintServiceProps) {
	const { userId } = useAuthStore();
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState(0);

	const { data: printList, isLoading } = useQuery({
		queryKey: ["get_print_list", timeId, userId, roomId],
		queryFn: () =>
			getExamPrintList({
				userId: Number(userId) || 0,
				examDateId: Number(timeId),
				examId: Number(examInfo?.exam_id),
				esisroomid: Number(roomId),
			}),
		enabled: !!userId && !!timeId && !!roomId,
		select: (res) => res.RetData,
	});

	const handleDownloadPDF = async () => {
		if (isGenerating || !printList || printList.length === 0) return;

		setIsGenerating(true);
		const pdf = new jsPDF("p", "mm", "a4", true);
		let firstPage = true;

		try {
			// Жижиг хүлээлт нэмэх
			await new Promise((resolve) => setTimeout(resolve, 500));

			for (let i = 0; i < printList.length; i++) {
				const item = printList[i];
				const frontEl = document.getElementById(
					`front-${item.register_number}`,
				);
				const backEl = document.getElementById(`back-${item.register_number}`);

				if (frontEl) {
					if (!firstPage) pdf.addPage();
					const canvas = await domToCanvas(frontEl, { scale: 2 });
					pdf.addImage(
						canvas.toDataURL("image/jpeg", 0.9),
						"JPEG",
						0,
						0,
						210,
						297,
					);
					firstPage = false;
				}

				if (backEl) {
					pdf.addPage();
					const canvas = await domToCanvas(backEl, { scale: 2 });
					pdf.addImage(
						canvas.toDataURL("image/jpeg", 0.9),
						"JPEG",
						0,
						0,
						210,
						297,
					);
				}
				setProgress(Math.round(((i + 1) / printList.length) * 100));
			}
			pdf.save(`Exam_List_${roomId}.pdf`);
		} catch (error) {
			console.error("PDF generation failed:", error);
		} finally {
			setIsGenerating(false);
			setProgress(0);
		}
	};

	const allReady =
		students.length > 0 && students.every((s) => s.status_code === 3);

	return (
		<>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="inline-block">
							<Button
								variant="outline"
								size="sm"
								onClick={handleDownloadPDF}
								disabled={
									isGenerating ||
									!printList ||
									printList.length === 0 ||
									isLoading ||
									!allReady
								}
								className="gap-2"
							>
								{isGenerating || isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<FileDown className="h-4 w-4 text-blue-600" />
								)}
								{isGenerating
									? `Боловсруулж байна... ${progress}%`
									: "Эсээний хуудас (PDF)"}
							</Button>
						</div>
					</TooltipTrigger>

					{/* Хэрэв printList хоосон бол Tooltip-ийг харуулна */}
					{(isGenerating ||
						!printList ||
						printList.length === 0 ||
						isLoading ||
						!allReady) && (
						<TooltipContent>
							<p className="max-w-xs text-center">
								Суудал хуваарилах , Вариант хуваарилах бүх сурагчид амжилтай
								болсны дараа хэвлэх боломжтой.
							</p>
						</TooltipContent>
					)}
				</Tooltip>
			</TooltipProvider>

			{/* Hidden Printing Area */}
			<div className="fixed -left-2499.75 top-0 overflow-hidden h-0 w-0">
				{printList?.map((item) => (
					<div key={item.register_number} className="flex flex-col gap-10">
						{/* FRONT SIDE */}
						<div className="shadow-2xl border border-gray-300">
							<div
								id={`front-${item.register_number}`}
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
											{/* Анги: <b>{item.studentgroupname}</b> */}
											{format(item.exam_date, "yyyy-MM-dd")}, {item.room_number}
											-р өрөө, {item.seat_number} суудал
										</p>
										{/* <p className="text-xl font-bold my-1">
												{item.last_name} {item.first_name}
											</p> */}
										<div className="text-sm">
											Шалгуулагч: <b>{item.examinee_number}</b> ( РД:{" "}
											<b>{item.register_number}</b> )
										</div>
									</div>
									<div className="text-center">
										<QRCodeSVG value={item.qrcode} size={100} level="H" />
										<p className="text-[10px] font-bold mt-1 tracking-widest">
											{item.examinee_number}
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
														<span className=" border-black w-full">
															{item.studentgroupname}
														</span>
													</div>
												</td>
												<td className="pb-4 pl-8 w-1/2">
													<div className="flex gap-2 items-center">
														<span className="whitespace-nowrap">Хянагч:</span>
														<span className="border-b border-black w-full border-dashed">
															&nbsp;
														</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="pb-4 pr-8 w-1/2">
													<div className="flex gap-2 items-center">
														<span className="whitespace-nowrap">Нэр:</span>
														<span className=" border-black w-full">
															{item.firstname}
														</span>
													</div>
												</td>

												<td className="pb-2 pl-8 w-1/2">
													<div className="flex gap-2 items-center">
														<span className="whitespace-nowrap">
															Гарийн үсэг:
														</span>
														<span className="border-b border-black w-full border-dashed">
															&nbsp;
														</span>
													</div>
												</td>
											</tr>
										</tbody>
									</table>
									<div className="text-sm mt-6">
										<p className="mb-6">
											Өөрийн сонгосон сэдвээр эх зохион бич. Уншигчдад
											сонирхолтой, амьдралын бодит үйл явдал, эерэг дурсамжид
											тулгуурлан бичнэ. Бүтэц, өнгө аяс, сэдвийн уялдааг зөв
											гаргаж, уран дүрслэл, баримт мэдээллийг зохистой ашиглан
											хэл найруулга, зөв бичгийн дүрмийг баримтал. Үгийн тоо:
											200–250.
										</p>
									</div>
									<div className="flex-1 flex flex-col justify-around mt-4">
										{Array.from({ length: 20 }, (_, i) => i).map((lineNum) => (
											<div
												key={`line-${item.qrcode}-${lineNum}`}
												className="border-b border-black w-full"
												style={{ minHeight: "28px" }}
											/>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* BACK SIDE */}
						<div className="shadow-2xl border border-gray-300">
							<div
								id={`back-${item.qrcode}`}
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
										<div className="text-sm w-full">
											Шалгуулагч: <b>{item.examinee_number}</b> ( РД:{" "}
											<b>{item.register_number}</b> )
										</div>
									</div>
									<div className=" grayscale">
										<QRCodeSVG value={item.qrcode} size={70} level="M" />
									</div>
								</div>
								<div className="flex-1 flex flex-col justify-around mt-4">
									{Array.from({ length: 32 }, (_, i) => i).map((lineNum) => (
										<div
											key={`line-${item.qrcode}-${lineNum}`}
											className="border-b border-black w-full"
											style={{ minHeight: "28px" }}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
