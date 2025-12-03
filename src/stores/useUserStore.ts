import { create } from "zustand";
import type { UserProfileItem } from "@/types/user";

interface UserState {
	profile: UserProfileItem | null;
	setProfile: (data: UserProfileItem | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
	profile: null,
	setProfile: (data) => set({ profile: data }),
}));
