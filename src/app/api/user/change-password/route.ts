import prisma from "@/lib/prisma";
import { PasswordChangeSchema } from "@/schemas/user/auth.schema";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserFromHeader } from "../../_services/user/user-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }
    const reqBody = await request.json();
    const reqPayload = PasswordChangeSchema.parse(reqBody);
    const { confirmPassword } = reqPayload;

    const hashedPassword = await bcrypt.hash(confirmPassword, 10);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedPassword,
        forcePasswordChange: false,
      },
    });

    return NextResponse.json(
      {
        data: {
          message: "Password updated!",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation Failed",
          details: err.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}
