"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Download } from "lucide-react";
import { toast } from "sonner";
import { ExamTable } from "@/app/(dash)/exam-schedule/ExamTable";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getExam, getExamSave } from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ExamMaterialsPage() {
  const queryClient = useQueryClient();
  const { userId } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["get_exam"],
    queryFn: () => getExam({ userId: userId ? Number(userId) : 0 }),
    enabled: !!userId,
  });
  console.log("data:", data);

  const { mutate: examSave, isPending } = useMutation({
    mutationFn: getExamSave,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["get_exam"] });
      toast.success(res.RetResponse.ResponseMessage || "Амжилттай");
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-2">
      <header className="relative mb-2 overflow-hidden rounded-[28px] border border-black/5 bg-background/80 px-5 py-5 text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-white/15 dark:bg-background/55 dark:shadow-[0_8px_40px_rgba(0,0,0,0.18)] supports-backdrop-filter:bg-background/75 dark:supports-backdrop-filter:bg-background/45">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0.35),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-black/10 to-transparent dark:via-white/60" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-white/80 text-primary shadow-[0_6px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/20 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                  Шалгалтын ерөнхий мэдээлэл
                </h1>

                <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 -mb-1 text-xs font-medium text-primary">
                  Нийт {data?.RetData?.length || 0} шалгалт
                </div>
              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Та хуваарь татах дээр дарж шалгалтыг шинэчлэх боломжтой.
              </p>
            </div>
          </div>

          <Button onClick={() => examSave()} disabled={isPending}>
            {isPending ? (
              <div className="flex items-center gap-2">
                <Spinner />
                Татаж байна...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download size={14} />
                Хуваарь татах
              </div>
            )}
          </Button>
        </div>
      </header>

      <ExamTable
        data={data?.RetData || []}
        isLoading={isLoading}
        onFetchData={() => examSave()}
        expandAllOnLoad={false}
      />
    </div>
  );
}
