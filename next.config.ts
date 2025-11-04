import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: "https://ottapp.ecm.mn/api",
  },
  images: {
    unoptimized: true, // ЭНД НЭМЭХ
    remotePatterns: [
      {
        protocol: "https",
        hostname: "skuul.mn",
        port: "",
        pathname: "/**", 
      },
    ],
  },
};

export default nextConfig;