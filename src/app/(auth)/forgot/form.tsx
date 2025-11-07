// (auth)/forgot/forgotForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
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

const formSchema = z.object({
	email: z.string().email({ message: "Хүчинтэй имэйл хаяг оруулна уу." }),
});

export default function ForgotForm() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
		mode: "onSubmit",
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsPending(true);

		await new Promise((resolve) => setTimeout(resolve, 2000));

		console.log("Forgot password email:", values.email);
		setIsSubmitted(true);
		toast.success("Нууц үг сэргээх линк таны имэйл рүү илгээгдлээ");
		setIsPending(false);
	};

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
						Имэйл илгээгдлээ
					</CardTitle>
					<CardDescription className="text-center">
						Нууц үг сэргээх заавар таны имэйл хаяг руу илгээгдлээ. Имэйлээ
						шалгана уу.
					</CardDescription>
				</CardHeader>

				<CardFooter className="flex flex-col gap-4">
					<Button asChild className="w-full" variant="outline">
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
				<CardDescription>Бүртгэлтэй имэйл хаягаа оруулна уу</CardDescription>
			</CardHeader>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className="grid gap-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Имэйл хаяг</FormLabel>
									<FormControl>
										<Input
											placeholder="name@example.com"
											type="email"
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
							{isPending ? "Илгээж байна..." : "Сэргээх линк илгээх"}
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
