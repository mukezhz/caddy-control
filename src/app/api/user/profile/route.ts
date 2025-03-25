import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        hashedPassword: true,
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

    return NextResponse.json({ data: user });
  } catch (err) {
    console.log("error", err);
    return NextResponse.json(
      { error: "Failed to retrieve user profile." },
      { status: 500 }
    );
  }
}
