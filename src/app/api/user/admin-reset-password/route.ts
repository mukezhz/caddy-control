import { NextRequest, NextResponse } from "next/server";
import { AdminPasswordResetSchema } from "@/schemas/user/auth.schema";
import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  getUserFromHeader,
  hasPermission,
} from "../../_services/user/user-service";
import bcrypt from "bcryptjs";
import { Resources } from "@/config/resources";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to reset passwords (requires admin or user_management:manage)
    if (
      !user.isAdmin &&
      !hasPermission(user, Resources.WithManage(Resources.USER_MANAGEMENT))
    ) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const reqPayload = AdminPasswordResetSchema.parse(reqBody);
    const { userId, newPassword, forcePasswordChange } = reqPayload;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword,
        forcePasswordChange,
      },
    });

    return NextResponse.json(
      {
        message: "Password has been reset successfully.",
      },
      { status: 200 }
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
    console.error("Error resetting password:", err);
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
