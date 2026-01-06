"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
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
import { notifyNewLogin } from "@/hooks/use-SessionCheker"; // ===== НЭМЭХ =====
import { createSessionRequest, loginTokenRequest } from "@/lib/api";
import { setCookie } from "@/lib/cookie";
import { useAuthStore } from "@/stores/useAuthStore";

const formSchema = z.object({
	username: z.string().min(1, { message: "Нэвтрэх нэр оруулна уу." }),
	password: z
		.string()
		.min(3, { message: "Нууц үг 3-аас доошгүй тэмдэгттэй байх ёстой." }),
});

export function LoginForm() {
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get("redirect") || "/home";
	const { setUser, setToken } = useAuthStore();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { username: "", password: "" },
		mode: "onSubmit",
	});

	useEffect(() => {
		const sessionExpired = searchParams.get("session");
		if (sessionExpired === "expired") {
			toast.error("Таны session дууссан байна. Дахин нэвтэрнэ үү.");
		}
	}, [searchParams]);

	const { mutate, isPending } = useMutation({
		mutationFn: async (values: z.infer<typeof formSchema>) => {
			// 1. Login
			const loginRes = await loginTokenRequest(
				values.username,
				values.password,
				"",
				"",
			);

			if (
				!loginRes?.RetResponse?.ResponseType ||
				!loginRes?.Data?.[0] ||
				!loginRes.Token
			) {
				throw new Error(
					loginRes?.RetResponse?.ResponseMessage || "Нэвтрэх амжилтгүй",
				);
			}

			const userData = loginRes.Data[0];
			const token = loginRes.Token;

			// 2. CreateSession
			const sessionRes = await createSessionRequest(
				userData.id,
				token,
				"", // IP хоосон
				"", // Browser хоосон
			);

			if (!sessionRes?.RetResponse?.ResponseType) {
				throw new Error(
					sessionRes?.RetResponse?.ResponseMessage ||
						"Session үүсгэх амжилтгүй",
				);
			}

			return { userData, token };
		},
		onSuccess: ({ userData, token }) => {
			// Store-д хадгалах
			setUser(userData);
			setToken(token);

			// Cookies хадгалах
			setCookie("auth-token", token, 7);
			setCookie("user-id", userData.id.toString(), 7);

			// ===== ШИНЭ: Бусад tab-д шинэ login мэдэгдэх =====
			notifyNewLogin(userData.id);

			// Амжилттай мэдэгдэл
			toast.success("Амжилттай нэвтэрлээ");

			// Redirect
			setTimeout(() => {
				window.location.href = redirectUrl;
			}, 300);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Нэвтрэх үед алдаа гарлаа");
			form.setError("root", {
				type: "manual",
				message: "Нэвтрэх нэр эсвэл нууц үг буруу байна",
			});
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		mutate(values);
	};

	return (
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
						{form.formState.errors.root && (
							<div className="text-sm text-destructive">
								{form.formState.errors.root.message}
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
											placeholder="96216878"
											type="text"
											autoComplete="username"
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
											placeholder="••••••••"
											type="password"
											autoComplete="current-password"
											{...field}
											disabled={isPending}
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

				<p className="text-sm text-center text-muted-foreground">
					Бүртгэл байхгүй юу?{" "}
					<Button asChild variant="link" className="p-0 h-auto">
						<Link href="/sign">Бүртгүүлэх</Link>
					</Button>
				</p>
			</CardFooter>
		</Card>
	);
}
