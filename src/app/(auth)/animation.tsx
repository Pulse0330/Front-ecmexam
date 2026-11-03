"use client";

import { BookOpen, Rocket, Trophy } from "lucide-react";
import Image from "next/image";

// Брэндийн тайван самбар — нэвтрэх хуудасны зүүн тал (том дэлгэц)
export default function LoginAnimation() {
	return (
		<>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-[18%] left-[12%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute right-[12%] bottom-[18%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
			</div>

			<div className="relative z-10 max-w-md space-y-6 text-center">
				<div className="mb-2 inline-flex size-28 items-center justify-center overflow-hidden rounded-full border bg-card p-3 shadow-sm">
					<Image
						src="/image/logoLogin.png"
						alt="ECM лого"
						width={88}
						height={88}
						priority
						unoptimized
						style={{ width: "88px", height: "88px", objectFit: "contain" }}
					/>
				</div>

				<h1 className="text-4xl leading-tight font-bold tracking-tight text-foreground xl:text-5xl">
					Мэдлэгт хөтлөх гарц
				</h1>

				<p className="text-lg text-muted-foreground">
					Таны шалгалтын амжилт эндээс эхэлнэ.
				</p>

				<div className="flex flex-wrap justify-center gap-2 pt-2">
					{[
						{ icon: BookOpen, text: "Мэдлэг" },
						{ icon: Trophy, text: "Амжилт" },
						{ icon: Rocket, text: "Хөгжил" },
					].map((item) => (
						<span
							key={item.text}
							className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
						>
							<item.icon className="size-4 text-primary" />
							{item.text}
						</span>
					))}
				</div>
			</div>
		</>
	);
}
