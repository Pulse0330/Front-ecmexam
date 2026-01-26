"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	Building2,
	Check,
	Lock,
	Mail,
	MapPin,
	Phone as PhoneIcon,
	Save,
	Upload,
	User,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getUserUpdateProfile } from "@/lib/api";
import { uploadImage } from "@/utils/upload";

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
	mid: number;
	sort: number;
	miid: string;
	mid1: number;
}

interface AimagResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: AimagItem[];
}

interface DistrictItem {
	id: number;
	name: string;
	sort: number;
}

interface DistrictResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: DistrictItem[];
}

interface SchoolItem {
	sName: string;
	conn: string;
	dbname: string;
	sort: number;
	district_id: number;
	serverip: string;
}

interface SchoolResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: SchoolItem[];
}

interface ClassItem {
	id: number;
	class_name: string;
	studentgroupid: string;
	sort: number;
}

interface ClassResponse {
	RetResponse: {
		ResponseMessage: string;
		StatusCode: string;
		ResponseCode: string;
		ResponseType: boolean;
	};
	RetData: ClassItem[];
}

async function fetchAimagList(): Promise<AimagResponse> {
	const response = await fetch("/api/sign/aimag", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
	});
	if (!response.ok) throw new Error("Аймгийн жагсаалт татахад алдаа гарлаа");
	return response.json();
}

async function fetchDistrictList(aimagId: number): Promise<DistrictResponse> {
	const response = await fetch("/api/sign/district", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ aimag_id: aimagId }),
	});
	if (!response.ok)
		throw new Error("Дүүрэг/сумын жагсаалт татахад алдаа гарлаа");
	return response.json();
}

async function fetchSchoolList(
	aimagId: number,
	districtId: number,
): Promise<SchoolResponse> {
	const response = await fetch("/api/sign/surguuli", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ aimag_id: aimagId, district_id: districtId }),
	});
	if (!response.ok) throw new Error("Сургуулийн жагсаалт татахад алдаа гарлаа");
	return response.json();
}

async function fetchClassList(
	database: string,
	serverip: string,
	accademicId: string = "0",
	classId: string = "0",
): Promise<ClassResponse> {
	const response = await fetch("/api/sign/angi", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			database,
			serverip,
			accademic_id: accademicId,
			class_id: classId,
		}),
	});
	if (!response.ok) throw new Error("Ангийн жагсаалт татахад алдаа гарлаа");
	return response.json();
}

export function ProfileContent({ user, userId }: ProfileContentProps) {
	const queryClient = useQueryClient();
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [selectedAimag, setSelectedAimag] = useState<string>("");
	const [selectedDistrict, setSelectedDistrict] = useState<string>("");
	const [selectedSchool, setSelectedSchool] = useState<string>("");
	const [selectedClass, setSelectedClass] = useState<string>("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// ⭐ Upload state-үүд_setShowConfirmPassword
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

	const [editForm, setEditForm] = useState({
		lastname: user.lastname || "",
		firstname: user.firstname || "",
		email: user.email || "",
		Phone: user.Phone || "",
		newPassword: user.password || "", // ЭНД НЭМСЭН
		confirmPassword: user.password || "", // ЭНД НЭМСЭН
	});

	const [passwordError, setPasswordError] = useState("");

	const { data: aimagData, isLoading: aimagLoading } = useQuery<AimagResponse>({
		queryKey: ["aimagList"],
		queryFn: fetchAimagList,
	});

	useEffect(() => {
		if (aimagData?.RetData && user.aimag_id) {
			const userAimag = aimagData.RetData.find((a) => a.mid === user.aimag_id);
			if (userAimag) {
				setSelectedAimag(userAimag.mAcode);
			}
		}
	}, [aimagData, user.aimag_id]);

	const selectedAimagData = aimagData?.RetData?.find(
		(a) => a.mAcode === selectedAimag,
	);

	const { data: districtData, isLoading: districtLoading } =
		useQuery<DistrictResponse>({
			queryKey: ["districtList", selectedAimagData?.mid],
			queryFn: () => {
				if (!selectedAimagData?.mid) throw new Error("Аймаг сонгоогүй байна");
				return fetchDistrictList(selectedAimagData.mid);
			},
			enabled: !!selectedAimagData?.mid,
		});

	useEffect(() => {
		if (districtData?.RetData && user.sym_id) {
			setSelectedDistrict(user.sym_id.toString());
		}
	}, [districtData, user.sym_id]);

	const selectedDistrictData = districtData?.RetData?.find(
		(d) => d.id.toString() === selectedDistrict,
	);

	const { data: schoolData, isLoading: schoolLoading } =
		useQuery<SchoolResponse>({
			queryKey: [
				"schoolList",
				selectedAimagData?.mid,
				selectedDistrictData?.id,
			],
			queryFn: () => {
				if (!selectedAimagData?.mid || !selectedDistrictData?.id)
					throw new Error("Аймаг эсвэл дүүрэг сонгоогүй байна");
				return fetchSchoolList(selectedAimagData.mid, selectedDistrictData.id);
			},
			enabled: !!selectedAimagData?.mid && !!selectedDistrictData?.id,
		});

	useEffect(() => {
		if (schoolData?.RetData && user.sch_name) {
			setSelectedSchool(user.sch_name);
		}
	}, [schoolData, user.sch_name]);

	const selectedSchoolData = schoolData?.RetData?.find(
		(s) => s.sName === selectedSchool,
	);

	const { data: classData, isLoading: classLoading } = useQuery<ClassResponse>({
		queryKey: [
			"classList",
			selectedSchoolData?.dbname,
			selectedSchoolData?.serverip,
		],
		queryFn: () => {
			if (!selectedSchoolData?.dbname || !selectedSchoolData?.serverip)
				throw new Error("Сургууль сонгоогүй байна");
			return fetchClassList(
				selectedSchoolData.dbname,
				selectedSchoolData.serverip,
			);
		},
		enabled: !!selectedSchoolData?.dbname && !!selectedSchoolData?.serverip,
	});

	useEffect(() => {
		if (classData?.RetData && user.studentgroupname) {
			const userClass = classData.RetData.find(
				(c) => c.class_name === user.studentgroupname,
			);
			if (userClass) {
				setSelectedClass(userClass.studentgroupid);
			}
		}
	}, [classData, user.studentgroupname]);

	const aimagList = aimagData?.RetData || [];
	const districtList = districtData?.RetData || [];
	const schoolList = schoolData?.RetData || [];
	const classList = classData?.RetData || [];

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
			setSelectedImage(null);
			setImagePreview("");
			setUploadedImageUrl("");
			setEditForm({
				...editForm,
				newPassword: "",
				confirmPassword: "",
			});
			setPasswordError("");
		},
	});

	// Compress and resize image
	const compressImage = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = new Image();
				img.onload = () => {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");

					const MAX_WIDTH = 400;
					const MAX_HEIGHT = 400;
					let width = img.width;
					let height = img.height;

					if (width > height) {
						if (width > MAX_WIDTH) {
							height *= MAX_WIDTH / width;
							width = MAX_WIDTH;
						}
					} else {
						if (height > MAX_HEIGHT) {
							width *= MAX_HEIGHT / height;
							height = MAX_HEIGHT;
						}
					}

					canvas.width = width;
					canvas.height = height;
					ctx?.drawImage(img, 0, 0, width, height);

					const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
					resolve(compressedDataUrl);
				};
				img.onerror = reject;
				img.src = e.target?.result as string;
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	//  Зураг upload хийх функц
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

			// Зургийг багасгах
			const compressedImage = await compressImage(file);
			setImagePreview(compressedImage);

			// Server рүү upload хийх
			const formData = new FormData();
			const blob = await fetch(compressedImage).then((r) => r.blob());
			formData.append("file", blob, file.name);

			console.log("📤 Upload эхлүүлж байна...");
			const result = await uploadImage(formData);
			console.log("✅ Upload response:", result);

			// Response-н бүтцийг шалгаад зөв URL авах
			let imageUrl = "";

			if (Array.isArray(result) && result.length > 0) {
				imageUrl = result[0]?.url || result[0]?.path || result[0];
			} else if (result?.url) {
				imageUrl = result.url;
			} else if (typeof result === "string") {
				imageUrl = result;
			}

			if (imageUrl) {
				setUploadedImageUrl(imageUrl);
				setSelectedImage(file);
				console.log("✅ Зураг амжилттай upload хийгдлээ:", imageUrl);
			} else {
				throw new Error("Upload хариу буруу байна");
			}
		} catch (error: unknown) {
			console.error("❌ Зураг upload хийхэд алдаа:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Зураг upload хийхэд алдаа гарлаа";
			alert(errorMessage);
			setImagePreview("");
			setSelectedImage(null);
			setUploadedImageUrl("");
		} finally {
			setIsUploadingImage(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (editForm.newPassword || editForm.confirmPassword) {
			if (editForm.newPassword !== editForm.confirmPassword) {
				setPasswordError("Нууц үг таарахгүй байна");
				return;
			}
			if (editForm.newPassword.length < 3) {
				setPasswordError("Нууц үг хамгийн багадаа 3 тэмдэгт байх ёстой");
				return;
			}
		}
		setPasswordError("");

		// img_url-г зөв форматаар авах
		let finalImageUrl = "";
		if (uploadedImageUrl) {
			// Шинэ upload хийсэн зураг - string эсэхийг шалгах
			if (typeof uploadedImageUrl === "string") {
				finalImageUrl = uploadedImageUrl;
			} else if (uploadedImageUrl && typeof uploadedImageUrl === "object") {
				// Хэрэв объект ирвэл FileWebUrl-г авах
				const imgObj = uploadedImageUrl as { FileWebUrl?: string };
				finalImageUrl = imgObj.FileWebUrl || "";
			}
		} else if (user.img_url) {
			// Хуучин зураг
			if (typeof user.img_url === "string") {
				finalImageUrl = user.img_url;
			} else if (typeof user.img_url === "object" && user.img_url !== null) {
				// Type assertion ашиглах
				const imgObj = user.img_url as { FileWebUrl?: string };
				finalImageUrl = imgObj.FileWebUrl || "";
			}
		}

		const profileData = {
			firstname: editForm.firstname || user.firstname,
			lastname: editForm.lastname || user.lastname,
			phone: editForm.Phone || user.Phone || "",
			email: editForm.email || user.email,
			aimag_id: selectedAimagData?.mid || user.aimag_id || 0,
			aimagname: selectedAimagData?.mName || user.aimag_name || "",
			sym_id: selectedDistrictData?.id || user.sym_id || 0,
			symname: selectedDistrictData?.name || user.sym_name || "",
			regnumber: "",
			schoolname: selectedSchool || user.sch_name || "",
			schooldb: selectedSchoolData?.dbname || user.schooldb || "EDU_CONFIG",
			studentgroupid: selectedClass || "",
			studentgroupname:
				classList.find((c) => c.studentgroupid === selectedClass)?.class_name ||
				user.studentgroupname ||
				"",
			user_id: userId,
			img_url: String(finalImageUrl),
			password: editForm.newPassword || "",
		};

		console.log("📤 Хадгалах мэдээлэл:", profileData);
		console.log(
			"🔍 finalImageUrl:",
			finalImageUrl,
			"| Type:",
			typeof finalImageUrl,
		);
		console.log("🔍 img_url type:", typeof profileData.img_url);
		console.log("🔍 img_url value:", JSON.stringify(profileData.img_url));

		// FINAL CHECK: Ensure img_url is definitely a string
		if (typeof profileData.img_url !== "string") {
			console.error(
				"❌ CRITICAL: img_url is NOT a string after conversion!",
				profileData.img_url,
			);
			alert("Техникийн алдаа: Зургийн URL буруу байна");
			return;
		}

		updateMutation.mutate(profileData);
	};
	const handleAimagChange = (value: string) => {
		setSelectedAimag(value);
		setSelectedDistrict("");
		setSelectedSchool("");
		setSelectedClass("");
	};

	const handleDistrictChange = (value: string) => {
		setSelectedDistrict(value);
		setSelectedSchool("");
		setSelectedClass("");
	};

	const handleSchoolChange = (value: string) => {
		setSelectedSchool(value);
		setSelectedClass("");
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
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-pink-950/30 p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
			{/* Animated Background Effects */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div className="absolute -top-40 -left-40 w-80 h-80 bg-linear-to-r from-violet-500/20 to-purple-500/20 dark:from-violet-600/30 dark:to-purple-600/30 rounded-full blur-3xl animate-pulse" />
				<div
					className="absolute -bottom-40 -right-40 w-96 h-96 bg-linear-to-r from-pink-500/20 to-rose-500/20 dark:from-pink-600/30 dark:to-rose-600/30 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "1s" }}
				/>
				<div
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 relative z-10">
				{/* Header */}
				<div className="px-1 sm:px-0">
					<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold t mb-1 sm:mb-2">
						Профайл
					</h1>
				</div>

				{/* Main Content Card */}
				<Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
					<CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
						<form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
							{/* Avatar Section */}
							<div className="flex flex-col items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b">
								<div className="relative group">
									<div className="absolute -inset-1 bg-linear-to-r from-violet-600 to-pink-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
									<Avatar className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-4 border-white dark:border-slate-800 shadow-2xl ring-4 ring-purple-100 dark:ring-purple-900/50">
										<AvatarImage
											src={imagePreview || user.img_url || undefined}
											className="object-cover"
										/>
										<AvatarFallback className="text-2xl sm:text-3xl font-bold bg-linear-to-br from-violet-500 to-pink-600 text-white">
											{getInitials(user.username)}
										</AvatarFallback>
									</Avatar>
									{selectedImage && (
										<button
											type="button"
											onClick={() => {
												setSelectedImage(null);
												setImagePreview(user.img_url || "");
												setUploadedImageUrl("");
											}}
											className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
										>
											<X className="w-3 h-3 sm:w-4 sm:h-4" />
										</button>
									)}
								</div>

								<div className="flex-1 text-center w-full max-w-md">
									<h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
										{user.username || "Нэргүй хэрэглэгч"}
									</h2>
									<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 break-all">
										{user.email}
									</p>

									<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
										<Label htmlFor="image-upload" className="cursor-pointer">
											<div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base disabled:opacity-50">
												<Upload className="w-4 h-4" />
												<span>
													{isUploadingImage
														? "Upload хийж байна..."
														: "Зураг солих"}
												</span>
											</div>
										</Label>
										<Input
											id="image-upload"
											type="file"
											accept="image/*"
											className="hidden"
											onChange={handleImageChange}
											disabled={isUploadingImage}
										/>
									</div>

									{/* Файлын нэр */}
									{selectedImage && (
										<div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg max-w-full">
											<Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
											<p className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium truncate">
												{selectedImage.name}
											</p>
										</div>
									)}

									{/* Upload амжилттай message */}
									{uploadedImageUrl && (
										<div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg max-w-full">
											<Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
											<p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
												Server рүү амжилттай хуулагдлаа
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Personal Information Section */}
							<div className="space-y-4 sm:space-y-6">
								<div className="flex items-center gap-2">
									<div className="p-1.5 sm:p-2 bg-linear-to-br from-violet-500 to-purple-600 rounded-lg">
										<User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
									</div>
									<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
										Хувийн мэдээлэл
									</h3>
								</div>

								<div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2">
									{/* Lastname */}
									<div className="space-y-2">
										<Label
											htmlFor="lastname"
											className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
										>
											<User className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600" />
											Овог
										</Label>
										<Input
											id="lastname"
											value={editForm.lastname}
											onChange={(e) =>
												setEditForm({ ...editForm, lastname: e.target.value })
											}
											required
											className="h-10 sm:h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base"
										/>
									</div>

									{/* Firstname */}
									<div className="space-y-2">
										<Label
											htmlFor="firstname"
											className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
										>
											<User className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
											Нэр
										</Label>
										<Input
											id="firstname"
											value={editForm.firstname}
											onChange={(e) =>
												setEditForm({ ...editForm, firstname: e.target.value })
											}
											required
											className="h-10 sm:h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base"
										/>
									</div>

									{/* Email */}
									<div className="space-y-2">
										<Label
											htmlFor="email"
											className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
										>
											<Mail className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
											Имэйл хаяг
										</Label>
										<Input
											id="email"
											type="email"
											value={editForm.email}
											onChange={(e) =>
												setEditForm({ ...editForm, email: e.target.value })
											}
											required
											className="h-10 sm:h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-pink-500 dark:focus:border-pink-400 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base"
										/>
									</div>

									{/* Phone */}
									<div className="space-y-2">
										<Label
											htmlFor="phone"
											className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
										>
											<PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
											Утасны дугаар
										</Label>
										<Input
											id="phone"
											type="tel"
											value={editForm.Phone}
											onChange={(e) =>
												setEditForm({ ...editForm, Phone: e.target.value })
											}
											placeholder="+976 ..."
											className="h-10 sm:h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base"
										/>
									</div>
								</div>
							</div>

							<Separator />

							{/* Password Section */}
							<div className="space-y-4 sm:space-y-6">
								<div className="flex items-center gap-2">
									<div className="p-1.5 sm:p-2 bg-linear-to-br from-pink-500 to-rose-600 rounded-lg">
										<Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
									</div>
									<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
										Нууц үг
									</h3>
								</div>

								<div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2">
									{/* New Password */}
									<div className="space-y-2">
										<Label
											htmlFor="new-password"
											className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300"
										>
											Шинэ нууц үг
										</Label>
										<div className="relative">
											<Input
												id="new-password"
												type={showNewPassword ? "text" : "password"}
												value={editForm.newPassword}
												onChange={(e) =>
													setEditForm({
														...editForm,
														newPassword: e.target.value,
													})
												}
												placeholder="Шинэ нууц үг оруулах"
												className="h-10 sm:h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-400 rounded-lg sm:rounded-xl transition-all pr-10 text-sm sm:text-base"
											/>
											<button
												type="button"
												onClick={() => setShowNewPassword(!showNewPassword)}
												className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
											></button>
										</div>
									</div>

									{/* Confirm Password */}
									<div className="space-y-2">
										<Label
											htmlFor="confirm-password"
											className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300"
										>
											Нууц үг баталгаажуулах
										</Label>
										<div className="relative">
											<Input
												id="confirm-password"
												type={showConfirmPassword ? "text" : "password"}
												value={editForm.confirmPassword}
												onChange={(e) =>
													setEditForm({
														...editForm,
														confirmPassword: e.target.value,
													})
												}
												placeholder="Нууц үгээ дахин оруулах"
												className="h-10 sm:h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-lg sm:rounded-xl transition-all pr-10 text-sm sm:text-base"
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
											>
												{/* Энд Eye icon нэмж болно */}
											</button>
										</div>
									</div>
								</div>

								{/* Password Error */}
								{passwordError && (
									<div className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl flex items-start gap-2">
										<AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
										<p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
											{passwordError}
										</p>
									</div>
								)}
							</div>

							<Separator />

							{/* Location Selection */}
							<div className="space-y-4 sm:space-y-6">
								<div className="flex items-center gap-2">
									<div className="p-1.5 sm:p-2 bg-linear-to-br from-blue-500 to-cyan-600 rounded-lg">
										<MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
									</div>
									<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
										Байршил
									</h3>
								</div>

								<div className=" ">
									{/* Aimag */}
									<div className="space-y-2">
										<Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
											<MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
											Аймаг/Хот
										</Label>
										<Select
											value={selectedAimag}
											onValueChange={handleAimagChange}
											disabled={aimagLoading}
										>
											<SelectTrigger className="h-10 sm:h-11 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base">
												<SelectValue
													placeholder={user.aimag_name || "Сонгох"}
												/>
											</SelectTrigger>
											<SelectContent>
												{aimagList.map((aimag) => (
													<SelectItem
														key={aimag.mid}
														value={aimag.mAcode}
														className="truncate max-w-full"
													>
														<span
															className="truncate block"
															title={aimag.mName}
														>
															{aimag.mName}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* District */}
									<div className="space-y-2">
										<Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
											<MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
											Дүүрэг/Сум
										</Label>
										<Select
											value={selectedDistrict}
											onValueChange={handleDistrictChange}
											disabled={!selectedAimag || districtLoading}
										>
											<SelectTrigger className="h-10 sm:h-11 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base">
												<SelectValue placeholder={user.sym_name || "Сонгох"} />
											</SelectTrigger>
											<SelectContent>
												{districtList.map((district) => (
													<SelectItem
														key={district.id}
														value={district.id.toString()}
														className="truncate max-w-full"
													>
														<span
															className="truncate block"
															title={district.name}
														>
															{district.name}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* School */}
									<div className="space-y-2">
										<Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
											<Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
											Сургууль
										</Label>
										<Select
											value={selectedSchool}
											onValueChange={handleSchoolChange}
											disabled={!selectedDistrict || schoolLoading}
										>
											<SelectTrigger className="h-10 sm:h-11 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base">
												<SelectValue placeholder={user.sch_name || "Сонгох"} />
											</SelectTrigger>
											<SelectContent>
												{schoolList.map((school, index) => (
													<SelectItem
														key={`${school.dbname}-${index}`}
														value={school.sName}
														className="truncate max-w-full"
													>
														<span
															className="truncate block"
															title={school.sName}
														>
															{school.sName}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									{/* Class */}
									<div className="space-y-2">
										<Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
											<User className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
											Анги
										</Label>
										<Select
											value={selectedClass}
											onValueChange={setSelectedClass}
											disabled={!selectedSchool || classLoading}
										>
											<SelectTrigger className="h-10 sm:h-11 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base">
												<SelectValue
													placeholder={user.studentgroupname || "Сонгох"}
												/>
											</SelectTrigger>
											<SelectContent>
												{classList
													.filter(
														(classItem) => classItem.class_name !== "Бүлэг ",
													)
													.map((classItem, index) => (
														<SelectItem
															key={`${classItem.studentgroupid}-${index}`}
															value={classItem.studentgroupid}
															className="truncate max-w-full"
														>
															<span
																className="truncate block"
																title={classItem.class_name}
															>
																{classItem.class_name}
															</span>
														</SelectItem>
													))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>

							{/* Save Button */}
							<div className="pt-2">
								<Button
									type="submit"
									disabled={updateMutation.isPending}
									className="w-full h-11 sm:h-12 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 font-semibold text-sm sm:text-base"
								>
									{updateMutation.isPending ? (
										<span className="flex items-center gap-2">
											<UseAnimations
												animation={loading2}
												size={20}
												strokeColor="#ffffff"
												loop
											/>
											<span className="text-sm sm:text-base">
												Хадгалж байна...
											</span>
										</span>
									) : (
										<>
											<Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
											Хадгалах
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				{/* Error Display */}
				{updateMutation.isError && (
					<div className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/50 border-2 border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3">
						<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
						<div className="min-w-0 flex-1">
							<p className="text-xs sm:text-sm font-semibold text-red-900 dark:text-red-100">
								Алдаа гарлаа
							</p>
							<p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1 wrap-break-words">
								{(updateMutation.error as Error).message}
							</p>
						</div>
					</div>
				)}

				{/* Success Display */}
				{updateMutation.isSuccess && (
					<div className="p-3 sm:p-4 bg-green-50 dark:bg-green-950/50 border-2 border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3">
						<Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
						<div className="min-w-0 flex-1">
							<p className="text-xs sm:text-sm font-semibold text-green-900 dark:text-green-100">
								Амжилттай хадгаллаа
							</p>
							<p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-1">
								Таны мэдээлэл амжилттай шинэчлэгдлээ
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
