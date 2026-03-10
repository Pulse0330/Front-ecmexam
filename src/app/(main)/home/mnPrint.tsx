"use client";

import jsPDF from "jspdf";
import { FileDown, Loader2 } from "lucide-react";
import { domToCanvas } from "modern-screenshot";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExamPrintItem } from "@/types/mnExam/mnPrint";

interface MnExamPrintProps {
	printList: ExamPrintItem[];
}

async function toBase64(url: string): Promise<string> {
	try {
		const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
		const res = await fetch(proxyUrl);
		if (!res.ok) return "";
		const blob = await res.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch {
		return "";
	}
}
function PrintCard({
	item,
	index,
	profileBase64,
}: {
	item: ExamPrintItem;
	index: number;
	profileBase64?: string;
}) {
	const imgSrc = profileBase64 || item.profile;

	return (
		<div
			id={`mn-print-${item.examinee_number}-${index}`}
			className="bg-white text-black flex flex-col"
			style={{
				width: "210mm",
				height: "297mm",
				fontFamily: "'Segoe UI', Arial, sans-serif",
				overflow: "hidden",
			}}
		>
			{/* Header */}
			<div></div>

			<div
				style={{
					padding: "14px 22px",
					flex: 1,
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Гарчиг */}
				<div style={{ textAlign: "center", marginBottom: "10px" }}>
					<h1 style={{ fontSize: "17px", fontWeight: 800, margin: 0 }}>
						{item.start_date.slice(0, 4)} ОНЫ ЭШ СУУДЛЫН ХУВААРЬ
					</h1>
					<h2
						style={{
							fontSize: "13px",
							fontWeight: 600,
							margin: "3px 0 0 0",
							color: "#333",
						}}
					>
						Шалгуулагчийн мэдээлэл
					</h2>
				</div>

				{/* Зураг + мэдээлэл */}
				<div style={{ display: "flex", gap: "14px", marginBottom: "14px" }}>
					<div
						style={{
							width: "76px",
							minWidth: "76px",
							height: "96px",
							border: "2px solid #1a3a6b",
							overflow: "hidden",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						{imgSrc ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={imgSrc}
								alt="profile"
								style={{ width: "100%", height: "100%", objectFit: "cover" }}
							/>
						) : (
							<div
								style={{
									fontSize: "10px",
									fontWeight: 700,
									textAlign: "center",
									color: "#1a3a6b",
									lineHeight: 1.5,
								}}
							>
								<div style={{ fontSize: "17px", fontWeight: 900 }}>3X4</div>
								<div>ЦЭЭЖ</div>
								<div>ЗУРАГ</div>
							</div>
						)}
					</div>

					<table
						style={{
							width: "100%",
							borderCollapse: "collapse",
							fontSize: "11px",
						}}
					>
						<tbody>
							{[
								["Бүртгэлийн дугаар :", item.examinee_number],
								["Сургууль :", item.schoolname],
								["Анги :", item.academic_level],
								["Бүлэг :", item.studentgroupname],
								["ЕБС-д суралцаж буй эсэх :", "Тийм"],
								["Нэр :", `${item.last_name} ${item.first_name}`],
								["Регистр :", item.register_number],
								["Хүйс :", item.gender === "M" ? "Эр" : "Эм"],
								["Имэйл :", item.mail],
								["Нас :", String(item.age)],
								["Аймаг/Хот :", item.aimag_name],
								["Дүүрэг/Сум :", item.sym_name],
								["Шалгалт өгөх газар :", item.branchname],
							].map(([label, value], _idx) => (
								<tr key={label} style={{ borderBottom: "1px solid #e5e7eb" }}>
									<td
										style={{
											padding: "2.5px 8px 2.5px 0",
											color: "#555",
											textAlign: "right",
											whiteSpace: "nowrap",
											width: "46%",
										}}
									>
										{label}
									</td>
									<td
										style={{
											padding: "2.5px 0 2.5px 8px",
											fontWeight: 500,
											color: "#111",
										}}
									>
										{value}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Хуваарийн гарчиг */}
				<p
					style={{
						fontSize: "11px",
						fontStyle: "italic",
						fontWeight: 700,
						margin: "0 0 5px 0",
					}}
				>
					Таны сонгосон хичээлүүд, суудлын хуваарь, шалгалтад ирэх хугацаа, орох
					хэсэг
				</p>

				{/* Хуваарийн хүснэгт */}
				<table
					style={{
						width: "100%",
						borderCollapse: "collapse",
						fontSize: "10.5px",
						border: "1px solid #bbb",
						marginBottom: "14px",
					}}
				>
					<thead>
						<tr style={{ background: "#f3f4f6" }}>
							{[
								"№",
								"Хичээл",
								"Шалгалтын төв",
								"Заал",
								"Суудал",
								"Огноо",
								"Эхлэх цаг",
								"Дуусах цаг",
							].map((h) => (
								<th
									key={h}
									style={{
										padding: "4px 5px",
										border: "1px solid #bbb",
										fontWeight: 600,
										textAlign: "center",
										whiteSpace: "nowrap",
									}}
								>
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						<tr>
							<td
								style={{
									padding: "4px 5px",
									border: "1px solid #bbb",
									textAlign: "center",
								}}
							>
								1.
							</td>
							<td style={{ padding: "4px 5px", border: "1px solid #bbb" }}>
								{item.name}
							</td>
							<td style={{ padding: "4px 5px", border: "1px solid #bbb" }}>
								{item.roomname}
							</td>
							<td
								style={{
									padding: "4px 5px",
									border: "1px solid #bbb",
									textAlign: "center",
								}}
							>
								{item.room_number}
							</td>
							<td
								style={{
									padding: "4px 5px",
									border: "1px solid #bbb",
									textAlign: "center",
								}}
							>
								{item.seat_number}
							</td>
							<td
								style={{
									padding: "4px 5px",
									border: "1px solid #bbb",
									textAlign: "center",
									whiteSpace: "nowrap",
								}}
							>
								{item.start_date.replace("T", " ").slice(0, 10)}
							</td>
							<td
								style={{
									padding: "4px 5px",
									border: "1px solid #bbb",
									textAlign: "center",
									whiteSpace: "nowrap",
								}}
							>
								{item.start_date.replace("T", " ").slice(11, 16)}
							</td>
							<td
								style={{
									padding: "4px 5px",
									border: "1px solid #bbb",
									textAlign: "center",
									whiteSpace: "nowrap",
								}}
							>
								{item.end_date.replace("T", " ").slice(11, 16)}
							</td>
						</tr>
					</tbody>
				</table>

				{/* QR код */}
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						marginBottom: "14px",
					}}
				>
					<div style={{ textAlign: "center" }}>
						<QRCodeSVG value={item.examinee_number} size={100} level="H" />
						<p
							style={{
								fontSize: "10px",
								fontWeight: 700,
								marginTop: "4px",
								letterSpacing: "2px",
							}}
						>
							{item.examinee_number}
						</p>
					</div>
				</div>

				{/* Санамж */}
				<div style={{ fontSize: "10.5px" }}>
					<p style={{ fontWeight: 700, margin: "0 0 5px 0" }}>САНАМЖ</p>
					<ul
						style={{
							margin: 0,
							paddingLeft: "16px",
							lineHeight: "1.85",
							color: "#222",
						}}
					>
						<li>Шалгуулагч нь суудлын хуваарийн дагуу ирж шалгалтад орно.</li>
						<li>
							Суудлын хуваарьт заасан хугацаанаас өмнө ирэх шаардлагагүй бөгөөд
							хоцорсон тохиолдолд шалгалтад оруулахгүй байхыг анхаарна уу.
						</li>
						<li>
							Шалгалтын байранд ирэх цагийн хуваарийн дагуу ирж өөрийн заасан
							орох хэсгээр нэвтрэнэ.
						</li>
						<li>Шалгалтад амны хаалт зүүж ирнэ.</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

export default function MnExamPrint({ printList }: MnExamPrintProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState(0);
	const [profileMap, setProfileMap] = useState<Record<string, string>>({});
	const [profilesLoaded, setProfilesLoaded] = useState(false);

	// Зургуудыг component mount болмогц base64 болгон хадгална
	useEffect(() => {
		if (!printList?.length) return;

		const loadProfiles = async () => {
			const map: Record<string, string> = {};
			for (const item of printList) {
				if (item.profile) {
					map[item.examinee_number] = await toBase64(item.profile);
				}
			}
			setProfileMap(map);
			setProfilesLoaded(true);
		};

		loadProfiles();
	}, [printList]);

	const handleDownloadPDF = async () => {
		if (isGenerating || !printList?.length) return;

		setIsGenerating(true);
		const pdf = new jsPDF("p", "mm", "a4", true);
		let firstPage = true;

		try {
			await new Promise((resolve) => setTimeout(resolve, 300));

			for (let i = 0; i < printList.length; i++) {
				const item = printList[i];
				const el = document.getElementById(
					`mn-print-${item.examinee_number}-${i}`,
				);

				if (el) {
					if (!firstPage) pdf.addPage();
					const canvas = await domToCanvas(el, { scale: 2 });
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
				setProgress(Math.round(((i + 1) / printList.length) * 100));
			}
			pdf.save(`MnExam_${printList[0]?.examinee_number ?? "print"}.pdf`);
		} catch (error) {
			console.error("PDF generation failed:", error);
		} finally {
			setIsGenerating(false);
			setProgress(0);
		}
	};

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={handleDownloadPDF}
				disabled={isGenerating || !profilesLoaded || !printList?.length}
				className="gap-2"
			>
				{isGenerating ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<FileDown className="h-4 w-4 text-blue-600" />
				)}
				{isGenerating
					? `Боловсруулж байна... ${progress}%`
					: !profilesLoaded
						? "Шалгалтын хуудас"
						: "Бүртгэлийн хуудас (PDF)"}
			</Button>

			{/* Hidden print area */}
			<div className="fixed -left-[2500px] top-0 overflow-hidden h-0 w-0">
				{printList.map((item, i) => (
					<PrintCard
						key={`${item.examinee_number}-${i}`}
						item={item}
						index={i}
						profileBase64={profileMap[item.examinee_number]}
					/>
				))}
			</div>
		</>
	);
}
