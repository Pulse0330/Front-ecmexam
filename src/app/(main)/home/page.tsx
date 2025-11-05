// HomePage.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getHomeScreen, getUserProfile } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { HomeResponseType } from "@/types/home";
import { UserProfileResponseType } from "@/types/user";
import { BannerCarousel } from "./banner";
import PaymentExam from "./courseexam";
import ExamLists from "./examlists";
import UseAnimations from "react-useanimations";
import loading2 from "react-useanimations/lib/loading2";
import HomeSorilLists from "./sorillists";

export default function HomePage() {
  const { userId } = useAuthStore();

  const {
    data: homeData,
    isLoading: isHomeLoading,
    isError: isHomeError,
    error: homeError,
  } = useQuery<HomeResponseType>({
    queryKey: ["homeScreen", userId],
    queryFn: () => getHomeScreen(userId!),
    enabled: !!userId,
  });

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery<UserProfileResponseType>({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });

  if (!userId)
    return <p className="text-center mt-10">Хэрэглэгч нэвтрээгүй байна.</p>;

  if (isHomeLoading || isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center max-h-[180vh] space-y-4 animate-in fade-in-0 zoom-in-95 duration-300">
        <UseAnimations
          animation={loading2}
          size={56}
          strokeColor="#3b82f6"
          loop
        />
        <p className="text-muted-foreground animate-pulse">Уншиж байна...</p>
      </div>
    );
  }

  if (isHomeError)
    return (
      <p className="text-center mt-10 text-red-500">
        Home API Error: {(homeError as Error).message}
      </p>
    );

  if (isProfileError)
    return (
      <p className="text-center mt-10 text-red-500">
        Profile API Error: {(profileError as Error).message}
      </p>
    );

  const username = profileData?.RetData?.[0]?.username || "Хэрэглэгч";

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold">Сайн байна уу, {username}!</h1>

      {/* Banner-ууд */}
      <div className="animate-in fade-in-0 duration-700 delay-150">
        <BannerCarousel banners={homeData?.RetDataFirst || []} />
      </div>

      {/* PaymentExam компонент дуудалт */}
      <div className="mt-6">
        <PaymentExam courses={homeData?.RetDataSecond || []} />
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Шалгалтууд</h2>
        <ExamLists exams={homeData?.RetDataThirt || []} />
      </div>
      <h2 className="text-xl font-bold mb-4">Сорилууд</h2>
      <div className="mt-6">
        <HomeSorilLists pastExams={homeData?.RetDataFourth || []} />
      </div>
    </div>
  );
}
