"use client";

import { AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { toast } from "sonner";
import type { QPayInvoiceResponse } from "@/types/Qpay/qpayinvoice";
import QPayDialog from "./qpayDialog";
import { StepPaid } from "./stepPaid";
import { StepPreview } from "./stepPreview";
import type { ExamineeItem, Step, VerifyData } from "./types";
import { API_BASE } from "./utils";

export type { VerifyData };

export default function VerifyForm({ data: d }: { data: VerifyData }) {
	const router = useRouter();
	const [step, setStep] = useState<Step>("preview");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [qpayError, setQpayError] = useState("");
	const [isPaid, setIsPaid] = useState(true);
	const [examineeNumber, setExamineeNumber] = useState<string | null>(null);
	const [examinee, setExaminee] = useState<ExamineeItem | null>(null);
	const [_examineeLoading, setExamineeLoading] = useState(false);

	const [qpayOpen, setQpayOpen] = useState(false);
	const [qpayData, setQpayData] = useState<QPayInvoiceResponse | null>(null);

	// ── /api/examineesend ─────────────────────────────────────────────────────
	const sendExaminee = useCallback(async (): Promise<boolean> => {
		setError("");

		const body = {
			register_number: d.reg_number,
			last_name: d.lastname,
			first_name: d.firstname,
			gender: d.gender_code,
			age: d.age ?? null,
			address: d.address ?? null,
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
		};

		try {
			const res = await fetch(`${API_BASE}/api/examineesend`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
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
	const fetchExaminee = useCallback(
		async (forceRefresh = false) => {
			if (examinee && !forceRefresh) return examinee;
			setExamineeLoading(true);
			setError("");
			try {
				const res = await fetch(`${API_BASE}/api/examinee_list_1`, {
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
		},
		[d.personId, examinee],
	);

	// ── QPay invoice ──────────────────────────────────────────────────────────
	const invokeQPay = useCallback(async (targetExaminee: ExamineeItem) => {
		setIsLoading(true);
		setQpayError("");
		try {
			const res = await fetch("/api/mnqpay/invoice", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: "20",
					user_id: String(targetExaminee.userid),
					device_token: "",
					isott: "1",
					bill_type: "9",
					bill_id: "99",
					billmonth: "1",
					code: "1",
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

		// ── ispay === 1 бол төлбөр аль хэдийн төлөгдсөн ──────────────────────
		if (target.ispay === 1) {
			setIsPaid(true);
			toast.info("Төлбөр аль хэдийн төлөгдсөн байна.");
			const sent = await sendExaminee();
			if (sent) {
				// SMS илгээх
				try {
					await fetch("https://backend.skuul.mn/api/sms_loop", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							phone: d.phone,
							msgtext: `Нэвтрэх нэр: ${d.login_name} Нууц үг: ${d.password} `,
							conn: "skuul",
						}),
					});
				} catch {
					// SMS алдаа гарсан ч үргэлжлүүлнэ
				}
				toast.success("Амжилттай илгээгдлээ");
				setStep("paid");
			}
			return;
		}

		await invokeQPay(target);
	}, [examinee, fetchExaminee, invokeQPay, sendExaminee, d]);

	// ── Төлбөр амжилттай төлөгдсөний дараа л examineesend дуудна ──────────────
	const handlePaymentSuccess = useCallback(async () => {
		setQpayOpen(false);
		setQpayData(null);

		// Серверээс ispay шинэчлэгдсэн эсэхийг шалгах
		const target = await fetchExaminee(true);
		if (!target || target.ispay !== 1) {
			setQpayError("Төлбөр баталгаажаагүй байна. Дахин оролдоно уу.");
			return;
		}

		setIsPaid(true);
		const sent = await sendExaminee();
		if (!sent) return;

		// ── SMS илгээх ──
		try {
			await fetch("https://backend.skuul.mn/api/sms_loop", {
				// ← гурван slash засав
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone: d.phone,
					msgtext: `Нэвтрэх нэр: ${d.login_name} Нууц үг: ${d.password}`,
					conn: "skuul",
				}),
			});
		} catch {
			// SMS алдаа гарсан ч үргэлжлүүлнэ
		}

		toast.success("Амжилттай илгээгдлээ");
		setStep("paid");
	}, [fetchExaminee, sendExaminee, d]);

	// ── "Бүртгүүлэх" товч → зөвхөн QPay нээнэ ───────────────────────────────
	const handleSendAndProceed = useCallback(async () => {
		await handleQPay();
	}, [handleQPay]);

	const handleQpayOpenChange = useCallback((open: boolean) => {
		setQpayOpen(open);
		if (!open) setQpayData(null);
	}, []);

	const STEPS = ["preview", "paid"] as const;
	const stepIdx = STEPS.indexOf(step as "preview" | "paid");

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
											{idx < 1 && (
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
							{step === "preview" && "Төлбөр төлөх"}
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

					{step === "paid" && (
						<StepPaid
							d={d}
							selectedExam={null}
							selectedExamDateId={null}
							selectedRoomId={null}
							rooms={[]}
							examineeNumber={examineeNumber}
							onFinish={() => router.back()}
							onBack={() => setStep("preview")}
						/>
					)}
				</div>
			</div>
		</>
	);
}
