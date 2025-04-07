import { NextRequest, NextResponse } from "next/server";
import { CreatePermissionSchema } from "@/schemas/user/roles.schema";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getUserFromHeader, hasPermission } from "../_services/user/user-service";

// Get all permissions
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Allow both admins and users with system:manage permission
    if (!user.isAdmin && !hasPermission(user, "system:manage")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const permissions = await prisma.permission.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: permissions,
      total: permissions.length,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions." },
      { status: 500 }
    );
  }
}

// Create a new permission
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Allow both admins and users with system:manage permission
    if (!user.isAdmin && !hasPermission(user, "system:manage")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const reqPayload = CreatePermissionSchema.parse(reqBody);
    const { name, description } = reqPayload;

    // Check if permission with same name already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name }
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: "Permission with this name already exists." },
        { status: 409 }
      );
    }

    // Create permission
    const permission = await prisma.permission.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(
      {
        message: "Permission created successfully!",
        data: permission,
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
    console.error("Error creating permission:", err);
    return NextResponse.json(
      { error: "Failed to create permission." },
      { status: 500 }
    );
  }
}