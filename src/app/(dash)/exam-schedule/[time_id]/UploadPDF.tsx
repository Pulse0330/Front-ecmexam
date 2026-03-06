import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress"; // shadcn progress суулгасан байх
import type { StudentSeat } from "@/types/dashboard/exam.types";
import { uploadWithProgress } from "@/utils/upload";

interface UploadPDFDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUploadSuccess: (file: UploadFileResult) => void;
	selectRow: StudentSeat | null;
}

export interface UploadFileResult {
	fileStatus: number;
	message: string;
	file: {
		name: string;
		savedName: string;
		url: string;
	};
}

export function UploadPDFDialog({
	open,
	onOpenChange,
	onUploadSuccess,
	selectRow,
}: UploadPDFDialogProps) {
	const [file, setFile] = useState<File | null>(null);
	const [progress, setProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "application/pdf": [".pdf"] },
		maxFiles: 1,
	});

	const handleUpload = async () => {
		if (!file || !selectRow) return;

		setIsUploading(true);
		const formData = new FormData();
		formData.append("file", file);

		try {
			const result = await uploadWithProgress(formData, (percent) => {
				setProgress(percent);
			});
			// Серверээс ирсэн өгөгдлийг эцэг рүү дамжуулна
			onUploadSuccess(result);
			setFile(null);
			setProgress(0);
			onOpenChange(false);
		} catch (error) {
			console.error("Upload failed", error);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{selectRow?.first_name[0]}.{selectRow?.last_name}
					</DialogTitle>
					<DialogDescription>
						{selectRow?.register_number} • {selectRow?.seat_number}-р суудал
					</DialogDescription>
				</DialogHeader>

				{!file ? (
					<div
						{...getRootProps()}
						className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors py-6 ${isDragActive ? "border-primary bg-primary/10" : "border-slate-300 hover:border-primary"}`}
					>
						<input {...getInputProps()} />
						<UploadCloud className="mx-auto h-10 w-10 text-slate-400 mb-2" />
						<p className="text-sm text-slate-600">
							PDF файлаа энд чирч оруулна уу
						</p>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
							<div className="flex items-center gap-2 overflow-hidden">
								<FileText className="h-8 w-8 text-red-500 shrink-0" />
								<span className="text-sm truncate">{file.name}</span>
							</div>
							{!isUploading && (
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setFile(null)}
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>

						{isUploading && (
							<div className="space-y-2">
								<Progress value={progress} />
								<p className="text-xs text-center text-muted-foreground">
									{progress}% байршуулж байна...
								</p>
							</div>
						)}
					</div>
				)}

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isUploading}
					>
						Цуцлах
					</Button>
					<Button onClick={handleUpload} disabled={!file || isUploading}>
						{isUploading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Илгээж байна...
							</>
						) : (
							"Илгээх"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
