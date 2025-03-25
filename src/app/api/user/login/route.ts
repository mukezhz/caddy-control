import { LoginFormSchema } from "@/schemas/user/login.schema";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const reqPayload = LoginFormSchema.parse(reqBody);

    console.log("req payload", reqPayload);

    return NextResponse.json(
      {
        message: "Logged in successfully!",
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
