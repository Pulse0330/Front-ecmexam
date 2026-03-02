"use client";

import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Loader2,
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
	process.env.NEXT_PUBLIC_EXAM_API_URL ?? "https://ottapp.ecm.mn";

// ─── Types ────────────────────────────────────────────────────────────────────
type CheckState = "idle" | "loading" | "found" | "not_found" | "error";

interface StudentData {
	register_number: string;
	last_name: string;
	first_name: string;
	gender: "M" | "F";
	age: number;
	address: string;
	mail: string;
	nationality: string;
	examinee_number: string;
	password: string;
	profile: string | null;
	school_esis_id: number;
	student_group_id: number;
	academic_level: number;
}

interface AimagItem {
	mAcode: string;
	mName: string;
	mid: number;
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

// ─── Mapper: StudentExamData → StudentData ────────────────────────────────────
function _mapToStudentData(s: StudentExamData): StudentData {
	const birthYear = new Date(s.dateofbirth).getFullYear();
	const age = new Date().getFullYear() - birthYear;
	return {
		register_number: s.reg_number,
		last_name: s.lastname,
		first_name: s.firstname,
		gender: s.gender_code ?? (s.gender === 0 ? "F" : "M"),
		age,
		address: [s.aimag_name, s.sym_name].filter(Boolean).join(", "),
		mail: s.email,
		nationality: s.nationality || "Mongolian",
		examinee_number: s.personId,
		password: "",
		profile: s.img_url,
		school_esis_id: Number(s.institutionid),
		student_group_id: Number(s.studentgroupid),
		academic_level: s.academic_level,
	};
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

// ─── API helpers ──────────────────────────────────────────────────────────────
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
		throw new Error("Энэ регистрийн дугаартай сурагч олдсонгүй");
	return d.RetData[0] ?? null;
}

// ─── Regex: зөвшөөрөгдөх тэмдэгтүүд ─────────────────────────────────────────
const REG_ALLOWED = /[^A-ZА-ЯӨҮa-zа-яөү0-9]/g;

// ─── SelectField component ────────────────────────────────────────────────────
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
					{options.map((o) => (
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

// ─── Main Component ───────────────────────────────────────────────────────────
export function UserCheckForm({ onClose }: { onClose?: () => void } = {}) {
	const _router = useRouter();

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
	const [checkError, setCheckError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");

	const aimagData = aimagList.find((a) => a.mAcode === aimag);
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
		setCheckError("");
		setSubmitError("");
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
				const d = await apiDistrict(a.mid);
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
			if (!val || !aimagData) return;
			setSchoolLoading(true);
			try {
				const d = await apiSchool(aimagData.mid, Number(val));
				setSchoolList(d.RetData ?? []);
			} catch {
				setSchoolList([]);
			} finally {
				setSchoolLoading(false);
			}
		},
		[aimagData, clearReg],
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
				.slice(0, 10);
			setReg(v);
			if (checkState !== "idle") clearReg();
		},
		[checkState, clearReg],
	);

	const checkUser = useCallback(async () => {
		if (reg.length < 8 || !schoolData) return;
		setCheckState("loading");
		setCheckError("");
		try {
			const student = await apiGetStudentExam(schoolData.dbname, reg);
			if (student) {
				setStudentExam(student);
				setCheckState("found");
			} else {
				setCheckState("not_found");
			}
		} catch (err) {
			setCheckState("error");
			setCheckError(err instanceof Error ? err.message : "Алдаа гарлаа");
		}
	}, [reg, schoolData]);

	const handleSubmit = useCallback(async () => {
		if (!studentExam) return;
		setSubmitting(true);
		setSubmitError("");
		try {
			sessionStorage.setItem("studentExam", JSON.stringify(studentExam));
			onClose?.();
			window.location.href = "/mnUserCreate"; // ← router.push-г солисон
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : "Алдаа гарлаа.");
			setSubmitting(false);
		}
	}, [studentExam, onClose]);

	return (
		<div className="space-y-5">
			<SelectField
				label="Аймаг / Нийслэл"
				placeholder={aimagLoading ? "Уншиж байна..." : "— Аймаг сонгох —"}
				options={aimagList.map((a) => ({ value: a.mAcode, label: a.mName }))}
				value={aimag}
				onValueChange={onAimag}
				loading={aimagLoading}
			/>

			<SelectField
				label="Дүүрэг / Сум"
				placeholder={
					districtLoading
						? "Уншиж байна..."
						: !aimag
							? "Эхлээд аймаг сонгоно уу"
							: "— Дүүрэг сонгох —"
				}
				options={districtList.map((d) => ({
					value: d.id.toString(),
					label: d.name,
				}))}
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
				options={schoolList.map((s) => ({ value: s.sName, label: s.sName }))}
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
							maxLength={10}
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
							className={`shrink-0 min-w-[90px] h-11 ${checkState !== "found" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
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

					{checkState === "found" && studentExam && (
						<Alert className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800">
							<CheckCircle2 className="h-4 w-4 text-emerald-500" />
							<AlertDescription className="text-emerald-700 dark:text-emerald-400">
								<div className="flex flex-col gap-2">
									<span>
										Сайн байна уу,{" "}
										<span className="font-semibold">
											{studentExam.lastname} {studentExam.firstname}
										</span>
									</span>

									<p className="text-xs text-emerald-600 dark:text-emerald-500 wrap-break-words">
										{studentExam.schoolname}
									</p>
								</div>
							</AlertDescription>
						</Alert>
					)}
				</div>
			)}

			{checkState === "found" && school && (
				<>
					{submitError && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{submitError}</AlertDescription>
						</Alert>
					)}
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
				</>
			)}
		</div>
	);
}
