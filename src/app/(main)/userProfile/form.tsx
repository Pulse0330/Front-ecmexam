"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	Camera,
	Check,
	CheckCircle2,
	Edit2,
	Loader2,
	Lock,
	Mail,
	MapPin,
	Phone,
	School,
	User2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { getUserUpdateProfile } from "@/lib/api";
import { uploadImage } from "@/utils/upload";

// ─── Types ────────────────────────────────────────────────────────────────────
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
interface ClassItem {
	id: number;
	class_name: string;
	studentgroupid: string;
	sort: number;
}

interface UserData {
	lastname: string;
	firstname: string;
	email: string;
	Phone: string | null;
	img_url: string | null;
	username: string;
	password: string | null;
	aimag_name?: string | null;
	aimag_id?: string | number | null;
	sym_name?: string | null;
	sym_id?: string | number | null;
	sch_name?: string | null;
	schooldb?: string | null;
	studentgroupname?: string | null;
	studentgroupid?: string | null;
}

interface ProfileContentProps {
	user: UserData;
	userId: number;
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
async function apiClass(database: string, serverip: string) {
	const r = await fetch("/api/sign/angi", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ database, serverip }),
	});
	if (!r.ok) throw new Error("Ангийн мэдээлэл авахад алдаа гарлаа");
	return r.json();
}

// ─── SelectField ──────────────────────────────────────────────────────────────
interface SelectFieldProps {
	label: string;
	placeholder: string;
	options: { value: string; label: string }[];
	value: string;
	onValueChange: (v: string) => void;
	disabled?: boolean;
	loading?: boolean;
	icon: React.ReactNode;
}
function SelectField({
	label,
	placeholder,
	options,
	value,
	onValueChange,
	disabled,
	loading,
	icon,
}: SelectFieldProps) {
	return (
		<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
			<div className="flex items-start gap-3 flex-1">
				<div className="w-5 h-5 mt-0.5 shrink-0">{icon}</div>
				<div className="flex-1">
					<p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
						{label}
						{loading && (
							<Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
						)}
					</p>
					{/* disabled=true БА утга хоосон үед л text харуулна */}
					{disabled && !value ? (
						<p className="text-sm font-semibold text-slate-900 dark:text-white">
							<span className="text-slate-400 font-normal">—</span>
						</p>
					) : (
						<Select
							value={value}
							onValueChange={onValueChange}
							disabled={disabled || loading}
						>
							<SelectTrigger className="h-8 w-full bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white shadow-none focus:ring-0">
								<span className="truncate block text-left text-sm">
									{value && options.length === 0 ? (
										<Loader2 className="w-3 h-3 animate-spin text-emerald-500 inline" />
									) : value ? (
										(options.find((o) => o.value === value)?.label ?? value)
									) : (
										placeholder
									)}
								</span>
							</SelectTrigger>
							<SelectContent className="max-w-(--radix-select-trigger-width)">
								{options
									.filter((o) => o.value !== "")
									.map((o) => (
										<SelectItem
											key={o.value}
											value={o.value}
											className="whitespace-normal"
										>
											{o.label}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					)}
				</div>
			</div>
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProfileContent({ user, userId }: ProfileContentProps) {
	const queryClient = useQueryClient();

	const [showToast, setShowToast] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [passwordError, setPasswordError] = useState("");
	const [phoneError, setPhoneError] = useState("");
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
	const [_locationErrorrrrrrrr, setLocationError] = useState("");
	// ─── Dropdown lists ───────────────────────────────────────────────────────
	const [aimagList, setAimagList] = useState<AimagItem[]>([]);
	const aimagListRef = useRef<AimagItem[]>([]);
	const pendingAimagIdRef = useRef<string>("");
	const [districtList, setDistrictList] = useState<DistrictItem[]>([]);
	const [schoolList, setSchoolList] = useState<SchoolItem[]>([]);
	const [classList, setClassList] = useState<ClassItem[]>([]);

	const [aimagLoading, setAimagLoading] = useState(false);
	const [districtLoading, setDistrictLoading] = useState(false);
	const [schoolLoading, setSchoolLoading] = useState(false);
	const [classLoading, setClassLoading] = useState(false);

	// ─── Хэрэглэгчийн сонголт ────────────────────────────────────────────────
	const [selectedAimag, setSelectedAimag] = useState("");
	const [selectedDistrict, setSelectedDistrict] = useState("");
	const [selectedSchool, setSelectedSchool] = useState("");
	const selectedSchoolDbRef = useRef("");
	const selectedSchoolServerIpRef = useRef("");
	const [selectedClass, setSelectedClass] = useState("");

	// ─── Pre-fill pending refs ────────────────────────────────────────────────
	// setDistrictList → useEffect(districtList) → setSelectedDistrict
	// setSchoolList   → useEffect(schoolList)   → setSelectedSchool
	// setClassList    → useEffect(classList)    → setSelectedClass
	const pendingDistrictIdRef = useRef<string>("");
	const pendingSchoolNameRef = useRef<string>("");
	const pendingSchoolDbRef = useRef<string>("");
	const pendingSchoolServerIpRef = useRef<string>("");
	const pendingClassIdRef = useRef<string>("");

	const [editForm, setEditForm] = useState({
		lastname: user.lastname || "",
		firstname: user.firstname || "",
		email: user.email || "",
		Phone: user.Phone || "",
		password: "",
		confirmPassword: "",
	});

	const userRef = useRef(user);
	useEffect(() => {
		userRef.current = user;
	}, [user]);
	useEffect(() => {
		if (pendingAimagIdRef.current && aimagList.length > 0) {
			const id = pendingAimagIdRef.current;
			pendingAimagIdRef.current = "";
			if (aimagList.some((a) => a.mID.toString() === id)) {
				setSelectedAimag(id);
			}
		}
	}, [aimagList]);
	// ─── districtList set хийгдэхэд pending district сонгоно ────────────────
	useEffect(() => {
		if (pendingDistrictIdRef.current && districtList.length > 0) {
			const id = pendingDistrictIdRef.current;
			pendingDistrictIdRef.current = "";
			if (districtList.some((d) => d.id.toString() === id)) {
				setSelectedDistrict(id);
			}
		}
	}, [districtList]);
	const schoolListLengthRef = useRef(0);
	useEffect(() => {
		if (schoolList.length === schoolListLengthRef.current) return;
		schoolListLengthRef.current = schoolList.length;
		if (pendingSchoolNameRef.current) {
			const name = pendingSchoolNameRef.current;
			const db = pendingSchoolDbRef.current;
			const ip = pendingSchoolServerIpRef.current;
			pendingSchoolNameRef.current = "";
			pendingSchoolDbRef.current = "";
			pendingSchoolServerIpRef.current = "";
			setSelectedSchool(name);
			selectedSchoolDbRef.current = db;
			selectedSchoolServerIpRef.current = ip;
		}
	}, [schoolList]);

	// ─── classList set хийгдэхэд pending class сонгоно ──────────────────────
	useEffect(() => {
		if (pendingClassIdRef.current && classList.length > 0) {
			const id = pendingClassIdRef.current;
			pendingClassIdRef.current = "";
			if (classList.some((c) => c.studentgroupid === id)) {
				setSelectedClass(id);
			}
		}
	}, [classList]);

	// ─── Edit горим ──────────────────────────────────────────────────────────
	useEffect(() => {
		if (!isEditing) {
			setEditForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
			setSelectedAimag("");
			setSelectedDistrict("");
			setSelectedSchool("");
			setSelectedClass("");
			selectedSchoolDbRef.current = "";
			pendingAimagIdRef.current = "";
			selectedSchoolServerIpRef.current = "";
			pendingDistrictIdRef.current = "";
			pendingSchoolNameRef.current = "";
			pendingSchoolDbRef.current = "";
			pendingSchoolServerIpRef.current = "";
			pendingClassIdRef.current = "";
			setDistrictList([]);
			setSchoolList([]);
			setClassList([]);
			return;
		}

		const u = userRef.current;

		setEditForm({
			lastname: u.lastname || "",
			firstname: u.firstname || "",
			email: u.email || "",
			Phone: u.Phone || "",
			password: "",
			confirmPassword: "",
		});

		const cachedList = aimagListRef.current;
		if (cachedList.length > 0) {
			setAimagList(cachedList);
		}

		const aimagPromise =
			cachedList.length > 0
				? Promise.resolve(cachedList)
				: (setAimagLoading(true),
					apiAimag()
						.then((d) => {
							const list: AimagItem[] = d.RetData ?? [];
							setAimagList(list);
							aimagListRef.current = list;
							return list;
						})
						.catch(() => [] as AimagItem[])
						.finally(() => setAimagLoading(false)));

		aimagPromise.then((list) => {
			if (!u.aimag_name) return;

			const aimag =
				list.find((a) => a.mName === u.aimag_name) ??
				list.find(
					(a) =>
						a.mName.trim().toLowerCase() === u.aimag_name?.trim().toLowerCase(),
				);
			if (!aimag) return;
			setSelectedAimag(aimag.mID.toString());
			pendingAimagIdRef.current = aimag.mID.toString();

			setDistrictLoading(true);
			apiDistrict(aimag.mID)
				.then((dd) => {
					const dlist: DistrictItem[] = dd.RetData ?? [];

					const symIdStr = String(u.sym_id ?? "").trim();
					const district =
						(symIdStr
							? dlist.find((dv) => String(dv.id) === symIdStr)
							: undefined) ??
						dlist.find((dv) => dv.name === u.sym_name) ??
						dlist.find(
							(dv) =>
								dv.name.trim().toLowerCase() ===
								u.sym_name?.trim().toLowerCase(),
						);

					if (district) {
						// Pending-д хадгална → setDistrictList хийгдсэний дараа useEffect сонгоно
						pendingDistrictIdRef.current = district.id.toString();
					}

					setDistrictList(dlist); // ← useEffect(districtList) гал авна

					if (!district) return;

					setSchoolLoading(true);
					apiSchool(aimag.mID, district.id)
						.then((sd) => {
							const slist: SchoolItem[] = sd.RetData ?? [];

							const school =
								slist.find((s) => s.sName === u.sch_name) ??
								slist.find(
									(s) =>
										s.sName.trim().toLowerCase() ===
										u.sch_name?.trim().toLowerCase(),
								);

							if (school) {
								pendingSchoolNameRef.current = school.sName;
								pendingSchoolDbRef.current = school.dbname;
								pendingSchoolServerIpRef.current = school.serverip || "";
							} else if (u.sch_name) {
								// Жагсаалтад байхгүй ч хэрэглэгчийн утгаар set хийнэ
								pendingSchoolNameRef.current = u.sch_name;
								pendingSchoolDbRef.current = u.schooldb ?? "";
								pendingSchoolServerIpRef.current = "";
							}

							setSchoolList(slist); // ← useEffect(schoolList) гал авна

							const targetDb = school?.dbname ?? (u.schooldb || "");
							const targetIp = school?.serverip ?? "";
							if (!targetDb) return;

							setClassLoading(true);
							apiClass(targetDb, targetIp)
								.then((cd) => {
									const clist = (cd.RetData ?? []).filter(
										(c: ClassItem) =>
											c.studentgroupid && c.studentgroupid !== "0",
									);

									const userGroupId = String(u.studentgroupid ?? "").trim();
									const userGroupName = String(u.studentgroupname ?? "").trim();
									const matched =
										(userGroupId
											? clist.find(
													(c: ClassItem) =>
														String(c.studentgroupid).trim() === userGroupId,
												)
											: undefined) ??
										(userGroupName
											? clist.find(
													(c: ClassItem) =>
														c.class_name.trim().toLowerCase() ===
														userGroupName.toLowerCase(),
												)
											: undefined);

									if (matched) {
										pendingClassIdRef.current = matched.studentgroupid;
									}

									setClassList(clist); // ← useEffect(classList) гал авна
								})
								.catch(() => setClassList([]))
								.finally(() => setClassLoading(false));
						})
						.catch(() => setSchoolList([]))
						.finally(() => setSchoolLoading(false));
				})
				.catch(() => setDistrictList([]))
				.finally(() => setDistrictLoading(false));
		});
	}, [isEditing]);

	// ─── Хэрэглэгч өөрчлөхөд ─────────────────────────────────────────────────
	const onAimag = useCallback(
		async (val: string) => {
			setSelectedAimag(val);
			setSelectedDistrict("");
			setSelectedSchool("");
			setSelectedClass("");
			selectedSchoolDbRef.current = "";
			selectedSchoolServerIpRef.current = "";
			pendingDistrictIdRef.current = "";
			pendingSchoolNameRef.current = "";
			pendingClassIdRef.current = "";
			setDistrictList([]);
			setSchoolList([]);
			setClassList([]);
			if (!val) return;
			const a = aimagList.find((x) => x.mID.toString() === val);
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
		[aimagList],
	);

	const onDistrict = useCallback(
		async (val: string) => {
			setSelectedDistrict(val);
			setSelectedSchool("");
			setSelectedClass("");
			selectedSchoolDbRef.current = "";
			selectedSchoolServerIpRef.current = "";
			pendingSchoolNameRef.current = "";
			pendingClassIdRef.current = "";
			setSchoolList([]);
			setClassList([]);
			if (!val) return;
			const currentAimag = aimagList.find(
				(x) => x.mID.toString() === selectedAimag,
			);
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
		[selectedAimag, aimagList],
	);

	const onSchool = useCallback(
		async (val: string) => {
			setSelectedSchool(val);
			setSelectedClass("");
			setClassList([]);
			selectedSchoolDbRef.current = "";
			selectedSchoolServerIpRef.current = "";
			pendingClassIdRef.current = "";

			const schoolData = schoolList.find((s) => s.sName === val);
			if (!schoolData) return;

			selectedSchoolDbRef.current = schoolData.dbname;
			selectedSchoolServerIpRef.current = schoolData.serverip || "";

			setClassLoading(true);
			try {
				const d = await apiClass(schoolData.dbname, schoolData.serverip);
				setClassList(
					(d.RetData ?? []).filter(
						(c: ClassItem) => c.studentgroupid && c.studentgroupid !== "0",
					),
				);
			} catch {
				setClassList([]);
			} finally {
				setClassLoading(false);
			}
		},
		[schoolList],
	);

	// ─── Mutation ─────────────────────────────────────────────────────────────
	const updateMutation = useMutation({
		mutationFn: async (data: {
			firstname: string;
			lastname: string;
			phone: string;
			email: string;
			aimag_id: number;
			aimagname: string;
			sym_id: number;
			symname: string;
			regnumber: string;
			password?: string;
			schoolname: string;
			schooldb: string;
			studentgroupid: string;
			studentgroupname: string;
			user_id: number;
			img_url: string;
		}) => {
			return getUserUpdateProfile(
				data.firstname,
				data.lastname,
				data.phone,
				data.email,
				data.aimag_id,
				data.aimagname,
				data.sym_id,
				data.symname,
				data.regnumber,
				data.password ?? "",
				data.schoolname,
				data.schooldb,
				data.studentgroupid,
				data.studentgroupname,
				data.user_id,
				data.img_url ?? "",
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfilePage", userId] });
			setShowToast(true);
			setTimeout(() => setShowToast(false), 3000);
			setSelectedImage(null);
			setImagePreview("");
			setUploadedImageUrl("");
			setIsEditing(false);
		},
	});

	const convertToWebP = async (
		file: File,
		quality = 0.85,
		maxWidth = 1920,
		maxHeight = 1080,
	): Promise<Blob> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
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
					(blob) =>
						blob
							? resolve(blob)
							: reject(new Error("WebP хөрвүүлэлт амжилтгүй")),
					"image/webp",
					quality,
				);
			};
			img.onerror = () => reject(new Error("Зураг уншихад алдаа гарлаа"));
			img.src = URL.createObjectURL(file);
		});
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			alert("Зөвхөн зураг файл сонгоно уу");
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			alert("Зургийн хэмжээ 10MB-аас бага байх ёстой");
			return;
		}
		try {
			setIsUploadingImage(true);
			const webpBlob = await convertToWebP(file);
			setImagePreview(URL.createObjectURL(webpBlob));
			const formData = new FormData();
			formData.append(
				"file",
				webpBlob,
				file.name.replace(/\.[^/.]+$/, ".webp"),
			);
			const result = await uploadImage(formData);
			if (result.fileStatus !== 0)
				throw new Error(result.message || "Upload амжилтгүй боллоо");
			const imageUrl = result.file?.url;
			if (!imageUrl) throw new Error("Upload хариуд URL байхгүй байна");
			setUploadedImageUrl(imageUrl);
			setSelectedImage(file);
		} catch (error: unknown) {
			alert(
				error instanceof Error
					? error.message
					: "Зураг upload хийхэд алдаа гарлаа",
			);
			setImagePreview("");
			setSelectedImage(null);
			setUploadedImageUrl("");
		} finally {
			setIsUploadingImage(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!editForm.Phone || editForm.Phone.trim() === "") {
			setPhoneError("Утасны дугаар оруулна уу");
			return;
		}
		setPhoneError("");

		if (editForm.password && editForm.password !== editForm.confirmPassword) {
			setPasswordError("Нууц үг таарахгүй байна");
			return;
		}
		if (editForm.password && editForm.password.length < 6) {
			setPasswordError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
			return;
		}
		setPasswordError("");

		let finalImageUrl = "";
		if (uploadedImageUrl) {
			finalImageUrl =
				typeof uploadedImageUrl === "string"
					? uploadedImageUrl
					: (uploadedImageUrl as { FileWebUrl?: string }).FileWebUrl || "";
		} else if (user.img_url) {
			finalImageUrl =
				typeof user.img_url === "string"
					? user.img_url
					: (user.img_url as unknown as { FileWebUrl?: string }).FileWebUrl ||
						"";
		}

		// ── Байршил шалгалт — fallback хасав, заавал сонгосон байх ёстой ──
		const selectedAimagItem = aimagList.find(
			(a) => a.mID.toString() === selectedAimag,
		);
		const aimagName = selectedAimagItem?.mName ?? "";
		const aimagId = selectedAimagItem?.mID ?? 0;
		if (!aimagName || aimagId === 0) {
			setLocationError("Аймаг / Нийслэл сонгоно уу");
			return;
		}

		const selectedDistrictItem = districtList.find(
			(d) => d.id.toString() === selectedDistrict,
		);
		const symName = selectedDistrictItem?.name ?? "";
		const symId = selectedDistrictItem?.id ?? 0;
		if (!symName || symId === 0) {
			setLocationError("Сум / Дүүрэг сонгоно уу");
			return;
		}

		if (!selectedSchool) {
			setLocationError("Сургууль сонгоно уу");
			return;
		}
		const schoolDb = selectedSchoolDbRef.current;
		if (!schoolDb) {
			alert("Сургуулийн мэдээлэл алдаатай байна. Дахин сонгоно уу");
			return;
		}

		if (!selectedClass) {
			setLocationError("Сургуулийн мэдээлэл алдаатай байна. Дахин сонгоно уу");
			return;
		}
		const selectedClassItem = classList.find(
			(c) => c.studentgroupid === selectedClass,
		);
		const studentgroupname = selectedClassItem?.class_name ?? "";
		if (!studentgroupname) {
			setLocationError("Анги / Бүлэг сонгоно уу");
			return;
		}
		setLocationError("");
		updateMutation.mutate({
			firstname: editForm.firstname || user.firstname,
			lastname: editForm.lastname || user.lastname,
			phone: editForm.Phone,
			email: editForm.email || user.email,
			aimag_id: aimagId,
			aimagname: aimagName,
			sym_id: symId,
			symname: symName,
			regnumber: "",
			schoolname: selectedSchool,
			schooldb: schoolDb,
			studentgroupid: selectedClass,
			studentgroupname,
			user_id: userId,
			img_url: finalImageUrl,
			password: editForm.password || undefined,
		});
	};

	const getInitials = (name: string) => {
		if (!name) return "??";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="min-h-screen p-4 md:p-6 lg:p-8">
			{showToast && (
				<div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 fade-in duration-500">
					<div className="bg-linear-to-r from-emerald-500 to-green-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px]">
						<CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
						<div>
							<p className="font-bold text-sm">Амжилттай!</p>
							<p className="text-xs opacity-90">Мэдээлэл шинэчлэгдлээ</p>
						</div>
						<Button
							onClick={() => setShowToast(false)}
							variant="ghost"
							size="icon"
							className="w-7 h-7 hover:bg-white/20"
						>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</div>
			)}

			<div className="max-w-6xl mx-auto">
				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* ── Left Column ── */}
						<div className="lg:col-span-1">
							<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 relative overflow-hidden">
								<div className="absolute top-0 left-0 right-0 h-32" />
								<div className="relative space-y-6">
									<div className="flex flex-col items-center">
										<div className="relative group">
											<Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-xl">
												<AvatarImage
													src={imagePreview || user.img_url || undefined}
													className="object-cover"
												/>
												<AvatarFallback className="text-2xl font-bold">
													{getInitials(user.username)}
												</AvatarFallback>
											</Avatar>
											{isEditing && (
												<>
													<label
														htmlFor="image-upload"
														className="absolute bottom-1 right-1 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg border-3 border-white dark:border-slate-800 bg-blue-500"
													>
														<Camera className="w-5 h-5 text-white" />
													</label>
													{selectedImage && (
														<button
															type="button"
															onClick={() => {
																setSelectedImage(null);
																setImagePreview(user.img_url || "");
																setUploadedImageUrl("");
															}}
															className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg"
														>
															<X className="w-4 h-4" />
														</button>
													)}
												</>
											)}
										</div>
										{isEditing && (
											<>
												<Input
													id="image-upload"
													type="file"
													accept="image/*"
													className="hidden"
													onChange={handleImageChange}
													disabled={isUploadingImage}
												/>
												{isUploadingImage && (
													<p className="text-xs mt-2 animate-pulse">
														Уншиж байна...
													</p>
												)}
											</>
										)}
									</div>

									<div className="text-center border-t border-slate-200 dark:border-slate-700 pt-6">
										<h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
											{user.username}
										</h2>
										<p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
											{user.email}
										</p>
									</div>

									<div className="space-y-3">
										<div className="flex items-start gap-3 text-sm">
											<div className="w-5 h-5 mt-0.5 text-slate-400">
												<User2 className="w-full h-full" />
											</div>
											<div className="flex-1">
												<p className="text-slate-500 dark:text-slate-400 text-xs">
													Нэр
												</p>
												<p className="text-slate-900 dark:text-white font-medium">
													{user.lastname} {user.firstname}
												</p>
											</div>
										</div>
										<div className="flex items-start gap-3 text-sm">
											<div className="w-5 h-5 mt-0.5 text-slate-400">
												<Mail className="w-full h-full" />
											</div>
											<div className="flex-1">
												<p className="text-slate-500 dark:text-slate-400 text-xs">
													Имэйл
												</p>
												<p className="text-slate-900 dark:text-white font-medium break-all">
													{user.email}
												</p>
											</div>
										</div>
										{user.Phone && (
											<div className="flex items-start gap-3 text-sm">
												<div className="w-5 h-5 mt-0.5 text-slate-400">
													<Phone className="w-full h-full" />
												</div>
												<div className="flex-1">
													<p className="text-slate-500 dark:text-slate-400 text-xs">
														Утас
													</p>
													<p className="text-slate-900 dark:text-white font-medium">
														{user.Phone}
													</p>
												</div>
											</div>
										)}
									</div>

									<Button
										type="button"
										onClick={() => {
											setIsEditing(!isEditing);
											setPasswordError("");
											setPhoneError("");
										}}
										className="w-full rounded-xl h-11"
									>
										<Edit2 className="w-4 h-4 mr-2" />
										{isEditing ? "Буцах" : "Засах"}
									</Button>

									{isEditing && (
										<Button
											type="submit"
											disabled={updateMutation.isPending}
											className="w-full bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl h-11"
										>
											{updateMutation.isPending ? (
												<>
													<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
													Хадгалж байна...
												</>
											) : (
												<>
													<Check className="w-4 h-4 mr-2" />
													Хадгалах
												</>
											)}
										</Button>
									)}
								</div>
							</div>
						</div>

						{/* ── Right Column ── */}
						<div className="lg:col-span-2">
							{isEditing && (
								<div className="space-y-4">
									{/* Card 1: Утас + Нууц үг */}
									<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
										<div className="space-y-4">
											<div
												className={`flex items-center p-4 rounded-xl ${phoneError ? "bg-red-50 dark:bg-red-950/20" : "bg-slate-50 dark:bg-slate-800"}`}
											>
												<div className="flex items-center gap-3 flex-1">
													<Phone
														className={`w-5 h-5 ${phoneError ? "text-red-500" : "text-cyan-500"}`}
													/>
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Утасны дугаар{" "}
															<span className="text-red-500">*</span>
														</p>
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Одоо ашиглаж байгаа утасны дугаараа оруулна уу.
															Энэ дугаараар нууц үг сэргээх боломжтой
														</p>
														<Input
															type="tel"
															value={editForm.Phone}
															onChange={(e) => {
																setEditForm({
																	...editForm,
																	Phone: e.target.value,
																});
																setPhoneError("");
															}}
															className={`mt-1 h-8 bg-transparent border-0 border-b rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus-visible:ring-0 ${
																phoneError
																	? "border-red-500 focus:border-red-500"
																	: "border-slate-300 dark:border-slate-600 focus:border-blue-500"
															}`}
															placeholder="Утасны дугаар"
														/>
														{phoneError && (
															<p className="text-xs text-red-500 mt-1 font-medium">
																{phoneError}
															</p>
														)}
													</div>
												</div>
											</div>

											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<Lock className="w-5 h-5 text-rose-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Нууц үг
														</p>
														<Input
															type="password"
															value={editForm.password}
															autoComplete="new-password"
															onChange={(e) => {
																setEditForm({
																	...editForm,
																	password: e.target.value,
																});
																setPasswordError("");
															}}
															className="mt-1 h-8 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus-visible:ring-0"
															placeholder="Шинэ нууц үг"
														/>
													</div>
												</div>
											</div>

											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<Lock className="w-5 h-5 text-rose-400" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Нууц үг давтах
														</p>
														<Input
															type="password"
															value={editForm.confirmPassword}
															autoComplete="new-password"
															onChange={(e) => {
																setEditForm({
																	...editForm,
																	confirmPassword: e.target.value,
																});
																setPasswordError("");
															}}
															className="mt-1 h-8 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus-visible:ring-0"
															placeholder="Нууц үг давтах"
														/>
														{passwordError && (
															<p className="text-xs text-red-500 mt-1">
																{passwordError}
															</p>
														)}
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Card 2: Байршил мэдээлэл */}
									<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
										<div className="flex items-start gap-3 mb-5 p-3  rounded-xl">
											<p className="text-xs  leading-relaxed">
												Та өөрийн мэдээлэлээ үнэн зөв оруулсан үед таны шалгалт
												идэвхтэй харагдах тул{" "}
												<span className="font-bold">заавал оруулна уу</span>
											</p>
										</div>
										<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
											Байршил мэдээлэл
										</p>
										<div className="space-y-4">
											<SelectField
												label="Аймаг / Нийслэл"
												placeholder={
													aimagLoading ? "Уншиж байна..." : "— Аймаг сонгох —"
												}
												options={aimagList
													.filter((a) => a.mID)
													.map((a) => ({
														value: a.mID.toString(),
														label: a.mName,
													}))}
												value={selectedAimag}
												onValueChange={onAimag}
												disabled={false}
												loading={aimagLoading}
												icon={
													<MapPin className="w-full h-full text-emerald-500" />
												}
											/>
											<SelectField
												label="Сум / Дүүрэг"
												placeholder={
													districtLoading
														? "Уншиж байна..."
														: !selectedAimag
															? "Эхлээд аймаг сонгоно уу"
															: "— Дүүрэг сонгох —"
												}
												options={districtList
													.filter((d) => d.id)
													.map((d) => ({
														value: d.id.toString(),
														label: d.name,
													}))}
												value={selectedDistrict}
												onValueChange={onDistrict}
												disabled={!selectedAimag}
												loading={districtLoading}
												icon={
													<MapPin className="w-full h-full text-cyan-500" />
												}
											/>
											<SelectField
												label="Сургууль"
												placeholder={
													schoolLoading
														? "Уншиж байна..."
														: !selectedDistrict
															? "Эхлээд дүүрэг сонгоно уу"
															: "— Сургууль сонгох —"
												}
												options={schoolList
													.filter((s) => s.sName && s.sName !== "Сонгоно уу")
													.map((s) => ({ value: s.sName, label: s.sName }))}
												value={selectedSchool}
												onValueChange={onSchool}
												disabled={!selectedDistrict}
												loading={schoolLoading}
												icon={
													<School className="w-full h-full text-indigo-500" />
												}
											/>
											<SelectField
												label="Анги / Бүлэг"
												placeholder={
													classLoading
														? "Уншиж байна..."
														: !selectedSchool
															? "Эхлээд сургууль сонгоно уу"
															: "— Анги сонгох —"
												}
												options={classList.map((c) => ({
													value: c.studentgroupid,
													label: c.class_name,
												}))}
												value={selectedClass}
												onValueChange={setSelectedClass}
												disabled={!selectedSchool}
												loading={classLoading}
												icon={
													<School className="w-full h-full text-violet-500" />
												}
											/>
										</div>
									</div>
								</div>
							)}

							{/* View Mode */}
							{!isEditing && (
								<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
									<div className="space-y-4">
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3">
												<User2 className="w-5 h-5 text-blue-500" />
												<div>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Овог
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white">
														{user.lastname}
													</p>
												</div>
											</div>
										</div>
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3">
												<User2 className="w-5 h-5 text-indigo-500" />
												<div>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Нэр
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white">
														{user.firstname}
													</p>
												</div>
											</div>
										</div>
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3">
												<Mail className="w-5 h-5 text-emerald-500" />
												<div>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Имэйл
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white break-all">
														{user.email}
													</p>
												</div>
											</div>
										</div>
										{user.Phone && (
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3">
													<Phone className="w-5 h-5 text-cyan-500" />
													<div>
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Утас
														</p>
														<p className="text-sm font-semibold text-slate-900 dark:text-white">
															{user.Phone}
														</p>
													</div>
												</div>
											</div>
										)}
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3">
												<MapPin className="w-5 h-5 text-emerald-500" />
												<div>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Аймаг/Нийслэл
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white">
														{user.aimag_name || (
															<span className="text-slate-400 font-normal">
																—
															</span>
														)}
													</p>
												</div>
											</div>
										</div>
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3">
												<MapPin className="w-5 h-5 text-cyan-500" />
												<div>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Сум/Дүүрэг
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white">
														{user.sym_name || (
															<span className="text-slate-400 font-normal">
																—
															</span>
														)}
													</p>
												</div>
											</div>
										</div>
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-start gap-3">
												<School className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
												<div className="flex-1 min-w-0">
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Сургууль
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white break-words">
														{user.sch_name || (
															<span className="text-slate-400 font-normal">
																—
															</span>
														)}
													</p>
												</div>
											</div>
										</div>
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3">
												<School className="w-5 h-5 text-violet-500" />
												<div>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Анги
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white">
														{user.studentgroupname || (
															<span className="text-slate-400 font-normal">
																—
															</span>
														)}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</form>

				{updateMutation.isError && (
					<div className="mt-6 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
						<div>
							<p className="text-sm font-bold text-red-700 dark:text-red-400">
								Алдаа гарлаа
							</p>
							<p className="text-xs text-red-600 dark:text-red-300 mt-1">
								{(updateMutation.error as Error).message}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
