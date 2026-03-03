"use client";

import { AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";
import type { QPayInvoiceResponse } from "@/types/Qpay/qpayinvoice";
import QPayDialog from "./qpayDialog";
import { StepSelectExam } from "./StepSelectExam";
import { StepPaid } from "./stepPaid";
import { StepPreview } from "./stepPreview";
import type {
	ExamItem,
	ExamineeItem,
	ExamRoom,
	Step,
	VerifyData,
} from "./types";
import { API_BASE } from "./utils";

export type { VerifyData };

export default function VerifyForm({ data: d }: { data: VerifyData }) {
	const router = useRouter();
	const [step, setStep] = useState<Step>("preview");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [qpayError, setQpayError] = useState("");
	const [isPaid, setIsPaid] = useState(false);
	const [examineeNumber, setExamineeNumber] = useState<string | null>(null);
	const [rooms, setRooms] = useState<ExamRoom[]>([]);
	const [roomsLoading, setRoomsLoading] = useState(false);
	const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
	const [examinee, setExaminee] = useState<ExamineeItem | null>(null);
	const [_examineeLoading, setExamineeLoading] = useState(false);
	const [examList, setExamList] = useState<ExamItem[]>([]);
	const [examLoading, setExamLoading] = useState(false);
	const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
	const [selectedExamDateId, setSelectedExamDateId] = useState<number | null>(
		null,
	);

	const [qpayOpen, setQpayOpen] = useState(false);
	const [qpayData, setQpayData] = useState<QPayInvoiceResponse | null>(null);

	// ── /api/examineesend ─────────────────────────────────────────────────────
	const sendExaminee = useCallback(async (): Promise<boolean> => {
		setError("");
		try {
			const res = await fetch(`${API_BASE}/api/examineesend`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					register_number: d.reg_number,
					last_name: d.lastname,
					first_name: d.firstname,
					gender: d.gender_code,
					age: null,
					address: null,
					mail: d.email,
					nationality: d.nationality || "Mongolian",
					password: d.password,
					profile: d.img_url ?? null,
					school_esis_id: d.school_esis_id,
					student_group_id: d.student_group_id,
					academic_level: d.academic_level,
					personid: d.personId,
					schooldb: d.schooldb,
					schoolname: d.schoolname,
					studentgroupname: d.studentgroupname,
					aimag_name: d.aimag_name,
					sym_name: d.sym_name,
					dateofbirth: d.dateofbirth,
					conn: "skuul",
				}),
			});
			if (!res.ok) throw new Error("Бүртгэл илгээхэд алдаа гарлаа");
			const json = await res.json();
			if (!json?.RetResponse?.ResponseType)
				throw new Error(
					json?.RetResponse?.ResponseMessage || "Бүртгэл амжилтгүй болсон",
				);
			setExamineeNumber(json.RetData?.examinee_number ?? null);
			return true;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Алдаа гарлаа");
			return false;
		}
	}, [d]);

	// ── /api/examinee_list ────────────────────────────────────────────────────
	const fetchExaminee = useCallback(async () => {
		if (examinee) return examinee;
		setExamineeLoading(true);
		setError("");
		try {
			const res = await fetch(`${API_BASE}/api/examinee_list`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ personid: d.personId, conn: "skuul" }),
			});
			if (!res.ok) throw new Error("Серверт холбогдоход алдаа гарлаа");
			const json = await res.json();
			if (!json?.RetResponse?.ResponseType)
				throw new Error(
					json?.RetResponse?.ResponseMessage || "Бүртгэл олдсонгүй",
				);
			const item: ExamineeItem = json.RetData?.[0];
			if (!item) throw new Error("Шалгуулагчийн мэдээлэл олдсонгүй");
			setExaminee(item);
			return item;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Алдаа гарлаа");
			return null;
		} finally {
			setExamineeLoading(false);
		}
	}, [d.personId, examinee]);

	// ── /api/getExamList ──────────────────────────────────────────────────────
	const fetchExamList = useCallback(
		async (userid: number) => {
			if (examList.length > 0) return;
			setExamLoading(true);
			setError("");
			try {
				const res = await fetch(`${API_BASE}/api/getExamList`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userid, conn: "skuul" }),
				});
				if (!res.ok) throw new Error("Шалгалтын мэдээлэл авахад алдаа гарлаа");
				const json = await res.json();
				if (!json?.RetResponse?.ResponseType)
					throw new Error(
						json?.RetResponse?.ResponseMessage || "Шалгалт олдсонгүй",
					);
				setExamList(json.RetData ?? []);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Алдаа гарлаа");
			} finally {
				setExamLoading(false);
			}
		},
		[examList.length],
	);
	const fetchRooms = useCallback(async () => {
		// 🛑 examinee байхгүй бол шууд зогсооно
		if (!examinee?.userid) return;

		setRoomsLoading(true);
		setError("");

		try {
			const res = await fetch("https://backend.skuul.mn/api/list", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					procname: "api_get_exam_rooms",
					userid: examinee.userid, // ✅ ЭНД user id-г авна

					conn: "skuul",
				}),
			});

			if (!res.ok) {
				throw new Error("Өрөөний мэдээлэл авахад алдаа гарлаа");
			}

			const json = await res.json();

			if (!json?.RetResponse?.ResponseType) {
				throw new Error(json?.RetResponse?.ResponseMessage || "Алдаа гарлаа");
			}

			if (!Array.isArray(json.RetData)) {
				throw new Error("Өрөөний мэдээлэл олдсонгүй");
			}

			setRooms(json.RetData);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Өрөөний мэдээлэл авахад алдаа гарлаа",
			);
			console.error("Room fetch error:", err);
		} finally {
			setRoomsLoading(false);
		}
	}, [examinee?.userid]); // ✅ dependency ЗААВАЛ

	// ── QPay invoice ──────────────────────────────────────────────────────────
	const invokeQPay = useCallback(async (targetExaminee: ExamineeItem) => {
		setIsLoading(true);
		setQpayError("");
		try {
			const res = await fetch("/api/mnqpay/invoice", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: "100",
					userid: String(targetExaminee.userid),
					device_token: "",
					orderid: "9",
					bilid: "99",
					classroom_id: "0",
					urls: [],
					conn: {
						user: "edusr",
						password: "sql$erver43",
						database: "ikh_skuul",
						server: "172.16.1.79",
						pool: { max: 100000, min: 0, idleTimeoutMillis: 30000000 },
						options: { encrypt: false, trustServerCertificate: false },
					},
				}),
			});
			const data = await res.json();
			if (!data?.qr_image) throw new Error(data?.error ?? "QPay алдаа гарлаа");
			setQpayData(data as QPayInvoiceResponse);
			setQpayOpen(true);
		} catch (err) {
			setQpayError(err instanceof Error ? err.message : "QPay алдаа гарлаа");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleQPay = useCallback(async () => {
		let target = examinee;
		if (!target) target = await fetchExaminee();
		if (!target) return;
		await invokeQPay(target);
	}, [examinee, fetchExaminee, invokeQPay]);

	const handlePaymentSuccess = useCallback(() => {
		setQpayOpen(false);
		setQpayData(null);
		setIsPaid(true);
	}, []);

	const handleSendAndProceed = useCallback(async () => {
		const sent = await sendExaminee();
		if (!sent) return;
		toast.success("Амжилттай илгээгдлээ");
		const item = examinee ?? (await fetchExaminee());
		if (item) await fetchExamList(item.userid);

		setStep("select_exam");
	}, [sendExaminee, examinee, fetchExaminee, fetchExamList]);

	const handleQpayOpenChange = useCallback((open: boolean) => {
		setQpayOpen(open);
		if (!open) setQpayData(null);
	}, []);

	const handleRegister = useCallback(async () => {
		if (!selectedExam) return;
		const needsDate = selectedExam.exam_dates.length > 0;
		if (needsDate && !selectedExamDateId) return;

		const selectedDate = selectedExam.exam_dates.find(
			(ed) => ed.id === selectedExamDateId,
		);

		setIsLoading(true);
		setError("");
		try {
			const payload = {
				examinee_number: examineeNumber ? Number(examineeNumber) : 0,
				stu_id: examinee?.id ?? 0,
				exam_id: selectedExam.exam_id,
				exam_date_id: selectedDate?.exam_date_id ?? selectedDate?.id ?? 0,
				exam_room_id: selectedRoomId,
				userid: examinee?.userid ?? 0,
				conn: "skuul",
			};

			const res = await fetch(`${API_BASE}/api/examregistrationsingle`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("Бүртгэлийн хүсэлт амжилтгүй боллоо");
			const json = await res.json();
			if (!json?.RetResponse?.ResponseType)
				throw new Error(
					json?.RetResponse?.ResponseMessage || "Бүртгэл амжилтгүй болсон",
				);
			toast.success("Шалгалтад амжилттай бүртгүүллээ");
			setStep("paid");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Алдаа гарлаа");
		} finally {
			setIsLoading(false);
		}
	}, [
		selectedExam,
		selectedExamDateId,
		examineeNumber,
		examinee,
		selectedRoomId,
	]);
	useEffect(() => {
		if (step === "select_exam") {
			fetchRooms();
		}
	}, [step, fetchRooms]);
	const STEPS = ["preview", "select_exam", "paid"] as const;
	const stepIdx = STEPS.indexOf(step);

	return (
		<>
			<QPayDialog
				open={qpayOpen}
				onOpenChange={handleQpayOpenChange}
				qpayData={qpayData}
				userId={examinee?.userid}
				onPaymentSuccess={handlePaymentSuccess}
			/>

			<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
				{/* ── HEADER ── */}
				<div className="sticky top-0 z-30 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
					<div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
						<div className="flex items-center gap-3">
							{step !== "paid" && (
								<button
									type="button"
									onClick={() => {
										if (step === "preview") router.back();
										if (step === "select_exam") setStep("preview");
									}}
									className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
								>
									<ChevronLeft size={16} />
									Буцах
								</button>
							)}
							<div className="flex items-center gap-1">
								{STEPS.map((s, idx) => {
									const done = idx < stepIdx;
									const active = s === step;
									return (
										<div key={s} className="flex items-center">
											<div
												className={[
													"w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
													done
														? "bg-primary text-primary-foreground"
														: active
															? "bg-primary/20 text-primary border-2 border-primary"
															: "bg-muted text-muted-foreground",
												].join(" ")}
											>
												{done ? <CheckCircle2 size={12} /> : idx + 1}
											</div>
											{idx < 2 && (
												<div
													className={`w-5 h-0.5 mx-0.5 transition-all ${done ? "bg-primary" : "bg-muted"}`}
												/>
											)}
										</div>
									);
								})}
							</div>
						</div>
						<span className="text-xs text-muted-foreground font-medium">
							{step === "preview" && "Мэдээлэл шалгах"}
							{step === "select_exam" && "Шалгалт сонгох"}
							{step === "paid" && "Бүртгэл амжилттай"}
						</span>
					</div>
				</div>

				<div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
					{error && (
						<div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
							<AlertCircle size={16} className="shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					{step === "preview" && (
						<StepPreview
							d={d}
							isPaid={isPaid}
							isLoading={isLoading}
							qpayError={qpayError}
							onQPay={handleQPay}
							onSendAndProceed={handleSendAndProceed}
						/>
					)}

					{step === "select_exam" && (
						<StepSelectExam
							examinee={examinee}
							examList={examList}
							examLoading={examLoading}
							isLoading={isLoading}
							selectedExam={selectedExam}
							selectedExamDateId={selectedExamDateId}
							selectedRoomId={selectedRoomId}
							rooms={rooms}
							roomsLoading={roomsLoading}
							onSelectExam={(exam) => {
								setSelectedExam(exam);
								setSelectedExamDateId(null);
								setSelectedRoomId(null);
							}}
							onSelectDate={(dateId) => {
								setSelectedExamDateId(dateId);
								setSelectedRoomId(null);
							}}
							onSelectRoom={setSelectedRoomId}
							onRegister={handleRegister}
							onBack={() => setStep("preview")}
						/>
					)}

					{step === "paid" && (
						<StepPaid
							d={d}
							selectedExam={selectedExam}
							examineeNumber={examineeNumber}
							onFinish={() => router.back()}
							onBack={() => setStep("select_exam")}
						/>
					)}
				</div>
			</div>
		</>
	);
}
