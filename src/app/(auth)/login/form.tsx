"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createSessionRequest, loginToken, loginTokenRequest } from "@/lib/api";
import { setCookie } from "@/lib/cookie";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserCheckForm } from "./userCreatedialog";

const formSchema = z.object({
	username: z.string().min(1, { message: "Нэвтрэх нэр оруулна уу." }),
	password: z
		.string()
		.min(3, { message: "Нууц үг 3-аас доошгүй тэмдэгттэй байх ёстой." }),
});

type FormValues = z.infer<typeof formSchema>;

// Warning icon — тусдаа component болгон гарган авсан, re-render-д шинэ JSX node үүсгэхгүй
function WarningIcon() {
	return (
		<svg
			className="h-5 w-5 shrink-0 mt-0.5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<title>Warning</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>
	);
}

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get("redirect") || "/home";
	const tokenLogin = searchParams.get("token");
	// const uname = searchParams.get("uname");
	const { setUser, setToken } = useAuthStore();
	const [open, setOpen] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { username: "", password: "" },
		mode: "onSubmit",
	});

	// Session expired мэдэгдэл
	useEffect(() => {
		if (searchParams.get("session") === "expired") {
			toast.warning(
				"Та үйлдэл хийгээгүй 5 минут болсон байна. Дахин нэвтэрнэ үү.",
			);
		}
	}, [searchParams]);

	const { mutate, isPending } = useMutation({
		mutationFn: async (values: FormValues) => {
			const loginRes = await loginTokenRequest(
				values.username,
				values.password,
				"",
				"",
			);

			if (!loginRes?.RetResponse?.ResponseType) {
				throw new Error("Нэвтрэх нэр эсвэл нууц үг буруу байна");
			}
			if (!loginRes?.Data?.[0] || !loginRes.Token) {
				throw new Error("Та түр хүлээгээд дахин оролдоно уу");
			}

			const userData = loginRes.Data[0];
			const token = loginRes.Token;

			const sessionRes = await createSessionRequest(userData.id, token, "", "");
			if (!sessionRes?.RetResponse?.ResponseType) {
				throw new Error("Session үүсгэх амжилтгүй");
			}

			return { userData, token };
		},
		onSuccess: ({ userData, token }) => {
			setUser(userData);
			setToken(token);

			// Cookie-г нэг дор тохируулна
			const cookies: [string, string][] = [
				["auth-token", token],
				["user-id", String(userData.id)],
				["firstname", userData.firstname ?? ""],
				["img-url", userData.img_url ?? ""],
			];
			for (const [key, val] of cookies) {
				setCookie(key, val, 7);
			}
			const group = Number(userData.ugroup);

			if (group === 3 || group === 4) {
				router.push("/room");
			} else {
				if (userData.is_enabled === 0) {
					toast.info("Профайл мэдээллээ бөглөнө үү", {
						description:
							"Та профайл мэдээллээ бүрэн бөглөсний дараа системд нэвтрэх боломжтой болно.",
						duration: 5000,
					});
					router.push("/userProfile");
				} else {
					router.push(redirectUrl);
				}
			}
		},
		onError: (error: Error) => {
			form.setError("root", {
				type: "manual",
				message: error.message || "Нэвтрэх нэр эсвэл нууц үг буруу байна",
			});
			form.setValue("password", "");
			form.setFocus("password");
		},
	});

	const { mutate: tokenLoginMutate, isPending: tokenIsLoading } = useMutation({
		mutationFn: async ({ token1 }: { token1: string }) => {
			const loginRes = await loginToken(token1);

			if (!loginRes?.RetResponse?.ResponseType) {
				throw new Error("Нэвтрэх нэр эсвэл нууц үг буруу байна");
			}
			if (!loginRes?.Data?.[0] || !loginRes.Token) {
				throw new Error("Серверээс буруу хариу ирлээ");
			}

			const userData = loginRes.Data[0];
			const token = loginRes.Token;

			const sessionRes = await createSessionRequest(userData.id, token, "", "");
			if (!sessionRes?.RetResponse?.ResponseType) {
				throw new Error("Session үүсгэх амжилтгүй");
			}
			return { userData, token };
		},
		onSuccess: ({ userData, token }) => {
			setUser(userData);
			setToken(token);

			// Cookie-г нэг дор тохируулна
			const cookies: [string, string][] = [
				["auth-token", token],
				["user-id", String(userData.id)],
				["firstname", userData.firstname ?? ""],
				["img-url", userData.img_url ?? ""],
			];
			for (const [key, val] of cookies) {
				setCookie(key, val, 7);
			}
			const group = Number(userData.ugroup);

			if (group === 3 || group === 4) {
				router.push("/room");
			} else {
				if (userData.is_enabled === 0) {
					toast.info("Профайл мэдээллээ бөглөнө үү", {
						description:
							"Та профайл мэдээллээ бүрэн бөглөсний дараа системд нэвтрэх боломжтой болно.",
						duration: 5000,
					});
					router.push("/userProfile");
				} else {
					router.push(redirectUrl);
				}
			}
		},
		onError: (error: Error) => {
			form.setError("root", {
				type: "manual",
				message: error.message || "Нэвтрэх нэр эсвэл нууц үг буруу байна",
			});
			form.setValue("password", "");
			form.setFocus("password");
		},
	});

	useEffect(() => {
		if (tokenLogin) {
			// Энд аргументуудаа объект байдлаар илгээнэ
			tokenLoginMutate({ token1: tokenLogin });
		}
	}, [tokenLogin, tokenLoginMutate]);

	const onSubmit = (values: FormValues) => mutate(values);

	const hasRootError = !!form.formState.errors.root;
	const errorMessage = form.formState.errors.root?.message;

	return (
		<>
			<Card className="w-full max-w-sm bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-semibold">
						Тавтай морилно уу
					</CardTitle>
					<CardDescription>Өөрийн бүртгэлээр нэвтэрч орно уу</CardDescription>
				</CardHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent className="grid gap-4">
							{hasRootError && (
								<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-2 duration-300">
									<div className="flex items-start gap-2">
										<WarningIcon />
										<span className="flex-1">{errorMessage}</span>
									</div>
								</div>
							)}

							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Нэвтрэх нэр</FormLabel>
										<FormControl>
											<Input
												placeholder="Нэвтрэх нэр"
												type="text"
												autoComplete="username"
												disabled={isPending || tokenIsLoading}
												className={hasRootError ? "border-destructive/50 " : ""}
												{...field}
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
												placeholder="••••••••"
												type="password"
												autoComplete="current-password"
												disabled={isPending || tokenIsLoading}
												className={
													hasRootError
														? "border-destructive/50 animate-shake"
														: ""
												}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								className="w-full"
								disabled={isPending || tokenIsLoading}
							>
								{(isPending || tokenIsLoading) && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{isPending || tokenIsLoading ? "Нэвтэрч байна..." : "Нэвтрэх"}
							</Button>

							<Button
								asChild
								variant="link"
								className="ml-auto p-0 h-auto text-sm"
							>
								<Link href="/forgot">Нууц үг мартсан?</Link>
							</Button>
						</CardContent>
					</form>
				</Form>

				<CardFooter className="flex-col gap-3 px-6 pb-6 pt-2">
					{/* Заавар үзэх холбоос */}
					<a
						href="https://drive.google.com/file/d/11fuxxJGH8Y2E7maxcwy88WtiRL79iJHm/view?usp=sharing"
						target="_blank"
						rel="noopener noreferrer"
						className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
			bg-red-50 dark:bg-red-950/30
			border border-red-100 dark:border-red-900/50
			hover:bg-red-100 dark:hover:bg-red-900/40
			hover:border-red-200 dark:hover:border-red-800
			transition-all duration-200 group"
					>
						<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 shrink-0 group-hover:scale-105 transition-transform duration-200">
							<svg
								className="w-4 h-4 text-red-600 dark:text-red-400"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<title>External Link</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
								/>
							</svg>
						</div>
						<span className="text-sm font-medium text-red-700 dark:text-red-400 leading-tight">
							Монгол хэл, бичгийн шалгалт
							<br />
							<span className="font-semibold">бүртгүүлэх заавар үзэх →</span>
						</span>
					</a>

					{/* Бүртгүүлэх товч */}
					<button
						type="button"
						onClick={() => setOpen(true)}
						className="w-full flex items-center justify-between px-7 py-5
     bg-white border-2 border-emerald-500 rounded-2xl
     shadow-xl shadow-emerald-500/10 
     transition-all duration-300 cursor-pointer group"
					>
						<div className="flex flex-col items-start gap-0.5">
							<span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
								Монгол хэл , бичгийн шалгалт
							</span>
							<span className="text-base font-bold text-emerald-600 transition-colors">
								Бүртгүүлэх
							</span>
						</div>
						<div className="bg-emerald-500 p-2 rounded-full transition-colors">
							<svg
								className="w-5 h-5 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Arrow Right</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</div>
					</button>
				</CardFooter>
			</Card>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-h-screen sm:max-h-[85vh] p-0 overflow-hidden">
					<DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
						<DialogTitle className="text-xl font-bold">
							Монгол хэл , бичгийн шалгалт
						</DialogTitle>
						<DialogDescription>
							😇 Шалгалтад бүртгүүлэхийн тулд доорх мэдээллээ бөглөөрэй.
						</DialogDescription>
					</DialogHeader>
					<div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
						<UserCheckForm onClose={() => setOpen(false)} />
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
