import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExamVariant } from "@/types/dashboard/exam.types";

interface Props {
	data?: ExamVariant[] | null;
	isLoading?: boolean;
	openExam: string | undefined;
}

export function VariantList({ data, isLoading, openExam }: Props) {
	// 1️⃣ Loading
	if (isLoading) {
		return (
			<Card>
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
			<Card>
				<CardContent className="py-10 text-center text-muted-foreground text-sm">
					Шалгалтын матерал вариентууд татах татагдаагүй байна. | Шалгалт
					эхэлхээс 1 цагын өмнө татна. <br />
					<span className="text-base">
						{openExam ? format(new Date(openExam), "yyyy.MM.dd HH:mm") : "-"}
					</span>
				</CardContent>
			</Card>
		);
	}

	// 3️⃣ Data байгаа
	const lesson = data[0];

	return (
		<Card className="gap-2">
			<CardHeader>
				<CardTitle>{lesson.lesson_name}</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="text-sm text-muted-foreground">
					Хэсэг: <span className="font-medium">{lesson.sections_cnt}</span> |
					Асуулт: <span className="font-medium">{lesson.questions_cnt}</span>
				</div>

				<div className="flex flex-wrap gap-2">
					{data.map((v) => (
						<Badge key={v.variantId} variant="secondary" className="h-10 px-3">
							Хувилбар: {v.variant_number}
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
