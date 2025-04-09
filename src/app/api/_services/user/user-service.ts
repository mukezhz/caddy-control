import prisma from "@/lib/prisma";
import { Permission, User } from "@/schemas/user/user.schema";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const username = "admin";
const password = "admin";

export const seedFirstUser = async () => {
  const user = await prisma.user.findFirst({
    select: {
      id: true,
    },
  });
  if (user) return;

  // Create admin role with all permissions
  const adminRole = await prisma.role.create({
    data: {
      name: "Admin",
      description: "Administrator with full access",
    }
  });

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      username,
      hashedPassword,
      forcePasswordChange: true,
      isAdmin: true,
      roleId: adminRole.id
    },
  });
};

export const getUserFromHeader = async (req: NextRequest) => {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        forcePasswordChange: true,
        createdAt: true,
        isAdmin: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: {
              select: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) return null;

    // Transform role permissions data to match the schema
    const transformedUser: User = {
      ...user,
      role: user?.role ? {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        permissions: user.role.permissions.map((rp): Permission => {
          return {
            id: rp.permission.id,
            name: rp.permission.name,
            description: rp.permission.description,
          }
        })
      } : undefined
    };

    return transformedUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

/**
 * Checks if a user has a specific permission
 * @param user The user object returned from getUserFromHeader
 * @param permissionName The permission name to check for
 * @returns boolean indicating if the user has the permission
 */
export const hasPermission = (user: User, permissionName: string): boolean => {
  // Admin users have all permissions
  if (user?.isAdmin) return true;

  // If no role or permissions, deny access
  if (!user?.role?.permissions || user.role.permissions.length === 0) return false;

  // Check if user has the specified permission
  return user.role.permissions.some(
    (permission) => permission.name === permissionName
  );
};
