// ============================================
// src/components/SignForm.tsx (ua-parser-js нэмсэн)
// ============================================
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { UAParser } from "ua-parser-js"; // 🔥 Шинэ
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
		username: z.string().min(1, { message: "Нэвтрэх нэр оруулна уу." }),
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

// 🔥 Төхөөрөмжийн мэдээлэл авах функц
const getDeviceInfo = () => {
	const parser = new UAParser();
	const device = parser.getDevice();
	const os = parser.getOS();
	const browser = parser.getBrowser();

	// Device model байвал түүнийг буцаах
	if (device.model) {
		return device.model;
	}

	// Үгүй бол OS + Browser
	return `${os.name || "Unknown"} - ${browser.name || "Unknown"}`;
};

// 🔥 Mobile эсэхийг шалгах
const isMobileDevice = () => {
	const parser = new UAParser();
	const device = parser.getDevice();
	return device.type === "mobile" || device.type === "tablet" ? 1 : 0;
};

export function SignForm() {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [isWaitingForSMS, setIsWaitingForSMS] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [isChecking, setIsChecking] = useState(false);
	const [verificationCode, setVerificationCode] = useState<string>("");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			phone: "",
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onSubmit",
	});

	// Код үүсгэх
	const handleRequestCode = async () => {
		const phone = form.getValues("phone");

		const phoneValidation = await form.trigger("phone");
		if (!phoneValidation) {
			return;
		}

		setIsChecking(true);

		try {
			const response = await axios.post("/api/otp/getcode", {
				phone: Number(phone),
				conftype: "1",
				bundleid: "ikh_skuul.mn",
				devicemodel: getDeviceInfo(), // 🔥 Динамик утга
				ismob: isMobileDevice(), // 🔥 Динамик утга
			});

			if (response.data.RetResponse?.ResponseType) {
				const code = response.data.RetResponse.RtrGenCode;
				setVerificationCode(code);
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
			toast.error(
				axios.isAxiosError(error)
					? error.response?.data?.RetResponse?.ResponseMessage ||
							"Код үүсгэхэд алдаа гарлаа"
					: "Код үүсгэхэд алдаа гарлаа",
			);
		} finally {
			setIsChecking(false);
		}
	};

	// SMS баталгаажуулах
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
			} else {
				toast.error(
					"Баталгаажуулалт амжилтгүй. Мессеж илгээсэн эсэхээ шалгана уу.",
				);
			}
		} catch (error) {
			console.error("Баталгаажуулах алдаа:", error);
			toast.error(
				axios.isAxiosError(error)
					? error.response?.data?.RetResponse?.ResponseMessage ||
							"Баталгаажуулахад алдаа гарлаа"
					: "Баталгаажуулахад алдаа гарлаа",
			);
		} finally {
			setIsChecking(false);
		}
	};

	// Бүртгэл хийх
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!isVerified) {
			toast.error("Эхлээд утасны дугаараа баталгаажуулна уу!");
			return;
		}

		setIsPending(true);

		try {
			// TODO: Энд бүртгэлийн API дуудах
			await new Promise((resolve) => setTimeout(resolve, 2000));

			console.log("Sign up values:", values);
			toast.success("Амжилттай бүртгэгдлээ! Нэвтрэнэ үү.");
			router.push("/login");
		} catch (_error) {
			toast.error("Бүртгэл үүсгэхэд алдаа гарлаа");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Card className="w-full max-w-sm bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
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
									<div className="flex gap-2">
										<FormControl>
											<Input
												placeholder="88888888"
												type="tel"
												{...field}
												disabled={isPending || isVerified}
												maxLength={8}
											/>
										</FormControl>
										<Button
											type="button"
											onClick={handleRequestCode}
											disabled={isChecking || isVerified || isWaitingForSMS}
											variant="outline"
											className="whitespace-nowrap"
										>
											{isChecking && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											{isWaitingForSMS ? "Код үүсгэсэн" : "Код үүсгэх"}
										</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* SMS заавар */}
						{isWaitingForSMS && !isVerified && (
							<Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
								<MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								<AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
									<div className="space-y-2">
										<p className="font-semibold">Дараах алхмуудыг дагана уу:</p>
										<ol className="list-decimal list-inside space-y-1 ml-2">
											<li>Утасны мессеж хэсгээ нээнэ үү</li>
											<li>
												<strong>142076</strong> дугаар руу мессеж бичнэ үү
											</li>
											<li>
												Мессежийн агуулга:{" "}
												<span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
													{verificationCode}
												</span>
											</li>
											<li>Илгээсний дараа "Шалгах" товч дарна уу</li>
										</ol>
									</div>
								</AlertDescription>
							</Alert>
						)}

						{/* Шалгах товч */}
						{isWaitingForSMS && !isVerified && (
							<Button
								type="button"
								onClick={handleCheckVerification}
								disabled={isChecking}
								variant="outline"
								className="w-full"
							>
								{isChecking && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{isChecking ? "Шалгаж байна..." : "Шалгах"}
							</Button>
						)}

						{/* Амжилттай мессеж */}
						{isVerified && (
							<Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
								<AlertDescription className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
									✓ Утасны дугаар баталгаажлаа
								</AlertDescription>
							</Alert>
						)}

						{/* Нэвтрэх нэр */}
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Нэвтрэх нэр</FormLabel>
									<FormControl>
										<Input
											placeholder="ES40100****"
											type="text"
											{...field}
											disabled={isPending || !isVerified}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Имэйл */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Имэйл</FormLabel>
									<FormControl>
										<Input
											placeholder="name@example.com"
											type="email"
											{...field}
											disabled={isPending || !isVerified}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Нууц үг */}
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Нууц үг</FormLabel>
									<FormControl>
										<Input
											placeholder="••••••••"
											type="password"
											{...field}
											disabled={isPending || !isVerified}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Нууц үг давтах */}
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Нууц үг давтах</FormLabel>
									<FormControl>
										<Input
											placeholder="••••••••"
											type="password"
											{...field}
											disabled={isPending || !isVerified}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full"
							disabled={isPending || !isVerified}
						>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isPending ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
						</Button>
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
