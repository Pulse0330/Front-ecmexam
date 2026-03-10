"use client";

import { IconPhone } from "@tabler/icons-react";
import crypto from "crypto";
import {
	AlertTriangle,
	ArrowRight,
	ChevronLeft,
	Globe,
	ImagePlus,
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
import { ImageCropModal } from "@/components/imageCropModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
	// ✅ НЭМСЭН: userCheckForm-оос дамжин ирсэн QPay алгасах тэмдэг
	_isPaid?: boolean;
}

interface ExamineeListData {
	login_name: string;
	first_name: string;
	last_name: string;
	register_number: string;
	gender: number;
	phone: string;
	phone_1: string | null;
	mail: string;
	age: number | null;
	address: string | null;
	aimag_id: string | null;
	sym_id: string | null;
	class_id: number;
	group_id: number;
	profile: string | null;
	descr: string;
	regdate: string;
	dateofbirth: string;
	personid: string;
	schooldb: string;
	schoolname: string;
	student_group_id: string;
	studentgroupname: string;
	aimag_name: string;
	sym_name: string;
	school_esis_id: string;
	academic_level: number;
	nationality: string;
	gender_code: "M" | "F";
	userid: number;
	password: string;
	passwordauto: string;
	ispay: number;
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
	phone_1: string;
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

async function fetchExamineeList(personId: string): Promise<ExamineeListData> {
	const res = await fetch(`${API_BASE}/api/examinee_list_1`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ personid: personId, conn: "skuul" }),
	});
	if (!res.ok) throw new Error(`examinee_list алдаа (${res.status})`);
	const data = await res.json();
	if (!data?.RetResponse?.ResponseType) throw new Error("Мэдээлэл олдсонгүй");
	return data.RetData[0];
}

// ── Image helpers ─────────────────────────────────────────────────────────────
async function uploadProfileImage(
	blob: Blob,
	originalName: string,
): Promise<string> {
	const formData = new FormData();
	formData.append("folder", "studentProfile");
	formData.append("file", blob, originalName);

	const result = await uploadImage(formData);

	if (result?.file?.url) return result.file.url;

	throw new Error("Upload хариу буруу байна");
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isWeakPassword(s: string): boolean {
	if (!s || s.trim() === "") return true;
	for (let i = 0; i < s.length - 2; i++) {
		const a = +s[i],
			b = +s[i + 1],
			c = +s[i + 2];
		if (b === a + 1 && c === a + 2) return true; // 123, 234...
		if (b === a - 1 && c === a - 2) return true; // 321, 987...
	}
	return false;
}

function generatePassword(): string {
	let pwd: string;
	do {
		pwd = Math.floor(100000 + Math.random() * 900000).toString();
	} while (isWeakPassword(pwd));
	return pwd;
}
function fmtDate(iso: string): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
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
		id: "lock",
		icon: <Lock size={13} className="text-red-500 shrink-0 mt-0.5" />,
		text: "Нууц үг нь системээс автоматаар үүсгэгдсэн бөгөөд та өөрчилж болохгүй.",
	},
	{
		id: "photo",
		icon: <ImagePlus size={13} className="text-blue-500 shrink-0 mt-0.5" />,
		text: "Хавсаргах цээж зураг нь 3*4 хэмжээтэй, сүүлийн 3 сарын дотор авхуулсан, урагшаа цэх харсан, арын фон нь цайвар цулгуй өнгийн, нарны шил болон малгайгүй байна.",
	},
	{
		id: "phone",
		icon: <IconPhone size={13} className="text-blue-500 shrink-0 mt-0.5" />,
		text: "Та одоо системд бүртгүүлсэн утасны дугаараа ашиглахгүй байгаа бол одоо ашиглаж байгаа дугаараа бичнэ үү.",
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

				<div className="px-5 py-4 flex flex-col gap-2.5">
					{NOTICE_ITEMS.map((item, idx) => (
						<div
							key={item.id}
							className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors"
						>
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
	const [noticeOpen, setNoticeOpen] = useState(true);
	const [examData, setExamData] = useState<ExamineeListData | null>(null);
	const [examDataLoading, setExamDataLoading] = useState(true);
	const [displayPhone, setDisplayPhone] = useState<string>(d.phone ?? "");
	const [displayPhone1, setDisplayPhone1] = useState<string>("");
	const [password, setPassword] = useState<string>(() => generatePassword());
	const [displayPassword, setDisplayPassword] = useState<string>("");

	const [profileImg, setProfileImg] = useState<string | null>(null);
	const [uploadedImgUrl, setUploadedImgUrl] = useState<string>("");
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	// ── Crop modal state ──────────────────────────────────────────────────────
	const [cropSrc, setCropSrc] = useState<string | null>(null);
	const [cropFileName, setCropFileName] = useState<string>("photo.jpg");
	const [cropOpen, setCropOpen] = useState(false);

	const fileRef = useRef<HTMLInputElement>(null);
	const age = calcAge(d.dateofbirth);

	// ── examinee_list_1 fetch ─────────────────────────────────────────────────
	useEffect(() => {
		if (!d.personId) {
			setExamDataLoading(false);
			return;
		}
		setExamDataLoading(true);
		fetchExamineeList(d.personId)
			.then((data) => {
				setExamData(data);
				if (data?.profile) {
					setProfileImg(data.profile);
					setUploadedImgUrl(data.profile);
				}
				// passwordauto хоосон эсвэл сул (123 гэх мэт) → шинээр generate
				if (data?.passwordauto && !isWeakPassword(data.passwordauto)) {
					setDisplayPassword(data.passwordauto);
					setPassword(data.passwordauto);
				} else {
					const gen = generatePassword();
					setDisplayPassword(gen);
					setPassword(gen);
				}
				if (data?.phone) setDisplayPhone(data.phone);
				if (data?.phone_1) setDisplayPhone1(data.phone_1);
			})
			.catch(() => {
				setExamData(null);
				const gen = generatePassword();
				setDisplayPassword(gen);
				setPassword(gen);
			})
			.finally(() => setExamDataLoading(false));
	}, [d.personId]);

	// ── Файл сонгоход crop modal нээх ────────────────────────────────────────
	const processFile = useCallback((file: File) => {
		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
			toast.error("Зөвхөн JPEG / PNG / WEBP зураг оруулна уу");
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			toast.error("Зурагны хэмжээ 10MB-аас хэтрэхгүй байх ёстой");
			return;
		}
		const url = URL.createObjectURL(file);
		setCropSrc(url);
		setCropFileName(file.name);
		setCropOpen(true);
	}, []);

	// ── Crop баталгаажуулсны дараа WebP болгоод upload хийх ─────────────────
	const handleCropConfirm = useCallback(
		async (croppedBlob: Blob) => {
			setCropOpen(false);
			const blobUrl = URL.createObjectURL(croppedBlob);
			setProfileImg((prev) => {
				if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
				return blobUrl;
			});
			setUploadedImgUrl("");
			setIsUploadingImage(true);
			try {
				const url = await uploadProfileImage(croppedBlob, cropFileName);
				setUploadedImgUrl(url);
				toast.success("Зураг амжилттай хадгалагдлаа");
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Зураг upload амжилтгүй",
				);
				URL.revokeObjectURL(blobUrl);
				const fallback = examData?.profile ?? null;
				setProfileImg(fallback);
				setUploadedImgUrl(fallback ?? "");
			} finally {
				setIsUploadingImage(false);
				if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
				setCropSrc(null);
			}
		},
		[cropFileName, cropSrc, examData],
	);

	const handleCropCancel = useCallback(() => {
		setCropOpen(false);
		if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
		setCropSrc(null);
	}, [cropSrc]);

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
		const password_hasher = (_password: string) => {
			const hashed = crypto
				.createHash("md5")
				.update(_password, "ucs-2")
				.digest("hex");
			console.log("password:", password);
			console.log("hashed:", hashed);
			return hashed;
		};

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
		if (!password) {
			toast.warning("Нууц үг үүсгэгдээгүй байна!");
			return;
		}
		if (!displayPhone) {
			toast.warning("Утасны дугаар оруулна уу!");
			return;
		}
		if (!displayPhone1) {
			toast.warning("Утас 2 дугаар оруулна уу!");
			return;
		}

		setIsSaving(true);
		try {
			const isExistingPassword = !!examData?.passwordauto;
			const passwordEncrypt = isExistingPassword
				? (examData?.password ?? password_hasher(password))
				: password_hasher(password);

			const payload: SavePayload = {
				loginname: d.login_name,
				firstname: d.firstname,
				lastname: d.lastname,
				reg_number: d.reg_number,
				gender: d.gender_code === "M" ? 1 : 0,
				phone: displayPhone,
				phone_1: displayPhone1,
				email: d.email,
				aimag_id: Number(d.aimag_id) || 0,
				sym_id: Number(d.sym_id) || 0,
				class_id: d.class_id,
				group_id: d.group_id,
				img_url: uploadedImgUrl,
				descr: d.descr,
				dateofbirth: d.dateofbirth,
				personId: d.personId,
				schooldb: d.schooldb,
				schoolname: d.schoolname,
				studentgroupid: d.studentgroupid,
				studentgroupname: d.studentgroupname,
				aimag_name: d.aimag_name,
				sym_name: d.sym_name,
				passwordencrypt: passwordEncrypt,
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

			const fresh = await fetchExamineeList(d.personId);

			// ✅ ӨӨРЧЛӨЛТ: _isPaid-г d prop-оос уншиж verifyData-д нэмлээ
			// Энэ утга userCheckForm → sessionStorage → page.tsx → StudentForm props-оор ирнэ
			// verifyForm нь үүнийг уншиж QPay алгасах эсэхийг шийднэ
			const verifyData = {
				firstname: fresh.first_name,
				lastname: fresh.last_name,
				reg_number: fresh.register_number,
				gender_code: fresh.gender_code,
				dateofbirth: fresh.dateofbirth,
				phone: displayPhone || fresh.phone || null,
				phone_1: displayPhone1 || fresh.phone_1 || null,
				email: fresh.mail,
				aimag_name: fresh.aimag_name,
				sym_name: fresh.sym_name,
				schoolname: fresh.schoolname,
				studentgroupname: fresh.studentgroupname,
				class_id: fresh.academic_level,
				academic_level: fresh.academic_level,
				img_url: uploadedImgUrl || examData?.profile || null,
				nationality: fresh.nationality || "Mongolian",
				login_name: fresh.login_name,
				personId: fresh.personid,
				school_esis_id: fresh.school_esis_id,
				student_group_id: fresh.student_group_id,
				schooldb: fresh.schooldb,
				userid: fresh.userid,
				password: fresh.passwordauto,
				age: fresh.age ?? null,
				address: fresh.address ?? null,
				// ✅ НЭМСЭН: userCheckForm-д тооцоолсон isPaid утгыг
				// verifyData-д хадгалж verifyForm-д дамжуулна
				_isPaid: d._isPaid ?? false,
			};

			console.log("fresh.passwordauto:", fresh.passwordauto);
			console.log("fresh.password:", fresh.password);
			console.log("password state:", password);
			console.log("[form] verifyData._isPaid:", verifyData._isPaid);

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
		isUploadingImage,
		examData,
		displayPhone,
		displayPhone1,
	]);

	// ── Display утгууд ────────────────────────────────────────────────────────
	const displayFirstname = examData?.first_name ?? d.firstname;
	const displayLastname = examData?.last_name ?? d.lastname;
	const displayEmail = examData?.mail ?? d.email;
	const displaySchoolname = examData?.schoolname ?? d.schoolname;
	const displayGroupname = examData?.studentgroupname ?? d.studentgroupname;
	const displayAimag = examData?.aimag_name ?? d.aimag_name;
	const displaySym = examData?.sym_name ?? d.sym_name;
	const displayNationality = examData?.nationality || d.nationality || "Монгол";
	const _displayAcademicLevel = examData?.academic_level ?? d.academic_level;

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500 overflow-hidden">
			<NoticeModal open={noticeOpen} onClose={() => setNoticeOpen(false)} />

			{/* ── Crop Modal ── */}
			<ImageCropModal
				open={cropOpen}
				imageSrc={cropSrc}
				onConfirm={handleCropConfirm}
				onCancel={handleCropCancel}
			/>

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
						disabled={isSaving || isUploadingImage || examDataLoading}
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
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
						{/* LEFT */}
						<div className="lg:col-span-5 space-y-2">
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-3 px-4">
									<CardTitle className="text-[11px] text-muted-foreground">
										Хувийн мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-4">
									<div className="flex flex-col md:flex-row items-center gap-4">
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
													"relative w-[90px] h-[120px] rounded-xl border-2 border-dashed overflow-hidden",
													"flex flex-col items-center justify-center gap-1.5 group transition-all duration-200",
													isDragging
														? "border-primary bg-primary/10 scale-105"
														: profileImg
															? "border-primary/40 cursor-pointer"
															: "border-destructive bg-destructive/5 hover:bg-destructive/10 cursor-pointer",
													isUploadingImage ? "cursor-wait opacity-70" : "",
												].join(" ")}
											>
												{examDataLoading ? (
													<div className="flex flex-col items-center gap-1">
														<svg
															className="animate-spin w-6 h-6 text-muted-foreground"
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
													</div>
												) : isUploadingImage ? (
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
															<ImagePlus
																size={16}
																className="text-destructive"
															/>
														</div>
														<span className="text-[9px] text-destructive font-semibold text-center px-1 leading-tight">
															Зураг оруулах
														</span>
													</>
												)}
											</button>
											{!profileImg && !isUploadingImage && !examDataLoading && (
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

										<div className="text-center md:text-left flex-1">
											<h1 className="text-2xl font-bold text-foreground tracking-tight">
												{displayLastname}{" "}
												<span className="text-primary">{displayFirstname}</span>
											</h1>
										</div>
									</div>
								</CardContent>
								<CardContent className="p-4 pt-3 space-y-2">
									<div className="grid grid-cols-2 gap-3">
										<Field label="Овог">
											<ReadOnlyInput value={displayLastname} />
										</Field>
										<Field label="Нэр">
											<ReadOnlyInput value={displayFirstname} />
										</Field>
									</div>
									<div className="grid grid-cols-3 gap-3">
										<Field label="Хүйс">
											<ReadOnlyInput
												value={
													(
														examData
															? examData.gender === 1
															: d.gender_code === "M"
													)
														? "Эрэгтэй"
														: "Эмэгтэй"
												}
											/>
										</Field>
										<Field label="Нас">
											<ReadOnlyInput value={String(age)} />
										</Field>
										<Field label="Төрсөн огноо">
											<ReadOnlyInput value={fmtDate(d.dateofbirth)} />
										</Field>
									</div>
									<Field label="Регистрийн дугаар">
										<ReadOnlyInput
											value={examData?.register_number ?? d.reg_number}
										/>
									</Field>
									<Field label="Үндэс угсаа">
										<ReadOnlyInput
											value={displayNationality}
											icon={<Globe size={13} />}
										/>
									</Field>
									<div className="grid grid-cols-2 gap-3">
										<Field label="И-мэйл">
											<ReadOnlyInput
												value={displayEmail}
												icon={<Mail size={13} />}
											/>
										</Field>
										<Field label="Утас">
											<div className="relative">
												<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
													<Phone size={13} />
												</span>
												<input
													type="text"
													value={displayPhone}
													onChange={(e) => setDisplayPhone(e.target.value)}
													className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs pl-8 focus:outline-none focus:ring-1 focus:ring-ring"
												/>
											</div>
										</Field>
										<Field label="Нэмэлт утасны дугаар" required>
											<div className="relative">
												<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
													<Phone size={13} />
												</span>
												<input
													type="text"
													value={displayPhone1}
													onChange={(e) => setDisplayPhone1(e.target.value)}
													placeholder="Нэмэлт дугаар"
													className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs pl-8 focus:outline-none focus:ring-1 focus:ring-ring"
												/>
											</div>
										</Field>
									</div>
									<Field label="Нэвтрэх нэр">
										<ReadOnlyInput
											value={examData?.login_name ?? d.login_name}
											icon={<User size={13} />}
										/>
									</Field>
								</CardContent>
							</Card>
						</div>

						{/* RIGHT */}
						<div className="lg:col-span-7 space-y-3">
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-3 px-4">
									<CardTitle className="text-[11px] text-muted-foreground">
										Сургуулийн мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0 pt-1.5">
									<InfoRow label="Сургуулийн нэр" value={displaySchoolname} />
									<InfoRow label="Анги / Бүлэг" value={displayGroupname} />
									<InfoRow label="Аймаг / Нийслэл" value={displayAimag} />
									<InfoRow label="Дүүрэг / Сум" value={displaySym} />
								</CardContent>
							</Card>
							<Card className={CARD_CLS}>
								<CardContent className="p-4">
									<div className="flex flex-col items-center gap-2 py-2">
										<div className="flex items-center gap-2 text-muted-foreground">
											<Lock size={13} />
											<span className="text-[11px] uppercase tracking-widest font-semibold">
												Нэвтрэх нууц үг
											</span>
										</div>
										<div className="w-full rounded-xl border-2 border-green-500/30 bg-green-500/5 dark:bg-green-500/10 px-6 py-4 flex items-center justify-center">
											<span className="font-mono text-4xl font-bold tracking-[0.25em] text-foreground select-all">
												{displayPassword}
											</span>
										</div>
										<p className="text-lg text-green-600 dark:text-green-500 text-center flex items-center gap-1.5">
											<Lock size={10} />
											{examData?.passwordauto
												? "Таны нууц үг. Нэвтрэх нууц үгээ цээжлээрэй."
												: "Системээс автоматаар үүсгэгдсэн 6 оронтой нууц үг. Нэвтрэх нууц үгээ цээжлээрэй."}
										</p>
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
