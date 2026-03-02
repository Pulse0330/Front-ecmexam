"use client";

import {
	ArrowRight,
	ChevronDown,
	ChevronLeft,
	Eye,
	EyeOff,
	Globe,
	ImagePlus,
	Info,
	Lock,
	Mail,
	MapPin,
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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	const webpFileName = file.name.replace(/\.[^/.]+$/, ".webp");
	formData.append("file", webpBlob, webpFileName);

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

	let imageUrl = "";
	if (Array.isArray(result) && result.length > 0) {
		imageUrl = extractUrl(result[0]);
	} else {
		imageUrl = extractUrl(result);
	}

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

function fmtDT(iso: string): string {
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

// ── Shared className ──────────────────────────────────────────────────────────
const CARD_CLS =
	"bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50";

// ── InfoRow ───────────────────────────────────────────────────────────────────
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
			<div className="flex justify-between items-start gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
				<span className="text-xs text-muted-foreground whitespace-nowrap">
					{label}
				</span>
				<span
					className={`text-sm font-medium text-right break-all ${mono ? "font-mono text-xs text-foreground/60" : "text-foreground"}`}
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

// ── Field ─────────────────────────────────────────────────────────────────────
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
		<div className="space-y-1.5">
			<Label
				htmlFor={htmlFor}
				className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1"
			>
				{label}
				{required && <span className="text-destructive font-bold">*</span>}
			</Label>
			{children}
		</div>
	);
}

// ── ReadOnlyInput ─────────────────────────────────────────────────────────────
function ReadOnlyInput({ value, icon }: { value: string; icon?: ReactNode }) {
	return (
		<div className="relative">
			{icon && (
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
					{icon}
				</span>
			)}
			<div
				className={`flex h-9 w-full rounded-md border border-input bg-muted/30 text-sm text-muted-foreground items-center cursor-not-allowed select-none ${icon ? "pl-9 pr-3" : "px-3"}`}
			>
				{value || "—"}
			</div>
		</div>
	);
}

// ── Notice items ──────────────────────────────────────────────────────────────
const NOTICE_ITEMS = [
	{
		id: "check",
		icon: "✔",
		text: "Та зөвхөн улаан харагдаж байгаа хэсэг дээр гараас утга оруулах боломжтой.",
	},
	{
		id: "lock",
		icon: "🔒",
		text: "Нууц үгээ заавал оруулна уу (доод тал нь 4 тэмдэгт).",
	},
	{
		id: "photo",
		icon: "📷",
		text: "Цээж зургаа тод, гэрэлтэй, нүүр нь бүтэн харагдахаар оруулна уу.",
	},
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function StudentForm({ data: d }: { data: StudentExamData }) {
	const router = useRouter();
	const [isSaving, setIsSaving] = useState(false);
	const [noticeOpen, setNoticeOpen] = useState(true);
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
			if (profileImgRef.current?.startsWith("blob:")) {
				URL.revokeObjectURL(profileImgRef.current);
			}
		};
	}, []);

	const handleContinue = useCallback(async () => {
		if (!profileImg) {
			toast.error("Зураг оруулна уу!");
			return;
		}
		if (isUploadingImage) {
			toast.error("Зураг upload хийж байна, түр хүлээнэ үү...");
			return;
		}
		if (!uploadedImgUrl) {
			toast.error("Зурагны upload дуусаагүй байна, дахин оролдоно уу.");
			return;
		}
		if (!password || password.length < 4) {
			toast.error("Нууц үгээ оруулна уу! (доод тал нь 4 тэмдэгт)");
			return;
		}
		if (password !== confirmPassword) {
			toast.error("Нууц үг таарахгүй байна!");
			return;
		}

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
				password: password,
				institutionid: d.institutionid,
				academic_level: String(d.academic_level),
				nationality: d.nationality,
				gender_code: d.gender_code,
				conn: "skuul",
			};

			const result = await saveStudent(payload);
			if (result?.RetResponse?.ResponseType === false) {
				throw new Error(
					result?.RetResponse?.ResponseMessage || "Хадгалах амжилтгүй",
				);
			}

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

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500 overflow-hidden">
			{/* ── STICKY ACTION BAR ── */}
			<div className="sticky top-0 z-40 border-b bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
				<div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.back()}
						className="gap-1.5 text-muted-foreground"
					>
						<ChevronLeft size={16} /> Буцах
					</Button>
					<Button
						size="sm"
						onClick={handleContinue}
						disabled={isSaving || isUploadingImage}
						className="gap-2"
					>
						{isSaving ? (
							<>
								<svg
									className="animate-spin w-4 h-4"
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
								Үргэлжлүүлэх <ArrowRight size={15} />
							</>
						)}
					</Button>
				</div>
			</div>

			{/* ── NOTICE ── */}
			<div className="border-b border-gray-200/50 dark:border-gray-700/50">
				<div className="max-w-[1200px] mx-auto px-4 lg:px-8">
					<button
						type="button"
						onClick={() => setNoticeOpen((o) => !o)}
						className="w-full flex items-center justify-between py-3 group"
					>
						<div className="flex items-center gap-2">
							<span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
								<Info size={11} className="text-white" />
							</span>
							<span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
								Санамж &amp; Зөвлөгөө
							</span>
						</div>
						<ChevronDown
							size={15}
							className={`text-amber-500 transition-transform duration-200 ${noticeOpen ? "rotate-180" : ""}`}
						/>
					</button>
					{noticeOpen && (
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4">
							{NOTICE_ITEMS.map((item, idx) => (
								<div
									key={item.id}
									className="flex gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
								>
									<span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
										{idx + 1}
									</span>
									<p className="text-[11px] leading-4 text-muted-foreground">
										{item.text}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<div className="p-4 lg:p-8">
				<div className="max-w-[1200px] mx-auto flex flex-col gap-5">
					{/* ── HERO ── */}
					<Card className={CARD_CLS}>
						<CardContent className="p-6">
							<div className="flex flex-col md:flex-row items-center gap-6">
								{/* Avatar */}
								<div className="flex flex-col items-center gap-2 flex-shrink-0">
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
									<div className="space-y-1 flex flex-col items-center">
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
												"relative w-[120px] h-[120px] rounded-xl border-2 border-dashed overflow-hidden",
												"flex flex-col items-center justify-center gap-2 group transition-all duration-200",
												isDragging
													? "border-primary bg-primary/10 scale-105"
													: profileImg
														? "border-primary/40 cursor-pointer"
														: "border-destructive bg-destructive/5 hover:bg-destructive/10 cursor-pointer",
												isUploadingImage ? "cursor-wait opacity-70" : "",
											].join(" ")}
										>
											{isUploadingImage ? (
												<div className="flex flex-col items-center gap-2">
													<svg
														className="animate-spin w-8 h-8 text-primary"
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
													<span className="text-[10px] text-muted-foreground font-semibold text-center px-2">
														Upload хийж байна...
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
													<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1.5 z-10">
														<Upload size={20} className="text-white" />
														<span className="text-[10px] text-white font-bold uppercase tracking-wider">
															Солих
														</span>
													</div>
													{uploadedImgUrl && (
														<div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center z-20 shadow">
															<span className="text-white text-[10px] font-bold">
																✓
															</span>
														</div>
													)}
												</>
											) : (
												<>
													<div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
														<ImagePlus size={20} className="text-destructive" />
													</div>
													<span className="text-[10px] text-destructive font-semibold text-center px-2 leading-tight">
														Зураг оруулах
													</span>
												</>
											)}
										</button>
										{!profileImg && !isUploadingImage && (
											<span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
												<span className="font-bold">*</span> Заавал оруулна уу
											</span>
										)}
									</div>
									{profileImg && !isUploadingImage && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={clearImage}
											className="h-auto py-0.5 px-2 text-[10px] text-muted-foreground hover:text-destructive gap-1"
										>
											<X size={10} /> Устгах
										</Button>
									)}
								</div>

								{/* Name block */}
								<div className="text-center md:text-left flex-1">
									<p className="text-[10px] font-semibold uppercase tracking-[4px] text-muted-foreground mb-1">
										Оюутны мэдээлэл
									</p>
									<h1 className="text-3xl font-bold text-foreground tracking-tight">
										{d.lastname}{" "}
										<span className="text-primary">{d.firstname}</span>
									</h1>
									<p className="text-xs font-mono text-muted-foreground tracking-[4px] mt-1">
										{d.reg_number}
									</p>
									<div className="flex items-center justify-center md:justify-start mt-2">
										<Badge variant="secondary" className="text-xs gap-1.5">
											<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
											{d.schoolname}
										</Badge>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* ── GRID ── */}
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
						{/* LEFT */}
						<div className="lg:col-span-7 space-y-5">
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-5 px-5">
									<CardTitle className="text-xs font-semibold uppercase tracking-[3px] text-muted-foreground">
										Хувийн мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-5 space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<Field label="Овог">
											<ReadOnlyInput value={d.lastname} />
										</Field>
										<Field label="Нэр">
											<ReadOnlyInput value={d.firstname} />
										</Field>
									</div>
									<div className="grid grid-cols-3 gap-4">
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
											icon={<Globe size={14} />}
										/>
									</Field>
									<div className="grid grid-cols-2 gap-4">
										<Field label="И-мэйл хаяг">
											<ReadOnlyInput
												value={d.email}
												icon={<Mail size={14} />}
											/>
										</Field>
										<Field label="Утасны дугаар">
											<ReadOnlyInput
												value={d.phone ?? ""}
												icon={<Phone size={14} />}
											/>
										</Field>
									</div>
									<Field label="Нэвтрэх нэр">
										<ReadOnlyInput
											value={d.login_name}
											icon={<User size={14} />}
										/>
									</Field>

									{/* Нууц үг */}
									<Field label="Нууц үг" htmlFor="password" required>
										<div className="relative">
											<Input
												id="password"
												type={showPw ? "text" : "password"}
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												placeholder="Шинэ нууц үг оруулах"
												className={`pr-10 font-mono tracking-wider ${!password ? "border-destructive/60 focus-visible:ring-destructive/30" : ""}`}
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => setShowPw((p) => !p)}
												className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground"
											>
												{showPw ? <EyeOff size={15} /> : <Eye size={15} />}
											</Button>
										</div>
										{!password && (
											<p className="text-[11px] text-destructive mt-1">
												Нууц үгээ заавал оруулна уу
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
												className={`pr-10 font-mono tracking-wider ${
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
												className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground"
											>
												{showConfirmPw ? (
													<EyeOff size={15} />
												) : (
													<Eye size={15} />
												)}
											</Button>
										</div>
										{confirmPassword && password !== confirmPassword && (
											<p className="text-[11px] text-destructive mt-1 flex items-center gap-1">
												✕ Нууц үг таарахгүй байна
											</p>
										)}
										{confirmPassword && password === confirmPassword && (
											<p className="text-[11px] text-green-500 mt-1 flex items-center gap-1">
												✔ Нууц үг таарч байна
											</p>
										)}
									</Field>
								</CardContent>
							</Card>

							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-5 px-5">
									<CardTitle className="text-xs font-semibold uppercase tracking-[3px] text-muted-foreground">
										Байршлын мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-5">
									<div className="grid grid-cols-2 gap-4">
										<Field label="Аймаг">
											<ReadOnlyInput
												value={d.aimag_name}
												icon={<MapPin size={14} />}
											/>
										</Field>
										<Field label="Сум / дүүрэг">
											<ReadOnlyInput
												value={d.sym_name}
												icon={<MapPin size={14} />}
											/>
										</Field>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* RIGHT */}
						<div className="lg:col-span-5 space-y-5">
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-5 px-5">
									<CardTitle className="text-xs font-semibold uppercase tracking-[3px] text-muted-foreground">
										Сургуулийн мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0 pt-2">
									<InfoRow label="Сургуулийн нэр" value={d.schoolname} />
									<InfoRow label="Сургуулийн ID" value={d.institutionid} mono />
									<InfoRow label="Сургуулийн DB" value={d.schooldb} mono />
									<InfoRow label="Анги" value={`${d.class_id}-р анги`} />
									<InfoRow label="Бүлэг" value={d.studentgroupname} />
									<InfoRow label="Бүлгийн ID" value={d.studentgroupid} mono />
									<InfoRow
										label="Боловсролын түвшин"
										value={`${d.academic_level}-р анги`}
									/>
								</CardContent>
							</Card>

							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-5 px-5">
									<CardTitle className="text-xs font-semibold uppercase tracking-[3px] text-muted-foreground">
										Системийн мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0 pt-2">
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
									<InfoRow label="Аймгийн ID" value={d.aimag_id} mono />
									<InfoRow label="Сумын ID" value={d.sym_id} mono />
									<InfoRow label="group_id" value={d.group_id} mono />
									<InfoRow label="Тайлбар" value={d.descr} />
									<InfoRow label="Нас" value={`${age} нас`} />
									<InfoRow
										label="Төрсөн огноо"
										value={fmtDate(d.dateofbirth)}
									/>
									<InfoRow label="Бүртгэсэн огноо" value={fmtDT(d.regdate)} />
									<div className="p-4 m-4 rounded-lg bg-muted/40 border flex gap-3">
										<div className="bg-muted p-2 rounded-md h-fit">
											<Lock size={14} className="text-muted-foreground" />
										</div>
										<div>
											<p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-1">
												Хязгаарлагдмал талбар
											</p>
											<p className="text-[11px] text-muted-foreground/70 leading-relaxed">
												Энэхүү мэдээллүүд нь ESIS-аас автоматаар татагдсан тул
												гар аргаар засах боломжгүй.
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
