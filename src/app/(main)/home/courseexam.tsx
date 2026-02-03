import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UnifiedHeroSectionProps {
	username: string;
}

export default function UnifiedHeroSection({
	username,
}: UnifiedHeroSectionProps) {
	return (
		<div className="w-full">
			<div className="max-w-10xl   sm:px-6">
				{/* Main Container */}
				<div className="relative group overflow-hidden bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-500">
					{/* Subtle Background Pattern */}
					<div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.04),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.04),transparent_50%)]" />

					<div className="relative px-5 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 flex flex-col md:flex-row items-center justify-between gap-5 lg:gap-6">
						{/* Left Side - Welcome Section */}
						<div className="flex-1 space-y-2 sm:space-y-3 text-center md:text-left max-w-xl">
							{/* Main Title */}
							<div className="space-y-1">
								<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-light tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
									Сайн уу,{" "}
									<span className="font-medium text-zinc-600 dark:text-zinc-300">
										{username}
									</span>
								</h1>
								<p className="text-xs sm:text-sm lg:text-base text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-md mx-auto md:mx-0">
									Өнөөдөр шинэ зүйл сурч, ур чадвараа хөгжүүлэхэд бэлэн үү?
								</p>
							</div>

							{/* Decorative Line */}
							<div className="flex items-center gap-2 justify-center md:justify-start pt-0">
								<div className="h-px w-6 bg-linear-to-r from-transparent to-zinc-300 dark:to-zinc-700" />
								<span className="text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 font-light tracking-wide">
									24/7 суралцах хөгжих боломж
								</span>
								<div className="h-px w-6 bg-linear-to-l from-transparent to-zinc-300 dark:to-zinc-700" />
							</div>
						</div>

						{/* Right Side - Action Area */}
						<div className="flex flex-col items-center md:items-end gap-2.5 sm:gap-3 w-full md:w-auto">
							{/* Status Badge - Desktop */}

							{/* Main CTA Button */}
							<Link href="/Lists/paymentCoureList" className="w-full sm:w-auto">
								<Button className="w-full sm:min-w-[180px] h-10 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group shadow-md shadow-zinc-900/10 dark:shadow-zinc-50/5 border-0">
									<span className="flex items-center gap-2 font-medium text-sm tracking-wide">
										Сургалт авах
										<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
									</span>
								</Button>
							</Link>

							{/* Mobile Status - Shows on small screens */}
						</div>
					</div>

					{/* Bottom Accent Line */}
					<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent opacity-60" />

					{/* Corner Decoration */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-zinc-100/30 dark:from-zinc-900/30 to-transparent rounded-bl-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
				</div>
			</div>
		</div>
	);
}
