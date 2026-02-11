// useAuthStore.ts - Updated clearAuth function
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "@/types/login/loginToken/loginToken";

interface AuthState {
	userId: number | null;
	token: string | null;
	user: User | null;
	firstname: string | null;
	imgUrl: string | null;
	setUserId: (id: number | null) => void;
	setToken: (token: string | null) => void;
	setUser: (user: User | null) => void;
	setFirstname: (firstname: string | null) => void;
	setImgUrl: (imgUrl: string | null) => void;
	clearUserId: () => void;
	clearAuth: () => void;
	isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			userId: null,
			token: null,
			user: null,
			firstname: null,
			imgUrl: null,
			setUserId: (id) => set({ userId: id }),
			setToken: (token) => set({ token }),
			setUser: (user) =>
				set({
					user,
					userId: user?.id ?? null,
					firstname: user?.firstname ?? null,
					imgUrl: user?.img_url ?? null,
				}),
			setFirstname: (firstname) => set({ firstname }),
			setImgUrl: (imgUrl) => set({ imgUrl }),
			clearUserId: () => set({ userId: null }),
			clearAuth: () => {
				set({
					userId: null,
					token: null,
					user: null,
					firstname: null,
					imgUrl: null,
				});

				localStorage.removeItem("auth-storage");
			},
			isAuthenticated: () => get().userId !== null,
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
