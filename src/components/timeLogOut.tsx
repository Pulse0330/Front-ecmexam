"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deleteCookie } from "@/lib/cookie";
import { useAuthStore } from "@/stores/useAuthStore";
import Portal from "./portal";

const IDLE_TIMEOUT = 5 * 60 * 1000;

function clearTimers(
	idle: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
	tick: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
	if (idle.current) clearTimeout(idle.current);
	if (tick.current) clearTimeout(tick.current);
}

export default function IdleTimerProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [showWarning, setShowWarning] = useState(false);
	const [countdown, setCountdown] = useState(10);
	const pathname = usePathname();

	const isExcluded = pathname.startsWith("/exam/");

	const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const tickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isWarningVisible = useRef(false);
	const countRef = useRef(10);

	const doLogout = useCallback(() => {
		clearTimers(idleTimer, tickTimer);
		isWarningVisible.current = false;
		setShowWarning(false);

		try {
			useAuthStore.getState().clearAuth();
			localStorage.removeItem("auth-storage");
			deleteCookie("auth-token");
			deleteCookie("user-id");
		} catch (e) {
			console.error("Logout алдаа:", e);
		} finally {
			window.location.href = "/login?session=expired";
		}
	}, []);

	const tick = useCallback(() => {
		countRef.current -= 1;
		setCountdown(countRef.current);

		if (countRef.current <= 0) {
			doLogout();
			return;
		}

		tickTimer.current = setTimeout(tick, 1000);
	}, [doLogout]);

	const startCountdown = useCallback(() => {
		isWarningVisible.current = true;
		countRef.current = 10;
		setCountdown(10);
		setShowWarning(true);
		tickTimer.current = setTimeout(tick, 1000);
	}, [tick]);

	const resetTimer = useCallback(() => {
		if (isWarningVisible.current) {
			isWarningVisible.current = false;
			clearTimers(idleTimer, tickTimer);
			setShowWarning(false);
			setCountdown(10);
			countRef.current = 10;
		} else {
			if (idleTimer.current) clearTimeout(idleTimer.current);
		}
		idleTimer.current = setTimeout(startCountdown, IDLE_TIMEOUT);
	}, [startCountdown]);

	const _stayLoggedIn = useCallback(() => {
		isWarningVisible.current = false;
		clearTimers(idleTimer, tickTimer);
		setShowWarning(false);
		setCountdown(10);
		countRef.current = 10;
		idleTimer.current = setTimeout(startCountdown, IDLE_TIMEOUT);
	}, [startCountdown]);

	const { isAuthenticated } = useAuthStore();

	useEffect(() => {
		if (!isAuthenticated() || isExcluded) return;

		const events = [
			"mousemove",
			"mousedown",
			"keydown",
			"touchstart",
			"scroll",
			"click",
		];
		for (const e of events) window.addEventListener(e, resetTimer);
		idleTimer.current = setTimeout(startCountdown, IDLE_TIMEOUT);
		return () => {
			for (const e of events) window.removeEventListener(e, resetTimer);
			clearTimers(idleTimer, tickTimer);
		};
	}, [resetTimer, startCountdown, isAuthenticated, isExcluded]);

	return (
		<>
			{children}

			{showWarning && !isExcluded && (
				<Portal>
					<div className="fixed inset-0  flex items-center justify-center pointer-events-auto">
						<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-in fade-in zoom-in duration-200">
							<div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-amber-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Анхааруулга</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
									/>
								</svg>
							</div>
							<div className="relative w-20 h-20 mx-auto mb-4">
								<svg
									className="w-20 h-20 -rotate-90"
									viewBox="0 0 80 80"
									aria-hidden="true"
								>
									<title>Тоолуур</title>
									<circle
										cx="40"
										cy="40"
										r="34"
										stroke="currentColor"
										strokeWidth="6"
										fill="none"
										className="text-gray-200 dark:text-gray-700"
									/>
									<circle
										cx="40"
										cy="40"
										r="34"
										stroke="currentColor"
										strokeWidth="6"
										fill="none"
										strokeDasharray={`${2 * Math.PI * 34}`}
										strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 10)}`}
										className="text-amber-500 transition-all duration-1000"
										strokeLinecap="round"
									/>
								</svg>
								<span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800 dark:text-gray-100">
									{countdown}
								</span>
							</div>
							<h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
								Идэвхгүй байна
							</h2>
							<p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
								<span className="font-semibold text-amber-500">
									{countdown} секунд
								</span>
								-ын дараа автоматаар гарна.
							</p>
						</div>
					</div>
				</Portal>
			)}
		</>
	);
}
