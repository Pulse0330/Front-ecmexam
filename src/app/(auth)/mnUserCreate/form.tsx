"use client";

import {
	AlertTriangle,
	ArrowRight,
	ChevronLeft,
	Eye,
	EyeOff,
	Globe,
	ImagePlus,
	Info,
	Lock,
	Mail,
	Phone,
	Upload,
	User,
	X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { uploadImage } from "@/utils/upload";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface StudentExamData {
	login_name: string;
	firstname: string;
	lastname: string;
	reg_number: string;
	gender: number;
	gender_code: "M" | "F";
	phone: string | null;
	email: string;
	aimag_id: string;
	sym_id: string;
	class_id: number;
	group_id: number;
	img_url: string | null;
	descr: string;
	regdate: string;
	dateofbirth: string;
	personId: string;
	schooldb: string;
	schoolname: string;
	studentgroupid: string;
	studentgroupname: string;
	aimag_name: string;
	sym_name: string;
	institutionid: string;
	academic_level: number;
	nationality: string;
}

// ── API ───────────────────────────────────────────────────────────────────────
const API_BASE = "https://backend.skuul.mn";

interface SavePayload {
	loginname: string;
	firstname: string;
	lastname: string;
	reg_number: string;
	gender: number;
	phone: string;
	email: string;
	aimag_id: number;
	sym_id: number;
	class_id: number;
	group_id: number;
	img_url: string;
	descr: string;
	dateofbirth: string;
	personId: string;
	schooldb: string;
	schoolname: string;
	studentgroupid: string;
	studentgroupname: string;
	aimag_name: string;
	sym_name: string;
	passwordencrypt: string;
	password: string;
	institutionid: string;
	academic_level: string;
	nationality: string;
	gender_code: "M" | "F";
	conn: string;
}

async function saveStudent(payload: SavePayload) {
	const res = await fetch(`${API_BASE}/api/setstudentinsert`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`Серверт алдаа гарлаа (${res.status})`);
	return res.json();
}

// ── Image helpers ─────────────────────────────────────────────────────────────
async function convertToWebP(
	file: File,
	quality = 0.85,
	maxWidth = 1920,
	maxHeight = 1080,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new window.Image();
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		img.onload = () => {
			let { width, height } = img;
			if (width > maxWidth || height > maxHeight) {
				const ratio = Math.min(maxWidth / width, maxHeight / height);
				width = width * ratio;
				height = height * ratio;
			}
			canvas.width = width;
			canvas.height = height;
			ctx?.drawImage(img, 0, 0, width, height);
			canvas.toBlob(
				(blob) => {
					if (blob) resolve(blob);
					else reject(new Error("WebP хөрвүүлэлт амжилтгүй"));
				},
				"image/webp",
				quality,
			);
		};
		img.onerror = () => reject(new Error("Зураг уншихад алдаа гарлаа"));
		img.src = URL.createObjectURL(file);
	});
}

async function uploadProfileImage(file: File): Promise<string> {
	const webpBlob = await convertToWebP(file);
	const formData = new FormData();
	formData.append("file", webpBlob, file.name.replace(/\.[^/.]+$/, ".webp"));
	const result = await uploadImage(formData);
	const extractUrl = (item: unknown): string => {
		if (!item) return "";
		if (typeof item === "string") return item;
		if (typeof item === "object") {
			const obj = item as Record<string, unknown>;
			if (typeof obj.FileWebUrl === "string") return obj.FileWebUrl;
			if (typeof obj.url === "string") return obj.url;
			if (typeof obj.path === "string") return obj.path;
		}
		return "";
	};
	const imageUrl =
		Array.isArray(result) && result.length > 0
			? extractUrl(result[0])
			: extractUrl(result);
	if (!imageUrl) throw new Error("Upload хариу буруу байна");
	return imageUrl;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

function _fmtDT(iso: string): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleString("mn-MN");
}

function calcAge(dob: string): number | string {
	if (!dob) return "—";
	const d = new Date(dob);
	const t = new Date();
	let a = t.getFullYear() - d.getFullYear();
	const m = t.getMonth() - d.getMonth();
	if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
	return a;
}

const CARD_CLS =
	"bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50";

const NOTICE_ITEMS = [
	{
		id: "check",
		icon: <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />,
		text: "Та зөвхөн улаан харагдаж байгаа хэсэг дээр гараас утга оруулах боломжтой.",
	},
	{
		id: "lock",
		icon: <Lock size={13} className="text-red-500 shrink-0 mt-0.5" />,
		text: "Нууц үгээ заавал оруулна уу (доод тал нь 4 тэмдэгт).",
	},
	{
		id: "photo",
		icon: <ImagePlus size={13} className="text-blue-500 shrink-0 mt-0.5" />,
		text: "Цээж зургаа тод, гэрэлтэй, нүүр нь бүтэн харагдахаар оруулна уу.",
	},
];

// ── Small UI helpers ──────────────────────────────────────────────────────────
function InfoRow({
	label,
	value,
	mono = false,
}: {
	label: string;
	value: string | number | null | undefined;
	mono?: boolean;
}) {
	return (
		<>
			<div className="flex justify-between items-center gap-3 px-4 py-2 hover:bg-muted/30 transition-colors">
				<span className="text-xs text-muted-foreground whitespace-nowrap">
					{label}
				</span>
				<span
					className={`text-xs font-medium text-right break-all ${mono ? "font-mono text-foreground/60" : "text-foreground"}`}
				>
					{value !== "" && value !== null && value !== undefined
						? String(value)
						: "—"}
				</span>
			</div>
			<Separator className="last:hidden opacity-40" />
		</>
	);
}

function Field({
	label,
	htmlFor,
	required,
	children,
}: {
	label: string;
	htmlFor?: string;
	required?: boolean;
	children: ReactNode;
}) {
	return (
		<div className="space-y-2">
			<Label
				htmlFor={htmlFor}
				className="text-[11px] text-muted-foreground uppercase tracking-widest flex items-center gap-1"
			>
				{label}
				{required && <span className="text-destructive font-bold">*</span>}
			</Label>
			{children}
		</div>
	);
}

function ReadOnlyInput({ value, icon }: { value: string; icon?: ReactNode }) {
	return (
		<div className="relative">
			{icon && (
				<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
					{icon}
				</span>
			)}
			<div
				className={`flex h-8 w-full rounded-md border border-input bg-muted/30 text-xs text-muted-foreground items-center cursor-not-allowed select-none ${icon ? "pl-8 pr-3" : "px-3"}`}
			>
				{value || "—"}
			</div>
		</div>
	);
}

// ── Notice Modal ──────────────────────────────────────────────────────────────
function NoticeModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden gap-0">
				{/* Header */}
				<DialogHeader className="px-5 pt-5 pb-3">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
							<AlertTriangle size={15} className="text-amber-500" />
						</div>
						<DialogTitle className="text-sm font-bold text-foreground">
							Санамж &amp; Зөвлөгөө
						</DialogTitle>
					</div>
				</DialogHeader>

				<Separator className="opacity-40" />

				{/* Alert chips */}
				<div className="px-5 py-4 flex flex-col gap-2.5">
					{NOTICE_ITEMS.map((item, idx) => (
						<div
							key={item.id}
							className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors"
						>
							{/* Step badge */}
							<span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
								{idx + 1}
							</span>
							<div className="flex items-start gap-1.5 flex-1 min-w-0">
								{item.icon}
								<p className="text-[11px] leading-relaxed text-muted-foreground">
									{item.text}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="px-5 pb-5">
					<Button
						onClick={onClose}
						className="w-full h-9 text-xs font-semibold rounded-xl"
					>
						Ойлголоо
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudentForm({ data: d }: { data: StudentExamData }) {
	const router = useRouter();
	const [isSaving, setIsSaving] = useState(false);
	const [noticeOpen, setNoticeOpen] = useState(true); // auto-opens on mount
	const [showPw, setShowPw] = useState(false);
	const [showConfirmPw, setShowConfirmPw] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [password, setPassword] = useState("");
	const [profileImg, setProfileImg] = useState<string | null>(d.img_url);
	const [uploadedImgUrl, setUploadedImgUrl] = useState<string>(d.img_url ?? "");
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);
	const age = calcAge(d.dateofbirth);

	const processFile = useCallback(
		async (file: File) => {
			if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
				toast.error("Зөвхөн JPEG / PNG / WEBP зураг оруулна уу");
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Зурагны хэмжээ 5MB-аас хэтрэхгүй байх ёстой");
				return;
			}
			const blobUrl = URL.createObjectURL(file);
			setProfileImg((prev) => {
				if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
				return blobUrl;
			});
			setUploadedImgUrl("");
			setIsUploadingImage(true);
			try {
				const url = await uploadProfileImage(file);
				setUploadedImgUrl(url);
				toast.success("Зураг амжилттай хадгалагдлаа");
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Зураг upload амжилтгүй",
				);
				URL.revokeObjectURL(blobUrl);
				setProfileImg(d.img_url);
				setUploadedImgUrl(d.img_url ?? "");
			} finally {
				setIsUploadingImage(false);
			}
		},
		[d.img_url],
	);

	const clearImage = useCallback(() => {
		if (profileImg?.startsWith("blob:")) URL.revokeObjectURL(profileImg);
		setProfileImg(null);
		setUploadedImgUrl("");
	}, [profileImg]);

	const profileImgRef = useRef<string | null>(null);
	useEffect(() => {
		profileImgRef.current = profileImg;
	}, [profileImg]);
	useEffect(() => {
		return () => {
			if (profileImgRef.current?.startsWith("blob:"))
				URL.revokeObjectURL(profileImgRef.current);
		};
	}, []);

	const handleContinue = useCallback(async () => {
		if (!profileImg) {
			toast.warning("Зураг оруулаагүй байна");
			return;
		}
		if (isUploadingImage) {
			toast.warning("Зураг upload хийж байна, түр хүлээнэ үү...");
			return;
		}
		if (!uploadedImgUrl) {
			toast.warning("Зурагны upload дуусаагүй байна, дахин оролдоно уу.");
			return;
		}
		if (!password || password.length < 6) {
			toast.warning("Нууц үгээ оруулна уу! (доод тал нь 6 тэмдэгт)");
			return;
		}
		if (password !== confirmPassword) {
			toast.warning("Нууц үг таарахгүй байна!");
			return;
		}
		console.log("🔍 d values:", {
			institutionid: d.institutionid,
			studentgroupid: d.studentgroupid,
			schooldb: d.schooldb,
		});
		setIsSaving(true);
		try {
			const payload: SavePayload = {
				loginname: d.login_name,
				firstname: d.firstname,
				lastname: d.lastname,
				reg_number: d.reg_number,
				gender: d.gender_code === "M" ? 1 : 0,
				phone: d.phone ?? "",
				email: d.email,
				aimag_id: Number(d.aimag_id) || 0,
				sym_id: Number(d.sym_id) || 0,
				class_id: d.class_id,
				group_id: d.group_id,
				img_url: uploadedImgUrl,
				descr: d.descr,
				dateofbirth: d.dateofbirth?.slice(0, 10) ?? "",
				personId: d.personId,
				schooldb: d.schooldb,
				schoolname: d.schoolname,
				studentgroupid: d.studentgroupid,
				studentgroupname: d.studentgroupname,
				aimag_name: d.aimag_name,
				sym_name: d.sym_name,
				passwordencrypt: "",
				password,
				institutionid: d.institutionid,
				academic_level: String(d.academic_level),
				nationality: d.nationality,
				gender_code: d.gender_code,
				conn: "skuul",
			};
			const result = await saveStudent(payload);
			if (result?.RetResponse?.ResponseType === false)
				throw new Error(
					result?.RetResponse?.ResponseMessage || "Хадгалах амжилтгүй",
				);
			const verifyData = {
				firstname: d.firstname,
				lastname: d.lastname,
				reg_number: d.reg_number,
				gender_code: d.gender_code,
				dateofbirth: d.dateofbirth,
				phone: d.phone,
				email: d.email,
				aimag_name: d.aimag_name,
				sym_name: d.sym_name,
				schoolname: d.schoolname,
				studentgroupname: d.studentgroupname,
				class_id: d.class_id,
				academic_level: d.academic_level,
				img_url: uploadedImgUrl,
				nationality: d.nationality,
				login_name: d.login_name,
				personId: d.personId,
				school_esis_id: d.institutionid, // ← нэмэх
				student_group_id: d.studentgroupid, // ← нэмэх
				schooldb: d.schooldb, // ← нэмэх
				password, // ← нэмэх
			};
			sessionStorage.removeItem("studentExam");
			sessionStorage.setItem("verifyData", JSON.stringify(verifyData));
			toast.success("Амжилттай хадгалагдлаа!");
			router.push("/mnUserCreate/verify");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
		} finally {
			setIsSaving(false);
		}
	}, [
		d,
		router,
		profileImg,
		uploadedImgUrl,
		password,
		confirmPassword,
		isUploadingImage,
	]);

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500 overflow-hidden">
			{/* ── NOTICE MODAL ── */}
			<NoticeModal open={noticeOpen} onClose={() => setNoticeOpen(false)} />

			{/* ── ACTION BAR ── */}
			<div className="sticky top-1 left-10 right-10 z-40 border rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-sm">
				<div className="container mx-auto px-4 lg:px-8 h-12 flex items-center justify-between">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.back()}
						className="gap-1.5 text-muted-foreground h-8 text-xs"
					>
						<ChevronLeft size={14} /> Буцах
					</Button>

					{/* Notice trigger button */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => setNoticeOpen(true)}
						className="gap-1.5 h-8 text-xs border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
					>
						<AlertTriangle size={13} />
						Санамж
					</Button>

					<Button
						size="sm"
						onClick={handleContinue}
						disabled={isSaving || isUploadingImage}
						className="gap-1.5 h-8 text-xs"
					>
						{isSaving ? (
							<>
								<svg
									className="animate-spin w-3.5 h-3.5"
									viewBox="0 0 24 24"
									fill="none"
								>
									<title>loading</title>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
									/>
								</svg>
								Хадгалж байна...
							</>
						) : (
							<>
								Үргэлжлүүлэх <ArrowRight size={13} />
							</>
						)}
					</Button>
				</div>
			</div>

			<div className="pt-16 p-3 lg:p-3">
				<div className="container mx-auto flex flex-col gap-3">
					{/* ── HERO CARD ── */}
					<Card className={CARD_CLS}>
						<CardContent className="p-4">
							<div className="flex flex-col md:flex-row items-center gap-4">
								{/* Avatar */}
								<div className="flex flex-col items-center gap-1.5 shrink-0">
									<input
										ref={fileRef}
										type="file"
										accept="image/jpeg,image/png,image/webp"
										className="hidden"
										onChange={(e) => {
											const f = e.target.files?.[0];
											if (f) processFile(f);
											e.target.value = "";
										}}
									/>
									<button
										type="button"
										onClick={() =>
											!isUploadingImage && fileRef.current?.click()
										}
										onDragOver={(e) => {
											e.preventDefault();
											setIsDragging(true);
										}}
										onDragLeave={() => setIsDragging(false)}
										onDrop={(e) => {
											e.preventDefault();
											setIsDragging(false);
											const f = e.dataTransfer.files?.[0];
											if (f) processFile(f);
										}}
										className={[
											"relative w-[90px] h-[90px] rounded-xl border-2 border-dashed overflow-hidden",
											"flex flex-col items-center justify-center gap-1.5 group transition-all duration-200",
											isDragging
												? "border-primary bg-primary/10 scale-105"
												: profileImg
													? "border-primary/40 cursor-pointer"
													: "border-destructive bg-destructive/5 hover:bg-destructive/10 cursor-pointer",
											isUploadingImage ? "cursor-wait opacity-70" : "",
										].join(" ")}
									>
										{isUploadingImage ? (
											<div className="flex flex-col items-center gap-1">
												<svg
													className="animate-spin w-6 h-6 text-primary"
													viewBox="0 0 24 24"
													fill="none"
												>
													<title>uploading</title>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													/>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
													/>
												</svg>
												<span className="text-[9px] text-muted-foreground font-semibold text-center px-1">
													Upload...
												</span>
											</div>
										) : profileImg ? (
											<>
												<Image
													src={profileImg}
													alt="Профайл зураг"
													fill
													className="object-cover"
												/>
												<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
													<Upload size={16} className="text-white" />
													<span className="text-[9px] text-white font-bold uppercase tracking-wider">
														Солих
													</span>
												</div>
												{uploadedImgUrl && (
													<div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center z-20 shadow">
														<span className="text-white text-[9px] font-bold">
															✓
														</span>
													</div>
												)}
											</>
										) : (
											<>
												<div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
													<ImagePlus size={16} className="text-destructive" />
												</div>
												<span className="text-[9px] text-destructive font-semibold text-center px-1 leading-tight">
													Зураг оруулах
												</span>
											</>
										)}
									</button>
									{!profileImg && !isUploadingImage && (
										<span className="text-[9px] text-destructive font-semibold">
											* Заавал оруулна уу
										</span>
									)}
									{profileImg && !isUploadingImage && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={clearImage}
											className="h-auto py-0.5 px-2 text-[9px] text-muted-foreground hover:text-destructive gap-1"
										>
											<X size={9} /> Устгах
										</Button>
									)}
								</div>

								{/* Name block */}
								<div className="text-center md:text-left flex-1">
									<h1 className="text-2xl font-bold text-foreground tracking-tight">
										{d.lastname}{" "}
										<span className="text-primary">{d.firstname}</span>
									</h1>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* ── GRID ── */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
						{/* LEFT */}
						<div className="lg:col-span-5 space-y-2">
							{/* Хувийн мэдээлэл */}
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-3 px-4">
									<CardTitle className="text-[11px] text-muted-foreground">
										Хувийн мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-4 pt-3 space-y-2">
									<div className="grid grid-cols-2 gap-3">
										<Field label="Овог">
											<ReadOnlyInput value={d.lastname} />
										</Field>
										<Field label="Нэр">
											<ReadOnlyInput value={d.firstname} />
										</Field>
									</div>
									<div className="grid grid-cols-3 gap-3">
										<Field label="Хүйс">
											<ReadOnlyInput
												value={d.gender_code === "M" ? "Эрэгтэй" : "Эмэгтэй"}
											/>
										</Field>
										<Field label="Нас">
											<ReadOnlyInput value={String(age)} />
										</Field>
										<Field label="Төрсөн огноо">
											<ReadOnlyInput value={fmtDate(d.dateofbirth)} />
										</Field>
									</div>
									<Field label="Үндэс угсаа">
										<ReadOnlyInput
											value={d.nationality || "Монгол"}
											icon={<Globe size={13} />}
										/>
									</Field>
									<div className="grid grid-cols-2 gap-3">
										<Field label="И-мэйл">
											<ReadOnlyInput
												value={d.email}
												icon={<Mail size={13} />}
											/>
										</Field>
										<Field label="Утас">
											<ReadOnlyInput
												value={d.phone ?? ""}
												icon={<Phone size={13} />}
											/>
										</Field>
									</div>
									<Field label="Нэвтрэх нэр">
										<ReadOnlyInput
											value={d.login_name}
											icon={<User size={13} />}
										/>
									</Field>
								</CardContent>
							</Card>
							{/* ── НУУЦ ҮГ ── */}
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-3 px-4">
									<CardTitle className="text-[11px] text-muted-foreground flex items-center gap-1.5">
										<Lock size={12} /> Нууц үг оруулах
									</CardTitle>
								</CardHeader>
								<CardContent className="p-4 pt-3">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{/* Нууц үг */}
										<Field label="Нууц үг" htmlFor="password" required>
											<div className="relative">
												<Input
													id="password"
													type={showPw ? "text" : "password"}
													value={password}
													onChange={(e) => setPassword(e.target.value)}
													placeholder="Шинэ нууц үг оруулах"
													className={`h-8 text-xs pr-9 font-mono tracking-wider ${!password ? "border-destructive/60 focus-visible:ring-destructive/30" : ""}`}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => setShowPw((p) => !p)}
													className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground"
												>
													{showPw ? <EyeOff size={13} /> : <Eye size={13} />}
												</Button>
											</div>
											{!password && (
												<p className="text-[10px] text-destructive mt-0.5">
													Өөрийн мартахгүй 6 оронтой тоогоор нууц үгээ үүсгээрэй
												</p>
											)}
										</Field>

										{/* Нууц үг баталгаажуулах */}
										<Field
											label="Нууц үг баталгаажуулах"
											htmlFor="confirmPassword"
											required
										>
											<div className="relative">
												<Input
													id="confirmPassword"
													type={showConfirmPw ? "text" : "password"}
													value={confirmPassword}
													onChange={(e) => setConfirmPassword(e.target.value)}
													placeholder="Нууц үгийг давтан оруулах"
													className={`h-8 text-xs pr-9 font-mono tracking-wider ${
														confirmPassword && password !== confirmPassword
															? "border-destructive/60 focus-visible:ring-destructive/30"
															: confirmPassword && password === confirmPassword
																? "border-green-500/60 focus-visible:ring-green-500/20"
																: ""
													}`}
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => setShowConfirmPw((p) => !p)}
													className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground"
												>
													{showConfirmPw ? (
														<EyeOff size={13} />
													) : (
														<Eye size={13} />
													)}
												</Button>
											</div>
											{confirmPassword && password !== confirmPassword && (
												<p className="text-[10px] text-destructive mt-0.5">
													✕ Нууц үг таарахгүй байна , арын нүдэн дээр дараад
													харж болно шүү 🫡
												</p>
											)}
											{confirmPassword && password === confirmPassword && (
												<p className="text-[10px] text-green-500 mt-0.5">
													✔ Нууц үг таарч байна 🫶
												</p>
											)}
										</Field>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* RIGHT */}
						<div className="lg:col-span-5 space-y-3">
							{/* Сургууль */}
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-3 px-4">
									<CardTitle className="text-[11px] text-muted-foreground">
										Сургуулийн мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0 pt-1.5">
									<InfoRow label="Сургуулийн нэр" value={d.schoolname} />
									<InfoRow label="Анги" value={`${d.class_id}-р анги`} />
									<InfoRow label="Бүлэг" value={d.studentgroupname} />
									<InfoRow
										label="Боловсролын түвшин"
										value={`${d.academic_level}-р анги`}
									/>
								</CardContent>
							</Card>

							{/* Системийн мэдээлэл */}
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-3 px-4">
									<CardTitle className="text-[11px] text-muted-foreground">
										Системийн мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0 pt-1.5">
									<InfoRow
										label="Регистрийн дугаар"
										value={d.reg_number}
										mono
									/>
									<InfoRow label="personId" value={d.personId} mono />
									<InfoRow
										label="Хүйсийн код"
										value={`${d.gender_code} (${d.gender})`}
										mono
									/>

									<InfoRow label="Тайлбар" value={d.descr} />
									<InfoRow label="Нас" value={`${age} нас`} />
									<InfoRow
										label="Төрсөн огноо"
										value={fmtDate(d.dateofbirth)}
									/>

									<div className="p-3 m-3 rounded-lg bg-muted/40 border flex gap-2.5">
										<div className="bg-muted p-1.5 rounded-md h-fit">
											<Lock size={12} className="text-muted-foreground" />
										</div>
										<div>
											<p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-0.5">
												Засах боломжгүй мэдээлэл
											</p>
											<p className="text-[10px] text-muted-foreground/70 leading-relaxed">
												Эдгээр мэдээлэл нь системд хадгалагдсан бөгөөд та
												өөрчлөх боломжгүй.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
