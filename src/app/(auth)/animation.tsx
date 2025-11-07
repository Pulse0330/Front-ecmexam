"use client";

import {
	BookOpen,
	Clock,
	GraduationCap,
	Lightbulb,
	Lock,
	Pencil,
	Rocket,
	Star,
	TrendingUp,
	Trophy,
} from "lucide-react";
import Image from "next/image";

export default function LoginAnimation() {
	return (
		<>
			{/* Animated Background Blobs */}
			<div className="absolute inset-0">
				<div
					className="absolute top-[20%] left-[15%] h-96 w-96 rounded-full blur-3xl opacity-40 dark:opacity-25 bg-linear-to-r from-blue-400 to-cyan-400 dark:from-blue-500 dark:to-cyan-600"
					style={{ animation: "pulse 4s ease-in-out infinite" }}
				></div>
				<div
					className="absolute bottom-[25%] right-[20%] h-80 w-80 rounded-full blur-3xl opacity-45 dark:opacity-30 bg-linear-to-r from-purple-400 to-pink-400 dark:from-purple-500 dark:to-pink-600"
					style={{ animation: "float 7s ease-in-out infinite" }}
				></div>
				<div
					className="absolute top-[45%] left-[25%] h-64 w-64 rounded-full blur-3xl opacity-35 dark:opacity-20 bg-linear-to-r from-indigo-400 to-purple-400 dark:from-indigo-500 dark:to-purple-600"
					style={{ animation: "float 9s ease-in-out infinite 2s" }}
				></div>
				<div
					className="absolute bottom-[15%] left-[30%] h-72 w-72 rounded-full blur-3xl opacity-30 dark:opacity-15 bg-linear-to-r from-green-400 to-emerald-400 dark:from-green-500 dark:to-emerald-600"
					style={{ animation: "float 8s ease-in-out infinite 3s" }}
				></div>
			</div>

			{/* Floating Academic Icons */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Book Icon */}
				<BookOpen
					className="absolute top-[18%] left-[12%] w-16 h-16 opacity-25 dark:opacity-15 text-indigo-600 dark:text-indigo-400"
					style={{ animation: "float 6s ease-in-out infinite" }}
				/>

				{/* Graduation Cap */}
				<GraduationCap
					className="absolute top-[65%] left-[10%] w-20 h-20 opacity-25 dark:opacity-15 text-purple-600 dark:text-purple-400"
					style={{ animation: "float 7s ease-in-out infinite 1s" }}
				/>

				{/* Light Bulb */}
				<Lightbulb
					className="absolute top-[30%] right-[18%] w-16 h-16 opacity-25 dark:opacity-15 text-yellow-600 dark:text-yellow-400"
					style={{ animation: "float 5.5s ease-in-out infinite 2s" }}
				/>

				{/* Lock/Security */}
				<Lock
					className="absolute bottom-[28%] right-[25%] w-14 h-14 opacity-25 dark:opacity-15 text-green-600 dark:text-green-400"
					style={{ animation: "float 8s ease-in-out infinite 3s" }}
				/>

				{/* Trophy */}
				<Trophy
					className="absolute top-[50%] right-[15%] w-14 h-14 opacity-25 dark:opacity-15 text-amber-600 dark:text-amber-400"
					style={{ animation: "float 6.5s ease-in-out infinite 1.5s" }}
				/>

				{/* Pencil/Edit */}
				<Pencil
					className="absolute bottom-[20%] left-[20%] w-14 h-14 opacity-25 dark:opacity-15 text-blue-600 dark:text-blue-400"
					style={{ animation: "float 7.5s ease-in-out infinite 2.5s" }}
				/>

				{/* Chart/Progress */}
				<TrendingUp
					className="absolute top-[40%] left-[8%] w-14 h-14 opacity-25 dark:opacity-15 text-cyan-600 dark:text-cyan-400"
					style={{ animation: "float 6.8s ease-in-out infinite 1.8s" }}
				/>

				{/* Star/Achievement */}
				<Star
					className="absolute bottom-[40%] right-[12%] w-12 h-12 opacity-25 dark:opacity-15 text-pink-600 dark:text-pink-400"
					style={{ animation: "float 7.2s ease-in-out infinite 0.8s" }}
				/>

				{/* Clock/Time */}
				<Clock
					className="absolute top-[75%] right-[35%] w-12 h-12 opacity-25 dark:opacity-15 text-rose-600 dark:text-rose-400"
					style={{ animation: "float 8.3s ease-in-out infinite 2.2s" }}
				/>
			</div>

			{/* Main Content */}
			<div className="relative z-10 text-center space-y-6 max-w-md">
				<div
					className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-6 bg-white dark:bg-gray-800 shadow-2xl shadow-indigo-500/50 dark:shadow-purple-600/50 overflow-hidden p-3"
					style={{ animation: "pulse-scale 3s ease-in-out infinite" }}
				>
					<Image
						src="/image/ECM.png"
						alt="ECM Logo"
						width={88}
						height={88}
						className="object-contain"
						priority
						unoptimized
					/>
				</div>

				<h1
					className="text-5xl md:text-6xl font-black tracking-tight bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight"
					style={{ animation: "fadeInUp 1s ease-out" }}
				>
					Мэдлэгт хөтлөх гарц
				</h1>

				<p
					className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300"
					style={{ animation: "fadeInUp 1s ease-out 0.2s both" }}
				>
					Таны шалгалтын амжилт эндээс эхэлнэ.
				</p>

				{/* Feature Pills */}
				<div className="flex flex-wrap justify-center gap-3 pt-4">
					{[
						{
							icon: (
								<BookOpen className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
							),
							text: "Мэдлэг",
							gradient: "from-blue-500 to-cyan-500",
						},
						{
							icon: (
								<Trophy className="w-5 h-5 text-purple-600 dark:text-pink-400" />
							),
							text: "Амжилт",
							gradient: "from-purple-500 to-pink-500",
						},
						{
							icon: (
								<Rocket className="w-5 h-5 text-green-600 dark:text-emerald-400" />
							),
							text: "Хөгжил",
							gradient: "from-green-500 to-emerald-500",
						},
					].map((item, i) => (
						<div
							key={i}
							className="group relative flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-md bg-white/70 dark:bg-white/10 border-2 border-white/80 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
							style={{ animation: `slideUp 0.6s ease-out ${i * 0.15}s both` }}
						>
							<div
								className={`absolute inset-0 rounded-2xl bg-linear-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
							></div>

							{/* Icon + Text */}
							<span className="relative flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
								<span
									className="transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500"
									style={{
										animation: "floatIcon 3s ease-in-out infinite",
									}}
								>
									{item.icon}
								</span>
								{item.text}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* CSS Animations */}
			<style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(5deg);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-scale {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 40px rgba(99, 102, 241, 0.5);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 60px rgba(147, 51, 234, 0.7);
          }
        }
      `}</style>
		</>
	);
}
