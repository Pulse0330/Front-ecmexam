import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	CheckCircle2,
	Loader2,
	QrCode,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { QPayInvoiceResponse } from "@/types/Qpay/qpayinvoice";

interface QPayDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	qpayData: QPayInvoiceResponse | null;
	userId?: string | number | null;
	onPaymentSuccess?: () => void;
}

export default function QPayDialog({
	open,
	onOpenChange,
	qpayData,
	userId,
	onPaymentSuccess,
}: QPayDialogProps) {
	const [isChecking, setIsChecking] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState<
		"pending" | "success" | "failed"
	>("pending");
	const [showNotPaidMessage, setShowNotPaidMessage] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const notPaidTimerRef = useRef<NodeJS.Timeout | null>(null);
	const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Dialog хаагдахад бүх төлөв reset хийх
	useEffect(() => {
		if (!open) {
			if (notPaidTimerRef.current) clearTimeout(notPaidTimerRef.current);
			if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
			setPaymentStatus("pending");
			setShowNotPaidMessage(false);
			setError(null);
			setIsChecking(false);
		}
	}, [open]);

	const checkPaymentStatus = async () => {
		if (!qpayData?.invoice_id || !userId) {
			setError("Invoice ID эсвэл User ID байхгүй байна");
			return;
		}
		if (isChecking || paymentStatus === "success") return;

		try {
			setIsChecking(true);
			setShowNotPaidMessage(false);
			setError(null);
			if (notPaidTimerRef.current) clearTimeout(notPaidTimerRef.current);
			if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

			const response = await axios.post("/api/qpay/check", {
				userid: userId.toString(),
				invoice_id: qpayData.invoice_id,
			});

			if (response.data?.RetResponse?.ResponseType === true) {
				setPaymentStatus("success");
				if (onPaymentSuccess) {
					setTimeout(() => {
						onPaymentSuccess();
						onOpenChange(false);
					}, 2000);
				}
			} else {
				setShowNotPaidMessage(true);
				notPaidTimerRef.current = setTimeout(() => {
					setShowNotPaidMessage(false);
				}, 5000);
			}
		} catch {
			setError("Төлбөр шалгахад алдаа гарлаа. Дахин оролдоно уу.");
			setPaymentStatus("failed");
			errorTimerRef.current = setTimeout(() => {
				setError(null);
				setPaymentStatus("pending");
			}, 5000);
		} finally {
			setIsChecking(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl">
				{/* ── Header ── */}
				<div className="px-6 pt-6 pb-4 border-b border-gray-100/60 dark:border-gray-800/60">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
								<QrCode className="w-4 h-4 text-primary" />
							</div>
							QPay Төлбөр
							{paymentStatus === "success" && (
								<motion.div
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
								>
									<CheckCircle2 className="w-5 h-5 text-green-500" />
								</motion.div>
							)}
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground mt-0.5">
							{paymentStatus === "success" ? "Төлбөр амжилттай төлөгдлөө!" : ""}
						</DialogDescription>
					</DialogHeader>
				</div>

				{qpayData ? (
					<div className="px-6 py-5 space-y-5">
						{/* ── Status banners ── */}
						<AnimatePresence mode="wait">
							{paymentStatus === "success" && (
								<motion.div
									key="success"
									initial={{ y: -8, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -8, opacity: 0 }}
									className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-200/70 dark:border-green-800/50"
								>
									<div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0 shadow-sm">
										<CheckCircle2 className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-bold text-green-800 dark:text-green-200">
											Төлбөр амжилттай!
										</p>
										<p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
											Шалгалт өгөх боломжтой боллоо. Цонх автоматаар хаагдана...
										</p>
									</div>
								</motion.div>
							)}

							{showNotPaidMessage && paymentStatus !== "success" && (
								<motion.div
									key="notpaid"
									initial={{ y: -8, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -8, opacity: 0 }}
									className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/70 dark:border-amber-800/50"
								>
									<div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm">
										<XCircle className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-bold text-amber-800 dark:text-amber-200">
											Төлбөр төлөгдөөгүй байна
										</p>
										<p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
											Банкны аппаар төлсний дараа доорх товчийг дарна уу.
										</p>
									</div>
								</motion.div>
							)}

							{error && (
								<motion.div
									key="error"
									initial={{ y: -8, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -8, opacity: 0 }}
									className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200/70 dark:border-red-800/50"
								>
									<div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shrink-0 shadow-sm">
										<AlertCircle className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="text-sm font-bold text-red-800 dark:text-red-200">
											Алдаа гарлаа
										</p>
										<p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
											{error}
										</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* ── QR Code ── */}
						<div className="flex flex-col items-center justify-center gap-3 p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/40">
							<p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
								QR код уншуулах
							</p>
							<div className="bg-white p-3 rounded-xl shadow-md border border-slate-100 dark:border-slate-700">
								{qpayData.qr_image ? (
									<Image
										src={`data:image/png;base64,${qpayData.qr_image}`}
										alt="QPay QR Code"
										width={200}
										height={200}
										className="w-200px h-200px rounded-lg"
										unoptimized
									/>
								) : (
									<div className="w-200px h-200px flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
										<p className="text-xs text-gray-500">QR код байхгүй</p>
									</div>
								)}
							</div>
						</div>

						{/* ── Manual check button ── */}
						<div className="pt-1">
							<Button
								onClick={checkPaymentStatus}
								disabled={isChecking || paymentStatus === "success"}
								size="lg"
								className="w-full h-12 font-bold gap-2 shadow-md"
							>
								{isChecking ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Шалгаж байна...
									</>
								) : paymentStatus === "success" ? (
									<>
										<CheckCircle2 className="w-4 h-4" />
										Төлбөр төлөгдсөн
									</>
								) : (
									"Төлбөр шалгах"
								)}
							</Button>
							<p className="text-[10px] text-center text-muted-foreground mt-2">
								Банкны аппаар төлсний дараа дээрх товчийг дарна уу
							</p>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-16 gap-3">
						<Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground">Уншиж байна...</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
