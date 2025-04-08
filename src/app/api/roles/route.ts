import { NextRequest, NextResponse } from "next/server";
import { CreateRoleSchema } from "@/schemas/user/roles.schema";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getUserFromHeader, hasPermission } from "../_services/user/user-service";

// Get all roles
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user has permission to view roles (requires admin or system:manage)
    if (!user.isAdmin && !hasPermission(user, "system:manage") && !hasPermission(user, "system:view")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform roles to match expected format
    const transformedRoles = roles.map(role => ({
      ...role,
      permissions: role.permissions.map(rp => rp.permission)
    }));

    return NextResponse.json({
      data: transformedRoles,
      total: transformedRoles.length,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles." },
      { status: 500 }
    );
  }
}

// Create a new role
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromHeader(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if user has permission to create roles (requires admin or system:manage)
    if (!user.isAdmin && !hasPermission(user, "system:manage")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    const reqBody = await request.json();
    const reqPayload = CreateRoleSchema.parse(reqBody);
    const { name, description, permissions } = reqPayload;

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description,
      },
    });

    // Add permissions if provided
    if (permissions && permissions.length > 0) {
      const permissionConnections = permissions.map(permissionId => ({
        permissionId,
        roleId: role.id
      }));

      await prisma.rolePermission.createMany({
        data: permissionConnections,
      });
    }

    return NextResponse.json(
      {
        message: "Role created successfully!",
        data: role,
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
    console.error("Error creating role:", err);
    return NextResponse.json(
      { error: "Failed to create role." },
      { status: 500 }
    );
  }
}