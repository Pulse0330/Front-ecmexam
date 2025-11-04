"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { getHomeScreen, getUserProfile } from "@/lib/api"; // user profile API
import { useAuthStore } from "@/stores/useAuthStore";
import { HomeResponseType } from "@/types/home";
import { UserProfileResponseType } from "@/types/user";

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

  if (isHomeLoading || isProfileLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-12 h-12 text-blue-500" />
      </div>
    );

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
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Сайн байна уу, {username}!</h1>

      {/* Banner-ууд */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {homeData?.RetDataFirst.map((banner) => (
          <a
            key={banner.url}
            href={banner.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded overflow-hidden shadow hover:shadow-lg transition"
          >
            <Image
              src={banner.filename}
              alt={banner.title}
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-2 text-center font-semibold">{banner.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
