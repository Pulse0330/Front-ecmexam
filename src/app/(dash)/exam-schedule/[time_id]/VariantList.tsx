import { FileText } from "lucide-react";
import { EmptyState } from "@/components/page/pageStates";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExamVariant } from "@/types/dashboard/exam.types";

interface Props {
	data?: ExamVariant[] | null;
	isLoading?: boolean;
}

export function VariantList({ data, isLoading }: Props) {
	// 1️⃣ Loading
	if (isLoading) {
		return (
			<Card className="rounded-2xl shadow-sm">
				<CardHeader>
					<Skeleton className="h-6 w-48" />
				</CardHeader>

				<CardContent className="space-y-4">
					<Skeleton className="h-4 w-40" />

					<div className="flex gap-2">
						<Skeleton className="h-10 px-3 w-20 rounded-full" />
						<Skeleton className="h-10 px-3 w-20 rounded-full" />
						<Skeleton className="h-10 px-3 w-20 rounded-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	// 2️⃣ Data байхгүй
	if (!data || data.length === 0) {
		return (
			<EmptyState
				icon={FileText}
				title="Материалын хувилбар татагдаагүй байна"
				description="Шалгалт эхлэхээс 1 цагийн өмнө «Материал татах» товчоор татна уу."
				className="py-10"
			/>
		);
	}

	// 3️⃣ Data байгаа
	const lesson = data[0];

	return (
		<Card className="gap-2 rounded-2xl shadow-sm">
			<CardHeader>
				<CardTitle className="text-base font-semibold">
					{lesson.lesson_name}
				</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex flex-wrap gap-2">
					{data.map((v, i) => (
						<Badge
							key={`${v.variantId}-${i}`}
							variant="secondary"
							className="h-9 rounded-full px-3 text-sm"
						>
							Хувилбар: {v.variant_number}
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
