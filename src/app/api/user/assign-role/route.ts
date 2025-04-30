import { NextRequest, NextResponse } from "next/server";
import { AssignRoleSchema } from "@/schemas/user/roles.schema";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getUserFromHeader, hasPermission } from "../../_services/user/user-service";
import { Resources } from "@/config/resources";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user has permission to assign roles (requires admin or user_management:manage)
    if (!user.isAdmin && !hasPermission(user, Resources.WithManage(Resources.USER_MANAGEMENT))) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const reqPayload = AssignRoleSchema.parse(reqBody);
    const { userId, roleId } = reqPayload;

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found." },
        { status: 404 }
      );
    }

    // Update user's role
    await prisma.user.update({
      where: { id: userId },
      data: { roleId }
    });

    return NextResponse.json(
      {
        message: "Role assigned successfully!",
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
    console.error("Error assigning role:", err);
    return NextResponse.json(
      { error: "Failed to assign role." },
      { status: 500 }
    );
  }
}