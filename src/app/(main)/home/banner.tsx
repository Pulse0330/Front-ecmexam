"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Banner } from "@/types/home";

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

	const activeBanners = banners.filter((_, idx) => !closedBanners[idx]);

	if (!banners || banners.length === 0) return null;
	if (activeBanners.length === 0) return null;

	return (
		<div className="my-4">
			{isCarousel ? (
				<div className="relative rounded-xl overflow-hidden shadow-xl">
					<Swiper
						modules={[Autoplay, Navigation, Pagination]}
						navigation
						pagination={{ clickable: true }}
						autoplay={{ delay: 5000, disableOnInteraction: false }}
						spaceBetween={20}
						slidesPerView={1}
						loop={activeBanners.length > 1}
						className="banner-swiper"
					>
						{banners.map((banner, idx) =>
							closedBanners[idx] ? null : (
								<SwiperSlide key={banner?.url}>
									<div className="relative group">
										<Button
											onClick={() => closeBanner(idx)}
											size="icon"
											variant="secondary"
											className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
										>
											<X className="w-4 h-4" />
										</Button>
										<a
											href={banner.url}
											target="_blank"
											rel="noreferrer"
											className="block overflow-hidden"
										>
											<div className="relative overflow-hidden">
												<Image
													src={banner.filename}
													alt={banner.title}
													width={1200}
													height={500}
													className="w-full h-64 md:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
													priority
												/>
												<div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
											</div>
											<div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent">
												<h3 className="text-white font-bold text-xl md:text-2xl drop-shadow-lg">
													{banner.title}
												</h3>
												{banner.descr && (
													<p className="text-white/90 text-sm md:text-base mt-2 drop-shadow">
														{banner.descr}
													</p>
												)}
											</div>
										</a>
									</div>
								</SwiperSlide>
							),
						)}
					</Swiper>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{banners.map((banner, idx) =>
						closedBanners[idx] ? null : (
							<div
								key={banner.url}
								className="relative group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-card border border-border"
							>
								<Button
									onClick={() => closeBanner(idx)}
									size="icon"
									variant="secondary"
									className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 shadow-lg"
								>
									<X className="w-4 h-4" />
								</Button>
								<a
									href={banner.url}
									target="_blank"
									rel="noreferrer"
									className="block"
								>
									<div className="relative overflow-hidden">
										<Image
											src={banner.filename}
											alt={banner.title}
											width={600}
											height={300}
											className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
										/>
										<div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									</div>
									<div className="p-4 border-t border-border">
										<h3 className="font-bold text-lg text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
											{banner.title}
										</h3>
										{banner.descr && (
											<p className="text-sm text-muted-foreground mt-2 line-clamp-2">
												{banner.descr}
											</p>
										)}
									</div>
								</a>
							</div>
						),
					)}
				</div>
			)}

			<style jsx global>{`
				.banner-swiper .swiper-button-next,
				.banner-swiper .swiper-button-prev {
					background: rgba(0, 0, 0, 0.5);
					width: 40px;
					height: 40px;
					border-radius: 50%;
					backdrop-filter: blur(10px);
				}

				.banner-swiper .swiper-button-next:after,
				.banner-swiper .swiper-button-prev:after {
					font-size: 16px;
					color: white;
					font-weight: bold;
				}

				.banner-swiper .swiper-button-next:hover,
				.banner-swiper .swiper-button-prev:hover {
					background: rgba(0, 0, 0, 0.7);
				}

				.banner-swiper .swiper-pagination-bullet {
					background: white;
					opacity: 0.5;
					width: 10px;
					height: 10px;
				}

				.banner-swiper .swiper-pagination-bullet-active {
					opacity: 1;
					background: white;
					width: 24px;
					border-radius: 5px;
				}
			`}</style>
		</div>
	);
}
