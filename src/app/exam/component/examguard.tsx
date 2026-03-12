"use client";

import { AlertTriangle, Lock, Shield, Smartphone, Unlock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExamProctorProps {
	onSubmit?: () => void; // Optional submit callback (manual only)
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
	const [dialogMessage, setDialogMessage] = useState<string | null>(null);
	const [blackScreen, setBlackScreen] = useState(false);
	const [mouseLeft, setMouseLeft] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	// "warning" = зөрчлийн анхааруулга (unlock боломжтой)
	// "locked"  = max зөрчилд хүрсэн, гэхдээ дуусгахгүй — зүгээр л хаалттай
	const [lockState, setLockState] = useState<"none" | "warning" | "locked">(
		"none",
	);

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
			// Аль хэдийн lock горимд байвал шинэ зөрчил бүртгэхгүй
			if (violationLockRef.current) return;
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
						// Автоматаар дуусгахгүй — зүгээр л "locked" горим
						setLockState("locked");
						setDialogMessage(
							`🚫 Та ${maxViolations} удаа ноцтой дүрэм зөрчсөн тул шалгалт хаагдлаа. Багш тайлбар авна уу.`,
						);
						setBlackScreen(true);
					} else {
						setLockState("warning");
						setDialogMessage(message);
						setBlackScreen(true);
					}

					return newViolations;
				});

				// warning горимд 1 секундийн дараа violationLock-г тайлна
				// locked горимд хэзээ ч тайлахгүй
				setTimeout(() => {
					setViolations((current) => {
						const critCount = current.filter(
							(v) => v.severity === "high",
						).length;
						if (critCount < maxViolations) {
							violationLockRef.current = false;
						}
						return current;
					});
				}, 1500);
			}, 0);
		},
		[maxViolations],
	);

	// Warning горимоос гарах — хэрэглэгч "Үргэлжлүүлэх" дарна
	const handleDismissWarning = useCallback(() => {
		setViolations((current) => {
			const critCount = current.filter((v) => v.severity === "high").length;
			if (critCount >= maxViolations) {
				// locked горимоос гарахгүй
				return current;
			}
			setBlackScreen(false);
			setDialogMessage(null);
			setLockState("none");
			violationLockRef.current = false;
			return current;
		});
	}, [maxViolations]);

	// ========================
	// Mobile & Desktop Protections
	// ========================
	useEffect(() => {
		if (!strictMode) return;

		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length > 1) {
				e.preventDefault();
				logViolation(
					"MULTI_TOUCH",
					"medium",
					"⚠️ Олон хуруу хэрэглэх хориотой!",
				);
			}
		};

		let touchTimer: NodeJS.Timeout;
		const handleTouchStartTimer = (e: TouchEvent) => {
			touchTimer = setTimeout(() => {
				e.preventDefault();
				logViolation("LONG_PRESS", "medium", "⚠️ Удаан дарах хориотой!");
			}, 500);
		};
		const handleTouchEnd = () => clearTimeout(touchTimer);

		const handleCopy = (e: ClipboardEvent) => {
			e.preventDefault();
			logViolation("COPY_ATTEMPT", "medium", "⚠️ Хуулах хориотой!");
		};
		const handleCut = (e: ClipboardEvent) => {
			e.preventDefault();
			logViolation("CUT_ATTEMPT", "medium", "⚠️ Таслах хориотой!");
		};
		const handlePaste = (e: ClipboardEvent) => {
			e.preventDefault();
			logViolation("PASTE_ATTEMPT", "medium", "⚠️ Буулгах хориотой!");
		};

		const handleSelectStart = (e: Event) => e.preventDefault();
		const handleDragStart = (e: DragEvent) => {
			e.preventDefault();
			logViolation("DRAG_ATTEMPT", "low", "⚠️ Drag хийх хориотой!");
		};

		const handleOrientationChange = () => {
			if (isMobile) {
				logViolation(
					"ORIENTATION_CHANGE",
					"medium",
					"⚠️ Утасны чиглэл өөрчлөгдсөн!",
				);
			}
		};

		const handleBeforePrint = (e: Event) => {
			e.preventDefault();
			logViolation("PRINT_ATTEMPT", "high", "⚠️ Хэвлэх хориотой!");
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === "PrintScreen") {
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
			logViolation("CONTEXT_MENU", "medium", "⚠️ Баруун товчлуур хориглосон!");
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			// DevTools
			if (
				e.key === "F12" ||
				(e.ctrlKey &&
					e.shiftKey &&
					["I", "J", "C"].includes(e.key.toUpperCase()))
			) {
				e.preventDefault();
				logViolation(
					"DEVTOOLS_ATTEMPT",
					"high",
					"⚠️ DevTools нээх оролдлого илрүүлсэн!",
				);
				return;
			}

			// Ctrl + ... хориотой товчлуурууд
			if (e.ctrlKey && !e.shiftKey && !e.altKey) {
				const blocked: Record<string, string> = {
					n: "⚠️ Шинэ цонх нээх хориотой! (Ctrl+N)",
					t: "⚠️ Шинэ таб нээх хориотой! (Ctrl+T)",
					w: "⚠️ Таб хаах хориотой! (Ctrl+W)",
					r: "⚠️ Хуудас шинэчлэх хориотой! (Ctrl+R)",
					l: "⚠️ Хаяг мөр нээх хориотой! (Ctrl+L)",
					u: "⚠️ Эх код харах хориотой! (Ctrl+U)",
					s: "⚠️ Хадгалах хориотой! (Ctrl+S)",
					p: "⚠️ Хэвлэх хориотой! (Ctrl+P)",
					a: "⚠️ Бүгдийг сонгох хориотой! (Ctrl+A)",
					h: "⚠️ Түүх нээх хориотой! (Ctrl+H)",
					j: "⚠️ Татаж авсан файл хориотой! (Ctrl+J)",
					k: "⚠️ Хориотой товчлуур! (Ctrl+K)",
					b: "⚠️ Хориотой товчлуур! (Ctrl+B)",
					f: "⚠️ Хайх хориотой! (Ctrl+F)",
				};
				const key = e.key.toLowerCase();
				if (blocked[key]) {
					e.preventDefault();
					logViolation("SHORTCUT_ATTEMPT", "medium", blocked[key]);
					return;
				}
			}

			// Ctrl+Shift+N (нууц цонх)
			if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "N") {
				e.preventDefault();
				logViolation(
					"INCOGNITO_ATTEMPT",
					"high",
					"⚠️ Нууц горим нээх хориотой! (Ctrl+Shift+N)",
				);
				return;
			}

			// Ctrl+Shift+T (хаасан таб нээх)
			if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === "T") {
				e.preventDefault();
				logViolation(
					"SHORTCUT_ATTEMPT",
					"medium",
					"⚠️ Хаасан таб нээх хориотой! (Ctrl+Shift+T)",
				);
				return;
			}

			// Alt+F4 (цонх хаах)
			if (e.altKey && e.key === "F4") {
				e.preventDefault();
				logViolation("WINDOW_CLOSE", "high", "⚠️ Цонх хаах оролдлого! (Alt+F4)");
				return;
			}

			// F5 (refresh)
			if (e.key === "F5") {
				e.preventDefault();
				logViolation(
					"SHORTCUT_ATTEMPT",
					"medium",
					"⚠️ Хуудас шинэчлэх хориотой! (F5)",
				);
				return;
			}

			// Escape (fullscreen-с гарах гэх зэрэг)
			if (e.key === "Escape") {
				e.preventDefault();
				return;
			}

			// Windows key
			if (e.key === "Meta" || e.key === "OS") {
				e.preventDefault();
				logViolation("SHORTCUT_ATTEMPT", "medium", "⚠️ Windows товч хориотой!");
				return;
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
			if (isUserInteracting && Date.now() - lastFocusTime > 1000) {
				logViolation(
					"TAB_SWITCH",
					"high",
					`⚠️ Өөр ${isMobile ? "апп" : "цонх"} руу шилжсэн байна`,
				);
			}
			isUserInteracting = false;
		};
		const handleVisibilityChange = () => {
			if (document.hidden && isUserInteracting) {
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
	// Browser Back Button Blocker
	// ========================
	useEffect(() => {
		if (!strictMode) return;

		// Push a dummy state so there's always something to "go back" to (our trap)
		history.pushState(null, "", window.location.href);

		const handlePopState = () => {
			// Immediately push again to prevent navigation
			history.pushState(null, "", window.location.href);
			logViolation(
				"BACK_BUTTON",
				"high",
				"⚠️ Буцах товч дарах хориотой! Шалгалтын хуудсаас гарах оролдлого илрүүлсэн.",
			);
		};

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, [logViolation, strictMode]);

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
			if (!document.fullscreenElement && hasUserInteracted) {
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

	const _criticalViolations = violations.filter(
		(v) => v.severity === "high",
	).length;
	const isLocked = lockState === "locked";
	const _isWarning = lockState === "warning";

	const overlayContent = (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "rgba(0,0,0,0.97)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 2147483647,
				pointerEvents: "auto",
			}}
		>
			<div
				style={{
					color: "white",
					textAlign: "center",
					padding: "1.5rem",
					maxWidth: "28rem",
					width: "100%",
				}}
			>
				<AlertTriangle
					className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 ${isLocked ? "text-red-500" : "text-yellow-400"} animate-pulse`}
				/>
				<h1
					style={{
						fontSize: "1.75rem",
						fontWeight: "bold",
						marginBottom: "1rem",
					}}
				>
					{isLocked ? "🚫 Шалгалт хаагдлаа" : "⚠️ Анхааруулга"}
				</h1>
				<p
					style={{
						fontSize: "1rem",
						lineHeight: "1.6",
						marginBottom: "1.5rem",
					}}
				>
					{dialogMessage}
				</p>
				{isLocked ? (
					<div>
						<div
							style={{
								background: "rgba(127,29,29,0.5)",
								border: "1px solid rgb(220,38,38)",
								borderRadius: "0.5rem",
								padding: "0.75rem 1rem",
								fontSize: "0.875rem",
								color: "rgb(254,202,202)",
								marginBottom: "0.75rem",
							}}
						>
							Шалгалтын систем хаагдсан. Багшийн зөвшөөрөлгүйгээр үргэлжлүүлэх
							боломжгүй.
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "0.5rem",
								color: "rgb(156,163,175)",
								fontSize: "0.75rem",
							}}
						>
							<Lock className="w-3 h-3" />
							<span>Зөвхөн багш тайлах боломжтой</span>
						</div>
					</div>
				) : (
					<div>
						<button
							type="button"
							onClick={handleDismissWarning}
							style={{
								background: "rgb(234,179,8)",
								color: "black",
								fontWeight: "bold",
								padding: "0.75rem 2rem",
								borderRadius: "0.5rem",
								display: "inline-flex",
								alignItems: "center",
								gap: "0.5rem",
								border: "none",
								cursor: "pointer",
								fontSize: "1rem",
							}}
						>
							<Unlock className="w-4 h-4" />
							Ойлголоо, үргэлжлүүлэх
						</button>
					</div>
				)}
			</div>
		</div>
	);

	return (
		<>
			{/* Overlay — portal-аар document.body-д шууд render, stacking context-с бүрэн гарна */}
			{blackScreen &&
				typeof document !== "undefined" &&
				createPortal(overlayContent, document.body)}

			{/* Bottom alerts */}
			<div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 space-y-2 max-w-[90vw] sm:max-w-none pointer-events-none">
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
