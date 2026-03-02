"use client";

import {
	AlertCircle,
	BookOpen,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	CreditCard,
	GraduationCap,
	Loader2,
	MapPin,
	Phone,
	School,
	User,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface VerifyData {
	firstname: string;
	lastname: string;
	reg_number: string;
	gender_code: "M" | "F";
	dateofbirth: string;
	phone: string | null;
	email: string;
	aimag_name: string;
	sym_name: string;
	schoolname: string;
	studentgroupname: string;
	class_id: number;
	academic_level: number;
	img_url: string | null;
	nationality: string;
	login_name: string;
	personId: string;
}

interface ExamineeItem {
	id: number;
	examinee_number: string;
	first_name: string;
	last_name: string;
	register_number: string;
	gender: string | null;
	age: number | null;
	mail: string | null;
	address: string | null;
	nationality: string | null;
	profile: string | null;
	school_esis_id: string;
	student_group_id: string;
	academic_level: number | null;
	personid: string;
	schooldb: string | null;
	schoolname: string | null;
	studentgroupname: string;
	aimag_name: string | null;
	sym_name: string | null;
	flag: number | null;
	flagname: string;
	userid: number;
}

interface ExamDate {
	id: number;
	exam_id: number;
	start_date: string;
	end_date: string;
	exam_skuul_id: number;
	exam_date_id: number | null;
}

interface ExamItem {
	id: number;
	exam_id: number;
	exam_number: string;
	name: string;
	duration: number;
	register_start_date: string;
	register_end_date: string;
	item_open_date: string;
	exam_dates: ExamDate[];
}

interface QPayURL {
	name: string;
	description: string;
	logo: string;
	link: string;
}

const API_BASE = "https://backend.skuul.mn";

// ── Shared className ──────────────────────────────────────────────────────────
const CARD_CLS =
	"bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

function fmtDateTime(iso: string): string {
	if (!iso) return "—";
	const d = new Date(iso);
	return d.toLocaleString("mn-MN", {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// ── QPay Modal ────────────────────────────────────────────────────────────────
function QPayModal({
	qrImage,
	invoiceId,
	urls,
	onCancel,
	onPaid,
}: {
	qrImage: string;
	invoiceId: string;
	urls?: QPayURL[];
	onCancel: () => void;
	onPaid: () => void;
}) {
	const pollingRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		pollingRef.current = setInterval(async () => {
			try {
				const res = await fetch("/api/mnqpay/check", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ invoice_id: invoiceId }),
				});
				const data = await res.json();
				if (data?.RetResponse?.ResponseType === true || data?.paid === true) {
					clearInterval(pollingRef.current!);
					onPaid();
				}
			} catch {
				// polling үргэлжилнэ
			}
		}, 3000);
		return () => {
			if (pollingRef.current) clearInterval(pollingRef.current);
		};
	}, [invoiceId, onPaid]);

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div
				className={`${CARD_CLS} rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl`}
			>
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-base font-bold">QPay төлбөр</h2>
						<p className="text-[11px] text-muted-foreground mt-0.5">
							QR кодыг уншуулан 1,000₮ төлнө үү
						</p>
					</div>
					<button
						type="button"
						onClick={onCancel}
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<X size={18} />
					</button>
				</div>
				<div className="flex justify-center">
					<div className="p-3 bg-white rounded-2xl">
						<img
							src={`data:image/png;base64,${qrImage}`}
							alt="QPay QR"
							className="w-44 h-44 rounded-lg"
						/>
					</div>
				</div>
				{urls && urls.length > 0 && (
					<div>
						<p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2 text-center">
							Банкны апп-аар төлөх
						</p>
						<div className="grid grid-cols-3 gap-2">
							{urls.slice(0, 6).map((bank) => (
								<a
									key={bank.name}
									href={bank.link}
									className="flex flex-col items-center gap-1.5 p-2.5 bg-muted/40 rounded-xl hover:bg-muted transition-colors"
								>
									<img
										src={bank.logo}
										alt={bank.name}
										className="w-9 h-9 rounded-lg object-cover"
									/>
									<span className="text-[9px] text-muted-foreground text-center leading-tight font-medium">
										{bank.name}
									</span>
								</a>
							))}
						</div>
					</div>
				)}
				<div className="flex items-center justify-center gap-2 py-1">
					<Loader2 size={14} className="animate-spin text-primary" />
					<span className="text-xs text-muted-foreground">
						Төлбөр хүлээж байна...
					</span>
				</div>
				<button
					type="button"
					onClick={onCancel}
					className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors py-1"
				>
					Цуцлах
				</button>
			</div>
		</div>
	);
}

// ── ExamCard ──────────────────────────────────────────────────────────────────
function ExamCard({
	exam,
	selected,
	onSelect,
}: {
	exam: ExamItem;
	selected: boolean;
	onSelect: () => void;
}) {
	const now = new Date();
	const regStart = new Date(exam.register_start_date);
	const regEnd = new Date(exam.register_end_date);
	const isOpen = now >= regStart && now <= regEnd;
	const isExpired = now > regEnd;

	return (
		<button
			type="button"
			onClick={isOpen ? onSelect : undefined}
			disabled={!isOpen}
			className={[
				"w-full text-left rounded-xl border-2 p-4 transition-all duration-200",
				"bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl",
				isOpen
					? selected
						? "border-primary bg-primary/5 shadow-md"
						: "border-gray-200/50 dark:border-gray-700/50 hover:border-primary/40 hover:bg-white/80 dark:hover:bg-gray-900/80 cursor-pointer"
					: "border-gray-200/30 dark:border-gray-700/30 opacity-60 cursor-not-allowed",
			].join(" ")}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap mb-1.5">
						<span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
							{exam.exam_number}
						</span>
						<Badge
							variant="outline"
							className={`text-[10px] px-1.5 py-0 h-4 ${
								isOpen
									? "border-green-500/40 text-green-600 bg-green-500/5"
									: isExpired
										? "border-destructive/30 text-destructive/70 bg-destructive/5"
										: "border-amber-500/40 text-amber-600 bg-amber-500/5"
							}`}
						>
							{isOpen ? "Нээлттэй" : isExpired ? "Дууссан" : "Эхлээгүй"}
						</Badge>
					</div>
					<p className="text-sm font-semibold text-foreground leading-snug">
						{exam.name}
					</p>
					<div className="flex items-center gap-1 mt-1.5">
						<Clock size={11} className="text-muted-foreground" />
						<span className="text-[11px] text-muted-foreground">
							{exam.duration} минут
						</span>
					</div>
				</div>
				<div
					className={[
						"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
						selected
							? "border-primary bg-primary"
							: "border-muted-foreground/30",
					].join(" ")}
				>
					{selected && <div className="w-2 h-2 rounded-full bg-white" />}
				</div>
			</div>

			<div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 grid grid-cols-2 gap-2">
				<div>
					<p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
						Бүртгэл эхлэх
					</p>
					<p className="text-[11px] font-medium text-foreground">
						{fmtDateTime(exam.register_start_date)}
					</p>
				</div>
				<div>
					<p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
						Бүртгэл дуусах
					</p>
					<p className="text-[11px] font-medium text-foreground">
						{fmtDateTime(exam.register_end_date)}
					</p>
				</div>
			</div>

			{exam.exam_dates.length > 0 && (
				<div className="mt-2.5 space-y-1">
					<p className="text-[9px] text-muted-foreground uppercase tracking-wider">
						Шалгалтын огноо ({exam.exam_dates.length} сесс)
					</p>
					<div className="flex flex-wrap gap-1">
						{exam.exam_dates.map((ed) => (
							<span
								key={ed.id}
								className="text-[10px] bg-muted/60 rounded px-1.5 py-0.5 text-muted-foreground"
							>
								{fmtDateTime(ed.start_date)} –{" "}
								{new Date(ed.end_date).toLocaleString("mn-MN", {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						))}
					</div>
				</div>
			)}
		</button>
	);
}

// ── InfoRow ───────────────────────────────────────────────────────────────────
function InfoRow({
	label,
	value,
	mono,
}: {
	label: string;
	value: string | null | undefined;
	mono?: boolean;
}) {
	return (
		<div className="flex justify-between items-start gap-3 py-1.5">
			<span className="text-xs text-muted-foreground shrink-0">{label}</span>
			<span
				className={`text-xs font-medium text-right ${mono ? "font-mono text-foreground/70" : "text-foreground"}`}
			>
				{value || "—"}
			</span>
		</div>
	);
}

function InfoSection({
	icon,
	title,
	children,
}: {
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<div className="flex items-center gap-1.5 mb-1.5">
				<span className="text-primary/60">{icon}</span>
				<span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
					{title}
				</span>
			</div>
			<div className="bg-muted/20 rounded-xl px-3 divide-y divide-border/50">
				{children}
			</div>
		</div>
	);
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function VerifyForm({ data: d }: { data: VerifyData }) {
	type Step = "preview" | "select_exam" | "payment" | "qr" | "paid";
	const [step, setStep] = useState<Step>("preview");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const [examinee, setExaminee] = useState<ExamineeItem | null>(null);
	const [examineeLoading, setExamineeLoading] = useState(false);

	const [examList, setExamList] = useState<ExamItem[]>([]);
	const [examLoading, setExamLoading] = useState(false);
	const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);

	const [qpayData, setQpayData] = useState<{
		qr_image: string;
		invoice_id: string;
		urls?: QPayURL[];
	} | null>(null);

	const fetchExaminee = useCallback(async () => {
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
			if (!json?.RetResponse?.ResponseType) {
				throw new Error(
					json?.RetResponse?.ResponseMessage || "Бүртгэл олдсонгүй",
				);
			}
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
	}, [d.personId]);

	const fetchExamList = useCallback(async (userid: number) => {
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
			if (!json?.RetResponse?.ResponseType) {
				throw new Error(
					json?.RetResponse?.ResponseMessage || "Шалгалт олдсонгүй",
				);
			}
			setExamList(json.RetData ?? []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Алдаа гарлаа");
		} finally {
			setExamLoading(false);
		}
	}, []);

	const handleConfirmPreview = useCallback(async () => {
		const item = await fetchExaminee();
		if (!item) return;
		await fetchExamList(item.userid);
		setStep("select_exam");
	}, [fetchExaminee, fetchExamList]);

	const handleQPay = useCallback(async () => {
		if (!examinee || !selectedExam) return;
		setIsLoading(true);
		setError("");
		try {
			const res = await fetch("/api/mnqpay/invoice", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: "1000",
					userid: String(examinee.userid),
					orderid: String(examinee.id),
					bilid: "1000",
					classroom_id: String(selectedExam.id),
					device_token: "",
				}),
			});
			const data = await res.json();
			if (!data?.qr_image) throw new Error(data?.error ?? "QPay алдаа гарлаа");
			setQpayData({
				qr_image: data.qr_image,
				invoice_id: data.invoice_id,
				urls: data.urls,
			});
			setStep("qr");
		} catch (err) {
			setError(err instanceof Error ? err.message : "QPay алдаа гарлаа");
		} finally {
			setIsLoading(false);
		}
	}, [examinee, selectedExam]);

	const handleCancelQPay = useCallback(() => {
		setStep("payment");
		setQpayData(null);
	}, []);

	const handlePaid = useCallback(() => {
		setQpayData(null);
		setStep("paid");
	}, []);

	return (
		<>
			{step === "qr" && qpayData && (
				<QPayModal
					qrImage={qpayData.qr_image}
					invoiceId={qpayData.invoice_id}
					urls={qpayData.urls}
					onCancel={handleCancelQPay}
					onPaid={handlePaid}
				/>
			)}

			<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
				{/* ── HEADER ── */}
				<div className="sticky top-0 z-30 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
					<div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1">
								{(["preview", "select_exam", "payment", "paid"] as const).map(
									(s, idx) => {
										const stepIdx = [
											"preview",
											"select_exam",
											"payment",
											"paid",
										].indexOf(step);
										const thisIdx = idx;
										const done = thisIdx < stepIdx;
										const active =
											s === step || (step === "qr" && s === "payment");
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
												{idx < 3 && (
													<div
														className={`w-5 h-0.5 mx-0.5 transition-all ${done ? "bg-primary" : "bg-muted"}`}
													/>
												)}
											</div>
										);
									},
								)}
							</div>
						</div>
						<span className="text-xs text-muted-foreground font-medium">
							{step === "preview" && "Мэдээлэл шалгах"}
							{step === "select_exam" && "Шалгалт сонгох"}
							{(step === "payment" || step === "qr") && "Төлбөр төлөх"}
							{step === "paid" && "Бүртгэл амжилттай"}
						</span>
					</div>
				</div>

				<div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
					{/* ── Error banner ── */}
					{error && (
						<div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
							<AlertCircle size={16} className="shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					{/* STEP 1 — PREVIEW */}
					{step === "preview" && (
						<Card className={CARD_CLS}>
							<CardHeader className="pb-3 pt-5 px-5">
								<div className="flex items-center gap-3">
									{d.img_url ? (
										<img
											src={d.img_url}
											alt="profile"
											className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
										/>
									) : (
										<div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
											<User size={22} className="text-primary/60" />
										</div>
									)}
									<div>
										<CardTitle className="text-base font-bold">
											{d.lastname} {d.firstname}
										</CardTitle>
										<p className="text-[11px] text-muted-foreground font-mono mt-0.5">
											{d.reg_number}
										</p>
										<Badge
											variant="secondary"
											className="text-[10px] mt-1 gap-1"
										>
											<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
											{d.gender_code === "M" ? "Эрэгтэй" : "Эмэгтэй"}
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent className="px-5 pb-5 space-y-4">
								<Separator />
								<InfoSection icon={<User size={12} />} title="Хувийн мэдээлэл">
									<InfoRow label="Нэвтрэх нэр" value={d.login_name} mono />
									<InfoRow
										label="Төрсөн огноо"
										value={fmtDate(d.dateofbirth)}
									/>
									<InfoRow label="Иргэншил" value={d.nationality || "Монгол"} />
								</InfoSection>
								<InfoSection icon={<Phone size={12} />} title="Холбоо барих">
									<InfoRow label="Утас" value={d.phone} mono />
									<InfoRow label="Имэйл" value={d.email} />
								</InfoSection>
								<InfoSection icon={<MapPin size={12} />} title="Хаяг">
									<InfoRow label="Аймаг/Хот" value={d.aimag_name} />
									<InfoRow label="Сум/Дүүрэг" value={d.sym_name} />
								</InfoSection>
								<InfoSection icon={<School size={12} />} title="Сургууль">
									<InfoRow label="Сургуулийн нэр" value={d.schoolname} />
									<InfoRow label="Анги бүлэг" value={d.studentgroupname} />
									<InfoRow
										label="Боловсролын түвшин"
										value={String(d.academic_level)}
									/>
								</InfoSection>
								<Separator />
								<p className="text-[11px] text-center text-muted-foreground">
									Дээрх мэдээлэл зөв байвал шалгалтын бүртгэл рүү үргэлжлүүлнэ
									үү
								</p>
								<Button
									onClick={handleConfirmPreview}
									disabled={examineeLoading}
									className="w-full h-12 font-bold shadow-lg gap-2"
								>
									{examineeLoading ? (
										<>
											<Loader2 size={16} className="animate-spin" /> Уншиж
											байна...
										</>
									) : (
										<>
											Мэдээлэл зөв байна <ChevronRight size={16} />
										</>
									)}
								</Button>
							</CardContent>
						</Card>
					)}

					{/* STEP 2 — ШАЛГАЛТ СОНГОХ */}
					{step === "select_exam" && (
						<div className="space-y-4">
							{examinee && (
								<Card className={`${CARD_CLS} border-primary/20`}>
									<CardContent className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
													<GraduationCap size={16} className="text-primary" />
												</div>
												<div>
													<p className="text-sm font-semibold">
														{examinee.last_name} {examinee.first_name}
													</p>
													<p className="text-[11px] text-muted-foreground font-mono">
														Шалгуулагч №{examinee.examinee_number}
													</p>
												</div>
											</div>
											<Badge
												variant="outline"
												className={`text-[10px] ${
													examinee.flag === 1
														? "border-green-500/40 text-green-600 bg-green-500/5"
														: "border-amber-500/40 text-amber-600 bg-amber-500/5"
												}`}
											>
												{examinee.flagname}
											</Badge>
										</div>
									</CardContent>
								</Card>
							)}

							<div>
								<div className="flex items-center gap-2 mb-3">
									<BookOpen size={14} className="text-primary" />
									<h2 className="text-sm font-bold">Шалгалт сонгох</h2>
									{examLoading && (
										<Loader2
											size={13}
											className="animate-spin text-muted-foreground"
										/>
									)}
								</div>

								{examLoading ? (
									<Card className={CARD_CLS}>
										<CardContent className="p-6 flex items-center justify-center gap-2">
											<Loader2
												size={16}
												className="animate-spin text-muted-foreground"
											/>
											<span className="text-sm text-muted-foreground">
												Шалгалтын жагсаалт татаж байна...
											</span>
										</CardContent>
									</Card>
								) : examList.length === 0 ? (
									<Card className={CARD_CLS}>
										<CardContent className="p-6 text-center space-y-2">
											<Calendar
												size={28}
												className="text-muted-foreground mx-auto"
											/>
											<p className="text-sm text-muted-foreground">
												Тохирох шалгалт олдсонгүй
											</p>
										</CardContent>
									</Card>
								) : (
									<div className="space-y-3">
										{examList.map((exam) => (
											<ExamCard
												key={exam.id}
												exam={exam}
												selected={selectedExam?.id === exam.id}
												onSelect={() => setSelectedExam(exam)}
											/>
										))}
									</div>
								)}
							</div>

							<div className="space-y-2 pt-1">
								<Button
									onClick={() => {
										if (selectedExam) setStep("payment");
									}}
									disabled={!selectedExam}
									className="w-full h-12 font-bold shadow-lg gap-2"
								>
									Шалгалт сонгосон, үргэлжлүүлэх <ChevronRight size={16} />
								</Button>
								<button
									type="button"
									onClick={() => setStep("preview")}
									className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5"
								>
									← Мэдээлэл рүү буцах
								</button>
							</div>
						</div>
					)}

					{/* STEP 3 — PAYMENT */}
					{step === "payment" && (
						<div className="space-y-4">
							{selectedExam && (
								<Card className={`${CARD_CLS} border-primary/20`}>
									<CardContent className="p-4 space-y-3">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<p className="text-[10px] font-mono text-muted-foreground bg-muted inline-block px-1.5 py-0.5 rounded mb-1">
													{selectedExam.exam_number}
												</p>
												<p className="text-sm font-bold leading-snug">
													{selectedExam.name}
												</p>
											</div>
											<button
												type="button"
												onClick={() => setStep("select_exam")}
												className="text-[10px] text-primary hover:underline shrink-0 mt-1"
											>
												Солих
											</button>
										</div>
										<Separator />
										<div className="grid grid-cols-2 gap-2 text-[11px]">
											<div>
												<p className="text-muted-foreground mb-0.5">
													Бүртгэл хаагдах
												</p>
												<p className="font-medium">
													{fmtDateTime(selectedExam.register_end_date)}
												</p>
											</div>
											<div>
												<p className="text-muted-foreground mb-0.5">
													Үргэлжлэх хугацаа
												</p>
												<p className="font-medium">
													{selectedExam.duration} минут
												</p>
											</div>
										</div>
										{selectedExam.exam_dates.length > 0 && (
											<div>
												<p className="text-[10px] text-muted-foreground mb-1">
													Шалгалтын сесс
												</p>
												<div className="flex flex-wrap gap-1">
													{selectedExam.exam_dates.map((ed) => (
														<span
															key={ed.id}
															className="text-[10px] bg-muted/60 rounded px-2 py-0.5 text-muted-foreground"
														>
															{fmtDateTime(ed.start_date)}
														</span>
													))}
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							)}

							<Card className={CARD_CLS}>
								<CardContent className="p-6 space-y-5">
									<div className="text-center space-y-1.5">
										<div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
											<CreditCard size={22} className="text-primary" />
										</div>
										<h2 className="text-base font-bold">Бүртгэлийн төлбөр</h2>
										<p className="text-xs text-muted-foreground">
											Шалгалтад бүртгүүлэхийн тулд төлбөр төлнө үү
										</p>
									</div>
									<Separator />
									<div className="bg-muted/30 rounded-xl p-4 flex items-center justify-between border border-gray-200/50 dark:border-gray-700/50">
										<span className="text-sm text-muted-foreground">
											Төлбөрийн дүн
										</span>
										<span className="text-2xl font-extrabold text-primary">
											1,000₮
										</span>
									</div>
									{error && (
										<div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
											<AlertCircle size={14} className="shrink-0" />
											{error}
										</div>
									)}
									<Button
										onClick={handleQPay}
										disabled={isLoading}
										className="w-full h-12 font-bold shadow-lg gap-2"
									>
										{isLoading ? (
											<>
												<Loader2 size={16} className="animate-spin" /> Уншиж
												байна...
											</>
										) : (
											<>
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
												>
													<rect x="2" y="5" width="20" height="14" rx="2" />
													<path d="M2 10h20" />
													<title>qpay</title>
												</svg>
												QPay-ээр төлбөр төлөх
											</>
										)}
									</Button>
									<button
										type="button"
										onClick={() => setStep("select_exam")}
										className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
									>
										← Шалгалт сонгох рүү буцах
									</button>
								</CardContent>
							</Card>
						</div>
					)}

					{/* STEP 4 — PAID */}
					{step === "paid" && (
						<Card className={`${CARD_CLS} border-primary/30`}>
							<CardContent className="p-8 space-y-5 text-center">
								<div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
									<CheckCircle2 size={32} className="text-primary" />
								</div>
								<div>
									<h2 className="text-xl font-bold">Бүртгэл амжилттай!</h2>
									<p className="text-xs text-muted-foreground mt-1">
										Шалгалтад амжилттай бүртгүүллээ
									</p>
								</div>
								<Card className={CARD_CLS}>
									<CardContent className="p-4 space-y-2">
										{[
											{ label: "Нэр", value: `${d.lastname} ${d.firstname}` },
											{ label: "Нэвтрэх нэр", value: d.login_name, mono: true },
											{ label: "Шалгалт", value: selectedExam?.name },
											{ label: "Сургууль", value: d.schoolname },
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
									</CardContent>
								</Card>
								<p className="text-[11px] text-muted-foreground">
									Нэвтрэх нэр болон нууц үгээ ашиглан системд нэвтэрнэ үү
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</>
	);
}
