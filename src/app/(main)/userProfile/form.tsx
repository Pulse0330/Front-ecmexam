"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	Camera,
	Check,
	CheckCircle2,
	Edit2,
	Lock,
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
	aimag_name?: string | null;
	sym_name?: string | null;
	sch_name?: string | null;
	studentgroupname?: string | null;
}

interface ProfileContentProps {
	user: UserData;
	userId: number;
}

export function ProfileContent({ user, userId }: ProfileContentProps) {
	const queryClient = useQueryClient();

	const [showToast, setShowToast] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [passwordError, setPasswordError] = useState("");
	const [selectedImage, setSelectedImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

	const [editForm, setEditForm] = useState({
		lastname: user.lastname || "",
		firstname: user.firstname || "",
		email: user.email || "",
		Phone: user.Phone || "",
		password: "",
		confirmPassword: "",
	});

	useEffect(() => {
		if (!isEditing) {
			setEditForm((prev) => ({
				...prev,
				password: "",
				confirmPassword: "",
			}));
		}
	}, [isEditing]);

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

		updateMutation.mutate({
			firstname: editForm.firstname || user.firstname,
			lastname: editForm.lastname || user.lastname,
			phone: editForm.Phone || user.Phone || "",
			email: editForm.email || user.email,
			aimag_id: 0,
			aimagname: "",
			sym_id: 0,
			symname: "",
			regnumber: "",
			schoolname: "",
			schooldb: "EDU_CONFIG",
			studentgroupid: "",
			studentgroupname: "",
			user_id: userId,
			img_url: String(finalImageUrl),
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
						{/* Left Column */}
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

									<Button
										type="button"
										onClick={() => {
											setIsEditing(!isEditing);
											setEditForm((prev) => ({
												...prev,
												password: "",
												confirmPassword: "",
											}));
											setPasswordError("");
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

						{/* Right Column */}
						<div className="lg:col-span-2">
							{/* Edit Mode */}
							{isEditing && (
								<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
									<div className="space-y-4">
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3 flex-1">
												<Phone className="w-5 h-5 text-cyan-500" />
												<div className="flex-1">
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Одоо ашиглаж байгаа утасны дугаараа оруулна уу. Энэ
														дугаараар нууц үг сэргээх боломжтой
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
							)}

							{/* View Mode */}
							{!isEditing && (
								<div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6">
									<div className="space-y-4">
										{/* Овог */}
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

										{/* Нэр */}
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

										{/* Имэйл */}
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

										{/* Утас */}
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

										{/* Аймаг/Хот */}
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3">
												<MapPin className="w-5 h-5 text-emerald-500" />
												<div>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Аймаг/Нийслэл
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white">
														{user.aimag_name || (
															<span className="text-slate-400 font-normal"></span>
														)}
													</p>
												</div>
											</div>
										</div>

										{/* Дүүрэг/Сум */}
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3">
												<MapPin className="w-5 h-5 text-cyan-500" />
												<div>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Сум/Дүүрэг
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white">
														{user.sym_name || (
															<span className="text-slate-400 font-normal"></span>
														)}
													</p>
												</div>
											</div>
										</div>

										{/* Сургууль */}
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-start gap-3">
												<School className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
												<div className="flex-1 min-w-0">
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Сургууль
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white break-words">
														{user.sch_name || (
															<span className="text-slate-400 font-normal"></span>
														)}
													</p>
												</div>
											</div>
										</div>

										{/* Анги */}
										<div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
											<div className="flex items-center gap-3">
												<School className="w-5 h-5 text-violet-500" />
												<div>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														Анги
													</p>
													<p className="text-sm font-semibold text-slate-900 dark:text-white">
														{user.studentgroupname || (
															<span className="text-slate-400 font-normal"></span>
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
