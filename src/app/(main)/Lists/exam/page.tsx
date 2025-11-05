"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { getExamlists } from "@/lib/api";
import { ApiExamlistsResponse } from "@/types/exam/examlist";

export default function ExamListPage() {
  const { userId } = useAuthStore();

  const {
    data: queryData,
    isPending,
    error,
  } = useQuery<ApiExamlistsResponse>({
    queryKey: ["examlists", userId],
    queryFn: () => getExamlists(userId!),
    enabled: !!userId,
  });

  console.log("✅ userId:", userId);
  console.log("✅ queryData:", queryData);
  console.log("⏳ isPending:", isPending);
  console.log("❌ error:", error);

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">ExamListPage</h1>

      {isPending && <p>⏳ Ачаалж байна...</p>}
      {error && <p className="text-red-500">❌ Алдаа гарлаа</p>}
      {queryData && (
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-auto">
          {JSON.stringify(queryData, null, 2)}
        </pre>
      )}
    </div>
  );
}
