"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Banner {
	title: string;
	filename: string;
	url: string;
	descr: string;
}

interface BannerProps {
	banners: Banner[];
}

export function BannerCarousel({ banners }: BannerProps) {
	const [closedBanners, setClosedBanners] = useState<boolean[]>(() =>
		Array(banners.length).fill(false),
	);

	const isCarousel = useMemo(() => banners.length > 3, [banners.length]);

	const closeBanner = (index: number) => {
		setClosedBanners((prev) => {
			const copy = [...prev];
			copy[index] = true;
			return copy;
		});
	};

	if (!banners || banners.length === 0) return null;

	return (
		<div className="my-4">
			{isCarousel ? (
				<Swiper
					modules={[Autoplay, Navigation, Pagination]}
					navigation
					pagination={{ clickable: true }}
					autoplay={{ delay: 5000 }}
					spaceBetween={20}
					slidesPerView={1}
				>
					{banners.map((banner, idx) =>
						closedBanners[idx] ? null : (
							<SwiperSlide key={idx}>
								<div className="relative">
									<button
										onClick={() => closeBanner(idx)}
										className="absolute top-2 right-2 z-10 bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center"
									>
										×
									</button>
									<a
										href={banner.url}
										target="_blank"
										rel="noreferrer"
										className="block overflow-hidden rounded shadow hover:shadow-lg transition"
									>
										<Image
											src={banner.filename}
											alt={banner.title}
											width={800}
											height={400}
											className="w-full h-64 md:h-80 object-cover"
										/>
										<div className="p-2 text-center font-semibold text-lg md:text-xl">
											{banner.title}
										</div>
									</a>
								</div>
							</SwiperSlide>
						),
					)}
				</Swiper>
			) : (
				<div className="flex gap-4 overflow-x-auto py-2">
					{banners.map((banner, idx) =>
						closedBanners[idx] ? null : (
							<div key={idx} className="relative shrink-0 w-64 md:w-72">
								<button
									onClick={() => closeBanner(idx)}
									className="absolute top-2 right-2 z-10 bg-black/40 text-white rounded-full w-6 h-6 flex items-center justify-center"
								>
									×
								</button>
								<a
									href={banner.url}
									target="_blank"
									rel="noreferrer"
									className="block overflow-hidden rounded shadow hover:shadow-lg transition"
								>
									<Image
										src={banner.filename}
										alt={banner.title}
										width={600}
										height={200}
										className="w-full h-48 object-cover"
									/>
									<div className="p-2 text-center font-semibold text-sm md:text-base">
										{banner.descr}
									</div>
								</a>
							</div>
						),
					)}
				</div>
			)}
		</div>
	);
}
