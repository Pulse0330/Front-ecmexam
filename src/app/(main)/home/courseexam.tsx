import {
	ArrowRight,
	Award,
	Crown,
	Lock,
	Sparkles,
	Target,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FLOATING_ICONS = [
	{ id: "award", Icon: Award, color: "text-amber-400", delay: 0 },
	{ id: "target", Icon: Target, color: "text-emerald-400", delay: 1 },
	{ id: "trending", Icon: TrendingUp, color: "text-blue-400", delay: 2 },
];

interface UnifiedHeroSectionProps {
	username: string;
}

export default function UnifiedHeroSection({
	username,
}: UnifiedHeroSectionProps) {
	return (
		<div className="animate-in fade-in-0 slide-in-from-top-4 duration-1000">
			<div className="relative group max-w-7xl mx-auto">
				{/* Glow Effect */}
				<div className="absolute -inset-1 bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

				<div className="relative bg-linear-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-2xl rounded-2xl border border-border shadow-2xl overflow-hidden">
					{/* Content Container - py-6 болгож өндрийг багасгав */}
					<div className="relative p-6 sm:px-8 lg:px-12 lg:py-8">
						{/* Floating Icons - Байрлалыг илүү цэгцтэй болгов */}
						<div className="absolute top-4 right-6 flex gap-3 opacity-30 group-hover:opacity-60 transition-opacity">
							{FLOATING_ICONS.map(({ id, Icon, color, delay }) => (
								<div
									key={id}
									className={`${color} animate-float cursor-pointer`}
									style={{ animationDelay: `${delay}s` }}
								>
									<Icon className="w-5 h-5 drop-shadow-lg" />
								</div>
							))}
						</div>

						{/* Main Layout - justify-between ашиглан хоёр тийш шахав */}
						<div className="flex flex-col lg:flex-row gap-6 lg:gap-0 items-center justify-between">
							{/* Left Section - Greeting */}
							<div className="space-y-3 flex-1 text-center lg:text-left">
								<div className="space-y-1">
									<div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
										<h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-linear-to-r from-foreground via-purple-600 to-pink-600 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
											Сайн уу, {username}
										</h1>
										<span className="text-2xl sm:text-3xl lg:text-4xl animate-wave">
											👋
										</span>
									</div>

									<p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-medium max-w-md">
										Таны амжилтын замд бид хамт байх болно
									</p>
								</div>

								{/* Motivational Quote - Нягтаршилтай болгосон */}

								<div className="flex items-center gap-2 justify-center lg:justify-start">
									<p className="text-muted-foreground italic text-[11px] sm:text-xs">
										24/7 суралцах, хөгжих боломж
									</p>
								</div>
							</div>

							{/* Right Section - Premium Info */}
							<div className="relative w-full lg:w-auto">
								{/* Subtle glow effect */}
								<div className="absolute -inset-1 bg-linear-to-r from-purple-500/20 via-violet-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-60" />

								<div className="relative flex flex-row items-center gap-6 bg-linear-to-br from-secondary/40 via-secondary/30 to-secondary/40 dark:from-purple-950/20 dark:via-violet-950/15 dark:to-purple-900/20 p-5 sm:p-6 rounded-2xl border border-purple-500/30 dark:border-purple-500/20 backdrop-blur-md lg:min-w-[420px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-purple-500/50">
									{/* Lock Icon */}
									<div className="relative shrink-0">
										<div className="absolute  bg-purple-500/20 blur-lg rounded-full" />
										<div className="relative w-16 h-16 rounded-xl bg-linear-to-br from-purple-500/90 via-violet-500/90 to-purple-600/90 flex items-center justify-center shadow-lg border border-white/10">
											<Lock className="w-7 h-7 text-white" strokeWidth={2} />
										</div>
										<div className="absolute -top-1 -right-1 bg-linear-to-br from-purple-400 to-violet-500 rounded-lg p-1.5 shadow-lg animate-bounce">
											<Crown className="w-3.5 h-3.5 text-white" />
										</div>
									</div>

									{/* CTA Content */}
									<div className="flex flex-col gap-3 flex-1 text-left">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
												<h4 className="text-base font-bold text-foreground">
													Төлбөртэй хи
												</h4>
											</div>
											<p className="text-xs text-muted-foreground font-medium">
												Мэргэжлийн түвшний сургалтууд
											</p>
										</div>
										<Link href="/Lists/paymentCoureList" className="w-full">
											<Button
												size="sm"
												className="w-full h-10 bg-linear-to-r from-purple-500/90 via-violet-500/90 to-purple-600/90 hover:from-purple-500 hover:via-violet-500 hover:to-purple-600 text-white font-semibold shadow-md hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 border-0 text-sm relative overflow-hidden group"
											>
												{/* Shine effect */}
												<span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

												{/* Button text with icon */}
												<span className="relative flex items-center justify-center gap-2 group-hover:scale-105 transition-transform duration-200">
													<span>Сургалт авах</span>
													<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
												</span>

												{/* Ripple effect on hover */}
												<span className="absolute inset-0 rounded-md border-2 border-white/0 group-hover:border-white/30 group-hover:scale-105 transition-all duration-300" />
											</Button>
										</Link>
									</div>
								</div>
							</div>
						</div>

						{/* Decorative Elements */}
						<div className="absolute bottom-0 right-0 w-32 h-32 bg-linear-to-tl from-purple-500/5 to-transparent rounded-tl-full pointer-events-none" />
						<div className="absolute top-0 left-0 w-24 h-24 bg-linear-to-br from-pink-500/5 to-transparent rounded-br-full pointer-events-none" />
					</div>
				</div>
			</div>

			<style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                
                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(20deg); }
                    75% { transform: rotate(-20deg); }
                }

                .animate-wave {
                    animation: wave 2s ease-in-out infinite;
                    display: inline-block;
                    transform-origin: 70% 70%;
                }

                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
		</div>
	);
}
