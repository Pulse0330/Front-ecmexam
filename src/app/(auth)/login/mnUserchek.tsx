"use client";

import {
	AlertCircle,
	CheckCircle2,
	Loader2,
	RotateCcw,
	XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMNuserCheck } from "@/lib/api";
import type { MNUserCheckData } from "@/types/mnExam/mnUserCheck";

// ─── Types ────────────────────────────────────────────────────────────────────
type CheckState = "idle" | "loading" | "found" | "not_found" | "error";

// ─── Regex ────────────────────────────────────────────────────────────────────
const RD_ALLOWED = /[^A-ZА-ЯӨҮa-zа-яөү0-9]/g;

// ─── Main Component ───────────────────────────────────────────────────────────
export function UserCheckForm({ onClose }: { onClose?: () => void } = {}) {
	const [rd, setRd] = useState("");
	const [checkState, setCheckState] = useState<CheckState>("idle");
	const [result, setResult] = useState<MNUserCheckData | null>(null);
	const [checkError, setCheckError] = useState("");

	const clearRd = useCallback(() => {
		setRd("");
		setCheckState("idle");
		setResult(null);
		setCheckError("");
	}, []);

	const onRdInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const v = e.target.value
				.replace(RD_ALLOWED, "")
				.toUpperCase()
				.slice(0, 25);
			setRd(v);
			if (checkState !== "idle") clearRd();
		},
		[checkState, clearRd],
	);

	const checkRd = useCallback(async () => {
		if (rd.length < 8) return;
		setCheckState("loading");
		setCheckError("");
		setResult(null);

		try {
			const res = await getMNuserCheck(rd);

			if (!res.RetResponse.ResponseType || !res.RetData?.[0]) {
				setCheckState("not_found");
				return;
			}

			setResult(res.RetData[0]);
			setCheckState("found");
		} catch (err) {
			setCheckState("error");
			setCheckError(err instanceof Error ? err.message : "Алдаа гарлаа");
		}
	}, [rd]);

	return (
		<div className="space-y-5">
			{/* ─── РД оруулах ───────────────────────────────────────────────── */}
			<div className="space-y-3">
				<Label className="text-sm font-medium">Регистрийн дугаар</Label>
				<div className="flex gap-2">
					<Input
						value={rd}
						onChange={onRdInput}
						onKeyDown={(e) => e.key === "Enter" && checkRd()}
						placeholder="АА12345678..."
						maxLength={25}
						disabled={checkState === "found"}
						className={`flex-1 font-mono text-base tracking-widest text-center h-11
							${checkState === "not_found" || checkState === "error" ? "border-destructive focus-visible:ring-destructive" : ""}
							${checkState === "found" ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10" : ""}
						`}
					/>
					<Button
						type="button"
						variant={checkState === "found" ? "outline" : "default"}
						onClick={checkState === "found" ? clearRd : checkRd}
						disabled={
							checkState === "loading" ||
							(checkState !== "found" && rd.length < 8)
						}
						className={`shrink-0 h-11 min-w-[90px] ${
							checkState !== "found"
								? "bg-emerald-600 hover:bg-emerald-700 text-white"
								: ""
						}`}
					>
						{checkState === "loading" ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : checkState === "found" ? (
							<>
								<RotateCcw className="w-4 h-4 mr-1.5" />
								Өөрчлөх
							</>
						) : (
							"Шалгах"
						)}
					</Button>
				</div>
			</div>

			{/* ─── Not found ────────────────────────────────────────────────── */}
			{checkState === "not_found" && (
				<Alert variant="destructive">
					<XCircle className="h-4 w-4" />
					<AlertDescription>
						<span className="font-mono font-bold">{rd}</span> регистртэй бүртгэл
						олдсонгүй. Сургалтын менежерт хандана уу.
					</AlertDescription>
				</Alert>
			)}

			{/* ─── Error ────────────────────────────────────────────────────── */}
			{checkState === "error" && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						{checkError || "Сүлжээгээ шалгана уу."}
					</AlertDescription>
				</Alert>
			)}

			{/* ─── Found ────────────────────────────────────────────────────── */}
			{checkState === "found" && result && (
				<Alert className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800">
					<CheckCircle2 className="h-4 w-4 text-emerald-500" />
					<AlertDescription className="text-emerald-700 dark:text-emerald-400">
						<div className="flex flex-col gap-3">
							{/* Нэр + зураг */}
							<div className="flex items-center gap-3">
								{result.profile ? (
									<img
										src={result.profile}
										alt="profile"
										className="w-12 h-12 rounded-full object-cover border-2 border-emerald-300 shrink-0"
									/>
								) : (
									<div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-300 flex items-center justify-center shrink-0">
										<span className="text-emerald-600 font-bold text-lg">
											{result.first_name[0] ?? "?"}
										</span>
									</div>
								)}
								<div>
									<p className="font-semibold text-base">
										{result.last_name} {result.first_name}
									</p>
									<p className="text-xs text-emerald-600 dark:text-emerald-500">
										{result.register_number} ·{" "}
										{result.gender === "M" ? "Эрэгтэй" : "Эмэгтэй"}
										{result.age ? ` · ${result.age} нас` : ""}
									</p>
								</div>
							</div>

							{/* Сургуулийн мэдээлэл */}
							{(result.schoolname ||
								result.studentgroupname ||
								result.aimag_name) && (
								<div className="text-xs space-y-0.5 border-t border-emerald-200 dark:border-emerald-800 pt-2">
									{result.schoolname && <p>{result.schoolname}</p>}
									{result.studentgroupname && (
										<p>
											<span className="font-medium">Анги:</span>{" "}
											{result.studentgroupname}
										</p>
									)}
									{result.aimag_name && (
										<p>
											<span className="font-medium">Хаяг:</span>{" "}
											{result.aimag_name}
											{result.sym_name ? `, ${result.sym_name}` : ""}
										</p>
									)}
								</div>
							)}

							{/* Бүртгэлийн дугаар */}
							{result.examinee_number && (
								<div className="border-t border-emerald-200 dark:border-emerald-800 pt-2">
									<p className="text-xs">
										<span className="font-medium">Бүртгэлийн дугаар:</span>{" "}
										<span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
											{result.examinee_number}
										</span>
									</p>
								</div>
							)}
							{result.mail && (
								<div className="border-t border-emerald-200 dark:border-emerald-800 pt-2">
									<p className="text-xs">
										<span className="font-medium">Нэвтрэх нэр:</span>{" "}
										<span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
											{result.mail}
										</span>
									</p>
								</div>
							)}
							{result.passwordgit && (
								<div className="border-t border-emerald-200 dark:border-emerald-800 pt-2">
									<p className="text-xs">
										<span className="font-medium">Нууц үг:</span>{" "}
										<span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
											{result.passwordgit}
										</span>
									</p>
								</div>
							)}
						</div>
					</AlertDescription>
				</Alert>
			)}

			{/* ─── Хаах ────────────────────────────────────────────────────── */}
			{onClose && (
				<Button
					type="button"
					variant="ghost"
					className="w-full text-gray-500 h-11"
					onClick={onClose}
				>
					Хаах
				</Button>
			)}
		</div>
	);
}
