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
import { useEffect, useState } from "react";
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

	// Dialog хаагдахад төлөв reset хийх
	useEffect(() => {
		if (!open) {
			setPaymentStatus("pending");
			setShowNotPaidMessage(false);
			setError(null);
			setIsChecking(false);
		}
	}, [open]);

	const checkPaymentStatus = async () => {
		if (!qpayData?.invoice_id || !userId) {
			setError("Invoice ID эсвэл User ID байхгүй байна");
			console.error("Missing invoice_id or userId");
			return;
		}

		try {
			setIsChecking(true);
			setShowNotPaidMessage(false);
			setError(null);

			const response = await axios.post("/api/qpay/check", {
				userid: userId.toString(),
				invoice_id: qpayData.invoice_id,
			});

			console.log("Payment Check Response:", response.data);

			if (response.data?.RetResponse?.ResponseType === true) {
				setPaymentStatus("success");

				// Амжилттай төлбөрийн дараа callback дуудах
				if (onPaymentSuccess) {
					setTimeout(() => {
						onPaymentSuccess();
						onOpenChange(false);
					}, 2000);
				}
			} else {
				// Төлбөр төлөгдөөгүй
				setShowNotPaidMessage(true);
				setTimeout(() => {
					setShowNotPaidMessage(false);
				}, 5000);
			}
		} catch (error) {
			console.error("Payment check error:", error);
			setError("Төлбөр шалгахад алдаа гарлаа. Дахин оролдоно уу.");
			setPaymentStatus("failed");

			setTimeout(() => {
				setError(null);
				setPaymentStatus("pending");
			}, 5000);
		} finally {
			setIsChecking(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold flex items-center gap-2">
						<QrCode className="w-6 h-6 text-primary" />
						QPay Төлбөр
						{paymentStatus === "success" && (
							<CheckCircle2 className="w-6 h-6 text-green-500 ml-2" />
						)}
					</DialogTitle>
					<DialogDescription>
						{paymentStatus === "success"
							? "Төлбөр амжилттай төлөгдлөө!"
							: "Доорх QR кодыг банкны аппликейшнээр уншуулан төлбөр төлнө үү"}
					</DialogDescription>
				</DialogHeader>

				{qpayData ? (
					<div className="space-y-6 py-4">
						{/* Төлбөр амжилттай төлөгдсөн мэдэгдэл */}
						<AnimatePresence>
							{paymentStatus === "success" && (
								<motion.div
									initial={{ scale: 0.9, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.9, opacity: 0 }}
									className="p-6 bg-green-50 dark:bg-green-950/20 rounded-2xl border-2 border-green-200 dark:border-green-800"
								>
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
											<CheckCircle2 className="w-7 h-7 text-white" />
										</div>
										<div>
											<h3 className="text-lg font-bold text-green-800 dark:text-green-200">
												Төлбөр амжилттай!
											</h3>
											<p className="text-sm text-green-600 dark:text-green-300">
												Таны төлбөр амжилттай төлөгдлөө. Та шалгалт өгөх
												боломжтой боллоо.
											</p>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Төлбөр төлөгдөөгүй мэдэгдэл */}
						<AnimatePresence>
							{showNotPaidMessage && paymentStatus !== "success" && (
								<motion.div
									initial={{ scale: 0.9, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.9, opacity: 0 }}
									className="p-6 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border-2 border-orange-200 dark:border-orange-800"
								>
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
											<XCircle className="w-7 h-7 text-white" />
										</div>
										<div>
											<h3 className="text-lg font-bold text-orange-800 dark:text-orange-200">
												Төлбөр төлөгдөөгүй байна
											</h3>
											<p className="text-sm text-orange-600 dark:text-orange-300">
												QR кодоор төлбөр төлсний дараа "Төлбөр шалгах" товчийг
												дарна уу.
											</p>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Алдааны мэдэгдэл */}
						<AnimatePresence>
							{error && (
								<motion.div
									initial={{ scale: 0.9, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.9, opacity: 0 }}
									className="p-6 bg-red-50 dark:bg-red-950/20 rounded-2xl border-2 border-red-200 dark:border-red-800"
								>
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shrink-0">
											<AlertCircle className="w-7 h-7 text-white" />
										</div>
										<div>
											<h3 className="text-lg font-bold text-red-800 dark:text-red-200">
												Алдаа гарлаа
											</h3>
											<p className="text-sm text-red-600 dark:text-red-300">
												{error}
											</p>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* QR Code Section */}
						<div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl">
							<p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium">
								QR код уншуулах
							</p>
							<div className="bg-white p-4 rounded-xl shadow-lg">
								{qpayData.qr_image ? (
									<Image
										src={`data:image/png;base64,${qpayData.qr_image}`}
										alt="QPay QR Code"
										width={256}
										height={256}
										className="w-64 h-64"
										unoptimized
									/>
								) : (
									<div className="w-64 h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
										<p className="text-sm text-gray-500">QR код байхгүй</p>
									</div>
								)}
							</div>

							{/* Short URL */}
						</div>

						{/* Payment Check Button */}
						<div className="p-4">
							{userId && (
								<Button
									onClick={checkPaymentStatus}
									disabled={isChecking || paymentStatus === "success"}
									variant="outline"
									size="lg"
									className="w-full"
								>
									{isChecking ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Шалгаж байна...
										</>
									) : paymentStatus === "success" ? (
										<>
											<CheckCircle2 className="w-4 h-4 mr-2" />
											Төлбөр төлөгдсөн
										</>
									) : (
										"Төлбөр шалгах"
									)}
								</Button>
							)}
						</div>

						{/* Bank Apps Grid - uncomment if needed */}
						{/* {qpayData.urls && qpayData.urls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Банкны аппликейшнууд
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {qpayData.urls.map((bank, index) => (
                    <motion.a
                      key={`${bank.name}-${index}`}
                      href={bank.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary transition-colors bg-white dark:bg-slate-800 shadow-sm hover:shadow-md"
                    >
                      <Image
                        src={bank.logo}
                        alt={bank.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain rounded-lg"
                      />
                      <span className="text-xs font-medium text-center line-clamp-2">
                        {bank.description}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </div>
            )} */}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-12">
						<Loader2 className="w-12 h-12 animate-spin text-gray-400 mb-4" />
						<p className="text-gray-600 dark:text-gray-400">Уншиж байна...</p>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
