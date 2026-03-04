"use client";

import {
	AlertCircle,
	CheckCircle2,
	ChevronRight,
	CreditCard,
	Loader2,
	User,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { VerifyData } from "./types";
import { CARD_CLS } from "./utils";

interface StepPreviewProps {
	d: VerifyData;
	isPaid: boolean;
	isLoading: boolean;
	qpayError: string;
	onQPay: () => void;
	onSendAndProceed: () => void;
}

export function StepPreview({
	d,
	isPaid,
	isLoading,
	qpayError,
	onQPay,
	onSendAndProceed,
}: StepPreviewProps) {
	const calledRef = useRef(false);

	// Төлбөр амжилттай төлөгдмөгц шууд дуудна, давхар дуудахгүй
	useEffect(() => {
		if (isPaid && !isLoading && !calledRef.current) {
			calledRef.current = true;
			onSendAndProceed();
		}
	}, [isPaid, isLoading, onSendAndProceed]);

	return (
		<Card className={CARD_CLS}>
			<CardHeader className="pb-3 pt-5 px-5">
				<div className="flex items-center gap-3">
					{d.img_url ? (
						<img
							src={d.img_url}
							alt="profile"
							className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
						/>
					) : (
						<div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
							<User size={22} className="text-primary/60" />
						</div>
					)}
					<div>
						<CardTitle className="text-base font-bold">
							{d.lastname} {d.firstname}
						</CardTitle>
						<p className="text-[11px] text-muted-foreground font-mono mt-0.5">
							{d.reg_number}
						</p>
						<Badge variant="secondary" className="text-[10px] mt-1 gap-1">
							<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
							{d.gender_code === "M" ? "Эрэгтэй" : "Эмэгтэй"}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="px-5 pb-5 space-y-4">
				{/* ── QPay төлбөр ── */}
				<div className="rounded-2xl overflow-hidden border border-primary/20 shadow-sm">
					<div className="bg-primary/10 px-4 py-3 flex items-center gap-2 border-b border-primary/15">
						<div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
							<CreditCard size={14} className="text-primary" />
						</div>
						<div>
							<p className="text-xs font-bold text-foreground">
								Шалгалтын хураамж
							</p>
							<p className="text-[10px] text-muted-foreground">
								QPay-ээр шууд төлбөр төлөх
							</p>
						</div>
						<span className="ml-auto text-xl font-extrabold text-primary">
							20,000₮
						</span>
					</div>
					<div className="bg-white/40 dark:bg-gray-900/40 px-4 py-3 space-y-3">
						{isPaid ? (
							<div className="space-y-3">
								<div className="flex items-center gap-2 p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl">
									<CheckCircle2 size={13} className="text-green-600 shrink-0" />
									<p className="text-[11px] text-green-700 dark:text-green-400 font-medium">
										Төлбөр амжилттай төлөгдлөо
									</p>
								</div>
								<Button
									onClick={onSendAndProceed}
									disabled={isLoading}
									className="w-full h-11 font-bold shadow-md gap-2 text-sm"
								>
									{isLoading ? (
										<>
											<Loader2 size={15} className="animate-spin" /> Илгээж
											байна...
										</>
									) : (
										<>
											Мэдээлэл баталгаажуулах <ChevronRight size={15} />
										</>
									)}
								</Button>
							</div>
						) : (
							<>
								{qpayError && (
									<div className="flex items-center gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-xl">
										<AlertCircle
											size={13}
											className="text-destructive shrink-0"
										/>
										<p className="text-[11px] text-destructive">{qpayError}</p>
									</div>
								)}
								<Button
									onClick={onQPay}
									disabled={isLoading}
									className="w-full h-11 font-bold shadow-md gap-2 text-sm"
								>
									{isLoading ? (
										<>
											<Loader2 size={15} className="animate-spin" /> Уншиж
											байна...
										</>
									) : (
										<>
											<svg
												width="15"
												height="15"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2.5"
											>
												<rect x="2" y="5" width="20" height="14" rx="2" />
												<path d="M2 10h20" />
												<title>qpay</title>
											</svg>
											QPay-ээр төлбөр төлөх
										</>
									)}
								</Button>
							</>
						)}
					</div>
				</div>

				{!isPaid && (
					<div className="space-y-1.5">
						<p className="text-[11px] text-center font-medium">
							Төлбөр төлөгдсөнөөр таны бүртгэл баталгаажна.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
