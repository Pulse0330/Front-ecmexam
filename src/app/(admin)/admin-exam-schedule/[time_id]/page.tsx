"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarRange, Clock, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useMemo } from "react";
import { toast } from "sonner";
import { IBackButton } from "@/components/iBackButton";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton"; // Skeleton байвал ашиглах
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  apiExamDateActive,
  checkVariantFill,
  getExam,
  getExamInfo,
  getExamMateralVariantDownload,
  getExamMetaralList,
} from "@/lib/dash.api";
import { useAuthStore } from "@/stores/useAuthStore";

interface ExamTimePageProps {
  params: Promise<{ time_id: string }>;
}

export default function ExamTimePage({ params }: ExamTimePageProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { time_id: rawId } = use(params);
  const { userId } = useAuthStore();
  const [time_id, exam_id] = rawId.split("-");
  const { data: examInfo, isLoading: isInfoLoading } = useQuery({
    queryKey: ["api_exam_info_by_examdateid", time_id, userId],
    queryFn: () =>
      getExamInfo({
        userId: userId ? Number(userId) : 0,
        examDateId: Number(time_id),
      }),
    enabled: !!userId && !!time_id,
    select: (res) => res.RetData?.[0],
  });
  console.log("examInfo:", examInfo);

  const { data: materalData, isLoading: materalIsLoading } = useQuery({
    queryKey: ["api_examination_variants", time_id, userId, exam_id],
    queryFn: () =>
      getExamMetaralList({
        userId: userId ? Number(userId) : 0,
        examDateId: Number(time_id),
        examId: Number(exam_id),
      }),
    enabled: !!userId && !!time_id && !!exam_id,
  });

  const { data: examListData } = useQuery({
    queryKey: ["admin_exam_list_for_time", userId],
    queryFn: () => getExam({ userId: userId ? Number(userId) : 0 }),
    enabled: !!userId,
  });

  const selectedExamDate = useMemo(() => {
    const exams = examListData?.RetData || [];
    const currentExam = exams.find(
      (exam) => exam.id === Number(exam_id) || exam.exam_id === Number(exam_id),
    );
    if (!currentExam) return null;

    return (
      currentExam.exam_dates.find(
        (date) =>
          date.exam_date_id === Number(time_id) || date.id === Number(time_id),
      ) || null
    );
  }, [examListData, exam_id, time_id]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const payload = {
        userId: userId || 0,
        examId: Number(exam_id),
        examDateId: Number(time_id) || 0,
      };

      return getExamMateralVariantDownload(payload);
    },
    onSuccess: (res) => {
      if (res.RetData.error_code === "VAL_003") {
        toast.error(res.RetData.details);
      } else {
        queryClient.invalidateQueries({
          queryKey: ["api_examination_variants", time_id, userId, exam_id],
        });
      }
    },
  });

  const { mutate: activateMaterial, isPending: isActivatingMaterial } =
    useMutation({
      mutationFn: ({
        userId,
        examId,
        examDateId,
      }: {
        userId: number;
        examId: number;
        examDateId: number;
      }) => apiExamDateActive({ userId, examId, examDateId }),
      onSuccess: (res) => {
        if (res?.RetResponse?.ResponseType) {
          toast.success(
            res.RetResponse.ResponseMessage || "Материал амжилттай нээгдлээ.",
          );
          queryClient.invalidateQueries({
            queryKey: ["get_exam"],
          });
          return;
        }
        toast.error(
          res?.RetResponse?.ResponseMessage || "Материал нээхэд алдаа гарлаа.",
        );
      },
      onError: () => {
        toast.error("Материал нээхэд алдаа гарлаа.");
      },
    });

  const hasMaterial = (materalData?.RetData?.length ?? 0) > 0;
  const variants = materalData?.RetData || [];
  const { mutate: startExam, isPending: isStartingExam } = useMutation({
    mutationFn: async ({
      variantId,
      variantNumber,
    }: {
      variantId: number;
      variantNumber: number;
    }) => {
      const res = await checkVariantFill({
        variantId,
        examId: Number(exam_id),
        examDateId: Number(time_id),
        userId: Number(userId),
      });
      return { res, variantId, variantNumber };
    },
    onSuccess: ({ res, variantId, variantNumber }) => {
      const examRegIdCandidates = [
        (res as { exam_reg_id?: unknown })?.exam_reg_id,
        (res as { exam_registration_id?: unknown })?.exam_registration_id,
        (res as { RetData?: { exam_reg_id?: unknown } })?.RetData?.exam_reg_id,
        (res as { RetData?: { exam_registration_id?: unknown } })?.RetData
          ?.exam_registration_id,
        (res as { RetData?: Array<{ exam_reg_id?: unknown }> })?.RetData?.[0]
          ?.exam_reg_id,
        (res as { RetData?: Array<{ exam_registration_id?: unknown }> })
          ?.RetData?.[0]?.exam_registration_id,
      ];

      const examRegId =
        examRegIdCandidates
          .map((v) => Number(v))
          .find((v) => Number.isFinite(v) && v > 0) || 0;

      const params = new URLSearchParams({
        variant: String(variantNumber || 0),
        exam_type: "4",
        exam_date_id: String(Number(time_id) || 0),
        exam_reg_id: String(examRegId),
        exam_id: String(Number(exam_id) || 0),
        variant_id: String(variantId || 0),
        userid: String(Number(userId) || 0),
      });

      router.push(`/admin-exam/${Number(exam_id)}?${params.toString()}`);
    },
    onError: () => {
      toast.error("Шалгалт эхлүүлэхэд алдаа гарлаа.");
    },
  });

  return (
    <div className="py-2 max-w-7xl mx-auto space-y-2">
      <header>
        <div className="relative overflow-hidden rounded-[28px] border border-black/5 bg-background/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl md:p-5 dark:border-white/15 dark:bg-background/55 dark:shadow-[0_8px_40px_rgba(0,0,0,0.18)] supports-backdrop-filter:bg-background/75 dark:supports-backdrop-filter:bg-background/45">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0.35),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-black/10 to-transparent dark:via-white/60" />

          <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Left */}
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <IBackButton className="shrink-0" />

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/5 bg-white/80 text-primary shadow-[0_6px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/20 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                    <CalendarRange size={24} />
                  </div>

                  <div className="min-w-0">
                    {isInfoLoading ? (
                      <Skeleton className="h-8 w-64 rounded-xl" />
                    ) : (
                      <h1 className="wrap-break-word text-xl font-bold tracking-tight text-foreground md:text-2xl">
                        {examInfo?.name || "Шалгалтын мэдээлэл"}
                      </h1>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-muted-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        <Clock size={14} />
                        <span>Үргэлжлэх хугацаа:</span>
                        <span className="font-semibold text-foreground">
                          {examInfo?.duration || 0} минут
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-muted-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        <span>Эхлэх цаг:</span>
                        <span className="font-semibold text-foreground">
                          {selectedExamDate?.start_date
                            ? format(
                                new Date(selectedExamDate.start_date),
                                "HH:mm",
                              )
                            : "--:--"}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-muted-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        <span>Дуусах цаг:</span>
                        <span className="font-semibold text-foreground">
                          {selectedExamDate?.end_date
                            ? format(
                                new Date(selectedExamDate.end_date),
                                "HH:mm",
                              )
                            : "--:--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex w-full items-center justify-end gap-2 xl:w-auto">
              <Button
                variant={"outline"}
                className="h-11 rounded-2xl border-black/5 bg-white/70 px-4 shadow-[0_4px_14px_rgba(0,0,0,0.04)] backdrop-blur-xl hover:bg-white dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
                onClick={() => {
                  if (!userId) {
                    toast.error("Хэрэглэгчийн мэдээлэл дутуу байна.");
                    return;
                  }

                  const confirmed = window.confirm(
                    "Материал нээхдээ итгэлтэй байна уу?",
                  );
                  if (!confirmed) return;

                  activateMaterial({
                    userId: Number(userId),
                    examId: Number(exam_id),
                    examDateId: Number(time_id),
                  });
                }}
                disabled={isActivatingMaterial}
              >
                {isActivatingMaterial ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    Нээж байна...
                  </div>
                ) : (
                  "Материал нээх"
                )}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="w-full xl:w-auto">
                      <Button
                        onClick={() => mutate()}
                        disabled={isPending || hasMaterial}
                        className="h-11 w-full rounded-2xl border border-primary/15 px-4 shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_12px_28px_rgba(0,0,0,0.14)] xl:w-auto"
                      >
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <Spinner />
                            Татаж байна...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Download size={18} />
                            Материал татах
                          </div>
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>

                  {hasMaterial && (
                    <TooltipContent className="rounded-xl border text-slate-800 border-black/5 bg-background/95 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-background/80 dark:text-white">
                      <p>Материал татагдсан байна, дахин татах шаардлагагүй</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>
      <section className="relative overflow-hidden rounded-[28px] border border-black/5 bg-background/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl md:p-5 dark:border-white/15 dark:bg-background/55 dark:shadow-[0_8px_40px_rgba(0,0,0,0.18)] supports-backdrop-filter:bg-background/75 dark:supports-backdrop-filter:bg-background/45">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(255,255,255,0.35),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-black/10 to-transparent dark:via-white/60" />

        <div className="relative">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white/80 shadow-[0_6px_20px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/20 dark:bg-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <span className="text-sm font-semibold text-primary">
                  #{variants.length}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Хувилбарын жагсаалт
                </h2>
                <p className="text-sm text-muted-foreground">
                  Нийт {variants.length}
                </p>
              </div>
            </div>

            <span className="hidden rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
              {variants.length} хувилбар
            </span>
          </div>

          {materalIsLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-black/5 bg-white/60 px-4 py-6 text-sm text-muted-foreground shadow-[0_4px_14px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <Spinner />
              Ачаалж байна...
            </div>
          ) : variants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-black/2 px-4 py-8 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/3">
              Хувилбар олдсонгүй.
            </div>
          ) : (
            <div className="space-y-2">
              {variants.map((variant) => (
                <div
                  key={variant.variantId}
                  className="group rounded-2xl border border-black/5 bg-white/65 px-3 py-2 shadow-[0_4px_14px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        Хувилбар #{variant.variant_number}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {variant.lesson_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          startExam({
                            variantId: variant.variantId,
                            variantNumber: variant.variant_number,
                          });
                        }}
                        disabled={isStartingExam}
                        className="h-10 rounded-xl border-black/5 bg-white/70 px-4 shadow-[0_4px_14px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:bg-white dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
                      >
                        Шалгалт туршилтаар ажиллуулах
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
