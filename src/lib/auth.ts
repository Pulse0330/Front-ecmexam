import { deleteCookie } from "@/lib/cookie";
import { useAuthStore } from "@/stores/useAuthStore";

export function logout() {
	console.log("🚪 Logout хийж байна...");

	try {
		useAuthStore.getState().clearAuth();
		console.log("✅ Store цэвэрлэгдлээ");

		localStorage.removeItem("auth-storage");
		console.log("✅ localStorage цэвэрлэгдлээ");

		deleteCookie("auth-token");
		deleteCookie("user-id");
		console.log("✅ Cookies устгагдлаа");
	} catch (error) {
		console.error("❌ Logout алдаа:", error);
	} finally {
		console.log("🔄 Login руу redirect хийж байна");
		window.location.href = "/login";
	}
}
