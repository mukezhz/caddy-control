import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./app/api/_services/token/token.service";
import prisma from "./lib/prisma";
import { JwtPayload } from "jsonwebtoken";

const unauthenticatedRoutes = ["/api/user/login"]

export async function middleware(req: NextRequest) {
  if (unauthenticatedRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      {
        error: "Unauthorized!",
      },
      {
        status: 401,
      }
    );
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return NextResponse.json(
      {
        error: "Unauthorized!",
      },
      {
        status: 401,
      }
    );
  }
  const tokenPayload = verifyToken(token);
  if (!tokenPayload) {
    return NextResponse.json(
      {
        error: "Unauthorized!",
      },
      {
        status: 401,
      }
    );
  }
  const user = await prisma.user.findUnique({
    where: {
      id: (tokenPayload as JwtPayload).id!,
    },
  });
  if (!user) {
    return NextResponse.json(
      {
        error: "Unauthorized!",
      },
      {
        status: 401,
      }
    );
  }
  const res = NextResponse.next();
  res.headers.set("x-user-id", user.id);
  return res;
}

export const config = {
  // matcher: [
  //   "/((?!api|_next/static|_next/image|favicon.ico).*)"
  // ],
  matcher: "/api/:path*",
  runtime: "nodejs",
};
