import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("running")
  // check for token, if none send to login
  // const authHeader = req.headers.get('Authorization');
  // console.log("auth header", authHeader)

  // const user = await prisma.user.findFirst({
  //   select: {
  //     id: true,
  //   },
  // });
  // const isSetupPage = req.nextUrl.pathname.startsWith("/login");
  // if (!user && !isSetupPage) {
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }
  // if (user && isSetupPage) {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
  // matcher: [
  //   "/((?!api|_next/static|_next/image|favicon.ico).*)"
  // ],
  runtime: "nodejs",
};
