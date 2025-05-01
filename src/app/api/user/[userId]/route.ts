import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getUserFromHeader,
  hasPermission,
} from "../../_services/user/user-service";
import { Resources } from "@/config/resources";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getUserFromHeader(request);

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to delete users (requires admin or user_management:manage)
    if (
      !currentUser.isAdmin &&
      !hasPermission(
        currentUser,
        Resources.WithManage(Resources.USER_MANAGEMENT)
      )
    ) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const { userId } = await params;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      {
        message: "User deleted successfully.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }
}
