"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "./backButton";
import type { ExamItem, VerifyData } from "./types";
import { CARD_CLS } from "./utils";

interface StepPaidProps {
	d: VerifyData;
	selectedExam: ExamItem | null;
	examineeNumber: string | null;
	onFinish: () => void;
	onBack: () => void;
}

export function StepPaid({
	d,
	selectedExam,
	examineeNumber,
	onFinish,
	onBack,
}: StepPaidProps) {
	const rows = [
		{ label: "Нэр", value: `${d.lastname} ${d.firstname}` },
		{ label: "Нэвтрэх нэр", value: d.login_name, mono: true },
		{ label: "Нууц үг", value: d.password, mono: true },
		...(examineeNumber
			? [{ label: "Шалгуулагч №", value: examineeNumber, mono: true }]
			: []),
		{ label: "Шалгалт", value: selectedExam?.name },
		{ label: "Сургууль", value: d.schoolname },
	];

	return (
		<div className="space-y-4">
			<Card className={`${CARD_CLS} border-primary/30`}>
				<CardContent className="p-8 space-y-5 text-center">
					<div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
						<CheckCircle2 size={32} className="text-primary" />
					</div>
					<div>
						<h2 className="text-xl font-bold">Бүртгэл амжилттай!</h2>
						<p className="text-xs text-muted-foreground mt-1">
							Шалгалтад амжилттай бүртгүүллээ
						</p>
					</div>
					<Card className={CARD_CLS}>
						<CardContent className="p-4 space-y-2">
							{rows.map((row) => (
								<div
									key={row.label}
									className="flex justify-between text-xs gap-2"
								>
									<span className="text-muted-foreground shrink-0">
										{row.label}
									</span>
									<span
										className={`font-medium text-right ${row.mono ? "font-mono" : ""}`}
									>
										{row.value || "—"}
									</span>
								</div>
							))}
						</CardContent>
					</Card>
					<p className="text-[11px] text-muted-foreground">
						Нэвтрэх нэр болон нууц үгээ ашиглан системд нэвтэрнэ үү
					</p>
					<Button onClick={onFinish} className="w-full h-11 font-bold gap-2">
						Дуусгах <ChevronRight size={15} />
					</Button>
				</CardContent>
			</Card>
			<BackButton onClick={onBack} label="Шалгалт сонгох руу буцах" />
		</div>
	);
}
