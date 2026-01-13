"use client";

// Pre-generated static particles (same on server and client)
const PARTICLES = [
	{ id: 0, left: 12.5, top: 23.7, size: 2.3, duration: 18.2, delay: 1.2 },
	{ id: 1, left: 78.3, top: 45.1, size: 3.1, duration: 22.5, delay: 3.4 },
	{ id: 2, left: 34.8, top: 67.9, size: 1.8, duration: 15.7, delay: 0.8 },
	{ id: 3, left: 89.2, top: 12.4, size: 4.2, duration: 26.3, delay: 4.1 },
	{ id: 4, left: 56.7, top: 89.3, size: 2.7, duration: 19.8, delay: 2.3 },
	{ id: 5, left: 23.1, top: 34.6, size: 3.5, duration: 21.4, delay: 1.7 },
	{ id: 6, left: 91.4, top: 56.8, size: 1.5, duration: 17.9, delay: 3.9 },
	{ id: 7, left: 45.9, top: 78.2, size: 3.8, duration: 24.1, delay: 0.5 },
	{ id: 8, left: 67.3, top: 21.5, size: 2.1, duration: 16.6, delay: 2.8 },
	{ id: 9, left: 15.8, top: 92.7, size: 4.5, duration: 28.7, delay: 4.6 },
	{ id: 10, left: 82.6, top: 38.9, size: 1.9, duration: 14.3, delay: 1.1 },
	{ id: 11, left: 38.4, top: 64.2, size: 3.3, duration: 20.5, delay: 3.2 },
	{ id: 12, left: 71.9, top: 15.7, size: 2.6, duration: 23.8, delay: 0.9 },
	{ id: 13, left: 27.5, top: 81.4, size: 3.9, duration: 18.9, delay: 4.3 },
	{ id: 14, left: 94.2, top: 47.3, size: 1.4, duration: 25.6, delay: 2.1 },
	{ id: 15, left: 49.7, top: 29.8, size: 4.1, duration: 17.2, delay: 1.5 },
	// Add more particles as needed...
	{ id: 16, left: 8.3, top: 58.6, size: 2.9, duration: 21.7, delay: 3.7 },
	{ id: 17, left: 63.1, top: 73.9, size: 3.6, duration: 19.4, delay: 0.6 },
	{ id: 18, left: 19.6, top: 41.2, size: 1.7, duration: 24.9, delay: 2.9 },
	{ id: 19, left: 85.8, top: 19.5, size: 4.3, duration: 16.1, delay: 4.8 },
];

export default function AnimatedBackground() {
	return (
		<>
			<style jsx>{`
				@keyframes background-float {
					0%,
					100% {
						transform: translate(0, 0) scale(1);
						opacity: 0.3;
					}
					33% {
						transform: translate(30px, -30px) scale(1.1);
						opacity: 0.5;
					}
					66% {
						transform: translate(-20px, 20px) scale(0.9);
						opacity: 0.4;
					}
				}
			`}</style>

			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
				{/* Gradient Background */}
				<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:to-primary/5" />

				{/* Static Particles - No hydration mismatch */}
				{PARTICLES.map((particle) => (
					<div
						key={particle.id}
						className="absolute bg-foreground/10 dark:bg-white/20 rounded-full backdrop-blur-sm"
						style={{
							left: `${particle.left}%`,
							top: `${particle.top}%`,
							width: `${particle.size}px`,
							height: `${particle.size}px`,
							animation: `background-float ${particle.duration}s ease-in-out infinite`,
							animationDelay: `${particle.delay}s`,
						}}
					/>
				))}
			</div>
		</>
	);
}
