import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_API_URL: "https://ottapp.ecm.mn/api",
		NEXT_PUBLIC_OTP_API_URL: "https://api-message.ecm.mn",
	},
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
