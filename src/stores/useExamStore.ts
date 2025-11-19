// stores/useExamStore.ts
import { create } from "zustand";

export interface Violation {
	type: string;
	timestamp: Date;
	severity: "low" | "medium" | "high";
}

interface ExamStore {
	violations: Violation[];
	addViolation: (violation: Violation) => void;
	clearViolations: () => void;
}

export const useExamStore = create<ExamStore>((set, _get) => {
	// localStorage-аас эхлээд state үүсгэх
	const saved =
		typeof window !== "undefined"
			? localStorage.getItem("examViolations")
			: null;
	const initialViolations: Violation[] = saved
		? JSON.parse(saved, (key, value) =>
				key === "timestamp" ? new Date(value) : value,
			)
		: [];

	return {
		violations: initialViolations,
		addViolation: (violation) => {
			set((state) => {
				const updated = [...state.violations, violation];
				// localStorage-д хадгалах
				if (typeof window !== "undefined") {
					localStorage.setItem("examViolations", JSON.stringify(updated));
				}
				return { violations: updated };
			});
		},
		clearViolations: () => {
			set({ violations: [] });
			if (typeof window !== "undefined") {
				localStorage.removeItem("examViolations");
			}
		},
	};
});
