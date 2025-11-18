"use client";

import { AlertTriangle, Eye, Lock, Shield, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ExamProctorProps {
	onSubmit: () => void;
	onLogout?: () => void;
	maxViolations?: number;
	enableWebcam?: boolean;
	strictMode?: boolean;
	enableFullscreen?: boolean;
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
	enableWebcam = false,
	strictMode = true,
	enableFullscreen = true,
}) => {
	const [violations, setViolations] = useState<Violation[]>([]);
	const [blocked, setBlocked] = useState(false);
	const [dialogMessage, setDialogMessage] = useState<string | null>(null);
	const [blackScreen, setBlackScreen] = useState(false);
	const [webcamActive, setWebcamActive] = useState(false);
	const [mouseLeft, setMouseLeft] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const blockedRef = useRef<boolean>(false);
	const violationLockRef = useRef<boolean>(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const mouseTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	const onSubmitRef = useRef(onSubmit);
	const onLogoutRef = useRef(onLogout);

	useEffect(() => {
		onSubmitRef.current = onSubmit;
		onLogoutRef.current = onLogout;
	}, [onSubmit, onLogout]);

	// Detect mobile device
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
	// 📱 Mobile & Desktop Protection
	// ========================
	useEffect(() => {
		if (!strictMode) return;

		// Long press хориглох (context menu mobile дээр)
		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length > 1) {
				// Multi-touch илрүүлэх
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

		const handleTouchHold = (e: TouchEvent) => {
			e.preventDefault();
			if (!blockedRef.current) {
				logViolation("LONG_PRESS", "medium", "⚠️ Удаан дарах хориотой!");
			}
		};

		let touchTimer: NodeJS.Timeout;
		const handleTouchStartTimer = (e: TouchEvent) => {
			touchTimer = setTimeout(() => handleTouchHold(e), 500);
		};

		const handleTouchEnd = () => {
			clearTimeout(touchTimer);
		};

		// Copy, Cut, Paste хориглох (Mobile & Desktop)
		const handleCopy = (e: ClipboardEvent) => {
			e.preventDefault();
			if (!blockedRef.current) {
				logViolation("COPY_ATTEMPT", "medium", "⚠️ Хуулах үйлдэл хориотой!");
			}
		};

		const handleCut = (e: ClipboardEvent) => {
			e.preventDefault();
			if (!blockedRef.current) {
				logViolation("CUT_ATTEMPT", "medium", "⚠️ Таслах үйлдэл хориотой!");
			}
		};

		const handlePaste = (e: ClipboardEvent) => {
			e.preventDefault();
			if (!blockedRef.current) {
				logViolation("PASTE_ATTEMPT", "medium", "⚠️ Буулгах үйлдэл хориотой!");
			}
		};

		// Text selection хориглох (Mobile & Desktop)
		const handleSelectStart = (e: Event) => {
			e.preventDefault();
			return false;
		};

		// Drag & Drop хориглох
		const handleDragStart = (e: DragEvent) => {
			e.preventDefault();
			if (!blockedRef.current) {
				logViolation("DRAG_ATTEMPT", "low", "⚠️ Drag хийх хориотой!");
			}
		};

		// Orientation change detection (Mobile only)
		const handleOrientationChange = () => {
			if (!blockedRef.current && isMobile) {
				logViolation(
					"ORIENTATION_CHANGE",
					"medium",
					"⚠️ Утасны чиглэл өөрчлөгдсөн!",
				);
			}
		};

		// Print хориглох (Desktop & Mobile)
		const handleBeforePrint = (e: Event) => {
			e.preventDefault();
			if (!blockedRef.current) {
				logViolation("PRINT_ATTEMPT", "high", "⚠️ Хэвлэх үйлдэл хориотой!");
			}
		};

		// Screenshot detection (limited support)
		const handleKeyUp = (e: KeyboardEvent) => {
			// PrintScreen key detection
			if (e.key === "PrintScreen") {
				if (!blockedRef.current) {
					logViolation(
						"SCREENSHOT_ATTEMPT",
						"high",
						"⚠️ Дэлгэцийн зураг авах оролдлого!",
					);
				}
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

		// CSS-ээр text selection хориглох (Mobile & Desktop)
		// АЛДАА ЗАСАГДСАН: 'any' type-ийг CSSStyleDeclaration болгох
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

			const bodyStyle = document.body.style as CSSStyleDeclaration & {
				webkitUserSelect?: string;
				webkitTouchCallout?: string;
				mozUserSelect?: string;
				msUserSelect?: string;
			};
			bodyStyle.userSelect = "";
			bodyStyle.webkitUserSelect = "";
			bodyStyle.webkitTouchCallout = "";
			bodyStyle.mozUserSelect = "";
			bodyStyle.msUserSelect = "";
		};
	}, [logViolation, strictMode, isMobile]);

	// ========================
	// 🔒 Inspect Tool & DevTools Blocker
	// ========================
	useEffect(() => {
		if (!strictMode) return;

		// Right-click хориглох
		const handleContextMenu = (e: MouseEvent) => {
			e.preventDefault();
			if (!blockedRef.current) {
				logViolation(
					"CONTEXT_MENU",
					"medium",
					"⚠️ Баруун товчлуур хориглосон байна!",
				);
			}
			return false;
		};

		// DevTools keyboard shortcuts хориглох
		const handleKeyDown = (e: KeyboardEvent) => {
			// F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S
			if (
				e.key === "F12" ||
				(e.ctrlKey &&
					e.shiftKey &&
					["I", "J", "C"].includes(e.key.toUpperCase())) ||
				(e.ctrlKey && ["u", "s"].includes(e.key.toLowerCase()))
			) {
				e.preventDefault();
				if (!blockedRef.current) {
					logViolation(
						"DEVTOOLS_ATTEMPT",
						"high",
						"⚠️ DevTools нээх оролдлого илрүүлсэн!",
					);
				}
				return false;
			}

			// Cmd+Option+I (Mac DevTools), Cmd+S (Save)
			if (
				e.metaKey &&
				((e.altKey && e.key.toLowerCase() === "i") ||
					e.key.toLowerCase() === "s")
			) {
				e.preventDefault();
				if (!blockedRef.current) {
					logViolation(
						"DEVTOOLS_ATTEMPT",
						"high",
						"⚠️ DevTools/Save нээх оролдлого илрүүлсэн!",
					);
				}
				return false;
			}
		};

		// DevTools detection (size-based) - desktop only
		let devtoolsCheckInterval: NodeJS.Timeout | undefined;

		if (!isMobile) {
			const threshold = 160;

			const detectDevTools = () => {
				const widthThreshold =
					window.outerWidth - window.innerWidth > threshold;
				const heightThreshold =
					window.outerHeight - window.innerHeight > threshold;

				if (widthThreshold || heightThreshold) {
					if (!blockedRef.current) {
						logViolation(
							"DEVTOOLS_OPEN",
							"high",
							"⚠️ Developer Tools нээгдсэн байна!",
						);
					}
				}
			};

			devtoolsCheckInterval = setInterval(detectDevTools, 1000);
		}

		document.addEventListener("contextmenu", handleContextMenu);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("contextmenu", handleContextMenu);
			document.removeEventListener("keydown", handleKeyDown);
			if (devtoolsCheckInterval) {
				clearInterval(devtoolsCheckInterval);
			}
		};
	}, [logViolation, strictMode, isMobile]);

	// ========================
	// Tab Switch / Blur Detection
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
	// Mouse Leave Detection (Desktop only)
	// ========================
	useEffect(() => {
		if (!strictMode || isMobile) return;

		const handleMouseLeave = () => {
			setMouseLeft(true);
			if (mouseTimeoutRef.current) {
				clearTimeout(mouseTimeoutRef.current);
			}
			mouseTimeoutRef.current = setTimeout(() => {
				if (!blockedRef.current) {
					logViolation(
						"MOUSE_LEFT",
						"medium",
						"⚠️ Хулгана шалгалтын цонхноос 3 секунд гарсан байна!",
					);
				}
			}, 3000);
		};

		const handleMouseEnter = () => {
			setMouseLeft(false);
			if (mouseTimeoutRef.current) {
				clearTimeout(mouseTimeoutRef.current);
			}
		};

		document.addEventListener("mouseleave", handleMouseLeave);
		document.addEventListener("mouseenter", handleMouseEnter);

		return () => {
			document.removeEventListener("mouseleave", handleMouseLeave);
			document.removeEventListener("mouseenter", handleMouseEnter);
			if (mouseTimeoutRef.current) {
				clearTimeout(mouseTimeoutRef.current);
			}
		};
	}, [logViolation, strictMode, isMobile]);

	// ========================
	// Fullscreen Lock (Desktop only)
	// ========================
	useEffect(() => {
		if (!enableFullscreen || !strictMode || isMobile) return;

		const enterFullscreen = async () => {
			try {
				if (!document.fullscreenElement) {
					await document.documentElement.requestFullscreen();
				}
			} catch (err) {
				console.warn("Fullscreen not supported:", err);
			}
		};

		const handleFullscreenChange = () => {
			if (!document.fullscreenElement && !blockedRef.current) {
				logViolation(
					"FULLSCREEN_EXIT",
					"high",
					"⚠️ Fullscreen горимоос гарсан байна!",
				);
				setTimeout(enterFullscreen, 500);
			}
		};

		setTimeout(enterFullscreen, 500);
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
			if (document.fullscreenElement) {
				document.exitFullscreen().catch(console.error);
			}
		};
	}, [logViolation, strictMode, enableFullscreen, isMobile]);

	// ========================
	// Webcam Activation
	// ========================
	useEffect(() => {
		if (!enableWebcam || !videoRef.current) return;

		const startWebcam = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "user" },
					audio: false,
				});
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					setWebcamActive(true);
				}
			} catch (err) {
				console.error("Webcam error:", err);
				logViolation("WEBCAM_BLOCKED", "high", "⚠️ Камер идэвхжүүлж чадсангүй!");
			}
		};

		startWebcam();

		return () => {
			if (videoRef.current?.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;
				// АЛДАА ЗАСАГДСАН: forEach доторх return-г арилгах
				stream.getTracks().forEach((track) => {
					track.stop();
				});
			}
		};
	}, [enableWebcam, logViolation]);

	const criticalViolations = violations.filter(
		(v) => v.severity === "high",
	).length;

	return (
		<>
			{blackScreen && (
				<div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center pointer-events-auto">
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

			<div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 space-y-2 max-w-[90vw] sm:max-w-none pointer-events-none">
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

				{enableWebcam && webcamActive && (
					<div className="w-56 sm:w-64 bg-black rounded-lg overflow-hidden border-2 border-green-500 shadow-lg pointer-events-auto">
						<div className="flex items-center gap-2 bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold">
							<Eye className="w-3 h-3" />
							Камер идэвхтэй
						</div>
						<video
							ref={videoRef}
							autoPlay
							muted
							playsInline
							className="w-full aspect-video"
						/>
					</div>
				)}

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

				<div className="bg-card border rounded-lg p-2 sm:p-3 w-56 sm:w-64 text-xs space-y-1.5 shadow-lg pointer-events-auto">
					<div className="font-semibold text-xs sm:text-sm mb-2 flex items-center gap-2">
						{isMobile && <Smartphone className="w-3 h-3" />}
						Хамгаалалтын төлөв
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
					{enableWebcam && webcamActive && (
						<div className="flex items-center gap-2 text-green-600 dark:text-green-400">
							<Eye className="w-3 h-3" />
							<span>Камер ажиллаж байна</span>
						</div>
					)}
				</div>
			</div>

			<Dialog open={!!dialogMessage && !blackScreen && !blocked}>
				<DialogContent className="max-w-[90vw] sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-orange-600 text-sm sm:text-base">
							<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
							Анхааруулга
						</DialogTitle>
					</DialogHeader>
					<div className="py-3 sm:py-4 space-y-3">
						<p className="text-sm sm:text-base">{dialogMessage}</p>
						<div className="bg-muted p-2 sm:p-3 rounded-lg">
							<p className="text-xs sm:text-sm font-semibold">
								Ноцтой зөрчил: {criticalViolations}/{maxViolations}
							</p>
							{criticalViolations < maxViolations && (
								<p className="text-xs text-muted-foreground mt-1">
									Дахиад {maxViolations - criticalViolations} зөрчил хийвэл
									шалгалт автоматаар дуусна.
								</p>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button onClick={() => setDialogMessage(null)} className="text-sm">
							Ойлголоо
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{process.env.NODE_ENV === "development" && violations.length > 0 && (
				<div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 bg-card border rounded-lg p-2 sm:p-3 max-w-[90vw] sm:max-w-sm max-h-48 sm:max-h-64 overflow-auto text-xs z-50 shadow-lg">
					<div className="font-bold mb-2 flex items-center justify-between">
						<span>Зөрчлийн түүх ({violations.length})</span>
						<Button
							onClick={() => setViolations([])}
							className="text-red-500 hover:text-red-700 text-xs"
						>
							Цэвэрлэх
						</Button>
					</div>
					{/* АЛДАА ЗАСАГДСАН: array index-ийг key болгон хэрэглэхгүй байхын тулд violation object-оос unique key үүсгэх */}
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
