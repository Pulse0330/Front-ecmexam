import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ExamState {
	startedExams: Record<number, string>; // exam_id -> ISO цаг
	setExamStartTime: (examId: number, startTime: string) => void;
}

export const useExamStore = create<ExamState>()(
	persist(
		(set) => ({
			startedExams: {},
			setExamStartTime: (examId, startTime) =>
				set((state) => ({
					startedExams: { ...state.startedExams, [examId]: startTime },
				})),
		}),
		{
			name: "exam-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
