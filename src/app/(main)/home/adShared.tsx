"use client";

import Image from "next/image";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export type AdMediaType = "image" | "video";

export const isExternalUrl = (href: string) => /^https?:\/\//i.test(href);

interface AdLinkProps
	extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
	href?: string;
	children: ReactNode;
}

// Гадны холбоос (facebook гэх мэт) шинэ табд, дотоод холбоос Next Link-ээр нээгдэнэ
export function AdLink({ href, children, className, ...rest }: AdLinkProps) {
	if (!href) return <div className={className}>{children}</div>;
	if (isExternalUrl(href)) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={className}
				{...rest}
			>
				{children}
			</a>
		);
	}
	return (
		<Link href={href} className={className} {...rest}>
			{children}
		</Link>
	);
}

interface AdMediaProps {
	src: string;
	type?: AdMediaType;
	sizes: string;
	priority?: boolean;
	fit?: "cover" | "contain";
	className?: string;
}

// Эцэг элемент нь relative байх ёстой (fill)
export function AdMedia({
	src,
	type = "image",
	sizes,
	priority,
	fit = "cover",
	className = "",
}: AdMediaProps) {
	const fitClass = fit === "contain" ? "object-contain" : "object-cover";

	if (type === "video") {
		return (
			<video
				src={src}
				autoPlay
				muted
				loop
				playsInline
				preload="metadata"
				aria-hidden
				className={`absolute inset-0 h-full w-full ${fitClass} ${className}`}
			/>
		);
	}

	return (
		<Image
			src={src}
			alt=""
			fill
			sizes={sizes}
			priority={priority}
			draggable={false}
			className={`${fitClass} select-none ${className}`}
		/>
	);
}