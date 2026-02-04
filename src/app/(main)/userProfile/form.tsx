"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	Check,
	Eye,
	EyeOff,
	Lock,
	MapPin,
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
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

	const [editForm, setEditForm] = useState({
		lastname: user.lastname || "",
		firstname: user.firstname || "",
		email: user.email || "",
		Phone: user.Phone || "",
		newPassword: user.password || "",
		confirmPassword: user.password || "",
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

			const compressedImage = await compressImage(file);
			setImagePreview(compressedImage);

			const formData = new FormData();
			const blob = await fetch(compressedImage).then((r) => r.blob());
			formData.append("file", blob, file.name);

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
			password: editForm.newPassword || "",
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
		<div className="min-h-screen bg-background p-3 md:p-4">
			<div className="max-w-3xl mx-auto space-y-3">
				{/* Header */}
				<div>
					<h1 className="text-xl font-bold">Профайл</h1>
					<p className="text-xs text-muted-foreground">Мэдээллээ засварлах</p>
				</div>

				{/* Main Card */}
				<Card>
					<CardContent className="p-4">
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Avatar Section */}
							<div className="flex flex-col items-center gap-2 pb-3 border-b">
								<div className="relative">
									<Avatar className="w-20 h-20 border-2">
										<AvatarImage
											src={imagePreview || user.img_url || undefined}
										/>
										<AvatarFallback className="text-lg bg-muted">
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
											className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
										>
											<X className="w-3 h-3" />
										</button>
									)}
								</div>

								<div className="text-center space-y-1">
									<h2 className="text-base font-bold">{user.username}</h2>
									<p className="text-xs text-muted-foreground">{user.email}</p>
								</div>

								<Label htmlFor="image-upload" className="cursor-pointer">
									<div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium">
										<Upload className="w-3 h-3" />
										<span>
											{isUploadingImage ? "Уншиж байна..." : "Зураг солих"}
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

								{selectedImage && (
									<p className="text-xs text-green-600">
										✓ {selectedImage.name}
									</p>
								)}
								{uploadedImageUrl && (
									<p className="text-xs text-blue-600">✓ Амжилттай хадгаллаа</p>
								)}
							</div>

							{/* Personal Info */}
							<div className="space-y-2">
								<h3 className="text-sm font-semibold flex items-center gap-1.5">
									<User className="w-4 h-4" />
									Хувийн мэдээлэл
								</h3>
								<div className="grid gap-2 md:grid-cols-2">
									<div className="space-y-1">
										<Label className="text-xs">Овог</Label>
										<Input
											value={editForm.lastname}
											onChange={(e) =>
												setEditForm({ ...editForm, lastname: e.target.value })
											}
											required
											className="h-9 text-sm"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Нэр</Label>
										<Input
											value={editForm.firstname}
											onChange={(e) =>
												setEditForm({ ...editForm, firstname: e.target.value })
											}
											required
											className="h-9 text-sm"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Имэйл</Label>
										<Input
											type="email"
											value={editForm.email}
											onChange={(e) =>
												setEditForm({ ...editForm, email: e.target.value })
											}
											required
											className="h-9 text-sm"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Утас</Label>
										<Input
											type="tel"
											value={editForm.Phone}
											onChange={(e) =>
												setEditForm({ ...editForm, Phone: e.target.value })
											}
											className="h-9 text-sm"
										/>
									</div>
								</div>
							</div>

							<Separator className="my-3" />

							{/* Password */}
							<div className="space-y-2">
								<h3 className="text-sm font-semibold flex items-center gap-1.5">
									<Lock className="w-4 h-4" />
									Нууц үг
								</h3>
								<div className="grid gap-2 md:grid-cols-2">
									<div className="space-y-1">
										<Label className="text-xs">Шинэ нууц үг</Label>
										<div className="relative">
											<Input
												type={showNewPassword ? "text" : "password"}
												value={editForm.newPassword}
												onChange={(e) =>
													setEditForm({
														...editForm,
														newPassword: e.target.value,
													})
												}
												className="h-9 pr-8 text-sm"
											/>
											<button
												type="button"
												onClick={() => setShowNewPassword(!showNewPassword)}
												className="absolute right-2 top-1/2 -translate-y-1/2"
											>
												{showNewPassword ? (
													<EyeOff className="w-3.5 h-3.5" />
												) : (
													<Eye className="w-3.5 h-3.5" />
												)}
											</button>
										</div>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Баталгаажуулах</Label>
										<div className="relative">
											<Input
												type={showConfirmPassword ? "text" : "password"}
												value={editForm.confirmPassword}
												onChange={(e) =>
													setEditForm({
														...editForm,
														confirmPassword: e.target.value,
													})
												}
												className="h-9 pr-8 text-sm"
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												className="absolute right-2 top-1/2 -translate-y-1/2"
											>
												{showConfirmPassword ? (
													<EyeOff className="w-3.5 h-3.5" />
												) : (
													<Eye className="w-3.5 h-3.5" />
												)}
											</button>
										</div>
									</div>
								</div>
								{passwordError && (
									<div className="p-2 bg-destructive/10 border border-destructive/30 rounded flex items-start gap-1.5">
										<AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
										<p className="text-xs text-destructive">{passwordError}</p>
									</div>
								)}
							</div>

							<Separator className="my-3" />

							{/* Location */}
							<div className="space-y-2">
								<h3 className="text-sm font-semibold flex items-center gap-1.5">
									<MapPin className="w-4 h-4" />
									Байршил
								</h3>
								<div className="grid gap-2 md:grid-cols-2">
									<div className="space-y-1">
										<Label className="text-xs">Аймаг/Хот</Label>
										<Select
											value={selectedAimag}
											onValueChange={handleAimagChange}
											disabled={aimagLoading}
										>
											<SelectTrigger className="h-9 w-full text-sm">
												<SelectValue
													placeholder={
														aimagLoading
															? "Уншиж байна..."
															: user.aimag_name || "Сонгох"
													}
												/>
											</SelectTrigger>
											<SelectContent className="max-h-[200px]">
												{aimagList.map((aimag) => (
													<SelectItem
														key={aimag.mid}
														value={aimag.mAcode}
														className="text-sm"
													>
														<span
															className="block truncate"
															title={aimag.mName}
														>
															{aimag.mName}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-1">
										<Label className="text-xs">Дүүрэг/Сум</Label>
										<Select
											value={selectedDistrict}
											onValueChange={handleDistrictChange}
											disabled={!selectedAimag || districtLoading}
										>
											<SelectTrigger className="h-9 w-full text-sm">
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
											<SelectContent className="max-h-[200px]">
												{districtList.map((district) => (
													<SelectItem
														key={district.id}
														value={district.id.toString()}
														className="text-sm"
													>
														<span
															className="block truncate"
															title={district.name}
														>
															{district.name}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-1">
										<Label className="text-xs">Сургууль</Label>
										<Select
											value={selectedSchool}
											onValueChange={handleSchoolChange}
											disabled={!selectedDistrict || schoolLoading}
										>
											<SelectTrigger className="h-9 w-full text-sm">
												<SelectValue
													placeholder={
														schoolLoading
															? "Уншиж байна..."
															: !selectedDistrict
																? "Дүүрэг сонгоно уу"
																: user.sch_name || "Сонгох"
													}
												/>
											</SelectTrigger>
											<SelectContent className="max-h-[200px]">
												{schoolList.map((school, index) => (
													<SelectItem
														key={`${school.dbname}-${index}`}
														value={school.sName}
														className="text-sm"
													>
														<span
															className="block truncate"
															title={school.sName}
														>
															{school.sName}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-1">
										<Label className="text-xs">Анги</Label>
										<Select
											value={selectedClass}
											onValueChange={setSelectedClass}
											disabled={!selectedSchool || classLoading}
										>
											<SelectTrigger className="h-9 w-full text-sm">
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
											<SelectContent className="max-h-[200px]">
												{classList
													.filter((c) => c.class_name !== "Бүлэг ")
													.map((classItem, index) => (
														<SelectItem
															key={`${classItem.studentgroupid}-${index}`}
															value={classItem.studentgroupid}
															className="text-sm"
														>
															<span
																className="block truncate"
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
							<Button
								type="submit"
								disabled={updateMutation.isPending}
								className="w-full h-10 text-sm"
							>
								{updateMutation.isPending ? (
									<span className="flex items-center gap-2">
										<UseAnimations
											animation={loading2}
											size={16}
											strokeColor="currentColor"
											loop
										/>
										<span>Хадгалж байна...</span>
									</span>
								) : (
									<span className="flex items-center gap-2">
										<Save className="w-4 h-4" />
										<span>Хадгалах</span>
									</span>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				{/* Messages */}
				{updateMutation.isError && (
					<div className="p-3 bg-destructive/10 border border-destructive/30 rounded flex items-start gap-2">
						<AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-semibold text-destructive">
								Алдаа гарлаа
							</p>
							<p className="text-xs text-destructive/80">
								{(updateMutation.error as Error).message}
							</p>
						</div>
					</div>
				)}

				{updateMutation.isSuccess && (
					<div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded flex items-start gap-2">
						<Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-semibold text-green-900 dark:text-green-100">
								Амжилттай
							</p>
							<p className="text-xs text-green-700 dark:text-green-300">
								Мэдээлэл шинэчлэгдлээ
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
