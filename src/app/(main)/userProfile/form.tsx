"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	Camera,
	Check,
	CheckCircle2,
	Edit2,
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
	SelectValue,
} from "@/components/ui/select";
import { getUserUpdateProfile } from "@/lib/api";
import { uploadImage } from "@/utils/upload";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserData {
	lastname: string;
	firstname: string;
	email: string;
	Phone: string | null;
	img_url: string | null;
	username: string;
	password: string | null;
	aimag_id?: number;
	aimag_name?: string;
	sym_id?: number;
	sym_name?: string;
	sch_name?: string;
	schooldb?: string;
	studentgroupname?: string;
}

interface ProfileContentProps {
	user: UserData;
	userId: number;
}

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

// ─── API helpers ──────────────────────────────────────────────────────────────
async function apiFetchAimag(): Promise<AimagItem[]> {
	const r = await fetch("/api/sign/aimag", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
	});
	if (!r.ok) throw new Error("Аймгийн жагсаалт татахад алдаа гарлаа");
	const d = await r.json();
	return d.RetData ?? [];
}

async function apiFetchDistrict(aimagId: number): Promise<DistrictItem[]> {
	const r = await fetch("/api/sign/district", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ aimag_id: aimagId }),
	});
	if (!r.ok) throw new Error("Дүүрэг/сумын жагсаалт татахад алдаа гарлаа");
	const d = await r.json();
	return d.RetData ?? [];
}

async function apiFetchSchool(
	aimagId: number,
	districtId: number,
): Promise<SchoolItem[]> {
	const r = await fetch("/api/sign/surguuli", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ aimag_id: aimagId, district_id: districtId }),
	});
	if (!r.ok) throw new Error("Сургуулийн жагсаалт татахад алдаа гарлаа");
	const d = await r.json();
	return d.RetData ?? [];
}

async function apiFetchClass(
	database: string,
	serverip: string,
): Promise<ClassItem[]> {
	const r = await fetch("/api/sign/angi", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			database,
			serverip,
			accademic_id: "0",
			class_id: "0",
		}),
	});
	if (!r.ok) throw new Error("Ангийн жагсаалт татахад алдаа гарлаа");
	const d = await r.json();
	return d.RetData ?? [];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProfileContent({ user, userId }: ProfileContentProps) {
	const queryClient = useQueryClient();

	// ── UI ────────────────────────────────────────────────────────────────────
	const [showToast, setShowToast] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	// ── Зураг ────────────────────────────────────────────────────────────────
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

	// ── Form ──────────────────────────────────────────────────────────────────
	const [editForm, setEditForm] = useState({
		lastname: user.lastname || "",
		firstname: user.firstname || "",
		email: user.email || "",
		Phone: user.Phone || "",
	});

	useEffect(() => {
		setEditForm({
			lastname: user.lastname || "",
			firstname: user.firstname || "",
			email: user.email || "",
			Phone: user.Phone || "",
		});
	}, [user.lastname, user.firstname, user.email, user.Phone]);

	// ── Cascade select — list ─────────────────────────────────────────────────
	const [aimagList, setAimagList] = useState<AimagItem[]>([]);
	const [districtList, setDistrictList] = useState<DistrictItem[]>([]);
	const [schoolList, setSchoolList] = useState<SchoolItem[]>([]);
	const [classList, setClassList] = useState<ClassItem[]>([]);

	// ── Cascade select — selected objects ─────────────────────────────────────
	const [selectedAimag, setSelectedAimag] = useState<AimagItem | null>(null);
	const [selectedDistrict, setSelectedDistrict] = useState<DistrictItem | null>(
		null,
	);
	const [selectedSchool, setSelectedSchool] = useState<SchoolItem | null>(null);
	const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

	// ── Cascade select — loading ──────────────────────────────────────────────
	const [aimagLoading, setAimagLoading] = useState(true);
	const [districtLoading, setDistrictLoading] = useState(false);
	const [schoolLoading, setSchoolLoading] = useState(false);
	const [classLoading, setClassLoading] = useState(false);

	// ── user утгыг ref-д capture хийнэ — Biome auto-fix-аас зайлсхийх ────────
	const initRef = useRef({
		aimag_id: user.aimag_id,
		sym_id: user.sym_id,
		sch_name: user.sch_name,
		studentgroupname: user.studentgroupname,
	});

	// ── Mount: нэг удаа cascade initialize ───────────────────────────────────
	useEffect(() => {
		const u = initRef.current;
		(async () => {
			try {
				const aimags = await apiFetchAimag();
				setAimagList(aimags);

				if (!u.aimag_id) return;
				const userAimag = aimags.find((a) => a.mID === u.aimag_id);
				if (!userAimag) return;
				setSelectedAimag(userAimag);

				setDistrictLoading(true);
				try {
					const districts = await apiFetchDistrict(userAimag.mID);
					setDistrictList(districts);

					if (!u.sym_id) return;
					const userDistrict = districts.find((d) => d.id === u.sym_id);
					if (!userDistrict) return;
					setSelectedDistrict(userDistrict);

					setSchoolLoading(true);
					try {
						const schools = await apiFetchSchool(
							userAimag.mID,
							userDistrict.id,
						);
						setSchoolList(schools);

						if (!u.sch_name) return;
						const userSchool = schools.find((s) => s.sName === u.sch_name);
						if (!userSchool) return;
						setSelectedSchool(userSchool);

						setClassLoading(true);
						try {
							const classes = await apiFetchClass(
								userSchool.dbname,
								userSchool.serverip,
							);
							setClassList(classes);

							if (!u.studentgroupname) return;
							const userClass = classes.find(
								(c) => c.class_name === u.studentgroupname,
							);
							if (userClass) setSelectedClass(userClass);
						} finally {
							setClassLoading(false);
						}
					} finally {
						setSchoolLoading(false);
					}
				} finally {
					setDistrictLoading(false);
				}
			} catch {
				setAimagList([]);
			} finally {
				setAimagLoading(false);
			}
		})();
	}, []);

	// ── Аймаг солих ───────────────────────────────────────────────────────────
	const handleAimagChange = useCallback(
		async (mAcode: string) => {
			const aimag = aimagList.find((a) => a.mAcode === mAcode);
			if (!aimag) return;
			setSelectedAimag(aimag);
			setSelectedDistrict(null);
			setSelectedSchool(null);
			setSelectedClass(null);
			setDistrictList([]);
			setSchoolList([]);
			setClassList([]);

			setDistrictLoading(true);
			try {
				const districts = await apiFetchDistrict(aimag.mID);
				setDistrictList(districts);
			} catch {
				setDistrictList([]);
			} finally {
				setDistrictLoading(false);
			}
		},
		[aimagList],
	);

	// ── Дүүрэг солих ─────────────────────────────────────────────────────────
	const handleDistrictChange = useCallback(
		async (idStr: string) => {
			const district = districtList.find((d) => d.id.toString() === idStr);
			if (!district || !selectedAimag) return;
			setSelectedDistrict(district);
			setSelectedSchool(null);
			setSelectedClass(null);
			setSchoolList([]);
			setClassList([]);

			setSchoolLoading(true);
			try {
				const schools = await apiFetchSchool(selectedAimag.mID, district.id);
				setSchoolList(schools);
			} catch {
				setSchoolList([]);
			} finally {
				setSchoolLoading(false);
			}
		},
		[districtList, selectedAimag],
	);

	// ── Сургууль солих ────────────────────────────────────────────────────────
	const handleSchoolChange = useCallback(
		async (sName: string) => {
			const school = schoolList.find((s) => s.sName === sName);
			if (!school) return;
			setSelectedSchool(school);
			setSelectedClass(null);
			setClassList([]);

			setClassLoading(true);
			try {
				const classes = await apiFetchClass(school.dbname, school.serverip);
				setClassList(classes);
			} catch {
				setClassList([]);
			} finally {
				setClassLoading(false);
			}
		},
		[schoolList],
	);

	// ── Анги солих ────────────────────────────────────────────────────────────
	const handleClassChange = useCallback(
		(studentgroupid: string) => {
			const cls = classList.find((c) => c.studentgroupid === studentgroupid);
			setSelectedClass(cls ?? null);
		},
		[classList],
	);

	// ── Mutation ──────────────────────────────────────────────────────────────
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

	// ── Зураг WebP хөрвүүлэлт ────────────────────────────────────────────────
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

	// ── Зураг upload ──────────────────────────────────────────────────────────
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
			console.error("❌ Зураг upload хийхэд алдаа:", error);
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

	// ── Submit ────────────────────────────────────────────────────────────────
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

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

		updateMutation.mutate({
			firstname: editForm.firstname || user.firstname,
			lastname: editForm.lastname || user.lastname,
			phone: editForm.Phone || user.Phone || "",
			email: editForm.email || user.email,
			aimag_id: selectedAimag?.mID ?? user.aimag_id ?? 0,
			aimagname: selectedAimag?.mName ?? user.aimag_name ?? "",
			sym_id: selectedDistrict?.id ?? user.sym_id ?? 0,
			symname: selectedDistrict?.name ?? user.sym_name ?? "",
			regnumber: "",
			schoolname: selectedSchool?.sName ?? user.sch_name ?? "",
			schooldb: selectedSchool?.dbname ?? user.schooldb ?? "EDU_CONFIG",
			studentgroupid: selectedClass?.studentgroupid ?? "",
			studentgroupname:
				selectedClass?.class_name ?? user.studentgroupname ?? "",
			user_id: userId,
			img_url: String(finalImageUrl),
			password: "",
		});
	};

	// ── Helper ────────────────────────────────────────────────────────────────
	const getInitials = (name: string) => {
		if (!name) return "??";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	// ─────────────────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen p-4 md:p-6 lg:p-8">
			{/* Toast */}
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
									{/* Avatar */}
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

									{/* Profile Info */}
									<div className="text-center border-t border-slate-200 dark:border-slate-700 pt-6">
										<h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
											{user.username}
										</h2>
										<p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
											{user.email}
										</p>
									</div>

									{/* Info Items */}
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

									{/* Edit Button */}
									<Button
										type="button"
										onClick={() => setIsEditing(!isEditing)}
										className="w-full rounded-xl h-11"
									>
										<Edit2 className="w-4 h-4 mr-2" />
										{isEditing ? "Буцах" : "Засах"}
									</Button>

									{/* Save Button */}
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
							{/* Edit Mode */}
							{isEditing && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Personal Info */}
									<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
										<div className="space-y-4">
											{/* Овог */}
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<User2 className="w-5 h-5 text-blue-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Овог
														</p>
														<Input
															value={editForm.lastname}
															onChange={(e) =>
																setEditForm({
																	...editForm,
																	lastname: e.target.value,
																})
															}
															required
															className="mt-1 h-8 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus-visible:ring-0"
															placeholder="Овог"
														/>
													</div>
												</div>
											</div>

											{/* Нэр */}
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<User2 className="w-5 h-5 text-indigo-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Нэр
														</p>
														<Input
															value={editForm.firstname}
															onChange={(e) =>
																setEditForm({
																	...editForm,
																	firstname: e.target.value,
																})
															}
															required
															className="mt-1 h-8 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus-visible:ring-0"
															placeholder="Нэр"
														/>
													</div>
												</div>
											</div>

											{/* Имэйл */}
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<Mail className="w-5 h-5 text-emerald-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Имэйл
														</p>
														<Input
															type="email"
															value={editForm.email}
															onChange={(e) =>
																setEditForm({
																	...editForm,
																	email: e.target.value,
																})
															}
															required
															className="mt-1 h-8 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus-visible:ring-0"
															placeholder="email@example.com"
														/>
													</div>
												</div>
											</div>

											{/* Утас */}
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<Phone className="w-5 h-5 text-cyan-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Утас
														</p>
														<Input
															type="tel"
															value={editForm.Phone}
															onChange={(e) =>
																setEditForm({
																	...editForm,
																	Phone: e.target.value,
																})
															}
															className="mt-1 h-8 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus-visible:ring-0"
															placeholder="Утасны дугаар"
														/>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Location & School */}
									<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
										<div className="space-y-4">
											{/* Аймаг */}
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<MapPin className="w-5 h-5 text-emerald-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
															Аймаг/Хот
														</p>
														<Select
															value={selectedAimag?.mAcode ?? ""}
															onValueChange={handleAimagChange}
															disabled={aimagLoading}
														>
															<SelectTrigger className="h-9 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus:ring-0 focus-visible:ring-0">
																<SelectValue
																	placeholder={
																		aimagLoading
																			? "Уншиж байна..."
																			: user.aimag_name || "Сонгох"
																	}
																/>
															</SelectTrigger>
															<SelectContent>
																{aimagList.map((a) => (
																	<SelectItem key={a.mAcode} value={a.mAcode}>
																		{a.mName}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>
											</div>

											{/* Дүүрэг/Сум */}
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<MapPin className="w-5 h-5 text-cyan-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
															Дүүрэг/Сум
														</p>
														<Select
															value={selectedDistrict?.id.toString() ?? ""}
															onValueChange={handleDistrictChange}
															disabled={!selectedAimag || districtLoading}
														>
															<SelectTrigger className="h-9 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus:ring-0 focus-visible:ring-0">
																<SelectValue
																	placeholder={
																		districtLoading
																			? "Уншиж байна..."
																			: !selectedAimag
																				? "Аймаг сонгоно уу"
																				: user.sym_name || "Сонгох"
																	}
																/>
															</SelectTrigger>
															<SelectContent>
																{districtList.map((d) => (
																	<SelectItem
																		key={d.id}
																		value={d.id.toString()}
																	>
																		{d.name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>
											</div>

											{/* Сургууль */}
											<div className="flex items-start p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-start gap-3 flex-1 min-w-0">
													<School className="w-5 h-5 text-indigo-500 mt-1 shrink-0" />
													<div className="flex-1 min-w-0 w-full">
														<p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
															Сургууль
														</p>
														<Select
															value={selectedSchool?.sName ?? ""}
															onValueChange={handleSchoolChange}
															disabled={!selectedDistrict || schoolLoading}
														>
															<SelectTrigger
																className="w-full h-auto py-2 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus:ring-0 focus-visible:ring-0"
																style={{ whiteSpace: "normal" }}
															>
																<div className="text-left w-full pr-4 whitespace-normal leading-tight">
																	{selectedSchool?.sName || (
																		<span className="text-slate-500">
																			{schoolLoading
																				? "Уншиж байна..."
																				: !selectedDistrict
																					? "Дүүрэг сонгоно уу"
																					: user.sch_name || "Сонгох"}
																		</span>
																	)}
																</div>
															</SelectTrigger>
															<SelectContent className="max-w-[90vw] sm:max-w-md">
																{schoolList.map((s, i) => (
																	<SelectItem
																		key={`${s.dbname}-${i}`}
																		value={s.sName}
																		className="whitespace-normal py-3 text-sm leading-tight"
																	>
																		<div className="whitespace-normal">
																			{s.sName}
																		</div>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>
											</div>

											{/* Анги */}
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<School className="w-5 h-5 text-violet-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
															Анги
														</p>
														<Select
															value={selectedClass?.studentgroupid ?? ""}
															onValueChange={handleClassChange}
															disabled={!selectedSchool || classLoading}
														>
															<SelectTrigger className="h-9 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus:ring-0 focus-visible:ring-0">
																<SelectValue
																	placeholder={
																		classLoading
																			? "Уншиж байна..."
																			: !selectedSchool
																				? "Сургууль сонгоно уу"
																				: user.studentgroupname || "Сонгох"
																	}
																/>
															</SelectTrigger>
															<SelectContent>
																{classList
																	.filter((c) => c.class_name.trim() !== "")
																	.map((c) => (
																		<SelectItem
																			key={c.studentgroupid}
																			value={c.studentgroupid}
																		>
																			{c.class_name}
																		</SelectItem>
																	))}
															</SelectContent>
														</Select>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}

							{/* View Mode */}
							{!isEditing && (
								<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
									<div className="space-y-4">
										{user.aimag_name && (
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3">
													<MapPin className="w-5 h-5 text-emerald-500" />
													<div>
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Аймаг/Хот
														</p>
														<p className="text-sm font-semibold text-slate-900 dark:text-white">
															{user.aimag_name}
														</p>
													</div>
												</div>
											</div>
										)}

										{user.sym_name && (
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3">
													<MapPin className="w-5 h-5 text-cyan-500" />
													<div>
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Дүүрэг/Сум
														</p>
														<p className="text-sm font-semibold text-slate-900 dark:text-white">
															{user.sym_name}
														</p>
													</div>
												</div>
											</div>
										)}

										{user.sch_name && (
											<div className="flex items-start p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-start gap-3">
													<School className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
													<div className="flex-1 min-w-0">
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Сургууль
														</p>
														<p className="text-sm font-semibold text-slate-900 dark:text-white break-words">
															{user.sch_name}
														</p>
													</div>
												</div>
											</div>
										)}

										{user.studentgroupname && (
											<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3">
													<School className="w-5 h-5 text-violet-500" />
													<div>
														<p className="text-xs text-slate-500 dark:text-slate-400">
															Анги
														</p>
														<p className="text-sm font-semibold text-slate-900 dark:text-white">
															{user.studentgroupname}
														</p>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</form>

				{/* Error Message */}
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
