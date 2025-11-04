// (auth)/sign/signForm.tsx
"use client";

import Link from "next/link";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);

    // Mock delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Sign up values:", values);
    toast.success("Амжилттай бүртгэгдлээ! Нэвтрэнэ үү.");
    setIsPending(false);
    router.push("/login");
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
                      disabled={isPending}
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
                      disabled={isPending}
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
                      disabled={isPending}
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
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
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
