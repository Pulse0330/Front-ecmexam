import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get("auth-token")?.value;

	const publicRoutes = ["/login", "/sign", "/forgot", "/not-found"];
	const isPublicRoute = publicRoutes.some((route) =>
		pathname.startsWith(route),
	);

	// Token байхгүй бол login руу
	if (!token) {
		if (isPublicRoute) {
			return NextResponse.next();
		}
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Token байгаа public route руу орохыг хориглох
	if (isPublicRoute) {
		return NextResponse.redirect(new URL("/home", request.url));
	}

	// Token байвал үргэлжлүүлэх
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api/|_next/|_static/|_vercel|favicon.ico|ECM.png|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
	],
};
