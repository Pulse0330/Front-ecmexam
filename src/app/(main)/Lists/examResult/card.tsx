// Full revised design and cleaned-up version of ExamResultsPage + ExamListItem
// NOTE: Update your component paths if necessary.

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    Target,
    XCircle,
    FileText,
    TrendingUp,
    BookmarkCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import ExamAnswersDialog from "./result";
import type { ExamresultListCardProps } from "@/types/exam/examResultList";

// ==============================
// Exam List Item Component
// ==============================

interface ExamListItemProps extends ExamresultListCardProps {
    onViewRank?: (examId: number) => void;
}

export const ExamListItem: React.FC<ExamListItemProps> = ({ exam, onViewRank }) => {
    const router = useRouter();
    const [showAnswers, setShowAnswers] = useState(false);

    const finished = exam.isfinished === 1;
    const examDate = new Date(exam.Ognoo);

    const formatDate = (date: Date) =>
        date.toLocaleDateString("mn-MN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const formatTime = (date: Date) =>
        date.toLocaleTimeString("mn-MN", {
            hour: "2-digit",
            minute: "2-digit",
        });

    const getPercentageColor = (perc: number) => {
        if (perc >= 80) return "bg-teal-500/10 text-teal-600 border-teal-500";
        if (perc >= 50) return "bg-sky-500/10 text-sky-600 border-sky-500";
        return "bg-rose-500/10 text-rose-600 border-rose-500";
    };

    // ✔️ Одоо зөвхөн энэ function л router push хийнэ
    const handleDetailsClick = () => {
        if (finished) {
            router.push(`/examResult/${exam.exam_id}_${exam.test_id}`);
        }
    };

    const handleRankClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onViewRank && finished) onViewRank(exam.exam_id);
    };

    const handleAnswersClick = () => {
        if (finished) setShowAnswers(true);
    };

    return (
        <Card
            className={`shadow-sm transition-none ${
                finished
                    ? "border-l-4 border-sky-500/80 bg-sky-500/5"
                    : "opacity-70 border-l-4 border-muted-foreground/30 bg-muted/20"
            }`}
        >
            <CardHeader className="py-3 px-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">

                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                finished
                                    ? "bg-sky-500 text-sky-50 shadow-md shadow-sky-500/30"
                                    : "bg-muted-foreground/10 text-muted-foreground/70"
                            }`}
                        >
                            {finished ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-bold leading-snug mb-1 truncate">
                                {exam.title}
                            </CardTitle>

                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant={finished ? "default" : "secondary"}
                                    className="text-xs h-5 px-2 font-semibold"
                                >
                                    {finished ? "✓ Дууссан" : "⏱ Дуусаагүй"}
                                </Badge>

                                {finished && exam.test_perc !== undefined && (
                                    <Badge
                                        className={`text-xs h-5 px-2 font-bold uppercase border ${getPercentageColor(
                                            exam.test_perc
                                        )}`}
                                    >
                                        {exam.test_perc}%
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 px-5 pb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm border-t pt-3">

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-sky-500" />
                            Огноо
                        </div>
                        <span className="truncate text-xs font-medium">
                            {formatDate(examDate)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 text-sky-500" />
                            Эхэлсэн
                        </div>
                        <span className="truncate text-xs font-medium">
                            {formatTime(examDate)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Target className="w-3.5 h-3.5 text-sky-500" />
                            Нийт мин
                        </div>
                        <span className="truncate text-xs font-medium">
                            {exam.exam_minute} мин
                        </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 text-sky-500" />
                            Гүйцэтгэсэн
                        </div>
                        <span className="truncate text-xs font-medium">
                            {exam.test_time && finished ? exam.test_time : "—"}
                        </span>
                    </div>
                </div>

                {finished && (
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t">

                        {/* ✔ Зөвхөн энэ үед router push ажиллана */}
                        <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white"
                            onClick={handleDetailsClick}
                        >
                            Дэлгэрэнгүй харах
                            <ArrowRight className="w-3 h-3 ml-1.5" />
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2.5 font-semibold"
                            onClick={handleAnswersClick}
                        >
                            <FileText className="w-3 h-3 mr-1.5" /> Үр дүн
                        </Button>

                        {onViewRank && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2.5 font-semibold"
                                onClick={handleRankClick}
                            >
                                <TrendingUp className="w-3 h-3 mr-1.5" /> Rank
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>

            <ExamAnswersDialog
                examId={exam.exam_id}
                testId={exam.test_id}
                open={showAnswers}
                onOpenChange={setShowAnswers}
            />
        </Card>
    );
};

// ==============================
// Main Page Component
// ==============================

interface Exam {
    exam_id: number;
    test_id: number;
    title: string;
    Ognoo: string;
    isfinished: 0 | 1;
    exam_minute: number;
    test_time?: string;
    test_perc?: number;
}

const ExamResultsPage: React.FC = () => {
    const realExamResults: Exam[] = [];

    const handleViewRank = (examId: number) => {
        console.log("Rank харах:", examId);
    };

    const isLoading = false;

    return (
        <div className="min-h-screen bg-background">
            <header className="py-8 border-b bg-card">
                <div className="container max-w-4xl mx-auto px-4 sm:px-6 flex items-center gap-3">
                    <BookmarkCheck className="w-8 h-8 text-sky-500" />
                    <h1 className="text-3xl font-bold tracking-tight">Шалгалтын Үр Дүнгийн Жагсаалт</h1>
                </div>
            </header>

            <main className="py-5">
                <div className="container max-w-4xl mx-auto px-4 sm:px-6">
                    {isLoading && (
                        <p className="text-center text-muted-foreground">Өгөгдөл ачааллаж байна...</p>
                    )}

                    {!isLoading && realExamResults.length > 0 && (
                        <div className="flex flex-col space-y-4">
                            {realExamResults.map((exam) => (
                                <ExamListItem
                                    key={exam.exam_id}
                                    exam={exam as any}
                                    onViewRank={handleViewRank}
                                />
                            ))}
                        </div>
                    )}

                    {!isLoading && realExamResults.length === 0 && (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-semibold text-muted-foreground">
                                Шалгалтын үр дүн одоогоор алга байна.
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground/70">
                                Таны гүйцэтгэсэн шалгалтууд энд гарч ирнэ.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ExamResultsPage;
