"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ExamlistsData } from "@/types/exam/examlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ExamRulesDialog from "./dialog";

interface ExamCardProps {
  exam: ExamlistsData;
  now: Date;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, now }) => {
  const router = useRouter();
  const [showRulesDialog, setShowRulesDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Device width check
  useEffect(() => {
    const updateWidth = () => setIsMobile(window.innerWidth < 640);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const { startTime, endTime } = useMemo(() => {
    const s = new Date(exam.ognoo);
    const e = new Date(s.getTime() + exam.exam_minute * 60000);
    return { startTime: s, endTime: e };
  }, [exam.ognoo, exam.exam_minute]);

  const isFinished = now > endTime;
  const isActive = now >= startTime && now <= endTime;

  const handleStartExam = () => {
    // Dialog дотор "Шалгалт эхлүүлэх" товч дээр дарсан үед энд дуудагдана
    router.push(`/exam/${exam.exam_id}`);
  };

  return (
    <>
      <div
        className={cn(
          "border rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer w-full",
          isActive && "bg-green-50 border-green-300",
          isFinished && "bg-gray-50 border-gray-300"
        )}
        onClick={() => setShowRulesDialog(true)}
      >
        <h2 className="text-lg font-bold">{exam.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Багш: {exam.teach_name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Эхлэх: {startTime.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Дуусах: {endTime.toLocaleString()}
        </p>
        <Button
          size="sm"
          className="mt-4 w-full flex items-center justify-center gap-2"
        >
          {isFinished ? "Үр дүн харах" : "Шалгалт эхлүүлэх"}
          <ArrowRight size={16} />
        </Button>
      </div>

      {/* Dialog дуудах */}
      <ExamRulesDialog
        open={showRulesDialog}
        onOpenChange={setShowRulesDialog}
        onConfirm={handleStartExam}
        isMobile={isMobile}
      />
    </>
  );
};

export default ExamCard;
