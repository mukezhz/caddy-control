import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./app/api/_services/token/token.service";
import prisma from "./lib/prisma";
import { JwtPayload } from "jsonwebtoken";

const unauthenticatedRoutes = ["/api/user/login"];

export async function middleware(req: NextRequest) {
  if (unauthenticatedRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  const authHeader = req.headers.get("Authorization");
  const apiKey = req.headers.get("x-api-key");

  if (apiKey) {
    const validApiKey = await prisma.apiKeys.findUnique({
      where: { key: apiKey },
    });

    if (validApiKey) {
      const res = NextResponse.next();
      res.headers.set("x-auth-method", "api-key");
      return res;
    }
  }

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
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
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
