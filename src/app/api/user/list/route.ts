import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getUserFromHeader,
  hasPermission,
} from "../../_services/user/user-service";
import { Resources } from "@/config/resources";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to list users
    // Note: Having user_management:manage permission automatically includes user_management:view access
    if (
      !user.isAdmin &&
      !hasPermission(user, Resources.WithView(Resources.USER_MANAGEMENT))
    ) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        forcePasswordChange: true,
        isAdmin: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users." },
      { status: 500 }
    );
  }
}
