import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
	// const { pathname } = request.nextUrl;
	// const token = request.cookies.get("auth-token")?.value;
	// const publicRoutes = ["/login", "/sign", "/forgot", "/not-found"];
	// const isPublicRoute = publicRoutes.some((route) =>
	//   pathname.startsWith(route)
	// );
	// if (!token && !isPublicRoute) {
	//   const loginUrl = new URL("/login", request.url);
	//   loginUrl.searchParams.set("redirect", pathname);
	//   return NextResponse.redirect(loginUrl);
	// }
	// if (token && isPublicRoute) {
	//   return NextResponse.redirect(new URL("/home", request.url));
	// }
	// return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api/|_next/|_static/|_vercel|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
	],
};
