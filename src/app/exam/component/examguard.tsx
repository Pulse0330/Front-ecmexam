"use client";

import { AlertTriangle, Lock, Shield, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ExamProctorProps {
	onSubmit: () => void; // Автомат submit callback
	onLogout?: () => void; // Optional logout callback
	maxViolations?: number; // Default 3
	strictMode?: boolean; // Default true
	enableFullscreen?: boolean; // Default true
}

interface Violation {
	type: string;
	timestamp: Date;
	severity: "low" | "medium" | "high";
}

export const AdvancedExamProctor: React.FC<ExamProctorProps> = ({
	onSubmit,
	onLogout,
	maxViolations = 3,
	strictMode = true,
	enableFullscreen = true,
}) => {
	const [violations, setViolations] = useState<Violation[]>([]);
	const [blocked, setBlocked] = useState(false);
	const [dialogMessage, setDialogMessage] = useState<string | null>(null);
	const [blackScreen, setBlackScreen] = useState(false);
	const [mouseLeft, setMouseLeft] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const blockedRef = useRef<boolean>(false);
	const violationLockRef = useRef<boolean>(false);
	const mouseTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const onSubmitRef = useRef(onSubmit);
	const onLogoutRef = useRef(onLogout);

	useEffect(() => {
		onSubmitRef.current = onSubmit;
		onLogoutRef.current = onLogout;
	}, [onSubmit, onLogout]);

	// Mobile detection
	useEffect(() => {
		const checkMobile = () => {
			const mobile =
				/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
				window.innerWidth <= 768;
			setIsMobile(mobile);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// ========================
	// Violation Logger
	// ========================
	const logViolation = useCallback(
		(type: string, severity: "low" | "medium" | "high", message: string) => {
			if (blockedRef.current || violationLockRef.current) return;
			violationLockRef.current = true;

			const violation: Violation = {
				type,
				timestamp: new Date(),
				severity,
			};

			setTimeout(() => {
				setViolations((prev) => {
					const newViolations = [...prev, violation];
					const criticalCount = newViolations.filter(
						(v) => v.severity === "high",
					).length;

					if (criticalCount >= maxViolations) {
						blockedRef.current = true;

						setTimeout(() => {
							setBlocked(true);
							setDialogMessage(
								`🚫 Та ${maxViolations} удаа ноцтой дүрэм зөрчсөн тул шалгалт автоматаар дуусгагдана.`,
							);
							setBlackScreen(true);

							setTimeout(() => {
								onSubmitRef.current();
								onLogoutRef.current?.();
							}, 3000);
						}, 0);
					} else {
						setTimeout(() => {
							setDialogMessage(message);
							setBlackScreen(true);

							setTimeout(() => {
								setBlackScreen(false);
								setDialogMessage(null);
							}, 2000);
						}, 0);
					}

					return newViolations;
				});

				setTimeout(() => {
					violationLockRef.current = false;
				}, 1000);
			}, 0);
		},
		[maxViolations],
	);

	// ========================
	// Mobile & Desktop Protections
	// ========================
	useEffect(() => {
		if (!strictMode) return;

		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length > 1) {
				e.preventDefault();
				if (!blockedRef.current) {
					logViolation(
						"MULTI_TOUCH",
						"medium",
						"⚠️ Олон хуруу хэрэглэх хориотой!",
					);
				}
			}
		};

		let touchTimer: NodeJS.Timeout;
		const handleTouchStartTimer = (e: TouchEvent) => {
			touchTimer = setTimeout(() => {
				e.preventDefault();
				if (!blockedRef.current) {
					logViolation("LONG_PRESS", "medium", "⚠️ Удаан дарах хориотой!");
				}
			}, 500);
		};
		const handleTouchEnd = () => clearTimeout(touchTimer);

		// Clipboard
		const handleCopy = (e: ClipboardEvent) => {
			e.preventDefault();
			if (!blockedRef.current)
				logViolation("COPY_ATTEMPT", "medium", "⚠️ Хуулах хориотой!");
		};
		const handleCut = (e: ClipboardEvent) => {
			e.preventDefault();
			if (!blockedRef.current)
				logViolation("CUT_ATTEMPT", "medium", "⚠️ Таслах хориотой!");
		};
		const handlePaste = (e: ClipboardEvent) => {
			e.preventDefault();
			if (!blockedRef.current)
				logViolation("PASTE_ATTEMPT", "medium", "⚠️ Буулгах хориотой!");
		};

		const handleSelectStart = (e: Event) => e.preventDefault();
		const handleDragStart = (e: DragEvent) => {
			e.preventDefault();
			if (!blockedRef.current)
				logViolation("DRAG_ATTEMPT", "low", "⚠️ Drag хийх хориотой!");
		};

		const handleOrientationChange = () => {
			if (!blockedRef.current && isMobile) {
				logViolation(
					"ORIENTATION_CHANGE",
					"medium",
					"⚠️ Утасны чиглэл өөрчлөгдсөн!",
				);
			}
		};

		const handleBeforePrint = (e: Event) => {
			e.preventDefault();
			if (!blockedRef.current)
				logViolation("PRINT_ATTEMPT", "high", "⚠️ Хэвлэх хориотой!");
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === "PrintScreen") {
				if (!blockedRef.current)
					logViolation(
						"SCREENSHOT_ATTEMPT",
						"high",
						"⚠️ Дэлгэцийн зураг авах оролдлого!",
					);
			}
		};

		document.addEventListener("touchstart", handleTouchStart, {
			passive: false,
		});
		document.addEventListener("touchstart", handleTouchStartTimer);
		document.addEventListener("touchend", handleTouchEnd);
		document.addEventListener("copy", handleCopy);
		document.addEventListener("cut", handleCut);
		document.addEventListener("paste", handlePaste);
		document.addEventListener("selectstart", handleSelectStart);
		document.addEventListener("dragstart", handleDragStart);
		document.addEventListener("keyup", handleKeyUp);
		window.addEventListener("orientationchange", handleOrientationChange);
		window.addEventListener("beforeprint", handleBeforePrint);

		const bodyStyle = document.body.style as CSSStyleDeclaration & {
			webkitUserSelect?: string;
			webkitTouchCallout?: string;
			mozUserSelect?: string;
			msUserSelect?: string;
		};
		bodyStyle.userSelect = "none";
		bodyStyle.webkitUserSelect = "none";
		bodyStyle.webkitTouchCallout = "none";
		bodyStyle.mozUserSelect = "none";
		bodyStyle.msUserSelect = "none";

		return () => {
			document.removeEventListener("touchstart", handleTouchStart);
			document.removeEventListener("touchstart", handleTouchStartTimer);
			document.removeEventListener("touchend", handleTouchEnd);
			document.removeEventListener("copy", handleCopy);
			document.removeEventListener("cut", handleCut);
			document.removeEventListener("paste", handlePaste);
			document.removeEventListener("selectstart", handleSelectStart);
			document.removeEventListener("dragstart", handleDragStart);
			document.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("orientationchange", handleOrientationChange);
			window.removeEventListener("beforeprint", handleBeforePrint);

			bodyStyle.userSelect = "";
			bodyStyle.webkitUserSelect = "";
			bodyStyle.webkitTouchCallout = "";
			bodyStyle.mozUserSelect = "";
			bodyStyle.msUserSelect = "";
		};
	}, [logViolation, strictMode, isMobile]);

	// ========================
	// DevTools Blocker
	// ========================
	useEffect(() => {
		if (!strictMode) return;

		const handleContextMenu = (e: MouseEvent) => {
			e.preventDefault();
			if (!blockedRef.current)
				logViolation("CONTEXT_MENU", "medium", "⚠️ Баруун товчлуур хориглосон!");
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === "F12" ||
				(e.ctrlKey &&
					e.shiftKey &&
					["I", "J", "C"].includes(e.key.toUpperCase())) ||
				(e.ctrlKey && ["u", "s"].includes(e.key.toLowerCase()))
			) {
				e.preventDefault();
				if (!blockedRef.current)
					logViolation(
						"DEVTOOLS_ATTEMPT",
						"high",
						"⚠️ DevTools нээх оролдлого илрүүлсэн!",
					);
			}
		};

		document.addEventListener("contextmenu", handleContextMenu);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("contextmenu", handleContextMenu);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [logViolation, strictMode]);

	// ========================
	// Tab & Visibility Detection
	// ========================
	useEffect(() => {
		if (!strictMode) return;

		let isUserInteracting = false;
		let lastFocusTime = Date.now();

		const handleFocus = () => {
			isUserInteracting = true;
			lastFocusTime = Date.now();
		};
		const handleBlur = () => {
			if (
				isUserInteracting &&
				Date.now() - lastFocusTime > 1000 &&
				!blockedRef.current
			) {
				logViolation(
					"TAB_SWITCH",
					"high",
					`⚠️ Өөр ${isMobile ? "апп" : "цонх"} руу шилжсэн байна`,
				);
			}
			isUserInteracting = false;
		};
		const handleVisibilityChange = () => {
			if (document.hidden && isUserInteracting && !blockedRef.current) {
				logViolation(
					"TAB_HIDDEN",
					"high",
					`⚠️ Шалгалтын ${isMobile ? "апп" : "цонх"} нуугдсан байна`,
				);
			}
		};

		window.addEventListener("focus", handleFocus);
		window.addEventListener("blur", handleBlur);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.removeEventListener("focus", handleFocus);
			window.removeEventListener("blur", handleBlur);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [logViolation, strictMode, isMobile]);

	// ========================
	// Mouse Leave Detection
	// ========================
	useEffect(() => {
		if (!strictMode || isMobile) return;

		const handleMouseLeave = () => {
			setMouseLeft(true);
			if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
			mouseTimeoutRef.current = setTimeout(() => {
				if (!blockedRef.current)
					logViolation(
						"MOUSE_LEFT",
						"medium",
						"⚠️ Хулгана шалгалтын цонхноос 3 секунд гарсан байна!",
					);
			}, 3000);
		};
		const handleMouseEnter = () => {
			setMouseLeft(false);
			if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
		};

		document.addEventListener("mouseleave", handleMouseLeave);
		document.addEventListener("mouseenter", handleMouseEnter);

		return () => {
			document.removeEventListener("mouseleave", handleMouseLeave);
			document.removeEventListener("mouseenter", handleMouseEnter);
			if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
		};
	}, [logViolation, strictMode, isMobile]);

	// ========================
	// Fullscreen Lock
	// ========================
	useEffect(() => {
		if (!enableFullscreen || !strictMode || isMobile) return;

		let hasUserInteracted = false;

		const enterFullscreen = async () => {
			if (document.fullscreenElement) return;
			try {
				await document.documentElement.requestFullscreen();
				hasUserInteracted = true;
			} catch {}
		};

		const handleFullscreenChange = () => {
			if (
				!document.fullscreenElement &&
				hasUserInteracted &&
				!blockedRef.current
			) {
				logViolation(
					"FULLSCREEN_EXIT",
					"high",
					"⚠️ Fullscreen горимоос гарсан байна!",
				);
				setTimeout(enterFullscreen, 1000);
			}
		};

		const handleUserInteraction = () => !hasUserInteracted && enterFullscreen();

		document.addEventListener("click", handleUserInteraction, { once: true });
		document.addEventListener("keydown", handleUserInteraction, { once: true });
		document.addEventListener("touchstart", handleUserInteraction, {
			once: true,
		});
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		const initialTimeout = setTimeout(enterFullscreen, 500);

		return () => {
			clearTimeout(initialTimeout);
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
			document.removeEventListener("click", handleUserInteraction);
			document.removeEventListener("keydown", handleUserInteraction);
			document.removeEventListener("touchstart", handleUserInteraction);
			if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		};
	}, [logViolation, strictMode, enableFullscreen, isMobile]);

	const criticalViolations = violations.filter(
		(v) => v.severity === "high",
	).length;

	return (
		<>
			{/* Black screen overlay */}
			{blackScreen && (
				<div className="fixed inset-0 bg-black flex items-center justify-center pointer-events-auto">
					<div className="text-white text-center space-y-4 p-6">
						<AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-red-500 animate-pulse" />
						<h1 className="text-2xl sm:text-4xl font-bold">
							{blocked ? "🚫 Шалгалт дууссан!" : "⚠️ Анхааруулга"}
						</h1>
						<p className="text-base sm:text-xl max-w-md mx-auto">
							{dialogMessage}
						</p>
						{blocked && (
							<p className="text-xs sm:text-sm text-gray-400 mt-4">
								Шалгалт автоматаар дуусгагдаж байна...
							</p>
						)}
					</div>
				</div>
			)}

			{/* Bottom alerts */}
			<div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 space-y-2 max-w-[90vw] sm:max-w-none pointer-events-none">
				<Alert
					variant={
						criticalViolations >= maxViolations - 1 ? "destructive" : "default"
					}
					className="w-56 sm:w-64 shadow-lg pointer-events-auto"
				>
					<Shield className="h-3 w-3 sm:h-4 sm:w-4" />
					<AlertDescription>
						<div className="font-semibold text-xs sm:text-sm">
							Ноцтой зөрчил: {criticalViolations}/{maxViolations}
						</div>
						{criticalViolations > 0 && criticalViolations < maxViolations && (
							<div className="text-orange-600 dark:text-orange-400 font-medium text-xs mt-1">
								⚠️ Дахиад {maxViolations - criticalViolations} зөрчил үлдсэн!
							</div>
						)}
						{blocked && (
							<div className="text-red-600 dark:text-red-400 font-bold text-xs sm:text-sm mt-1">
								🚫 Шалгалт хаагдсан!
							</div>
						)}
					</AlertDescription>
				</Alert>

				{mouseLeft && strictMode && !isMobile && (
					<Alert
						variant="destructive"
						className="w-56 sm:w-64 shadow-lg animate-pulse pointer-events-auto"
					>
						<AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
						<AlertDescription>
							<div className="text-xs font-semibold">
								⚠️ Хулгана цонхноос гарсан байна!
							</div>
						</AlertDescription>
					</Alert>
				)}

				{/* Protection status */}
				<div className="bg-card border rounded-lg p-2 sm:p-3 w-56 sm:w-64 text-xs space-y-1.5 shadow-lg pointer-events-auto">
					<div className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2">
						{isMobile && <Smartphone className="w-3 h-3" />} Хамгаалалтын төлөв
					</div>
					{!isMobile && enableFullscreen && (
						<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
							<Lock className="w-3 h-3" />
							<span>Fullscreen идэвхтэй</span>
						</div>
					)}
					<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
						<Shield className="w-3 h-3" />
						<span>Хамгаалалт идэвхтэй</span>
					</div>
					{isMobile && (
						<div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
							<Smartphone className="w-3 h-3" />
							<span>Мобайл горим</span>
						</div>
					)}
				</div>
			</div>

			{/* Development violation log */}
			{process.env.NODE_ENV === "development" && violations.length > 0 && (
				<div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 bg-card border rounded-lg p-2 sm:p-3 max-w-[90vw] sm:max-w-sm max-h-48 sm:max-h-64 overflow-auto text-xs z-50 shadow-lg">
					<div className="font-bold mb-2 flex items-center justify-between">
						<span>Зөрчлийн түүх ({violations.length})</span>
						<Button
							onClick={() => setViolations([])}
							variant="ghost"
							size="sm"
							className="text-red-500 hover:text-red-700 text-xs h-auto py-1 px-2"
						>
							Цэвэрлэх
						</Button>
					</div>
					{violations.map((v) => (
						<div
							key={`${v.type}-${v.timestamp.getTime()}`}
							className="mb-1 text-xs py-1 border-b last:border-0"
						>
							<span
								className={
									v.severity === "high"
										? "text-red-600 font-bold"
										: v.severity === "medium"
											? "text-orange-600 font-medium"
											: "text-gray-600"
								}
							>
								[{v.severity.toUpperCase()}]
							</span>{" "}
							{v.type} - {v.timestamp.toLocaleTimeString("mn-MN")}
						</div>
					))}
				</div>
			)}
		</>
	);
};
