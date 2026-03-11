"use client";

import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Loader2,
	Pencil,
	RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";

// ─── Env ──────────────────────────────────────────────────────────────────────
const EXAM_API_BASE =
	process.env.NEXT_PUBLIC_EXAM_API_URL ?? "https://backend.skuul.mn";

const SKUUL_API_BASE = "https://backend.skuul.mn";

// ─── Types ────────────────────────────────────────────────────────────────────
type CheckState = "idle" | "loading" | "found" | "not_found" | "error";

interface AimagItem {
	mAcode: string;
	mName: string;
	mID: number;
	sort: number;
	miid: string;
	mid1: number;
}
interface DistrictItem {
	id: number;
	name: string;
	sort: number;
}
interface SchoolItem {
	sName: string;
	conn: string;
	dbname: string;
	sort: number;
	district_id: number;
	serverip: string;
}
interface StudentExamData {
	password?: string;
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
	exam_number?: string;
	exam_name?: string;
	start_date?: string;
	end_date?: string;
	duration?: number;
	room_number?: string;
	roomname?: string;
	seatnumber?: number | null;
	seatposition?: string | null;
	status_code?: number;
	status_text?: string;
	age?: number;
	_source?: "skuul" | "exam" | "eec";
	_isPaid?: boolean;
}

interface ExamineeInfo {
	examinee_number: string;
	first_name: string;
	last_name: string;
	register_number: string;
	gender: string;
	age: number | null;
	mail: string | null;
	profile: string | null;
	schoolname: string | null;
	studentgroupname: string | null;
	aimag_name: string | null;
	sym_name: string | null;
	exam_name: string | null;
	start_date: string | null;
	end_date: string | null;
	duration: number | null;
	room_number: string | null;
	roomname: string | null;
	seatnumber: number | null;
	seatposition: string | null;
	status_text: string | null;
	status_code: number | null;
	[key: string]: unknown;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────
interface ApiResponse<T> {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: T[];
}

// ─── API helpers (аймаг / дүүрэг / сургууль) ─────────────────────────────────
async function apiAimag() {
	const r = await fetch("/api/sign/aimag", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
	});
	if (!r.ok) throw new Error("Аймгийн мэдээлэл авахад алдаа гарлаа");
	return r.json();
}

async function apiDistrict(aimagId: number) {
	const r = await fetch("/api/sign/district", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ aimag_id: aimagId }),
	});
	if (!r.ok) throw new Error("Дүүргийн мэдээлэл авахад алдаа гарлаа");
	return r.json();
}

async function apiSchool(aimagId: number, districtId: number) {
	const r = await fetch("/api/sign/surguuli", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ aimag_id: aimagId, district_id: districtId }),
	});
	if (!r.ok) throw new Error("Сургуулийн мэдээлэл авахад алдаа гарлаа");
	return r.json();
}

// ─── Exam API fallback ────────────────────────────────────────────────────────
async function apiGetStudentExam(
	dbname: string,
	regnumber: string,
): Promise<StudentExamData | null> {
	const r = await fetch(`${EXAM_API_BASE}/api/getstudentexam`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ dbname, regnumber }),
	});
	if (!r.ok) throw new Error("Серверт холбогдоход алдаа гарлаа");
	const d: ApiResponse<StudentExamData> = await r.json();
	if (!d.RetResponse.ResponseType)
		throw new Error(
			"Регистрийн дугаар бүртгэлгүй байна. Сургалтын менежертээ хандана уу.",
		);
	const student = d.RetData[0] ?? null;
	if (student) student._source = "exam";
	return student;
}

// ─── Skuul examinee_list ──────────────────────────────────────────────────────
async function apiGetExamineeList(
	personId: string,
): Promise<StudentExamData | null> {
	if (!personId) return null;
	try {
		const r = await fetch(`${SKUUL_API_BASE}/api/examinee_list_1`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ personid: personId, conn: "skuul" }),
		});
		if (!r.ok) return null;
		const data = await r.json();
		console.log("[examinee_list] response:", JSON.stringify(data));
		if (!data?.RetResponse?.ResponseType) return null;
		const item = data.RetData?.[0];
		if (!item) return null;
		const student: StudentExamData = {
			login_name: item.register_number,
			firstname: item.first_name,
			lastname: item.last_name,
			reg_number: item.register_number,
			gender: item.gender === 1 ? 1 : 0,
			gender_code: item.gender === 1 ? "M" : "F",
			phone: null,
			email: item.mail,
			aimag_id: "",
			sym_id: "",
			class_id: item.academic_level,
			group_id: Number(item.student_group_id),
			img_url: item.profile,
			descr: "",
			regdate: "",
			dateofbirth: "",
			personId: item.personid,
			schooldb: item.schooldb,
			schoolname: item.schoolname,
			studentgroupid: item.student_group_id,
			studentgroupname: item.studentgroupname,
			aimag_name: item.aimag_name,
			sym_name: item.sym_name,
			institutionid: item.school_esis_id,
			academic_level: item.academic_level,
			nationality: item.nationality ?? "",
			_source: "skuul",
		};
		return student;
	} catch (e) {
		console.error("[examinee_list] error:", e);
		return null;
	}
}

// ─── RetData normalize ────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRetData(retData: any): any | null {
	if (!retData) return null;
	if (Array.isArray(retData)) return retData[0] ?? null;
	return retData;
}

// ─── Regex ────────────────────────────────────────────────────────────────────
const REG_ALLOWED = /[^A-ZА-ЯӨҮa-zа-яөү0-9]/g;

// ─── SelectField ──────────────────────────────────────────────────────────────
interface SelectFieldProps {
	label: string;
	placeholder: string;
	options: { value: string; label: string }[];
	value: string;
	onValueChange: (v: string) => void;
	disabled?: boolean;
	loading?: boolean;
}

function SelectField({
	label,
	placeholder,
	options,
	value,
	onValueChange,
	disabled,
	loading,
}: SelectFieldProps) {
	return (
		<div className="space-y-1.5">
			<Label className="text-sm font-medium flex items-center gap-2">
				{label}
				{loading && (
					<Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
				)}
			</Label>
			<Select
				value={value}
				onValueChange={onValueChange}
				disabled={disabled || loading}
			>
				<SelectTrigger className="h-11 w-full overflow-hidden">
					<span className="truncate block text-left text-sm">
						{value
							? options.find((o) => o.value === value)?.label
							: placeholder}
					</span>
				</SelectTrigger>
				<SelectContent className="max-w-(--radix-select-trigger-width)">
					{options
						.filter((o) => o.value !== "")
						.map((o) => (
							<SelectItem
								key={o.value}
								value={o.value}
								className="whitespace-normal word-break-words"
							>
								{o.label}
							</SelectItem>
						))}
				</SelectContent>
			</Select>
		</div>
	);
}

// ─── ExamineeInfoCard ─────────────────────────────────────────────────────────
function ExamineeInfoCard({
	info,
	loading,
}: {
	info: ExamineeInfo | null;
	loading: boolean;
}) {
	if (loading) {
		return (
			<div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
				<Loader2 className="w-3.5 h-3.5 animate-spin" />
				Шалгуулагчийн дэлгэрэнгүй мэдээлэл татаж байна...
			</div>
		);
	}
	if (!info) return null;

	return (
		<div className="mt-1 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/10 p-3 space-y-2">
			<div className="flex items-center gap-2">
				<CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
				<span className="text-xs font-bold text-blue-700 dark:text-blue-300">
					Шалгуулагч №{info.examinee_number}
				</span>
			</div>

			{info.profile && (
				<div className="flex justify-center">
					<img
						src={info.profile}
						alt="profile"
						className="w-14 h-14 rounded-full object-cover border-2 border-blue-300"
					/>
				</div>
			)}

			<div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
				<InfoRow label="Овог" value={info.last_name} />
				<InfoRow label="Нэр" value={info.first_name} />
				<InfoRow label="Регистр" value={info.register_number} mono />
				<InfoRow
					label="Хүйс"
					value={
						info.gender === "M" || info.gender === "1" ? "Эрэгтэй" : "Эмэгтэй"
					}
				/>
				{info.age != null && <InfoRow label="Нас" value={String(info.age)} />}
				{info.schoolname && (
					<div className="col-span-2">
						<InfoRow label="Сургууль" value={info.schoolname} />
					</div>
				)}
				{info.studentgroupname && (
					<InfoRow label="Анги/Бүлэг" value={info.studentgroupname} />
				)}
				{info.aimag_name && (
					<InfoRow
						label="Хаяг"
						value={`${info.aimag_name}${info.sym_name ? `, ${info.sym_name}` : ""}`}
					/>
				)}
			</div>

			{info.exam_name && (
				<div className="border-t border-blue-200 dark:border-blue-700 pt-2 space-y-0.5 text-xs">
					<p className="font-semibold text-blue-800 dark:text-blue-200">
						{info.exam_name}
					</p>
					{info.start_date && (
						<InfoRow
							label="Огноо"
							value={`${new Date(info.start_date).toLocaleString("mn-MN", {
								year: "numeric",
								month: "2-digit",
								day: "2-digit",
								hour: "2-digit",
								minute: "2-digit",
							})}${info.duration ? ` (${info.duration} мин)` : ""}`}
						/>
					)}
					{info.room_number && (
						<InfoRow
							label="Өрөө"
							value={`${info.room_number}${info.roomname ? ` — ${info.roomname}` : ""}`}
						/>
					)}
					{info.seatnumber != null && (
						<InfoRow label="Суудал" value={String(info.seatnumber)} />
					)}
					{info.status_text && (
						<p className="text-amber-600 dark:text-amber-400">
							<span className="font-medium">Төлөв: </span>
							{info.status_text}
						</p>
					)}
				</div>
			)}
		</div>
	);
}

function InfoRow({
	label,
	value,
	mono = false,
}: {
	label: string;
	value: string | null | undefined;
	mono?: boolean;
}) {
	if (!value) return null;
	return (
		<div className="flex gap-1 min-w-0">
			<span className="text-blue-500 dark:text-blue-400 shrink-0">
				{label}:
			</span>
			<span
				className={`font-medium text-blue-900 dark:text-blue-100 break-all ${mono ? "font-mono" : ""}`}
			>
				{value}
			</span>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function UserCheckForm({ onClose }: { onClose?: () => void } = {}) {
	const router = useRouter();

	const [aimagList, setAimagList] = useState<AimagItem[]>([]);
	const [districtList, setDistrictList] = useState<DistrictItem[]>([]);
	const [schoolList, setSchoolList] = useState<SchoolItem[]>([]);

	const [aimag, setAimag] = useState("");
	const [district, setDistrict] = useState("");
	const [school, setSchool] = useState("");

	const [aimagLoading, setAimagLoading] = useState(true);
	const [districtLoading, setDistrictLoading] = useState(false);
	const [schoolLoading, setSchoolLoading] = useState(false);

	const [reg, setReg] = useState("");
	const [checkState, setCheckState] = useState<CheckState>("idle");
	const [studentExam, setStudentExam] = useState<StudentExamData | null>(null);
	const [isSkuulFound, setIsSkuulFound] = useState(false);
	const [skuulExamineeNumber, setSkuulExamineeNumber] = useState<string | null>(
		null,
	);
	const [checkError, setCheckError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");

	const [examineeInfo, setExamineeInfo] = useState<ExamineeInfo | null>(null);
	const [examineeInfoLoading, setExamineeInfoLoading] = useState(false);

	const schoolData = schoolList.find((s) => s.sName === school);

	useEffect(() => {
		apiAimag()
			.then((d) => setAimagList(d.RetData ?? []))
			.catch(() => setAimagList([]))
			.finally(() => setAimagLoading(false));
	}, []);

	const clearReg = useCallback(() => {
		setReg("");
		setCheckState("idle");
		setStudentExam(null);
		setIsSkuulFound(false);
		setSkuulExamineeNumber(null);
		setCheckError("");
		setSubmitError("");
		setExamineeInfo(null);
		setExamineeInfoLoading(false);
	}, []);

	const onAimag = useCallback(
		async (val: string) => {
			setAimag(val);
			setDistrict("");
			setSchool("");
			setDistrictList([]);
			setSchoolList([]);
			clearReg();
			if (!val) return;
			const a = aimagList.find((x) => x.mAcode === val);
			if (!a) return;
			setDistrictLoading(true);
			try {
				const d = await apiDistrict(a.mID);
				setDistrictList(d.RetData ?? []);
			} catch {
				setDistrictList([]);
			} finally {
				setDistrictLoading(false);
			}
		},
		[aimagList, clearReg],
	);

	const onDistrict = useCallback(
		async (val: string) => {
			setDistrict(val);
			setSchool("");
			setSchoolList([]);
			clearReg();
			if (!val) return;
			const currentAimag = aimagList.find((x) => x.mAcode === aimag);
			if (!currentAimag) return;
			setSchoolLoading(true);
			try {
				const d = await apiSchool(currentAimag.mID, Number(val));
				setSchoolList(d.RetData ?? []);
			} catch {
				setSchoolList([]);
			} finally {
				setSchoolLoading(false);
			}
		},
		[aimag, aimagList, clearReg],
	);

	const onSchool = useCallback(
		(val: string) => {
			setSchool(val);
			clearReg();
		},
		[clearReg],
	);

	const onRegInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const v = e.target.value
				.replace(REG_ALLOWED, "")
				.toUpperCase()
				.slice(0, 25);
			setReg(v);
			if (checkState !== "idle") clearReg();
		},
		[checkState, clearReg],
	);

	// ─── checkUser: шинэ EEC → Skuul → examinees/info → examinee_list → Exam API ─
	const checkUser = useCallback(async () => {
		if (reg.length < 8 || !schoolData) return;
		setCheckState("loading");
		setCheckError("");
		setIsSkuulFound(false);
		setSkuulExamineeNumber(null);
		setExamineeInfo(null);
		setExamineeInfoLoading(false);

		try {
			// ── 1️⃣ EEC API ───────────────────────────────────────────────────────
			console.log("[EEC] шалгаж байна...");
			const eecRes = await fetch(`${SKUUL_API_BASE}/api/mhb2025/${reg}`, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});

			if (eecRes.ok) {
				const eecData = await eecRes.json();
				console.log("[EEC] response:", JSON.stringify(eecData));

				const eecOk =
					eecData?.RetResponse?.ResponseType === true ||
					eecData?.RetResponse?.StatusCode === 200 ||
					eecData?.RetResponse?.StatusCode === "200";

				if (eecOk) {
					const item = normalizeRetData(eecData?.RetData);

					if (item?.register_number) {
						const mhb2025: string = item.mhb2025 ?? "";
						console.log("[EEC] mhb2025:", mhb2025);

						const student: StudentExamData = {
							login_name: item.register_number,
							firstname: item.first_name ?? item.firstname ?? "",
							lastname: item.last_name ?? item.lastname ?? "",
							reg_number: item.register_number,
							gender: item.gender === "M" || item.gender === 1 ? 1 : 0,
							gender_code: item.gender === "M" || item.gender === 1 ? "M" : "F",
							phone: item.phone ?? null,
							email: item.mail ?? item.email ?? "",
							aimag_id: item.aimag_id ?? "",
							sym_id: item.sym_id ?? "",
							class_id: Number(item.academic_level ?? 0),
							group_id: Number(item.student_group_id ?? 0),
							img_url: item.profile ?? item.img_url ?? null,
							descr: "",
							regdate: "",
							dateofbirth: item.dateofbirth ?? "",
							personId:
								item.personid ?? item.personId ?? item.examinee_number ?? "",
							schooldb: item.schooldb ?? "",
							schoolname: item.schoolname ?? "",
							studentgroupid: item.student_group_id ?? "",
							studentgroupname: item.studentgroupname ?? "",
							aimag_name: item.aimag_name ?? "",
							sym_name: item.sym_name ?? "",
							institutionid: item.school_esis_id ?? item.institutionid ?? "",
							academic_level: Number(item.academic_level ?? 0),
							nationality: item.nationality ?? "",
							exam_number: item.exam_number,
							exam_name: item.exam_name,
							start_date: item.start_date,
							end_date: item.end_date,
							duration: item.duration,
							room_number: item.room_number,
							roomname: item.roomname,
							seatnumber: item.seatnumber ?? null,
							seatposition: item.seatposition ?? null,
							status_code: item.status_code,
							status_text: item.status_text,
							age: item.age,
							_source: "eec",
						};

						// passed → шууд БҮТ рүү redirect
						if (mhb2025 === "passed") {
							console.log("✅ [EEC] passed → redirect to БҮТ");
							sessionStorage.setItem(
								"studentExam",
								JSON.stringify({ ...student, _isPaid: true }),
							);
							onClose?.();
							router.push("/mnUserCreate?status=qpay");
							return;
						}

						// not_passed болон бусад → дараагийн API руу үргэлжилнэ
						console.log(`⚠️ [EEC] mhb2025="${mhb2025}" → Skuul шалгаж байна...`);
					}
				}
			}

			console.log("⚠️ EEC олдсонгүй → Skuul шалгаж байна...");

			// ── 2️⃣ Skuul GET: /api/examinee?register_number=:reg ────────────────
			const skuulRes = await fetch(
				`${SKUUL_API_BASE}/api/examinee?register_number=${reg}`,
				{ method: "GET", headers: { "Content-Type": "application/json" } },
			);

			if (skuulRes.ok) {
				const skuulData = await skuulRes.json();
				console.log("[Skuul GET] response:", JSON.stringify(skuulData));

				const skuulOk =
					skuulData?.RetResponse?.ResponseType === true ||
					skuulData?.RetResponse?.StatusCode === 200 ||
					skuulData?.RetResponse?.StatusCode === "200";

				if (skuulOk) {
					const skuulItem = normalizeRetData(skuulData?.RetData);
					const examineeNumber: string = skuulItem?.examinee_number ?? "";

					// examinee_number байвал → info API → examinee_list fallback
					if (examineeNumber) {
						console.log("✅ [Skuul GET] examinee_number:", examineeNumber);
						setSkuulExamineeNumber(examineeNumber);
						setIsSkuulFound(true);

						// ── 3️⃣ GET /api/examinees/info/:examinee_number ──────────────
						console.log("[examinees/info] шалгаж байна...");
						const infoRes = await fetch(
							`${SKUUL_API_BASE}/api/examinees/info/${examineeNumber}`,
							{
								method: "GET",
								headers: { "Content-Type": "application/json" },
							},
						);

						if (infoRes.ok) {
							const infoData = await infoRes.json();
							console.log(
								"[examinees/info] response:",
								JSON.stringify(infoData),
							);

							const infoItem = normalizeRetData(infoData?.RetData) ?? infoData;

							if (infoItem?.register_number || infoItem?.examinee_number) {
								console.log("✅ [examinees/info] олдлоо");

								const student: StudentExamData = {
									login_name: infoItem.register_number ?? "",
									firstname: infoItem.first_name ?? "",
									lastname: infoItem.last_name ?? "",
									reg_number: infoItem.register_number ?? "",
									gender:
										infoItem.gender === "M" || infoItem.gender === "1" ? 1 : 0,
									gender_code:
										infoItem.gender === "M" || infoItem.gender === "1"
											? "M"
											: "F",
									phone: null,
									email: infoItem.mail ?? "",
									aimag_id: "",
									sym_id: "",
									class_id: 0,
									group_id: 0,
									img_url: infoItem.profile ?? null,
									descr: "",
									regdate: "",
									dateofbirth: "",
									personId: infoItem.examinee_number ?? "",
									schooldb: "",
									schoolname: infoItem.schoolname ?? "",
									studentgroupid: "",
									studentgroupname: infoItem.studentgroupname ?? "",
									aimag_name: infoItem.aimag_name ?? "",
									sym_name: infoItem.sym_name ?? "",
									institutionid: "",
									academic_level: 0,
									nationality: "",
									exam_name: infoItem.exam_name ?? undefined,
									start_date: infoItem.start_date ?? undefined,
									end_date: infoItem.end_date ?? undefined,
									duration: infoItem.duration ?? undefined,
									room_number: infoItem.room_number ?? undefined,
									roomname: infoItem.roomname ?? undefined,
									seatnumber: infoItem.seatnumber ?? null,
									seatposition: infoItem.seatposition ?? null,
									status_code: infoItem.status_code ?? undefined,
									status_text: infoItem.status_text ?? undefined,
									age: infoItem.age ?? undefined,
									_source: "skuul",
								};

								setStudentExam({ ...student, _isPaid: false });
								setExamineeInfo(infoItem as ExamineeInfo);
								setCheckState("found");
								return;
							}
						}

						// examinees/info хоосон → examinee_list дуудна
						console.log(
							"⚠️ examinees/info хоосон → examinee_list шалгаж байна...",
						);
						const personId = skuulItem?.personid ?? skuulItem?.personId ?? "";
						const listStudent = await apiGetExamineeList(personId);

						if (listStudent) {
							console.log("✅ [examinee_list] олдлоо");
							setStudentExam({ ...listStudent, _isPaid: false });
							setCheckState("found");
							return;
						}

						// ── examinee_number байгаа ч studentExam олдсонгүй ──────────
						// Хуучин logic: "Бүртгэл үүслээ" мессеж харуулна (studentExam=null)
						console.log(
							"⚠️ examinee_list ч олдсонгүй → бүртгэл үүссэн мессеж харуулна",
						);
						setCheckState("found");
						return;
					}
				}
			}

			console.log("⚠️ Skuul олдсонгүй → Exam API шалгаж байна...");

			// ── 4️⃣ Exam API fallback ─────────────────────────────────────────────
			const examStudent = await apiGetStudentExam(schoolData.dbname, reg);
			if (examStudent) {
				console.log("✅ [Exam API] олдлоо");
				setStudentExam({ ...examStudent, _isPaid: false });
				setCheckState("found");
				return;
			}

			setCheckState("not_found");
		} catch (err) {
			setCheckState("error");
			setCheckError(err instanceof Error ? err.message : "Алдаа гарлаа");
		}
	}, [reg, schoolData, onClose, router]);

	const handleEdit = useCallback(() => {
		if (!studentExam) return;
		sessionStorage.setItem("studentExam", JSON.stringify(studentExam));
		if (skuulExamineeNumber) {
			sessionStorage.setItem("examineeNumber", skuulExamineeNumber);
		}
		onClose?.();
		router.push("/mnUserCreate/editFormMN");
	}, [studentExam, skuulExamineeNumber, onClose, router]);

	const handleSubmit = useCallback(async () => {
		if (!studentExam) return;
		setSubmitting(true);
		setSubmitError("");
		try {
			sessionStorage.setItem("studentExam", JSON.stringify(studentExam));
			onClose?.();
			router.push("/mnUserCreate?status=qpay");
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : "Алдаа гарлаа.");
			setSubmitting(false);
		}
	}, [studentExam, onClose, router]);

	return (
		<div className="space-y-5">
			<SelectField
				label="Аймаг / Нийслэл"
				placeholder={aimagLoading ? "Уншиж байна..." : "— Аймаг сонгох —"}
				options={aimagList
					.filter((a) => a.mAcode)
					.map((a) => ({ value: a.mAcode, label: a.mName }))}
				value={aimag}
				onValueChange={onAimag}
				loading={aimagLoading}
			/>

			<SelectField
				label="Сум / Дүүрэг"
				placeholder={
					districtLoading
						? "Уншиж байна..."
						: !aimag
							? "Эхлээд аймаг сонгоно уу"
							: "— Дүүрэг сонгох —"
				}
				options={districtList
					.filter((d) => d.id)
					.map((d) => ({ value: d.id.toString(), label: d.name }))}
				value={district}
				onValueChange={onDistrict}
				disabled={!aimag}
				loading={districtLoading}
			/>

			<SelectField
				label="Сургууль"
				placeholder={
					schoolLoading
						? "Уншиж байна..."
						: !district
							? "Эхлээд дүүрэг сонгоно уу"
							: "— Сургууль сонгох —"
				}
				options={schoolList
					.filter((s) => s.sName)
					.map((s) => ({ value: s.sName, label: s.sName }))}
				value={school}
				onValueChange={onSchool}
				disabled={!district}
				loading={schoolLoading}
			/>

			{school !== "" && (
				<div className="space-y-3 border-t pt-5">
					<Label className="text-sm font-medium">Регистрийн дугаар</Label>
					<div className="flex gap-2">
						<Input
							value={reg}
							onChange={onRegInput}
							onKeyDown={(e) => e.key === "Enter" && checkUser()}
							placeholder="УБ12345678"
							maxLength={100}
							disabled={checkState === "found"}
							className={`flex-1 font-mono text-base tracking-widest text-center h-11
								${checkState === "not_found" || checkState === "error" ? "border-destructive focus-visible:ring-destructive" : ""}
								${checkState === "found" ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10" : ""}
							`}
						/>
						<Button
							type="button"
							variant={checkState === "found" ? "outline" : "default"}
							onClick={checkState === "found" ? clearReg : checkUser}
							disabled={
								checkState === "loading" ||
								(checkState !== "found" && reg.length < 8)
							}
							className={`shrink-0 min-w-90px h-11 ${checkState !== "found" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
						>
							{checkState === "loading" ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : checkState === "found" ? (
								<>
									<RotateCcw className="w-4 h-4 mr-1.5" />
									Өөрчлөх
								</>
							) : (
								"Шалгах"
							)}
						</Button>
					</div>

					{checkState === "not_found" && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								<span className="font-mono font-bold">{reg}</span> регистртэй
								хэрэглэгч олдсонгүй.
							</AlertDescription>
						</Alert>
					)}

					{checkState === "error" && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>
								{checkError || "Сервертэй холбогдоход алдаа гарлаа."}
							</AlertDescription>
						</Alert>
					)}

					{/* ── Skuul-д examinee_number байгаа ч studentExam олдсонгүй (хуучин logic) ── */}
					{checkState === "found" && isSkuulFound && !studentExam && (
						<Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800">
							<CheckCircle2 className="h-4 w-4 text-blue-500" />
							<AlertDescription className="text-blue-700 dark:text-blue-400">
								<div className="flex flex-col gap-1.5">
									<p className="font-semibold text-base">
										Таны бүртгэл амжилттай үүслээ. Та 3 сарын 9-өөс хойш дахин
										хандан БҮРТГЭЛИЙН ХУУДАС болон шалгалтын хуваариа
										оруулаарай.
									</p>
									<p className="text-sm">
										Таны бүртгэлийн дугаар:{" "}
										<span className="font-mono font-bold text-blue-800 dark:text-blue-300 text-base">
											{skuulExamineeNumber}
										</span>
									</p>
								</div>
							</AlertDescription>
						</Alert>
					)}

					{/* ── studentExam олдсон ── */}
					{checkState === "found" && studentExam && (
						<Alert className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800">
							<CheckCircle2 className="h-4 w-4 text-emerald-500" />
							<AlertDescription className="text-emerald-700 dark:text-emerald-400">
								<div className="flex flex-col gap-3">
									<div className="flex items-center gap-3">
										{studentExam.img_url && (
											<img
												src={studentExam.img_url}
												alt="profile"
												className="w-12 h-12 rounded-full object-cover border-2 border-emerald-300"
											/>
										)}
										<div>
											<p className="font-semibold text-base">
												{studentExam.lastname} {studentExam.firstname}
											</p>
											<p className="text-xs text-emerald-600 dark:text-emerald-500">
												{studentExam.reg_number} ·{" "}
												{studentExam.gender_code === "M"
													? "Эрэгтэй"
													: "Эмэгтэй"}
												{studentExam.age ? ` · ${studentExam.age} нас` : ""}
											</p>
										</div>
									</div>

									<div className="text-xs space-y-0.5 border-t border-emerald-200 dark:border-emerald-800 pt-2">
										<p>{studentExam.schoolname}</p>
										{studentExam.studentgroupname && (
											<p>
												<span className="font-medium">Анги:</span>{" "}
												{studentExam.studentgroupname}
											</p>
										)}
										{studentExam.aimag_name && (
											<p>
												<span className="font-medium">Хаяг:</span>{" "}
												{studentExam.aimag_name}
												{studentExam.sym_name
													? `, ${studentExam.sym_name}`
													: ""}
											</p>
										)}
									</div>

									{studentExam.exam_name && (
										<div className="text-xs space-y-0.5 border-t border-emerald-200 dark:border-emerald-800 pt-2">
											<p className="font-medium text-emerald-800 dark:text-emerald-300">
												{studentExam.exam_name}
											</p>
											{studentExam.start_date && (
												<p>
													<span className="font-medium">Огноо:</span>{" "}
													{new Date(studentExam.start_date).toLocaleString(
														"mn-MN",
														{
															year: "numeric",
															month: "2-digit",
															day: "2-digit",
															hour: "2-digit",
															minute: "2-digit",
														},
													)}
													{studentExam.duration
														? ` (${studentExam.duration} мин)`
														: ""}
												</p>
											)}
											{studentExam.room_number && (
												<p>
													<span className="font-medium">Өрөө:</span>{" "}
													{studentExam.room_number}
													{studentExam.roomname
														? ` — ${studentExam.roomname}`
														: ""}
												</p>
											)}
											{studentExam.seatnumber != null && (
												<p>
													<span className="font-medium">Суудал:</span>{" "}
													{studentExam.seatnumber}
												</p>
											)}
											{studentExam.status_text && (
												<p className="text-amber-600 dark:text-amber-400">
													<span className="font-medium">Төлөв:</span>{" "}
													{studentExam.status_text}
												</p>
											)}
										</div>
									)}

									<ExamineeInfoCard
										info={examineeInfo}
										loading={examineeInfoLoading}
									/>
								</div>
							</AlertDescription>
						</Alert>
					)}
				</div>
			)}

			{checkState === "found" && school && studentExam && (
				<>
					{submitError && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{submitError}</AlertDescription>
						</Alert>
					)}
					<div className="flex flex-col gap-2">
						{isSkuulFound && (
							<Button
								type="button"
								variant="outline"
								onClick={handleEdit}
								className="w-full h-11 border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
							>
								<Pencil className="w-4 h-4 mr-2" />
								Мэдээлэл засварлах
							</Button>
						)}
						{!isSkuulFound && (
							<Button
								type="button"
								onClick={handleSubmit}
								disabled={submitting}
								className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
							>
								{submitting ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin mr-2" />
										Уншиж байна...
									</>
								) : (
									<>
										Үргэлжлүүлэх
										<ArrowRight className="w-4 h-4 ml-2" />
									</>
								)}
							</Button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
