import { NextRequest, NextResponse } from "next/server";
import { UpdateRoleSchema } from "@/schemas/user/roles.schema";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { getUserFromHeader, hasPermission } from "../../_services/user/user-service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: roleId } = await params;

    // Check user authorization
    const user = await getUserFromHeader(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to update roles (requires admin or system:manage)
    if (!user.isAdmin && !hasPermission(user, "system:manage")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    // Verify role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found." },
        { status: 404 }
      );
    }

    // Validate request body
    const reqBody = await request.json();
    const reqPayload = UpdateRoleSchema.parse(reqBody);
    const { name, description, permissions } = reqPayload;

    // Update role basic info
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name,
        description,
      },
    });

    // If permissions are provided, update role permissions
    if (permissions) {
      // First, remove all existing permissions for this role
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      });

      // Then add new permissions
      if (permissions.length > 0) {
        const permissionConnections = permissions.map(permissionId => ({
          permissionId,
          roleId
        }));

        await prisma.rolePermission.createMany({
          data: permissionConnections,
        });
      }
    }

    return NextResponse.json({
      message: "Role updated successfully!",
      data: updatedRole,
    });
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
    console.error("Error updating role:", err);
    return NextResponse.json(
      { error: "Failed to update role." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roleId } = await params;

    // Check user authorization
    const user = await getUserFromHeader(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has permission to delete roles (requires admin or system:manage)
    if (!user.isAdmin && !hasPermission(user, "system:manage")) {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      );
    }

    // Verify role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found." },
        { status: 404 }
      );
    }

    // Check if role is assigned to any users
    const usersWithRole = await prisma.user.count({
      where: { roleId },
    });

    if (usersWithRole > 0) {
      return NextResponse.json(
        { error: "Cannot delete role that is assigned to users." },
        { status: 409 }
      );
    }

    // Delete role permissions first
    await prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Delete the role
    await prisma.role.delete({
      where: { id: roleId },
    });

    return NextResponse.json({
      message: "Role deleted successfully!",
    });
  } catch (err) {
    console.error("Error deleting role:", err);
    return NextResponse.json(
      { error: "Failed to delete role." },
      { status: 500 }
    );
  }
}