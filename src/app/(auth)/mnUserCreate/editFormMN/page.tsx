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
interface StudentExamData {
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
	age?: number;
	_source?: "skuul" | "exam" | "eec";
	_isPaid?: boolean;
}

interface ExamineeInfo {
	register_number: string;
	examinee_number: string;
	last_name: string;
	first_name: string;
	gender: string;
	age: number | null;
	address: string | null;
	mail: string | null;
	mobile_1: string | null;
	mobile_2: string | null;
	nationality: string;
	school_esis_id: string;
	academic_level: number;
	student_group_id: string;
	profile: string | null;
	schoolname?: string | null;
	studentgroupname?: string | null;
	aimag_name?: string | null;
	sym_name?: string | null;
	exam_name?: string | null;
	start_date?: string | null;
	duration?: number | null;
	room_number?: string | null;
	roomname?: string | null;
	seatnumber?: number | null;
	status_text?: string | null;
	passwordauto?: string | null;
	password?: string | null;
	login_name?: string | null;
	userid?: number | null;
	[key: string]: unknown;
}

// ── API ───────────────────────────────────────────────────────────────────────
const API_BASE = "https://backend.skuul.mn";

async function getExamineeInfo(examineeNumber: string): Promise<ExamineeInfo> {
	const res = await fetch(`${API_BASE}/api/examinees/info/${examineeNumber}`, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});
	if (!res.ok) throw new Error(`examinees/info GET алдаа (${res.status})`);
	const data = await res.json();
	const item = data?.RetData
		? Array.isArray(data.RetData)
			? data.RetData[0]
			: data.RetData
		: data;
	if (!item) throw new Error("Мэдээлэл олдсонгүй");
	return item as ExamineeInfo;
}

async function postExamineeInfo(
	examineeNumber: string,
	payload: Partial<ExamineeInfo>,
) {
	const res = await fetch(`${API_BASE}/api/examinees/info/${examineeNumber}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`examinees/info POST алдаа (${res.status})`);
	return res.json();
}

async function fetchExamineeList(personId: string) {
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

async function uploadProfileImage(blob: Blob, name: string): Promise<string> {
	const fd = new FormData();
	fd.append("folder", "studentProfile");
	fd.append("file", blob, name);
	const result = await uploadImage(fd);
	if (result?.file?.url) return result.file.url;
	throw new Error("Upload хариу буруу байна");
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _fmtDate(iso: string | null | undefined): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("mn-MN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

function calcAge(dob: string | null | undefined): string {
	if (!dob) return "—";
	const d = new Date(dob);
	const t = new Date();
	let a = t.getFullYear() - d.getFullYear();
	if (
		t.getMonth() - d.getMonth() < 0 ||
		(t.getMonth() === d.getMonth() && t.getDate() < d.getDate())
	)
		a--;
	return String(a);
}

const CARD_CLS =
	"bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50";

const PW_DIGIT_KEYS = ["pw0", "pw1", "pw2", "pw3", "pw4", "pw5"] as const;
const CPW_DIGIT_KEYS = [
	"cpw0",
	"cpw1",
	"cpw2",
	"cpw3",
	"cpw4",
	"cpw5",
] as const;

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

// ── UI helpers ────────────────────────────────────────────────────────────────
function _InfoRow({
	label,
	value,
}: {
	label: string;
	value: string | number | null | undefined;
}) {
	return (
		<>
			<div className="flex justify-between items-center gap-3 px-4 py-2 hover:bg-muted/30 transition-colors">
				<span className="text-xs text-muted-foreground whitespace-nowrap">
					{label}
				</span>
				<span className="text-xs font-medium text-right break-all text-foreground">
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
	required,
	hint,
	children,
}: {
	label: string;
	required?: boolean;
	hint?: string;
	children: ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<Label className="text-[11px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
				{label}
				{required && <span className="text-destructive font-bold">*</span>}
			</Label>
			{children}
			{hint && <p className="text-[10px] text-muted-foreground/60">{hint}</p>}
		</div>
	);
}

function ReadOnlyInput({ value, icon }: { value: string; icon?: ReactNode }) {
	return (
		<div className="relative">
			{icon && (
				<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none">
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

function TextInput({
	value,
	onChange,
	placeholder,
	icon,
	disabled,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	icon?: ReactNode;
	disabled?: boolean;
}) {
	return (
		<div className="relative">
			{icon && (
				<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
					{icon}
				</span>
			)}
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				disabled={disabled}
				className={`flex h-8 w-full rounded-md border border-input bg-background py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:bg-muted/30 disabled:cursor-not-allowed disabled:text-muted-foreground ${icon ? "pl-8 pr-3" : "px-3"}`}
			/>
		</div>
	);
}

function GenderSelect({
	value,
	onChange,
}: {
	value: "M" | "F";
	onChange: (v: "M" | "F") => void;
}) {
	return (
		<div className="flex gap-2">
			{(["M", "F"] as const).map((g) => (
				<button
					key={g}
					type="button"
					onClick={() => onChange(g)}
					className={[
						"flex-1 h-8 rounded-md border text-xs font-medium transition-colors",
						value === g
							? "border-primary bg-primary text-primary-foreground"
							: "border-input bg-background text-foreground hover:bg-muted/40",
					].join(" ")}
				>
					{g === "M" ? "Эрэгтэй" : "Эмэгтэй"}
				</button>
			))}
		</div>
	);
}

function Spinner({ className }: { className?: string }) {
	return (
		<svg
			className={`animate-spin ${className}`}
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
	);
}

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

function ConfirmDialog({
	open,
	onConfirm,
	onCancel,
}: {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
			<DialogContent className="sm:max-w-xs rounded-2xl p-0 overflow-hidden gap-0">
				<DialogHeader className="px-5 pt-5 pb-3">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
							<ArrowRight size={15} className="text-primary" />
						</div>
						<DialogTitle className="text-sm font-bold text-foreground">
							Мэдээлэл хадгалах
						</DialogTitle>
					</div>
				</DialogHeader>
				<Separator className="opacity-40" />
				<div className="px-5 py-4">
					<p className="text-xs text-muted-foreground leading-relaxed">
						Та оруулсан мэдээллээ шалган баталгаажуулна уу. Үргэлжлүүлэхэд
						мэдээлэл хадгалагдаж дараагийн алхам руу шилжинэ.
					</p>
				</div>
				<Separator className="opacity-40" />
				<div className="px-5 py-4 flex gap-2">
					<Button
						variant="outline"
						onClick={onCancel}
						className="flex-1 h-9 text-xs rounded-xl"
					>
						Буцах
					</Button>
					<Button
						onClick={onConfirm}
						className="flex-1 h-9 text-xs rounded-xl gap-1.5"
					>
						Тийм, үргэлжлүүлэх <ArrowRight size={13} />
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EditFormMNPage() {
	const router = useRouter();

	const [d, setD] = useState<StudentExamData | null>(null);
	const [examineeNumber, setExamineeNumber] = useState<string | null>(null);
	const [info, setInfo] = useState<ExamineeInfo | null>(null);
	const [infoLoading, setInfoLoading] = useState(true);

	// ── Засварлах state-үүд (GET-ийн бүх өөрчлөх боломжтой талбар) ──────────
	const [lastName, setLastName] = useState("");
	const [firstName, setFirstName] = useState("");
	const [genderVal, setGenderVal] = useState<"M" | "F">("M");
	const [mail, setMail] = useState("");
	const [phone, setPhone] = useState("");
	const [phone2, setPhone2] = useState("");
	const [address, setAddress] = useState("");
	const [nationality, setNationality] = useState("");
	const [dateofbirth, setDateofbirth] = useState("");
	const [ageVal, setAgeVal] = useState("");
	const [registerNumber, setRegisterNumber] = useState("");
	const [schoolEsisId, setSchoolEsisId] = useState("");
	const [academicLevel, setAcademicLevel] = useState("");
	const [studentGroupId, setStudentGroupId] = useState("");
	const [passwordVal, setPasswordVal] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// Зураг
	const [profileImg, setProfileImg] = useState<string | null>(null);
	const [uploadedImgUrl, setUploadedImgUrl] = useState<string>("");
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const [cropSrc, setCropSrc] = useState<string | null>(null);
	const [cropFileName, setCropFileName] = useState("photo.jpg");
	const [cropOpen, setCropOpen] = useState(false);

	const [isSaving, setIsSaving] = useState(false);
	const [noticeOpen, setNoticeOpen] = useState(true);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const fileRef = useRef<HTMLInputElement>(null);

	// ── 1. sessionStorage ─────────────────────────────────────────────────────
	useEffect(() => {
		const raw = sessionStorage.getItem("studentExam");
		const examNum = sessionStorage.getItem("examineeNumber");
		if (!raw) {
			router.replace("/mnUserCreate");
			return;
		}
		try {
			setD(JSON.parse(raw) as StudentExamData);
			setExamineeNumber(examNum);
		} catch {
			router.replace("/mnUserCreate");
		}
	}, [router]);

	// ── 2. GET → state-үүдэд дүүргэнэ ────────────────────────────────────────
	useEffect(() => {
		if (!examineeNumber) return;
		setInfoLoading(true);
		getExamineeInfo(examineeNumber)
			.then((data) => {
				setInfo(data);
				// Бүх засварлах талбарт GET-ийн утгыг дүүргэнэ
				setLastName(data.last_name ?? "");
				setFirstName(data.first_name ?? "");
				setGenderVal(data.gender === "M" ? "M" : "F");
				setMail(data.mail ?? "");
				setPhone(data.mobile_1 ?? "");
				setPhone2(data.mobile_2 ?? "");
				setAddress(data.address ?? "");
				setNationality(data.nationality ?? "");
				setDateofbirth(d?.dateofbirth ?? "");
				setAgeVal(
					data.age != null ? String(data.age) : calcAge(d?.dateofbirth),
				);
				setRegisterNumber(data.register_number ?? "");
				setSchoolEsisId(data.school_esis_id ?? "");
				setAcademicLevel(String(data.academic_level ?? ""));
				setStudentGroupId(data.student_group_id ?? "");
				setPasswordVal(data.passwordauto ?? "");
				if (data.profile) {
					setProfileImg(data.profile);
					setUploadedImgUrl(data.profile);
				}
			})
			.catch((err) =>
				toast.error(
					err instanceof Error ? err.message : "Мэдээлэл татахад алдаа",
				),
			)
			.finally(() => setInfoLoading(false));
	}, [examineeNumber, d?.dateofbirth]);

	// ── Image ─────────────────────────────────────────────────────────────────
	const processFile = useCallback((file: File) => {
		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
			toast.error("Зөвхөн JPEG / PNG / WEBP зураг оруулна уу");
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			toast.error("Зурагны хэмжээ 10MB-аас хэтрэхгүй байх ёстой");
			return;
		}
		setCropSrc(URL.createObjectURL(file));
		setCropFileName(file.name);
		setCropOpen(true);
	}, []);

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
				toast.success("Зураг амжилттай upload хийгдлээ");
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Зураг upload амжилтгүй",
				);
				URL.revokeObjectURL(blobUrl);
				const fb = info?.profile ?? null;
				setProfileImg(fb);
				setUploadedImgUrl(fb ?? "");
			} finally {
				setIsUploadingImage(false);
				if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
				setCropSrc(null);
			}
		},
		[cropFileName, cropSrc, info],
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
	useEffect(
		() => () => {
			if (profileImgRef.current?.startsWith("blob:"))
				URL.revokeObjectURL(profileImgRef.current);
		},
		[],
	);

	// ── 3. POST хадгалах ──────────────────────────────────────────────────────
	const handleContinue = useCallback(async () => {
		if (!d || !info || !examineeNumber) return;
		if (!profileImg) {
			toast.warning("Зураг оруулаагүй байна");
			return;
		}
		if (isUploadingImage) {
			toast.warning("Зураг upload хийж байна, түр хүлээнэ үү...");
			return;
		}
		if (!uploadedImgUrl) {
			toast.warning("Зурагны upload дуусаагүй байна");
			return;
		}
		if (!phone) {
			toast.warning("Утасны дугаар оруулна уу!");
			return;
		}
		if (!phone2) {
			toast.warning("Нэмэлт утасны дугаар оруулна уу!");
			return;
		}
		if (passwordVal && passwordVal.length !== 6) {
			toast.warning("Нууц үг 6 оронтой байх ёстой!");
			return;
		}
		if (passwordVal && passwordVal !== confirmPassword) {
			toast.warning("Нууц үг таарахгүй байна!");
			return;
		}

		setIsSaving(true);
		try {
			// POST — GET-ийн бүх утгыг хадгалж, засварласан талбаруудыг override хийнэ
			const postPayload: Partial<ExamineeInfo> = {
				...info,
				register_number: registerNumber,
				last_name: lastName,
				first_name: firstName,
				gender: genderVal,
				mail,
				mobile_1: phone,
				mobile_2: phone2,
				address: address || null,
				nationality,
				school_esis_id: schoolEsisId,
				academic_level: Number(academicLevel) || info.academic_level,
				student_group_id: studentGroupId,
				age: ageVal ? Number(ageVal) : null,
				...(passwordVal ? { password: passwordVal } : {}),
				profile: uploadedImgUrl,
			};

			const result = await postExamineeInfo(examineeNumber, postPayload);
			if (result?.RetResponse?.ResponseType === false)
				throw new Error(
					result?.RetResponse?.ResponseMessage || "Хадгалах амжилтгүй",
				);

			const fresh = await fetchExamineeList(d.personId);
			const pw = (_p: string) =>
				crypto.createHash("md5").update(_p, "ucs-2").digest("hex");
			const rawPassword =
				(passwordVal || info.passwordauto) ?? fresh?.passwordauto ?? "";
			const encPassword = info.password ?? (rawPassword ? pw(rawPassword) : "");

			const verifyData = {
				firstname: firstName,
				lastname: lastName,
				reg_number: registerNumber,
				gender_code: genderVal,
				dateofbirth: dateofbirth || d.dateofbirth,
				phone: phone || null,
				phone_1: phone2 || null,
				email: mail || fresh?.mail || d.email,
				aimag_name: fresh?.aimag_name ?? d.aimag_name,
				sym_name: fresh?.sym_name ?? d.sym_name,
				schoolname: info.schoolname ?? fresh?.schoolname ?? d.schoolname,
				studentgroupname:
					info.studentgroupname ??
					fresh?.studentgroupname ??
					d.studentgroupname,
				class_id: Number(academicLevel) || info.academic_level,
				academic_level: Number(academicLevel) || info.academic_level,
				img_url: uploadedImgUrl,
				nationality,
				login_name: info.login_name ?? fresh?.login_name ?? d.login_name,
				personId: d.personId,
				school_esis_id: schoolEsisId,
				student_group_id: studentGroupId,
				schooldb: fresh?.schooldb ?? d.schooldb,
				userid: info.userid ?? fresh?.userid ?? 0,
				password: rawPassword,
				passwordencrypt: encPassword,
				age: ageVal ? Number(ageVal) : (info.age ?? null),
				address: address || null,
				_isPaid: d._isPaid ?? false,
			};

			sessionStorage.removeItem("studentExam");
			sessionStorage.removeItem("examineeNumber");
			sessionStorage.setItem("verifyData", JSON.stringify(verifyData));
			toast.success("Амжилттай хадгалагдлаа!");
			router.push("/login");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Алдаа гарлаа");
		} finally {
			setIsSaving(false);
		}
	}, [
		d,
		info,
		examineeNumber,
		router,
		profileImg,
		uploadedImgUrl,
		isUploadingImage,
		lastName,
		firstName,
		genderVal,
		mail,
		phone,
		phone2,
		address,
		nationality,
		registerNumber,
		schoolEsisId,
		academicLevel,
		studentGroupId,
		dateofbirth,
		ageVal,
		passwordVal,
		confirmPassword,
	]);

	// ── Loading ───────────────────────────────────────────────────────────────
	if (!d || infoLoading) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-3">
				<Spinner className="w-7 h-7 text-emerald-600" />
				<p className="text-xs text-muted-foreground">Мэдээлэл татаж байна...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-500">
			<NoticeModal open={noticeOpen} onClose={() => setNoticeOpen(false)} />
			<ConfirmDialog
				open={confirmOpen}
				onConfirm={() => {
					setConfirmOpen(false);
					handleContinue();
				}}
				onCancel={() => setConfirmOpen(false)}
			/>
			<ImageCropModal
				open={cropOpen}
				imageSrc={cropSrc}
				onConfirm={handleCropConfirm}
				onCancel={handleCropCancel}
			/>

			{/* ACTION BAR */}
			<div className="sticky top-1 z-40 mx-1 border rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-sm">
				<div className="container mx-auto px-4 lg:px-8 h-12 flex items-center justify-between">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.back()}
						className="gap-1.5 text-muted-foreground h-8 text-xs"
					>
						<ChevronLeft size={14} /> Буцах
					</Button>
					<span className="text-xs font-semibold">Мэдээлэл засварлах</span>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setNoticeOpen(true)}
							className="gap-1.5 h-8 text-xs border-amber-500/40 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
						>
							<AlertTriangle size={13} /> Санамж
						</Button>
						<Button
							size="sm"
							onClick={() => setConfirmOpen(true)}
							disabled={isSaving || isUploadingImage}
							className="gap-1.5 h-8 text-xs"
						>
							{isSaving ? (
								<>
									<Spinner className="w-3.5 h-3.5" /> Хадгалж байна...
								</>
							) : (
								<>
									Үргэлжлүүлэх <ArrowRight size={13} />
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			<div className="pt-4 p-3 lg:p-3">
				<div className="container mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
						{/* ── LEFT ── */}
						<div className="lg:col-span-5 space-y-3">
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-3 px-4">
									<CardTitle className="text-[11px] text-muted-foreground">
										Хувийн мэдээлэл
									</CardTitle>
								</CardHeader>
								<CardContent className="p-4 space-y-3">
									{/* Зураг + нэр */}
									<div className="flex flex-col md:flex-row items-center gap-4">
										{/* Зураг upload */}
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
												{isUploadingImage ? (
													<div className="flex flex-col items-center gap-1">
														<Spinner className="w-6 h-6 text-primary" />
														<span className="text-[9px] text-muted-foreground font-semibold text-center px-1">
															Upload...
														</span>
													</div>
												) : profileImg ? (
													<>
														<Image
															src={profileImg}
															alt="Профайл"
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
											{!profileImg && !isUploadingImage && (
												<span className="text-[9px] text-destructive font-semibold">
													* Заавал
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
											<h1 className="text-xl font-bold tracking-tight">
												{lastName}{" "}
												<span className="text-primary">{firstName}</span>
											</h1>
											{examineeNumber && (
												<p className="text-xs text-muted-foreground font-mono mt-0.5">
													Шалгуулагч №{examineeNumber}
												</p>
											)}
										</div>
									</div>

									{/* ── Засварлах талбарууд ── */}
									<div className="grid grid-cols-2 gap-3">
										<Field label="Овог" required>
											<TextInput
												value={lastName}
												onChange={setLastName}
												placeholder="Овог"
												icon={<User size={13} />}
											/>
										</Field>
										<Field label="Нэр" required>
											<TextInput
												value={firstName}
												onChange={setFirstName}
												placeholder="Нэр"
												icon={<User size={13} />}
											/>
										</Field>
									</div>

									<Field label="Хүйс">
										<GenderSelect value={genderVal} onChange={setGenderVal} />
									</Field>

									<div className="grid grid-cols-2 gap-3">
										<Field label="Нас">
											<TextInput
												value={ageVal}
												onChange={setAgeVal}
												placeholder="Нас"
											/>
										</Field>
										<Field label="Төрсөн огноо">
											<TextInput
												value={dateofbirth}
												onChange={setDateofbirth}
												placeholder="YYYY-MM-DD"
											/>
										</Field>
									</div>

									<Field label="Регистрийн дугаар" required>
										<TextInput
											value={registerNumber}
											onChange={setRegisterNumber}
											placeholder="Регистрийн дугаар"
										/>
									</Field>

									<Field label="И-мэйл">
										<TextInput
											value={mail}
											onChange={setMail}
											placeholder="И-мэйл хаяг"
											icon={<Mail size={13} />}
										/>
									</Field>

									<div className="grid grid-cols-2 gap-3">
										<Field label="Утас" required>
											<TextInput
												value={phone}
												onChange={setPhone}
												placeholder="Утасны дугаар"
												icon={<Phone size={13} />}
											/>
										</Field>
										<Field label="Нэмэлт утас" required>
											<TextInput
												value={phone2}
												onChange={setPhone2}
												placeholder="Нэмэлт дугаар"
												icon={<Phone size={13} />}
											/>
										</Field>
									</div>

									<Field label="Хаяг">
										<TextInput
											value={address}
											onChange={setAddress}
											placeholder="Хаяг бичнэ үү"
											icon={<MapPin size={13} />}
										/>
									</Field>

									<Field label="Үндэс угсаа">
										<TextInput
											value={nationality}
											onChange={setNationality}
											placeholder="Үндэс угсаа"
											icon={<Globe size={13} />}
										/>
									</Field>

									<Field label="Нэвтрэх нэр">
										<ReadOnlyInput
											value={info?.login_name ?? d.login_name}
											icon={<User size={13} />}
										/>
									</Field>
								</CardContent>
							</Card>
						</div>

						{/* ── RIGHT ── */}
						<div className="lg:col-span-7 space-y-3">
							{/* Нууц үг */}
							<Card className={CARD_CLS}>
								<CardHeader className="pb-0 pt-3 px-4">
									<CardTitle className="text-[11px] text-muted-foreground">
										Нэвтрэх нууц үг
									</CardTitle>
								</CardHeader>
								<CardContent className="p-4 space-y-4">
									{/* Мэдэгдэл */}
									<div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
										<AlertTriangle
											size={12}
											className="text-amber-500 shrink-0 mt-0.5"
										/>
										<p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
											Та өмнөх нууц үгээ ашиглаж байгаа бол одоо өөрчлөхгүй байж
											болно. Таны хуучин нууц үгээр үргэлжилнэ.
										</p>
									</div>

									{/* Нууц үг */}
									<div className="space-y-2">
										<p className="text-[11px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
											<Lock size={11} /> Шинэ нууц үг{" "}
											<span className="text-muted-foreground/50 font-normal normal-case tracking-normal">
												(заавал биш)
											</span>
										</p>
										<div className="flex gap-2 justify-center">
											{PW_DIGIT_KEYS.map((digitKey, i) => (
												<input
													key={digitKey}
													id={`pw-digit-${i}`}
													type="text"
													inputMode="numeric"
													maxLength={1}
													value={passwordVal[i] ?? ""}
													onChange={(e) => {
														const ch = e.target.value.replace(/\D/, "");
														const chars = Array.from({ length: 6 }, (_, k) =>
															k === i ? ch : (passwordVal[k] ?? ""),
														);
														setPasswordVal(chars.join(""));
														if (ch && i < 5)
															document
																.getElementById(`pw-digit-${i + 1}`)
																?.focus();
													}}
													onKeyDown={(e) => {
														if (
															e.key === "Backspace" &&
															!passwordVal[i] &&
															i > 0
														)
															document
																.getElementById(`pw-digit-${i - 1}`)
																?.focus();
													}}
													onPaste={(e) => {
														e.preventDefault();
														const pasted = e.clipboardData
															.getData("text")
															.replace(/\D/g, "")
															.slice(0, 6);
														setPasswordVal(
															pasted.padEnd(6, " ").slice(0, 6).trimEnd(),
														);
														document
															.getElementById(
																`pw-digit-${Math.min(pasted.length, 5)}`,
															)
															?.focus();
													}}
													className={[
														"w-10 h-12 text-center text-xl font-bold font-mono rounded-xl border-2 bg-background focus:outline-none transition-colors",
														passwordVal[i]
															? "border-primary focus:border-primary"
															: "border-input focus:border-primary focus:ring-1 focus:ring-primary",
													].join(" ")}
												/>
											))}
										</div>
									</div>

									<Separator className="opacity-40" />

									{/* Нууц үг давтах */}
									<div className="space-y-2">
										<p className="text-[11px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
											<Lock size={11} /> Нууц үг давтах{" "}
											<span className="text-muted-foreground/50 font-normal normal-case tracking-normal">
												(заавал биш)
											</span>
										</p>
										<div className="flex gap-2 justify-center">
											{CPW_DIGIT_KEYS.map((digitKey, i) => (
												<input
													key={digitKey}
													id={`cpw-digit-${i}`}
													type="text"
													inputMode="numeric"
													maxLength={1}
													value={confirmPassword[i] ?? ""}
													onChange={(e) => {
														const ch = e.target.value.replace(/\D/, "");
														const chars = Array.from({ length: 6 }, (_, k) =>
															k === i ? ch : (confirmPassword[k] ?? ""),
														);
														setConfirmPassword(chars.join(""));
														if (ch && i < 5)
															document
																.getElementById(`cpw-digit-${i + 1}`)
																?.focus();
													}}
													onKeyDown={(e) => {
														if (
															e.key === "Backspace" &&
															!confirmPassword[i] &&
															i > 0
														)
															document
																.getElementById(`cpw-digit-${i - 1}`)
																?.focus();
													}}
													onPaste={(e) => {
														e.preventDefault();
														const pasted = e.clipboardData
															.getData("text")
															.replace(/\D/g, "")
															.slice(0, 6);
														setConfirmPassword(
															pasted.padEnd(6, " ").slice(0, 6).trimEnd(),
														);
														document
															.getElementById(
																`cpw-digit-${Math.min(pasted.length, 5)}`,
															)
															?.focus();
													}}
													className={[
														"w-10 h-12 text-center text-xl font-bold font-mono rounded-xl border-2 bg-background focus:outline-none transition-colors",
														confirmPassword.length === 6
															? passwordVal === confirmPassword
																? "border-green-500 focus:border-green-500"
																: "border-destructive focus:border-destructive"
															: confirmPassword[i]
																? "border-primary focus:border-primary"
																: "border-input focus:border-primary focus:ring-1 focus:ring-primary",
													].join(" ")}
												/>
											))}
										</div>
									</div>

									{/* Статус */}
									{confirmPassword.length === 6 &&
										(passwordVal === confirmPassword ? (
											<p className="text-xs text-green-600 dark:text-green-500 text-center flex items-center justify-center gap-1.5">
												<Lock size={10} /> Нууц үг таарлаа ✓
											</p>
										) : (
											<p className="text-xs text-destructive text-center flex items-center justify-center gap-1.5">
												<AlertTriangle size={10} /> Нууц үг таарахгүй байна
											</p>
										))}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
