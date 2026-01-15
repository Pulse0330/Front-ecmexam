"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const formSchema = z
	.object({
		phone: z
			.string()
			.min(8, { message: "Утасны дугаар 8 оронтой байх ёстой." })
			.regex(/^[0-9]+$/, { message: "Зөвхөн тоо оруулна уу." }),
		lastname: z.string().min(1, { message: "Овог оруулна уу." }),
		firstname: z.string().min(1, { message: "Нэр оруулна уу." }),
		email: z.string().email({ message: "Хүчинтэй имэйл хаяг оруулна уу." }),
		password: z
			.string()
			.min(6, { message: "Нууц үг 6-аас доошгүй тэмдэгттэй байх ёстой." }),
		confirmPassword: z
			.string()
			.min(1, { message: "Нууц үг дахин оруулна уу." }),
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

export function SignForm() {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);

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
			lastname: "",
			firstname: "",
			email: "",
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

	// Бүртгэл хийх
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!isVerified) {
			toast.error("Эхлээд утасны дугаараа баталгаажуулна уу");
			return;
		}

		setIsPending(true);

		try {
			const response = await fetch("/api/sign/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: values.email,
					firstname: values.firstname,
					lastname: values.lastname,
					phone: values.phone,
					password: values.password,
				}),
			});

			const data = await response.json();

			if (data?.RetResponse?.ResponseType) {
				toast.success("Амжилттай бүртгэгдлээ! Нэвтрэнэ үү.");
				router.push("/login");
			} else {
				toast.error(
					data?.RetResponse?.ResponseMessage || "Бүртгэл үүсгэхэд алдаа гарлаа",
				);
			}
		} catch (error) {
			console.error("Registration error:", error);
			toast.error("Серверт холбогдоход алдаа гарлаа");
		} finally {
			setIsPending(false);
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Card className="w-full max-w-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-semibold">Бүртгүүлэх</CardTitle>
				<CardDescription>Шинэ бүртгэл үүсгэх</CardDescription>
			</CardHeader>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
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

												{/* Код харуулах болон Хуулах хэсэг */}
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

						{/* ✅ Бусад талбарууд - зөвхөн баталгаажсаны дараа харагдана */}
						{isVerified && (
							<>
								<FormField
									control={form.control}
									name="lastname"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Овог</FormLabel>
											<FormControl>
												<Input
													placeholder="Овог"
													{...field}
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="firstname"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Нэр</FormLabel>
											<FormControl>
												<Input
													placeholder="Нэр"
													{...field}
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Имэйл хаяг</FormLabel>
											<FormControl>
												<Input
													placeholder="example@email.com"
													type="email"
													{...field}
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Нууц үг</FormLabel>
											<FormControl>
												<Input
													placeholder="••••••"
													type="password"
													{...field}
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Нууц үг давтах</FormLabel>
											<FormControl>
												<Input
													placeholder="••••••"
													type="password"
													{...field}
													disabled={isPending}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Бүртгүүлэх товч */}
								<Button
									type="submit"
									className="w-full h-11"
									disabled={isPending}
								>
									{isPending && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{isPending ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
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

				<p className="text-sm text-center text-muted-foreground">
					Бүртгэлтэй юу?{" "}
					<Button asChild variant="link" className="p-0 h-auto">
						<Link href="/login">Нэвтрэх</Link>
					</Button>
				</p>
			</CardFooter>
		</Card>
	);
}
