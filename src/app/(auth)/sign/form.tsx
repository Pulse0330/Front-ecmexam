"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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
import {
	getGeneratedCodeWithValidation,
	verifyOTPWithValidation,
} from "@/lib/api";

const formSchema = z
	.object({
		phone: z
			.string()
			.min(8, { message: "Утасны дугаар 8 оронтой байх ёстой." })
			.regex(/^[0-9]+$/, { message: "Зөвхөн тоо оруулна уу." }),
		otp: z
			.string()
			.length(6, { message: "Баталгаажуулах код 6 оронтой байх ёстой." }),
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

export function SignForm() {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [isOTPSent, setIsOTPSent] = useState(false);
	const [isOTPVerified, setIsOTPVerified] = useState(false);
	const [isSendingOTP, setIsSendingOTP] = useState(false);
	const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
	const [countdown, setCountdown] = useState(0);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			phone: "",
			otp: "",
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onSubmit",
	});

	// Start countdown timer
	const startCountdown = () => {
		setCountdown(180); // 3 minutes
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	// Send OTP
	const handleSendOTP = async () => {
		const phone = form.getValues("phone");

		// Validate phone number
		const phoneValidation = await form.trigger("phone");
		if (!phoneValidation) {
			return;
		}

		setIsSendingOTP(true);

		try {
			const response = await getGeneratedCodeWithValidation(
				Number(phone),
				"1",
				"ikh_skuul.mn",
			);

			if (response.RetResponse.ResponseType) {
				toast.success(response.RetResponse.ResponseMessage);
				setIsOTPSent(true);
				startCountdown();
			} else {
				toast.error(response.RetResponse.ResponseMessage);
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Код илгээхэд алдаа гарлаа",
			);
		} finally {
			setIsSendingOTP(false);
		}
	};

	// Verify OTP
	const handleVerifyOTP = async () => {
		const phone = form.getValues("phone");
		const otp = form.getValues("otp");

		// Validate OTP field
		const otpValidation = await form.trigger("otp");
		if (!otpValidation) {
			return;
		}

		setIsVerifyingOTP(true);

		try {
			const response = await verifyOTPWithValidation(
				Number(phone),
				Number(otp),
			);

			if (response.RetResponse.ResponseType) {
				toast.success("Утасны дугаар баталгаажлаа!");
				setIsOTPVerified(true);
				// Store token if needed
				// localStorage.setItem("authToken", response.RetResponse.ResponseToken);
			} else {
				toast.error(response.RetResponse.ResponseMessage);
			}
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Баталгаажуулахад алдаа гарлаа",
			);
		} finally {
			setIsVerifyingOTP(false);
		}
	};

	// Final submission
	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (!isOTPVerified) {
			toast.error("Эхлээд утасны дугаараа баталгаажуулна уу!");
			return;
		}

		setIsPending(true);

		try {
			// TODO: Add your actual sign-up API call here
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

	// Format countdown timer
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
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
						{/* Phone Number */}
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
												disabled={isPending || isOTPVerified}
												maxLength={8}
											/>
										</FormControl>
										<Button
											type="button"
											onClick={handleSendOTP}
											disabled={isSendingOTP || isOTPVerified || countdown > 0}
											variant="outline"
											className="whitespace-nowrap"
										>
											{isSendingOTP && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											{countdown > 0
												? formatTime(countdown)
												: isOTPSent
													? "Дахин илгээх"
													: "Код авах"}
										</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* OTP Code */}
						{isOTPSent && !isOTPVerified && (
							<FormField
								control={form.control}
								name="otp"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Баталгаажуулах код</FormLabel>
										<div className="flex gap-2">
											<FormControl>
												<Input
													placeholder="******"
													type="text"
													{...field}
													disabled={isPending || isVerifyingOTP}
													maxLength={6}
												/>
											</FormControl>
											<Button
												type="button"
												onClick={handleVerifyOTP}
												disabled={isVerifyingOTP}
												variant="outline"
											>
												{isVerifyingOTP && (
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												)}
												Шалгах
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Success message */}
						{isOTPVerified && (
							<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
								<p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
									✓ Утасны дугаар баталгаажлаа
								</p>
							</div>
						)}

						{/* Username */}
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
											disabled={isPending || !isOTPVerified}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Email */}
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
											disabled={isPending || !isOTPVerified}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Password */}
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
											disabled={isPending || !isOTPVerified}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Confirm Password */}
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
											disabled={isPending || !isOTPVerified}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="w-full"
							disabled={isPending || !isOTPVerified}
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
