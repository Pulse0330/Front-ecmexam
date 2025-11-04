// src/lib/api.ts
import api from "./axios";
import { LoginResponseType } from "@/types/login";
import { HomeResponseType } from "@/types/home";
import { UserProfileResponseType } from "@/types/user";

export const loginRequest = async (
  username: string,
  password: string
): Promise<LoginResponseType> => {
  const { data } = await api.post<LoginResponseType>("/login", {
    username,
    password,
    deviceid: "",
    devicemodel: "",
  });
  return data;
};

// ===== HomeScreen request =====
export const getHomeScreen = async (
  userId: number
): Promise<HomeResponseType> => {
  const { data } = await api.post<HomeResponseType>("/gethomescreen", {
    user_id: userId,
  });
  return data;
};
// ===== UserProfile request =====
export const getUserProfile = async (
  userId: number
): Promise<UserProfileResponseType> => {
  const { data } = await api.post<UserProfileResponseType>("/getuserprofile", {
    user_id: userId,
  });
  return data;
};
