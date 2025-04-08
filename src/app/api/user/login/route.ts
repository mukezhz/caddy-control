import prisma from "@/lib/prisma";
import { LoginFormSchema } from "@/schemas/user/auth.schema";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateToken } from "../../_services/token/token.service";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const reqPayload = LoginFormSchema.parse(reqBody);
    const { username, password } = reqPayload;
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          error: "User not found!",
        },
        {
          status: 404,
        }
      );
    }
    const pwMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!pwMatch) {
      return NextResponse.json(
        {
          error: "Username or password is incorrect!",
        },
        {
          status: 404,
        }
      );
    }
    const accessToken = generateToken({ id: user.id, username: user.username });
    return NextResponse.json(
      {
        data: {
          accessToken,
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
      { error: "Failed to authenticate user." },
      { status: 500 }
    );
  }
}
