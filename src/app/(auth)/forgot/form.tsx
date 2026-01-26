"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
	ArrowLeft,
	Eye,
	EyeOff,
	Loader2,
	MessageSquare,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Forgotpassword } from "@/lib/api";

const formSchema = z
	.object({
		phone: z
			.string()
			.length(8, { message: "Утасны дугаар яг 8 оронтой байх ёстой." })
			.regex(/^[0-9]+$/, { message: "Зөвхөн тоо оруулна уу." }),
		password: z
			.string()
			.min(6, { message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой." })
			.max(50, { message: "Нууц үг хэтэрхий урт байна." }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Нууц үг таарахгүй байна",
		path: ["confirmPassword"],
	});

const getDeviceInfo = () => {
	const parser = new UAParser();
	const device = parser.getDevice();
	const os = parser.getOS();
	const browser = parser.getBrowser();
	if (device.model) return device.model;
	return `${os.name || "Unknown"} - ${browser.name || "Unknown"}`;
};

const isMobileDevice = () => {
	const parser = new UAParser();
	const device = parser.getDevice();
	return device.type === "mobile" || device.type === "tablet" ? 1 : 0;
};

export default function ForgotForm() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// OTP States
	const [isWaitingForSMS, setIsWaitingForSMS] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [isChecking, setIsChecking] = useState(false);
	const [verificationCode, setVerificationCode] = useState("");
	const [timeLeft, setTimeLeft] = useState(0);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			phone: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onSubmit",
	});

	// OTP Timer
	useEffect(() => {
		if (timeLeft <= 0) return;
		const timer = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					setIsWaitingForSMS(false);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, [timeLeft]);

	// OTP Request Code
	const handleRequestCode = async () => {
		const phone = form.getValues("phone");
		const phoneValidation = await form.trigger("phone");
		if (!phoneValidation) return;

		setIsChecking(true);
		try {
			const response = await axios.post("/api/otp/getcode", {
				phone: Number(phone),
				conftype: "1",
				bundleid: "ikh_skuul.mn",
				devicemodel: getDeviceInfo(),
				ismob: isMobileDevice(),
			});

			if (response.data.RetResponse?.ResponseType) {
				const code = response.data.RetResponse.RtrGenCode;
				const seconds = response.data.RetResponse.RtrGenCodeSeconds || 180;
				setVerificationCode(code);
				setTimeLeft(Number(seconds));
				setIsWaitingForSMS(true);
				toast.success(response.data.RetResponse.ResponseMessage);
			} else {
				toast.error(
					response.data.RetResponse?.ResponseMessage ||
						"Код үүсгэхэд алдаа гарлаа",
				);
			}
		} catch (error) {
			console.error("Код үүсгэх алдаа:", error);
			toast.error("Код үүсгэхэд алдаа гарлаа");
		} finally {
			setIsChecking(false);
		}
	};

	// OTP Check Verification
	const handleCheckVerification = async () => {
		const phone = form.getValues("phone");
		if (!verificationCode) {
			toast.error("Эхлээд код үүсгэнэ үү");
			return;
		}

		setIsChecking(true);
		try {
			const response = await axios.post("/api/otp/smscheck", {
				phone: Number(phone),
				code: Number(verificationCode),
			});

			if (response.data.RetResponse?.ResponseType) {
				toast.success("Утасны дугаар баталгаажлаа!");
				setIsVerified(true);
				setIsWaitingForSMS(false);
				setTimeLeft(0);
			} else {
				toast.error("Баталгаажуулалт амжилтгүй");
			}
		} catch (error) {
			console.error("Баталгаажуулах алдаа:", error);
			toast.error("Баталгаажуулахад алдаа гарлаа");
		} finally {
			setIsChecking(false);
		}
	};

	const resetPasswordMutation = useMutation({
		mutationFn: async ({
			phone,
			password,
		}: {
			phone: string;
			password: string;
		}) => {
			return await Forgotpassword(phone, password);
		},
		onSuccess: (data) => {
			if (
				data?.RetResponse?.StatusCode === "200" &&
				data?.RetResponse?.ResponseType === true
			) {
				setIsSubmitted(true);
				toast.success(
					data.RetResponse.ResponseMessage || "Нууц үг амжилттай солигдлоо",
				);
			} else {
				toast.error(
					data?.RetResponse?.ResponseMessage || "Нууц үг солихоо алдаа гарлаа",
				);
			}
		},
		onError: (error: unknown) => {
			console.error("Reset error:", error);
			toast.error("Нууц үг солихоо алдаа гарлаа");
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!isVerified) {
			toast.error("Эхлээд утасны дугаараа баталгаажуулна уу");
			return;
		}

		resetPasswordMutation.mutate({
			phone: values.phone,
			password: values.password,
		});
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		form.handleSubmit(onSubmit)(e);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const isPending = resetPasswordMutation.isPending;

	if (isSubmitted) {
		return (
			<Card className="w-full max-w-sm bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
						<svg
							className="w-6 h-6 text-green-600 dark:text-green-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							role="img"
							aria-label="Check mark"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<CardTitle className="text-2xl font-semibold">
						Амжилттай солигдлоо
					</CardTitle>
					<CardDescription className="text-center">
						Таны нууц үг амжилттай солигдлоо. Одоо шинэ нууц үгээрээ нэвтэрч
						болно.
					</CardDescription>
				</CardHeader>

				<CardFooter className="flex flex-col gap-4">
					<Button asChild className="w-full">
						<Link href="/login">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Нэвтрэх хуудас руу буцах
						</Link>
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-sm bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-semibold">
					Нууц үг сэргээх
				</CardTitle>
				<CardDescription>Бүртгэлтэй утасны дугаараа оруулна уу</CardDescription>
			</CardHeader>

			<Form {...form}>
				<form onSubmit={handleFormSubmit}>
					<CardContent className="grid gap-4">
						{/* Утасны дугаар */}
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Утасны дугаар</FormLabel>
									<FormControl>
										<Input
											placeholder="88888888"
											type="tel"
											{...field}
											disabled={isPending || isVerified}
											maxLength={8}
											className="text-lg"
											onChange={(e) => {
												const value = e.target.value.replace(/\D/g, "");
												field.onChange(value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* OTP Баталгаажуулалт */}
						{!isVerified && (
							<div className="space-y-3">
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleRequestCode}
									disabled={isChecking || isWaitingForSMS}
								>
									{isChecking && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{isWaitingForSMS ? (
										<>
											<MessageSquare className="mr-2 h-4 w-4" />
											{formatTime(timeLeft)}
										</>
									) : (
										"Баталгаажуулах код авах"
									)}
								</Button>

								{isWaitingForSMS && verificationCode && (
									<Alert className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-sm">
										<AlertDescription className="py-2">
											<div className="space-y-4">
												{/* Зааварчилгаа */}
												<div className="flex gap-3">
													<div className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
														1
													</div>
													<p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
														Доорх кодыг{" "}
														<span className="font-bold text-blue-700 dark:text-blue-400">
															142076
														</span>{" "}
														дугаарт мессежээр илгээнэ үү.
													</p>
												</div>

												{/* Код харуулах */}
												<div className="relative group">
													<div className="bg-white dark:bg-slate-900 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group-hover:border-blue-400">
														<span className="text-3xl font-black tracking-widest text-blue-600 dark:text-blue-400 select-all">
															{verificationCode}
														</span>
													</div>
												</div>

												{/* Шалгах алхам */}
												<div className="flex gap-3 pt-2">
													<div className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
														2
													</div>
													<div className="flex-1 space-y-3">
														<p className="text-sm text-slate-700 dark:text-slate-300">
															Мессеж илгээсний дараа доорх товчийг дарж
															баталгаажуулна уу.
														</p>
														<Button
															type="button"
															className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]"
															onClick={handleCheckVerification}
															disabled={isChecking}
														>
															{isChecking ? (
																<>
																	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																	Шалгаж байна...
																</>
															) : (
																"Баталгаажуулалт шалгах"
															)}
														</Button>
													</div>
												</div>
											</div>
										</AlertDescription>
									</Alert>
								)}
							</div>
						)}

						{/* Баталгаажсан мэдэгдэл */}
						{isVerified && (
							<Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
								<ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
								<AlertDescription className="text-green-800 dark:text-green-200">
									Утасны дугаар амжилттай баталгаажлаа
								</AlertDescription>
							</Alert>
						)}

						{/* Нууц үг талбарууд - зөвхөн баталгаажсаны дараа */}
						{isVerified && (
							<>
								{/* Шинэ нууц үг */}
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Шинэ нууц үг</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder="••••••••"
														type={showPassword ? "text" : "password"}
														{...field}
														disabled={isPending}
														className="pr-10"
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
														onClick={() => setShowPassword(!showPassword)}
														disabled={isPending}
														tabIndex={-1}
													>
														{showPassword ? (
															<EyeOff className="h-4 w-4 text-gray-400" />
														) : (
															<Eye className="h-4 w-4 text-gray-400" />
														)}
													</Button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Нууц үг баталгаажуулах */}
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Нууц үг баталгаажуулах</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder="••••••••"
														type={showConfirmPassword ? "text" : "password"}
														{...field}
														disabled={isPending}
														className="pr-10"
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
														onClick={() =>
															setShowConfirmPassword(!showConfirmPassword)
														}
														disabled={isPending}
														tabIndex={-1}
													>
														{showConfirmPassword ? (
															<EyeOff className="h-4 w-4 text-gray-400" />
														) : (
															<Eye className="h-4 w-4 text-gray-400" />
														)}
													</Button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Submit Button */}
								<Button type="submit" className="w-full" disabled={isPending}>
									{isPending && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{isPending ? "Солиж байна..." : "Нууц үг солих"}
								</Button>
							</>
						)}
					</CardContent>
				</form>
			</Form>

			<CardFooter className="flex-col gap-4">
				<div className="relative w-full">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">Эсвэл</span>
					</div>
				</div>

				<Button asChild variant="link" className="w-full">
					<Link href="/login">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Нэвтрэх хуудас руу буцах
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
