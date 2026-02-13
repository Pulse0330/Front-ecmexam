"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useEffect, useState } from "react";
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
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
	const [showToast, setShowToast] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

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
		quality: number = 0.8,
		maxWidth: number = 1920,
		maxHeight: number = 1080,
	): Promise<Blob> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			img.onload = () => {
				let width = img.width;
				let height = img.height;

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
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error("WebP хөрвүүлэлт амжилтгүй"));
						}
					},
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

			const webpBlob = await convertToWebP(file, 0.85);
			const previewUrl = URL.createObjectURL(webpBlob);
			setImagePreview(previewUrl);

			const formData = new FormData();
			const webpFileName = file.name.replace(/\.[^/.]+$/, ".webp");
			formData.append("file", webpBlob, webpFileName);

			const result = await uploadImage(formData);

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

		let finalImageUrl = "";
		if (uploadedImageUrl) {
			if (typeof uploadedImageUrl === "string") {
				finalImageUrl = uploadedImageUrl;
			} else if (uploadedImageUrl && typeof uploadedImageUrl === "object") {
				const imgObj = uploadedImageUrl as { FileWebUrl?: string };
				finalImageUrl = imgObj.FileWebUrl || "";
			}
		} else if (user.img_url) {
			if (typeof user.img_url === "string") {
				finalImageUrl = user.img_url;
			} else if (typeof user.img_url === "object" && user.img_url !== null) {
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
			password: "",
		};

		if (typeof profileData.img_url !== "string") {
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
		<div className="min-h-screen  p-4 md:p-6 lg:p-8">
			{/* Toast Notification */}
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
						{/* Left Column - Profile Card */}
						<div className="lg:col-span-1">
							<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 relative overflow-hidden">
								{/* Gradient Background Accent */}
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

						{/* Right Column - Combined View/Edit Forms */}
						<div className="lg:col-span-2">
							{/* Edit Mode - 2 Column Layout */}
							{isEditing && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Personal Info */}
									<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
										<div className="space-y-4">
											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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

											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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

											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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

											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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
											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<MapPin className="w-5 h-5 text-emerald-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
															Аймаг/Хот
														</p>
														<Select
															value={selectedAimag}
															onValueChange={handleAimagChange}
															disabled={aimagLoading}
														>
															<SelectTrigger className="h-9 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus:ring-0 focus-visible:ring-0">
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
																	<SelectItem key={a.mid} value={a.mAcode}>
																		{a.mName}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>
											</div>

											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<MapPin className="w-5 h-5 text-cyan-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
															Дүүрэг/Сум
														</p>
														<Select
															value={selectedDistrict}
															onValueChange={handleDistrictChange}
															disabled={!selectedAimag || districtLoading}
														>
															<SelectTrigger className="h-9 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus:ring-0 focus-visible:ring-0">
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

											<div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-start gap-3 flex-1 min-w-0">
													<School className="w-5 h-5 text-indigo-500 mt-1 shrink-0" />
													<div className="flex-1 min-w-0 w-full">
														<p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
															Сургууль
														</p>
														<div className="relative">
															<Select
																value={selectedSchool}
																onValueChange={handleSchoolChange}
																disabled={!selectedDistrict || schoolLoading}
															>
																<SelectTrigger
																	className="w-full h-auto min-h-[40px] py-2 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus:ring-0 focus-visible:ring-0"
																	style={{ whiteSpace: "normal" }}
																>
																	<div className="text-left w-full pr-4 whitespace-normal break-words leading-tight">
																		{selectedSchool || (
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
																			className="whitespace-normal py-3 text-sm leading-tight min-h-[40px]"
																		>
																			<div className="whitespace-normal break-words">
																				{s.sName}
																			</div>
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</div>
													</div>
												</div>
											</div>

											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
												<div className="flex items-center gap-3 flex-1">
													<School className="w-5 h-5 text-violet-500" />
													<div className="flex-1">
														<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
															Анги
														</p>
														<Select
															value={selectedClass}
															onValueChange={setSelectedClass}
															disabled={!selectedSchool || classLoading}
														>
															<SelectTrigger className="h-9 bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded-none px-0 text-sm font-semibold text-slate-900 dark:text-white focus:ring-0 focus-visible:ring-0">
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

							{/* Info Display when not editing */}
							{!isEditing && (
								<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
									<div className="space-y-4">
										{user.aimag_name && (
											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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
											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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
											<div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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
											<div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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
