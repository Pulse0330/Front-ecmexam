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
import { createSessionRequest, loginTokenRequest } from "@/lib/api";
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
												disabled={isPending}
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
												disabled={isPending}
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

							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{isPending ? "Нэвтэрч байна..." : "Нэвтрэх"}
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

				<CardFooter className="flex-col gap-4">
					<div className="relative w-full">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">Эсвэл</span>
						</div>
					</div>

					<button
						type="button"
						onClick={() => setOpen(true)}
						className="w-full flex flex-col items-center justify-center gap-1 px-6 py-4
              bg-gradient-to-r from-emerald-500 to-teal-600
              dark:from-emerald-600 dark:to-teal-700
              text-white rounded-xl hover:opacity-90 hover:-translate-y-0.5
              transition-all duration-300 shadow-lg cursor-pointer"
					>
						<span className="text-xs opacity-80">Шалгалтанд бүртгүүлэх</span>
						<span className="font-bold text-base">
							Монгол хэл бичгийн шалгалт
						</span>
					</button>
				</CardFooter>
			</Card>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold flex items-center gap-2">
							Монгол хэл бичгийн шалгалт
						</DialogTitle>
						<DialogDescription>
							Шалгалтанд бүртгүүлэхийн тулд мэдээллээ оруулна уу
						</DialogDescription>
					</DialogHeader>
					<UserCheckForm />
				</DialogContent>
			</Dialog>
		</>
	);
}
