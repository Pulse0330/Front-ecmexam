"use client";

import { Loader2, Save } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
	/** ⚠️ useRef.size биш useState-с ирэх ёстой — тэгж байж re-render ажиллана */
	pendingCount: number;
	isSaving: boolean;
	isTimeUp: boolean;
	onSave: () => void;
	variant?: "mobile" | "desktop";
}

const SaveButton = memo(function SaveButton({
	pendingCount,
	isSaving,
	isTimeUp,
	onSave,
	variant = "desktop",
}: SaveButtonProps) {
	if (pendingCount === 0 || isTimeUp) return null;

	if (variant === "mobile") {
		return (
			<Button
				onClick={onSave}
				disabled={isSaving}
				variant="default"
				className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-sm font-semibold"
			>
				{isSaving ? (
					<>
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						Хадгалж байна
					</>
				) : (
					<>
						<Save className="w-4 h-4 mr-2" />
						Хадгалах ({pendingCount})
					</>
				)}
			</Button>
		);
	}

	return (
		<div className="fixed bottom-6 right-6 z-50 lg:block hidden">
			<Button
				onClick={onSave}
				disabled={isSaving}
				className="shadow-lg"
				size="lg"
			>
				{isSaving ? (
					<>
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						Хадгалж байна...
					</>
				) : (
					<>
						<Save className="w-4 h-4 mr-2" />
						Хадгалах ({pendingCount})
					</>
				)}
			</Button>
		</div>
	);
});

export default SaveButton;
