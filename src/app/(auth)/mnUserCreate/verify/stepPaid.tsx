"use client";

import { CheckCircle2, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BackButton } from "./backButton";
import type { ExamItem, ExamRoom, VerifyData } from "./types";

interface StepPaidProps {
	d: VerifyData;
	selectedExam: ExamItem | null;
	selectedExamDateId: number | null;
	selectedRoomId: number | null;
	rooms: ExamRoom[];
	examineeNumber: string | null;
	onFinish: () => void;
	onBack: () => void;
}

const WEEKDAYS = ["Ням", "Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям"];

function fmtDate(iso: string) {
	const d = new Date(iso);
	const date = d.toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const weekday = WEEKDAYS[d.getDay()];
	const time = d.toLocaleTimeString("mn-MN", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return `${date} ${weekday} (${time})`;
}

export function StepPaid({
	d,
	selectedExam,
	selectedExamDateId,
	selectedRoomId,
	rooms,
	examineeNumber,
	onFinish,
	onBack,
}: StepPaidProps) {
	const year = new Date().getFullYear();
	const now = new Date().toLocaleString("mn-MN");

	const selectedDate =
		selectedExam?.exam_dates.find((ed) => ed.id === selectedExamDateId) ??
		selectedExam?.exam_dates?.[0];

	const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

	const _qrValue = `https://skuul.mn/verify?id=${examineeNumber ?? ""}&reg=${d.reg_number}&year=${year}`;

	return (
		<>
			<style>{`
        @media print {
          body > * { display: none !important; }
          #cert-printable {
            display: block !important;
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: white;
          }
          .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 10mm; }
        }
        #cert-printable { font-family: 'Times New Roman', Times, serif; color: #111; }

        .cert-header-bar {
          display: flex; align-items: center;
          padding: 14px 24px 12px;
          border-bottom: 4px solid #1a56a0;
          gap: 12px; background: white; position: relative;
        }
        .cert-header-bar::after {
          content: ''; position: absolute;
          bottom: -7px; left: 0; right: 0;
          height: 3px; background: #e8b000;
        }
        .cert-logo-box {
          width: 68px; height: 68px; border: 2px solid #1a56a0;
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; overflow: hidden; flex-shrink: 0;
          background: #f0f6ff; padding: 4px;
        }
        .cert-logo-box img { width: 100%; height: 100%; object-fit: contain; }
        .cert-logo-fallback {
          font-size: 11px; font-weight: 900; color: #1a56a0;
          letter-spacing: 1px; line-height: 1.3; text-align: center;
        }
        .cert-main-title { flex: 1; text-align: center; }
        .cert-main-title h1 {
          font-size: 24px; font-weight: 900;
          letter-spacing: 3px; color: #1a56a0; line-height: 1.1;
        }
        .cert-main-title p {
          font-size: 10.5px; color: #4b6cb7; letter-spacing: 2px;
          margin-top: 3px; font-weight: 600; text-transform: uppercase;
          font-family: Arial, sans-serif;
        }
        .cert-qr-box {
          display: flex; flex-direction: column;
          align-items: center; gap: 4px; flex-shrink: 0;
        }
        .cert-qr-box svg {
          border: 1.5px solid #1a56a0; border-radius: 4px;
          padding: 3px; background: white;
        }
        .cert-qr-label {
          font-size: 8px; color: #4b6cb7; font-weight: 700;
          letter-spacing: 0.8px; text-transform: uppercase;
          font-family: Arial, sans-serif;
        }
        .cert-body {
          position: relative; padding: 18px 28px 24px; background: white;
        }
        .cert-body::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            repeating-linear-gradient(45deg,  transparent, transparent 20px, rgba(26,86,160,0.025) 20px, rgba(26,86,160,0.025) 21px),
            repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(26,86,160,0.025) 20px, rgba(26,86,160,0.025) 21px);
          pointer-events: none;
        }
        .cert-section-label {
          text-align: center; font-size: 13px; font-weight: 700;
          margin-bottom: 14px; color: #111; letter-spacing: 0.5px;
          position: relative; z-index: 1;
        }
        .cert-info-wrap {
          display: flex; gap: 18px; align-items: flex-start;
          position: relative; z-index: 1;
        }
        .cert-photo {
          width: 108px; height: 132px; border: 1.5px solid #888;
          flex-shrink: 0; overflow: hidden; background: #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          color: #9ca3af; font-size: 11px; text-align: center;
        }
        .cert-photo img { width: 100%; height: 100%; object-fit: cover; }
        .cert-fields {
          flex: 1; display: grid;
          grid-template-columns: 162px 1fr;
          font-size: 12.5px; line-height: 1;
        }
        .cf-label {
          font-weight: 700; text-align: right;
          padding: 4px 10px 4px 0; color: #1a1a1a;
          border-bottom: 1px dotted #ddd;
        }
        .cf-value { padding: 4px 0; color: #111; border-bottom: 1px dotted #ddd; }
        .cert-table-label {
          text-align: center; font-style: italic; font-size: 12.5px;
          color: #333; margin: 16px 0 7px; position: relative; z-index: 1;
        }
        .cert-table {
          width: 100%; border-collapse: collapse;
          font-size: 12px; position: relative; z-index: 1;
        }
        .cert-table thead tr { border-top: 2px solid #222; border-bottom: 1.5px solid #222; }
        .cert-table th { padding: 5px 8px; font-weight: 700; text-align: left; font-size: 12px; white-space: nowrap; }
        .cert-table td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; vertical-align: middle; }
        .cert-table td:first-child { text-align: center; font-weight: 700; color: #1a56a0; width: 24px; }
        .cert-table tbody tr:nth-child(even) { background: #f5f8ff; }
        .cert-table tbody tr:last-child td { border-bottom: 2px solid #222; }
        .cert-footer {
          text-align: center; font-size: 10.5px; font-weight: 700;
          color: #333; margin-top: 24px; letter-spacing: 0.5px;
          position: relative; z-index: 1;
        }
      `}</style>

			{/* ── Screen ── */}
			<div className="no-print space-y-4">
				{/* Success card */}
				<div className="rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-6 text-center space-y-3">
					<div className="w-14 h-14 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto">
						<CheckCircle2 size={28} className="text-green-500" />
					</div>
					<div>
						<h2 className="text-lg font-bold">Бүртгэл амжилттай!</h2>
						<p className="text-xs text-muted-foreground mt-1">
							Шалгуулагч №{" "}
							<span className="font-mono font-bold text-foreground">
								{examineeNumber ?? "—"}
							</span>
						</p>
					</div>

					{/* Summary rows */}
					<div className="text-left rounded-xl border border-border bg-background p-3 space-y-2">
						{[
							{ label: "Нэр", value: `${d.lastname} ${d.firstname}` },
							{ label: "Регистр", value: d.reg_number, mono: true },
							{ label: "Шалгалт", value: selectedExam?.name },
							{
								label: "Өрөө",
								value: selectedRoom
									? `${selectedRoom.name} — ${selectedRoom.room_number}`
									: "—",
							},
							{
								label: "Огноо",
								value: selectedDate ? fmtDate(selectedDate.start_date) : "—",
							},
						].map((row) => (
							<div
								key={row.label}
								className="flex justify-between text-xs gap-2"
							>
								<span className="text-muted-foreground shrink-0">
									{row.label}
								</span>
								<span
									className={`font-medium text-right ${row.mono ? "font-mono" : ""}`}
								>
									{row.value || "—"}
								</span>
							</div>
						))}
					</div>
				</div>

				<Button
					onClick={() => window.print()}
					className="w-full h-12 font-bold gap-2 shadow-lg"
				>
					<Printer size={16} />
					Батламж хуудас хэвлэх
				</Button>

				<Button
					variant="outline"
					onClick={onFinish}
					className="w-full h-11 gap-2"
				>
					Дуусгах
				</Button>

				<BackButton onClick={onBack} label="Шалгалт сонгох руу буцах" />
			</div>

			{/* ── Printable certificate ── */}
			<div id="cert-printable" style={{ display: "none" }}>
				{/* HEADER */}
				<div className="cert-header-bar">
					<div className="cert-logo-box">
						<img
							src="/image/logoLogin.png"
							alt="Skuul.mn лого"
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).style.display = "none";
								const fb = (e.currentTarget as HTMLImageElement)
									.nextElementSibling as HTMLElement | null;
								if (fb) fb.style.display = "block";
							}}
						/>
						<span className="cert-logo-fallback" style={{ display: "none" }}>
							SKUUL
							<br />
							.MN
						</span>
					</div>

					<div className="cert-main-title">
						<h1>БАТЛАМЖ ХУУДАС – {year}</h1>
						<p>Skuul.mn · Боловсролын цахим платформ</p>
					</div>

					<div className="cert-qr-box">
						<span className="cert-qr-label">Баталгаажуулах</span>
					</div>
				</div>

				{/* BODY */}
				<div className="cert-body">
					<div className="cert-section-label">Шалгуулагчийн мэдээлэл</div>

					<div className="cert-info-wrap">
						<div className="cert-photo">
							{d.img_url ? (
								<img src={d.img_url} alt="Зураг" />
							) : (
								<span style={{ padding: 8 }}>
									Зураг
									<br />
									байхгүй
								</span>
							)}
						</div>

						<div className="cert-fields">
							<span className="cf-label">Бүртгэлийн дугаар :</span>
							<span
								className="cf-value"
								style={{ fontWeight: 700, color: "#1a56a0" }}
							>
								{examineeNumber ?? "—"}
							</span>

							<span className="cf-label">Сургууль :</span>
							<span className="cf-value">{d.schoolname}</span>

							<span className="cf-label">Анги :</span>
							<span className="cf-value">{d.academic_level}</span>

							<span className="cf-label">Бүлэг :</span>
							<span className="cf-value">{d.studentgroupname}</span>

							<span className="cf-label">Эцэг/эхийн нэр :</span>
							<span className="cf-value">{d.lastname}</span>

							<span className="cf-label">Нэр :</span>
							<span className="cf-value" style={{ fontWeight: 700 }}>
								{d.firstname}
							</span>

							<span className="cf-label">Регистр :</span>
							<span className="cf-value">{d.reg_number}</span>

							<span className="cf-label">Хүйс :</span>
							<span className="cf-value">
								{d.gender_code === "M" ? "Эр" : "Эм"}
							</span>

							<span className="cf-label">Имэйл :</span>
							<span className="cf-value">{d.email}</span>

							<span className="cf-label">Бүртгүүлсэн огноо :</span>
							<span className="cf-value">{now}</span>

							<span className="cf-label">Шалгалт өгөх газар :</span>
							<span className="cf-value">{d.aimag_name}</span>
						</div>
					</div>

					{selectedExam && (
						<>
							<div className="cert-table-label">
								Танд сонгосон хичээлүүд, суудлын хуваарь
							</div>
							<table className="cert-table">
								<thead>
									<tr>
										<th>№</th>
										<th>Хичээл</th>
										<th>Шалгалтын төв</th>
										<th>Заал</th>
										<th>Суудал</th>
										<th>Огноо</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>1</td>
										<td style={{ fontWeight: 600 }}>{selectedExam.name}</td>
										<td>{selectedRoom?.branchname ?? d.aimag_name}</td>
										<td style={{ textAlign: "center" }}>
											{selectedRoom?.room_number ??
												selectedDate?.exam_skuul_id ??
												"—"}
										</td>
										<td style={{ textAlign: "center" }}>—</td>
										<td>
											{selectedDate ? fmtDate(selectedDate.start_date) : "—"}
										</td>
									</tr>
								</tbody>
							</table>
						</>
					)}

					<div className="cert-footer">
						SKUUL.MN – БОЛОВСРОЛЫН ЦАХИМ ПЛАТФОРМ © 2019 – {year}
					</div>
				</div>
			</div>
		</>
	);
}
