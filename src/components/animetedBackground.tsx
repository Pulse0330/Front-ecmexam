"use client";

import { memo, useEffect, useRef, useState } from "react";

const PARTICLE_COUNT = 15;

interface Particle {
	id: number;
	x: number;
	y: number;
	size: number;
	duration: number;
	delay: number;
}

function generateParticles(): Particle[] {
	return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
		id: i,
		x: Math.random() * 100,
		y: Math.random() * 100,
		size: Math.random() * 3 + 1,
		duration: Math.random() * 20 + 15,
		delay: Math.random() * 5,
	}));
}

const AnimatedBackground = memo(() => {
	const rafRef = useRef<number>(0);
	// SSR-д null → client mount болсны дараа л particles үүснэ → hydration mismatch байхгүй
	const [particles, setParticles] = useState<Particle[] | null>(null);

	useEffect(() => {
		setParticles(generateParticles());
	}, []);

	useEffect(() => {
		const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
		if (!isDesktop) return;

		const root = document.querySelector<HTMLElement>(".animated-bg-root");
		if (!root) return;

		const onMouseMove = (e: MouseEvent) => {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = requestAnimationFrame(() => {
				const x = (e.clientX / window.innerWidth - 0.5) * 20;
				const y = (e.clientY / window.innerHeight - 0.5) * 20;
				root.style.setProperty("--mouse-x", `${x}px`);
				root.style.setProperty("--mouse-y", `${y}px`);
			});
		};

		window.addEventListener("mousemove", onMouseMove, { passive: true });
		return () => {
			window.removeEventListener("mousemove", onMouseMove);
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<div className="fixed inset-0 pointer-events-none animated-bg-root">
			<div className="absolute inset-0">
				<div className="absolute top-0 left-1/4 w-[min(400px,40vw)] h-[min(400px,40vw)] bg-linear-to-r from-violet-500/20 to-purple-500/20 dark:from-violet-600/30 dark:to-purple-600/30 rounded-full blur-3xl animate-pulse orb-move" />
				<div className="absolute bottom-0 right-1/4 w-[min(350px,35vw)] h-[min(350px,35vw)] bg-linear-to-r from-pink-500/20 to-rose-500/20 dark:from-pink-600/30 dark:to-rose-600/30 rounded-full blur-3xl animate-pulse orb-move-reverse" />
				<div className="absolute top-1/2 left-1/2 w-[min(300px,30vw)] h-[min(300px,30vw)] bg-linear-to-r from-blue-500/15 to-cyan-500/15 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full blur-3xl animate-pulse orb-move-slow" />
			</div>

			{/* particles зөвхөн client mount болсны дараа render → SSR-д хоосон */}
			{particles && (
				<div className="hidden sm:block">
					{particles.map((particle) => (
						<div
							key={particle.id}
							className="absolute bg-foreground/10 dark:bg-white/20 rounded-full will-change-transform"
							style={{
								left: `${particle.x}%`,
								top: `${particle.y}%`,
								width: `${particle.size}px`,
								height: `${particle.size}px`,
								animation: `float ${particle.duration}s ease-in-out infinite`,
								animationDelay: `${particle.delay}s`,
							}}
						/>
					))}
				</div>
			)}

			<div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size:100px_100px mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)] grid-move" />
		</div>
	);
});

AnimatedBackground.displayName = "AnimatedBackground";

export default AnimatedBackground;
