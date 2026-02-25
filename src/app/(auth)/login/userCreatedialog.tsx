"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

// ─── Env variable — hardcoded URL-г тусгаарлав ───────────────────────────────
const EXAM_API_BASE =
	process.env.NEXT_PUBLIC_EXAM_API_URL ?? "https://ottapp.ecm.mn";

// ─── Types ────────────────────────────────────────────────────────────────────
type CheckState = "idle" | "loading" | "found" | "not_found" | "error";

interface UserInfo {
	firstname: string;
	lastname: string;
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
	const d = await r.json();
	return (d?.RetData?.[0] as StudentExamData) ?? null;
}

// ─── Spinner SVG — тусдаа component болгон, давтагдахаас сэргийлнэ ──────────
function Spinner({ className = "w-5 h-5" }: { className?: string }) {
	return (
		<svg
			className={`animate-spin ${className}`}
			fill="none"
			viewBox="0 0 24 24"
		>
			<title>Уншиж байна</title>
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
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
			/>
		</svg>
	);
}

// ─── Select component ─────────────────────────────────────────────────────────
interface SelProps {
	label: string;
	placeholder: string;
	options: { value: string; label: string }[];
	value: string;
	onChange: (v: string) => void;
	disabled?: boolean;
	loading?: boolean;
}

function Sel({
	label,
	placeholder,
	options,
	value,
	onChange,
	disabled,
	loading,
}: SelProps) {
	return (
		<div className="space-y-1.5">
			<Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
				{label}
				{loading && <Spinner className="w-3.5 h-3.5 text-emerald-500" />}
			</Label>
			<div className="relative">
				<select
					value={value}
					onChange={(e) => onChange(e.target.value)}
					disabled={disabled || loading}
					className="w-full px-4 py-3 pr-10 rounded-xl border-2 appearance-none cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:border-emerald-400 dark:focus:border-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 outline-none"
				>
					<option value="">{placeholder}</option>
					{/* index key хэрэглэхгүй — value нь unique байна */}
					{options.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
				<div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<title>Dropdown</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</div>
			</div>
		</div>
	);
}

// ─── Alert component — давтагдах alert JSX-г нэгтгэв ─────────────────────────
type AlertVariant = "error" | "success";

function Alert({
	variant,
	children,
}: {
	variant: AlertVariant;
	children: React.ReactNode;
}) {
	const isError = variant === "error";
	const base =
		"flex items-center gap-2.5 text-sm rounded-xl px-3.5 py-2.5 border";
	const styles = isError
		? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
		: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";

	return (
		<div className={`${base} ${styles}`}>
			{isError ? (
				<svg
					className="w-4 h-4 shrink-0"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<title>Алдаа</title>
					<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clipRule="evenodd"
					/>
				</svg>
			) : (
				<svg
					className="w-4 h-4 shrink-0 text-emerald-500"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<title>Амжилттай</title>
					<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clipRule="evenodd"
					/>
				</svg>
			)}
			<span>{children}</span>
		</div>
	);
}

// ─── Монгол регистрийн дугаарын regex ─────────────────────────────────────────
// Монгол кирилл: А-Я + Өөрийн үсгүүд (Ө, Ү) + Latin A-Z
const REG_ALLOWED = /[^A-ZА-ЯӨҮa-zа-яөү0-9]/g;

// ─── Main component ───────────────────────────────────────────────────────────
export function UserCheckForm() {
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
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	const [checkError, setCheckError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [studentData, setStudentData] = useState<StudentExamData | null>(null);

	const aimagData = aimagList.find((a) => a.mAcode === aimag);
	const schoolData = schoolList.find((s) => s.sName === school);

	useEffect(() => {
		apiAimag()
			.then((d) => setAimagList(d.RetData ?? []))
			.catch(() => setAimagList([]))
			.finally(() => setAimagLoading(false));
	}, []);

	// useCallback — функцуудыг memoize хийж, шаардлагагүй re-render багасгана
	const clearReg = useCallback(() => {
		setReg("");
		setCheckState("idle");
		setUserInfo(null);
		setStudentData(null);
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
				setStudentData(student);
				setUserInfo({
					firstname: student.firstname,
					lastname: student.lastname,
				});
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
		if (!studentData) return;
		setSubmitting(true);
		setSubmitError("");
		try {
			sessionStorage.setItem("studentExam", JSON.stringify(studentData));
			router.push("/mnUserCreate");
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : "Алдаа гарлаа.");
			setSubmitting(false);
		}
	}, [studentData, router]);

	return (
		<div className="space-y-5">
			<Sel
				label="Аймаг / Нийслэл"
				placeholder={aimagLoading ? "Уншиж байна..." : "— Аймаг сонгох —"}
				options={aimagList.map((a) => ({ value: a.mAcode, label: a.mName }))}
				value={aimag}
				onChange={onAimag}
				loading={aimagLoading}
			/>

			<Sel
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
				onChange={onDistrict}
				disabled={!aimag}
				loading={districtLoading}
			/>

			<Sel
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
				onChange={onSchool}
				disabled={!district}
				loading={schoolLoading}
			/>

			{school !== "" && (
				<div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-5">
					<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
						Регистрийн дугаар
					</Label>
					<div className="flex gap-2">
						<input
							type="text"
							value={reg}
							onChange={onRegInput}
							onKeyDown={(e) => e.key === "Enter" && checkUser()}
							placeholder="УБ12345678"
							maxLength={10}
							disabled={checkState === "found"}
							className={`flex-1 px-4 py-3 rounded-xl border-2 font-mono text-base tracking-widest text-center
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:tracking-normal
                transition-all duration-200 outline-none disabled:opacity-60 disabled:cursor-not-allowed
                ${
									checkState === "not_found" || checkState === "error"
										? "border-red-400 dark:border-red-500"
										: checkState === "found"
											? "border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
											: "border-gray-200 dark:border-gray-700 focus:border-emerald-400 dark:focus:border-emerald-500"
								}`}
						/>
						<button
							type="button"
							onClick={checkState === "found" ? clearReg : checkUser}
							disabled={
								checkState === "loading" ||
								(checkState !== "found" && reg.length < 8)
							}
							className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shrink-0 min-w-[84px] flex items-center justify-center
                ${
									checkState === "found"
										? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700"
										: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed"
								}`}
						>
							{checkState === "loading" ? (
								<Spinner />
							) : checkState === "found" ? (
								"Өөрчлөх"
							) : (
								"Шалгах"
							)}
						</button>
					</div>

					{checkState === "not_found" && (
						<Alert variant="error">
							<span className="font-mono font-bold">{reg}</span> регистртэй
							хэрэглэгч олдсонгүй.
						</Alert>
					)}

					{checkState === "error" && (
						<Alert variant="error">
							{checkError || "Сервертэй холбогдоход алдаа гарлаа."}
						</Alert>
					)}

					{checkState === "found" && userInfo && (
						<Alert variant="success">
							Сайн байна уу,{" "}
							<span className="font-semibold">
								{userInfo.lastname} {userInfo.firstname}
							</span>
						</Alert>
					)}
				</div>
			)}

			{checkState === "found" && school && (
				<>
					{submitError && <Alert variant="error">{submitError}</Alert>}

					<button
						type="button"
						onClick={handleSubmit}
						disabled={submitting}
						className="w-full py-3.5 px-6 rounded-xl font-semibold text-white
              bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30
              hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300
              flex items-center justify-center gap-2"
					>
						{submitting ? (
							<>
								<Spinner />
								Уншиж байна...
							</>
						) : (
							<>
								Үргэлжлүүлэх
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Дараах</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 7l-5 5m0 0l5 5m-5-5H6"
									/>
								</svg>
							</>
						)}
					</button>
				</>
			)}
		</div>
	);
}
