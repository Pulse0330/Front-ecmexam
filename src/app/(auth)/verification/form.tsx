import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const formSchema = z
	.object({
		lastname: z.string().min(1, { message: "Овог оруулна уу." }),
		firstname: z.string().min(1, { message: "Нэр оруулна уу." }),
		email: z.string().email({ message: "Хүчинтэй имэйл хаяг оруулна уу." }),
		phone: z
			.string()
			.min(8, { message: "Утасны дугаар 8 оронтой байх ёстой." })
			.regex(/^[0-9]+$/, { message: "Зөвхөн тоо оруулна уу." }),
		regnumber: z.string().min(10, { message: "Регистрийн дугаар оруулна уу." }),
		aimag: z.string().min(1, { message: "Аймаг сонгоно уу." }),
		sum: z.string().min(1, { message: "Сум сонгоно уу." }),
		school: z.string().min(1, { message: "Сургууль сонгоно уу." }),
		angi: z.string().min(1, { message: "Анги сонгоно уу." }),
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

export default function RegistrationForm() {
	const [isPending, setIsPending] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			lastname: "",
			firstname: "",
			email: "",
			phone: "",
			regnumber: "",
			aimag: "",
			sum: "",
			school: "",
			angi: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onSubmit",
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsPending(true);
		setSuccessMessage("");
		setErrorMessage("");

		try {
			const response = await fetch("/api/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(values),
			});

			const data = await response.json();

			if (response.ok) {
				setSuccessMessage("Амжилттай бүртгэгдлээ!");
				form.reset();
			} else {
				setErrorMessage(data?.message || "Бүртгэл үүсгэхэд алдаа гарлаа");
			}
		} catch (error) {
			console.error("Registration error:", error);
			setErrorMessage("Серверт холбогдоход алдаа гарлаа");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
			<CardHeader className="space-y-1">
				<div className="flex items-center gap-2">
					<CardTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400">
						SKUUL.MN
					</CardTitle>
					<span className="text-2xl">✌️</span>
				</div>
				<CardDescription className="font-medium">
					Та хувийн мэдээллээ бүртгүүлж баталгаажуулна уу
				</CardDescription>
			</CardHeader>

			<Form {...form}>
				<CardContent className="space-y-4">
					{/* Амжилт/Алдааны мэдэгдэл */}
					{successMessage && (
						<Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
							<AlertDescription className="text-green-800 dark:text-green-200">
								{successMessage}
							</AlertDescription>
						</Alert>
					)}

					{errorMessage && (
						<Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
							<AlertDescription className="text-red-800 dark:text-red-200">
								{errorMessage}
							</AlertDescription>
						</Alert>
					)}

					{/* Овог, Нэр */}
					<div className="grid grid-cols-2 gap-3">
						<FormField
							control={form.control}
							name="lastname"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Овог</FormLabel>
									<FormControl>
										<Input placeholder="ads" {...field} disabled={isPending} />
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
										<Input placeholder="Нэр" {...field} disabled={isPending} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* И-мэйл, Утасны дугаар */}
					<div className="grid grid-cols-2 gap-3">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>И-мэйл</FormLabel>
									<FormControl>
										<Input
											placeholder="sadadasdw@medle.mn"
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
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Утасны дугаар</FormLabel>
									<FormControl>
										<Input
											placeholder="88683329"
											type="tel"
											maxLength={8}
											{...field}
											disabled={isPending}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* РД */}
					<FormField
						control={form.control}
						name="regnumber"
						render={({ field }) => (
							<FormItem>
								<FormLabel>РД</FormLabel>
								<FormControl>
									<Input placeholder="РД" {...field} disabled={isPending} />
								</FormControl>
								<FormMessage />
								<p className="text-xs text-muted-foreground mt-1">
									Өөрийн ашигладаг и-мэйл хаяг, утасны дугаараа оруулна уу.
								</p>
							</FormItem>
						)}
					/>

					{/* Аймаг/Нийслэл, Сум/Дүүрэг */}
					<div className="grid grid-cols-2 gap-3">
						<FormField
							control={form.control}
							name="aimag"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Аймаг / Нийслэл</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger disabled={isPending}>
												<SelectValue placeholder="Хөвсгөл аймаг" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="ulaanbaatar">Улаанбаатар</SelectItem>
											<SelectItem value="huvsgul">Хөвсгөл аймаг</SelectItem>
											<SelectItem value="darkhan">Дархан-Уул</SelectItem>
											<SelectItem value="orkhon">Орхон</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="sum"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Сум / Дүүрэг</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger disabled={isPending}>
												<SelectValue placeholder="Ханх сум" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="khan-uul">Хан-Уул</SelectItem>
											<SelectItem value="bayangol">Баянгол</SelectItem>
											<SelectItem value="khankh">Ханх сум</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Сургууль, Анги */}
					<div className="grid grid-cols-2 gap-3">
						<FormField
							control={form.control}
							name="school"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Сургууль</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger disabled={isPending}>
												<SelectValue placeholder="Сонгоно уу" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="school1">1-р сургууль</SelectItem>
											<SelectItem value="school2">2-р сургууль</SelectItem>
											<SelectItem value="school3">3-р сургууль</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="angi"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Анги</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger disabled={isPending}>
												<SelectValue placeholder="Бүлэг" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="1a">1-А</SelectItem>
											<SelectItem value="1b">1-Б</SelectItem>
											<SelectItem value="2a">2-А</SelectItem>
											<SelectItem value="2b">2-Б</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Нууц үг, Нууц үг давтах */}
					<div className="grid grid-cols-2 gap-3">
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Нууц үг</FormLabel>
									<FormControl>
										<Input
											placeholder="Нууц үг"
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
											placeholder="Нууц үг"
											type="password"
											{...field}
											disabled={isPending}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Бүртгүүлэх товч */}
					<Button
						type="submit"
						className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
						disabled={isPending}
						onClick={(e) => {
							e.preventDefault();
							form.handleSubmit(handleSubmit)();
						}}
					>
						{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{isPending ? "Хадгалж байна..." : "ХАДГАЛАХ"}
					</Button>
				</CardContent>
			</Form>
		</Card>
	);
}
