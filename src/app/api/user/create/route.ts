import { NextRequest, NextResponse } from "next/server";
import { CreateUserSchema } from "@/schemas/user/auth.schema";
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

    // Check if user has permission to create users (requires admin or user_management:manage)
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
    const reqPayload = CreateUserSchema.parse(reqBody);
    const {
      username,
      password,
      isAdmin,
      roleId,
      forcePasswordChange = true,
    } = reqPayload;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 }
      );
    }

    // Check if role exists when roleId is provided
    if (roleId) {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        return NextResponse.json(
          { error: "Selected role not found." },
          { status: 404 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        username,
        hashedPassword,
        isAdmin: isAdmin || false,
        roleId: roleId || null,
        forcePasswordChange,
      },
    });

    // Return success response without sending back the hash
    return NextResponse.json(
      {
        message: "User created successfully!",
        data: {
          id: newUser.id,
          username: newUser.username,
          isAdmin: newUser.isAdmin,
          forcePasswordChange: newUser.forcePasswordChange,
          roleId: newUser.roleId,
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
    console.error("Error creating user:", err);
    return NextResponse.json(
      { error: "Failed to create user." },
      { status: 500 }
    );
  }
}
