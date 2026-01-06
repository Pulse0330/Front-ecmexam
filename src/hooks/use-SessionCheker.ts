import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { checkSessionRequest } from "@/lib/api";
import { deleteCookie } from "@/lib/cookie";
import { useAuthStore } from "@/stores/useAuthStore";

const SESSION_CHECK_INTERVAL = 60000; // 1 минут
const CHANNEL_NAME = "session-sync";

export function useSessionChecker() {
	const { userId, token, isAuthenticated } = useAuthStore();
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const isCheckingRef = useRef(false);
	const channelRef = useRef<BroadcastChannel | null>(null);

	// Logout хийх функц
	const handleLogout = useCallback((reason: string) => {
		console.log(`🚪 Logout хийж байна: ${reason}`);

		try {
			useAuthStore.getState().clearAuth();
			localStorage.removeItem("auth-storage");
			deleteCookie("auth-token");
			deleteCookie("user-id");
			console.log("✅ Logout амжилттай");
		} catch (error) {
			console.error("❌ Logout алдаа:", error);
		} finally {
			window.location.href = "/login?session=expired";
		}
	}, []);

	useEffect(() => {
		// Нэвтрээгүй бол эсвэл client биш бол шалгахгүй
		if (typeof window === "undefined") return;

		if (!isAuthenticated() || !userId || !token) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			if (channelRef.current) {
				channelRef.current.close();
				channelRef.current = null;
			}
			return;
		}

		// BroadcastChannel үүсгэх
		if (typeof BroadcastChannel !== "undefined") {
			try {
				channelRef.current = new BroadcastChannel(CHANNEL_NAME);
				console.log("📡 BroadcastChannel холбогдлоо");

				channelRef.current.onmessage = (event) => {
					const { type, userId: messageUserId, reason } = event.data;

					console.log("📨 Message ирлээ:", event.data);

					// Өөр хэрэглэгчийн мессеж бол алгасах
					if (messageUserId !== userId) return;

					// Шинэ login
					if (type === "NEW_LOGIN") {
						console.log("⚠️ Өөр tab дээр шинээр нэвтэрлээ");

						toast.error("Та өөр tab дээр нэвтэрлээ", {
							description: "Энэ tab 3 секундын дараа хаагдана...",
							duration: 3000,
						});

						setTimeout(() => {
							handleLogout("Өөр tab дээр нэвтэрсэн");
						}, 3000);
					}

					// Logout
					if (type === "LOGOUT") {
						console.log("🚪 Бусад tab logout хийлээ");
						handleLogout(reason || "Бусад tab-аас гарсан");
					}

					// Session expired
					if (type === "SESSION_EXPIRED") {
						console.log("⏰ Session дууссан");
						handleLogout("Session дууссан");
					}
				};
			} catch (error) {
				console.error("❌ BroadcastChannel үүсгэх алдаа:", error);
			}
		}

		// Session шалгах функц
		const checkSession = async () => {
			if (isCheckingRef.current) return;

			try {
				isCheckingRef.current = true;

				const response = await checkSessionRequest(userId, token);

				// Response шалгах
				if (!response?.RetResponse?.ResponseType) {
					console.log("🚫 Session дууссан (ResponseType: false)");

					if (channelRef.current) {
						channelRef.current.postMessage({
							type: "SESSION_EXPIRED",
							userId,
							reason: "Session дууссан",
							timestamp: Date.now(),
						});
					}

					if (intervalRef.current) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}

					toast.error("Таны session дууссан байна");
					handleLogout("Session дууссан");
					return;
				}

				// Status шалгах
				const sessionData = response.RetData?.[0];

				if (sessionData?.status === 0) {
					console.log("🚫 Session дууссан (status: 0)");

					if (channelRef.current) {
						channelRef.current.postMessage({
							type: "SESSION_EXPIRED",
							userId,
							reason: "Өөр device дээр нэвтэрсэн",
							timestamp: Date.now(),
						});
					}

					if (intervalRef.current) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}

					toast.error("Таны session дууссан байна", {
						description: "Өөр төхөөрөмж дээр нэвтэрсэн",
					});

					handleLogout("Session дууссан (өөр device)");
				} else {
					console.log(`✅ Session идэвхтэй (status: ${sessionData?.status})`);
				}
			} catch (error) {
				console.error("❌ Session шалгалтын алдаа:", error);
			} finally {
				isCheckingRef.current = false;
			}
		};

		// Анх удаа шалгах
		checkSession();

		// Interval тохируулах
		intervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL);

		// Cleanup
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			if (channelRef.current) {
				channelRef.current.close();
				channelRef.current = null;
			}
		};
	}, [userId, token, isAuthenticated, handleLogout]);
}

// Export функц - LoginForm-аас дуудах
export function notifyNewLogin(userId: number) {
	if (
		typeof window === "undefined" ||
		typeof BroadcastChannel === "undefined"
	) {
		return;
	}

	try {
		const channel = new BroadcastChannel(CHANNEL_NAME);
		channel.postMessage({
			type: "NEW_LOGIN",
			userId,
			timestamp: Date.now(),
		});
		channel.close();
		console.log("📡 NEW_LOGIN мэдэгдэл илгээлээ");
	} catch (error) {
		console.error("❌ BroadcastChannel мэдэгдэл илгээх алдаа:", error);
	}
}
